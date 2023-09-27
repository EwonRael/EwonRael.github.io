let mastersolved = localStorage.getItem("crossword2-mastersolved")
let settingsc = localStorage.getItem("crossword-settings")
let currentselect = 0
let canedit = false
let across = true
let solved = false
let starttime = 0
let letters = "abcdefghijklmnopqrstuvwxyz"
let firefoxmobilefix = true

//Check master list of solved crosswords, if it doesn't exsist make one.
if (mastersolved) {
	mastersolved = JSON.parse(mastersolved)
}

else {
	mastersolved = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
}

//Check settings, if it doesn't exsist make one.
if (settingsc) {
	settingsc = JSON.parse(settingsc)
}

else {
	settingsc = [true, false, false]
}

//Functions related to gameplay

function deselect() {
	canedit = false
	document.getElementById("mobilePreview").classList.add("invisable")
	document.getElementById("backbutton").classList.remove("fade")
	document.getElementById("settings").classList.remove("fade")
	for (let i = 1; i < 26; i++) {
		document.getElementById(i).classList.remove("focus")
	}
	for (let i = 1; i < 6; i++) {
		document.getElementById("crossword").classList.remove("across" + i)
		document.getElementById("crossword").classList.remove("down" + (i - 1))
		document.getElementById("across").classList.remove("across" + i)
		document.getElementById("down").classList.remove("down" + (i - 1))
	}
}

function select(n) {
	if (solved == false) {
		if (currentselect == n) {
			if (across) {
				across = false
			}
			else {
				across = true
			}
		}
		changeSelect(n)
		if (document.getElementById(n).classList.contains("solved")){
			advance()
		}
	}
}

function changeSelect(n) {
	//do this to bring up keyboard on mobile
	document.getElementById("dummyinput").value = " "
	document.getElementById("dummyinput").focus()
	document.getElementById("dummyinput").setSelectionRange(1,1)
	//Start the timer if it's not already started!
	if (starttime == 0) {
		starttime = new Date().getTime()
	}
	//Highligh row or colum
	if (across) {
		document.getElementById("crossword").classList.add("across" + (Math.trunc((n-1)/5)+1))
		document.getElementById("across").classList.add("across" + (Math.trunc((n-1)/5)+1))
		document.getElementById("previewBox").innerHTML  = document.querySelector("#across :nth-child("+(Math.trunc((n-1)/5)+2)+")").innerHTML
	}
	else {
		document.getElementById("crossword").classList.add("down" + (n%5))
		document.getElementById("down").classList.add("down" + (n%5))
		if (n%5 == 0) {
			document.getElementById("previewBox").innerHTML = document.querySelector("#down :nth-child("+6+")").innerHTML
		}
		else {
			document.getElementById("previewBox").innerHTML = document.querySelector("#down :nth-child("+(n%5 + 1)+")").innerHTML
		}
	}
	//Highlight Square
	document.getElementById(n).classList.add("focus")
	document.getElementById("mobilePreview").classList.remove("invisable")
	document.getElementById("backbutton").classList.add("fade")
	document.getElementById("settings").classList.add("fade")
	currentselect = n
	canedit = true
	checkCrossword()
}

function clue(a,b) {
	if (solved == false) {
		across = b
		changeSelect(a)
	}
}

function advance() {
	if (across) {
		deselect()
		if (currentselect == 25) {
			changeSelect(1)
		}
		else {
			changeSelect(currentselect + 1)
		}
	}
	else {
		deselect()
		if (currentselect == 25) {
			changeSelect(1)
		}
		else if (currentselect > 20) {
			changeSelect(currentselect - 19)
		}
		else {
			changeSelect(currentselect + 5)
		}
	}
	while (document.getElementById(currentselect).classList.contains("solved") && (solved == false)) {
	if (across) {
		deselect()
		if (currentselect == 25) {
			changeSelect(1)
		}
		else {
			changeSelect(currentselect + 1)
		}
	}
	else {
		deselect()
		if (currentselect == 25) {
			changeSelect(1)
		}
		else if (currentselect > 20) {
			changeSelect(currentselect - 19)
		}
		else {
			changeSelect(currentselect + 5)
		}
	}
	}
}

