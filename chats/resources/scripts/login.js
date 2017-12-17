
function sendRequest(login){
	/*
	"{username:name;password:hash;login:true|false}"
	
	login:true -- login
	login:false -- signup
	*/
	
	name = document.getElementById("name").value;
	pass = document.getElementById("pass").value;
	if(!login){
		email = document.getElementById("email").value;
	}else{
		email = "";
	}
	
	name = name.replaceAll("<", "&lt").replaceAll(">", "&gt").replaceAll(":", "&colon").replaceAll(";", "&semicolon").replaceAll("\"", "&speech").replaceAll("{", "&curlyopen").replaceAll("}", "&curlyclose");

	if(name == "root" && pass == ""){
		error("Sorry, Eien.no Chat wasn't made by apple!");
		return;
	}
	if(name.length < 4 || name.length > 16){
		error("Please enter a valid username between 4 and 16 characters.");
		return;
	}
	if(pass.length < 6 || pass.length > 16){
		error("Please enter a valid password between 6 and 16 characters.");
		return;
	}
	
	pass = hash(pass);
	var toSend = JSONData({"UserName":name, "pass":pass, "login": login, "E-Mail": email})
	// data = format("username", name);
	// data += format("password", pass);
	// data += format("login", login);
	if(!login){
		// data += format("email", email);
		if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))){
			error("Invalid Email Address.");
			return;
		}
		//else{
		//	return;
		//}
	}
	// toSend = pack(data);

	recieved = "";
	
	error ("Please wait");
	
	var socket = new WebSocket('ws://'+SERVER+':25005'+LOGIN);

	// Show a connected message when the WebSocket is opened.
	socket.onopen = function(event) {
		console.log("sending:"+toSend);
		socket.send(toSend);
	};

	// Handle any errors that occur.
	socket.onerror = function(error) {
		console.log('WebSocket Error: ' + error);
	};

	socket.onmessage = function(event) {
		/*
		"{valid:true|false;oAuth:key"}"		
		*/
		recieved = event.data;
		console.log("recieved:"+recieved);
		data = extract(recieved);
		valid = data[0].split(":")[1] == "true" ? true : false;
	
		if(valid){
            createCookie("username", data[3].split(":")[1], 10);//Creates name cookie with correct capitals
			createCookie("oAuth", data[1].split(":")[1], 10);
			createCookie("email", data[2].split(":")[1], 10);
            createCookie("id", data[4].split(":")[1], 10);
			if(!window.location.href.includes("chats")){
				if(location.href.includes("?redirect=")){
					//console.log(location.href);
					//console.log(location.href.split("?redirect="))
					window.location.href= location.href.split("?redirect=")[1];
				}else{
					//console.log(location.href);
					//console.log(location.href.split("?redirect="))
					window.location.href="chats/";
				}
			}else{
                alerting = document.getElementById("alerting");
                alerting.className = "hide";
			}
		}else{
			if(login){
				error("Incorrect username or password combo.");
			}else{
				error("Username already taken.");
			}
		}

	};
	
}

function error(message){
	document.getElementById("info").innerHTML = message;
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