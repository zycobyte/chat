function newKey(){
	checkValidity();
		setTimeout(function(){
			if(!oAuthIsValid){
				document.getElementById("result").innerHTML = "Couldn't generate new key.  Try logging in again.";
			}
				
				toSend = "\"{oAuth:"+readCookie("oAuth")+";username:"+readCookie("username")+";action:new-verify}\"";
				
				var socket = new WebSocket('ws://'+SERVER+':25005'+PROFILE);

				// Show a connected message when the WebSocket is opened.
				socket.onopen = function(event) {
					console.log("sending:"+toSend);
					socket.send(toSend);
				};

				// Handle any errors that occur.
				socket.onerror = function(error) {
					console.log('WebSocket Error: ' + error);
				};

				socket.onmessage = function(event) {
					console.log(event.data);
					recived = extract(event.data);
					reply = recived[0].split(":")[1];
					document.getElementById("result").innerHTML = reply;					
				}
	}, 1000);
}

function check(){
	checkValidity();
		setTimeout(function(){
			if(!oAuthIsValid){
				redirect = location.href.split(location.hostname)[1];
				if(location.hostname == "localhost"){
					redirect = redirect.split(location.port)[1];
				}
				location.href = "login.html?redirect=" + redirect;
			}
			if(location.href.includes("?validationKey=")){
				key = location.href.split("?validationKey=")[1];
				document.getElementById("result").innerHTML = "Verifying E-Mail";
				
				toSend = "\"{oAuth:"+readCookie("oAuth")+";username:"+readCookie("username")+";action:verify;email:"+readCookie("email")+";key:"+key+"}\"";
				
				var socket = new WebSocket('ws://'+SERVER+':25005'+PROFILE);

				// Show a connected message when the WebSocket is opened.
				socket.onopen = function(event) {
					console.log("sending:"+toSend);
					socket.send(toSend);
				};

				// Handle any errors that occur.
				socket.onerror = function(error) {
					console.log('WebSocket Error: ' + error);
				};

				socket.onmessage = function(event) {
					console.log(event.data);
					recived = extract(event.data);
					valid = recived[0].split(":")[1] == "true";
					if(valid){
						document.getElementById("result").innerHTML = "E-Mail verified!";
					}else{
						document.getElementById("result").innerHTML = "Unable to verify E-Mail<br>"+recived[1].split(":")[1];
					}
					
				}
			}else{
				document.getElementById("result").innerHTML = "Please provide the correct key";
			}
	}, 1000);
}