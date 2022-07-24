let name = localStorage.getItem("drawing-games-name")
let hostName = null
let peerID = null
let hostID = null
let peer = null
let conn = null

if (name) {console.log("my name is " + name)} else {location.href = "../index.html"}

function joinButton() {
	document.querySelector("#joinOrHost").classList.add("hidden")
	document.querySelector("#hostName").classList.remove("hidden")
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
	hostName = document.querySelector("#hostNameInput").value
	document.querySelector("#hostName").classList.add("hidden")
	hostID = hostName.toLowerCase().replace(/\s/g, '')
	joinHost()
}

function hostButton() {
	peerID = name.toLowerCase().replace(/\s/g, '')
	initializeHost()
}

function initializeHost() {
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
		conn = c
		console.log("Connected to: " + conn.peer)
		hostReady()
	})

	peer.on('disconnected', function () {
		console.log("Connection lost. Please reconnect")
	})
}

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

		// Check URL params for comamnds that should be sent immediately
		var command = getUrlParam("command");
		if (command)
		conn.send(command)
	})

	// Handle incoming data (messages only since this is the signal sender)
	conn.on('data', function (data) {
		console.log(data)
	})

	conn.on('close', function () {
		console.log("Connection closed")
	})
}

function hostReady() {
	conn.on('data', function (data) {
		console.log("Data recieved")
		console.log(data)
	})
	
	conn.on('close', function () {
		status.innerHTML = "Connection reset<br>Awaiting connection...";
		conn = null;
	})
}
