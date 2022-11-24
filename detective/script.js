let audioplay = false
let basepage = location.href.split('#')[0]

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
	let chapter = location.href.split('#chapter')[1]
	let time = document.getElementById("timeline")
	if (chapter == "02") {
		setAudio(645)
		startAudio(645)
		time.value = 645
	}
	else if (chapter == "03") {
		setAudio(1635)
		startAudio(1635)
		time.value = 1635
	}
	else if (chapter == "04") {
		setAudio(2590)
		startAudio(2590)
		time.value = 2590
	}
	else if (chapter == "05") {
		setAudio(4859)
		startAudio(4859)
		time.value = 4859
	}
	else if (chapter == "06") {
		setAudio(5575)
		startAudio(5575)
		time.value = 5575
	}
	else if (chapter == "07") {
		setAudio(6743)
		startAudio(6743)
		time.value = 6743
	}
	else if (chapter == "08") {
		setAudio(9547)
		startAudio(9547)
		time.value = 9547
	}
	else if (chapter == "09") {
		setAudio(10875)
		startAudio(10875)
		time.value = 10875
	}
	else if (chapter == "10") {
		setAudio(12495)
		startAudio(12495)
		time.value = 12495
	}
	else if (chapter == "11") {
		setAudio(13345)
		startAudio(13345)
		time.value = 13345
	}
	else if (chapter == "12") {
		setAudio(13823)
		startAudio(13823)
		time.value = 13823
	}
	else if (chapter == "13") {
		setAudio(14985)
		startAudio(14985)
		time.value = 14985
	}
	else if (chapter == "14") {
		setAudio(15295)
		startAudio(15295)
		time.value = 15295
	}
	else if (chapter == "15") {
		setAudio(16077)
		startAudio(16077)
		time.value = 16077
	}
	else if (chapter == "16") {
		setAudio(16445)
		startAudio(16445)
		time.value = 16445
	}
	else if (chapter == "17") {
		setAudio(18085)
		startAudio(18085)
		time.value = 18085
	}
	else if (chapter == "18") {
		setAudio(18782)
		startAudio(18782)
		time.value = 18782
	}
	else if (chapter == "19") {
		setAudio(19600)
		startAudio(19600)
		time.value = 19600
	}
	else if (chapter == "20") {
		setAudio(20477)
		startAudio(20477)
		time.value = 20477
	}
	else if (chapter == "21") {
		setAudio(20847)
		startAudio(20847)
		time.value = 20847
	}
	else {
		setAudio(0)
		startAudio(0)
		time.value = 0
	}
	track_title()
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
			document.getElementById("play").innerHTML = "&#x23F8;"
		}
		else if (Math.round(bass.currentTime) == 2168 && audioplay){
			bass.currentTime = 0
			time.value = 0
			setAudio(0)
			playsound()
		}
		else {
			console.log("LOADING")
			document.getElementById("play").innerHTML = "<img src='https://www.wpfaster.org/wp-content/uploads/2013/06/loading-gif.gif'/>"
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
		track_title()
	}
}, 500)

