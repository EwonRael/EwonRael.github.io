// Shared Firebase sync layer used by both host.js and guest.js.
// The local `players` array (declared in script.js) stays the single
// source of truth for rendering, exactly like before -- everything in
// this file's only job is to fill that array in from Firebase and
// mirror local writes back out to it.

let db = null
let myUid = null
let gameId = null
let rosterRef = null
let statusRef = null
let completedStoriesRef = null
let priorConnRef = null
let presenceUnsub = null
let sessionKey = "drawing-games-captioner-session"

function initSync() {
	db = firebase.database()
	return firebase.auth().signInAnonymously().then(function () {
		return new Promise(function (resolve) {
			let unsub = firebase.auth().onAuthStateChanged(function (user) {
				if (user) {
					myUid = user.uid
					unsub()
					resolve(user.uid)
				}
			})
		})
	})
}

function gameRef(path) {
	return db.ref("games/" + gameId + (path ? "/" + path : ""))
}

function emptyRounds() {
	return {caption1: null, drawing1: null, caption2: null, drawing2: null, caption3: null, drawing3: null, caption4: null, drawing4: null}
}

function saveSession() {
	localStorage.setItem(sessionKey, JSON.stringify({gameId: gameId, isHost: isHost}))
}

function clearSession() {
	localStorage.removeItem(sessionKey)
}

// Creates (or resets) the game node. Only the host does this, at the
// moment they click "Host" -- matches the old behaviour where hosting
// always started a completely fresh game under that name.
function createGame() {
	return gameRef().set({meta: {status: "lobby", totalPlayers: 0}, nextSlot: 1, roster: {}, rounds: {}})
}

// Joins this player into the roster, reusing their existing slot if
// they're rejoining a game they were already in (matched by name), or
// claiming a fresh slot (via transaction, so two guests joining at the
// same moment can't collide) otherwise. Host is always slot 0.
function joinRoster(myName, asHost) {
	rosterRef = gameRef("roster")

	return rosterRef.once("value").then(function (snap) {
		let roster = snap.val() || {}
		for (let key in roster) {
			if (roster[key].name === myName) {
				return Number(key)
			}
		}
		if (asHost) {
			return 0
		}
		// A brand-new name can only claim a slot pre-game -- once playing,
		// "joining" only makes sense as a known player reconnecting, which
		// the name-match above already handles.
		return gameRef("meta/status").once("value").then(function (statusSnap) {
			if (statusSnap.val() !== "lobby") {
				return Promise.reject(new Error("This game has already started, and \"" + myName + "\" isn't in it."))
			}
			return gameRef("nextSlot").transaction(function (current) {
				return (current || 1) + 1
			}).then(function (result) {
				return result.snapshot.val() - 1
			})
		})
	}).then(function (slot) {
		let myRosterRef = rosterRef.child(slot)
		return myRosterRef.update({
			name: myName,
			connected: true,
			lastSeen: firebase.database.ServerValue.TIMESTAMP
		}).then(function () {
			setupPresence(myRosterRef)
			// Round-trip once so `players` is populated (including our own
			// slot) before callers act on it, instead of racing the live
			// listener's first callback.
			return rosterRef.once("value")
		}).then(function (snap) {
			applyRosterSnapshot(snap)
			listenRoster()
			saveSession()
			return slot
		})
	})
}

function setupPresence(myRosterRef) {
	if (presenceUnsub) presenceUnsub()
	let infoRef = db.ref(".info/connected")
	let handler = infoRef.on("value", function (snap) {
		if (snap.val() === true) {
			myRosterRef.onDisconnect().update({connected: false, lastSeen: firebase.database.ServerValue.TIMESTAMP})
			myRosterRef.update({connected: true, lastSeen: firebase.database.ServerValue.TIMESTAMP})
		}
	})
	presenceUnsub = function () {
		infoRef.off("value", handler)
		// Also cancel the pending onDisconnect write itself -- just
		// detaching the listener above stops us reacting to *future*
		// reconnects, but a write already registered with the server
		// would otherwise still fire later and resurrect this roster
		// entry after the game's been cleaned up.
		myRosterRef.onDisconnect().cancel()
	}
}

