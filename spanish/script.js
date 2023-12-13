let words = []

if (localStorage.getItem("wordlist") === null) {
	words = loadingWords
}
else {
	words = JSON.parse(localStorage.getItem("wordlist"))
}

localStorage.setItem("wordlist", JSON.stringify(words))

let knownWords = []
let testingWords = []
let word = []
let review = true

for (let i = 0; i < words.length; i++) {
	if (words[i][2] == 69) {
		console.log("skipping "+words[i][1])
	}
	else if (words[i][2] == 4) {
		knownWords.push(i)
	}
	else if (testingWords.length < 20) {
		testingWords.push(i)
	}
}

function showAnswer() {
	document.getElementById("question").style = "visibility: hidden;"
	document.getElementById("answer").style = "visibility: visible;"
}

function left() {
	word = Math.floor(Math.random() * testingWords.length)
	document.getElementById("wordRank").innerHTML = "WORD RANKING: " + (testingWords[word] + 1)
	document.getElementById("answer").style = "visibility: hidden;"
	document.getElementById("question").style = "visibility: visible;"
	document.getElementById("es").innerHTML = words[testingWords[word]][0]
	document.getElementById("en").innerHTML = words[testingWords[word]][1]
	if (words[testingWords[word]][2] >= 0) {
		words[testingWords[word]][2] = 0
	}
	else {
		words[testingWords[word]].push(0)
	}
	localStorage.setItem("wordlist", JSON.stringify(words))
}

function right() {
	if (testingWords.length == 0) {
		if (review == true) {
			review = false
			for (let i = 0; i < words.length; i++) {
				if (words[i][2] == 69) {
					console.log("skipping "+words[i][1])
				}
				else if (words[i][2] == 4) {
					knownWords.push(i)
				}
				else if (testingWords.length < 20) {
					testingWords.push(i)
				}
			}
		}
		else {
			review = true
			for (let i = 0; i < words.length; i++) {
				if (words[i][2] == 69) {
					console.log("skipping "+words[i][1])
				}
				else if (words[i][2] == 4) {
					testingWords.push(i)
				}
			}	
			if (testingWords.length > 20) {
				let numberthing = (testingWords.length - 20)
				for (let i = 0; i < numberthing; i++) {
					testingWords = testingWords.filter(function(item) {
						return item !== testingWords[Math.floor(Math.random() * testingWords.length)]
					})
					console.log(testingWords.length)
				}
			}
			console.log(testingWords.length)	
		}
	}
	word = Math.floor(Math.random() * testingWords.length)
	document.getElementById("wordRank").innerHTML = "WORD RANKING: " + (testingWords[word] + 1)
	document.getElementById("answer").style = "visibility: hidden;"
	document.getElementById("question").style = "visibility: visible;"
	document.getElementById("es").innerHTML = words[testingWords[word]][0]
	document.getElementById("en").innerHTML = words[testingWords[word]][1]
	if (words[testingWords[word]][2] > 2) {
		words[testingWords[word]][2] = 4
		knownWords.push(testingWords[word])
		testingWords = testingWords.filter(function(item) {
			return item !== testingWords[word]
		})
	}
	else if (words[testingWords[word]][2] >= 0) {
		words[testingWords[word]][2] = words[testingWords[word]][2] + 1
	}
	else {
		words[testingWords[word]].push(1)
	}
	localStorage.setItem("wordlist", JSON.stringify(words))
}

function deleteWord() {
	if (words[testingWords[word]][2] >= 0) {
		words[testingWords[word]][2] = 69
		console.log("del")
	}
	else {
		words[testingWords[word]].push(69)
		console.log("del")
	}
	testingWords = testingWords.filter(function(item) {
		return item !== testingWords[word]
	})
	if (testingWords.length == 0) {
		if (review == true) {
			review = false
			for (let i = 0; i < words.length; i++) {
				if (words[i][2] == 69) {
					console.log("skipping "+words[i][1])
				}
				else if (words[i][2] == 4) {
					knownWords.push(i)
				}
				else if (testingWords.length < 20) {
					testingWords.push(i)
				}
			}
		}
		else {
			review = true
			for (let i = 0; i < words.length; i++) {
				if (words[i][2] == 69) {
					console.log("skipping "+words[i][1])
				}
				if (words[i][2] == 4) {
					testingWords.push(i)
				}
			}
			console.log(testingWords)
			if (testingWords.length > 20) {
				let numberthing = (testingWords.length - 20)
				for (let i = 0; i < numberthing; i++) {
					testingWords = testingWords.filter(function(item) {
						return item !== testingWords[Math.floor(Math.random() * testingWords.length)]
					})
					console.log(testingWords.length)
				}
			}
			console.log(testingWords.length)
		}
	}
	word = Math.floor(Math.random() * testingWords.length)
	document.getElementById("wordRank").innerHTML = "WORD RANKING: " + (testingWords[word] + 1)
	document.getElementById("answer").style = "visibility: hidden;"
	document.getElementById("question").style = "visibility: visible;"
	document.getElementById("es").innerHTML = words[testingWords[word]][0]
	document.getElementById("en").innerHTML = words[testingWords[word]][1]
}
