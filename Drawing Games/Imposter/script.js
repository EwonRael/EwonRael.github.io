let name = localStorage.getItem("drawing-games-name")
let hostName = null
let hostID = null
let players = []
let isHost = false
let playerNumber = 0
let roundsPlan = []
let page = location.href.split('#')[0]
let drawMousedown = false
let posX = 0
let posXold = 0
let posYold = 0
let drawing = []
let drawTimerTimeout = null

if (name) {console.log("my name is " + name)} else {location.href = "../index.html"}
if (name) {attemptAutoRejoin()}

function joinButton() {
	location.href = page + "#hostName"
	pageChange()
	initializeGuest()
}

function hostNameInputType(event) {
    if (event.key == "Enter") {
        hostNameSet()
    }
    if (document.querySelector("#hostNameInput").value.length > 0) {
    	document.querySelector("#hostNameInputButton").disabled = false
    }
    else {
    	document.querySelector("#hostNameInputButton").disabled = true
    }
}

function hostNameSet() {
	location.href = page + "#lobby"
	pageChange()
	hostName = document.querySelector("#hostNameInput").value
	hostID = hostName.toLowerCase().replace(/\s/g, '')
	joinHost()
}

function hostButton() {
	location.href = page + "#lobby"
	pageChange()
	initializeHost()
}

function startGamePlz() {
	claimGameStart()
}

// The "GO HOME" link is a normal exit for everyone except the host of
// an active game, where leaving quietly would strand the other players
// mid-game forever (nothing else ends a game early). Confirmed, it ends
// the game for everyone and deletes it before navigating away.
function handleGoHome() {
	if (isHost && gameId) {
		if (!confirm("This will end the game for everyone and delete it. Are you sure?")) {
			return false
		}
		endGameForEveryone().then(function () {
			location.href = ".."
		})
		return false
	}
	return true
}

function pageChange() {
	let hide = document.querySelectorAll(".hide")
	let show = location.href.split('#')[1]

	for (let i = 0; i < hide.length; i++) {
		let hidden = hide[i]
		hidden.classList.add("hidden")
	}

	if (location.href == page) {
		document.querySelector("#joinOrHost").classList.remove("hidden")
		teardownSync()
	}

	else {
		document.querySelector("#" + show).classList.remove("hidden")
		if (show.indexOf("draw") === 0) {
			document.querySelector("#drawSpace").classList.remove("hidden")
			renderPrompt(Number(show.slice(-1)))
			startDrawTimer(Number(show.slice(-1)))
		}
		else {
			document.querySelector("#drawSpace").classList.add("hidden")
			stopDrawTimer()
		}
		if (show.indexOf("gallery") === 0) {
			listenRoundGalleryLive(Number(show.slice(-1)))
			watchVotingProgress(Number(show.slice(-1)))
		}
		else {
			stopRoundGalleryLive()
			stopWatchingAllRoundField()
		}
		if (show === "finalResults") {
			listenFinalLive()
		}
		else {
			stopFinalLive()
		}
	}
}

window.addEventListener("hashchange", function () {pageChange()})

function eraceSVG() {
	const removeChilds = (parent) => {
		while (parent.lastChild) {
			parent.removeChild(parent.lastChild);
		}
	}
	removeChilds(document.querySelector("#drawSVG"))
	drawing = []
	toggleDrawButtons(false)
}

onmousemove = function(e){
	posX = (e.clientX * 100) / window.innerWidth
	if (!!window.chrome) {
		posX = ((e.clientX + 17) * 100) / window.innerWidth
	}
	let posY = ((e.clientY - 116 + window.pageYOffset) * 100) / window.innerWidth - 13.6
	if (drawMousedown) {
		let path = document.createElementNS("http://www.w3.org/2000/svg", "path")
		path.setAttributeNS(null, 'd', "M " + posX + "," + posY + " " + posXold + "," + posYold);
		document.querySelector("#drawSVG").appendChild(path)
		drawing.push([posX,posY,posXold,posYold])
		toggleDrawButtons(true)
	}
	posXold = posX
	posYold = posY
}

onmouseup = function() {
	if (posXold == posX && drawMousedown == true) {
		let path = document.createElementNS("http://www.w3.org/2000/svg", "path")
		path.setAttributeNS(null, 'd', "M " + posXold + "," + posYold + " " + posXold + "," + posYold)
		document.querySelector("#drawSVG").appendChild(path)
		drawing.push([posXold,posYold,posXold,posYold])
	}
	drawMousedown = false
}

