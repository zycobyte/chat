function retriveMsgs(){
        if(!oAuthIsValid){
            id = 0;
            return;
        }

    var dataToSend__ = JSONData({"isDm": dm, "chat-update": chatUpdate, "users-update": userListUpdate, "chats-update":chatListUpdate, "dms-update": dmListUpdate});
    sendData(RETRIEVE, dataToSend__, handleUpdateMessages);
        //console.log(data);
    //     var socket = new WebSocket('ws://'+SERVER+':25005'+RETRIVE);
    //     // console.log(RETRIVE);
    //     socket.onopen = function(event) {
    //         //console.log("sending:"+data);
    //         socket.send(dataToSend__);
    //     };
    //
    //     socket.onerror = function(error) {
    //         console.log('WebSocket Error: ' + error);
    //     };
    //     socket.onmessage = function(event){
    //
    // }

}

setInterval(retriveMsgs, 500);

function handleUpdateMessages(event, JSONData, socket){
    /*
"{messages:currentChatMessages;members:currentChatMembers;chats:allChats}"
*/
    // data__ = extract(event.data);
    // console.log(data__);
    var keys = JSONData["keys"].split(";");
    var storeVar0 = false;
    var messageBox = document.getElementById("messageBox");
    if(keys.includes("chatMessages")) {
        var message = JSONData["chatMessages"];
        message = message.replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");
        message = message.replaceEach("\\", "\\\\");
        messageBox.innerHTML = message;
        storeVar0 = chatUpdate == "";
        chatUpdate = JSONData["chatUpdate"];
    }
    if(keys.includes("membersInChat")) {
        var members = JSONData["membersInChat"];
        members = members.replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose").replaceAll("LavaTheif<br>", "<b><mark style = \"background-color: #920e0e;color: #0066FF\">LavaTheif</mark></b><br>").replaceAll(" = ", "=");
        document.getElementById("members").innerHTML = members;
        userListUpdate = JSONData["userListUpdate"];
    }
    if(keys.includes("chatList")) {
        var allChats = JSONData["chatList"];
        allChats = allChats.replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");
        chatListUpdate = JSONData["chatListUpdate"];
        if(chats) document.getElementById("chats").innerHTML = allChats;
    }
    if(keys.includes("dmList")) {
        var allDms = JSONData["dmList"];
        allDms = allDms.replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");
        dmListUpdate = JSONData["dmListUpdate"];
        if(!chats) {
            document.getElementById("chats").innerHTML = allDms;
        }
    }

    var update = messageBox.scrollTop === (messageBox.scrollHeight - messageBox.offsetHeight);
    if(update || storeVar0){
        updateScroll();
    }
    socket.close();

}