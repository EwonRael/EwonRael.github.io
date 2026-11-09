// Fade the page content out, then change page.
window.goTo = function (url) {
	if (document.body.classList.contains("leaving")) return
	const target = new URL(url, location.href).href
	document.body.classList.add("leaving")
	setTimeout(() => { location.href = target }, 300)
}

// Coming back via the back button can restore the faded-out page.
addEventListener("pageshow", e => {
	if (e.persisted) document.body.classList.remove("leaving")
})