function endTouch() {
	drawMousedown = false
	posXold = null
	posYold = null
}

window.addEventListener("DOMContentLoaded", function() {
	let drawSpace = document.querySelector("#drawSVG")
	drawSpace.addEventListener("touchmove", handleMove)
	window.addEventListener("touchend", endTouch)
})

function handleMove(evt) {
	evt.preventDefault()
	posX = (evt.changedTouches[0].clientX * 100) / window.innerWidth
	let posY = ((evt.changedTouches[0].clientY - 116 + window.pageYOffset) * 100) / window.innerWidth - 13.6
	if (drawMousedown) {
		let path = document.createElementNS("http://www.w3.org/2000/svg", "path")
		path.setAttributeNS(null, 'd', "M " + posX + "," + posY + " " + posXold + "," + posYold);
		document.querySelector("#drawSVG").appendChild(path)
		drawing.push([posX,posY,posXold,posYold])
		toggleDrawButtons(true)
	}
	posXold = posX
	posYold = posY
	drawMousedown = true
}

function shuffleArray(arr) {
	let a = arr.slice()
	for (let i = a.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1))
		let tmp = a[i]
		a[i] = a[j]
		a[j] = tmp
	}
	return a
}

// Mousemove fires far more often than a drawing visibly changes, so a
// slow careful drawing can pile up thousands of near-duplicate tiny
// segments. This collapses runs of them into one right before the
// result gets saved/sent -- purely a data-size cut, the live canvas
// while actually drawing is untouched.
//
// `drawing` is actually several separate strokes concatenated together
// (every pen-up/pen-down creates a new one, with no explicit marker
// between them) -- within one continuous stroke, each segment's start
// point exactly equals the previous segment's end point (same variable
// copied forward event to event), so a mismatch there is how a stroke
// boundary is detected. Tracking resets from that segment's own true
// start whenever this happens, so a gap between two strokes never gets
// bridged with a connecting line.
function simplifyDrawing(segments) {
	if (segments.length <= 1) return segments
	let minDist = 0.35
	let simplified = []
	let lastKept = [segments[0][2], segments[0][3]]

	for (let i = 0; i < segments.length; i++) {
		let seg = segments[i]
		let prev = i > 0 ? segments[i - 1] : null
		let newStroke = prev !== null && (seg[2] !== prev[0] || seg[3] !== prev[1])
		if (newStroke) lastKept = [seg[2], seg[3]]

		let dx = seg[0] - lastKept[0]
		let dy = seg[1] - lastKept[1]
		let isLast = i === segments.length - 1
		let nextIsNewStroke = !isLast && (segments[i + 1][2] !== seg[0] || segments[i + 1][3] !== seg[1])

		if (newStroke || isLast || nextIsNewStroke || Math.sqrt(dx * dx + dy * dy) >= minDist) {
			simplified.push([seg[0], seg[1], lastKept[0], lastKept[1]])
			lastKept = [seg[0], seg[1]]
		}
	}
	return simplified
}

// Builds this game's 4-round plan: which slot is the imposter and which
// prompt pair is used, one round at a time. Called once, by whoever's
// transaction wins claimGameStart(), and frozen into meta.rounds so
// every client reads the same answer instead of computing their own.
function buildRoundsPlan(total) {
	let pairs = pickPromptPairs(4)
	let rounds = []
	for (let i = 0; i < 4; i++) {
		// Which side of the pair is "real" vs "fake" is arbitrary --
		// randomize it per round instead of trusting authored order.
		let pair = shuffleArray(pairs[i])
		rounds.push({
			imposter: Math.floor(Math.random() * total),
			realPrompt: pair[0],
			fakePrompt: pair[1]
		})
	}
	return rounds
}

// Same shuffle-and-recycle idea as Captioner's caption suggestions, but
// draws a fixed batch of `n` pairs up front instead of one at a time.
// Works fine even when suggestedPrompts only has one dummy entry -- it
// just repeats that pair across rounds until real content is added.
function pickPromptPairs(n) {
	let pool = []
	while (pool.length < n) pool = pool.concat(shuffleArray(suggestedPrompts))
	return pool.slice(0, n)
}

// Shows this player their prompt for the round -- the real prompt for
// everyone except whichever slot this round's plan names as the
// imposter, who sees the fake one instead.
function renderPrompt(round) {
	let plan = roundsPlan[round - 1]
	let isImposter = plan.imposter === playerNumber
	document.querySelector("#draw" + round + "Prompt").innerHTML = isImposter ? plan.fakePrompt : plan.realPrompt
}