function applyRosterSnapshot(snap) {
	let roster = snap.val() || {}
	let slots = Object.keys(roster).map(Number).sort(function (a, b) { return a - b })

	let updated = []
	for (let i = 0; i < slots.length; i++) {
		let slot = slots[i]
		let existing = players[slot]
		updated[slot] = [roster[slot].name, (existing && existing[1]) || emptyRounds()]
	}
	players = updated
	renderPlayerList()
}

function listenRoster() {
	rosterRef.on("value", applyRosterSnapshot)
}

function renderPlayerList() {
	let el = document.querySelector("#playerList")
	if (!el) return
	let html = ""
	for (let i = 0; i < players.length; i++) {
		if (players[i]) html = html + players[i][0] + "<br>"
	}
	el.innerHTML = html
}

// Any player (host or guest) can start the game -- matches the old
// permissiveness where a guest's "Let's Play!" also worked. Freezing
// totalPlayers into the same transaction as the status flip means every
// client computes the circular turn order from the same frozen count,
// instead of racing their own local roster listener.
function claimGameStart() {
	return gameRef("roster").once("value").then(function (rosterSnap) {
		let total = Object.keys(rosterSnap.val() || {}).length
		return gameRef("meta").transaction(function (current) {
			if (current && current.status === "lobby") {
				return {status: "playing", totalPlayers: total}
			}
			return current
		})
	})
}

function listenStatus() {
	statusRef = gameRef("meta")
	statusRef.on("value", function (snap) {
		let meta = snap.val()
		if (meta && meta.status === "playing") {
			resumeGame(meta.totalPlayers)
		}
		if (meta && meta.status === "ended") {
			handleGameEnded()
		}
	})
}

function handleGameEnded() {
	teardownSync()
	alert("The host ended this game.")
	location.href = page
	pageChange()
}

// Detaching our own status listener first means the host doesn't get
// their own "ended" write bounced back at them as a kick-out -- they
// already confirmed via the dialog that triggered this.
function endGameForEveryone() {
	if (statusRef) { statusRef.off(); statusRef = null }
	clearSession()
	return gameRef("meta/status").set("ended").then(function () {
		return gameRef().remove()
	}).catch(function (err) {
		console.log("Couldn't end game: " + err)
	})
}

function writeRound(slot, field, content) {
	players[slot][1][field] = content
	return gameRef("rounds/" + slot + "/" + field).set(content)
}

// A suggested caption1 must avoid both what other players currently have
// showing (suggested but not yet submitted) and what's already been
// submitted by anyone (hand-typed included) -- otherwise two players can
// still end up with the exact same final caption1.
function fetchInUseCaptions() {
	return Promise.all([
		gameRef("liveCaptions").once("value"),
		gameRef("rounds").once("value")
	]).then(function (results) {
		let live = results[0].val() || {}
		let rounds = results[1].val() || {}
		let inUse = []
		for (let slot in live) {
			if (Number(slot) !== playerNumber && live[slot]) inUse.push(live[slot])
		}
		for (let slot in rounds) {
			if (Number(slot) !== playerNumber && rounds[slot] && rounds[slot].caption1) inUse.push(rounds[slot].caption1)
		}
		return inUse
	})
}

function writeLiveCaption(slot, content) {
	let ref = gameRef("liveCaptions/" + slot)
	ref.onDisconnect().remove()
	return ref.set(content)
}

function waitForRound(slot, field, onReady) {
	let ref = gameRef("rounds/" + slot + "/" + field)
	let handler = ref.on("value", function (snap) {
		let val = snap.val()
		if (val !== null && val !== undefined) {
			ref.off("value", handler)
			players[slot][1][field] = val
			onReady(val)
		}
	})
}

