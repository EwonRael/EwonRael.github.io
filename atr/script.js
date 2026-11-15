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
    const title = document.getElementById("info-title")
    if (title) title.style.minHeight = ""
    if (!infoBox.getClientRects().length) return

    const boxStyle = getComputedStyle(infoBox)
    const contentLeft = infoBox.getBoundingClientRect().left
        + parseFloat(boxStyle.borderLeftWidth) + parseFloat(boxStyle.paddingLeft)
    const range = document.createRange()
    function measure() {
        const walker = document.createTreeWalker(infoBox, NodeFilter.SHOW_TEXT)
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
        return width
    }
    let width = measure()
    // While the title cycles through a family's styles, reserve the largest
    // width and height any of them needs so the box never changes size.
    const styles = title && title.cycleStyles
    if (styles) {
        const shown = [title.style.fontFamily, title.style.fontWeight]
        let height = 0
        styles.forEach((style, i) => {
            title.style.fontFamily = `"${style.font}"`
            title.style.fontWeight = style.weight
            title.markStyle(i)
            width = Math.max(width, measure())
            height = Math.max(height, title.getBoundingClientRect().height)
        })
        ;[title.style.fontFamily, title.style.fontWeight] = shown
        title.markStyle(title.currentStyle)
        title.style.minHeight = Math.ceil(height) + "px"
    }
    if (width) infoBox.style.width = Math.ceil(width) + "px"
}

window.addEventListener("resize", () => fitInfoBox(document.getElementById("infoBox")))


// Small-caps name over each card, shown only in the one-column layout (CSS).
// Grouped by family it names the family; otherwise the individual style.
window.labelCards = function() {
    const grouped = document.getElementById("grouping").textContent.includes("grouped by family")
    document.querySelectorAll("#specimens > .specimen-live").forEach(card => {
        let label = card.querySelector(":scope > .card-name")
        if (!label) {
            label = document.createElement("p")
            label.className = "card-name"
            card.prepend(label)
        }
        const family = card.dataset.family
        const size = Object.values(window.fontlist).filter(font => font.family === family).length
        label.textContent = grouped
            ? (window.ATR_FAMILY_TITLES || {})[family] || (size > 1 ? `${family} Family` : family)
            : card.dataset.displayName || card.getAttribute("aria-label")
    })
}

async function pageLoad() {
    const specimensDiv = document.getElementById("specimens")
    const specimens = [...specimensDiv.children];
    for (const specimen of specimens) {
        // Live specimens use the font file; identity is independent of their label.
        // placeholder data from the DOM so the site works before Firebase responds
        const docId = specimen.dataset.fontId;
        window.fontlist[docId] = {
            name: specimen.dataset.catalogueName,
            sortName: specimen.dataset.indexName,
            fontName: specimen.dataset.fontName,
            family: specimen.dataset.family,
            status: specimen.dataset.status,
            date: specimen.dataset.date,
            funding: specimen.dataset.funding ? Number(specimen.dataset.funding) : 0,
            income: 0,
            downloads: 0
        };
    }
    window.setupHoverListeners();
    window.labelCards()
    if (location.hash === "#free") window.display(1)
    if (location.hash === "#paid") window.display(2)
    // sync with Firebase in the background; failures are non-fatal
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js")
        const firestore = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js")
        const { getFirestore, doc, updateDoc, collection, getDocs } = firestore
        const db = getFirestore(initializeApp(firebaseConfig))
        await window.atrEnsureFonts(db, firestore)
        const querySnapshot = await getDocs(collection(db, "fonts"))
        const dbData = {}
        querySnapshot.forEach((doc) => {
            dbData[doc.id] = doc.data()
        })
        const syncTasks = specimens.map(async (specimen) => {
            const docId = specimen.dataset.fontId
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
                window.fontlist[docId] = {
                    ...data,
                    // The specimen metadata is authoritative because each style
                    // can have a different human-readable font name.
                    name: specimen.dataset.catalogueName,
                    sortName: specimen.dataset.indexName,
                    family: specimen.dataset.family,
                    fontName: specimen.dataset.fontName || data.fontName
                }
            }
        })
        await Promise.all(syncTasks)
        await new Promise(resolve => setTimeout(resolve, 2000))
        await Promise.all(specimens.map(async (specimen) => {
            const docId = specimen.dataset.fontId
            const data = window.fontlist[docId]
            if (!dbData[docId] || data.funding === undefined) return
            if (data.status === "free" || (Number(data.income) || 0) < Number(data.funding)) return
            await updateDoc(doc(db, "fonts", docId), { status: "free" })
            data.status = "free"
        }))
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
			let status = window.fontlist[specimen.dataset.fontId]["status"]
			if (status != "free") {
				specimen.classList.add("statusHide")
			}
		}
		document.getElementById("displaying").innerHTML = "free fonts"
	}
	if (a == 2) {
		for (const specimen of specimens) {
			let status = window.fontlist[specimen.dataset.fontId]["status"]
			specimen.classList.toggle("statusHide", status != "paid")
		}
		document.getElementById("displaying").innerHTML = "paid fonts"
	}
}

