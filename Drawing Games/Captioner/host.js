function initializeHost() {
	isHost = true
	hostID = name.toLowerCase().replace(/\s/g, '')
	gameId = hostID

	initSync().then(function () {
		return createGame()
	}).then(function () {
		return joinRoster(name, true)
	}).then(function (slot) {
		playerNumber = slot
		listenCompletedStories()
		listenStatus()
	}).catch(function (err) {
		console.log("Couldn't start hosting: " + err)
		alert("Something went wrong setting up the game. Check your connection and try again.")
	})
}
