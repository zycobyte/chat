function prepare(data){
    let username = $("#username").val();
    let password = $("#password").val();

    if(username.length < 4 || username.length > 16){
        $("#returnmsg").html("Username must be between 4 and 16 characters.");
        return
    }
    if(password.length < 6 || password.length > 16){
        $("#returnmsg").html("#returnmsg").html("Password must be between 6 and 16 characters.");
        return
    }

    let json = {"data":data, "username": username, "password": password};
    if(data === "signup"){
        let email = $("#email").val();
        //TODO check email is valid
        json["email"] = email;
        $("#returnmsg").html("Creating Account.");
    }else{
        $("#returnmsg").html("Logging In.");
    }

    send(json, loginDataRecieved);

}

function loginDataRecieved(reply){
    if(reply.data === "success"){
        save("username", reply.username);
        save("token", reply.token);
        let url = window.location.href;
        if(url.includes("redir")){
            window.location.href = decodeURIComponent(url.split("redir=")[1].split("&")[0]);
        }else{
            window.location.href = pre+"/chats/"
        }
    }else{
        $("#returnmsg").html(reply.message);
    }
}

function resetPass(){
    let username = $("#username").val();
    if(username.length < 4 || username.length > 16) {
        $("#returnmsg").html("Username must be between 4 and 16 characters.");
        return
    }
    $("#returnmsg").html("Resetting Password.");
    let json = {"data":"resetPassword", "username": username};
    send(json, loginDataRecieved);
}