import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"

const firebaseConfig = {
	apiKey: "AIzaSyA8S5Eo3AG37VBoVhNcA9HplOzeoL0i_RM",
	authDomain: "atr-database-4c702.firebaseapp.com",
	projectId: "atr-database-4c702",
	storageBucket: "atr-database-4c702.firebasestorage.app",
	messagingSenderId: "743516545238",
	appId: "1:743516545238:web:885d58cecd491e68086977"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
window.fontlist = {}

onmousemove = function(e) {
    const infoBox = document.getElementById("infoBox")
    infoBox.style.top = (e.clientY + 20) + "px"
    infoBox.style.left = (e.clientX + 10) + "px"
}

async function pageLoad() {
    const specimensDiv = document.getElementById("specimens")
    const specimens = [...specimensDiv.children];
    for (const specimen of specimens) {
        specimen.style.backgroundImage = `url("${specimen.dataset.family}/${specimen.getAttribute('aria-label')}.png")`
    }
    try {
        const querySnapshot = await getDocs(collection(db, "fonts"))
        const dbData = {}
        querySnapshot.forEach((doc) => {
            dbData[doc.id] = doc.data()
        })
        const syncTasks = specimens.map(async (specimen) => {
            const docId = specimen.getAttribute('aria-label').replace(/\s+/g, '_')
            if (dbData[docId]) {
                let data = dbData[docId];
                let needsUpdate = false;
                if (data.income === undefined || data.downloads === undefined) {
                    data.income = data.income ?? 0
                    data.downloads = data.downloads ?? 0
                    needsUpdate = true
                }
                if (needsUpdate) {
                    await updateDoc(doc(db, "fonts", docId), {
                        income: data.income,
                        downloads: data.downloads
                    })
                }
                window.fontlist[docId] = data
            } else {
                const localData = {
                    name: specimen.getAttribute('aria-label'), 
                    family: specimen.dataset.family,
                    status: specimen.dataset.status,
                    date: specimen.dataset.date,
                    income: 0,
                    downloads: 0
                }
                await setDoc(doc(db, "fonts", docId), localData)
                window.fontlist[docId] = localData
            }
        })
        await Promise.all(syncTasks)
        window.setupHoverListeners();
    } catch (error) {
        console.error("Error with Firebase collection sync:", error);
        specimens.forEach(specimen => {
            const docId = specimen.getAttribute('aria-label').replace(/\s+/g, '_');
            window.fontlist[docId] = {
                name: specimen.getAttribute('aria-label'),
                family: specimen.dataset.family,
                status: specimen.dataset.status, 
                income: 0,
                downloads: 0
            };
        });
        window.setupHoverListeners();
    }
}

window.onload = pageLoad

window.display = function(a) {
	const specimensDiv = document.getElementById("specimens")
	const specimens = [...specimensDiv.children]
	if (a == 0) {
		for (const specimen of specimens) {
			specimen.classList.remove("statusHide")
		}
		document.getElementById("displaying").innerHTML = "all fonts"
	}
	if (a == 1) {
		for (const specimen of specimens) {
			let status = window.fontlist[specimen.getAttribute('aria-label').replace(/\s+/g, '_')]["status"]
			specimen.classList.remove("statusHide")
			if (status == "unfinished") {
				specimen.classList.add("statusHide")
			}
		}
		document.getElementById("displaying").innerHTML = "finished fonts"
	}
	if (a == 2) {
		for (const specimen of specimens) {
			let status = window.fontlist[specimen.getAttribute('aria-label').replace(/\s+/g, '_')]["status"]
			if (status != "free") {
				specimen.classList.add("statusHide")
			}
		}
		document.getElementById("displaying").innerHTML = "free fonts"
	}
}

window.sort = async function(a) {
    const container = document.getElementById("specimens")
    const specimens = [...container.children]
    const labelMapping = ["alphabetically", "by date", "by popularity"]
    const sortedOrder = [...specimens].sort((elA, elB) => {
        const idA = elA.getAttribute('aria-label').replace(/\s+/g, '_')
        const idB = elB.getAttribute('aria-label').replace(/\s+/g, '_')
        const dataA = window.fontlist[idA]
        const dataB = window.fontlist[idB]
        if (a === 0) {
            return elA.getAttribute('aria-label').localeCompare(elB.getAttribute('aria-label'))
        }
        if (a === 1) return elB.dataset.date.localeCompare(elA.dataset.date)
        if (a === 2) {
            const scoreA = (dataA?.downloads || 0) + (dataA?.income || 0)
            const scoreB = (dataB?.downloads || 0) + (dataB?.income || 0)
            return scoreB - scoreA
        }
        return 0
    })
	const currentIndicesInTarget = specimens.map(el => sortedOrder.indexOf(el))
	
	function getLISIndices(arr) {
		const p = new Array(arr.length)
		const result = [0]
		for (let i = 1; i < arr.length; i++) {
			if (arr[i] > arr[result[result.length - 1]]) {
				p[i] = result[result.length - 1]
				result.push(i)
				continue
			}
			let lo = 0, hi = result.length - 1
			while (lo < hi) {
				let mid = (lo + hi) >> 1
				if (arr[result[mid]] < arr[i]) lo = mid + 1
				else hi = mid
			}
			if (arr[i] < arr[result[lo]]) {
				if (lo > 0) p[i] = result[lo - 1]
				result[lo] = i
			}
		}
		let cur = result.length, last = result[cur - 1]
		while (cur-- > 0) {
			result[cur] = last
			last = p[last]
		}
		return result
	}

	const stableIndices = getLISIndices(currentIndicesInTarget)
	const stableElements = new Set(stableIndices.map(i => specimens[i]))
	const movers = specimens.filter(el => !stableElements.has(el))
	movers.forEach(el => el.classList.add("orderHide"))
	await new Promise(r => setTimeout(r, 50))
	sortedOrder.forEach((targetEl) => {
		if (movers.includes(targetEl)) {
			const clone = targetEl.cloneNode(true)
			clone.classList.add("orderHide")
			container.appendChild(clone)
			void clone.offsetWidth
			clone.classList.remove("orderHide")
		} else {
			container.appendChild(targetEl)
		}
	})
	await new Promise(resolve => setTimeout(resolve, 500))
	movers.forEach(el => el.remove())

	document.getElementById("sorting").innerHTML = labelMapping[a]
}

window.group = function(a) {
	const specimensDiv = document.getElementById("specimens")
	const specimens = [...specimensDiv.children]
	if (a) {
		for (const specimen of specimens) {
			if (specimen.dataset.family != specimen.id) {
				specimen.classList.add("familyHide")
			}
		}
		document.getElementById("grouping").innerHTML = "grouped by family"
	}
	else {
		for (const specimen of specimens) {
			specimen.classList.remove("familyHide")
		}
		document.getElementById("grouping").innerHTML = "displaying all styles"
	}
}

window.setupHoverListeners = function() {
    const specimens = document.querySelectorAll("#specimens > div")
    const infoBox = document.getElementById("infoBox")
    const infoTitle = document.getElementById("info-title")
    const infoFamily = document.getElementById("info-family")
    const infoStatus = document.getElementById("info-status")
    const allFontInfo = document.getElementById("all-font-info")
    const fontGroupInfo = document.getElementById("font-group-info")
    const aboutInfo = document.getElementById("about-info")
    const logo = document.getElementById("logo")
    logo.addEventListener('mouseenter', () => {
        allFontInfo.style.display = "none"
        fontGroupInfo.style.display = "none"
        aboutInfo.style.display = "block"
        infoBox.style.display = "block"
    })
    logo.addEventListener('mouseleave', () => {
        infoBox.style.display = "none"
    })
    specimens.forEach(specimen => {
        specimen.addEventListener('mouseenter', () => {
            const isGrouped = document.getElementById("grouping").textContent.includes("grouped by family")
            const docId = specimen.getAttribute('aria-label').replace(/\s+/g, '_')
            const data = window.fontlist[docId]
            if (data) {
                aboutInfo.style.display = "none"
                if (isGrouped) {
                    allFontInfo.style.display = "none"
                    fontGroupInfo.style.display = "block"
                    fontGroupInfo.innerHTML = ""
                    const currentFamily = data.family
                    Object.keys(window.fontlist).forEach(key => {
                        const font = window.fontlist[key]
                        if (font.family === currentFamily) {
                            const img = document.createElement("img")
                            img.src = `${font.family}/${font.name} hover.png`
                            img.style.display = "block"
                            img.style.marginBottom = "10px"
                            fontGroupInfo.appendChild(img)
                        }
                    })
                } else {
                    fontGroupInfo.style.display = "none"
                    allFontInfo.style.display = "block"
                    infoFamily.textContent = data.family || "Unknown"
                    infoStatus.textContent = data.status || "Unknown"
                    if (infoStatus.textContent === "free") {
                        infoStatus.textContent = "funded"
                    }
                    const imageName = specimen.getAttribute('aria-label')
                    infoTitle.src = `${data.family}/${imageName} hover.png`
                }

                infoBox.style.display = "block"
            } else {
                console.warn(`No database entry found for: ${docId}`)
            }
        })

        specimen.addEventListener('mouseleave', () => {
            infoBox.style.display = "none"
        })
    })
}
