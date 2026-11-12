const firebaseConfig = {
	apiKey: "AIzaSyA8S5Eo3AG37VBoVhNcA9HplOzeoL0i_RM",
	authDomain: "atr-database-4c702.firebaseapp.com",
	projectId: "atr-database-4c702",
	storageBucket: "atr-database-4c702.firebasestorage.app",
	messagingSenderId: "743516545238",
	appId: "1:743516545238:web:885d58cecd491e68086977"
}

const COUNTED_KEY = "atrDownloaded"

function readCounted() {
	try {
		const list = JSON.parse(localStorage.getItem(COUNTED_KEY))
		return Array.isArray(list) ? list : []
	} catch (error) {
		return null
	}
}

function markCounted(id) {
	const list = readCounted() || []
	if (!list.includes(id)) localStorage.setItem(COUNTED_KEY, JSON.stringify([...list, id]))
}

async function countDownload(ids) {
	const counted = readCounted()
	if (!counted) return
	const fresh = ids.filter(id => !counted.includes(id))
	if (!fresh.length) return
	try {
		const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js")
		const { getFirestore, doc, updateDoc, increment } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js")
		const db = getFirestore(initializeApp(firebaseConfig))
		await Promise.all(fresh.map(async id => {
			try {
				await updateDoc(doc(db, "fonts", id), { downloads: increment(1) })
				markCounted(id)
			} catch (error) {
				console.error("Error counting download for " + id + ":", error)
			}
		}))
	} catch (error) {
		console.error("Error counting download:", error)
	}
}