// Starts a fresh client-local 20s countdown the moment this player's draw
// screen renders, auto-submitting via the same drawSubmit() path as the
// "Next" button once it runs out. Guarded against players[playerNumber]
// already having a value for this round's drawing -- true when pageChange()
// re-enters this #drawN hash during resumeGame's "waitDraw" stage (this
// player already submitted and is just watching stragglers behind the
// #waiting overlay) -- without this guard a stale timer would fire
// drawSubmit() again with an already-erased/empty `drawing` array and
// clobber the real submission already on Firebase.
function startDrawTimer(round) {
	stopDrawTimer()
	if (players[playerNumber] && players[playerNumber][1]["drawing" + round] != null) return
	let bar = document.querySelector("#drawTimerBar")
	bar.classList.remove("hidden")
	bar.style.transition = "none"
	bar.style.width = "0"
	bar.offsetWidth // force reflow so the width:0 above commits before animating
	bar.style.transition = "width 20s linear"
	bar.style.width = "100vw"
	drawTimerTimeout = setTimeout(function () { drawSubmit(round) }, 20000)
}

function stopDrawTimer() {
	if (drawTimerTimeout) { clearTimeout(drawTimerTimeout); drawTimerTimeout = null }
	let bar = document.querySelector("#drawTimerBar")
	if (bar) {
		bar.classList.add("hidden")
		bar.style.transition = "none"
		bar.style.width = "0"
	}
}

function drawSubmit(round) {
	stopDrawTimer()
	let content = simplifyDrawing(drawing)
	writeRound(playerNumber, "drawing" + round, content)
	eraceSVG()
	beginWaitingForAll("drawing", "drawing" + round, function () {
		location.href = page + "#gallery" + round
		pageChange()
	})
}

// Selecting a drawing writes this player's vote immediately and moves the
// highlight to it -- no confirmation step, and no self-vote restriction
// (a player has no reliable way to know they were the imposter until the
// reveal anyway). Re-rendering right away gives instant feedback instead of
// waiting on a network round trip; the live gallery listener will harmlessly
// re-render the same state again once Firebase echoes the write back. The
// reveal itself is triggered separately, by watchVotingProgress once every
// player has picked -- voting stays open and changeable until then.
function selectVote(votedSlot, round) {
	writeRound(playerNumber, "vote" + round, votedSlot)
	renderRoundGallery(round)
}

function computeRoundReveal(round) {
	let plan = roundsPlan[round - 1]
	let imposterSlot = plan.imposter
	let correctVoters = []
	for (let i = 0; i < players.length; i++) {
		if (players[i] && players[i][1]["vote" + round] === imposterSlot) correctVoters.push(i)
	}
	return {imposterSlot: imposterSlot, correctVoters: correctVoters}
}

// Scores are never written to Firebase -- they're fully derivable
// client-side from roundsPlan (everyone already has it) plus each
// player's vote{N} fields (already synced as part of `rounds`), so
// there's no extra write path or race to worry about.
function computeScore(slot) {
	let score = 0
	for (let r = 1; r <= 4; r++) {
		let plan = roundsPlan[r - 1]
		if (plan && players[slot][1]["vote" + r] === plan.imposter) score++
	}
	return score
}

function wait(ms) {
	return new Promise(function (resolve) { setTimeout(resolve, ms) })
}

function fade(el, opacity) {
	el.style.transition = "opacity 0.5s"
	el.style.opacity = opacity
}

let revealInProgress = {}

