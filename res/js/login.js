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
    }

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