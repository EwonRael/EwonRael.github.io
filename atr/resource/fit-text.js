const fitCanvas = document.createElement("canvas").getContext("2d")

function fitText(el) {
	el.style.fontSize = ""
	const style = getComputedStyle(el)
	const base = parseFloat(style.fontSize)
	fitCanvas.font = style.fontStyle + " " + style.fontWeight + " " + base + "px " + style.fontFamily
	let widest = 0
	for (const word of el.textContent.trim().split(/\s+/)) {
		widest = Math.max(widest, fitCanvas.measureText(word).width)
	}
	const available = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
	if (widest > available && available > 0) {
		el.style.fontSize = Math.floor(base * available / widest * 100) / 100 + "px"
	}
}

function setupFitText(el) {
	const run = () => fitText(el)
	let lastWidth = el.clientWidth
	new ResizeObserver(() => {
		if (el.clientWidth === lastWidth) return
		lastWidth = el.clientWidth
		run()
	}).observe(el)
	if (document.fonts) {
		document.fonts.ready.then(run)
		document.fonts.addEventListener("loadingdone", run)
	}
	run()
}

document.querySelectorAll("#series-title").forEach(setupFitText)
