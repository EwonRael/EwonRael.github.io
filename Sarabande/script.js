function allPlay() {
  var all = new Audio('all.mp3');
  all.play();
  setTimeout(function(){ document.getElementById("play").id = "red2", document.getElementById("c1").className = "red"; }, 20);
  setTimeout(function(){ document.getElementById("c1").className = "hi", document.getElementById("c2").className = "red"; }, 1620);
  setTimeout(function(){ document.getElementById("c2").className = "hi", document.getElementById("c3").className = "red"; }, 3225);
  setTimeout(function(){ document.getElementById("c3").className = "hi", document.getElementById("c4").className = "red"; }, 3729);
  setTimeout(function(){ document.getElementById("c4").className = "hi", document.getElementById("c5").className = "red"; }, 4309);
  setTimeout(function(){ document.getElementById("c5").className = "hi", document.getElementById("c6").className = "red"; }, 4788);
  setTimeout(function(){ document.getElementById("c6").className = "hi", document.getElementById("c7").className = "red"; }, 5675);
  setTimeout(function(){ document.getElementById("c7").className = "hi", document.getElementById("c8").className = "red"; }, 6450);
  setTimeout(function(){ document.getElementById("red2").id = "play", document.getElementById("c8").className = "hi"; }, 8759);
}

function Pall(n) {
  var audio = new Audio(n);
  audio.play();
  var ye = "c" + n.substr(0, 1);
  if (n.substr(0, 1) <= 2) {
    timer = 1800;
  }
  else if (n.substr(0, 1) == 8) {
    timer = 2000;
  }
  else {
    timer = 800;
  }
  setTimeout(function(){ document.getElementById(ye).className = "red"; }, 20);
  setTimeout(function(){ document.getElementById(ye).className = "hi"; }, timer);
}
