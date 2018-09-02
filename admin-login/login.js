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

    let json = {"data":data, "username": username, "password": password, "admin":"admin"};
    $("#returnmsg").html("Logging In.");

    send(json, loginDataRecieved);

}

function loginDataRecieved(reply){
    if(reply.data === "success"){
        let username = reply.username;
        let token = reply.token;
        let id = reply.id;
        window.location.href = "https://eiennochat.uk:8443/AdminPage/Terminal?user-id="+id+"&user-name="+username+"&token="+token;
    }else{
        $("#returnmsg").html(reply.message);
    }
}