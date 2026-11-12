const firebaseConfig = {
	apiKey: "AIzaSyA8S5Eo3AG37VBoVhNcA9HplOzeoL0i_RM",
	authDomain: "atr-database-4c702.firebaseapp.com",
	projectId: "atr-database-4c702",
	storageBucket: "atr-database-4c702.firebasestorage.app",
	messagingSenderId: "743516545238",
	appId: "1:743516545238:web:885d58cecd491e68086977"
}

const UNLOCKED = ["Hobo", "Hobo_Light", "Tiffany_Gothic"]

const LOCKED_MESSAGE = "Free download unlocked when the funding goal is met."

const CUBA_MESSAGE = "Fonts are free for people in Cuba."

const remote = {}

function styleState(id, data) {
	const local = UNLOCKED.includes(id)
	if (!local && (!data || data.funding === undefined)) return { known: false, goal: 0, raised: 0 }
	const goal = Number(data?.funding) || 0
	const raised = local ? goal : Math.min(Number(data?.income) || 0, goal)
	return { known: true, goal, raised }
}

function groupPercent(states) {
	if (states.some(state => !state.known)) return 0
	const goal = states.reduce((sum, state) => sum + state.goal, 0)
	const raised = states.reduce((sum, state) => sum + state.raised, 0)
	if (raised >= goal) return 100
	return Math.min(99, Math.round(100 * raised / goal))
}

function isUnlocked(states) {
	if (window.region.cuba) return true
	return groupPercent(states) === 100
}

function fontIds(element) {
	return element.closest("[data-fonts]").dataset.fonts.split(",").map(id => id.trim())
}

function statesFor(element) {
	return fontIds(element).map(id => styleState(id, remote[id]))
}

function setupLockedButton(button) {
	button.addEventListener("animationend", () => button.classList.remove("shake"))
	button.addEventListener("click", () => {
		if (!button.classList.contains("locked")) {
			if (button.dataset.download) goTo(button.dataset.download)
			return
		}
		button.classList.remove("shake")
		void button.offsetWidth
		button.classList.add("shake")
		const row = button.closest(".series-buttons")
		if (row.querySelector(".locked-message")) return
		row.classList.add("has-locked-message")
		const message = document.createElement("p")
		message.className = "locked-message"
		if (window.region.cuba) {
			message.textContent = CUBA_MESSAGE
			message.classList.add("static")
		} else {
			message.textContent = LOCKED_MESSAGE
			message.addEventListener("click", () => goTo("../../about#model"))
		}
		row.append(message)
		void message.offsetWidth
		message.classList.add("show")
	})
}

function renderBuyButtons() {
	if (!window.region.cuba) return
	document.querySelectorAll(".buy-button").forEach(button => {
		if (!button.dataset.wired) {
			button.dataset.wired = "true"
			setupLockedButton(button)
		}
		button.classList.add("locked")
		button.setAttribute("aria-disabled", true)
	})
}

function renderButtons() {
	renderBuyButtons()
	document.querySelectorAll("[data-download]").forEach(button => {
		if (!button.dataset.wired) {
			button.dataset.wired = "true"
			setupLockedButton(button)
		}
		const locked = !isUnlocked(statesFor(button))
		button.classList.toggle("locked", locked)
		button.setAttribute("aria-disabled", locked)
		if (!locked && !window.region.cuba) {
			const row = button.closest(".series-buttons")
			row.querySelector(".locked-message")?.remove()
			row.classList.remove("has-locked-message")
		}
	})
}

let barPercent = 0
let barCount = 0

function renderBar() {
	const bar = document.getElementById("funding-bar")
	if (!bar) return
	const percent = groupPercent(statesFor(bar))
	if (percent === barPercent) return
	barPercent = percent
	const fill = document.getElementById("funding-fill")
	const label = document.getElementById("funding-label")
	fill.style.setProperty("--funded", percent + "%")
	fill.style.animation = "none"
	void fill.offsetWidth
	fill.style.animation = ""
	const token = ++barCount
	const start = performance.now()
	function count(now) {
		if (token !== barCount) return
		const t = Math.min((now - start) / 1000, 1)
		label.textContent = "Funding: " + Math.round(percent * t) + "%"
		if (t < 1) requestAnimationFrame(count)
	}
	requestAnimationFrame(count)
}

function countRows() {
	const start = performance.now()
	const percents = document.querySelectorAll(".funding-row-percent")
	percents.forEach(el => el.textContent = "0%")
	function step(now) {
		const t = Math.min((now - start) / 1000, 1)
		percents.forEach(el => el.textContent = Math.round(Number(el.dataset.target) * t) + "%")
		if (t < 1) requestAnimationFrame(step)
	}
	requestAnimationFrame(step)
}

