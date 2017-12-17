function editProfile() {
    if (!oAuthIsValid) {
        return;
    }
    var passwordCurrent = document.getElementById("cp").value;
    if(passwordCurrent.length < 6 || passwordCurrent.length > 16){
       return;
    }
    document.getElementById('please-wait').className = 'show';
    document.getElementById('settings').className = 'hide';

    /**
 * 	"settings" -- Comes with any of the below that have been changed
 * 		"current-password" -- REQUIRED, If invalid or missing no changes occur
 * 		"notifications" -- specifies default notifications, integer 0 - 3
 *      "icon" -- edit user icon
 *      "password" -- update password
 *      "email" -- update email
 *      "delete" -- delete users account
 * 	  	"logout" -- revokes oAuth and logs account out everywhere
 */
    var icon = document.getElementById("img-upload-pp").files;
    if(icon.length !=1){
        handlePrepare(null);
    }else{
        toSend = 1;
        connectToFileServer(icon[0], "icons/users", handlePrepare, "");
    }
}
var d = false;
var f = false;
function handlePrepare(arg){
    console.log("prep settings");
    var passwordCurrent = document.getElementById("cp").value;
    var dataToSend = ({"action": "settings", "current-password": hash(passwordCurrent)});

    icon = document.getElementById("img-upload-pp").value = null;
    var icon = document.getElementById("img-upload-pp").files;
    var noti = document.getElementById("notifications").value;
    var email = document.getElementById("email").value;
    var np = document.getElementById("np").value;
    var del = document.getElementById("delAcc").checked;
    var logout = document.getElementById("logoutOP").checked;

    if(arg != null){
        // dataToSend["icon"] = storeImageLink;
        console.log("icon");
        var rawData = {"icon":storeImageLink};
        // var result = {};
        // result["test"] = "testing";
        // for(var key in dataToSend) result[key] = ""+dataToSend[key];
        for(var key in rawData) dataToSend[key] = ""+rawData[key];
        // dataToSend = result;
    }
    if(noti != "-1"){
        var rawData = {"notifications":noti};
        for(var key in rawData) dataToSend[key] = ""+rawData[key];
    }
    if(email!="" && (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))){
        var rawData = {"email":email};
        for(var key in rawData) dataToSend[key] = ""+rawData[key];
    }
    if(np.length >= 6 && np.length <= 16){
        var rawData = {"password":hash(np)};
        for(var key in rawData) dataToSend[key] = ""+rawData[key];
    }
    if(del){//WARNING removing this check is very dangerous and will most likely delete your account, even if del is false.
        var rawData = {"delete":del};
        for(var key in rawData) dataToSend[key] = ""+rawData[key];
        d=true;
    }
    if(logout){
        var rawData = {"logout":logout};
        for(var key in rawData) dataToSend[key] = ""+rawData[key];
        f=true;
    }
    console.log(dataToSend);

    sendData(PROFILE, JSONData(dataToSend), handleSettings);
}
function handleSettings(event, parsedFile, socket){
    socket.close();
    var msg = parsedFile["message"];
    document.getElementById('please-wait').innerHTML = msg;
    setTimeout(function() {
        document.getElementById('please-wait').innerHTML = "Please wait...";
        document.getElementById('please-wait').className = 'hide';
        document.getElementById('settings').className = 'show';
    }, 2000);
    var v = !msg.includes("Invalid Password.");
    if(d&&v){
        window.location.href=URL_PRE+'login.html?&id=2';
    }
    if(f&&v){
        window.location.href=URL_PRE+'login.html?&id=0';
    }
}
function closeSettings(){
    document.getElementById("dim").className = "hide";
    document.getElementById("settings").className = "hide";
}
function openSettings(){
    document.getElementById("dim").className = "show";
    document.getElementById("settings").className = "show";
}