function decline() {
	if (across) {
		deselect()
		if (currentselect == 1) {
			changeSelect(1)
		}
		if (currentselect%5 == 1) {
			changeSelect(currentselect)
		}
		else {
			changeSelect(currentselect - 1)
		}
	}
	else {
		deselect()
		if (currentselect == 1) {
			changeSelect(1)
		}
		if (currentselect < 6) {
			changeSelect(currentselect)
		}
		else {
			changeSelect(currentselect - 5)
		}
	}
}

document.addEventListener('keydown', function(e) {
	if (canedit && e.key == "ArrowRight") {
		deselect()
		if (currentselect == 25) {
			changeSelect(1)
		}
		else {
			changeSelect(currentselect + 1)
		}
	}
	if (canedit && e.key == "ArrowDown") {
		deselect()
		if (currentselect == 25) {
			changeSelect(1)
		}
		else if (currentselect > 20) {
			changeSelect(currentselect - 19)
		}
		else {
			changeSelect(currentselect + 5)
		}
	}
	if (canedit && e.key == "ArrowLeft") {
		deselect()
		if (currentselect == 1) {
			changeSelect(25)
		}
		else {
			changeSelect(currentselect - 1)
		}
		setTimeout(function(){document.getElementById("dummyinput").setSelectionRange(1,1)},1)
	}
	if (canedit && e.key == "ArrowUp") {
		deselect()
		if (currentselect == 1) {
			changeSelect(25)
		}
		else if (currentselect < 6) {
			changeSelect(currentselect + 19)
		}
		else {
			changeSelect(currentselect - 5)
		}
	}
})

window.onload = function() {
	if (mastersolved[crossnum]) {
		solved = true
		for (let i = 1; i < 26; i++) {
			let square = document.getElementById(i)
			square.contentEditable = false
			square.innerHTML = goal[i-1]
			square.classList.add("solved")
		}
		for (let i = 1; i < 6; i++) {
			document.getElementById("across").children[i].classList.add("solved")
			document.getElementById("down").children[i].classList.add("solved")
		}
		document.getElementById("solved").classList.remove("invisable")
	}
}

function redo() {
	starttime = 0
	solved = false
	for (let i = 1; i < 6; i++) {
		document.getElementById("across").children[i].classList.remove("solved")
		document.getElementById("down").children[i].classList.remove("solved")
	}
	for (let i = 1; i < 26; i++) {
		let square = document.getElementById(i)
		square.innerHTML = "&emsp;"
		square.classList.remove("solved")
	}
	document.getElementById("solved").classList.add("invisable")
	mastersolved[crossnum] = false
	localStorage.setItem("crossword2-mastersolved", JSON.stringify(mastersolved))
}

