var SERVER = "35.167.63.112";
var PORT = 25006;

function sendRequest(){
	name = document.getElementById("name").value;
	pass = document.getElementById("pass").value;
	
	message = "login " + name + " " + hash(pass);
	
	console.log(message + " ###TODO LOGIN SCRIPTS HERE");
	valid = true;
	
	if(valid){
		createCookie("username", name, 10);
		createCookie("oAuth", "null", 10);
		window.location.href="chats.html";
	}else{
		//Something here
	}
}
function hash(string){
    var hash = 0;
    if (string.length == 0) return hash;
    for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}




//createCookie("testCookie", "test", 2);
//createCookie("q54etr", "test", 2);
//createCookie("t", "test", 2);
//createCookie("4tergf", "test", 2);
//createCookie("eryt", "test", 2);