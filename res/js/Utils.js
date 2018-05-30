pre = (window.location.hostname==="localhost"?"/Website":"");
let server = (window.location.hostname==="localhost"?"ws://localhost":"wss://eiennochat.uk")+":2096/eiennosocket/data";
let dataserver = (window.location.hostname==="localhost"?"ws://localhost":"wss://eiennochat.uk")+":2087/datasocket/data";

allowStorage = (typeof(Storage) !== "undefined");
messages = 0;
getChatMsgs=true;
messageStore = [];

let socket;//sockets should only be accessed from here to ensure data is encrypted and handled properly
let dataSocket;
let open = false;
let open_data = false;
let toSend = [];
let recieved = 0;

let canConnect = true;
let fails = 0;

let focused = true;

window.onfocus = function() {
    focused = true;
};
window.onblur = function() {
    focused = false;
};
setInterval(function () {
    if(!window.location.href.includes("chats") || window.location.href.includes("join")) return;
    if(!open || !open_data){
        if(!($('#loading-message-box').html()==="Attempting to establish a secure connection to the Eien.no Chat Servers")) {
            $('#loading-message').removeClass("hidden").addClass("show");
            $('#loading-message-box').html("Attempting to establish a secure connection to the Eien.no Chat Servers");
        }
    }else{
        if($('#loading-message-box').html()==="Attempting to establish a secure connection to the Eien.no Chat Servers"){
            fails = 0;
            $('#loading-message').removeClass("show").addClass("hidden");
            $('#loading-message-box').html("Loading");
        }
    }
    if(!dataSocket && canConnect){
        // dataSocket.close();
        init_data_socket();
    }
    if(!socket && canConnect){
        // socket.close();
        let json = {"username":read("username"), "token":read("token"), "data":"request", "requests":""};
        send(json, none);
    }
    if(fails >= 4 && canConnect){
        canConnect = false;
        setTimeout(function () {
            canConnect = true;
        }, 10000)
    }
}, 100);

function init_data_socket(){
    // setTimeout(function() {
    //     if(recieved < 1 && open){//Ensures first message is recieved, containing the id
    //         init_data_socket();
    //         return;
    //     }
    //     if (!dataSocket && canConnect) {
            try{
                // dataSocket.close();
                dataSocket = new WebSocket(dataserver);
            }catch(err){
                fails++;
                // if(fails > 4)canConnect = false;
                return;
            }

            dataSocket.onopen = function (event) {
                console.log("[Connect] Connected to Eien.no Chat servers");
                open_data = true;
                let s = JSON.stringify({"id": `${read("id")}`});
                dataSocket.send(s);
            };
            dataSocket.onerror = function (error) {
                console.log('[Error] A secure connection couldn\'t be made with the Eien.no Chat servers');
                // dataSocket = null;
                // fails++;
            };
            dataSocket.onclose = function (event) {
                console.log("[Close] The connection to the Eien.no Chat servers has been closed");
                dataSocket = null;
                fails++;
                open_data = false;
                // if(fails > 4)canConnect = false;
                // init_data_socket()//re open the socket
            };
            dataSocket.onmessage = function (event) {
                let reply = JSON.parse(event.data);
                handleRecieveDataFromServer(reply);
            };
        // }else{
        //     init_data_socket()
        // }
    // }, 100);
}
function handleRecieveDataFromServer(data){
    if(data["type"] === "newmessage"){
        let online = JSON.parse(read("online"));
        if(data["mentions"].split(";").includes(read("id")) || data["is_dm"]==="true"){
            if(!(data["sender_id"]===read("id"))) {
                let status = online["id"];
                let message = JSON.parse(online["message"])[status];
                if (message) {
                    let tosend = {
                        "username": read("username"),
                        "token": read("token"),
                        "data": "msg",
                        "channel_id": "" + data["channel_id"],
                        "chat_id": `${data["chat_id"]}`,
                        "is_dm": `${data["is_dm"]}`,
                        "content": "##Auto Reply## " + message,
                        "embed_data": null,
                        "uploads": null,
                        "mentions": ""
                    };
                    send(tosend, none);
                }
            }
        }
        //add message
        if(data["chat_id"]===currentChatID) {
            if(!focused){
                if(!(online["id"]==="3")){
                    document.getElementById('message_new_wav').play()
                }
            }
            messages++;
            let scrollArea = $('#message-area');
            let autoScroll = scrollArea.scrollTop() + scrollArea.innerHeight() >= scrollArea[0].scrollHeight;
            // let area = $('#msgs');
            addMessage(data);
            // let d = new Date(Number(data["date"]));
            // area.append(`<div class="chat-area">
            //         ${!data["sender_name"]?`<div style="width:1px;height:30px;"></div>`:`<div class="chat-area-pp" onclick="openProfile('${data["sender_name"]+"', '"+data["sender_id"]}')"></div>
            //         <div class="chat-area-username" onclick="openProfile('${data["sender_name"]+"', '"+data["sender_id"]}')">${data["sender_name"]}<div class="chat-area-rank-icon"></div></div>`}
            //         <div class="chat-area-date">${d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + " at " + d.getHours() + ":" + d.getMinutes()}</div>
            //         <div class="chat-area-content">${linkify(data["content"])}</div>
            //         <div class="chat-area-bar"></div>
            //         </div>`);
            if (autoScroll) {
                //If at bottom before new message
                let height = scrollArea[0].scrollHeight;
                scrollArea.scrollTop(height);
            }
            if (messages > 50) {
                $('#msgs').children().eq(0).remove();
            }
        }else{
            if(!(online["id"]==="3")){
                document.getElementById('message_new_wav').play()
            }

            let amount = messageStore[data["chat_id"]];
            if(!amount)amount = 0;
            amount += 1;
            messageStore[data["chat_id"]] = amount;

            amount = messageStore[data["is_dm"]];
            if(!amount)amount = 0;
            amount += 1;
            messageStore[data["is_dm"]] = amount;

            let d = JSON.parse(read("dms"));
            if(Object.keys(d).length === 0){
                $('#your-dm-list').html("You currently have no DMs");
            }else{
                $('#your-dm-list').html("");
            }
            for(let chat in d){
                addChat(chat, true);
            }
            reorderChats();
            messageStoreDisply();
        }
    }else if(data["type"]==="chatsettings"){
        if(currentChatID===data["chatID"]) {
            getChatMsgs = false;
            handleOpenChat(data);
        }

    }else if(data["type"]==="userleave"){
        if(data["chat"]===currentChatID){
            currentChatUsers[data["user"]] = null;
            $('#'+data["user"]).remove();
        }
    }else if(data["type"]==="userjoin"){
        if(data["chat"]===currentChatID){
            currentChatUsers[data["user"]] = "not null";
        }
    }else if(data["type"]==="kicked"){
        if(data["chat"]===currentChatID) {
            currentChatID = "";
            currentChatUsers = null;
            currentChatRoles = null;
            currentChatData = null;
            message("You have been kicked from the chat.");
            safeClose();
        }
    }else if(data["type"]==="userstatus"){
        if(!currentChatUsers[data["users_id"]])return;
        updateChatUser(data["users_id"], JSON.parse(data["users_data"]))
    }else if(data["data"]==="request"){
        requestData(data["requests"]);
    }
    // console.log(data);//TODO anything else added
}