// Shows the waiting screen for `slot` finishing `field`, and resolves
// automatically the moment that data shows up in Firebase (even if it
// was already there before we started watching).
function beginWaiting(slot, verb, field, onReady) {
	document.querySelector("#waitingNote").innerHTML = "Waiting for " + players[slot][0] + " to finish " + verb + "..."
	document.querySelector("#waiting").style.display = "inherit"
	watchWaitingPartner(slot, verb)
	waitForRound(slot, field, function (content) {
		stopWatchingPartner()
		document.querySelector("#waiting").style.display = "none"
		onReady(content)
	})
}

// Swaps the waiting message over to "waiting for X to reconnect" while
// the player being waited on is disconnected, and back once they're
// not.
function watchWaitingPartner(slot, verb) {
	stopWatchingPartner()
	priorConnRef = gameRef("roster/" + slot + "/connected")
	priorConnRef.on("value", function (snap) {
		let note = document.querySelector("#waitingNote")
		if (!note) return
		note.innerHTML = snap.val() === false
			? "Waiting for " + players[slot][0] + " to reconnect..."
			: "Waiting for " + players[slot][0] + " to finish " + verb + "..."
	})
}

function stopWatchingPartner() {
	if (priorConnRef) { priorConnRef.off(); priorConnRef = null }
}

// Figures out the first step this player hasn't completed yet. Used
// both right after the game starts (everything is empty -> caption1)
// and when reconnecting mid-game (resumes exactly where they left off).
function findResumePoint(slot) {
	let data = players[slot][1]
	let order = [
		["caption1", null], ["drawing1", "caption1"],
		["caption2", "drawing1"], ["drawing2", "caption2"],
		["caption3", "drawing2"], ["drawing3", "caption3"],
		["caption4", "drawing3"], ["drawing4", "caption4"]
	]
	for (let i = 0; i < order.length; i++) {
		if (data[order[i][0]] == null) {
			return order[i][0]
		}
	}
	return "gallery"
}

// A fresh page load only ever has roster data (names) locally -- the
// actual caption/drawing content lives in Firebase and has to be
// pulled in before we can tell where this player really left off.
// Without this, a reload always looks like "nothing done yet".
function resumeGame(total) {
	return gameRef("rounds").once("value").then(function (snap) {
		mergeRoundsSnapshot(snap)
		return continueResumeGame(total)
	})
}

function mergeRoundsSnapshot(snap) {
	let rounds = snap.val() || {}
	for (let slot in rounds) {
		if (players[slot]) players[slot][1] = Object.assign({}, players[slot][1], rounds[slot])
	}
}

function continueResumeGame(total) {
	playerPrior = (playerNumber - 1 + total) % total
	let place = findResumePoint(playerNumber)

	if (place === "gallery") {
		location.href = page + "#gallery"
		pageChange()
		return
	}

	let num = Number(place.slice(-1))

	if (place.indexOf("drawing") === 0) {
		let captionField = "caption" + num
		let target = document.querySelector("#drawing" + num + "C")
		if (players[playerPrior][1][captionField] != null) {
			target.innerHTML = players[playerPrior][1][captionField]
		} else {
			beginWaiting(playerPrior, "captioning", captionField, function (content) {
				target.innerHTML = content
			})
		}
	}

	if (place.indexOf("caption") === 0 && num > 1) {
		let drawField = "drawing" + (num - 1)
		if (players[playerPrior][1][drawField] != null) {
			drawing = players[playerPrior][1][drawField]
			loadDrawing("load")
		} else {
			beginWaiting(playerPrior, "drawing", drawField, function (content) {
				drawing = content
				loadDrawing("load")
			})
		}
	}

	location.href = page + "#" + place
	pageChange()
}

