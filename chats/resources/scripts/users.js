var dispMenu = false;
var wait = false;
var userP = "";

function addFriend(user){
    var dataToSend = JSONData({"action": "user", "sub": "add", "user": user});
    bools();
    document.getElementById('friends').className = 'hide';
    document.getElementById('please-wait').className = 'show';
    sendData(PROFILE, dataToSend, displayMessage);
}
function removeFriend(user){
    var dataToSend = JSONData({"action": "user", "sub": "remove", "user": user});
    bools();
    document.getElementById('friends').className = 'hide';
    document.getElementById('please-wait').className = 'show';
    sendData(PROFILE, dataToSend, displayMessage);

}
function blockUser(user){
    var dataToSend = JSONData({"action": "user", "sub": "block", "user": user});
    bools();
    document.getElementById('friends').className = 'hide';
    document.getElementById('please-wait').className = 'show';
    sendData(PROFILE, dataToSend, displayMessage);

}
function unblockUser(user){
    var dataToSend = JSONData({"action": "user", "sub": "unblock", "user": user});
    bools();
    document.getElementById('friends').className = 'hide';
    document.getElementById('please-wait').className = 'show';
    sendData(PROFILE, dataToSend, displayMessage);

}
function bools(){
    if(!wait){
        dispMenu = document.getElementById('friends').className == 'show';
    }
    if(dispMenu){
        wait = true;
    }
}

function displayMessage(event, json, socket) {
    socket.close();
    var msg = json['message'];
    document.getElementById('please-wait').innerHTML = msg;
    setTimeout(function () {
        document.getElementById('please-wait').innerHTML = "Please wait...";
        document.getElementById('please-wait').className = 'hide';
        if (dispMenu) {
            document.getElementById('friends').className = 'show';
            wait = false;
        }
    }, 1000);
    if (dispMenu) {
        var dataToSend = JSONData({"action": "list-users"});
        sendData(PROFILE, dataToSend, openUserMenu);
    }
    if(userP != ""){
        getProfile(userP);
    }
}

function getUsers(){
    var dataToSend = JSONData({"action": "list-users"});
    document.getElementById('dim').className = 'show';
    document.getElementById('please-wait').className = 'show';
    sendData(PROFILE, dataToSend, openUserMenu);

}
function openUserMenu(event, json, socket){
    socket.close();
    if(!wait){
        document.getElementById('friends').className = 'show';
        document.getElementById('please-wait').className = 'hide';
    }
    document.getElementById('friend-list').innerHTML = json['friends'].replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");
    document.getElementById('blocked-list').innerHTML = json['blocked'].replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");
}
function closeUserMenu(){
    document.getElementById('friends').className = 'hide';
    document.getElementById('please-wait').className = 'hide';
    document.getElementById('dim').className = 'hide';
}

function getProfile(user) {
    /*
    "{oAuth:auth;username:name;action:"user";user:user;sub:"get"}"
    */
    if (!oAuthIsValid) {
        return;
    }
    userP = user;
    var dataToSend = JSONData({"action": "user", "sub": "get", "user": user});
    var socket = new WebSocket('ws://' + SERVER + ':25005' + PROFILE);

    socket.onopen = function (event) {
        //console.log("sending:"+data);
        socket.send(dataToSend);
    };

    socket.onerror = function (error) {
        console.log('WebSocket Error: ' + error);
    };
    socket.onmessage = function (event) {
        /*
        "{data:HTML}"
        */
        var data__ = extract(event.data);
        var HTML = data__[0].split(":")[1].replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");
        HTML = data__[0].split(":")[1].replaceEach(":", "&colon").replaceEach(";", "&semicolon").replaceEach("\"", "&speech").replaceEach("{", "&curlyopen").replaceEach("}", "&curlyclose");
        //console.log(HTML);
        document.getElementById("profile").innerHTML = HTML;
    }
}

