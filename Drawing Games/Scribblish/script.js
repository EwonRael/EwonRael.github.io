let name = localStorage.getItem("drawing-games-name")
let hostName = null
let peerID = null
let hostID = null
let peer = null
let conn = null
let hostConn = []
let players = []
let isHost = false
let playerNumber = 0

//name = "Owen Earl"

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
	document.querySelector("#lobby").classList.remove("hidden")
	hostID = hostName.toLowerCase().replace(/\s/g, '')
	joinHost()
}

function hostButton() {
	peerID = name.toLowerCase().replace(/\s/g, '')
	document.querySelector("#joinOrHost").classList.add("hidden")
	document.querySelector("#lobby").classList.remove("hidden")
	initializeHost()
}

function startGamePlz() {
	if (isHost) {
		startGame()
	}
	
	else {
		conn.send("Let's Play!")
		console.log("let's play?")
	}
}
