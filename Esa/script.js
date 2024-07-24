onmousemove = function(mouse){
	let w = (mouse.clientX/window.innerWidth)*800 + 100
	let h = (mouse.clientY/window.innerHeight)*135 + 9
	let s = ((mouse.clientX/window.innerWidth)*0.7 + 0.8)*(1 - (mouse.clientY/(window.innerHeight*2)))
	document.getElementById('title').style = "font-variation-settings: 'opsz' " + h + ", 'SOFT' 100, 'wght' 300;"
}
