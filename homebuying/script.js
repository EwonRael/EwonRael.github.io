function makeNumber(x) {
	x = x.replace(/\D/g, "")
	if (x > 999999) {
		x = [x.slice(0, -3), ",", x.slice(-3)].join('')
		x = [x.slice(0, -7), ",", x.slice(-7)].join('')
	}
	else if (x > 999) {
		x = [x.slice(0, -3), ",", x.slice(-3)].join('')
	}
	document.getElementById("income").value = x
}

function makeCredit(x) {
	x = x.replace(/\D/g, "")
	if (x > 850) {
		x = 850
	}
	document.getElementById("credit").value = x
}

function makeMonth(x) {
	x = x.replace(/\D/g, "")
	if (x > 999999) {
		x = [x.slice(0, -3), ",", x.slice(-3)].join('')
		x = [x.slice(0, -7), ",", x.slice(-7)].join('')
	}
	else if (x > 999) {
		x = [x.slice(0, -3), ",", x.slice(-3)].join('')
	}
	document.getElementById("month").value = x
}

function familySize(x) {
	x = x.replace(/\D/g, "")
	if (x > 850) {
		x = 850
	}
	document.getElementById("familySize").value = x
}

function makeNumberTwo(x) {
	x = x.replace(/\D/g, "")
	if (x > 999999) {
		x = [x.slice(0, -3), ",", x.slice(-3)].join('')
		x = [x.slice(0, -7), ",", x.slice(-7)].join('')
	}
	else if (x > 999) {
		x = [x.slice(0, -3), ",", x.slice(-3)].join('')
	}
	document.getElementById("downpayment").value = x
}

function showPrograms() {
	document.getElementById("questions").style = "display: none;"
	document.getElementById("programs").style = "display: block;"
	window.scrollTo(0, 0);
}
