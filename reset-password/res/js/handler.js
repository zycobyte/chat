function prepare(){
    let url = window.location.href;
    let key = decodeURIComponent(url.split("key=")[1].split("&")[0]);

    let username = decodeURIComponent(url.split("username_lower=")[1].split("&")[0]);
    let password = $("#password").val();

    if(username.length < 4 || username.length > 16){
        $("#returnmsg").html("Username must be between 4 and 16 characters.");
        return
    }
    if(password.length < 6 || password.length > 16){
        $("#returnmsg").html("#returnmsg").html("Password must be between 6 and 16 characters.");
        return
    }

    let json = {"data":"updatePassword", "username": username, "password": password, "key":key};
    $("#returnmsg").html("Changing Password.");
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
function resetPass(){
    let url = window.location.href;
    let username = decodeURIComponent(url.split("username_lower=")[1].split("&")[0]);
    if(username.length < 4 || username.length > 16) {
        $("#returnmsg").html("Username must be between 4 and 16 characters.");
        return
    }
    $("#returnmsg").html("Resetting Password.");
    let json = {"data":"resetPassword", "username": username};
    send(json, loginDataRecieved);
}