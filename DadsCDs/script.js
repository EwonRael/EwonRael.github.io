onmousemove = function(e){
	document.getElementById("infoBox").style = "top: "+(e.clientY+1)+"px; left: "+(e.clientX+1)+"px;"
}

function infoBox(title, artist, cover, info){
	document.getElementById("title").innerHTML = title
	document.getElementById("artist").innerHTML = artist
	document.getElementById("cover").src = ""
	document.getElementById("cover").src = cover
	document.getElementById("info").innerHTML = info
}