window.sort = async function(a) {
    const container = document.getElementById("specimens")
    const specimens = [...container.children]
    const labelMapping = ["alphabetically", "by date", "by popularity"]
    const sortedOrder = [...specimens].sort((elA, elB) => {
        const idA = elA.dataset.fontId
        const idB = elB.dataset.fontId
        const dataA = window.fontlist[idA]
        const dataB = window.fontlist[idB]
        if (a === 0) {
            return elA.dataset.indexName.localeCompare(elB.dataset.indexName)
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
		window.labelCards()
	}
	else {
		for (const specimen of specimens) {
			specimen.classList.remove("familyHide")
		}
		document.getElementById("grouping").innerHTML = "displaying all styles"
		window.labelCards()
	}
}

const familyPages = new Set(["Hobo", "Newsprint Gothic", "Tiffany Gothic"])

window.setupHoverListeners = function() {
    document.getElementById("specimens").addEventListener("click", (e) => {
        const card = e.target.closest("#specimens > div")
        if (!card) return
        const family = card.dataset.family
        if (!familyPages.has(family)) return
        const folder = `family/${family.toLowerCase().replace(/\s+/g, "-")}/`
        if (document.getElementById("grouping").textContent.includes("grouped by family")) {
            window.goTo(folder)
        } else {
            const style = card.dataset.style.toLowerCase()
            window.goTo(folder + style)
        }
    })

    const specimens = document.querySelectorAll("#specimens > div")
    const infoBox = document.getElementById("infoBox")
    const infoTitle = document.getElementById("info-title")
    const infoFamily = document.getElementById("info-family")
    const infoStatus = document.getElementById("info-status")
    const allFontInfo = document.getElementById("all-font-info")
    const fontGroupInfo = document.getElementById("font-group-info")
    const aboutInfo = document.getElementById("about-info")
    const logo = document.getElementById("logo")
    const getFontName = (specimen, data) =>
        specimen.dataset.fontName || data.fontName || data.family || "Unknown"
    const showFundingStatus = (fonts, grouped = false) => {
        const funded = data => data.status === "free"
            || (Number(data.funding) > 0 && Number(data.income || 0) >= Number(data.funding))
        if (fonts.length && fonts.every(funded)) {
            infoStatus.textContent = grouped ? "fully funded" : "funded"
            return
        }
        const goal = fonts.reduce((sum, data) => sum + Math.max(0, Number(data.funding) || 0), 0)
        const raised = fonts.reduce((sum, data) => {
            const target = Math.max(0, Number(data.funding) || 0)
            return sum + (funded(data) ? target : Math.max(0, Math.min(Number(data.income) || 0, target)))
        }, 0)
        const percent = goal > 0 ? Math.min(99, Math.round(100 * raised / goal)) : 0
        const row = document.createElement("span")
        row.className = "funding-row"
        const track = document.createElement("span")
        track.className = "funding-row-track"
        track.setAttribute("role", "progressbar")
        track.setAttribute("aria-label", "Funding")
        track.setAttribute("aria-valuemin", "0")
        track.setAttribute("aria-valuemax", "100")
        track.setAttribute("aria-valuenow", percent)
        const fill = document.createElement("span")
        fill.className = "funding-row-fill"
        fill.style.setProperty("--funded", percent + "%")
        track.append(fill)
        row.append(track)
        infoStatus.replaceChildren(row)
    }
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
        document.getElementById("info-family-line").childNodes[0].textContent = "Font: "
        infoFamily.textContent = getFontName(specimen, data)
        showFundingStatus([data])
        infoTitle.textContent = specimen.dataset.displayName || specimen.getAttribute('aria-label')
        infoTitle.style.fontFamily = `"${faceName}"`
        infoTitle.style.fontWeight = faceWeight
    }
    // While a family card is hovered in grouped view, the title cycles once a
    // second through the family's styles: a uniformly random style other than
    // the one showing, starting from the card's own (default) style.
    let styleCycle = null
    const stopStyleCycle = () => {
        clearInterval(styleCycle)
        styleCycle = null
        infoTitle.cycleStyles = null
    }
    // Marks the family list entry for the style the title is shown in.
    infoTitle.markStyle = index => {
        infoFamily.querySelectorAll(".family-member").forEach((el, i) => {
            el.classList.toggle("current", i === index)
        })
    }
    const startStyleCycle = (members, start) => {
        stopStyleCycle()
        const styles = members.map(el => ({ font: el.dataset.font, weight: Number(el.dataset.weight) }))
        let current = Math.max(0, members.indexOf(start))
        if (styles.length < 2) return
        infoTitle.currentStyle = current
        infoTitle.markStyle(current)
        infoTitle.cycleStyles = styles
        styleCycle = setInterval(() => {
            if (!document.getElementById("grouping").textContent.includes("grouped by family")) return stopStyleCycle()
            let next = Math.floor(Math.random() * (styles.length - 1))
            if (next >= current) next++
            current = next
            infoTitle.currentStyle = next
            infoTitle.markStyle(next)
            infoTitle.style.fontFamily = `"${styles[next].font}"`
            infoTitle.style.fontWeight = styles[next].weight
        }, 1000)
    }
    specimens.forEach(specimen => {
        specimen.addEventListener('mouseenter', () => {
            stopStyleCycle()
            const isGrouped = document.getElementById("grouping").textContent.includes("grouped by family")
            const docId = specimen.dataset.fontId
            const data = window.fontlist[docId]
            const faceName = specimen.dataset.font
            const faceWeight = Number(specimen.dataset.weight)
            if (data) {
                aboutInfo.style.display = "none"
                if (isGrouped) {
                    const members = [...document.querySelectorAll("#specimens > div")]
                        .filter(el => el.dataset.family === data.family)
                    fontGroupInfo.style.display = "none"
                    allFontInfo.style.display = "block"
                    infoTitle.textContent = (window.ATR_FAMILY_TITLES || {})[data.family] || (members.length > 1 ? `${data.family} Family` : data.family)
                    infoTitle.style.fontFamily = `"${faceName}"`
                    infoTitle.style.fontWeight = faceWeight
                    document.getElementById("info-family-line").childNodes[0].textContent = "Fonts in Family: "
                    infoFamily.innerHTML = members.map(el =>
                        `<span class="family-member">${getFontName(el, window.fontlist[el.dataset.fontId] || {})}</span>`
                    ).join("")
                    showFundingStatus(members.map(el => window.fontlist[el.dataset.fontId] || {}), true)
                    startStyleCycle(members, specimen)
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
            stopStyleCycle()
            infoBox.style.display = "none"
        })
    })
}
