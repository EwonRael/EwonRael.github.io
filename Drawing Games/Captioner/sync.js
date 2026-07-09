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
let galleryRef = null
let priorConnRef = null
let presenceUnsub = null
let markedSynced = false
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
	markedSynced = false

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

	if (slots.length === 0 && players.length > 0) {
		// An empty roster after we already had players almost certainly
		// means the whole game node just got cleaned up (see
		// maybeCleanupIfAllSynced), not that everyone actually left --
		// keep the local copy intact instead of wiping it out.
		return
	}

	let updated = []
	for (let i = 0; i < slots.length; i++) {
		let slot = slots[i]
		let existing = players[slot]
		updated[slot] = [roster[slot].name, (existing && existing[1]) || emptyRounds()]
	}
	players = updated
	renderPlayerList()
	maybeCleanupIfAllSynced(roster)
}

// Once every player's own client has confirmed (via updateFinishButton)
// that it holds a complete local copy of the finished game, nobody
// still needs the shared copy -- safe to delete it. This runs on every
// roster change and is a no-op until every slot has synced, so it's
// harmless to check unconditionally (including during the lobby, before
// anyone has a "synced" flag at all). remove() on an already-gone node
// is a no-op too, so it doesn't matter whose check fires it.
function maybeCleanupIfAllSynced(roster) {
	let keys = Object.keys(roster)
	let allSynced = keys.length > 0 && keys.every(function (key) { return roster[key].synced === true })
	if (allSynced) {
		gameRef().remove().catch(function (err) { console.log("Cleanup failed: " + err) })
	}
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

function renderGalleryBox() {
	let galleryBox = document.querySelector("#galleryBox")
	if (!galleryBox) return
	galleryBox.innerHTML = ""
	for (let i = 0; i < players.length; i++) {
		if (players[i] && players[i][1].drawing4) {
			let drw = players[i][1].drawing4
			let gallery = document.createElement("div")
			gallery.setAttribute("class", "gallery")
			gallery.setAttribute("onclick", "loadGallery(" + i + ")")
			let pic = document.createElementNS("http://www.w3.org/2000/svg", "svg")
			pic.setAttribute("viewBox", "0 0 100 53")
			for (let j = 0; j < drw.length; j++) {
				let path = document.createElementNS("http://www.w3.org/2000/svg", "path")
				path.setAttributeNS(null, 'd', "M " + drw[j][0] + "," + drw[j][1] + " " + drw[j][2] + "," + drw[j][3])
				pic.appendChild(path)
			}
			gallery.appendChild(pic)
			galleryBox.appendChild(gallery)
		}
	}
	updateFinishButton()
}

// The Finished button only unlocks once every player's last drawing has
// come in, so nobody saves an incomplete gallery to their local history
// (or leaves before there's anything left to see). The first time this
// client sees that, its copy of `players` is provably the complete
// game (the rounds fetch that satisfies this check pulls the whole tree
// in one shot) -- so there's nothing left to watch for, and it's safe
// to tell the other players this client is done downloading.
function updateFinishButton() {
	let btn = document.querySelector("#finishButton")
	let allDone = players.length > 0 && players.every(function (p) {
		return p && p[1] && p[1].drawing4 != null
	})
	if (btn) btn.disabled = !allDone

	if (allDone && !markedSynced && playerNumber != null) {
		markedSynced = true
		stopGalleryLive()
		if (presenceUnsub) { presenceUnsub(); presenceUnsub = null }
		gameRef("roster/" + playerNumber + "/synced").set(true).catch(function (err) {
			console.log("Couldn't mark synced: " + err)
		})
	}
}

// While on the gallery screen, keep it live so thumbnails pop in as
// stragglers finish their last drawing -- same effect the old
// broadcast-on-every-drawing4 gave, but as a single subscription
// instead of the host re-pushing full state to everyone.
function listenGalleryLive() {
	galleryRef = gameRef("rounds")
	galleryRef.on("value", function (snap) {
		mergeRoundsSnapshot(snap)
		renderGalleryBox()
	})
}

function stopGalleryLive() {
	if (galleryRef) { galleryRef.off(); galleryRef = null }
}

function teardownSync() {
	if (rosterRef) { rosterRef.off(); rosterRef = null }
	if (statusRef) { statusRef.off(); statusRef = null }
	if (presenceUnsub) { presenceUnsub(); presenceUnsub = null }
	stopGalleryLive()
	stopWatchingPartner()
	markedSynced = false
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