// Walks the reveal through its stages on a timer, each one fading out
// before the next fades in: the imposter's name and drawing first, then
// the real prompt, then the fake prompt, then finally the list of players
// who guessed right, overlaid on the drawing itself one name at a time.
// `title`/`value` are two separate spans (not one nested inside the
// other) specifically so rewriting the stage label's innerHTML each step
// never clobbers the value alongside it.
//
// Guarded per-round against overlapping calls -- pageChange() actually
// runs twice per navigation (an explicit call plus the async "hashchange"
// event the same location.href assignment triggers), which used to attach
// two independent watchers that each called this once, running two
// concurrent copies of this whole animation against the same DOM and
// duplicating whatever they built up incrementally (the correct-guessers
// list). watchVotingProgress now guards against starting twice in the
// first place, but this is a second, unconditional line of defense: no
// matter what triggers a repeat call for a round already mid-animation,
// it's simply ignored.
async function showReveal(round) {
	if (revealInProgress[round]) return
	revealInProgress[round] = true
	try {
		let plan = roundsPlan[round - 1]
		let result = computeRoundReveal(round)
		let imposterSlot = result.imposterSlot

		let title = document.querySelector("#reveal" + round + "Title")
		let value = document.querySelector("#reveal" + round + "Value")
		let drawBox = document.querySelector("#reveal" + round + "Box")
		let svg = document.querySelector("#reveal" + round + "Drawing")
		let correctBox = document.querySelector("#reveal" + round + "Correct")
		let continueBtn = document.querySelector("#reveal" + round + "Continue")

		const removeChilds = (parent) => {
			while (parent.lastChild) {
				parent.removeChild(parent.lastChild)
			}
		}

		// Reset every animated bit back to its starting state -- also covers
		// landing here straight from a reload (findResumePoint's "reveal"
		// stage calls showReveal directly, with nothing primed beforehand).
		title.style.transition = "none"
		title.style.opacity = "1"
		title.innerHTML = "The imposter was:"
		value.style.transition = "none"
		value.style.opacity = "0"
		value.innerHTML = ""
		drawBox.style.transition = "none"
		drawBox.style.opacity = "0"
		continueBtn.style.transition = "none"
		continueBtn.style.opacity = "0"
		continueBtn.disabled = true
		removeChilds(correctBox)

		removeChilds(svg)
		let drw = players[imposterSlot][1]["drawing" + round]
		for (let i = 0; i < drw.length; i++) {
			let path = document.createElementNS("http://www.w3.org/2000/svg", "path")
			path.setAttributeNS(null, 'd', "M " + drw[i][0] + "," + drw[i][1] + " " + drw[i][2] + "," + drw[i][3])
			svg.appendChild(path)
		}

		location.href = page + "#reveal" + round
		pageChange()

		await wait(1000)
		value.innerHTML = players[imposterSlot][0]
		fade(value, 1)
		fade(drawBox, 1)

		await wait(3000)
		fade(title, 0)
		fade(value, 0)
		await wait(500)
		title.innerHTML = "Real prompt:"
		value.innerHTML = plan.realPrompt
		fade(title, 1)
		fade(value, 1)

		await wait(3000)
		fade(title, 0)
		fade(value, 0)
		await wait(500)
		title.innerHTML = "Fake prompt:"
		value.innerHTML = plan.fakePrompt
		fade(title, 1)
		fade(value, 1)

		await wait(3000)
		fade(title, 0)
		fade(value, 0)
		await wait(500)
		title.innerHTML = "Correctly guessed by:"
		value.innerHTML = ""
		fade(title, 1)

		// De-duped by slot (a Set of the numeric slots, not of display
		// names) so two different players who happen to share a typed
		// name both still show up -- only a repeat of the exact same slot
		// collapses to one line.
		let uniqueVoters = Array.from(new Set(result.correctVoters))
		let names = uniqueVoters.map(function (i) { return players[i][0] })
		if (names.length === 0) names = ["Nobody"]
		await wait(500)
		for (let i = 0; i < names.length; i++) {
			if (i > 0) await wait(200)
			let line = document.createElement("div")
			line.innerHTML = names[i]
			line.style.opacity = "0"
			correctBox.appendChild(line)
			line.offsetWidth // force reflow so the opacity:0 above commits before fading in
			fade(line, 1)
		}

		await wait(2000)
		continueBtn.disabled = false
		fade(continueBtn, 1)
	} finally {
		revealInProgress[round] = false
	}
}

// Doesn't navigate directly -- whoever clicks writes their own ack and
// nudges the shared round forward, then every listening client (this one
// included) reacts to that same broadcast via listenStatus, landing on
// the next round's draw screen at the same moment so their 20s timers all
// start together instead of each player pacing their own transition.
function continueToNextRound(round) {
	writeRound(playerNumber, "ack" + round, true)
	advanceSharedRound(round)
}

function renderFinalResults() {
	let el = document.querySelector("#finalScores")
	if (!el) return
	let html = ""
	for (let i = 0; i < players.length; i++) {
		if (players[i]) html = html + players[i][0] + ": " + computeScore(i) + "<br>"
	}
	el.innerHTML = html
}

function finishGame() {
	clearSession()
	location.href = "thanks.html"
}

function toggleDrawButtons(m) {
	let buttons = document.querySelectorAll("button.draw")
	if (m)	{
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].disabled = false
		}
	}
	else {
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].disabled = true
		}
	}
}
