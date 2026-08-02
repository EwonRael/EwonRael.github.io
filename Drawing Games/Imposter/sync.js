// Shared Firebase sync layer used by both host.js and guest.js.
// The local `players` array (declared in script.js) stays the single
// source of truth for rendering, exactly like before -- everything in
// this file's only job is to fill that array in from Firebase and
// mirror local writes back out to it.
//
// This is Imposter's own copy of Captioner's sync.js, pointed at a
// separate "imposterGames/" root so the two games never collide when
// someone hosts both under the same name at once.

let db = null
let myUid = null
let gameId = null
let rosterRef = null
let statusRef = null
let allRoundRef = null
let roundGalleryRef = null
let finalRef = null
let presenceUnsub = null
let markedSynced = false
let sessionKey = "drawing-games-imposter-session"

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
	return db.ref("imposterGames/" + gameId + (path ? "/" + path : ""))
}

function emptyRounds() {
	return {
		drawing1: null, vote1: null, ack1: null,
		drawing2: null, vote2: null, ack2: null,
		drawing3: null, vote3: null, ack3: null,
		drawing4: null, vote4: null, ack4: null
	}
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
	return gameRef().set({meta: {status: "lobby", totalPlayers: 0, round: 1}, nextSlot: 1, roster: {}, rounds: {}})
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

// Once every player's own client has confirmed (via updateFinalResults)
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
// permissiveness where a guest's "Let's Play!" also worked. This also
// decides and freezes the whole game's 4-round plan (who's the imposter
// and which prompt pair each round uses) in the same transaction that
// flips status to "playing", so every client ends up reading the exact
// same plan instead of each computing their own random answer.
function claimGameStart() {
	return gameRef("roster").once("value").then(function (rosterSnap) {
		let total = Object.keys(rosterSnap.val() || {}).length
		let plan = buildRoundsPlan(total)
		return gameRef("meta").transaction(function (current) {
			if (current && current.status === "lobby") {
				return {status: "playing", totalPlayers: total, rounds: plan, round: 1}
			}
			return current
		})
	})
}

// Whoever clicks "Continue" first drags every other player's client along
// with them, so everyone's next-round draw timer starts at the same
// moment instead of each player pacing their own transition. The write is
// idempotent -- the target value is always "the round that just finished,
// plus one", the same regardless of who writes it -- so unlike
// claimGameStart this doesn't need a transaction to guard against two
// people clicking at once.
function advanceSharedRound(round) {
	return gameRef("meta/round").set(round + 1)
}

let lastSeenRound = null

function listenStatus() {
	statusRef = gameRef("meta")
	statusRef.on("value", function (snap) {
		let meta = snap.val()
		if (meta && meta.status === "playing") {
			roundsPlan = meta.rounds
			let round = meta.round || 1
			// The very first time this listener sees "playing" (right after
			// joining or reloading), fall back to each player's own
			// completion-based resume point -- that's the only thing that
			// can correctly place a client who just connected. Every
			// subsequent tick means someone's Continue click moved the
			// shared round forward, and every listening client (including
			// whoever clicked) should jump there together.
			if (lastSeenRound === null) {
				lastSeenRound = round
				resumeGame(meta.totalPlayers, round)
			} else if (round > lastSeenRound) {
				lastSeenRound = round
				if (round > 4) {
					location.href = page + "#finalResults"
					pageChange()
				} else {
					location.href = page + "#draw" + round
					pageChange()
				}
			}
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

function mergeRoundsSnapshot(snap) {
	let rounds = snap.val() || {}
	for (let slot in rounds) {
		if (players[slot]) players[slot][1] = Object.assign({}, players[slot][1], rounds[slot])
	}
}

// Nobody is "the next specific player" in Imposter (unlike Captioner's
// relay chain) -- every wait is "has everyone finished this step yet",
// so this watches every player's copy of one field at once instead of
// a single slot.
function watchAllRoundField(field, onAllDone) {
	allRoundRef = gameRef("rounds")
	let done = false
	allRoundRef.on("value", function (snap) {
		mergeRoundsSnapshot(snap)
		let allDone = players.length > 0 && players.every(function (p) {
			return p && p[1] && p[1][field] != null
		})
		// Firebase can fire "value" twice in quick succession for the same
		// write (once from local cache, once from the server ack) -- the
		// `done` guard makes sure onAllDone (showReveal, for the voting
		// case) only ever actually runs once, since a second concurrent run
		// would duplicate anything it builds up incrementally, like the
		// correct-guessers list.
		if (allDone && !done) {
			done = true
			stopWatchingAllRoundField()
			onAllDone()
		}
	})
}

function stopWatchingAllRoundField() {
	if (allRoundRef) { allRoundRef.off(); allRoundRef = null }
	votingWatchRound = null
}

let waitingPartnersHandler = null

// Swaps the waiting message over to naming whichever still-incomplete
// player(s) are currently disconnected, so someone stuck on this screen
// can tell a dropped player -- not just a slow one -- is why, same idea as
// Captioner's watchWaitingPartner. Adapted for Imposter's "wait for
// everyone" model (there's no single "the next player" here the way
// Captioner's relay chain has one) -- this re-checks roster connectivity
// against whichever slots still haven't filled in `field` every time the
// roster changes, rather than watching one fixed slot.
//
// Registers on the already-listened-to `rosterRef` (rather than a fresh
// gameRef("roster")) and detaches by exact callback reference, not a bare
// .off() -- Firebase tracks listeners by path, so an unqualified .off()
// on that path would also tear down applyRosterSnapshot's listener
// (listenRoster), which has to stay alive for the whole game.
function watchWaitingPartners(verb, field) {
	stopWatchingWaitingPartners()
	waitingPartnersHandler = function (snap) {
		let roster = snap.val() || {}
		let note = document.querySelector("#waitingNote")
		if (!note) return
		let disconnectedNames = []
		for (let slot in roster) {
			let p = players[slot]
			if (p && p[1][field] == null && roster[slot].connected === false) {
				disconnectedNames.push(roster[slot].name)
			}
		}
		note.innerHTML = disconnectedNames.length > 0
			? "Waiting for " + disconnectedNames.join(", ") + " to reconnect..."
			: "Waiting for everyone to finish " + verb + "..."
	}
	rosterRef.on("value", waitingPartnersHandler)
}

function stopWatchingWaitingPartners() {
	if (waitingPartnersHandler) {
		rosterRef.off("value", waitingPartnersHandler)
		waitingPartnersHandler = null
	}
}

function beginWaitingForAll(verb, field, onReady) {
	document.querySelector("#waitingNote").innerHTML = "Waiting for everyone to finish " + verb + "..."
	document.querySelector("#waiting").style.display = "inherit"
	watchWaitingPartners(verb, field)
	watchAllRoundField(field, function () {
		stopWatchingWaitingPartners()
		document.querySelector("#waiting").style.display = "none"
		onReady()
	})
}

// Figures out the first thing this player hasn't done yet, round by
// round. The `ack` field exists purely so a reload that happens after
// everyone has voted but before this player has clicked "Continue" past
// the reveal screen resumes back on that reveal screen -- without it,
// resuming would only be able to see "vote4 is filled in" and would
// have no way to tell "still looking at the reveal" apart from "already
// moved on", and would wrongly fast-forward into the next round.
function findResumePoint(slot) {
	for (let r = 1; r <= 4; r++) {
		let d = "drawing" + r, v = "vote" + r, a = "ack" + r
		if (players[slot][1][d] == null) return {round: r, stage: "draw"}
		if (!players.every(function (p) { return p && p[1][d] != null })) return {round: r, stage: "waitDraw"}
		if (players[slot][1][v] == null) return {round: r, stage: "gallery"}
		if (!players.every(function (p) { return p && p[1][v] != null })) return {round: r, stage: "waitVote"}
		if (players[slot][1][a] == null) return {round: r, stage: "reveal"}
	}
	return {stage: "final"}
}

// A fresh page load only ever has roster data (names) locally -- the
// actual per-round data lives in Firebase and has to be pulled in
// before we can tell where this player really left off.
function resumeGame(total, sharedRound) {
	return gameRef("rounds").once("value").then(function (snap) {
		mergeRoundsSnapshot(snap)
		return continueResumeGame(total, sharedRound)
	})
}

function continueResumeGame(total, sharedRound) {
	let resume = findResumePoint(playerNumber)

	if (resume.stage === "final") {
		location.href = page + "#finalResults"
		pageChange()
		return
	}

	// If the shared round pointer is already ahead of this player's own
	// ack chain, they missed one or more "someone else clicked Continue"
	// broadcasts while disconnected (watchAllRoundField's all-votes-in
	// requirement means this can only happen while they're on their own
	// "reveal" stage, never earlier -- the round literally can't have
	// advanced without their own drawing and vote already being in).
	// Backfill their own ack for the skipped rounds, so a future resume
	// keeps computing correctly, and land them on the shared round instead
	// of a reveal everyone else has already moved past.
	if (sharedRound && resume.round && sharedRound > resume.round) {
		for (let r = resume.round; r < sharedRound; r++) {
			if (players[playerNumber][1]["ack" + r] == null) writeRound(playerNumber, "ack" + r, true)
		}
		if (sharedRound > 4) {
			location.href = page + "#finalResults"
			pageChange()
		} else {
			location.href = page + "#draw" + sharedRound
			pageChange()
		}
		return
	}

	let round = resume.round

	if (resume.stage === "draw") {
		location.href = page + "#draw" + round
		pageChange()
	}
	else if (resume.stage === "waitDraw") {
		location.href = page + "#draw" + round
		pageChange()
		beginWaitingForAll("drawing", "drawing" + round, function () {
			location.href = page + "#gallery" + round
			pageChange()
		})
	}
	else if (resume.stage === "gallery" || resume.stage === "waitVote") {
		location.href = page + "#gallery" + round
		pageChange()
	}
	else if (resume.stage === "reveal") {
		showReveal(round)
	}
}

// Builds one round's gallery tiles (one per player who's submitted a
// drawing" + round" so far) into that round's own gallery box, wired to
// select that player as this player's imposter guess directly on click.
// Highlighting the current player's own pick is recomputed from `players`
// data on every call (rather than tracked as separate DOM state) since this
// function fully rebuilds the gallery's innerHTML each time it's called,
// including on every tick of the live listener as stragglers' drawings
// pop in -- a manually-added class would otherwise get wiped out.
function renderRoundGallery(round) {
	let galleryBox = document.querySelector("#galleryBox" + round)
	if (!galleryBox) return
	galleryBox.innerHTML = ""
	let myVote = players[playerNumber] && players[playerNumber][1]["vote" + round]
	for (let i = 0; i < players.length; i++) {
		if (players[i] && players[i][1]["drawing" + round]) {
			let drw = players[i][1]["drawing" + round]
			let gallery = document.createElement("div")
			gallery.setAttribute("class", "gallery" + (myVote === i ? " selected" : ""))
			gallery.setAttribute("onclick", "selectVote(" + i + ", " + round + ")")
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
}

// Like listenRoundGalleryLive, stays active for the whole time the player
// is on a round's gallery screen, not a one-shot wait -- unlike drawing's
// wait-for-all, voting doesn't block the UI, so a player can keep
// re-picking until the last straggler votes, at which point this fires the
// reveal automatically. Uses watchAllRoundField directly (not
// beginWaitingForAll) specifically to skip its blocking #waiting overlay.
let votingWatchRound = null

// Guarded against being started twice for the same round: pageChange()
// actually runs on every hash navigation via two separate paths (an
// explicit call right after `location.href = ...`, plus the async
// "hashchange" event that same assignment triggers), so without this
// guard a single visit to #galleryN would attach two independent
// watchAllRoundField listeners -- each with its own private "done" flag,
// each eventually firing showReveal() once, producing two concurrent
// reveal animations that both append to the same correct-guessers list.
function watchVotingProgress(round) {
	if (votingWatchRound === round) return
	votingWatchRound = round
	watchAllRoundField("vote" + round, function () {
		votingWatchRound = null
		showReveal(round)
	})
}

// While on a round's gallery screen, keep it live so thumbnails pop in
// as stragglers finish their drawing.
function listenRoundGalleryLive(round) {
	roundGalleryRef = gameRef("rounds")
	roundGalleryRef.on("value", function (snap) {
		mergeRoundsSnapshot(snap)
		renderRoundGallery(round)
	})
}

function stopRoundGalleryLive() {
	if (roundGalleryRef) { roundGalleryRef.off(); roundGalleryRef = null }
}

// The Finished button only unlocks once every player has acknowledged
// round 4's reveal, so nobody saves an incomplete scoreboard to their
// local history (or leaves before everyone's seen the result). The
// first client to see that is provably holding the complete game, so
// it's safe to tell the other players this client is done downloading.
function updateFinalResults() {
	let allDone = players.length > 0 && players.every(function (p) {
		return p && p[1] && p[1].ack4 != null
	})
	let btn = document.querySelector("#finishButton")
	if (btn) btn.disabled = !allDone

	if (allDone && !markedSynced && playerNumber != null) {
		markedSynced = true
		stopFinalLive()
		if (presenceUnsub) { presenceUnsub(); presenceUnsub = null }
		gameRef("roster/" + playerNumber + "/synced").set(true).catch(function (err) {
			console.log("Couldn't mark synced: " + err)
		})
	}
}

// Keeps the final scoreboard live so stragglers' scores pop in as they
// finish up, same idea as listenRoundGalleryLive.
function listenFinalLive() {
	finalRef = gameRef("rounds")
	finalRef.on("value", function (snap) {
		mergeRoundsSnapshot(snap)
		renderFinalResults()
		updateFinalResults()
	})
}

function stopFinalLive() {
	if (finalRef) { finalRef.off(); finalRef = null }
}

function teardownSync() {
	stopWatchingWaitingPartners()
	if (rosterRef) { rosterRef.off(); rosterRef = null }
	if (statusRef) { statusRef.off(); statusRef = null }
	if (presenceUnsub) { presenceUnsub(); presenceUnsub = null }
	stopWatchingAllRoundField()
	stopRoundGalleryLive()
	stopFinalLive()
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
			if (meta.status !== "playing") {
				location.href = page + "#lobby"
				pageChange()
			}
			// listenStatus's own first tick handles the actual resume (via
			// resumeGame) when already "playing" -- calling it uniformly
			// here (rather than resuming directly and skipping the
			// listener) is what keeps this client subscribed afterward for
			// both the host-ended-game alert and later shared round
			// advances, the same as the fresh host/join paths already do.
			listenStatus()
		})
	}).catch(function (err) {
		console.log("Couldn't auto-rejoin: " + err)
		clearSession()
	})
}