function startAudio(when) {
	track_title()
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

function forwardtrack() {
	let time = document.getElementById("timeline")
	if (time.value < 645) {
		setAudio(645)
		startAudio(645)
		time.value = 645
	}
	else if (time.value < 1635) {
		setAudio(1635)
		startAudio(1635)
		time.value = 1635
	}
	else if (time.value < 2590) {
		setAudio(2590)
		startAudio(2590)
		time.value = 2590
	}
	else if (time.value < 4859) {
		setAudio(4859)
		startAudio(4859)
		time.value = 4859
	}
	else if (time.value < 5575) {
		setAudio(5575)
		startAudio(5575)
		time.value = 5575
	}
	else if (time.value < 6743) {
		setAudio(6743)
		startAudio(6743)
		time.value = 6743
	}
	else if (time.value < 9547) {
		setAudio(9547)
		startAudio(9547)
		time.value = 9547
	}
	else if (time.value < 10875) {
		setAudio(10875)
		startAudio(10875)
		time.value = 10875
	}
	else if (time.value < 12495) {
		setAudio(12495)
		startAudio(12495)
		time.value = 12495
	}
	else if (time.value < 13345) {
		setAudio(13345)
		startAudio(13345)
		time.value = 13345
	}
	else if (time.value < 13823) {
		setAudio(13823)
		startAudio(13823)
		time.value = 13823
	}
	else if (time.value < 14985) {
		setAudio(14985)
		startAudio(14985)
		time.value = 14985
	}
	else if (time.value < 15295) {
		setAudio(15295)
		startAudio(15295)
		time.value = 15295
	}
	else if (time.value < 16077) {
		setAudio(16077)
		startAudio(16077)
		time.value = 16077
	}
	else if (time.value < 16445) {
		setAudio(16445)
		startAudio(16445)
		time.value = 16445
	}
	else if (time.value < 18085) {
		setAudio(18085)
		startAudio(18085)
		time.value = 18085
	}
	else if (time.value < 18782) {
		setAudio(18782)
		startAudio(18782)
		time.value = 18782
	}
	else if (time.value < 19600) {
		setAudio(19600)
		startAudio(19600)
		time.value = 19600
	}
	else if (time.value < 20477) {
		setAudio(20477)
		startAudio(20477)
		time.value = 20477
	}
	else if (time.value < 20847) {
		setAudio(20847)
		startAudio(20847)
		time.value = 20847
	}
	else {
		audioplay = true
		bass.currentTime = 0
		time.value = 0
		setAudio(0)
		playsound()
	}
	track_title()
}

function backtrack() {
	let time = document.getElementById("timeline")
	if (time.value < 655) {
		setAudio(0)
		startAudio(0)
		time.value = 0
	}
	else if (time.value < 1645) {
		setAudio(645)
		startAudio(645)
		time.value = 645
	}
	else if (time.value < 2600) {
		setAudio(1635)
		startAudio(1635)
		time.value = 1635
	}
	else if (time.value < 4869) {
		setAudio(2590)
		startAudio(2590)
		time.value = 2590
	}
	else if (time.value < 5585) {
		setAudio(4859)
		startAudio(4859)
		time.value = 4859
	}
	else if (time.value < 6753) {
		setAudio(5575)
		startAudio(5575)
		time.value = 5575
	}
	else if (time.value < 9557) {
		setAudio(6743)
		startAudio(6743)
		time.value = 6743
	}
	else if (time.value < 10885) {
		setAudio(9547)
		startAudio(9547)
		time.value = 9547
	}
	else if (time.value < 12505) {
		setAudio(10875)
		startAudio(10875)
		time.value = 10875
	}
	else if (time.value < 13355) {
		setAudio(12495)
		startAudio(12495)
		time.value = 12495
	}
	else if (time.value < 13833) {
		setAudio(13345)
		startAudio(13345)
		time.value = 13345
	}
	else if (time.value < 14995) {
		setAudio(13823)
		startAudio(13823)
		time.value = 13823
	}
	else if (time.value < 15305) {
		setAudio(14985)
		startAudio(14985)
		time.value = 14985
	}
	else if (time.value < 16087) {
		setAudio(15295)
		startAudio(15295)
		time.value = 15295
	}
	else if (time.value < 16455) {
		setAudio(16077)
		startAudio(16077)
		time.value = 16077
	}
	else if (time.value < 18095) {
		setAudio(16445)
		startAudio(16445)
		time.value = 16445
	}
	else if (time.value < 18792) {
		setAudio(18085)
		startAudio(18085)
		time.value = 18085
	}
	else if (time.value < 19610) {
		setAudio(18782)
		startAudio(18782)
		time.value = 18782
	}
	else if (time.value < 20487) {
		setAudio(19600)
		startAudio(19600)
		time.value = 19600
	}
	else if (time.value < 20857) {
		setAudio(20477)
		startAudio(20477)
		time.value = 20477
	}
	else {
		setAudio(20857)
		startAudio(20847)
		time.value = 20847	
	}
	track_title()
}

function track_title() {
	let time = document.getElementById("timeline")
	let title = document.getElementById("track-title")
	if (time.value < 645) {
		title.innerHTML = "Chapter 01: Doing big things? You figure that one out."
		location.href = basepage + "#chapter01"
	}
	else if (time.value < 1635) {
		title.innerHTML = "Chapter 02: \"Not too busy to see me!\""
		location.href = basepage + "#chapter02"
	}
	else if (time.value < 2590) {
		title.innerHTML = "Chapter 03: \"I got an idea that you know something, Miss Rillette.\""
		location.href = basepage + "#chapter03"
	}
	else if (time.value < 4859) {
		title.innerHTML = "Chapter 04: He knew he was going to have trouble with this girl."
		location.href = basepage + "#chapter04"
	}
	else if (time.value < 5575) {
		title.innerHTML = "Chapter 05: He had close-cropped blond hair and pretty blue eyes and he was a very tough boy."
		location.href = basepage + "#chapter05"
	}
	else if (time.value < 6743) {
		title.innerHTML = "Chapter 06: When he saw them he expected them to walk right by. But they came up to him."
		location.href = basepage + "#chapter06"
	}
	else if (time.value < 9547) {
		title.innerHTML = "Chapter 07: \"You reasoned that you might be able to make up for the deficiency by a few transactions with the modern boys and girls\""
		location.href = basepage + "#chapter07"
	}
	else if (time.value < 10875) {
		title.innerHTML = "Chapter 08: The cigarette fell from his mouth. He stepped on the stub and said, \"We'll have lunch and then we'll visit another party.\""
		location.href = basepage + "#chapter08"
	}
	else if (time.value < 12495) {
		title.innerHTML = "Chapter 09: \"You've been friends with Harry for a long time, Miss Hennifer.\""
		location.href = basepage + "#chapter09"
	}
	else if (time.value < 13345) {
		title.innerHTML = "Chapter 10: \"She hated him. But your feelings were even stronger. It was your kind of hate that turned to murder.\""
		location.href = basepage + "#chapter10"
	}
	else if (time.value < 13823) {
		title.innerHTML = "Chapter 11: He put his hand in his change pocket and took out two half dollars, three quarters, six dimes, four nickels."
		location.href = basepage + "#chapter11"
	}
	else if (time.value < 14985) {
		title.innerHTML = "Chapter 12: A cab was waiting at the curb and Daisy got in. The coupe followed."
		location.href = basepage + "#chapter12"
	}
	else if (time.value < 15295) {
		title.innerHTML = "Chapter 13: Then he was moving slowly and very quietly as he heard voices coming from the other pale orange room."
		location.href = basepage + "#chapter13"
	}
	else if (time.value < 16077) {
		title.innerHTML = "Chapter 14: Then they started to argue and Frey got in on it."
		location.href = basepage + "#chapter14"
	}
	else if (time.value < 16445) {
		title.innerHTML = "Chapter 15: \"You killed him! You had every reason to kill him, and you did it!\""
		location.href = basepage + "#chapter15"
	}
	else if (time.value < 18085) {
		title.innerHTML = "Chapter 16: \"You've got a lot of influence around this town, haven't you, Daisy?\""
		location.href = basepage + "#chapter16"
	}
	else if (time.value < 18782) {
		title.innerHTML = "Chapter 17: The cases would come in thick and fast, and so would the dough."
		location.href = basepage + "#chapter17"
	}
	else if (time.value < 19600) {
		title.innerHTML = "Chapter 18: There were a lot of cops up there, a lot of plain clothes men and lads from the homicide bureau. Reporters and photographers and a doctor."
		location.href = basepage + "#chapter18"
	}
	else if (time.value < 20477) {
		title.innerHTML = "Chapter 19: \"Look at him. He's dead! Do you get that? He‘s dead!\""
		location.href = basepage + "#chapter19"
	}
	else if (time.value < 20847) {
		title.innerHTML = "Chapter 20: \"I can well imagine what happened to that wise-guy Frey\""
		location.href = basepage + "#chapter20"
	}
	else {
		title.innerHTML = "Chapter 21: \"At least we pinned something on somebody.\""
		location.href = basepage + "#chapter21"
	}
}

