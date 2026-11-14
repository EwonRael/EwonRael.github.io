window.ATR_FONTS = {
  "HoboATR-Regular": {
    "catalogueName": "Hobo",
    "family": "Hobo",
    "menuFamily": "Hobo ATR",
    "style": "Regular",
    "weight": 400,
    "width": 5,
    "indexName": "Hobo",
    "released": "2026-09-07",
    "status": "free",
    "funding": 0
  },
  "HoboATR-Light": {
    "catalogueName": "Light Hobo",
    "family": "Hobo",
    "menuFamily": "Hobo ATR",
    "style": "Light",
    "weight": 300,
    "width": 5,
    "indexName": "Hobo Light",
    "released": "2026-09-07",
    "status": "free",
    "funding": 0
  },
  "NewsprintGothicATR-Regular": {
    "catalogueName": "Newsprint Gothic",
    "family": "Newsprint Gothic",
    "menuFamily": "Newsprint Gothic ATR",
    "style": "Regular",
    "weight": 400,
    "width": 5,
    "indexName": "Newsprint Gothic",
    "released": "2026-09-07",
    "status": "paid",
    "funding": 10000
  },
  "TiffanyGothicATR-Regular": {
    "catalogueName": "Tiffany Gothic",
    "family": "Tiffany Gothic",
    "menuFamily": "Tiffany Gothic ATR",
    "style": "Regular",
    "weight": 400,
    "width": 5,
    "indexName": "Tiffany Gothic",
    "released": "2026-09-07",
    "status": "free",
    "funding": 0
  }
}

// A visitor can arrive on a family or download page before opening the index.
// Create missing records transactionally, preserving every existing tally.
window.atrEnsureFonts = async function(db, firestore) {
    const entries = Object.entries(window.ATR_FONTS)
    const refs = entries.map(([id]) => firestore.doc(db, "fonts", id))
    await firestore.runTransaction(db, async transaction => {
        const snapshots = await Promise.all(refs.map(ref => transaction.get(ref)))
        entries.forEach(([id, font], i) => {
            if (snapshots[i].exists()) return
            transaction.set(refs[i], {
                name: font.catalogueName,
                sortName: font.indexName,
                fontName: font.catalogueName + " ATR",
                family: font.family,
                date: font.released,
                status: font.status,
                funding: font.funding,
                income: 0,
                downloads: 0
            })
        })
    })
}
