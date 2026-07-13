let page = location.href.split('#')[0]
let stories = {}
let gameSummaries = []
let summariesLoaded = false

// The list view only ever needs a date + final caption per game, not
// the full drawing data -- saves (see finishGame() in script.js) already
// store just that summary in drawing-games-list, so loading the list
// itself is cheap regardless of how much drawing data exists.
function loadSummaries() {
	if (summariesLoaded) return
	summariesLoaded = true
	let list = JSON.parse(localStorage.getItem("drawing-games-list")) || []
	gameSummaries = list.filter(function (entry) {
		return entry && entry.caption4
	}).slice(-26)
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
		let caption = document.createElement("p")
		caption.innerHTML = gameSummaries[i].caption4
		caption.setAttribute("onclick", "loadGalleryi(" + i + ")")
		oldGamesDiv.append(date)
		oldGamesDiv.append(caption)
	}
}

function appendGalleryThumbnail(galleryBox, drw, key) {
	let gallery = document.createElement("div")
	gallery.setAttribute("class", "gallery")
	gallery.setAttribute("onclick", "loadGallery(" + key + ")")
	let pic = document.createElementNS("http://www.w3.org/2000/svg", "svg")
	pic.setAttribute("viewBox", "0 0 100 53")
	for (let i = 0; i < drw.length; i++) {
		let path = document.createElementNS("http://www.w3.org/2000/svg", "path")
		path.setAttributeNS(null, 'd', "M " + drw[i][0] + "," + drw[i][1] + " " + drw[i][2] + "," + drw[i][3]);
		pic.appendChild(path)
	}
	gallery.appendChild(pic)
	galleryBox.appendChild(gallery)
}

// Only pulled from storage now, once a specific game is actually opened
// -- the list itself (loadOldGames) never touches this full data.
function loadGalleryi(m) {
	let raw = localStorage.getItem(gameSummaries[m].key)
	if (!raw) return
	let parsed = JSON.parse(raw)

	let galleryBox = document.querySelector("#galleryBox")
	galleryBox.innerHTML = ""

	stories = parsed.stories || {}
	for (let slot in stories) {
		appendGalleryThumbnail(galleryBox, stories[slot].panels[0].drawing, slot)
	}

	location.href = page + "#gallery"
	pageChange()
}

// The panels are already woven into display order by weaveStory()
// (sync.js, at the moment the game was played), so there's no more
// slot arithmetic to do here -- just read them straight out.
function loadGallery(m) {
	let story = stories[m]
	if (!story) return

	const removeChilds = (parent) => {
		while (parent.lastChild) {
			parent.removeChild(parent.lastChild);
		}
	}

	for (let j = 0; j < 4; j++) {
		let target = document.querySelector("#galleryD" + (j + 1))
		removeChilds(target)
		let drw = story.panels[j].drawing
		for (let i = 0; i < drw.length; i++) {
			let path = document.createElementNS("http://www.w3.org/2000/svg", "path")
			path.setAttributeNS(null, 'd', "M " + drw[i][0] + "," + drw[i][1] + " " + drw[i][2] + "," + drw[i][3]);
			target.appendChild(path)
		}
		document.querySelector("#galleryC" + (j + 1)).innerHTML = story.panels[j].caption
	}

	location.href = page + "#galleryItem"
	pageChange()
}
