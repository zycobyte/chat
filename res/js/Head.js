function openmenu(){
    let m = document.getElementById("menu");
    m.classList = "show-menu";
    let e = document.getElementById("e");
    e.classList = "show-e";
}
function closemenu(){
    let m = document.getElementById("menu");
    m.classList = "hide-menu";
    let l = document.getElementById("login-box");
    l.classList = "hide";
    let e = document.getElementById("e");
    e.classList = "hide-e";
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
    let box = document.getElementById("login-box");
    box.classList = "show";
    let em = document.getElementById("em");
    em.classList = "hide";
    let email = document.getElementById("email");
    email.classList = "hide text";
    let login = document.getElementById("login");
    login.classList = "show login";
    let signup = document.getElementById("signup");
    signup.classList = "hide login";
    let title = document.getElementById("title");
    title.innerHTML = "<u>Login Below</u>";
    let e = document.getElementById("e");
    e.classList = "show-e";
}
function signup(){
    let box = document.getElementById("login-box");
    box.classList = "show";
    let em = document.getElementById("em");
    em.classList = "show";
    let email = document.getElementById("email");
    email.classList = "show text";
    let login = document.getElementById("login");
    login.classList = "hide login";
    let signup = document.getElementById("signup");
    signup.classList = "show login";
    let title = document.getElementById("title");
    title.innerHTML = "<u>Signup Below</u>";
    let e = document.getElementById("e");
    e.classList = "show-e";
}