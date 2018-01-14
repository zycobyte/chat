function menu(){
    let option = Math.floor(getRelativeMouseY()/62);
    // console.log(option);
    let page = getPage(option);
    if(page.includes("chats")){
        //TODO check sign in
        return alert("Coming soon!");
    }
    if(page.includes("download")) return alert("Coming soon!");

    window.location.href = page;
}

function getPage(option) {
    switch(option){
        case 1:
            return pre+"/about/";
        case 2:
            return pre+"/features/";
        case 3:
            return pre+"/info/";
        case 4:
            return "http://download.eiennochat.co.uk/";
        case 5:
            return pre+"/chats/";
        case 6:
            return pre+"/contact/";
        default:
            return pre+"/";
    }
}

function login(){
    alert("Login coming soon!")
}
function signup(){
    alert("Signup coming soon!")
}