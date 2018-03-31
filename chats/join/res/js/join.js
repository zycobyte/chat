function goBack() {
    window.location = (window.location.href.split('#')[0]+"../");
}
function handler(data){
    document.write(data["message"])
    setTimeout(function(){goBack()}, 1500);
}
document.onload = new function () {
    let code = window.location.hash.substr(1).trim();
    console.log(code);
    if(!code){
        goBack();
        return;
    }
    if(code===""){
        goBack();
        return;
    }
    let json = {"username":read("username"), "token":read("token"), "data":"join", "code":code};
    send(json, handler);
};