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
		document.getElementById("play").innerHTML = "&#x25B6;"
		bass.pause()
		clarinet.pause()
		narration.pause()
		piano.pause()
		snaps.pause()
		bass.currentTime = bass.currentTime.toFixed(1)
		clarinet.currentTime = bass.currentTime
		narration.currentTime = bass.currentTime
		piano.currentTime = bass.currentTime
		snaps.currentTime = bass.currentTime
	}
	else {
		audioplay = true
		document.getElementById("play").innerHTML = "&#x23F8;"
	}
}

function setAudio(when) {
	document.getElementById("timeline").style = "background-image: -webkit-gradient( linear, left top, right top, color-stop(" + when/21680 + ", white), color-stop(0" + when/21680 + ", gray));"
}

let timeupdate = window.setInterval(function() {
	let time = document.getElementById("timeline")
	if (audioplay) {
		if (bass.readyState + clarinet.readyState + narration.readyState + piano.readyState + snaps.readyState == 20 ) {
			bass.play()
			clarinet.play()
			narration.play()
			piano.play()
			snaps.play()
			time.value = bass.currentTime * 10
			setAudio(time.value)
		}
		else {
			console.log("LOADING")
		}
		if (Math.round(bass.currentTime) != Math.round(clarinet.currentTime) || Math.round(bass.currentTime) != Math.round(piano.currentTime) || Math.round(bass.currentTime) != Math.round(snaps.currentTime)) {
			bass.pause()
			clarinet.pause()
			narration.pause()
			piano.pause()
			snaps.pause()
			bass.currentTime = bass.currentTime.toFixed(1)
			clarinet.currentTime = bass.currentTime
			narration.currentTime = bass.currentTime
			piano.currentTime = bass.currentTime
			snaps.currentTime = bass.currentTime
			console.log("FIXING TIME")
		}
	}
}, 500)

function startAudio(when) {
		bass.pause()
		clarinet.pause()
		narration.pause()
		piano.pause()
		snaps.pause()
		bass.currentTime = when/10
		clarinet.currentTime = bass.currentTime
		narration.currentTime = bass.currentTime
		piano.currentTime = bass.currentTime
		snaps.currentTime = bass.currentTime
}

