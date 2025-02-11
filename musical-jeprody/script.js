let value = 0
let dad = 0
let fam = 0

function dadPoints() {
	dad = dad + (value/2)
	document.getElementById("DadScore").innerHTML = "TEAM A: " + dad
}

function famPoints() {
	fam = fam + (value/2)
	document.getElementById("FamilyScore").innerHTML = "TEAM B: " + fam
}

function playSong(a, b, c) {
	value = b
	let music = document.getElementById("music");
	music.src="music/"+a+"-"+b+".mp3";
	music.load();
	document.getElementById('popup').style.display = 'inline';
	if (a == 1) {
		document.getElementById('titleCard').innerHTML = "One Hit Wonders for " + b;
	}
	if (a == 2) {
		document.getElementById('titleCard').innerHTML = "Old School for " + b;
	}
	if (a == 3) {
		document.getElementById('titleCard').innerHTML = "gay girl icons for " + b;
	}
	if (a == 4) {
		document.getElementById('titleCard').innerHTML = "Disney Movie Music for " + b;
	}
	if (a == 5) {
		document.getElementById('titleCard').innerHTML = "Classical Music for " + b;
	}
	if (a == 6) {
		document.getElementById('titleCard').innerHTML = "Rap for " + b;
	}
	if (c.classList.contains("unknown")) {
		c.classList.remove("unknown")
	}
	else {
		c.classList.add("unknown")
	}
}

function updateDad() {
	dad = Number(document.getElementById("DadScore").innerHTML.replace(/^\D+/g, ''))
}

function updateFam() {
	fam = Number(document.getElementById("FamilyScore").innerHTML.replace(/^\D+/g, ''))
}
