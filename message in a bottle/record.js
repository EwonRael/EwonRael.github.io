var config = {
	apiKey: "AIzaSyC2oMkn2Z9Zt5B2LH9Dav01HvhbDY3Ii8k",
	authDomain: "indestructibletype-hitcount.firebaseapp.com",
	databaseURL: "https://indestructibletype-hitcount.firebaseio.com",
	projectId: "indestructibletype-hitcount",
	storageBucket: "indestructibletype-hitcount.appspot.com",
	messagingSenderId: "94225162584"
};
firebase.initializeApp(config);
const rootRef = firebase.database().ref();
const bottleRef = rootRef.child("bottle");
let getHistory = new Promise(function (resolve, reject){
	let obj = {};
	bottleRef.orderByChild("page").equalTo("submit").once("value", function (snapshot){
		snapshot.forEach(function (child){
			obj = {
				key: child.key,
				name: child.val().name,
				date: child.val().date,
				from: child.val().from,
				love: child.val().love,
				fear: child.val().fear,
				want: child.val().want,
				hate: child.val().hate,
				gift: child.val().gift,
				hide: child.val().hide,
				note: child.val().note,
				nameo: child.val().nameo,
				dateo: child.val().dateo,
				fromo: child.val().fromo,
				loveo: child.val().loveo,
				fearo: child.val().fearo,
				wanto: child.val().wanto,
				hateo: child.val().hateo,
				gifto: child.val().gifto,
				hideo: child.val().hideo,
				noteo: child.val().noteo
			}
		})
		if (obj) {
			resolve(obj);
		} else {
			reject(error);
		}
	})
});

function button() {
	if (document.getElementById("name").innerHTML && document.getElementById("date").innerHTML && document.getElementById("from").innerHTML && document.getElementById("loves").innerHTML && document.getElementById("fear").innerHTML && document.getElementById("want").innerHTML && document.getElementById("hate").innerHTML && document.getElementById("gift").innerHTML && document.getElementById("hide").innerHTML && document.getElementById("note").innerHTML) {
		getHistory.then(function(fromResolve){
			var key = fromResolve.key;
			var postData = {
				page: "submit",
				name: document.getElementById("name").innerHTML,
				date: document.getElementById("date").innerHTML,
				from: document.getElementById("from").innerHTML,
				love: document.getElementById("loves").innerHTML,
				fear: document.getElementById("fear").innerHTML,
				want: document.getElementById("want").innerHTML,
				hate: document.getElementById("hate").innerHTML,
				gift: document.getElementById("gift").innerHTML,
				hide: document.getElementById("hide").innerHTML,
				note: document.getElementById("note").innerHTML,
				nameo: fromResolve.name,
				dateo: fromResolve.date,
				fromo: fromResolve.from,
				loveo: fromResolve.love,
				fearo: fromResolve.fear,
				wanto: fromResolve.want,
				hateo: fromResolve.hate,
				gifto: fromResolve.gift,
				hideo: fromResolve.hide,
				noteo: fromResolve.note,
			}
			var updates = {};
			updates["/bottle/" + key] = postData;
			rootRef.update(updates);
			window.location = "load.html"
		}).catch(function (fromReject) {
			console.log(error);
		})
	}
	else {
		document.getElementById("alert").style = "visibility: visible; z-index: 1;";
	}
}

function display() {
	getHistory.then(function(fromResolve){
		var key = fromResolve.key;
		var name = fromResolve.nameo;
		var date = fromResolve.dateo;
		var from = fromResolve.fromo;
		var love = fromResolve.loveo;
		var fear = fromResolve.fearo;
		var want = fromResolve.wanto;
		var hate = fromResolve.hateo;
		var gift = fromResolve.gifto;
		var hide = fromResolve.hideo;
		var note = fromResolve.noteo;
		document.getElementById("name").innerHTML = name;
		document.getElementById("date").innerHTML = date;
		document.getElementById("from").innerHTML = from;
		document.getElementById("loves").innerHTML = love;
		document.getElementById("fear").innerHTML = fear;
		document.getElementById("want").innerHTML = want;
		document.getElementById("hate").innerHTML = hate;
		document.getElementById("gift").innerHTML = gift;
		document.getElementById("hide").innerHTML = hide;
		document.getElementById("note").innerHTML = note;
	}).catch(function (fromReject) {
		console.log(error);
	})
}

function buttonc() {
	document.getElementById("alert").style = "visibility: visible; z-index: 1;";
}

function buttono() {
	document.getElementById("alert").style = "visibility: hidden; z-index: -1;";
}


function selectText(containerid) {
	if (document.selection) {
			var range = document.body.createTextRange();
			range.moveToElementText(document.getElementById(containerid));
			range.select();
	} else if (window.getSelection) {
			var range = document.createRange();
			range.selectNode(document.getElementById(containerid));
			window.getSelection().addRange(range);
	}
}
