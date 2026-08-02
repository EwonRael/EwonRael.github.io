let page = location.href.split('#')[0]

function pageChange() {
	let hide = document.querySelectorAll(".hide")
	let show = location.href.split('#')[1]

	for (let i = 0; i < hide.length; i++) {
		let hidden = hide[i]
		hidden.classList.add("hidden")
	}

	if (location.href == page) {
		document.querySelector("#end").classList.remove("hidden")
	}

	else {
		document.querySelector("#" + show).classList.remove("hidden")
	}
}

window.addEventListener("hashchange", function () {pageChange()})
window.addEventListener("DOMContentLoaded", function () {pageChange()})
