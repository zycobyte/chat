pageLoadData = 1;
function prepare(){
    let url = window.location.href;
    let key = decodeURIComponent(url.split("key=")[1].split("&")[0]);
    let username = decodeURIComponent(url.split("username_lower=")[1].split("&")[0]);

    if(username.length < 4 || username.length > 16){
        $("#returnmsg").html("Username must be between 4 and 16 characters.");
        return
    }

    let json = {"data":"verifyEmail", "username": username, "sub": "verify", "key":key};
    $("#returnmsg").html("Verifying E-Mail.");
    send(json, loginDataRecieved);
}
function loginDataRecieved(reply){
    if(reply.data === "success"){
        save("username", reply.username);
        save("token", reply.token);
        window.location.href = pre+"/chats/"
    }else{
        $("#returnmsg").html(reply.message);
    }
}
function resetKey(){
    let url = window.location.href;
    let username = decodeURIComponent(url.split("username_lower=")[1].split("&")[0]);
    if(username.length < 4 || username.length > 16) {
        $("#returnmsg").html("Username must be between 4 and 16 characters.");
        return
    }
    $("#returnmsg").html("Resetting Key.");
    let json = {"data":"verifyEmail", "sub":"newKey", "username": username};
    send(json, loginDataRecieved);
}
function onLoad(){
    prepare();
}