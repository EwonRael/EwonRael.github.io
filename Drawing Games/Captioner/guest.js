function initializeGuest() {
	// Create own peer object with connection to shared PeerJS server
	peer = new Peer({debug: 2})

	peer.on('open', function (id) {
		if (peer.id === null) {
			console.log("something's weird with the IDs")
			peer.id = lastPeerId
		} else {
			lastPeerId = peer.id
		}
	})

	peer.on('connection', function (c) {
	// Disallow incoming connections
		c.on('open', function() {
			c.send("That's not a host!")
			setTimeout(function() { c.close() }, 500)
		})
	})

	peer.on('disconnected', function () {
		console.log("Connection lost. Please reconnect")
	})

	peer.on('close', function() {
		conn = null;
		console.log("Connection destroyed")
	})

	peer.on('error', function (err) {
		if (err.toString().includes("Could not connect to peer")) {
			alert('I can\'t find a host by the name "' + hostName + '"')
			history.back()
		}
	})
}

function joinHost() {
	console.log("connecting to " + hostName + "...")

	// Close old connection
	if (conn) {
		conn.close()
	}

	// Create connection to destination peer specified in the input field
	conn = peer.connect(hostID + "-drawingGames-host-d219-46b1-b09c-15c9205cff96", {reliable: true})

	conn.on('open', function () {
		conn.send(["playerName", name]);
		console.log("connection established!")
	})

	// Handle incoming data (messages only since this is the signal sender)
	conn.on('data', function (data) {
		guestData(data)
	})

	conn.on('close', function () {
		console.log("Connection closed")
		conn = null
	})
}

function guestData(data) {
	if (data[0] == "updateNames") {
		players = data[1]
		let playerList = ""
		for (let i = 0; i < players.length; i++) {
			playerList = playerList + players[i][0] + "<br>"
		}
		document.querySelector("#playerList").innerHTML = playerList
	}
	if (data[0] == "updateGroup") {
		let player = data[1][0]
		let lookup = data[1][1]
		let content = data[1][2]
		players[player][1][lookup] = content
		let galleryBox = document.querySelector("#galleryBox")
		galleryBox.innerHTML = ""
		if (lookup == "drawing4") {
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
		}
		let waiter = players[playerPrior][1][waiting]
		if (document.querySelector("#waiting").style.display == "inherit" && waiter) {
			if (waiter.constructor == Array) {
				drawing = waiter
				loadDrawing("load")
			}
			else {
				document.querySelector("#" + writeTo).innerHTML = waiter
			}
			document.querySelector("#waiting").style.display = "none"
		}
	}
	
	if (data[0] == "Start Game") {
		playerNumber = data[1]
		playerPrior = playerNumber - 1
		location.href = page + "#caption1"
		pageChange()
		console.log("I'm player number " + playerNumber)
	}
	
	if (data[0] == "Rejoin Game") {
		playerNumber = data[1]
		playerPrior = playerNumber - 1
		players = data[2]
		let place = "gallery"
		let num = 0
		for (let i = 0; i < players[playerNumber].length; i++) {
			if (players[playerNumber][i].drawing4 == null) { place = "drawing4"; num = 4}
			if (players[playerNumber][i].caption4 == null) { place = "caption4"; num = 3}
			if (players[playerNumber][i].drawing3 == null) { place = "drawing3"; num = 3}
			if (players[playerNumber][i].caption3 == null) { place = "caption3"; num = 2}
			if (players[playerNumber][i].drawing2 == null) { place = "drawing2"; num = 2}
			if (players[playerNumber][i].caption2 == null) { place = "caption2"; num = 1}
			if (players[playerNumber][i].drawing1 == null) { place = "drawing1"; num = 1}
			if (players[playerNumber][i].caption1 == null) { place = "caption1"}
		}
		if (place.includes("drawing")) {
			if (players[playerPrior][1]["caption" + num] == null) {
				document.querySelector("#waitingNote").innerHTML = "Waiting for " + players[playerPrior][0] + " to finish captioning..."
				document.querySelector("#waiting").style.display = "inherit"
				waiting = "caption" + num
				writeTo = "drawing" + num + "C"
			}
			else {
				document.querySelector("#drawing"+num+"C").innerHTML = players[playerPrior][1]["caption" + num]
			}
		}
		if (place.includes("caption")) {
			drawing = players[playerPrior][1]["drawing" + num]
			if (place != "caption1"){
			if (players[playerPrior][1]["drawing" + num] == null) {
				document.querySelector("#waitingNote").innerHTML = "Waiting for " + players[playerPrior][0] + " to finish drawing..."
				document.querySelector("#waiting").style.display = "inherit"
				waiting = "drawing" + num
			}
			else {
				loadDrawing("load")
			}
			}
		}
		location.href = page + "#" + place
		pageChange()
		console.log("I'm player number " + playerNumber)
	}
}
