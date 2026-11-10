const PAYPAL_CLIENT_ID = "AX1jmI9lD8kowbl5bAl_1QYP7XC7btI_t8AfZ1bj7vWl6yeg_Gz20PoZTAkTwH9tIU3JW9vTlXP73FCX"
const PAYPAL_CURRENCY = window.region.code

let paypalLoading = null

function loadPayPal() {
	if (window.paypal) return Promise.resolve(window.paypal)
	if (!paypalLoading) {
		paypalLoading = new Promise((resolve, reject) => {
			const script = document.createElement("script")
			script.src = "https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(PAYPAL_CLIENT_ID) + "&currency=" + PAYPAL_CURRENCY + "&intent=capture&disable-funding=credit"
			script.onload = () => resolve(window.paypal)
			script.onerror = () => { paypalLoading = null; reject(new Error("PayPal failed to load")) }
			document.head.append(script)
		})
	}
	return paypalLoading
}

const CHECKOUT_MAX = 10000
const COMPACT_HEIGHT = 150

function shakeElement(el) {
	el.classList.remove("shake")
	void el.offsetWidth
	el.classList.add("shake")
}

function openCheckout(button) {
	if (window.region.cuba) return
	const name = button.dataset.name
	const price = Number(button.dataset.price)
	const minimum = Number(button.dataset.min || button.dataset.price)
	const moreAt = Number(button.dataset.moreAt ?? minimum)
	const free = button.dataset.free === "true"
	const style = button.dataset.style
	const downloadUrl = new URL("download" + (style ? "?style=" + encodeURIComponent(style) : ""), location.href).href

	const overlay = document.createElement("div")
	overlay.className = "checkout-overlay"
	const box = document.createElement("div")
	box.className = "checkout-box"
	const title = document.createElement("h2")
	title.textContent = name
	const close = document.createElement("button")
	close.className = "checkout-close"
	close.setAttribute("aria-label", "Close")

	const priceLine = document.createElement("p")
	priceLine.className = "checkout-price"
	const amountInput = document.createElement("input")
	amountInput.type = "text"
	amountInput.inputMode = "decimal"
	amountInput.autocomplete = "off"
	amountInput.spellcheck = false
	amountInput.className = "checkout-amount-input"
	amountInput.setAttribute("aria-label", "Amount in " + window.region.name)
	const more = document.createElement("span")
	more.className = "checkout-more"
	more.setAttribute("role", "button")
	more.tabIndex = 0
	more.textContent = "or\u00a0more"
	priceLine.append(window.region.symbol, amountInput, "\u00a0" + window.region.code + "\u00a0", more)

	const hint = document.createElement("div")
	hint.className = "checkout-hint"
	const hintInner = document.createElement("div")
	hintInner.className = "checkout-hint-inner"
	const hintText = document.createElement("p")
	hintInner.append(hintText)
	hint.append(hintInner)
	hintText.addEventListener("animationend", () => hintText.classList.remove("shake"))

	const wrap = document.createElement("div")
	wrap.className = "checkout-buttons-wrap"
	const container = document.createElement("div")
	container.className = "checkout-buttons"
	const block = document.createElement("div")
	block.className = "checkout-block"
	const freeDownload = document.createElement("button")
	freeDownload.className = "download-button checkout-free-download"
	freeDownload.textContent = "Download for Free"
	wrap.append(container, freeDownload, block)
	const status = document.createElement("p")
	status.className = "checkout-status"
	box.append(close, title, priceLine, hint, wrap, status)
	overlay.append(box)
	document.body.append(overlay)
	void overlay.offsetWidth
	overlay.classList.add("show")

	const sizeObserver = new ResizeObserver(() => {
		const frame = container.querySelector("iframe")
		const height = (frame || container).getBoundingClientRect().height
		box.classList.toggle("compact", height > COMPACT_HEIGHT)
	})
	sizeObserver.observe(container)

	const dismiss = () => {
		sizeObserver.disconnect()
		overlay.classList.remove("show")
		setTimeout(() => overlay.remove(), 300)
		document.removeEventListener("keydown", onKey)
	}
	const onKey = e => { if (e.key === "Escape") dismiss() }
	document.addEventListener("keydown", onKey)
	close.addEventListener("click", dismiss)
	overlay.addEventListener("mousedown", e => { if (e.target === overlay) dismiss() })

	let payActions = null
	let userOpenedHint = false
	let hadError = false

	const currentAmount = () => {
		const text = amountInput.value.trim()
		if (text === "" || text === ".") return NaN
		const value = Number(text)
		return Number.isFinite(value) ? Math.round(value * 100) / 100 : NaN
	}
	const amountState = () => {
		const amount = currentAmount()
		if (free) {
			if (!Number.isNaN(amount) && amount < 0.01) return "free"
			if (Number.isNaN(amount)) return "empty"
		} else {
			if (Number.isNaN(amount)) return "empty"
			if (amount < minimum) return "low"
		}
		if (amount > CHECKOUT_MAX) return "high"
		return "ok"
	}
	const messages = { ok: "Type in a custom amount", low: "below the " + window.region.symbol + (Number.isInteger(minimum) ? minimum : minimum.toFixed(2)) + " " + window.region.code + " minimum", high: "Too high", empty: "Enter an amount" }

	const update = () => {
		const state = amountState()
		amountInput.style.width = Math.max(amountInput.value.length, 1) + "ch"
		const isError = state !== "ok" && state !== "free"
		if (isError) {
			hadError = true
			hintText.textContent = messages[state]
		} else if (!hadError && userOpenedHint) {
			hintText.textContent = messages.ok
		}
		hint.classList.toggle("open", isError || (userOpenedHint && !hadError))
		block.classList.toggle("on", isError)
		container.classList.toggle("disabled", isError)
		wrap.classList.toggle("free", state === "free")
		const amount = currentAmount()
		more.textContent = !Number.isNaN(amount) && Math.abs(amount - moreAt) < 0.005 ? "or\u00a0more" : "or\u00a0custom"
		if (payActions) state === "ok" ? payActions.enable() : payActions.disable()
		return state
	}

	amountInput.value = price.toFixed(2)
	update()

	amountInput.addEventListener("input", () => {
		const cleaned = amountInput.value.replace(/[^\d.]/g, "").replace(/(\..*?)\./g, "$1")
		if (cleaned !== amountInput.value) amountInput.value = cleaned
		update()
	})
	amountInput.addEventListener("focus", () => amountInput.select())
	amountInput.addEventListener("blur", () => {
		const amount = currentAmount()
		if (!Number.isNaN(amount)) amountInput.value = amount.toFixed(2)
		update()
	})
	amountInput.addEventListener("keydown", e => { if (e.key === "Enter") amountInput.blur() })

	const toggleMore = () => {
		userOpenedHint = true
		hadError = false
		update()
		amountInput.focus()
	}
	more.addEventListener("click", toggleMore)
	more.addEventListener("keydown", e => {
		if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleMore() }
	})
	block.addEventListener("click", () => shakeElement(hintText))
	freeDownload.addEventListener("click", () => goTo(downloadUrl))

	if (PAYPAL_CLIENT_ID === "YOUR_PAYPAL_CLIENT_ID") {
		status.textContent = "Checkout isn’t set up yet."
		return
	}
	status.textContent = "Loading PayPal…"
	loadPayPal().then(paypal => {
		status.textContent = ""
		return paypal.Buttons({
			style: { layout: "vertical", shape: "sharp", color: "white", label: "pay", tagline: false, height: 45 },
			onInit: (data, actions) => {
				payActions = actions
				update()
			},
			onClick: (data, actions) => {
				if (amountState() !== "ok") {
					shakeElement(hintText)
					return actions.reject()
				}
				status.textContent = ""
				amountInput.disabled = true
			},
			onCancel: () => { amountInput.disabled = false },
			onError: () => {
				amountInput.disabled = false
				status.textContent = "Something went wrong with PayPal. You haven’t been charged – please try again."
			},
			createOrder: (data, actions) => actions.order.create({
				purchase_units: [{
					description: name + " (American Type Revival)",
					amount: { currency_code: PAYPAL_CURRENCY, value: currentAmount().toFixed(2) }
				}],
				application_context: { shipping_preference: "NO_SHIPPING" }
			}),
			onApprove: (data, actions) => actions.order.capture().then(async details => {
				status.textContent = "Thank you! Taking you to your download…"
				const capture = details?.purchase_units?.[0]?.payments?.captures?.[0]
				const paid = Number(capture?.amount?.value)
				const fontsElement = button.closest("[data-fonts]")
				if (fontsElement && typeof recordPayment === "function") {
					await recordPayment({
						id: data.orderID,
						ids: fontsElement.dataset.fonts.split(",").map(id => id.trim()),
						amount: paid > 0 ? paid : currentAmount()
					})
				}
				goTo(downloadUrl)
			})
		}).render(container).then(() => {
			const frame = container.querySelector("iframe")
			if (frame) sizeObserver.observe(frame)
		})
	}).catch(() => {
		status.textContent = "Couldn’t load PayPal. Check your connection and try again."
	})
}

