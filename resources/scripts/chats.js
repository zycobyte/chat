var id = 0;
var chatUpdate = 0;
var userListUpdate = 0;
var chatListUpdate = 0;
var dmListUpdate = 0;

var pleaseWait = false;
var chats = true;
var dm = false;
var storeImageLink = "", msg, creatingChat = false;
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

    //checkValidity();
    msg = message.value;
    message.value = "";

    setTimeout(function () {
        if (!oAuthIsValid) {
            return;
        }

        //timeout = 0;
        pleaseWait = true;

        toSend = document.getElementById('fileStore').files.length;
        if (document.getElementById('fileStore').files.length > 0) {
            if(document.getElementById('fileStore').files[0].size>5242880){
            	alert("Files must not exceed 5Mb.  Sorry!");
                document.getElementById('fileStore').value = null;
            	toSend = 0;
			}else{
				connectToFileServer(document.getElementById('fileStore').files[0], readCookie("username"), sendMsg);
                document.getElementById('fileStore').value = null;
				//timeout = 1000;
            }
        }
        if(toSend == 0){
        	sendMsg();
        }
    }, 1000);
}

function selectChats(){
    var chat = document.getElementById("select-chat");
    var dm = document.getElementById("select-dm");
    chat.classList = "selected";
    dm.classList = "un-selected";
    chats = true;
    chatListUpdate = 0;
}
function selectDms(){
    var chat = document.getElementById("select-chat");
    var dm = document.getElementById("select-dm");
    dm.classList = "selected";
    chat.classList = "un-selected";
    chats = false;
    dmListUpdate = 0;
}

function sendMsg(){
	// console.log(sent + " " + toSend);
    pleaseWait = false;
    msg = msg.replaceAll("<", "&lt").replaceAll(">", "&gt").replaceAll(":", "&colon").replaceAll(";", "&semicolon").replaceAll("\"", "&speech").replaceAll("{", "&curlyopen").replaceAll("}", "&curlyclose");

    var data_ = {};
    var time = new Date().getTime();
    data_ = {"content": msg, "isDm": dm, "time":time};

    var dataToSend = JSONData(data_);
    var message = msg.replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");
    message = message.replaceAll("<b>LavaTheif", "<b><mark style = \"background-color: #920e0e;color: #0066FF\">LavaTheif</mark>");

    document.getElementById("messageBox").innerHTML += "<div id = \"messageBox-"+time+"\"><br>##SENDING## " + readCookie("username") + "<br>" + message + "<br></div><br><br><br><br>";
    updateScroll();

        sendData(SEND, dataToSend, handleSendMsg);


    // var socket = new WebSocket('ws://' + SERVER + ':25005' + SEND);
    //
    //         socket.onopen = function (event) {
    //             console.log("sending:" + dataToSend);
    //             socket.send(dataToSend);
    //         };
    //
    //         socket.onerror = function (error) {
    //             console.log('WebSocket Error: ' + error);
    //         };
    //         socket.onmessage = function (event) {
    //         }
        //}, timeout);
	//}, 500);
	
}
function handleSendMsg(event, rawData,  socket){
    // message = rawData["content"];
    // var time = rawData["time"];
    //console.log(message);
    // message = message.replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose").replaceEach("\\", "\\\\");
    // if(document.getElementById("messageBox-"+time) !== null){
    //     document.getElementById("messageBox-"+time).innerHTML = message;
    // }else{
    //     document.getElementById("messageBox").innerHTML += message;
    // }
    // updateScroll();
    socket.close();
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#image-display')
                .attr('src', e.target.result)
                .width(100)
                .height(100);
        };

        reader.readAsDataURL(input.files[0]);
    }
}
function readURL_(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#image-display-')
                .attr('src', e.target.result)
                .width(100)
                .height(100);
        };

        reader.readAsDataURL(input.files[0]);
    }
}


function focusImg(src){
    var imgArea = document.getElementById("image-area");
    var imgArea_bg = document.getElementById("image-area-bg");
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

	// checkValidity();
		if(!oAuthIsValid){
			return;
		}
		
		var newChatID = "new";
		if(!newChat){
			newChatID = document.getElementById("chatid").value;
            document.getElementById('joinChatPopup').className = 'hide';
            document.getElementById('please-wait').className = 'show';
		}

		var data_ = format("oAuth", readCookie("oAuth"));
		data_ += format("username", readCookie("username"));
		data_ += format("action", "join");
		data_ += format("server", newChatID);
		dataToSend = pack(data_);
		
		//document.getElementById("messageBox").innerHTML += "<bar><br></bar>##SENDING## "+readCookie("username")+"<br>"+msg+"<br>";
        sendData(PROFILE, dataToSend, handleJoin);


		/*var socket = new WebSocket('ws://'+SERVER+':25005'+PROFILE);

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
			 *//*
			var serverID = extract(event.data);
			//console.log("before:" + id + " -- " + serverID);
			id = serverID[0].split(":")[1];
			dm = false;
			//console.log("after:" + id);
			
			socket.close();
		}*/
}
function handleJoin(event, parsedFile, socket){
    //var serverID = extract(event.data);
    if(!parsedFile["error"]) {
        id = parsedFile["chat-id"];
        dm = false;
        socket.close();
        if (creatingChat) {
            uploadChatIcon("name-of-chat", "img-upload");
        } else {
            document.getElementById('please-wait').className = 'hide';
            document.getElementById('dim').className = 'hide';
        }
    }else{
        document.getElementById('please-wait').innerHTML = "Couldn't join chat."
        setTimeout(function() {
            handleEditChat();
            socket.close();
            document.getElementById('please-wait').innerHTML = "Please wait..."
            document.getElementById('please-wait').className = 'hide';
            document.getElementById('dim').className = 'hide';
        }, 500);

    }
}
function joinDm(user){
    /*
     * "{oAuth:key;username:name;action:join;server:id}"
     */

    // checkValidity();
    if(!oAuthIsValid){
        return;
    }

    var data_ = format("oAuth", readCookie("oAuth"));
    data_ += format("username", readCookie("username"));
    data_ += format("action", "join");
    data_ += format("server", "dm");
    data_ += format("user", formatMessage(user));
    var dataToSend = pack(data_);

    //document.getElementById("messageBox").innerHTML += "<bar><br></bar>##SENDING## "+readCookie("username")+"<br>"+msg+"<br>";
    sendData(PROFILE, dataToSend, handleJoinDm);
    // var socket = new WebSocket('ws://'+SERVER+':25005'+PROFILE);
    //
    // socket.onopen = function(event) {
    //     console.log("sending:"+dataToSend);
    //     socket.send(dataToSend);
    // };
    //
    // socket.onerror = function(error) {
    //     console.log('WebSocket Error: ' + error);
    // };
    // socket.onmessage = function(event){
    //     /*
    //      * "{server:id}"
    //      */
    //     serverID = extract(event.data);
    //     //console.log("before:" + id + " -- " + serverID);
    //     id = serverID[0].split(":")[1];
    //     //console.log(id)
    //     dm = true;
    //     //console.log("after:" + id);
    //
    //     socket.close();
    // }
}

