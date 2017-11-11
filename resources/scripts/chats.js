function onSend(message){
	/*
	"{oAuth:key;username:name;content:message;}"
	*/
	
	data = "\"{oAuth:"+readCookie("oAuth");+";username:"+readCookie("username");+";content:"+message+";}\""
	
	console.log("##SENDING##\n"+data);
	
}

document.getElementById("messageArea")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("send").click();
    }
});
