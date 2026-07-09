let name = localStorage.getItem("drawing-games-name")
let hostName = null
let hostID = null
let players = []
let isHost = false
let playerNumber = 0
let playerPrior = 0
let page = location.href.split('#')[0]
let drawMousedown = false
let posX = 0
let posXold = 0
let posYold = 0
let drawing = []
let screenshot = null
let captionSuggestions = []
let suggestionIndex = 0
let suggestTimer = null
let suggestButtonShown = false

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
		if (show.includes("drawing")){
			document.querySelector("#drawSpace").classList.remove("hidden")
		}
		else {
			document.querySelector("#drawSpace").classList.add("hidden")
		}
		if (show.includes("caption") && !(show.includes("caption1"))){
			document.querySelector("#drawLoad").classList.remove("hidden")
		}
		else {
			document.querySelector("#drawLoad").classList.add("hidden")
		}
		if (show == "gallery") {
			listenGalleryLive()
		}
		else {
			stopGalleryLive()
		}
		if (show == "caption1") {
			buildCaptionSuggestions()
			resetCaptionSuggestState()
		}
		else {
			stopCaptionSuggestTimer()
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
	removeChilds(document.querySelector("#loadSVG"))
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

function loadDrawing(m) {
	for (let i = 0; i < drawing.length; i++) {
		let path = document.createElementNS("http://www.w3.org/2000/svg", "path")
		path.setAttributeNS(null, 'd', "M " + drawing[i][0] + "," + drawing[i][1] + " " + drawing[i][2] + "," + drawing[i][3]);
		document.querySelector("#" + m + "SVG").appendChild(path)
	}
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

// The funniest captions tend to be whatever a caption4 mutated into by
// the end of a chain, so those make good fresh caption1 prompts for a
// new game. Collected from every player in every locally-saved game.
function collectSavedCaptions() {
	let list = JSON.parse(localStorage.getItem("drawing-games-list")) || []
	let captions = []
	for (let i = 0; i < list.length; i++) {
		let raw = localStorage.getItem(list[i])
		if (!raw) continue
		let savedPlayers = JSON.parse(raw)[1]
		for (let j = 0; j < savedPlayers.length; j++) {
			let data = savedPlayers[j][1]
			if (data && data.caption4) captions.push(data.caption4)
		}
	}
	return captions
}

// Saved-game captions come first (shuffled among themselves), and the
// hand-written ones in suggested-captions.js only get used once those
// run out (also shuffled among themselves).
function buildCaptionSuggestions() {
	captionSuggestions = shuffleArray(collectSavedCaptions()).concat(shuffleArray(suggestedCaptions))
	suggestionIndex = 0
}

function suggestCaption() {
	if (captionSuggestions.length === 0) return
	if (suggestionIndex >= captionSuggestions.length) buildCaptionSuggestions()

	let box = document.querySelector("#caption1C")
	box.innerHTML = captionSuggestions[suggestionIndex]
	suggestionIndex++
	buttonEnable(box)
}

// Called once when the caption1 screen is first shown -- box is always
// empty at that point, so this starts the "have they written nothing
// for 3 seconds" countdown from scratch.
function resetCaptionSuggestState() {
	suggestButtonShown = false
	document.querySelector("#suggestCaptionButton").classList.add("hidden")
	startCaptionSuggestTimer()
}

function startCaptionSuggestTimer() {
	if (suggestTimer) clearTimeout(suggestTimer)
	suggestTimer = setTimeout(function () {
		suggestButtonShown = true
		document.querySelector("#suggestCaptionButton").classList.remove("hidden")
	}, 3000)
}

function stopCaptionSuggestTimer() {
	if (suggestTimer) { clearTimeout(suggestTimer); suggestTimer = null }
}

// The button only ever appears while the box is empty; once it's shown
// it stays put for good, so typing afterwards doesn't need to touch it.
function onCaption1Typing() {
	if (suggestButtonShown) return
	let box = document.querySelector("#caption1C")
	let isEmpty = box.innerHTML == "" || box.innerHTML == "<br>"
	if (isEmpty) {
		startCaptionSuggestTimer()
	} else {
		stopCaptionSuggestTimer()
	}
}

function captionB(m) {
	let content = document.querySelector("#caption" + m + "C").innerHTML
	writeRound(playerNumber, "caption" + m, content)
	if (players[playerPrior][1]["caption" + m] != null) {
		document.querySelector("#drawing" + m + "C").innerHTML = players[playerPrior][1]["caption" + m]
	}
	else {
		let target = document.querySelector("#drawing" + m + "C")
		beginWaiting(playerPrior, "captioning", "caption" + m, function (waitedContent) {
			target.innerHTML = waitedContent
		})
	}
	drawing = []
	location.href = page + "#drawing" + m
	pageChange()
}

// Mousemove fires far more often than a drawing visibly changes, so a
// slow careful drawing can pile up thousands of near-duplicate tiny
// segments. This collapses runs of them into one right before the
// result gets saved/sent -- purely a data-size cut, the live canvas
// while actually drawing is untouched.
function simplifyDrawing(segments) {
	if (segments.length <= 1) return segments
	let minDist = 0.35
	let simplified = []
	let lastKept = [segments[0][2], segments[0][3]]
	for (let i = 0; i < segments.length; i++) {
		let seg = segments[i]
		let dx = seg[0] - lastKept[0]
		let dy = seg[1] - lastKept[1]
		let isLast = i === segments.length - 1
		if (isLast || Math.sqrt(dx * dx + dy * dy) >= minDist) {
			simplified.push([seg[0], seg[1], lastKept[0], lastKept[1]])
			lastKept = [seg[0], seg[1]]
		}
	}
	return simplified
}

function drawingB(m) {
	let content = simplifyDrawing(drawing)
	writeRound(playerNumber, "drawing" + m, content)
	eraceSVG()
	if (players[playerPrior][1]["drawing" + m] != null) {
		drawing = players[playerPrior][1]["drawing" + m]
		loadDrawing("load")
	}
	else {
		beginWaiting(playerPrior, "drawing", "drawing" + m, function (waitedContent) {
			drawing = waitedContent
			loadDrawing("load")
		})
	}
	location.href = page + "#caption" + (m + 1)
	pageChange()
}

function drawing4B() {
	let content = simplifyDrawing(drawing)
	writeRound(playerNumber, "drawing4", content)
	eraceSVG()
	location.href = page + "#gallery"
	pageChange()
}

function loadGallery(m) {
	let total = (players.length - 1)
	let current = m
	let drw = null
	function prior() {
		if (current == 0) {
			current = total
		}
		else {
			current = (current - 1)
		}
	}
	const removeChilds = (parent) => {
		while (parent.lastChild) {
			parent.removeChild(parent.lastChild);
		}
	}
	removeChilds(document.querySelector("#galleryD1"))
	removeChilds(document.querySelector("#galleryD2"))
	removeChilds(document.querySelector("#galleryD3"))
	removeChilds(document.querySelector("#galleryD4"))
	
	for (let j = 1; j < 5; j++) {
		drw = players[current][1]["drawing" + (5 - j)]
		for (let i = 0; i < drw.length; i++) {
			let path = document.createElementNS("http://www.w3.org/2000/svg", "path")
			path.setAttributeNS(null, 'd', "M " + drw[i][0] + "," + drw[i][1] + " " + drw[i][2] + "," + drw[i][3]);
			document.querySelector("#galleryD" + j).appendChild(path)
		}
		prior()
		
		document.querySelector("#galleryC" + j).innerHTML = players[current][1]["caption" + (5 - j)]
		prior()
	}
	
	location.href = page + "#galleryItem"
	pageChange()
}

function getDate() {
	return new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear()
}

function finishGame() {
	let datestamp = new Date().getTime()
	let key = "drawing-games-" + datestamp
	localStorage.setItem(key, JSON.stringify([getDate(), players]))

	// drawing-games-list stores just the lightweight bit the past-games
	// list actually displays (date + final caption), not the full game --
	// the full drawings only get pulled from `key` on demand when someone
	// actually opens this specific game (see loadGalleryi in thanks.js).
	let summary = {key: key, date: getDate(), caption4: players[0][1].caption4}
	let oldGames = localStorage.getItem("drawing-games-list")
	let list = oldGames ? JSON.parse(oldGames) : []
	list.push(summary)
	localStorage.setItem("drawing-games-list", JSON.stringify(list))

	clearSession()
	location.href = "thanks.html"
}

function buttonEnable(m) {
	if (m.innerHTML == "<br>") {
		m.parentNode.querySelector("button.right").disabled = true
	}
	else {
		m.parentNode.querySelector("button.right").disabled = false
	}
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
