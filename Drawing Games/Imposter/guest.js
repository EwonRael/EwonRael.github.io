let authReady = null

function initializeGuest() {
	// Kick off anonymous sign-in as soon as "Join" is clicked, so it's
	// already warmed up by the time the host's name is entered.
	authReady = initSync()
}

function joinHost() {
	gameId = hostID

	;(authReady || initSync()).then(function () {
		return gameRef("meta").once("value")
	}).then(function (snap) {
		if (snap.val() === null) {
			throw new Error("no such game")
		}
		return joinRoster(name, false)
	}).then(function (slot) {
		playerNumber = slot
		listenStatus()
	}).catch(function (err) {
		console.log("Couldn't join: " + err)
		if (err && err.message && err.message.indexOf("already started") !== -1) {
			alert(err.message)
		} else {
			alert('I can\'t find a host by the name "' + hostName + '"')
		}
		history.back()
	})
}
