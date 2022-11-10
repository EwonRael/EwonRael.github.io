let settingsc = [true, false, false]
let goal = "studenttop#doeon#eg#ar#t#etci#h##ohexamines#never"

function settings(n) {
	if (settingsc[n]) {
		settingsc[n] = false
	} 
	else {
		settingsc[n] = true
	}
}

function crosswordsolved() {
	alert("You solved the crossword! " + timer)
}
