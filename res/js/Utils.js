let localhost = window.location.hostname==="localhost" || window.location.hostname.includes("192.168");
pre = (localhost?"/Website":"");
let server = (localhost?"ws://${IP}:2089":"wss://${IP}:2096")+"/eiennosocket/data";
let dataserver = (localhost?"ws://${IP}:2090":"wss://${IP}:2087")+"/datasocket/data";
let handlerAddress = (localhost?"ws://192.168.0.24:2089":"wss://TODO:2096")+"/eiennosocket/clientConnect";
let IP = null;

allowStorage = (typeof(Storage) !== "undefined");
messages = 0;
getChatMsgs=true;
messageStore = {};

let socket;//sockets should only be accessed from here to ensure data is encrypted and handled properly
let dataSocket;
let open = false;
let open_data = false;
let opening_data = false;
let toSend = [];
let recieved = 0;
let pageLoadData = 0;

let gettingIP = false;

let canConnect = true;
let fails = 0;

let focused = true;

window.onfocus = function() {
    focused = true;
};
window.onblur = function() {
    focused = false;
};

function init_socket_connecter() {
    setInterval(function () {
        if (!window.location.href.includes("chats") || window.location.href.includes("join")) return;
        if (!open || !open_data) {
            $('#loading-message-box').removeClass('hide').removeClass('show');
            if (!($('#loading-message-box').html() === "Attempting to establish a secure connection to the Eien.no Chat Servers") || !$('#loading-message').attr('class').includes('show')) {
                $('#loading-message').removeClass("hidden").addClass("show");
                $('#loading-message-box').html("Attempting to establish a secure connection to the Eien.no Chat Servers");
            }
        } else {
            if ($('#loading-message-box').html() === "Attempting to establish a secure connection to the Eien.no Chat Servers") {
                fails = 0;
                $('#loading-message').removeClass("show").addClass("hidden");
                IP = null;
            }
        }
        if (!opening_data && canConnect) {
            // dataSocket.close();
            init_data_socket();
        }
        if (!socket && canConnect) {
            // socket.close();
            let json = {"username": read("username"), "token": read("token"), "data": "request", "requests": ""};
            send(json, none);
        }
        if (fails >= 4 && canConnect) {
            canConnect = false;
            setTimeout(function () {
                canConnect = true;
            }, 10000)
        }
    }, 100);
}
setInterval(function () {//Get a server IP
    if (!open || !open_data) {
        if(!localhost){
            IP="eiennochat.uk";
            return;
        }
        if(gettingIP || IP) return;
        let s;
        if (fails % 10 == 0 || !IP) {
            //Get a server IP
            gettingIP = true;
            try{
                s = new WebSocket(handlerAddress);
            }catch(err){
                gettingIP=false;
                return;
            }

            s.onopen = function (event) {};
            s.onerror = function (error) {
                if (!window.location.href.includes("chats") || window.location.href.includes("join")){
                    alert("Unable to contact the Eienno Chat Servers.  Try checking your internet connection or reloading the page?");
                }else{
                    message("Unable to contact the Eienno Chat Servers.  Try checking your internet connection or reloading the page?")
                }
                gettingIP = false;
            };
            s.onclose = function (event) {
                s = null;
                gettingIP = false;
            };
            s.onmessage = function (event) {
                let reply = (event.data);
                if(reply.includes("{")){
                    if (!window.location.href.includes("chats") || window.location.href.includes("join")){
                        alert(JSON.parse(reply)["message"]);
                    }else{
                        message(JSON.parse(reply)["message"])
                    }
                }else{
                    IP = reply;
                    if(pageLoadData == 1){
                        onLoad();
                        pageLoadData++;
                    }
                }
                gettingIP = false;
            };

        }
    }
}, 100);