function send(data, method) {
    //Data should ALWAYS be in a JSON format.  There will be errors if its not.
    //If no socket connected, then make a new one
    if (!socket) {
        try{
            // socket.close();
            socket = new WebSocket(server);
        }catch(err){
            fails++;
            // if(fails > 4)canConnect = false;
            // requestData(" ");
            return;
        }

        socket.onopen = function (event) {
            console.log("[Connect] Connected to Eien.no Chat servers");
            // if(window.location.href.includes("chats")&&!window.location.href.includes("join")) {
            //     if (!$('#loading-message-box').html().includes("Loading")) {
            //         $('#loading-message').removeClass("show").addClass("hidden");
            //     }
            // }
            open = true;
            for (let i = 0; i < toSend.length; i++) {
                let s = JSON.stringify(toSend[i]);
                socket.send(s);
            }
            toSend = [];
        };
        socket.onerror = function (error) {
            console.log('[Error] A secure connection couldn\'t be made with the Eien.no Chat servers');
        };
        socket.onclose = function (event) {
            console.log("[Close] The connection to the Eien.no Chat servers has been closed");
            // if(window.location.href.includes("chats")&&!window.location.href.includes("join")) {
            //     $('#loading-message').removeClass("hidden").addClass("show");
            //     $('#loading-message-box').html("Attempting to establish a secure connection to the Eien.no Chat Servers");
            // }
            socket = null;
            open = false;
            // fails++;
            // if(fails > 4)canConnect = false;
            //     redirLogin("An error has occoured")
                // requestData(" ");
            // }
        };
    }

    socket.onmessage = function (event) {
        recieved ++;
        let reply = JSON.parse((event.data));
        method(reply);
    };


    //sends data or logs data to be sent when available
    if(!open){
        //add data to list
        toSend.push(data);
    }else{
        data = JSON.stringify(data);
        socket.send(data);
    }

}
function none(a, b, c, d, e, f, g, h, i){}

function redirLogin(msg){
    window.location.href = pre + "/login/?reason="+msg;
}

function save(key, value){
    localStorage.setItem(key, value);
}
function read(key){
    return localStorage.getItem(key);
}