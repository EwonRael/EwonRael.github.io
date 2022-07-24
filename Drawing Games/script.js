let name = localStorage.getItem("drawing-games-name")

function nameInputButton() {
	localStorage.setItem("drawing-games-name", document.querySelector("#nameInputText").value)
	document.querySelector("#nameInput").classList.add("hidden")
	document.querySelector("#gameInput").classList.remove("hidden")
	document.querySelector("#nameSpot").innerHTML = document.querySelector("#nameInputText").value
}

function nameInputType(event) {
    if (event.key == "Enter") {
        nameInputButton()
    }
    if (document.querySelector("#nameInputText").value.length > 0) {
    	document.querySelector("#nameInputButton").disabled = false
    }
    else {
    	document.querySelector("#nameInputButton").disabled = true
    }
}

if (name) {
	window.onload = function() {
		document.querySelector("#nameInput").classList.add("hidden")
		document.querySelector("#gameInput").classList.remove("hidden")
		document.querySelector("#nameSpot").innerHTML = name
		document.querySelector("#dateSpot").innerHTML = getDate()
	}
}

function getDate() {
	return new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear()
}

function nameRemove() {
	localStorage.removeItem("drawing-games-name");
	document.querySelector("#nameInput").classList.remove("hidden")
	document.querySelector("#gameInput").classList.add("hidden")
}
