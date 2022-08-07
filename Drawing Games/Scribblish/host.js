let gameStart = false
let disconnected = []

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
		console.log("Awaiting connection...")
	})

	peer.on('connection', function (c) {
		hostConn = hostConn.concat(c)
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
		
//STUFF TO DO WHEN GUESTS SEND DATA TO HOST

		if (data[0] == "playerName" && (gameStart == false)) {
			updatePlayerList(data[1])
			console.log("connected to " + data[1])
		}
		
		else if (data[0] == "playerName" && gameStart) {
			console.log("looks like " + data[1] + " reconnected!")
			for (let j = 0; j < disconnected.length; j++) {
				let discon = disconnected[j]
				if (players[discon][0] == data[1]) {
					console.log(i)
					hostConn[i].send(["Rejoin Game", discon, players])
				}
			}
		}
		
		else if (data == "Let's Play!") {
			startGame()
		}
		
		else {
			let player = data[0]
			let lookup = data[1]
			let content = data[2]
			players[player][1][lookup] = content
			updateGroup(data)
		}

//END THAT PART
	})
	}
	
	for (let i = 0; i < hostConn.length; i++) {
	hostConn[i].on('close', function () {
		myNumber = i + 1
		if (disconnected.includes(myNumber) == false) {
			disconnected.push(myNumber)
			console.log("Looks like player " + myNumber + " dissconnected!")
			if (gameStart == false) {
				hostConn.splice(i, 1)
				console.log(hostConn)
				players.splice(myNumber, 1)
				sendGroupNames()
				let playerList = ""
				for (let i = 0; i < players.length; i++) {
					playerList = playerList + players[i][0] + "<br>"
				}
				document.querySelector("#playerList").innerHTML = playerList
			}
		}
	})
	}
}

function updatePlayerList(newPlayer) {
	players.push([newPlayer, {caption1: null, drawing1: null, caption2: null, drawing2: null, caption3: null, drawing3: null, caption4: null, drawing4: null}])
	let playerList = ""
	for (let i = 0; i < players.length; i++) {
		playerList = playerList + players[i][0] + "<br>"
	}
	document.querySelector("#playerList").innerHTML = playerList
	sendGroupNames()
}

function updateGroup(m) {
	for (let i = 0; i < hostConn.length; i++) {
		if (hostConn[i] && hostConn[i].open) {
			hostConn[i].send(["updateGroup", m])
		} else {
			console.log('Connection is closed')
		}
	}
	if (m[1] == "drawing4") {
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

function startGame() {
	for (let i = 0; i < hostConn.length; i++) {
		if (hostConn[i] && hostConn[i].open) {
			hostConn[i].send(["Start Game", i + 1])
			location.href = page + "#caption1"
			pageChange()
		} else {
			console.log('Connection is closed')
		}
	}
	console.log("I'm player number " + playerNumber)
	playerPrior = hostConn.length
	gameStart = true
	disconnected = []
}

function sendGroupNames() {
	for (let i = 0; i < hostConn.length; i++) {
		if (hostConn[i] && hostConn[i].open) {
			hostConn[i].send(["updateNames", players])
		} else {
			console.log('Connection is closed')
		}
	}
}
