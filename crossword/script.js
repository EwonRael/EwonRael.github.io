let mastersolved = localStorage.getItem("crossword-mastersolved")
let lastselect = 0
let currentselect = 0
let across = true
let progress = true
let solved = false

if (mastersolved) {
	mastersolved = JSON.parse(mastersolved)
}
else {
	mastersolved = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
}

console.log(mastersolved[crossnum])

function toggle(i) {
	if (lastselect == i){
		if (across) {
			across = false
			declicked(i)
			clicked(i)
		}
		else {
			across = true
			declicked(i)
			clicked(i)
		}
	}
	lastselect = currentselect
}

function clicked(i){
	if (across) {
		document.getElementById("crossword").classList.add("across" + (Math.trunc((i-1)/5)+1))
		document.getElementById("across").classList.add("across" + (Math.trunc((i-1)/5)+1))
	}
	else {
		document.getElementById("crossword").classList.add("down" + (i%5))
		document.getElementById("down").classList.add("down" + (i%5))
	}
	square = document.getElementById(i)
	window.setTimeout(function() {
		var sel, range;
		if (window.getSelection && document.createRange) {
			range = document.createRange();
			range.selectNodeContents(square);
			sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		} else if (document.body.createTextRange) {
			range = document.body.createTextRange();
			range.moveToElementText(square);
			range.select();
		}
	}, 1);
	lastselect = currentselect
	currentselect = i
}

document.addEventListener('keydown', function(e) {
	window.setTimeout(function() {
	var code = e.which || e.keyCode;
	if (code == '38') {
		if (currentselect < 6) {
			currentselect = currentselect + 20
			clicked(currentselect)
		}
		else {
			currentselect = currentselect - 5
			clicked(currentselect)
		}
	}
	else if (code == '40') {
		if (currentselect > 20) {
			currentselect = currentselect - 20
			clicked(currentselect)
		}
		else {
			currentselect = currentselect + 5
			clicked(currentselect)
		}
	}
	else if (code == '37') {
		if (currentselect == 1) {
			currentselect = 25
			clicked(currentselect)
		}
		else {
			currentselect = currentselect - 1
			clicked(currentselect)
		}
	}
	else if (code == '39') {
		if (currentselect == 25) {
			currentselect = 1
			clicked(currentselect)
		}
		else {
			currentselect = currentselect + 1
			clicked(currentselect)
		}
	}
	else if (code == 8) {
			declicked(currentselect)
			if (across) {
				if (currentselect == 1) {
					currentselect = 25
					clicked(currentselect)
				}
				else {
					currentselect = currentselect - 1
					clicked(currentselect)
				}
			}
			else {
				if (currentselect < 6) {
					currentselect = currentselect + 20
					clicked(currentselect)
				}
				else {
					currentselect = currentselect - 5
					clicked(currentselect)
				}
			}
	}
	else {
		progress = true
	}
	},2)
})

function declicked(i) {
	window.focus()
	document.getElementById("crossword").classList.remove("across" + (Math.trunc((i-1)/5)+1))
	document.getElementById("across").classList.remove("across" + (Math.trunc((i-1)/5)+1))
	document.getElementById("crossword").classList.remove("down" + (i%5))
	document.getElementById("down").classList.remove("down" + (i%5))
}

function change(i) {
	square = document.getElementById(i)
	square.innerHTML = square.innerHTML.replace("<br>","").replace("&nbsp;"," ").slice(0, 1).toLowerCase()
	if (square.innerHTML == "") {
		progress = false
		square.innerHTML = "&nbsp;"
	}
	else if (square.innerHTML == " ") {
		square.innerHTML = "&nbsp;"
	}
	else if (square.innerHTML == "&lt;") {
		square.innerHTML = "&nbsp;"
	}
	else if (progress) {
		progressByOne()
		progress = false
	}
	checkCrossword()
	clicked(currentselect)
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
			alert("You solved the crossword!")
			mastersolved[crossnum] = true
			console.log(mastersolved)
			localStorage.setItem("crossword-mastersolved", JSON.stringify(mastersolved))
		}
	}
}

function pclick(i, acr) {
	if (acr) {
		across = true
		clicked(i)
	}
	else {
		across = false
		clicked(i)
	}
}

function progressByOne() {
	if (across) {
		if (currentselect == 25) {
			currentselect = 1
			clicked(currentselect)
		}
		else {
			currentselect = currentselect + 1
			clicked(currentselect)
		}
	}
	else {
		if (currentselect == 25) {
			currentselect = 1
			clicked(currentselect)				
		}
		else if (currentselect > 20) {
			currentselect = currentselect - 19
			clicked(currentselect)
		}
		else {
			currentselect = currentselect + 5
			clicked(currentselect)
		}
	}
}

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
	}
}