fetch("specimen-lines.json").then(r => r.json()).then(async lines => {
    await Promise.all([...document.querySelectorAll('.specimen-live')].map(card => {
        const style = getComputedStyle(card)
        return document.fonts.load(`${style.fontWeight} 96px ${style.fontFamily}`)
    }))
    await document.fonts.load('400 24px "TiffanyGothicAlternateG"', 'g')
    document.querySelectorAll(".specimen-live").forEach(card => {
        const key = card.dataset.fontId
        const fontLines = lines[key]
        if (!fontLines) return
        card.querySelectorAll("span").forEach(span => {
            const options = fontLines[parseFloat(span.style.fontSize)]
            if (options && options.length) {
                span.textContent = options[Math.floor(Math.random() * options.length)]
            }
        })
    })
    function fit(spans = document.querySelectorAll('.specimen-live span')) {
        spans.forEach(span => {
            const size = Number(span.dataset.size || parseFloat(span.style.fontSize))
            span.dataset.size = size
            const style = getComputedStyle(span)
            const available = parseFloat(style.width) - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
            if (available <= 0) return
            // Scale the whole waterfall with the card, including above its
            // original desktop width, rather than stretching the tracking.
            span.style.fontSize = `${size * available / 296}px`
            span.style.letterSpacing = '0px'
            const range = document.createRange()
            range.selectNodeContents(span)
            const width = range.getBoundingClientRect().width
            if (width > available) {
                span.style.fontSize = `${parseFloat(span.style.fontSize) * available / width}px`
            }
        })
    }
    fit()
    const specimens = document.getElementById('specimens')
    function switchLine(span) {
        if (!span || !specimens.contains(span)) return
        const card = span.closest('.specimen-live')
        const key = card.dataset.fontId
        const options = (lines[key]?.[span.dataset.size] || []).filter(text => text !== span.textContent)
        if (!options.length) return
        span.textContent = options[Math.floor(Math.random() * options.length)]
        fit([span])
    }
    // Delegation also handles cards cloned by the sorting animation.
    let hoverTimer
    let hoveredLine
    function cancelHover() {
        clearTimeout(hoverTimer)
        hoveredLine = null
    }
    specimens.addEventListener('pointerover', event => {
        if (event.pointerType === 'touch') return
        const span = event.target.closest('.specimen-live span')
        if (!span || span === hoveredLine) return
        cancelHover()
        hoveredLine = span
        hoverTimer = setTimeout(() => {
            if (span.isConnected && span.matches(':hover')) switchLine(span)
        }, 3000)
    })
    specimens.addEventListener('pointerout', event => {
        if (hoveredLine && !hoveredLine.contains(event.relatedTarget)) cancelHover()
    })
    specimens.addEventListener('pointerdown', cancelHover)
    window.addEventListener('blur', cancelHover)
    document.addEventListener('visibilitychange', cancelHover)
    window.addEventListener('resize', () => fit())
    new MutationObserver(records => {
        if (records.some(record => [...record.addedNodes].some(node => node.nodeType === 1))) fit()
    }).observe(document.getElementById('specimens'), {childList: true})
}).catch(error => console.error('Specimen loading failed:', error))
