let mastersolved = false
let currentselect = 0
let canedit = false
let across = true
let solved = false
let starttime = 0
let letters = "abcdefghijklmnopqrstuvwxyz"
let firefoxmobilefix = true
let numsquares = 0
let numrows = 0
let numcols = 0
let numwordsacross = 0
let numwordsdown = 0
let timer = ""
let downorder = []

//Functions related to gameplay

function deselect() {
	canedit = false
	document.getElementById("mobilePreview").classList.add("invisable")
	document.getElementById("previewBox").innerHTML = ""
	for (let i = 1; i < (numsquares + 1); i++) {
		document.getElementById("crossword-square-"+i).classList.remove("focus")
		document.getElementById("crossword-square-"+i).classList.remove("highlight")
	}
	for (let i = 1; i < (numwordsacross + 1); i++) {
		document.querySelector("#crossword-clues-across :nth-child(" + i + ")").classList.remove("highlight")
	}
	for (let i = 1; i < (numwordsdown + 1); i++) {
		document.querySelector("#crossword-clues-down :nth-child(" + i + ")").classList.remove("highlight")
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
		currentselect = n
		if (document.getElementById("crossword-square-"+currentselect).classList.contains("solved")){
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
		for (let i = 1; i < (numwordsacross + 1); i++) {
			if (document.getElementById("crossword-square-"+n).classList.contains("crossword-across-" + i)) {
				document.querySelectorAll(".crossword-across-" + i).forEach(square => {
					square.classList.add("highlight")
				})
				document.querySelector("#crossword-clues-across :nth-child(" + i + ")").classList.add("highlight")
				document.getElementById("previewBox").innerHTML = document.querySelector("#crossword-clues-across :nth-child(" + i + ")").innerHTML
			}
		}
	}
	else {
		for (let i = 1; i < (numwordsdown + 1); i++) {
			if (document.getElementById("crossword-square-"+n).classList.contains("crossword-down-" + i)) {
				document.querySelectorAll(".crossword-down-" + i).forEach(square => {
					square.classList.add("highlight")
				})
				document.querySelector("#crossword-clues-down :nth-child(" + (Number(downorder.indexOf(i)) + 1) + ")").classList.add("highlight")
				document.getElementById("previewBox").innerHTML = document.querySelector("#crossword-clues-down :nth-child(" + (Number(downorder.indexOf(i)) + 1) + ")").innerHTML
			}
		}
	}
	//Highlight Square
	currentselect = n
	document.getElementById("crossword-square-"+currentselect).classList.add("focus")
	document.getElementById("mobilePreview").classList.remove("invisable")
	canedit = true
	checkCrossword()
}

function clickclue(a,b) {
	if (solved == false) {
		across = a
		if (across) {
			changeSelect(document.querySelector(".crossword-across-"+b).id.replace(/\D/g, ""))
		}
		else {
			let frfrfrfr = document.querySelector(".crossword-down-"+downorder[b-1]).id.replace(/\D/g, "")
			changeSelect(frfrfrfr)
		}
	}
}

function advance() {
	if (across) {
		deselect()
		if (currentselect == numsquares) {
			changeSelect(1)
		}
		else {
			changeSelect(Number(currentselect)+1)
		}
	}
	else {
		deselect()
		if (currentselect == numsquares) {
			changeSelect(1)
		}
		else if (currentselect > (numsquares - numcols)) {
			changeSelect(Number(currentselect) + 1 - (numsquares - numcols))
		}
		else {
			changeSelect(Number(currentselect) + numcols)
		}
	}
	while (document.getElementById("crossword-square-"+currentselect).classList.contains("solved") && (solved == false)) {
	if (across) {
		deselect()
		if (currentselect == numsquares) {
			changeSelect(1)
		}
		else {
			changeSelect(Number(currentselect) + 1)
		}
	}
	else {
		deselect()
		if (currentselect == numsquares) {
			changeSelect(1)
		}
		else if (currentselect > (numsquares - numcols)) {
			changeSelect(Number(currentselect) + 1 - (numsquares - numcols))
		}
		else {
			changeSelect(Number(currentselect) + numcols)
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
		if (currentselect%numcols == 1) {
			changeSelect(currentselect)
		}
		else {
			changeSelect(Number(currentselect) - 1)
		}
	}
	else {
		deselect()
		if (currentselect == 1) {
			changeSelect(1)
		}
		if (currentselect <= numcols) {
			changeSelect(currentselect)
		}
		else {
			changeSelect(Number(currentselect) - numcols)
		}
	}
	while (document.getElementById("crossword-square-"+currentselect).classList.contains("solved") && (solved == false)) {
	if (across) {
		deselect()
		if (currentselect == 1) {
			changeSelect(1)
		}
		if (currentselect%numcols == 1) {
			changeSelect(currentselect)
		}
		else {
			changeSelect(Number(currentselect) - 1)
		}
	}
	else {
		deselect()
		if (currentselect == 1) {
			changeSelect(1)
		}
		if (currentselect <= numcols) {
			changeSelect(currentselect)
		}
		else {
			changeSelect(Number(currentselect) - numcols)
		}
	}
	}
}

window.onload = function() {

	//Check to see if the length of the goal matches the crossword dementions
	numsquares = document.querySelectorAll("#crossword tr td").length
	numrows = document.querySelectorAll("#crossword tr").length
	numcols = numsquares/numrows
	if (goal.length != numsquares) {
		alert("THIS GRIDE DOES NOT MATCH THE CROSSWORD GOAL!")
	}
	//Add ids to squares and blackout the black squares
	for (let i = 1; i < (numsquares + 1); i++) {
		document.querySelectorAll("#crossword tr td")[i - 1].setAttribute("id","crossword-square-"+i)
		document.querySelectorAll("#crossword tr td")[i - 1].setAttribute("onclick","select('"+i+"')")
		document.getElementById("crossword-square-"+i).innerHTML = "&emsp;"
		if (goal[i-1] == "#") {
			document.getElementById("crossword-square-"+i).classList.add("black")
			document.getElementById("crossword-square-"+i).classList.add("solved")
			document.getElementById("crossword-square-"+i).innerHTML = "#"
		}
	}
	//Add word classes to across words
	for (let i = 1; i < (numsquares + 1); i++) {
		if (i%numcols == 1) {
			numwordsacross = numwordsacross + 1
		}
		if ((document.getElementById("crossword-square-"+i).classList.contains("black")) && (i%numcols != 1) &&(document.getElementById("crossword-square-"+(i-1)).classList.contains("black") == false)) {
			numwordsacross = numwordsacross + 1
		}
		if ((document.getElementById("crossword-square-"+i).classList.contains("black")) == false) {
			if (i%numcols == 1 && document.getElementById("crossword-square-"+(i+1)).classList.contains("black")) {
				numwordsacross = numwordsacross - 1
			}
			else if (document.getElementById("crossword-square-"+(i-1))) {
				if (document.getElementById("crossword-square-"+(i-1)).classList.contains("black") == 1 && document.getElementById("crossword-square-"+(i+1)).classList.contains("black")) {
					numwordsacross = numwordsacross - 1
				}
				else if (document.getElementById("crossword-square-"+(i-1)).classList.contains("black") == 1 && (i%numcols == 0)) {
					numwordsacross = numwordsacross - 1
				}
				else {
					document.getElementById("crossword-square-"+i).classList.add("crossword-across-" + numwordsacross)
				}
			}
			else {
				document.getElementById("crossword-square-"+i).classList.add("crossword-across-" + numwordsacross)
			}
		}
	}
	//Add words classes to down words
	for (let i = 1; i < (numcols + 1); i++) {
		numwordsdown = numwordsdown + 1
		for (let j = 0; j < numrows; j++) {
			let sqr = document.getElementById("crossword-square-" + (numcols*j + i))
			let lastsqr = document.getElementById("crossword-square-" + (numcols*(j - 1) + i))
			let nextsqr = document.getElementById("crossword-square-" + (numcols*(j + 1) + i))
			if (sqr.classList.contains("black") == false) {
				if (lastsqr && nextsqr) {
					if ((lastsqr.classList.contains("black")) && (nextsqr.classList.contains("black") == false)){
						numwordsdown = numwordsdown + 1
						sqr.classList.add("crossword-down-" + numwordsdown)
					}
					if (lastsqr.classList.contains("black") == false) {
						sqr.classList.add("crossword-down-" + numwordsdown)
					}
				}
				else if (lastsqr) {
					if (lastsqr.classList.contains("black") == false) {
						sqr.classList.add("crossword-down-" + numwordsdown)
					}
				}
				else if (nextsqr) {
					if (nextsqr.classList.contains("black") == false) {
						sqr.classList.add("crossword-down-" + numwordsdown)
					}
					else {
						numwordsdown = numwordsdown - 1
					}
				}
			}
		}		
	}
	//make down order
	for (let i = 1; i < (numsquares + 1); i++) {
		for (let j = 1; j < (numwordsdown + 1); j++) {
			if (document.getElementById("crossword-square-" + i).classList.contains("crossword-down-" + j)) {
				if (downorder.includes(j) == false) {
					downorder.push(j)
				}
			}
		}
	}
	//Create dummy element for typing to go into
	document.getElementById("crossword").insertAdjacentHTML("beforebegin", "<input id='dummyinput' onfocusout='deselect()' oninput='dummyinput()'>")
	document.getElementById("dummyinput").style = "position: absolute; cursor: default; width: 0; height: 0; opacity: 0"
	//Add functions to clues
	for (let i = 1; i < (numwordsacross + 1); i++) {
		document.querySelector("#crossword-clues-across :nth-child(" + i + ")").setAttribute("onclick","clickclue(true,"+i+")")
	}
	for (let i = 1; i < (numwordsdown + 1); i++) {
		document.querySelector("#crossword-clues-down :nth-child(" + i + ")").setAttribute("onclick","clickclue(false,"+i+")")
	}
	//Check to see if the crossword's been solved
	if (mastersolved) {
		solved = true
		for (let i = 1; i < (numsquares + 1); i++) {
			let square = document.getElementById(i)
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
	for (let i = 0; i < numwordsacross; i++) {
		document.getElementById("crossword-clues-across").children[i].classList.remove("solved")
	}
	for (let i = 0; i < numwordsdown; i++) {
		document.getElementById("crossword-clues-down").children[i].classList.remove("solved")
	}
	for (let i = 1; i < (numsquares + 1); i++) {
		let square = document.getElementById("crossword-square-"+i)
		square.innerHTML = "&emsp;"
		square.classList.remove("solved")
	}
	mastersolved = false
}

function checkCrossword() {
	if (solved == false) {
		let current = ""
		for (let i = 1; i < (numsquares + 1); i++) {
			let square = document.getElementById("crossword-square-"+i)
			current = current + square.innerHTML.replace("<br>","").replace("&nbsp;","?").slice(0, 1).toLowerCase()
		}
		if (current == goal) {
			for (let i = 1; i < (numsquares + 1); i++) {
				let square = document.getElementById("crossword-square-"+i)
				square.classList.add("solved")
			}
			for (let i = 0; i < numwordsacross; i++) {
				document.getElementById("crossword-clues-across").children[i].classList.add("solved")
			}
			for (let i = 0; i < numwordsdown; i++) {
				document.getElementById("crossword-clues-down").children[i].classList.add("solved")
			}
			deselect()
			mastersolved = true
			solved = true
			let seconds = Math.round((new Date().getTime() - starttime) / 1000)
			if (settingsc[0]) {
				if (seconds < 61) {
					timer = "It took you " + seconds + " seconds!"
				}
				else if (seconds < 120) {
					timer = "It took you 1 minute and " + seconds%60 + " seconds!"
				}
				else {
					timer = "It took you " + Math.floor(seconds/60) + " minutes and " + seconds%60 + " seconds!"
				}
			}
			else {
				timer = ""
			}
			crosswordsolved()
		}
		if (settingsc[1] && (solved == false)) {
			for (let i = 0; i < numwordsacross; i++) {
				let wordsolve = true
				document.querySelectorAll(".crossword-across-"+(i+1)).forEach(square => {
					if (goal[(square.id.replace(/\D/g, ""))-1] != square.innerHTML) {
						wordsolve = false
					}
				})
				if (wordsolve) {
					document.querySelectorAll(".crossword-across-"+(i+1)).forEach(square => {
						square.classList.add("solved")
					})	
					document.querySelector("#crossword-clues-across :nth-child(" + (i+1) + ")").classList.add("solved")
				}
			}
			for (let i = 0; i < numwordsdown; i++) {
				let wordsolve = true
				document.querySelectorAll(".crossword-down-"+(i+1)).forEach(square => {
					if (goal[(square.id.replace(/\D/g, ""))-1] != square.innerHTML) {
						wordsolve = false
					}
				})
				if (wordsolve) {
					document.querySelectorAll(".crossword-down-"+(i+1)).forEach(square => {
						square.classList.add("solved")
					})
					document.querySelector("#crossword-clues-down :nth-child(" + (downorder.indexOf(i+1)+1) + ")").classList.add("solved")	
				}
			}
		}
		if (settingsc[2] && (solved == false)) {
			for (let i = 0; i < numsquares; i++) {
				if (goal[i] == current[i]) {
					document.getElementById("crossword-square-"+(i + 1)).classList.add("solved")
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
		if (letters.includes(document.getElementById("crossword-square-"+currentselect).innerHTML)) {
			document.getElementById("crossword-square-"+currentselect).innerHTML = "&emsp;"
			setTimeout(function(){firefoxmobilefix = true
			document.getElementById("dummyinput").value = " "},10)
		}
		else {
			setTimeout(function(){decline(); firefoxmobilefix = true
			document.getElementById("dummyinput").value = " "
			document.getElementById("crossword-square-"+currentselect).innerHTML = "&emsp;"},10)
		}
	}
	else if (firefoxmobilefix && canedit && inVal == " ") {
		document.getElementById("crossword-square-"+currentselect).innerHTML = "&emsp;"
		setTimeout(function(){advance(); firefoxmobilefix = true},10)
		//document.getElementById("dummyinput").value = " "
	}
	else if (firefoxmobilefix && canedit && letters.includes(inVal.slice(-1).toLowerCase())) {
		document.getElementById("crossword-square-"+currentselect).innerHTML = inVal.toLowerCase()
		setTimeout(function(){advance(); firefoxmobilefix = true},10)
	}
	else {
		setTimeout(function(){firefoxmobilefix = true},10)
	}
	firefoxmobilefix = false
}
