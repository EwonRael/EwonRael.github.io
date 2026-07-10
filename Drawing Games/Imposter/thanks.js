let page = location.href.split('#')[0]
let players = []
let roundsPlan = []
let gameSummaries = []

function loadSummaries() {
	let list = JSON.parse(localStorage.getItem("imposter-games-list")) || []
	gameSummaries = list.slice(-26)
}

function pageChange() {
	let hide = document.querySelectorAll(".hide")
	let show = location.href.split('#')[1]

	for (let i = 0; i < hide.length; i++) {
		let hidden = hide[i]
		hidden.classList.add("hidden")
	}

	if (location.href == page) {
		document.querySelector("#end").classList.remove("hidden")
	}

	else {
		document.querySelector("#" + show).classList.remove("hidden")
		if (show == "pastGames") {
			loadOldGames()
		}
	}
}

window.addEventListener("hashchange", function () {pageChange()})
window.addEventListener("DOMContentLoaded", function () {pageChange()})

function loadOldGames() {
	loadSummaries()
	let oldGamesDiv = document.querySelector("#oldGames")
	oldGamesDiv.innerHTML = ""
	for (let i = 0; i < gameSummaries.length; i++) {
		let date = document.createElement("p")
		date.innerHTML = gameSummaries[i].date
		date.setAttribute("class", "date")
		date.setAttribute("onclick", "loadGalleryi(" + i + ")")
		let info = document.createElement("p")
		info.innerHTML = gameSummaries[i].totalPlayers + " players"
		info.setAttribute("onclick", "loadGalleryi(" + i + ")")
		oldGamesDiv.append(date)
		oldGamesDiv.append(info)
	}
}

function computeScore(slot) {
	let score = 0
	for (let r = 1; r <= 4; r++) {
		let plan = roundsPlan[r - 1]
		if (plan && players[slot][1]["vote" + r] === plan.imposter) score++
	}
	return score
}

// Only pulled from storage now, once a specific game is actually opened
// -- the list itself (loadOldGames) never touches this full data.
function loadGalleryi(m) {
	let raw = localStorage.getItem(gameSummaries[m].key)
	if (!raw) return
	let saved = JSON.parse(raw)
	players = saved[1]
	roundsPlan = saved[2] || []

	let finalScores = document.querySelector("#finalScores")
	let html = ""
	for (let i = 0; i < players.length; i++) {
		if (players[i]) html = html + players[i][0] + ": " + computeScore(i) + "<br>"
	}
	finalScores.innerHTML = html

	let galleryBox = document.querySelector("#galleryBox")
	galleryBox.innerHTML = ""
	for (let i = 0; i < players.length; i++) {
		if (players[i] && players[i][1].drawing1) {
			let drw = players[i][1].drawing1
			let gallery = document.createElement("div")
			gallery.setAttribute("class", "gallery")
			gallery.setAttribute("onclick", "loadGallery(" + i + ")")
			let pic = document.createElementNS("http://www.w3.org/2000/svg", "svg")
			pic.setAttribute("viewBox", "0 0 100 53")
			for (let j = 0; j < drw.length; j++) {
				let path = document.createElementNS("http://www.w3.org/2000/svg", "path")
				path.setAttributeNS(null, 'd', "M " + drw[j][0] + "," + drw[j][1] + " " + drw[j][2] + "," + drw[j][3]);
				pic.appendChild(path)
			}
			gallery.appendChild(pic)
			galleryBox.appendChild(gallery)
		}
	}
	location.href = page + "#gallery"
	pageChange()
}

function loadGallery(m) {
	const removeChilds = (parent) => {
		while (parent.lastChild) {
			parent.removeChild(parent.lastChild);
		}
	}
	let svg = document.querySelector("#galleryD")
	removeChilds(svg)
	let drw = players[m][1].drawing1
	for (let i = 0; i < drw.length; i++) {
		let path = document.createElementNS("http://www.w3.org/2000/svg", "path")
		path.setAttributeNS(null, 'd', "M " + drw[i][0] + "," + drw[i][1] + " " + drw[i][2] + "," + drw[i][3]);
		svg.appendChild(path)
	}
	document.querySelector("#galleryName").innerHTML = players[m][0]

	location.href = page + "#galleryItem"
	pageChange()
}