function renderBreakdown() {
	const breakdown = document.getElementById("funding-breakdown-inner")
	if (!breakdown) return
	breakdown.replaceChildren()
	document.querySelectorAll("#series-styles [data-fonts]").forEach(styleRow => {
		const percent = groupPercent(statesFor(styleRow))
		const row = document.createElement("div")
		row.className = "funding-row"
		const source = styleRow.querySelector(".style-info b a")
		const name = document.createElement(source ? "a" : "span")
		name.className = "funding-row-name"
		name.textContent = styleRow.querySelector(".style-info b").textContent
		if (source) {
			name.href = source.getAttribute("href")
			name.addEventListener("click", event => {
				event.preventDefault()
				goTo(name.href)
			})
		}
		const track = document.createElement("div")
		track.className = "funding-row-track"
		const rowFill = document.createElement("div")
		rowFill.className = "funding-row-fill"
		rowFill.style.setProperty("--funded", percent + "%")
		track.append(rowFill)
		const percentLabel = document.createElement("span")
		percentLabel.className = "funding-row-percent"
		percentLabel.dataset.target = percent
		percentLabel.textContent = percent + "%"
		row.append(name, track, percentLabel)
		breakdown.append(row)
	})
	if (document.getElementById("funding-breakdown").classList.contains("open")) countRows()
}

function renderCrumb() {
	const crumb = document.getElementById("status-crumb")
	if (!crumb) return
	const free = isUnlocked(statesFor(document.getElementById("series-info")))
	crumb.textContent = free ? "Free Fonts" : "Paid Fonts"
	crumb.href = "../../#" + (free ? "free" : "paid")
}

function render() {
	renderCrumb()
	renderButtons()
	renderBar()
	renderBreakdown()
	document.dispatchEvent(new Event("fundingchange"))
}

let firebasePromise = null

function getFirebase() {
	if (!firebasePromise) {
		firebasePromise = (async () => {
			const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js")
			const firestore = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js")
			return { db: firestore.getFirestore(initializeApp(firebaseConfig)), firestore }
		})()
		firebasePromise.catch(() => { firebasePromise = null })
	}
	return firebasePromise
}

async function markFreeIfFunded(id, data) {
	if (data.funding === undefined || data.status === "free") return
	if ((Number(data.income) || 0) < Number(data.funding)) return
	const { db, firestore } = await getFirebase()
	await firestore.updateDoc(firestore.doc(db, "fonts", id), { status: "free" })
	data.status = "free"
}

function splitCents(amount, count) {
	const total = Math.round(amount * 100)
	const base = Math.floor(total / count)
	const extra = total % count
	return Array.from({ length: count }, (_, i) => (base + (i < extra ? 1 : 0)) / 100)
}

async function addIncome(ids, amount) {
	if (!ids.length || !(amount > 0)) return
	const { db, firestore } = await getFirebase()
	const shares = splitCents(amount, ids.length)
	const batch = firestore.writeBatch(db)
	ids.forEach((id, i) => {
		batch.update(firestore.doc(db, "fonts", id), { income: firestore.increment(shares[i]) })
	})
	await batch.commit()
	await Promise.all(ids.map(async id => {
		try {
			const snapshot = await firestore.getDoc(firestore.doc(db, "fonts", id))
			if (snapshot.exists()) await markFreeIfFunded(id, snapshot.data())
		} catch (error) {
			console.error("Error updating status for " + id + ":", error)
		}
	}))
}

const PENDING_KEY = "atrPending"

function readPending() {
	try {
		const list = JSON.parse(localStorage.getItem(PENDING_KEY))
		return Array.isArray(list) ? list : []
	} catch (error) {
		return []
	}
}

function writePending(list) {
	try {
		if (list.length) localStorage.setItem(PENDING_KEY, JSON.stringify(list))
		else localStorage.removeItem(PENDING_KEY)
	} catch (error) {}
}

function addPending(entry) {
	const list = readPending()
	if (!list.some(item => item.id === entry.id)) writePending([...list, entry])
}

function removePending(id) {
	writePending(readPending().filter(item => item.id !== id))
}

async function flushPending() {
	for (const entry of readPending()) {
		try {
			await addIncome(entry.ids, entry.amount)
			removePending(entry.id)
		} catch (error) {
			console.error("Error sending pending payment:", error)
			return
		}
	}
}

async function recordPayment(entry, timeout = 3000) {
	addPending(entry)
	const write = addIncome(entry.ids, entry.amount).then(() => removePending(entry.id))
	write.catch(error => console.error("Error recording payment:", error))
	await Promise.race([write.catch(() => {}), new Promise(resolve => setTimeout(resolve, timeout))])
}

async function loadRemote() {
	const ids = new Set()
	document.querySelectorAll("[data-fonts]").forEach(element => fontIds(element).forEach(id => ids.add(id)))
	const { db, firestore } = await getFirebase()
	const snapshots = await Promise.all([...ids].map(id => firestore.getDoc(firestore.doc(db, "fonts", id))))
	snapshots.forEach(snapshot => {
		if (snapshot.exists()) remote[snapshot.id] = snapshot.data()
	})
	return () => Promise.all(Object.entries(remote).map(([id, data]) => markFreeIfFunded(id, data)))
}

async function initFunding() {
	const breakdown = document.getElementById("funding-breakdown")
	if (breakdown) {
		document.getElementById("funding-bar").addEventListener("click", () => {
			if (breakdown.classList.toggle("open")) countRows()
		})
	}
	render()
	try {
		await flushPending()
		const healStatus = await loadRemote()
		render()
		await new Promise(resolve => setTimeout(resolve, 2000))
		await healStatus()
	} catch (error) {
		console.error("Error loading funding from Firebase:", error)
	}
}

if (typeof document !== "undefined") initFunding()