function createChat(){
    document.getElementById('createChat').className = 'hide';
    document.getElementById('please-wait').className = 'show';
    creatingChat = true;
    joinChat(true);
}

function uploadChatIcon(name_box, img_upload){
    document.getElementById('editChat').className = 'hide';
    document.getElementById('please-wait').className = 'show';

    creatingChat = false;
    storeImageLink = "";
    var imageUpload = document.getElementById(img_upload);

    toSend = imageUpload.files.length;
    if (imageUpload.files.length > 0) {
        if(imageUpload.files[0].size>5242880){
            alert("Files must not exceed 5Mb.  Sorry!");
            imageUpload.value = null;
            toSend = 0;
        }else{
            connectToFileServer(imageUpload.files[0], "chat-files-upload", handleChatIconUpload);
            imageUpload.value = null;
        }
    }else{
        handleChatIconUpload(name_box);
    }
}

function openCreateChat(){
    document.getElementById("select-public-radio-button").checked = "checked";
    document.getElementById('createChat').className = 'show';
    document.getElementById('createDM').className = 'hide';
    document.getElementById('dim').className = 'show';
}
function openCreateDM(){
    document.getElementById("select-DM-radio-button").checked = "checked";
    document.getElementById('createChat').className = 'hide';
    document.getElementById('createDM').className = 'show';
    document.getElementById('dim').className = 'show';
}
function openJoinChat(){
    document.getElementById('joinChatPopup').className = 'show';
    document.getElementById('dim').className = 'show';
}
//joinChat(false)
function createDM(user){
    document.getElementById("create-DM-with-user").value = user;
    createDM_();
}
function createDM_(){
    document.getElementById('createDM').className = 'hide';
    document.getElementById('please-wait').className = 'show';
    creatingChat = true;
    joinDm(document.getElementById("create-DM-with-user").value);
}

function handleJoinDm(event, parsedFile, socket){
    creatingChat = false;
    if(!parsedFile["error"]) {
        id = parsedFile["chat-id"];
        dm = true;
        handleEditChat();
        socket.close();
    }else{
        document.getElementById('please-wait').innerHTML = "Couldn't create DM with user."
        setTimeout(function() {
            handleEditChat();
            socket.close();
            document.getElementById('please-wait').innerHTML = "Please wait..."
        }, 500);

    }
}

function handleChatIconUpload(name_box){
    var nameOfChat = document.getElementById(name_box).value;
    var JSONDataToSend = JSONData({"new-name":formatMessage(nameOfChat), "new-image": formatMessage(storeImageLink)});
    sendData(EDIT_SERVER, JSONDataToSend, handleEditChat);
}

function openEditChatMenu(idOfChat){
    id = idOfChat;
    document.getElementById('name-of-chat-').value = "";
    document.getElementById('editChat').className = 'show';
    document.getElementById('dim').className = 'show'
}

function handleEditChat() {
    var nameOfChat = document.getElementById("name-of-chat");
    var imageUpload = document.getElementById("img-upload");
    document.getElementById("create-DM-with-user").value = "LavaTheif";
    document.getElementById('joinChatPopup').className = 'hide';
    document.getElementById('createDM').className = 'hide';
    nameOfChat.value = "Chat does not have a name yet.";
    imageUpload.value = null;
    document.getElementById('createChat').className = 'hide';
    document.getElementById('editChat').className = 'hide';
    document.getElementById('dim').className = 'hide';
    document.getElementById('please-wait').className = 'hide';
    chatListUpdate = 0;
}

function switchChat(goto){
	id = goto;
	dm = false;
	update = "";
	setTimeout(function(){
		updateScroll();
	}, 500);
}
function switchDm(goto){
    id = goto;
    dm = true;
    update = "";
    setTimeout(function(){
        updateScroll();
    }, 500);
}

function getProfile(user){
	/*
	"{oAuth:auth;username:name;action:"user";user:user;sub:"get"}"
	*/
	//checkValidity();
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
