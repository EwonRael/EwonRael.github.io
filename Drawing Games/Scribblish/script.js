let name = localStorage.getItem("drawing-games-name")
let hostName = null
let peerID = null
let hostID = null
let peer = null
let conn = null
let hostConn = []
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
let waiting = null
let writeTo = null
let screenshot = null

name = "owen"

if (name) {console.log("my name is " + name)} else {location.href = "../index.html"}

function joinButton() {
	location.href = page + "#hostName"
	pageChange()
	peerID = name.toLowerCase().replace(/\s/g, '')
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
	peerID = name.toLowerCase().replace(/\s/g, '')
	location.href = page + "#lobby"
	pageChange()
	initializeHost()
}

function startGamePlz() {
	if (isHost) {
		startGame()
	}
	
	else {
		conn.send("Let's Play!")
		console.log("let's play?")
	}
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
		peer.destroy()
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

function captionB(m) {
	let content = document.querySelector("#caption" + m + "C").innerHTML
	if (isHost) {
		players[0][1]["caption" + m] = content
		updateGroup()
	}
	else {
		conn.send([playerNumber, "caption" + m, content])
	}
	document.querySelector("#drawing" + m + "C").innerHTML = players[playerPrior][1]["caption" + m]
	if (players[playerPrior][1]["caption" + m] == null) {
		document.querySelector("#waitingNote").innerHTML = "Waiting for " + players[playerPrior][0] + " to finish captioning..."
		document.querySelector("#waiting").style.display = "inherit"
		waiting = "caption" + m
		writeTo = "drawing" + m + "C"
	}
	drawing = []
	location.href = page + "#drawing" + m
	pageChange()
}

function drawingB(m) {
	let content = drawing
	if (isHost) {
		players[0][1]["drawing" + m] = content
		updateGroup()
	}
	
	else {
		conn.send([playerNumber, "drawing" + m, content])
	}
	eraceSVG()
	drawing = players[playerPrior][1]["drawing" + m]
	if (players[playerPrior][1]["drawing" + m] == null) {
		document.querySelector("#waitingNote").innerHTML = "Waiting for " + players[playerPrior][0] + " to finish drawing..."
		document.querySelector("#waiting").style.display = "inherit"
		waiting = "drawing" + m
	}
	else {
		loadDrawing("load")
	}
	location.href = page + "#caption" + (m + 1)
	pageChange()
}

function drawing4B() {
	let content = drawing
	if (isHost) {
		players[0][1]["drawing4"] = content
		updateGroup()
	}
	
	else {
		conn.send([playerNumber, "drawing4", content])
	}
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
	let oldGames = localStorage.getItem("drawing-games-old")
	
	if (oldGames) {
		let parced = JSON.parse(oldGames)
		parced.push([getDate(),players])
		localStorage.setItem("drawing-games-old", JSON.stringify(parced))
	}
	
	else {
		localStorage.setItem("drawing-games-old", JSON.stringify([[getDate(),players]]))
	}
	
	var life = JSON.parse(localStorage.getItem("drawing-games-old"))
	
	location.href = "thanks.html"
}

function buttonEnable(m) {
	if (m.innerHTML == "<br>") {
		m.parentNode.querySelector("button").disabled = true
	}
	else {
		m.parentNode.querySelector("button").disabled = false
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
