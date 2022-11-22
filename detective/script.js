let audioplay = false

window.onload = function() {
	let bass = document.getElementById("bass")
	let clarinet = document.getElementById("clarinet")
	let narration = document.getElementById("narration")
	let piano = document.getElementById("piano")
	let snaps = document.getElementById("snaps")
	
	bass.volume = 0.9;
	clarinet.volume = 0.9;
	narration.volume = 0.9;
	piano.volume = 0.9;
	snaps.volume = 0.9;
}

function playsound() {
	if (audioplay) {
		audioplay = false
		bass.pause()
		clarinet.pause()
		narration.pause()
		piano.pause()
		snaps.pause()	
		document.getElementById("play").innerHTML = "&#x25B6;"
	}
	else {
		audioplay = true
		bass.play()
		clarinet.play()
		narration.play()
		piano.play()
		snaps.play()
		document.getElementById("play").innerHTML = "&#x23F8;"
	}
}

function setAudio(when) {
	bass.currentTime = when
	clarinet.currentTime = when
	narration.currentTime = when
	piano.currentTime = when
	snaps.currentTime = when
	document.getElementById("timeline").style = "background-image: -webkit-gradient( linear, left top, right top, color-stop(" + clarinet.currentTime/2168 + ", white), color-stop(0" + clarinet.currentTime/2168 + ", gray));"
}

let timeupdate = window.setInterval(function() {
	let time = bass.currentTime.toFixed(1)
	if (clarinet.currentTime.toFixed(1) != time) {
		bass.pause()
		clarinet.pause()
		narration.pause()
		piano.pause()
		snaps.pause()
		bass.currentTime = (bass.currentTime.toFixed(1) - 0.4)
		clarinet.currentTime = bass.currentTime
		narration.currentTime = bass.currentTime
		piano.currentTime = bass.currentTime
		snaps.currentTime = bass.currentTime
		console.log("syncing")
	}
	else if (audioplay) {
		console.log("playing")
		bass.play()
		clarinet.play()
		narration.play()
		piano.play()
		snaps.play()
	}
	document.getElementById("timeline").value = time
	document.getElementById("timeline").style = "background-image: -webkit-gradient( linear, left top, right top, color-stop(" + time/2168 + ", white), color-stop(0" + time/2168 + ", gray));"
}, 500)

