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
	if (data[0] == "updateGroup") {
		players = data[1]
		let playerList = ""
		let galleryBox = document.querySelector("#galleryBox")
		galleryBox.innerHTML = ""
		for (let i = 0; i < players.length; i++) {
			playerList = playerList + players[i][0] + "<br>"
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
		document.querySelector("#playerList").innerHTML = playerList
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
}
