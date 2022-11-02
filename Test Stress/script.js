let english = 0
let math = 0
let reading = 0

function pagechange() {
	let hide = document.querySelectorAll(".hide")
	let show = location.href.split('#')[1]

	for (let i = 0; i < hide.length; i++) {
		let hidden = hide[i]
		hidden.classList.add("hidden")
	}
	if (show == undefined) {
		document.querySelector("#page1").classList.remove("hidden")
	}
	if (show == "results") {
		document.querySelector("#timer").classList.add("hidden")
		document.querySelector("#" + show).classList.remove("hidden")
	}
	else {
		document.querySelector("#" + show).classList.remove("hidden")
		document.querySelector("#timer").classList.remove("hidden")
	}
}

window.addEventListener("hashchange", () => {pagechange()})
window.addEventListener("load", () => {pagechange()})



function starttimer(time) {
	window.scrollTo({top: 0})
	let deadline = new Date().getTime() + time
	var beepsound = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=")
	const boopsound = setInterval(() => {beepsound.play()}, 1000)
	const counttimer = setInterval(() => {
		let timer = deadline - new Date().getTime()
		let printer = "REMAINING TIME: 0"
		let min = Math.floor(timer/60000)
		let sec = Math.floor((timer%60000)/1000)
		let mil = ((timer/1000).toFixed(3)).slice(-3)
		let boop = true
		if (min < 10) {
			min = "0" + min
		}
		if (sec < 10) {
			sec = "0" + sec
		}
		document.querySelector("#count").innerHTML = "REMAINING TIME: " + min + ":" + sec + "." + mil
		if (timer < 0) {
			document.querySelector("#count").innerHTML = "REMAINING TIME: 00:00.000"
			if (location.href.split('#')[1] == "english") {
				window.location = "#endenglish"
			}
			if (location.href.split('#')[1] == "math") {
				window.location = "#endmath"
			}
			if (location.href.split('#')[1] == "reading") {
				window.location = "#endreading"
			}
			clearInterval(boopsound)
			clearInterval(counttimer)
		}
	}, 1)
}

function bubble(m,n) {
	m.classList.add('checked')
	if (n == "english") {
		english = english + 1
	}
	if (n == "math") {
		math = math + 1
	}
	if (n == "reading") {
		reading = reading + 1
	}
}

function rateperform(i) {
	if (i == 1){
		return ": Proficient"
	}
	if (i > 0.5){
		return ": Below Average"
	}
	if (i > 0){
		return ": Well Below Average"
	}
	if (i == 0){
		return ": Utter Failure"
	}
}

function results() {
	let grammar = Math.floor(Math.random() * english)
	let spelling = english - grammar
	let algebra = Math.floor(Math.random() * math)
	let geometry = math - algebra
	let comprehension = Math.floor(Math.random() * reading)
	let analyses = reading - comprehension

	let centgrammar = Math.sqrt(Math.sqrt((english/160)*(2*(grammar/english))))
	if (centgrammar > 1) {
		centgrammar = 1
	}
	let centspelling = Math.sqrt(Math.sqrt((english/160)*(2*(spelling/english))))
	if (centspelling > 1) {
		centspelling = 1
	}
	let centalgebra = Math.sqrt(Math.sqrt((math/51)*(2*(algebra/math))))
	if (centalgebra > 1) {
		centalgebra = 1
	}
	let centgeometry = Math.sqrt(Math.sqrt((math/51)*(2*(geometry/math))))
	if (centgeometry > 1) {
		centgeometry = 1
	}
	let centcomprehension = Math.sqrt(Math.sqrt((reading/76)*(2*(comprehension/reading))))
	if (centcomprehension > 1) {
		centcomprehension = 1
	}
	let centanalyses = Math.sqrt(Math.sqrt((reading/76)*(2*(analyses/reading))))
	if (centanalyses > 1) {
		centanalyses = 1
	}
	document.querySelector("#compositescore").innerHTML = english + math + reading
	document.querySelector("#grammar").style = "background: linear-gradient(90deg, black "+100*centgrammar+"%, gray "+100*centgrammar+"%);"
	document.querySelector("#spelling").style = "background: linear-gradient(90deg, black "+100*centspelling+"%, gray "+100*centspelling+"%);"
	document.querySelector("#algebra").style = "background: linear-gradient(90deg, black "+100*centalgebra+"%, gray "+100*centalgebra+"%);"
	document.querySelector("#geometry").style = "background: linear-gradient(90deg, black "+100*centgeometry+"%, gray "+100*centgeometry+"%);"
	document.querySelector("#comprehension").style = "background: linear-gradient(90deg, black "+100*centcomprehension+"%, gray "+100*centcomprehension+"%);"
	document.querySelector("#analyses").style = "background: linear-gradient(90deg, black "+100*centanalyses+"%, gray "+100*centanalyses+"%);"
	
	document.querySelector("#grammars").innerHTML = grammar*115 + rateperform(centgrammar)
	document.querySelector("#spellings").innerHTML = spelling*75 + rateperform(centspelling)
	document.querySelector("#algebras").innerHTML = algebra*205 + rateperform(centalgebra)
	document.querySelector("#geometrys").innerHTML = geometry*215 + rateperform(centgeometry)
	document.querySelector("#comprehensions").innerHTML = comprehension*345 + rateperform(centcomprehension)
	document.querySelector("#analysess").innerHTML = analyses*355 + rateperform(centanalyses)
}
