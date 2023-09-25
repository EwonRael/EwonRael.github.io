let mastersolved = localStorage.getItem("crossword-mastersolved")

if (mastersolved) {
	mastersolved = JSON.parse(mastersolved)
}
else {
	mastersolved = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
}

window.onload = function() {
	for (let i = 1; i < 26; i++) {
		if (mastersolved[i-1]) {
			document.getElementById(i).style = "background-color: #c6fe9a;"
		}
	}
}
