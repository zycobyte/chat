$(document).ready(function(){
    if (navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1)){
        alert("Eien.no Chat does not currently support Internet Explorer.  Sorry.");
    }
});


function openmenu(){
    let m = $("#menu");
    m.addClass("show-menu").removeClass("hide-menu");
    let e = $("#e");
    e.addClass("show-e").removeClass("hide-e");
}
function closemenu(){
    let m = $("#menu");
    m.addClass("hide-menu").removeClass("show-menu");
    let l = $("#login-box");
    l.addClass("hide").removeClass("show");
    let e = $("#e");
    e.addClass("hide-e").removeClass("show-e");
}

function menu(){
    let option = Math.floor(getRelativeMouseY()/62);
    // console.log(option);
    let page = getPage(option);
    if(page.includes("chats")){
        if(!read("username") || !read("token")) return redirLogin("Please login to use Eien.no Chat");
    }
    if(page.includes("download")) return alert("Coming soon!");

    window.location.href = page;
}

function getPage(option) {
    switch(option){
        case 0:
            return pre+"/";
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
            return pre+"/terms/";
    }
}

function login(){
    let box = $("#login-box");
    box.addClass("show").removeClass("hide");
    let em = $("#em");
    em.addClass("hide").removeClass("show");
    let email = $("#email");
    email.addClass("hide").removeClass("show");
    let login = $("#login");
    login.addClass("show").removeClass("hide");
    let signup = $("#signup");
    signup.addClass("hide").removeClass("show");
    let title = $("#title");
    title.html("<u>Login Below</u>");
    let e = $("#e");
    e.addClass("show-e").removeClass("hide-e");
}
function signup(){
    let box = $("#login-box");
    box.addClass("show").removeClass("hide");
    let em = $("#em");
    em.addClass("show").removeClass("hide");
    let email = $("#email");
    email.addClass("show").removeClass("hide");
    let login = $("#login");
    login.addClass("hide").removeClass("show");
    let signup = $("#signup");
    signup.addClass("show").removeClass("hide");
    let title = $("#title");
    title.html("<u>Signup Below</u>");
    let e = $("#e");
    e.addClass("show-e").removeClass("hide-e");
}

function alert(message){
    let bg = $("#notification");
    let messageArea = $("#message-content");
    messageArea.html(message);
    bg.removeClass("hide");
    setTimeout(function () {
        bg.addClass("#hide");
    }, 1000);
}