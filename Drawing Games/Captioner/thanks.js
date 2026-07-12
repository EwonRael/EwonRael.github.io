let page = location.href.split('#')[0]
let players = []
let stories = {}
let legacyMode = false
let gameSummaries = []
let summariesLoaded = false

// The list view only ever needs a date + final caption per game, not
// the full drawing data -- new saves (see finishGame() in script.js)
// already store just that summary in drawing-games-list, so loading
// the list itself is cheap regardless of how much drawing data exists.
// Any leftover entries from before that change are just a bare key
// string; those get upgraded to the summary format the first time
// they're seen (a one-time full parse, then never again) instead of
// paying that cost on every visit.
function loadSummaries() {
	if (summariesLoaded) return
	summariesLoaded = true
	let list = JSON.parse(localStorage.getItem("drawing-games-list")) || []
	let upgraded = false
	let valid = []
	for (let i = 0; i < list.length; i++) {
		let entry = list[i]
		if (typeof entry === "string") {
			let raw = localStorage.getItem(entry)
			let saved = raw ? JSON.parse(raw) : null
			let savedPlayers = saved && saved[1]
			let caption4 = savedPlayers && savedPlayers[0] && savedPlayers[0][1] && savedPlayers[0][1].caption4
			// Skip corrupted saves from an earlier bug where `players` (or
			// an individual round within it) could end up wiped/empty right
			// before being saved -- there's nothing meaningful to show for
			// those, so leave them out instead of rendering a blank card.
			if (!caption4) continue
			entry = {key: entry, date: saved[0], caption4: caption4}
			list[i] = entry
			upgraded = true
		}
		if (entry && entry.caption4) valid.push(entry)
	}
	if (upgraded) localStorage.setItem("drawing-games-list", JSON.stringify(list))
	gameSummaries = valid.slice(-26)
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
// -- the list itself (loadOldGames) never touches this full data. Saves
// from before the pre-woven story format are a raw `players` array
// (Array.isArray(parsed[1])); those fall back to the old weave-on-demand
// path (loadGalleryLegacy) instead of being unreadable.
function loadGalleryi(m) {
	let raw = localStorage.getItem(gameSummaries[m].key)
	if (!raw) return
	let parsed = JSON.parse(raw)
	legacyMode = Array.isArray(parsed[1])

	let galleryBox = document.querySelector("#galleryBox")
	galleryBox.innerHTML = ""

	if (legacyMode) {
		players = parsed[1]
		for (let i = 0; i < players.length; i++) {
			if (players[i][1].drawing4) {
				appendGalleryThumbnail(galleryBox, players[i][1].drawing4, i)
			}
		}
	} else {
		stories = parsed.stories || {}
		for (let slot in stories) {
			appendGalleryThumbnail(galleryBox, stories[slot].panels[0].drawing, slot)
		}
	}

	location.href = page + "#gallery"
	pageChange()
}

// The panels are already woven into display order by weaveStory()
// (sync.js, at the moment the game was played), so there's no more
// slot arithmetic to do here -- just read them straight out.
function loadGallery(m) {
	if (legacyMode) {
		loadGalleryLegacy(m)
		return
	}

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

// Pre-migration saves only have the raw per-slot `players` array, so
// this weaves the display chain on demand exactly like it always did.
function loadGalleryLegacy(m) {
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
