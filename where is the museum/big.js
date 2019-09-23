var wid = window.innerWidth / 710;

function resize() {
  document.getElementById('img').style = "transform: scale(" + wid + ");";
}

function lobby() {
  var wid = window.innerWidth / 710;
  document.getElementById('img').style = "transform: scale(" + wid + ");";
  document.getElementById("enter").play();
  document.getElementById("i").pause();
  document.getElementById("stairwell").pause();
  document.getElementById("img").useMap = "#lobby";
  document.getElementById("img").src = "map/lobby.svg"
  document.getElementById('img').style = "transform: scale(" + wid + ");";
}

function stairs() {
  document.getElementById("enter").pause();
  document.getElementById("i").pause();
  document.getElementById("stairwell").play();
  document.getElementById("img").useMap = "#stairs";
  document.getElementById("img").src = "map/stairs.svg"
}

function f01() {
  document.getElementById("stairwell").pause();
  document.getElementById("enter").pause();
  document.getElementById("ii").pause();
  document.getElementById("xxvi").pause();
  document.getElementById("i").play();
  document.getElementById("img").useMap = "#01";
  document.getElementById("img").src = "map/01.svg"
}

function f02() {
  document.getElementById("i").pause();
  document.getElementById("iii").pause();
  document.getElementById("ii").play();
  document.getElementById("img").useMap = "#02";
  document.getElementById("img").src = "map/02.svg"
}

function f03() {
  document.getElementById("ii").pause();
  document.getElementById("iv").pause();
  document.getElementById("v").pause();
  document.getElementById("vi").pause();
  document.getElementById("iii").play();
  document.getElementById("img").useMap = "#03";
  document.getElementById("img").src = "map/03.svg"
}

function f04() {
  document.getElementById("iii").pause();
  document.getElementById("v").pause();
  document.getElementById("iv").play();
  document.getElementById("img").useMap = "#04";
  document.getElementById("img").src = "map/04.svg"
}

function f05() {
  document.getElementById("iv").pause();
  document.getElementById("iii").pause();
  document.getElementById("v").play();
  document.getElementById("img").useMap = "#05";
  document.getElementById("img").src = "map/05.svg"
}

function f06() {
  document.getElementById("iii").pause();
  document.getElementById("vii").pause();
  document.getElementById("ix").pause();
  document.getElementById("x").pause();
  document.getElementById("vi").play();
  document.getElementById("img").useMap = "#06";
  document.getElementById("img").src = "map/06.svg"
}

function f07() {
  document.getElementById("vi").pause();
  document.getElementById("viii").pause();
  document.getElementById("vii").play();
  document.getElementById("img").useMap = "#07";
  document.getElementById("img").src = "map/07.svg"
}

function f08() {
  document.getElementById("vii").pause();
  document.getElementById("viii").play();
  document.getElementById("img").useMap = "#08";
  document.getElementById("img").src = "map/08.svg"
}

function f09() {
  document.getElementById("vi").pause();
  document.getElementById("ix").play();
  document.getElementById("img").useMap = "#09";
  document.getElementById("img").src = "map/09.svg"
}

function f10() {
  document.getElementById("vi").pause();
  document.getElementById("xi").pause();
  document.getElementById("x").play();
  document.getElementById("img").useMap = "#10";
  document.getElementById("img").src = "map/10.svg"
}

function f11() {
  document.getElementById("xii").pause();
  document.getElementById("x").pause();
  document.getElementById("xi").play();
  document.getElementById("img").useMap = "#11";
  document.getElementById("img").src = "map/11.svg"
}

function f12() {
  document.getElementById("xi").pause();
  document.getElementById("xiii").pause();
  document.getElementById("xiv").pause();
  document.getElementById("xv").pause();
  document.getElementById("xvi").pause();
  document.getElementById("xii").play();
  document.getElementById("img").useMap = "#12";
  document.getElementById("img").src = "map/12.svg"
}

function f13() {
  document.getElementById("xii").pause();
  document.getElementById("xiii").play();
  document.getElementById("img").useMap = "#13";
  document.getElementById("img").src = "map/13.svg"
}

function f14() {
  document.getElementById("xii").pause();
  document.getElementById("xiv").play();
  document.getElementById("img").useMap = "#14";
  document.getElementById("img").src = "map/14.svg"
}

function f15() {
  document.getElementById("xii").pause();
  document.getElementById("xv").play();
  document.getElementById("img").useMap = "#15";
  document.getElementById("img").src = "map/15.svg"
}

function f16() {
  document.getElementById("xii").pause();
  document.getElementById("xvii").pause();
  document.getElementById("xviii").pause();
  document.getElementById("xix").pause();
  document.getElementById("xx").pause();
  document.getElementById("bathroom").pause();
  document.getElementById("xvi").play();
  document.getElementById("img").useMap = "#16";
  document.getElementById("img").src = "map/16.svg"
}

function f17() {
  document.getElementById("xvi").pause();
  document.getElementById("xvii").play();
  document.getElementById("img").useMap = "#17";
  document.getElementById("img").src = "map/17.svg"
}

function f18() {
  document.getElementById("xvi").pause();
  document.getElementById("xviii").play();
  document.getElementById("img").useMap = "#18";
  document.getElementById("img").src = "map/18.svg"
}

function f19() {
  document.getElementById("xvi").pause();
  document.getElementById("xix").play();
  document.getElementById("img").useMap = "#19";
  document.getElementById("img").src = "map/19.svg"
}

function f20() {
  document.getElementById("xxv").pause();
  document.getElementById("xvi").pause();
  document.getElementById("xxi").pause();
  document.getElementById("xxiv").pause();
  document.getElementById("xx").play();
  document.getElementById("img").useMap = "#20";
  document.getElementById("img").src = "map/20.svg"
}

function f21() {
  document.getElementById("xx").pause();
  document.getElementById("xxii").pause();
  document.getElementById("xxiii").pause();
  document.getElementById("xxi").play();
  document.getElementById("img").useMap = "#21";
  document.getElementById("img").src = "map/21.svg"
}

function f22() {
  document.getElementById("xxi").pause();
  document.getElementById("xxii").play();
  document.getElementById("img").useMap = "#22";
  document.getElementById("img").src = "map/22.svg"
}

function f23() {
  document.getElementById("xxi").pause();
  document.getElementById("xxiii").play();
  document.getElementById("img").useMap = "#23";
  document.getElementById("img").src = "map/23.svg"
}

function f24() {
  document.getElementById("xx").pause();
  document.getElementById("xxv").pause();
  document.getElementById("xxvi").pause();
  document.getElementById("xxiv").play();
  document.getElementById("img").useMap = "#24";
  document.getElementById("img").src = "map/24.svg"
}

function f25() {
  document.getElementById("xx").pause();
  document.getElementById("xxiv").pause();
  document.getElementById("xxv").play();
  document.getElementById("img").useMap = "#25";
  document.getElementById("img").src = "map/25.svg"
}

function f26() {
  document.getElementById("xxiv").pause();
  document.getElementById("i").pause();
  document.getElementById("xxvi").play();
  document.getElementById("img").useMap = "#26";
  document.getElementById("img").src = "map/26.svg"
}

function bathroom() {
  document.getElementById("xvi").pause();
  document.getElementById("bathroom").play();
  document.getElementById("img").useMap = "#bathroom";
  document.getElementById("img").src = "map/bathroom.svg"
}

function outside() {
  document.getElementById("enter").pause();
  document.getElementById("img").useMap = "#enter";
  document.getElementById("img").src = "map/outside.svg"
}
