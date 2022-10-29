let page = location.href.split('#')[0]
let players = []
let oldGames = []

let oldlist = JSON.parse(localStorage.getItem("drawing-games-list"))
for (let i = 0; i < 26; oldlist.length) {
	oldGames.push(localStorage.getItem(oldlist[i]))
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

function loadOldGames() {
	let oldGamesDiv = document.querySelector("#oldGames")
	oldGamesDiv.innerHTML = ""
	for (let i = 0; i < oldGames.length; i++) {
		let date = document.createElement("p")
		date.innerHTML = oldGames[i][0]
		date.setAttribute("class", "date")
		date.setAttribute("onclick", "loadGalleryi(" + i + ")")
		let caption = document.createElement("p")
		caption.innerHTML = oldGames[i][1][0][1]["caption4"]
		caption.setAttribute("onclick", "loadGalleryi(" + i + ")")
		oldGamesDiv.append(date)
		oldGamesDiv.append(caption)
	}
}

function loadGalleryi(m) {
	players = oldGames[m][1]
	console.log(players)
	let galleryBox = document.querySelector("#galleryBox")
	galleryBox.innerHTML = ""
	for (let i = 0; i < players.length; i++) {
		if (players[i][1].drawing4) {
			let drw = players[i][1].drawing4
			let gallery = document.createElement("div")
			gallery.setAttribute("class", "gallery")
			gallery.setAttribute("onclick", "loadGallery("+i+")")
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
	}
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
		console.log(current)
		prior()
		
		document.querySelector("#galleryC" + j).innerHTML = players[current][1]["caption" + (5 - j)]
		console.log(current)
		prior()
	}
	
	location.href = page + "#galleryItem"
	pageChange()
}

