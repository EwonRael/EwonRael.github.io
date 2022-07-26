function initializeGuest() {
	// Create own peer object with connection to shared PeerJS server
	peer = new Peer([peerID + "-drawingGames-d219-46b1-b09c-15c9205cff96"], {debug: 2})

	peer.on('open', function (id) {
		if (peer.id === null) {
			console.log("something's weird with the IDs");
			peer.id = lastPeerId;
		} else {
			lastPeerId = peer.id;
		}

		console.log("Peer ID " + peer.id);
	})

	peer.on('connection', function (c) {
	// Disallow incoming connections
		c.on('open', function() {
			c.send("That's not a host!")
			setTimeout(function() { c.close() }, 500)
		})
	})

	peer.on('disconnected', function () {
		console.log("Connection lost. Please reconnect");
	})

	peer.on('close', function() {
		conn = null;
		console.log("Connection destroyed");
	})

	peer.on('error', function (err) {
		console.log(err)
		alert('' + err)
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
		console.log("Connected to: " + conn.peer)
		conn.send(["playerName", name]);
	})

	// Handle incoming data (messages only since this is the signal sender)
	conn.on('data', function (data) {
		console.log("Data recieved")
		console.log(data)
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
		playerList = ""
		for (let i = 0; i < players.length; i++) {
			playerList = playerList + players[i][0] + "<br>"
		}
		document.querySelector("#playerList").innerHTML = playerList
	}
	
	if (data[0] == "Start Game") {
		playerNumber = data[1]
		document.querySelector("#lobby").classList.add("hidden")
		document.querySelector("#caption1").classList.remove("hidden")
		console.log("I'm player number " + playerNumber)
	}
}
