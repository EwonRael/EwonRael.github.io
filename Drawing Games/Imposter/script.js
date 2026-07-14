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
		}
		else {
			document.querySelector("#drawSpace").classList.add("hidden")
		}
		if (show.indexOf("gallery") === 0 && show !== "galleryItem") {
			listenRoundGalleryLive(Number(show.slice(-1)))
		}
		else {
			stopRoundGalleryLive()
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

function drawSubmit(round) {
	let content = simplifyDrawing(drawing)
	writeRound(playerNumber, "drawing" + round, content)
	eraceSVG()
	beginWaitingForAll("drawing", "drawing" + round, function () {
		location.href = page + "#gallery" + round
		pageChange()
	})
}

// Opens the single-drawing detail view for one player's round drawing,
// with a "Vote for [Name]" button -- this is the voting surface, reusing
// Captioner's gallery -> galleryItem pattern but simplified from a
// 4-stack down to just one drawing.
function openGalleryItem(playerSlot, round) {
	const removeChilds = (parent) => {
		while (parent.lastChild) {
			parent.removeChild(parent.lastChild)
		}
	}
	let svg = document.querySelector("#galleryD")
	removeChilds(svg)
	let drw = players[playerSlot][1]["drawing" + round]
	for (let i = 0; i < drw.length; i++) {
		let path = document.createElementNS("http://www.w3.org/2000/svg", "path")
		path.setAttributeNS(null, 'd', "M " + drw[i][0] + "," + drw[i][1] + " " + drw[i][2] + "," + drw[i][3])
		svg.appendChild(path)
	}
	document.querySelector("#galleryName").innerHTML = players[playerSlot][0]
	let voteButton = document.querySelector("#voteButton")
	voteButton.innerHTML = "Vote for " + players[playerSlot][0]
	voteButton.setAttribute("onclick", "castVote(" + playerSlot + ", " + round + ")")

	location.href = page + "#galleryItem"
	pageChange()
}

// Casting a vote is allowed to be a self-vote -- no special-casing --
// since a player has no reliable way to know they were the imposter
// until the reveal anyway.
function castVote(votedSlot, round) {
	writeRound(playerNumber, "vote" + round, votedSlot)
	beginWaitingForAll("voting", "vote" + round, function () {
		showReveal(round)
	})
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

function showReveal(round) {
	let plan = roundsPlan[round - 1]
	let result = computeRoundReveal(round)
	let imposterSlot = result.imposterSlot

	document.querySelector("#reveal" + round + "Imposter").innerHTML = players[imposterSlot][0]
	document.querySelector("#reveal" + round + "Real").innerHTML = plan.realPrompt
	document.querySelector("#reveal" + round + "Fake").innerHTML = plan.fakePrompt

	let names = result.correctVoters.map(function (i) { return players[i][0] }).join(", ") || "Nobody"
	document.querySelector("#reveal" + round + "Correct").innerHTML = names

	const removeChilds = (parent) => {
		while (parent.lastChild) {
			parent.removeChild(parent.lastChild)
		}
	}
	let svg = document.querySelector("#reveal" + round + "Drawing")
	removeChilds(svg)
	let drw = players[imposterSlot][1]["drawing" + round]
	for (let i = 0; i < drw.length; i++) {
		let path = document.createElementNS("http://www.w3.org/2000/svg", "path")
		path.setAttributeNS(null, 'd', "M " + drw[i][0] + "," + drw[i][1] + " " + drw[i][2] + "," + drw[i][3])
		svg.appendChild(path)
	}

	location.href = page + "#reveal" + round
	pageChange()
}

function continueToNextRound(round) {
	writeRound(playerNumber, "ack" + round, true)
	if (round < 4) {
		location.href = page + "#draw" + (round + 1)
		pageChange()
	}
	else {
		location.href = page + "#finalResults"
		pageChange()
	}
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

function getDate() {
	return new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear()
}

function finishGame() {
	let datestamp = new Date().getTime()
	let key = "imposter-games-" + datestamp
	localStorage.setItem(key, JSON.stringify([getDate(), players, roundsPlan]))

	// imposter-games-list stores just the lightweight bit the past-games
	// list actually displays, not the full game -- the full drawings only
	// get pulled from `key` on demand when someone actually opens this
	// specific game.
	let summary = {key: key, date: getDate(), totalPlayers: players.length}
	let oldGames = localStorage.getItem("imposter-games-list")
	let list = oldGames ? JSON.parse(oldGames) : []
	list.push(summary)
	localStorage.setItem("imposter-games-list", JSON.stringify(list))

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
