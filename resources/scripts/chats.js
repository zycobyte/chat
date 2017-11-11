function onSend(message){
	/*
	"{oAuth:key;username:name;content:message;}"
	*/
	
	data = "\"{oAuth:"+readCookie("oAuth")+";username:"+readCookie("username")+";content:"+message.value+";}\""
	message.value = "";
	
	console.log("##SENDING##\n"+data);
	
}


function addListener(id, button){
	document.getElementById(id)
	    .addEventListener("keyup", function(event) {
	    event.preventDefault();
	    if (event.keyCode === 13) {
	        document.getElementById(button).click();
	    }
	});
}