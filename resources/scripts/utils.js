var SERVER = window.location.hostname == "localhost" ? "localhost" : "servers.us-west.eiennochat.co.uk";
var LOGIN = "/servers0/login";
var SEND = "/servers1/message";
var PROFILE = "/servers2/editProfile";
var RETRIVE = "/servers3/refreshMessages";
var VALIDATE = "/server4/verify";
oAuthIsValid = true;

function checkValidity(){
	isValid(false);
	//console.log("Checking oAuth");
	setTimeout(function(){
		if(!oAuthIsValid){
			if(window.location.pathname.includes("chats.html")){
                alerting = document.getElementById("alerting");
                alerting.className = "show";
				return false;
			}
			if(window.location.pathname.includes("veify.html")){
				current = window.location.pathname;
				window.location.pathname = "login.html?redirect="+current;
				return false;
			}
		}else{
			if(window.location.pathname.includes("chats.html")){
                alerting = document.getElementById("alerting");
                alerting.className = "hide";
				return true;
			}
		}
	}, 1000);
}

setInterval(checkValidity, 60*30*1000);

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
String.prototype.replaceEach = function(replacement, search) {
    var target = this;
    return target.split(search).join(replacement);
};


function isValid(auto){
	var socket = new WebSocket('ws://'+SERVER+':25005'+VALIDATE);
	send = pack(format("name", readCookie("username")) + format("oAuth", readCookie("oAuth")));
	valid = false;
	
	socket.onopen = function(event) {
		//console.log(send);
		socket.send(send);
	};
	
	socket.onerror = function(error) {
		console.log('WebSocket Error: ' + error);
	};
	
	socket.onmessage = function(event) {
	  	var message = event.data;
		socket.close();
		data = extract(message);
		valid = data[0].split(":")[1] === "true";
		if(auto){
			if(!valid){
				if(!window.location.pathname.includes("login.html") && !window.location.pathname.includes("signup.html")){
					window.location.href="login.html?&id=1";
				}
			}else{
				if(!window.location.pathname.includes("chats.html")){
					window.location.href="chats.html";
				}
			}
		}else{
			oAuthIsValid = valid;
		}

	};
}

function extract(data){
	return data.replaceAll("\"", "").replaceAll("{", "").replaceAll("}", "").trim().split(";");
}

function format(value, key){
	return value + ":" + key + ";";
}

function pack(data){
	raw = "";
	for(i = 0; i < data.length-1; i++){
		raw += data.charAt(i);
	}
	return "\"{"+raw+"}\"";
}