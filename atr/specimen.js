// pick precomputed specimen lines (built by build-specimens.html)
fetch("specimen-lines.json").then(r => r.json()).then(async lines => {
    await Promise.all([...document.querySelectorAll('.specimen-live')].map(card => {
        const style = getComputedStyle(card)
        return document.fonts.load(`${style.fontWeight} 96px ${style.fontFamily}`)
    }))
    await document.fonts.load('400 24px "TiffanyGothicAlternateG"', 'g')
    document.querySelectorAll(".specimen-live").forEach(card => {
        let key = card.dataset.font
        if (card.getAttribute('aria-label').endsWith("Light")) key += "-300"
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
            span.style.fontSize = `${size * Math.min(1, available / 296)}px`
            span.style.letterSpacing = '0px'
            const range = document.createRange()
            range.selectNodeContents(span)
            let width = range.getBoundingClientRect().width
            if (width > available) {
                span.style.fontSize = `${parseFloat(span.style.fontSize) * available / width}px`
                width = range.getBoundingClientRect().width
            }
            const characters = Array.from(span.textContent).length
            if (!characters || !width) return
            let spacing = Math.max(0, available - width) / characters
            // Re-measure after spacing: shaping and browser rounding can change the result.
            for (let pass = 0; pass < 4; pass++) {
                span.style.letterSpacing = `${spacing}px`
                const remaining = available - range.getBoundingClientRect().width
                if (Math.abs(remaining) < 0.05) break
                spacing += remaining / characters
            }
        })
    }
    fit()
    const specimens = document.getElementById('specimens')
    function switchLine(span) {
        if (!span || !specimens.contains(span)) return
        const card = span.closest('.specimen-live')
        const key = card.dataset.font + (getComputedStyle(card).fontWeight === '300' ? '-300' : '')
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