// Reconstructs the single woven story that ends in `anchorSlot`'s own
// drawing4 -- the same "exquisite corpse" chain loadGallery() used to
// walk live, on demand, except this returns plain data (in display
// order) instead of touching the DOM. Every field this needs is
// guaranteed to already be in Firebase by the time anchorSlot's own
// drawing4 exists: each step in the chain was a prerequisite for
// writing the next one, all the way back to caption1.
function weaveStory(anchorSlot, totalPlayers, roundsBySlot) {
	let current = anchorSlot
	function prior() {
		current = (current === 0) ? (totalPlayers - 1) : (current - 1)
	}
	let panels = []
	for (let j = 1; j < 5; j++) {
		let drawing = roundsBySlot[current] && roundsBySlot[current]["drawing" + (5 - j)]
		prior()
		let caption = roundsBySlot[current] && roundsBySlot[current]["caption" + (5 - j)]
		prior()
		panels.push({drawing: drawing, caption: caption})
	}
	return panels
}

// Called once by the anchor player's own client, right after their
// drawing4 write completes. Assembles their story into one
// self-contained object and publishes it -- from this point on nobody
// needs the raw rounds tree to see this particular story, only this.
function broadcastCompletedStory(anchorSlot) {
	let storyRef = gameRef("completedStories/" + anchorSlot)
	return storyRef.once("value").then(function (existing) {
		if (existing.exists()) return
		return gameRef("rounds").once("value").then(function (roundsSnap) {
			let panels = weaveStory(anchorSlot, players.length, roundsSnap.val() || {})
			return storyRef.set({panels: panels})
		})
	})
}

function liveGameKey(id) {
	return "drawing-games-captioner-live-" + id
}

// The local copy is the source of truth from here on -- it only ever
// grows (deduped by anchor slot) and is what both the live #gallery
// screen and, later, thanks.html#pastGames read from. Never a live
// Firebase read.
function saveStoryLocally(id, anchorSlot, story) {
	let key = liveGameKey(id)
	let saved = JSON.parse(localStorage.getItem(key)) || {date: getDate(), stories: {}}
	if (saved.stories[anchorSlot]) return
	saved.stories[anchorSlot] = story
	localStorage.setItem(key, JSON.stringify(saved))
	if (typeof onStoryReceived === "function") onStoryReceived(anchorSlot, story)
}

// Live for the whole session (started right after joining, not just
// once this client reaches #gallery) so a slower player keeps picking
// up faster players' finished stories in the background as they
// arrive, rather than only catching up once they get there themselves.
function listenCompletedStories() {
	completedStoriesRef = gameRef("completedStories")
	completedStoriesRef.on("child_added", function (snap) {
		saveStoryLocally(gameId, Number(snap.key), snap.val())
	})
}

function stopCompletedStories() {
	if (completedStoriesRef) { completedStoriesRef.off(); completedStoriesRef = null }
}

function teardownSync() {
	if (rosterRef) { rosterRef.off(); rosterRef = null }
	if (statusRef) { statusRef.off(); statusRef = null }
	if (presenceUnsub) { presenceUnsub(); presenceUnsub = null }
	stopCompletedStories()
	stopWatchingPartner()
	clearSession()
}

// Called once on page load. If we were in a game (lobby or mid-play)
// when the tab closed or reloaded, silently rejoin and pick up right
// where we left off -- no need to remember or retype the host's name,
// since it comes from the saved session, not from anything typed.
function attemptAutoRejoin() {
	let saved = localStorage.getItem(sessionKey)
	if (!saved || location.href.split('#')[1]) return

	let session = JSON.parse(saved)
	gameId = session.gameId
	hostID = session.gameId
	isHost = session.isHost

	initSync().then(function () {
		return gameRef("meta").once("value")
	}).then(function (snap) {
		let meta = snap.val()
		if (!meta) {
			clearSession()
			return
		}
		return joinRoster(name, isHost).then(function (slot) {
			playerNumber = slot
			listenCompletedStories()
			if (meta.status === "playing") {
				return resumeGame(meta.totalPlayers)
			}
			location.href = page + "#lobby"
			pageChange()
			listenStatus()
		})
	}).catch(function (err) {
		console.log("Couldn't auto-rejoin: " + err)
		clearSession()
	})
}