function init_data_socket(){
    opening_data = true;
    // setTimeout(function() {
    //     if(recieved < 1 && open){//Ensures first message is recieved, containing the id
    //         init_data_socket();
    //         return;
    //     }
    //     if (!dataSocket && canConnect) {
            try{
                // dataSocket.close();
                if(!IP) {
                    opening_data = false;
                    return;
                }
                dataSocket = new WebSocket(dataserver.replace("${IP}", IP));
            }catch(err){
                opening_data=false;
                fails++;
                // if(fails > 4)canConnect = false;
                return;
            }

            dataSocket.onopen = function (event) {
                console.log("[Connect] Connected to Eien.no Chat servers");
                open_data = true;
                let s = JSON.stringify({"id": `${read("id")}`});
                dataSocket.send(s);
                if(currentChatID){
                    lostConnection = true
                    switchChat(currentChatID, isdm);
                }
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
                opening_data=false;
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
        //remove sent msg (if exists)
        let msgSendingArea = $('#'+data["shard"]);
        if(msgSendingArea.length!=0){
            msgSendingArea.remove();
        }
        //add message
        let online = JSON.parse(read("online"));
        //if the channel or chat is muted, return;
        let notifList = read("chatNotifs");
        let notifEnabled = true;
        if(notifList) {
            notifList = JSON.parse(notifList);
            if(notifList[data["chat_id"]]){
                if(notifList[data["chat_id"]].split(';').contains(data["channel_id"])){
                    notifEnabled = false;
                }
                if(notifList[data["chat_id"]].split(';').contains("chat")){
                    notifEnabled = false;
                }
            }
        }
        if(data["chat_id"]===currentChatID && data["channel_id"] === currentChannelID) {
            if(!focused){
                if(!(online["id"]==="3") && notifEnabled){
                    document.getElementById('message_new_wav').play()
                }
            }
            messages++;
            let scrollArea = $('#message-area');
            let autoScroll = scrollArea.scrollTop() + scrollArea.innerHeight() >= scrollArea[0].scrollHeight-1;
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
                while (messages > 50) {
                    $('#msgs').children().eq(0).remove();
                    messages--;
                }
                oldest = $('#msgs').children().eq(0).children().filter('.chat-area-date').attr('id');
            }
        }else{
            let mentionedList = data["mentions"].split(";");
            let userMentioned = mentionedList.includes(read("id"));
            if(userMentioned || data["is_dm"]==="true"){
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
            if(!notifList){
                notifList={}
            }
            let mutedData = notifList[data["chat_id"]];
            if(!mutedData){
                mutedData = "";
            }else{
                mutedData=mutedData.split(';');
            }

            if((userMentioned && !mutedData.includes("username")) || ((mentionedList.includes("all") || mentionedList.includes("everyone"))&&!mutedData.includes("everyone"))) {
                let m = read("mentions");
                if (!m) m = "{}";
                m = JSON.parse(m);
                let pings = m[data["channel_id"]];
                if (!pings) pings="0";
                m[data["channel_id"]] = (Number(pings)+1)+"";

                pings = m[data["chat_id"]];
                if (!pings) pings="0";
                m[data["chat_id"]] = (Number(pings)+1)+"";

                pings = m[data["is_dm"]];
                if (!pings) pings="0";
                m[data["is_dm"]] = (Number(pings)+1)+"";

                save("mentions", JSON.stringify(m));

            }

            if(!(online["id"]==="3") && notifEnabled){
                document.getElementById('message_new_wav').play()
            }

            let d = JSON.parse(read("dms"));
            if(Object.keys(d).length === 0){
                $('#your-dm-list').html("You currently have no DMs");
            }else{
                $('#your-dm-list').html("");
            }
            for(let chat in d){
                addChat(chat, true);
            }
            updateChannelUnreads(data["channel_id"], 1, false, data["is_dm"], data["chat_id"]);
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
            currentChatUserNames = {};
            message("You have been kicked from the chat.");
            safeClose();
        }
    }else if(data["type"]==="userstatus"){
        if(!currentChatUsers[data["users_id"]])return;
        updateChatUser(data["users_id"], JSON.parse(data["users_data"]))
        if(viewingProfile+""===data["users_id"])
            openProfile(data["username"], data["users_id"])
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
            if(!IP) return;
            socket = new WebSocket(server.replace("${IP}", IP));
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