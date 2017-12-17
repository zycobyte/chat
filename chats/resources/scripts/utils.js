var DEV = window.location.hostname == "localhost"||window.location.hostname.includes("192.168");
var SERVER = DEV ? window.location.hostname == "localhost" ? "localhost" : "192.168.0.18" : "servers.us-west.eiennochat.co.uk";
var URL_PRE = DEV ? "/Eien.no%20Chat/" : "/";
var LOGIN = "/servers0/login";
var SEND = "/servers1/message";
var PROFILE = "/servers2/editProfile";
var RETRIEVE = "/servers3/refreshMessages";
var VALIDATE = "/server4/verify";
var EDIT_SERVER = "/server5/editServer";
oAuthIsValid = true;
var id = -1;

function checkValidity(){
	isValid(false);
	//console.log("Checking oAuth");
	setTimeout(function(){
		if(!oAuthIsValid){
			if(window.location.pathname.includes("chats")){
                alerting = document.getElementById("alerting");
                alerting.className = "show";
				return false;
			}
			if(window.location.pathname.includes("veify.html")){
				current = window.location.pathname;
				window.location.pathname = URL_PRE+"login.html?redirect="+current;
				return false;
			}
		}else{
			if(window.location.pathname.includes("chats")){
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
	// send = pack(format("name", readCookie("username")) + format("oAuth", readCookie("oAuth")));
    var send = JSONData();
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
					window.location.href=URL_PRE+"login.html?&id=1";
				}
			}else{
				if(!window.location.pathname.includes("chats")){
					window.location.href="chats/";
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

// function format(value, key){
// 	return value + ":" + key + ";";
// }
//
// function pack(data){
// 	raw = "";
// 	for(i = 0; i < data.length-1; i++){
// 		raw += data.charAt(i);
// 	}
// 	return "\"{"+raw+"}\"";
// }

function JSONData(rawData){

    var defaults = {"UserName":readCookie("username"), "oAuth Key":readCookie("oAuth"), "E-Mail":readCookie("email"), "id":readCookie("id"), "Chat":id};
    var result = {};
    for(var key in defaults) result[key] = ""+defaults[key];
    for(var key in rawData) result[key] = ""+rawData[key];
	return JSON.stringify(result);
}

function sendData(PORT, JSONDataToSend, onMessageMethod){
	console.log("Preparing to send data");
    var socket = new WebSocket('ws://'+SERVER+':25005'+PORT);
    var onclose = true;

    socket.onopen = function(event) {
        //console.log("sending:"+JSONDataToSend);
        socket.send(JSONDataToSend);
    };

    socket.onerror = function(error) {
        console.log('WebSocket Error: ' + error);
    };
    socket.onmessage = function(event){
    	//console.log(event.data);
		var parsedFile = JSON.parse(event.data);
		onclose = false;

		if(!parsedFile["valid"]){
			document.getElementById("alerting").className = "show";
			socket.close();
		}else {
            onMessageMethod(event, parsedFile, socket);
        }
	}
	socket.onclose = function(event) {
    	if(onclose){
    		onMessageMethod(event, "", socket);
        }
    }
}

var ws, sent, toSend;
sent = 0;

function connectToFileServer(file, folder, handle, arg) {
    ws = new WebSocket(
        "ws://"+SERVER+":25004/file-upload/");

    ws.binaryType = "arraybuffer";
    ws.onopen = function () {
        // alert("Connected.")
        sendFile(file, folder);
    };

    ws.onmessage = function (evt) {
        console.log(evt.data);
        if(evt.data.includes("{\"valid\":false}")){

        }else {
            msg += " " + evt.data;
            storeImageLink = evt.data;
        }
    };

    ws.onclose = function () {
        sent += 1;
        console.log("Connection is closed...");
        if(sent >= toSend){
            handle(arg);
        }
    };
    ws.onerror = function (e) {
        // alert(e.msg);
        console.log(e.data);
        socket.close();
        msg += " [Unable to attach file]";
        handle(arg);
    }

}

function sendFile(file, folder) {
    //var file = document.getElementById('filename').files[0];

    ws.send(JSONData({"filename":file.name, "folder":folder}));
    var reader = new FileReader();
    var rawData = new ArrayBuffer();
    //alert(file.name);

    reader.loadend = function () {

    }
    reader.onload = function (e) {
        rawData = e.target.result;
        //alert(rawData);
        ws.send(rawData);
        //alert("the File has been transferred.")
        ws.send('end');
    }
    reader.readAsArrayBuffer(file);
}

function formatMessage(message){
	return message.replaceAll("<", "&lt").replaceAll(">", "&gt").replaceAll(":", "&colon").replaceAll(";", "&semicolon").replaceAll("\"", "&speech").replaceAll("{", "&curlyopen").replaceAll("}", "&curlyclose");
}
