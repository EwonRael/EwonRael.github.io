let mastersolved = localStorage.getItem("crossword-mastersolved")
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

//Functions related to gameplay

function deselect() {
	canedit = false
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
	if (currentselect == n) {
		if (across) {
			across = false
		}
		else {
			across = true
		}
	}
	changeSelect(n)
	if (document.getElementById(currentselect).innerHTML == "&emsp;") {
		document.getElementById("dummyinput").value = " "
	}
	else {
		document.getElementById("dummyinput").value = document.getElementById(currentselect).innerHTML
	}
}

function changeSelect(n) {
	//do this to bring up keyboard on mobile
	document.getElementById("dummyinput").focus()
	//Start the timer if it's not already started!
	if (starttime == 0) {
		starttime = new Date().getTime()
	}
	//Highligh row or colum
	if (across) {
		document.getElementById("crossword").classList.add("across" + (Math.trunc((n-1)/5)+1))
		document.getElementById("across").classList.add("across" + (Math.trunc((n-1)/5)+1))
	}
	else {
		document.getElementById("crossword").classList.add("down" + (n%5))
		document.getElementById("down").classList.add("down" + (n%5))
	}
	//Highlight Square
	document.getElementById(n).classList.add("focus")
	currentselect = n
	canedit = true
	checkCrossword()
}

function clue(a,b) {
	across = b
	changeSelect(a)
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
	localStorage.setItem("crossword-mastersolved", JSON.stringify(mastersolved))
}

function checkCrossword() {
	if (solved == false) {
		let current = ""
		for (let i = 1; i < 26; i++) {
			let square = document.getElementById(i)
			current = current + square.innerHTML.replace("<br>","").replace("&nbsp;","?").slice(0, 1).toLowerCase()
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
			console.log(mastersolved)
			localStorage.setItem("crossword-mastersolved", JSON.stringify(mastersolved))
			let seconds = Math.round((new Date().getTime() - starttime) / 1000)
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
	}
}

function dummyinput(i) {
	if (firefoxmobilefix) {
	let inVal = document.getElementById("dummyinput").value
	inVal = inVal.slice(-1)
	document.getElementById("dummyinput").value = inVal
	if (canedit && inVal == "") {
		document.getElementById(currentselect).innerHTML = "&emsp;"
		decline()
		document.getElementById("dummyinput").value = " "
	}
	else if (canedit && letters.includes(inVal.toLowerCase())) {
		document.getElementById(currentselect).innerHTML = inVal.toLowerCase()
		advance()
		document.getElementById("dummyinput").value = document.getElementById(currentselect).innerHTML
	}
	else if (canedit && inVal == " ") {
		document.getElementById(currentselect).innerHTML = "&emsp;"
		advance()
		document.getElementById("dummyinput").value = " "
	}
	if (document.getElementById("dummyinput").value == "") {
		document.getElementById("dummyinput").value = " "
	}
	setInterval(function(){firefoxmobilefix = true},1000)
	}
	firefoxmobilefix = false
}
