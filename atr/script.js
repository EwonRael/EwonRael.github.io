const firebaseConfig = {
	apiKey: "AIzaSyA8S5Eo3AG37VBoVhNcA9HplOzeoL0i_RM",
	authDomain: "atr-database-4c702.firebaseapp.com",
	projectId: "atr-database-4c702",
	storageBucket: "atr-database-4c702.firebasestorage.app",
	messagingSenderId: "743516545238",
	appId: "1:743516545238:web:885d58cecd491e68086977"
}

window.fontlist = {}

onmousemove = function(e) {
    const infoBox = document.getElementById("infoBox")
    infoBox.style.top = (e.clientY + 20) + "px"
    infoBox.style.left = (e.clientX + 10) + "px"
    fitInfoBox(infoBox)
}

function fitInfoBox(infoBox) {
    // Let the available space determine wrapping before trimming unused width.
    infoBox.style.width = ""
    if (!infoBox.getClientRects().length) return

    const boxStyle = getComputedStyle(infoBox)
    const contentLeft = infoBox.getBoundingClientRect().left
        + parseFloat(boxStyle.borderLeftWidth) + parseFloat(boxStyle.paddingLeft)
    const walker = document.createTreeWalker(infoBox, NodeFilter.SHOW_TEXT)
    const range = document.createRange()
    let width = 0
    while (walker.nextNode()) {
        const node = walker.currentNode
        if (!node.textContent.trim()) continue
        range.selectNodeContents(node)
        const textBlock = node.parentElement.closest("#info-title, p")
        const margin = textBlock ? parseFloat(getComputedStyle(textBlock).marginRight) : 0
        for (const rect of range.getClientRects()) {
            width = Math.max(width, rect.right - contentLeft + margin)
        }
    }
    if (width) infoBox.style.width = Math.ceil(width) + "px"
}

window.addEventListener("resize", () => fitInfoBox(document.getElementById("infoBox")))


async function pageLoad() {
    const specimensDiv = document.getElementById("specimens")
    const specimens = [...specimensDiv.children];
    for (const specimen of specimens) {
        specimen.style.backgroundImage = `url("${specimen.dataset.family}/${specimen.getAttribute('aria-label')}.png")`
        // placeholder data from the DOM so the site works before Firebase responds
        const docId = specimen.getAttribute('aria-label').replace(/\s+/g, '_');
        window.fontlist[docId] = {
            name: specimen.getAttribute('aria-label'),
            family: specimen.dataset.family,
            status: specimen.dataset.status,
            date: specimen.dataset.date,
            funding: specimen.dataset.funding ? Number(specimen.dataset.funding) : 0,
            income: 0,
            downloads: 0
        };
    }
    window.setupHoverListeners();
    // sync with Firebase in the background; failures are non-fatal
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js")
        const { getFirestore, doc, setDoc, updateDoc, collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js")
        const db = getFirestore(initializeApp(firebaseConfig))
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
                if (data.funding === undefined) {
                    data.funding = window.fontlist[docId].funding
                    needsUpdate = true
                }
                if (needsUpdate) {
                    await updateDoc(doc(db, "fonts", docId), {
                        income: data.income,
                        downloads: data.downloads,
                        funding: data.funding
                    })
                }
                window.fontlist[docId] = data
            } else {
                await setDoc(doc(db, "fonts", docId), window.fontlist[docId])
            }
        })
        await Promise.all(syncTasks)
    } catch (error) {
        console.error("Error with Firebase collection sync:", error);
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
        fitInfoBox(infoBox)
    })
    logo.addEventListener('mouseleave', () => {
        infoBox.style.display = "none"
    })
    const showFullInfo = (specimen, data, faceName, faceWeight) => {
        fontGroupInfo.style.display = "none"
        allFontInfo.style.display = "block"
        document.getElementById("info-family-line").childNodes[0].textContent = "Font Family: "
        infoFamily.textContent = data.family || "Unknown"
        infoStatus.textContent = data.status || "Unknown"
        if (infoStatus.textContent === "free") {
            infoStatus.textContent = "funded"
        } else if (data.funding) {
            infoStatus.textContent = `${Math.round(data.income ?? 0).toLocaleString("en-US")} / ${Number(data.funding).toLocaleString("en-US")} USD`
        }
        infoTitle.textContent = specimen.getAttribute('aria-label')
        infoTitle.style.fontFamily = `"${faceName}"`
        infoTitle.style.fontWeight = faceWeight
    }
    specimens.forEach(specimen => {
        specimen.addEventListener('mouseenter', () => {
            const isGrouped = document.getElementById("grouping").textContent.includes("grouped by family")
            const docId = specimen.getAttribute('aria-label').replace(/\s+/g, '_')
            const data = window.fontlist[docId]
            const faceName = specimen.dataset.font
            const faceWeight = specimen.getAttribute('aria-label').endsWith("Light") ? 300 : 400
            if (data) {
                aboutInfo.style.display = "none"
                if (isGrouped) {
                    const members = [...document.querySelectorAll("#specimens > div")]
                        .filter(el => el.dataset.family === data.family)
                    fontGroupInfo.style.display = "none"
                    allFontInfo.style.display = "block"
                    infoTitle.textContent = members.length > 1 ? `${data.family} Series` : data.family
                    infoTitle.style.fontFamily = `"${faceName}"`
                    infoTitle.style.fontWeight = faceWeight
                    document.getElementById("info-family-line").childNodes[0].textContent = "Fonts in Family: "
                    infoFamily.innerHTML = members.map(el =>
                        `<span class="family-member">${el.getAttribute('aria-label')}</span>`
                    ).join("")
                    const isFunded = (el) => {
                        const d = window.fontlist[el.getAttribute('aria-label').replace(/\s+/g, '_')]
                        return d && (d.status === "free" || (d.funding > 0 && (d.income ?? 0) >= d.funding))
                    }
                    const fundedCount = members.filter(isFunded).length
                    infoStatus.textContent = fundedCount === members.length ? "fully funded"
                        : fundedCount === 0 ? "unfunded"
                        : "partially funded"
                } else {
                    showFullInfo(specimen, data, faceName, faceWeight)
                }

                infoBox.style.display = "block"
                fitInfoBox(infoBox)
            } else {
                console.warn(`No database entry found for: ${docId}`)
            }
        })

        specimen.addEventListener('mouseleave', () => {
            infoBox.style.display = "none"
        })
    })
}
