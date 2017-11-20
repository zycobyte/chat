var id = 0;
var updateCheck = "";
var pleaseWait = false;
/**/
function onSend(message) {
    /*
    "{oAuth:auth;chat:id;username:name;content:message}"
    */
    if (message.value.trim() === "" || message.value.length > 1000) {
        if (message.value.length > 1000) {
            alert("Messages must be less than 1000 characters");
        }
        return;
    }
    if (pleaseWait) {
        alert("Uploading a file, please wait...");
        return
    }

    checkValidity();
    msg = message.value;
    message.value = "";

    setTimeout(function () {
        if (!oAuthIsValid) {
            return;
        }
        var ws;
        sent = 0;

        function connectToFileServer(file) {
            ws = new WebSocket(
                "ws://"+SERVER+":25004/file-upload/");

            ws.binaryType = "arraybuffer";
            ws.onopen = function () {
                // alert("Connected.")
                sendFile(file);
            };

            ws.onmessage = function (evt) {
                console.log(evt.data);
                msg += " " + evt.data;
            };

            ws.onclose = function () {
                sent += 1;
                console.log("Connection is closed...");
                if(sent >= toSend){
                    sendMsg();
                }
            };
            ws.onerror = function (e) {
                // alert(e.msg);
				console.log(e.data);
                sendMsg();
                msg += " [Unable to attach file]";
            }

        }

        function sendFile(file) {
            //var file = document.getElementById('filename').files[0];
            ws.send('filename:' + file.name + ';folder:' + id + "/" + readCookie("username") + ';oAuth:' + readCookie("oAuth") + ';username:' + readCookie("username"));
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

        timeout = 0;
        pleaseWait = true;
        toSend = document.getElementById('filename').files.length;
        if (document.getElementById('filename').files.length > 0) {
            if(document.getElementById('filename').files[0].size>5242880){
            	alert("Files must not exceed 5Mb.  Sorry!");
                document.getElementById('filename').value = null;
            	toSend = 0;
			}else{
				connectToFileServer(document.getElementById('filename').files[0]);
                document.getElementById('filename').value = null;
				timeout = 1000;
            }
        }
        if(toSend == 0){
        	sendMsg();
        }
    }, 1000);
}
function sendMsg(){
	// console.log(sent + " " + toSend);
    pleaseWait = false;
    msg = msg.replaceAll("<", "&lt").replaceAll(">", "&gt").replaceAll(":", "&colon").replaceAll(";", "&semicolon").replaceAll("\"", "&speech").replaceAll("{", "&curlyopen").replaceAll("}", "&curlyclose");

    data_ = format("oAuth", readCookie("oAuth"));
    data_ += format("chat", id);
    data_ += format("username", readCookie("username"));
    data_ += format("content", msg);
    dataToSend = pack(data_);
	message = msg.replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");
    message = message.replaceAll("<b>LavaTheif", "<b><mark style = \"background-color: #920e0e;color: #0066FF\">LavaTheif</mark>");

    document.getElementById("messageBox").innerHTML += "<bar><br></bar>##SENDING## " + readCookie("username") + "<br>" + message + "<br>";
    updateScroll();


	var socket = new WebSocket('ws://' + SERVER + ':25005' + SEND);

            socket.onopen = function (event) {
                console.log("sending:" + dataToSend);
                socket.send(dataToSend);
            };

            socket.onerror = function (error) {
                console.log('WebSocket Error: ' + error);
            };
            socket.onmessage = function (event) {
                message = extract(event.data)[0].split(":")[1];
                //console.log(message);
                message = message.replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");
                document.getElementById("messageBox").innerHTML = message;
                updateScroll();
                socket.close();
            }
        //}, timeout);
	//}, 500);
	
}

function focusImg(src){
    imgArea = document.getElementById("image-area");
    imgArea_bg = document.getElementById("image-area-bg");
	if(src){
        imgArea.src = src;
        imgArea.classList = "show";
        imgArea_bg.classList = "show";
	}else{
        imgArea.classList = "hide";
        imgArea_bg.classList = "hide";
	}
}

function joinChat(newChat){
		/*
		 * "{oAuth:key;username:name;action:join;server:id}"
		 */

	checkValidity();
	
	setTimeout(function(){
		if(!oAuthIsValid){
			return;
		}
		
		newChatID = "new";
		if(!newChat){
			newChatID = document.getElementById("chatid").value;
		}
		
		data_ = format("oAuth", readCookie("oAuth"));
		data_ += format("username", readCookie("username"));
		data_ += format("action", "join");
		data_ += format("server", newChatID);
		dataToSend = pack(data_);
		
		//document.getElementById("messageBox").innerHTML += "<bar><br></bar>##SENDING## "+readCookie("username")+"<br>"+msg+"<br>";

		var socket = new WebSocket('ws://'+SERVER+':25005'+PROFILE);

		socket.onopen = function(event) {
			console.log("sending:"+dataToSend);
			socket.send(dataToSend);
		};

		socket.onerror = function(error) {
			console.log('WebSocket Error: ' + error);
		};
		socket.onmessage = function(event){
			/*
			 * "{server:id}"
			 */
			serverID = extract(event.data);
			console.log("before:" + id + " -- " + serverID);
			id = serverID[0].split(":")[1];
			console.log("after:" + id);
			
			socket.close();
		}
	}, 500);
}

function switchChat(goto){
	id = goto;
	update = "";
	setTimeout(function(){
		updateScroll();
	}, 500);
}

function createDM(user){
	//TODO
}

function getProfile(user){
	/*
	"{oAuth:auth;username:name;action:"user";user:user;sub:"get"}"
	*/
	checkValidity();
	setTimeout(function(){
		if(!oAuthIsValid){
			return;
		}
		
		data__ = format("oAuth", readCookie("oAuth"));
		data__ += format("username", readCookie("username"));
		data__ += format("action", "user");
		data__ += format("user", user);
		data__ += format("sub", "get");
		dataToSend__ = pack(data__);
		//console.log(data);
		var socket = new WebSocket('ws://'+SERVER+':25005'+PROFILE);

		socket.onopen = function(event) {
			//console.log("sending:"+data);
			socket.send(dataToSend__);
		};

		socket.onerror = function(error) {
			console.log('WebSocket Error: ' + error);
		};
		socket.onmessage = function(event){
			/*
			"{data:HTML}"
			*/
			data__ = extract(event.data);
			HTML = data__[0].split(":")[1].replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");
			HTML = data__[0].split(":")[1].replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");
			//console.log(HTML);
			document.getElementById("profile").innerHTML = HTML;
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
			id = 0;
			return;
		}
		
		data__ = format("oAuth", readCookie("oAuth"));
		data__ += format("chat", id);
		data__ += format("username", readCookie("username"));
		dataToSend__ = pack(data__);
		//console.log(data);
		var socket = new WebSocket('ws://'+SERVER+':25005'+RETRIVE);
		// console.log(RETRIVE);
		socket.onopen = function(event) {
			//console.log("sending:"+data);
			socket.send(dataToSend__);
		};

		socket.onerror = function(error) {
			console.log('WebSocket Error: ' + error);
		};
		socket.onmessage = function(event){
			/*
			"{messages:currentChatMessages;members:currentChatMembers;chats:allChats}"
			*/
			data__ = extract(event.data);
			// console.log(data__);

			message = data__[0].split(":")[1];
			message = message.replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");//.replaceAll(" = ", "=").replaceAll(" =", "=").replaceAll("= ", "=");

			members = data__[1].split(":")[1];
			members = members.replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose").replaceAll("LavaTheif<br>", "<b><mark style = \"background-color: #920e0e;color: #0066FF\">LavaTheif</mark></b><br>").replaceAll(" = ", "=");	
			document.getElementById("members").innerHTML = members;
			
			allChats = data__[2].split(":")[1];
			allChats = allChats.replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");
			
			if(document.getElementById("chats").innerHTML !== allChats){
				document.getElementById("chats").innerHTML = allChats;
			}
			
			messageBox = document.getElementById("messageBox");
			update = messageBox.scrollTop === (messageBox.scrollHeight - messageBox.offsetHeight);
			
			storeVar0__ = updateCheck;
			
			if(updateCheck !== data__[3].split(":")[1]){
				messageBox.innerHTML = message;
				updateCheck = data__[3].split(":")[1];
			}

			if(update || storeVar0__ == ""){
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
