function randStyle(me){
  const italic = ["italic", "normal"];
  const smallcaps = ["small-caps", "normal", "normal"];
  me.style = "font-variation-settings: \'wght\' " + 100 * Math.floor(Math.random() * 8)  + "; font-style: " + italic[Math.floor(Math.random() * 2)] + "; font-variant: " + smallcaps[Math.floor(Math.random() * 3)] + ";"
}