function checkCrossword() {
	if (solved == false) {
		let current = ""
		for (let i = 1; i < 26; i++) {
			let square = document.getElementById(i)
			current = current + square.innerHTML.replace("<br>","").replace("&nbsp;","?").slice(0, 1).toLowerCase()
			if (square.classList.contains("solved")) {
				square.innerHTML = goal[i-1]
			}
		}
		if (current == goal) {
			for (let i = 1; i < 26; i++) {
				let square = document.getElementById(i)
				square.contentEditable = false
				square.classList.add("solved")
			}
			for (let i = 1; i < 6; i++) {
				document.getElementById("across").children[i].classList.add("solved")
				document.getElementById("down").children[i].classList.add("solved")
			}
			deselect()
			document.getElementById("solved").classList.remove("invisable")
			mastersolved[crossnum] = true
			solved = true
			console.log(mastersolved)
			localStorage.setItem("crossword2-mastersolved", JSON.stringify(mastersolved))
			let seconds = Math.round((new Date().getTime() - starttime) / 1000)
			if (settingsc[0]) {
				if (seconds < 61) {
					document.getElementById("timer").innerHTML = "It took you " + seconds + " seconds!"
				}
				else if (seconds < 120) {
					console.log(seconds)
					document.getElementById("timer").innerHTML = "It took you 1 minute and " + seconds%60 + " seconds!"
				}
				else {
					document.getElementById("timer").innerHTML = "It took you " + Math.floor(seconds/60) + " minutes and " + seconds%60 + " seconds!"
				}
			}
			else {
				document.getElementById("timer").innerHTML = ""
			}
		}
		if (settingsc[1] && (solved == false)) {
			for (let i = 0; i < 5; i++) {
				if ((current[i] + current[i + 5] + current[i + 10] + current[i + 15] + current[i + 20]) == (goal[i] + goal[i + 5] + goal[i + 10] + goal[i + 15] + goal[i + 20])) {
					document.getElementById(i + 1).classList.add("solved")
					document.getElementById(i + 11).classList.add("solved")
					document.getElementById(i + 16).classList.add("solved")
					document.getElementById(i + 21).classList.add("solved")
					document.getElementById(i + 6).classList.add("solved")
				}
				if ((current[i*5] + current[i*5 + 1] + current[i*5 + 2] + current[i*5 + 3] + current[i*5 + 4]) == (goal[i*5] + goal[i*5 + 1] + goal[i*5 + 2] + goal[i*5 + 3] + goal[i*5 + 4])) {
					document.getElementById(i*5 + 1).classList.add("solved")
					document.getElementById(i*5 + 2).classList.add("solved")
					document.getElementById(i*5 + 3).classList.add("solved")
					document.getElementById(i*5 + 4).classList.add("solved")
					document.getElementById(i*5 + 5).classList.add("solved")
				}
			}
		}
		if (settingsc[2] && (solved == false)) {
			for (let i = 0; i < 25; i++) {
				if (goal[i] == current[i]) {
					document.getElementById(i + 1).classList.add("solved")
				}
			}
		}
	}
}

function dummyinput(i) {
	let inVal = document.getElementById("dummyinput").value
	inVal = inVal.slice(-1)
	document.getElementById("dummyinput").value = inVal
	if (firefoxmobilefix && canedit && inVal == "") {
		if (letters.includes(document.getElementById(currentselect).innerHTML)) {
			document.getElementById(currentselect).innerHTML = "&emsp;"
			setTimeout(function(){firefoxmobilefix = true
			document.getElementById("dummyinput").value = " "},10)
		}
		else {
			setTimeout(function(){decline(); firefoxmobilefix = true
			document.getElementById("dummyinput").value = " "
			document.getElementById(currentselect).innerHTML = "&emsp;"},10)
		}
	}
	else if (firefoxmobilefix && canedit && inVal == " ") {
		document.getElementById(currentselect).innerHTML = "&emsp;"
		setTimeout(function(){advance(); firefoxmobilefix = true},10)
		//document.getElementById("dummyinput").value = " "
	}
	else if (firefoxmobilefix && canedit && letters.includes(inVal.slice(-1).toLowerCase())) {
		document.getElementById(currentselect).innerHTML = inVal.toLowerCase()
		setTimeout(function(){advance(); firefoxmobilefix = true},10)
	}
	else {
		setTimeout(function(){firefoxmobilefix = true},10)
	}
	firefoxmobilefix = false
}

function opensettings() {
	document.getElementById("settingbox").classList.remove("invisable")
	if (settingsc[0]) {
		document.querySelector("#settingbox :nth-child(2)").innerHTML = "&#x2612; timer"
	}
	if (settingsc[1]) {
		document.querySelector("#settingbox :nth-child(3)").innerHTML = "&#x2612; highlight correct words"
	}
	if (settingsc[2]) {
		document.querySelector("#settingbox :nth-child(4)").innerHTML = "&#x2612; highlight correct letters"
	}
}

function settings(m,n) {
	if (settingsc[n]) {
		settingsc[n] = false
		m.innerHTML = m.innerHTML.replace("\☒","\☐")
	} 
	else {
		settingsc[n] = true
		m.innerHTML = m.innerHTML.replace("\☐","\☒")
	}
	localStorage.setItem("crossword-settings", JSON.stringify(settingsc))
}
