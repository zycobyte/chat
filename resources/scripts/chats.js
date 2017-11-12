var id = 0;

function onSend(message){
	/*
	"{oAuth:auth;chat:id;username:name;content:message}"
	*/
	if(message.value.trim() === "" || message.value.length > 1000){
		if(message.value.length > 1000){
			alert("Messages must be less than 1000 characters");
		}
		return;
	} 
	checkValidity();
	msg = message.value;
	message.value = "";
	
	setTimeout(function(){
		if(!oAuthIsValid){
			return;
		}
		
		msg = msg.replaceAll("<", "&lt").replaceAll(">", "&gt").replaceAll(":", "&colon").replaceAll(";", "&semicolon").replaceAll("\"", "&speech").replaceAll("{", "&curlyopen").replaceAll("}", "&curlyclose");
		
		data = format("oAuth", readCookie("oAuth"));
		data += format("chat", id);
		data += format("username", readCookie("username"));
		data += format("content", msg);
		data = pack(data);
		
		document.getElementById("messageBox").innerHTML += "<bar><br></bar>##SENDING## "+readCookie("username")+"<br>"+msg+"<br>";
		updateScroll();


		var socket = new WebSocket('ws://'+SERVER+':'+PORT_SEND);

		socket.onopen = function(event) {
			console.log("sending:"+data);
			socket.send(data);
		};

		socket.onerror = function(error) {
			console.log('WebSocket Error: ' + error);
		};
		socket.onmessage = function(event){
			message = extract(event.data)[0].split(":")[1];
			//console.log(message);
			message = message.replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");
			document.getElementById("messageBox").innerHTML = message;
			updateScroll();
			socket.close();
		}
	}, 500);
	
}

function retriveMsgs(){
	/*
	"{oAuth:auth;chat:id;username:name}"
	*/
	checkValidity();
	setTimeout(function(){
		if(!oAuthIsValid){
			return;
		}
		
		data = format("oAuth", readCookie("oAuth"));
		data += format("chat", id);
		data += format("username", readCookie("username"));
		data = pack(data);
		console.log(data);
		var socket = new WebSocket('ws://'+SERVER+':'+PORT_RETRIVE);

		socket.onopen = function(event) {
			//console.log("sending:"+data);
			socket.send(data);
		};

		socket.onerror = function(error) {
			console.log('WebSocket Error: ' + error);
		};
		socket.onmessage = function(event){
			data = extract(event.data);
			message = data[0].split(":")[1];
			message = message.replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");
			
			members = data[1].split(":")[1];
			members = members.replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");	
			document.getElementById("members").innerHTML = members;
			
			messageBox = document.getElementById("messageBox");
			update = messageBox.scrollTop === (messageBox.scrollHeight - messageBox.offsetHeight);
			
			messageBox.innerHTML = message;
			if(update){
				updateScroll();
			}
			socket.close();
		}
	}, 100);
	
}

setInterval(retriveMsgs, 500);

function updateScroll(){
    var element = document.getElementById("messageBox");
    element.scrollTop = element.scrollHeight;
}

function addListener(id, button){
	document.getElementById(id)
	    .addEventListener("keyup", function(event) {
	    event.preventDefault();
	    if (event.keyCode === 13) {
	        document.getElementById(button).click();
	    }
	});
}
