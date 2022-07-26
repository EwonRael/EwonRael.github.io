function initializeHost() {
	isHost = true
	// I stole this code from the Peer-to-Peer Cue System and IDK how it works
	peer = new Peer([peerID + "-drawingGames-host-d219-46b1-b09c-15c9205cff96"], {debug: 2})

	peer.on('open', function (id) {
		// this might not be relevant anymore because I preselect IDs
		let lastPeerId = null
		if (peer.id === null) {
			console.log("something's weird with the IDs")
			peer.id = lastPeerId
		} else {
			lastPeerId = peer.id
		}

		console.log("Peer ID " + peer.id)
		console.log("Awaiting connection...")
	})

	peer.on('connection', function (c) {
		hostConn = hostConn.concat(c)
		console.log("Connected to: " + hostConn[hostConn.length - 1].peer)
		hostReady()
	})

	peer.on('disconnected', function () {
		console.log("Connection lost. Please reconnect")
	})
	
	updatePlayerList(name)
}

function hostReady() {
	for (let i = 0; i < hostConn.length; i++) {
	hostConn[i].on('data', function (data) {
		console.log("Data recieved")
		console.log(data)
		
//STUFF TO DO WHEN GUESTS SEND DATA TO HOST

		if (data[0] == "playerName") {
			updatePlayerList(data[1])
		}
		
		if (data == "Let's Play!") {
			startGame()
		}

//END THAT PART
	})
	}
	
	for (let i = 0; i < hostConn.length; i++) {
	hostConn[i].on('close', function () {
		console.log("Connection reset<br>Awaiting connection...")
		conn = null
	})
	}
}

function updatePlayerList(newPlayer) {
	players.push([newPlayer, {caption1: null, drawing1: null, caption2: null, drawing2: null, caption3: null, drawing3: null, caption4: null, drawing4: null}])
	playerList = ""
	for (let i = 0; i < players.length; i++) {
		playerList = playerList + players[i][0] + "<br>"
	}
	document.querySelector("#playerList").innerHTML = playerList
	updateGroup()
}

function updateGroup() {
	for (let i = 0; i < hostConn.length; i++) {
		if (hostConn[i] && hostConn[i].open) {
			hostConn[i].send(["updateGroup", players])
			console.log("message signal sent")
		} else {
			console.log('Connection is closed')
		}
	}
}

function startGame() {
	for (let i = 0; i < hostConn.length; i++) {
		if (hostConn[i] && hostConn[i].open) {
			hostConn[i].send(["Start Game", i + 1])
			document.querySelector("#lobby").classList.add("hidden")
			document.querySelector("#caption1").classList.remove("hidden")
			console.log("game start")
		} else {
			console.log('Connection is closed')
		}
	}
	console.log("I'm player number " + playerNumber)
}