document.querySelectorAll(".buy-button[data-price]").forEach(button => {
	button.addEventListener("click", () => openCheckout(button))
})

const PRICE_PATTERN = /\$(\d+(?:\.\d+)?)[ \u00a0]USD/
const PIXELS_PER_DOLLAR = 10
const MAX_PRICE = 1000

function setupDraggablePrice(info) {
	const button = info.parentElement.querySelector(".buy-button[data-price]")
	if (!button) return
	const walker = document.createTreeWalker(info, NodeFilter.SHOW_TEXT)
	let textNode = null
	while (walker.nextNode()) {
		if (PRICE_PATTERN.test(walker.currentNode.textContent)) { textNode = walker.currentNode; break }
	}
	if (!textNode) return

	const match = textNode.textContent.match(PRICE_PATTERN)
	const decimals = match[1].includes(".") ? 2 : 0
	const isFamily = button.dataset.style === ""
	let defaultPrice = Number(match[1])
	let free
	let minimum
	const priceText = textNode.splitText(match.index)
	priceText.splitText(match[0].length)
	const price = document.createElement("span")
	price.className = "price-drag"
	price.textContent = window.region.format(defaultPrice, decimals)
	priceText.replaceWith(price)

	const siblings = () => document.querySelectorAll(".buy-button[data-price]")
	const group = [...siblings()].filter(b => b.dataset.name === button.dataset.name && b.dataset.style === button.dataset.style)
	let current = defaultPrice
	const isRaised = value => free || value > minimum
	const refresh = () => {
		free = !info.parentElement.querySelector(".download-button.locked")
		minimum = free ? 0 : defaultPrice
		if (isFamily) {
			const styles = [...document.querySelectorAll("#series-styles .series-buttons[data-fonts]")].map(row => ({
				price: Number(row.querySelector(".buy-button").dataset.list),
				unfunded: Boolean(row.querySelector(".download-button.locked"))
			}))
			const sum = list => list.reduce((total, style) => total + style.price, 0)
			const unfunded = styles.filter(style => style.unfunded)
			minimum = free ? 0 : unfunded.length === 1 ? unfunded[0].price : Math.ceil(sum(unfunded) * 2 / 3)
			const suggested = styles.length === 1 ? styles[0].price : Math.ceil(sum(styles) * 2 / 3)
			const wasDefault = current === defaultPrice
			defaultPrice = Math.max(suggested, minimum)
			apply(wasDefault ? defaultPrice : Math.max(current, minimum))
		}
		group.forEach(b => { b.dataset.min = minimum; b.dataset.free = free; b.dataset.moreAt = free ? 0 : defaultPrice })
		price.classList.toggle("raised", isRaised(current))
	}
	const apply = value => {
		current = value
		price.textContent = window.region.format(value, decimals)
		price.classList.toggle("raised", isRaised(value))
		group.forEach(b => { b.dataset.price = value })
	}
	refresh()
	document.addEventListener("fundingchange", refresh)

	price.addEventListener("pointerdown", e => {
		if (e.button !== 0) return
		e.preventDefault()
		price.setPointerCapture(e.pointerId)
		document.body.classList.add("price-dragging")
		document.body.classList.toggle("price-raised", isRaised(current))
		let raw = current
		let lastX = e.clientX
		const move = ev => {
			raw = Math.min(MAX_PRICE, Math.max(minimum, raw + (ev.clientX - lastX) / PIXELS_PER_DOLLAR))
			lastX = ev.clientX
			apply(Math.round(raw))
			document.body.classList.toggle("price-raised", isRaised(current))
		}
		const end = () => {
			price.removeEventListener("pointermove", move)
			price.removeEventListener("pointerup", end)
			price.removeEventListener("pointercancel", end)
			document.body.classList.remove("price-dragging", "price-raised")
		}
		price.addEventListener("pointermove", move)
		price.addEventListener("pointerup", end)
		price.addEventListener("pointercancel", end)
	})
}

document.querySelectorAll(".buy-button[data-price]").forEach(b => { b.dataset.list = b.dataset.price })
document.querySelectorAll(".style-info").forEach(setupDraggablePrice)
