function randStyle(me){
  const italic = ["italic", "normal"];
  const smallcaps = ["small-caps", "normal", "normal"];
  me.style = "font-variation-settings: \'wght\' " + 100 * Math.floor(Math.random() * 8)  + "; font-style: " + italic[Math.floor(Math.random() * 2)] + "; font-variant: " + smallcaps[Math.floor(Math.random() * 3)] + ";"
}

function showme(){
  document.getElementById("blackout").style = "background-color: white; cursor: default;"
  document.getElementById("blackout2").innerHTML = "As the podcast develops things start to become stranger and stranger. It seems as though the lack of information on this art movement isn't just because it is lost to time, but due to an active conspiracy involving the US Government. No one wants to talk, and when they do their stories don't add up. What happened to Lynda Alden? What does her untimely death have to do with this conspiracy? Are we in danger?"
  document.getElementById("blackout2").style = "background-color: white; cursor: default;"
  document.getElementById("blackout").innerHTML = "Eventually things escalate so much it becomes obvious that the podcast, which purported to be true, is actually a work of fiction. There never was an art movement called \"Trickism.\" Lynda Alden never existed. It, itself is a work of Trickism. The podcast spends a great deal of time explaining exactly how it's own mechanisms of trickery work, and it still succeeds in tricking you in the end."
}

function tweetRand(){
  var i = parseInt(Math.random() * tweets.length)
  document.getElementById("tweetRand").innerHTML = "<span>" + tweets[i] + "</span>"
}
