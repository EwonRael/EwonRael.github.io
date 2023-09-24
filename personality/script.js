function change(a,b){
	let list = document.querySelectorAll("."+a)
	list.forEach(function(item) {
	    item.innerHTML = b
	})
	document.body.style.background = "#F" + Math.floor(Math.random() * 9) + "F" + Math.floor(Math.random() * 9) + "F" + Math.floor(Math.random() * 9)
}

function nextB(){
	document.querySelector("#finished-text").style = "display: block;"
	document.querySelector("#Questions").style = "display: none;"
	document.body.style.background = "white"
}
