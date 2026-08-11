let value = 0
let dad = 0
let fam = 0

function dadPoints() {
	dad = dad + value
	document.getElementById("DadScore").innerHTML = "TEAM A: " + dad
}

function famPoints() {
	fam = fam + value
	document.getElementById("FamilyScore").innerHTML = "TEAM B: " + fam
}

function showClue(catIndex, valueIndex, cell) {
	let category = CATEGORIES[catIndex]
	let item = category.clues[valueIndex]
	value = item.value

	document.getElementById('titleCard').innerHTML = category.name + " for " + item.value
	document.getElementById('clue').innerHTML = item.clue

	let prompt = document.getElementById('questionPrompt')
	let answer = document.getElementById('questionAnswer')
	prompt.classList.remove('hidden')
	answer.style.opacity = 0
	answer.innerHTML = item.question

	document.getElementById('popup').style.display = 'inline'

	if (cell.classList.contains("unknown")) {
		cell.classList.remove("unknown")
	}
	else {
		cell.classList.add("unknown")
	}
}

function revealQuestion() {
	document.getElementById('questionPrompt').classList.add('hidden')
	document.getElementById('questionAnswer').style.opacity = 1
}

function updateDad() {
	dad = Number(document.getElementById("DadScore").innerHTML.replace(/^\D+/g, ''))
}

function updateFam() {
	fam = Number(document.getElementById("FamilyScore").innerHTML.replace(/^\D+/g, ''))
}
