let currentChatID = 0;
let currentChannelID = 0;
let nextChatID = false;
let nextChatDM = false;
let currentChatData = {};
let currentChatUsers = {};
let currentChatRoles = {};
let channels = [];
let isdm = false;
let dmList = false;

let create_dm = false;
let cancelOpen = false;

let popup;
let can = false;
let defaultColours = ["#15ff00", "#d6a800", "#d61e00", "#677594"];
let defaultNames = ["Online", "Away", "Do Not Disturb", "Offline"];
let method = none;
let userOptionMethod = none;
let userChatMethod = yourChats;

let emojiData;
//online away DND offline
//#0073d6

window.onload = function () {
    showChats();

    if(read("username") === null || read("token") === null){
        redirLogin("Please login");
        return;
    }

    requestData();
    init_socket_connecter();

    let store = $('#image-area');
    store.append("<audio src='res/audio/new_message.wav' id='message_new_wav'></audio>")

    if(!messageStore["false"])messageStore["false"]=0;
    if(!messageStore["true"])messageStore["true"]=0;

    //Emojis should always be last
    loadEmojis();
    $('#emoji-search').on( "keyup", function () {
        searchEmojis($(this).val());
    })
};

function message(message){
    console.log(message);
    $('.message#msg').html(split(message, 40)).addClass('show').removeClass('hide');

    setTimeout(function () {
        $('.message').removeClass('show').addClass('hide');
    }, 3500);
}

function dropDownOpen(menu){
    $('#'+menu+'-drop-down').addClass("drop-down").removeClass("hide-shrink").addClass("show").removeClass("box-1x1");
}
function dropDownClose(menu){
    $('#'+menu+'-drop-down').removeClass("show").addClass("hide-shrink").addClass("box-1x1").removeClass("drop-down").animate(
        {margin: 0},
        1000, function() {
            let m = $('#'+menu+'-drop-down');
            m.removeClass("box-1x1");
        });
}

function createOnlineStatus(){
    let date = new Date();
    let id = date.getTime();
    addCustomStatus(id, "", "", "00D21C", null, null)
}

function addCustomStatus(id, name, reply, colour,  from, to){
    window.jscolor = null;
    $('#custom-status-popups').append(`
    <div class="online-status-box-popup" id="stat-${id}" style="height: 120px">
        <script src="jscolor.js"></script>
        <div class="rank-name-text">Status Name:</div>
        <textarea style="height: 20px" class="rank-name input-field-dark" maxlength="22" placeholder="Statuses without names get deleted.">${name}</textarea>
        <div class="reply-message-text">Reply Message:</div>
        <textarea style="height: 20px" class="reply-message input-field-dark" maxlength="511" placeholder="Type message here">${reply}</textarea>
        <div class="online-status-colour-text">Status Colour:</div>
        <!--<input class="online-status-colour jscolor" style="background-color: #9cb2e4"/>-->
        <input value="${colour}" class="online-status-colour jscolor {width:243, height:150, position:'right',
    borderColor:'#FFF', insetColor:'#FFF', backgroundColor:'#666'}" content="${colour}">
<div class="online-status-times-text">Times:</div>
        <div class="online-status-times" id="${id}-times">
            From:<input type="time" class="input-field-dark online-status-from"> To:<input type="time" class="input-field-dark online-status-to">
        </div>
        <button class="select-online-status" onclick="onlineStatus(${id})">Select Status</button>
    </div>
    `)

    let times = $('#'+id+'-times').children();
    times.eq(0).val(from);
    times.eq(1).val(to);
}

function onlineStatus(id){
    let json = {"username":read("username"), "token":read("token"), "data":"edit", "type":"online-status", "sub":"change", "status-id":""+id};
    send(json, handleStatusChange);
}
function saveOnline(){
    let area = $('#custom-status-popups');

    let message = {};
    let times = {};
    let colours = {};
    let names = {};

    for(let i = 0; i < i+1;i++){
        if(!area.children().eq(i).attr('id'))break;
        let status = area.children().eq(i);
        let name = status.children().filter('textarea.rank-name').val();
        if(!name)continue;
        let id = status.attr('id').split("-")[1];
        let reply = status.children().filter('textarea.reply-message').val();
        let colour = status.children().filter('input.online-status-colour').val();
        let from = status.children().filter('div.online-status-times').children().eq(0).val();
        let to = status.children().filter('div.online-status-times').children().eq(1).val();
        if(!from || !to){
            from = null;
            to = null;
        }
        message[id]=reply;
        times[id]=JSON.stringify({"start":from+"", "end":to+""});
        colours[id] = colour;
        names[id] = name;
    }

    let stat = $("#set-status-msg").children().eq(1).val();
    let json = {"username":read("username"), "token":read("token"), "data":"edit", "type":"online-status", "sub":"edit", "status":""+stat, "message":JSON.stringify(message), "colours":JSON.stringify(colours), "times":JSON.stringify(times), "names":JSON.stringify(names)};
    send(json, handleStatusSave);
}

function handleStatusChange(){
    saveOnline();
}
function handleStatusSave(){
    requestData("online");
}

function onlineStatusUpdate(){
    let data = JSON.parse(read("online"));
    let text = $("#online-status-text");
    let icon = $("#online-status-icon");
    let status = $("#status-text");
    let id = data["id"];
    let colours = JSON.parse(data["colours"]);
    let names = JSON.parse(data["names"]);
    if(!names[id] && !(id<4))id=0;
    let colour = id<4?defaultColours[id]:'#'+colours[id];
    let text_content = id<4?defaultNames[id]:names[id];
    let status_content = data["status"];
    if(!status_content)status_content="";
    $("#set-status-msg").children().eq(1).html(status_content);
    if(status_content.length>32){
        status_content = status_content.substr(0, 32)+"<br>"+status_content.substr(32, status_content.length);
    }
    icon.css("background-color", colour);
    $('#your-profile-pic-top-right').css("background-image", "url("+read("avitar")+")");
    text.css("color", colour);
    text.html(text_content);
    status.html(status_content);
    $('#custom-status-popups').html('');

    for(let id in names){
        let name = names[id];
        let col = colours[id];
        let reply = JSON.parse(data["message"])[id];
        let times = JSON.parse(JSON.parse(data["times"])[id]);
        addCustomStatus(id, name, reply, col, times["start"], times["end"]);
    }
}

function hideMenus(){
    $("#chat-select").addClass("hide").removeClass("show");
    $("#user-list").addClass("hide").removeClass("show");
    $("#help-menu").addClass("hide").removeClass("show");
    $("#settings-menu").addClass("hide").removeClass("show");

    //TODO add new menus when they are done

    $('#menu-bar').addClass('fade-down').removeClass('top');
    $('#users').addClass('fade-left').removeClass('left');
    $('#message-area').addClass('fade-in');
    $('#tabs').addClass('fade-right').removeClass('right');
}
function hide(elm){
    if(!elm.classList.contains("popup-bg") && !elm.classList.contains("btn-false")){
        can = true;
        return;
    }
    if(can){
        can=false;
        return;
    }
    if(!elm.classList.contains("show"))return;
    $(elm).addClass("hide-shrink").removeClass("show").addClass("box-1x1").animate(
        {margin: 0},
        1000, function() {
            let m = $(elm);
            m.removeClass("box-1x1").addClass("hidden");
        });
}

function updateGlobalChatSettings(){
    let name = ""+$('#chat-name-settings').val();
    let desc = ""+$('#chat-description-settings').val();
    let isPublic = ""+document.getElementById("is-public-settings").checked;
    let catagory = ""+$("#public-catagory-settings").val();
    let isMaintainance = ""+document.getElementById("in-maintainance-settings").checked;
    let maintainanceMessage = ""+$("#maintainance-message-content-settings").val();
    let maintainers = "";
    let area = $('#maintainance-whitelist-names');
    for(let i = 0; i < i+1;i++){
        let child = area.children().eq(i);
        if(!child)break;
        if(!child.attr("id"))break;
        let id = child.attr("id").split("-")[0];
        maintainers+=id+";";
    }
    let isJoinMessage = ""+document.getElementById("join-message-enabled-settings").checked;
    let joinMessage = ""+$("#join-message-content-settings").val();
    let joinMessageChannel = ""+$("#join-message-channel-settings").val();

    let json = {"username":read("username"), "token":read("token"), "data":"edit", "type":"server-global", "chat-id":currentChatID,
        "name":name, "desc":desc, "pub":isPublic, "cat":catagory, "closed":isMaintainance,
        "maintainaners":JSON.stringify(maintainers), "is-join-msg":isJoinMessage, "join-msg": joinMessage,
        "join-msg-channel": joinMessageChannel, "maintainance-message":maintainanceMessage};

    popup = document.getElementById("chat-settings-popup-global");
    send(json, popupReply);
}
function popupReply(data){
    if(invalid(data))return;
    hide(popup);
    message(data["message"]);
}

function show(elm){
    if(!elm.classList.contains("hidden"))return;
    $(elm).removeClass("hidden");
    try{//Some popups might need to have data set in them
        eval(elm.id.split("-").join("_")+"()");
    }catch(err){}
    setTimeout(function(){
        $(elm).addClass("show").removeClass("hide-shrink");
    }, 1);
}

function toggle(elm){
    if(!elm.classList.contains("popup-bg") && !elm.classList.contains("btn-false")){
        can = true;
        return;
    }
    if(can){
        can=false;
        return;
    }
    if(elm.classList.contains("hide-shrink")){
        show(elm);
    }else{
        hide(elm);
    }
}

function linkify(inputText) {//TODO upgrades
    let replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.split("<br>").join(" ").replace(replacePattern1, ' <a href="$1" target="_blank"> $1</a> ');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1 <a href="http://$2" target="_blank">$2</a> ');

    //Change email addresses to mailto: links.
    replacePattern3 = /(\w+@[a-zA-Z_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, ' <a href="mailto:$1">$1</a> ');

    return addImages(replacedText);
}

function addImages(text){
    let imgs = 0;
    let hrefs = text.split("href=\"");
    let imageTypes = ['jpg','jpeg','tiff','png','gif','bmp'];
    for(let i = 0; i < hrefs.length; i++) {
        let url = hrefs[i];
        url = url.split("\"")[0];
        let split_url = url.split(".");
        let type = split_url[split_url.length-1];
        if(imageTypes.indexOf(type) != -1) {
            // $.get(url)
            //     .done(function () {
                    text+= '<br><img src="'+url+'" style="max-width: 75%;max-height: 256px"/>'
                    imgs ++;
                    if(imgs >= 5) return text;
                    // console.log(text)
                // }).fail(function () {
            // })
        }
    }
    return text;
}

setInterval(function () {
    let d = new Date();
    let store = d.toTimeString().split(":");
    let time = store[0] + ":" + store[1];
    let online = JSON.parse(read("online"));
    let times = JSON.parse(online["times"]);
    let status = online["id"];

    if(Number(status) > 4) { //Default statuses don't have timers
        if (JSON.parse(times[status])["end"] === time) {
            status = 0;
        }
    }
    for(let key in times){
        if(JSON.parse(times[key])["start"]===time){
            status = key;
            break;
        }
    }
    if(!(status === online["id"])){
        //update online status
        onlineStatus(status);
    }
}, 60000);

function saveSettings(id) {
    let json = {"username":read("username"), "token":read("token"), "data":"edit", "type":"settings"+id};
    let j2 = {};
    if(id==1){
        j2 = {"new-name":$('#user-setting-val').val(), "new-email": $('#email-setting-val').val(),
            "new-pass": $('#pass-new-setting-val').val(), "current-pass": $('#pass-old-setting-val').val()}
    }else if(id==2){
        j2 = {"email-notifs":$('#email-notif-setting-val').prop("checked")+"", "scan": $('input[name=scanner]:checked', '#scanners').val()+""}
    }
    for(let key in j2){
        json[key]=j2[key];
    }
    send(json, handleSettingSave);
}

function handleSettingSave(data){
    message(data["message"]);
    if(data["message"].includes("Successfully updated username")) save("username", $('#user-setting-val').val());
    $('#pass-old-setting-val').val("");
    $('#pass-new-setting-val').val("");
    requestData();
}

let emojiBoxOpen = false;

function emojify(message){
    for(let key in emojiData){
        message = message.split(':'+key+':').join(`<img src="${emojiData[key]}" style="width:20px;height:20px" title=":${key}:" alt=":${key}:"/>`);
    }
    return message;
}

function openEmojiPopup(){
    if(!emojiBoxOpen)
        $('.emoji-box').removeClass("hidden").addClass('show');
    else{
        $('.emoji-box').addClass("hidden").removeClass('show');
        $('.gif-box').addClass('hidden').removeClass('show');
    }

    emojiBoxOpen = !emojiBoxOpen;
    searchEmojis("");
}

function loadEmojis(){
    let url = "https://api.github.com/emojis";
    jQuery.getJSON(url, handleEmojiData);
}
function handleEmojiData(data) {
    emojiData = data;
    for (let key in emojiData) {
        $('#image-area')
            .append(`<img src="${emojiData[key]}" style="width:20px;height:20px" title=":${key}:" alt=":${key}:"/>`);

    }

    $('#loading-message').removeClass("show").addClass("hidden");
}
function searchEmojis(query){
    if(!emojiData){
        loadEmojis();
        return;
    }
    let area = $('#emoji-display');
    area.html("");
    for(let key in emojiData){
        if(key.includes(query))
            area.append(`<img src="${emojiData[key]}" style="width:20px;height:20px" title=":${key}:" onclick="let type = $('#text-box').children().eq(0); type.val(type.val()+':${key}:')" alt=":${key}:"/>`);
    }
}

function getGiphyResults(query){
    let url = "https://api.giphy.com/v1/gifs/search?&q="+query+"&api_key=WqrAPvTe6AnIQojAh0tPBxWRgfp9jZnW";
    jQuery.getJSON(url, handleGiphyData);
}

function handleGiphyData(data){
    let area = $('#gif-display');
    area.html("");
    for(let i = 0; i < 10; i++){
        area.append(`<img style="height:100px" src="${data.data[i]["images"]["original"]["url"]}" onclick="let type = $('#text-box').children().eq(0); type.val(type.val()+' ${data.data[i]["images"]["original"]["url"]} ')" alt="${data.data[i]["title"]}" title="${data.data[i]["title"]}"/>`);
    }
}

function genInvite(){
    let json = {"username":read("username"), "token":read("token"), "data":"edit", "type":"invite", "chatID":currentChatID,
        "sub": "create"};
    send(json, handleGenInviite);
}
function handleGenInviite(data){
    if(invalid(data))return;
    $("#invite-link-settings").val("https://"+(window.location.href+"/join/#").split("://")[1].split("//").join("/")+data["code"]);
}

function chat_settings_popup_global(){
    let area = $('#chat-settings-global');
    area.html("");
    let chatData = JSON.parse(JSON.parse(read("chats"))[currentChatID]);
    let chatSettings = JSON.parse(currentChatData["settings"]);
    let admin = read("username")===chatData["owner"];

    let textChannels = "";
    let raw = JSON.parse(currentChatData["channels"]);
    for(let key in raw){
        let d1 = JSON.parse(raw[key]);
        if(d1["type"]==="chat"){
            textChannels+=`<option value="${d1["id"]}">${d1["name"]}</option>`;
        }
        let c1 = JSON.parse(d1["contents"]);
        for(let key2 in c1){
            let d2 = JSON.parse(c1[key2]);
            let c2 = JSON.parse(d2["contents"]);
            if(d2["type"]==="chat"){
                textChannels+=`<option value="${d2["id"]}">${d2["name"]}</option>`;
            }
            for(let key3 in c2) {
                let d3 = JSON.parse(c2[key3]);
                let c3 = JSON.parse(d3["contents"]);
                if(d3["type"]==="chat"){
                    textChannels+=`<option value="${d3["id"]}">${d3["name"]}</option>`;
                }
                for (let key4 in c3) {
                    let d4 = JSON.parse(c3[key4]);
                    if(d4["type"]==="chat"){
                        textChannels+=`<option value="${d4["id"]}">${d4["name"]}</option>`;
                    }
                }
            }
        }
    }

    if(admin) {// or manager
        area.append(`
                <div class="container">
                    <div class="setting-text" id="chat-name-settings-text">Change Name:</div>
                    <input class="input-field-dark" id="chat-name-settings" value="${chatData["name"]}" maxlength="32"/>
                </div>

                <div class="container">
                    <div class="setting-text" id="chat-description-settings-text">Change Description:</div>
                    <textarea class="input-field-dark" id="chat-description-settings" maxlength="128">${chatData["desc"]}</textarea>
                </div>
`)
    }

    if(admin){//or create invites
        //TODO create invites
        area.append(`
                <div class="container">
                    <button class="setting-text btn-blue" id="gen-invite-settings-text" onclick="genInvite()">Generate Invite:</button>
                    <input class="input-field-dark" disabled id="invite-link-settings" value="No Invite Generated"/>
                </div>
`);
    }
    //TODO add manage invites
    if(admin) {//or manager

        area.append(`
                <div class="container">
                    <button class="setting-text btn-blue" id="manage-invites-settings-text" onclick="openInviteManager()">Manage Invites:</button>
                    <!--<input id="manage-invites-settings" value="${chatData["name"]}"/>-->
                </div>

                <div class="container">
                    <div class="setting-text" id="is-public-settings-text">Public Chat</div>
                    <input ${currentChatData["public-chat"]==="true"?"checked":""} type="checkbox" id="is-public-settings" onclick="if(this.checked){$('#public-settings').removeClass('hidden')}else{$('#public-settings').addClass('hidden')}"/>
                    <div class="help" id="public-chat-help" onmouseover="openHelpTag('Public chats are chats that anyone is able to join.')" onmouseleave="closeHelpTag()"></div>
                </div>

                <div class="container">
                    <div class="${currentChatData["public-chat"]==="true"?"":"hidden"}" id="public-settings">
                        <div class="setting-text" id="public-catagory-settings-text">-- Catagory:</div>
                        <select class="btn-blue" name="catagory" id="public-catagory-settings">
                            <option value="other">Other</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Community">Community</option>
                            <option value="Role Play">Role Play</option>
                            <option value="Anime">Anime</option>
                            <option value="Music">Music</option>
                            <option value="Computers">Computers</option>
                            <option value="Movies">Movies</option>
                        </select>
                        <div class="help" id="public-chat-catagory-help" onmouseover="openHelpTag('What kind of chat is this?')" onmouseleave="closeHelpTag()"></div>
                    </div>
                </div>
                <div class="container">
                    <div class="setting-text" id="join-message-enabled-settings-text">Enable Join Message</div>
                    <input ${chatSettings["use-join-message"]==="true"?"checked":""} type="checkbox" id="join-message-enabled-settings" onclick="if(this.checked){$('#join-message-settings').removeClass('hidden')}else{$('#join-message-settings').addClass('hidden')}"/>
                    <div class="help" id="join-message-help" onmouseover="openHelpTag('When enabled, sends a custom message to a channel when a user joins.')" onmouseleave="closeHelpTag()"></div>
                </div>

                <div class="container">
                    <div class="${chatSettings["use-join-message"]==="true"?"":"hidden"}" id="join-message-settings">
                        <div class="setting-text" id="join-message-content-settings-text">-- Message To Send:</div>
                        <input class="input-field-dark" id="join-message-content-settings" value="${chatSettings["join-message"]}"/>
                        <div class="help" id="join-message-content-help" onmouseover="openHelpTag('The message that is sent.<br>Use $chat for chat name<br>Use $user for username')" onmouseleave="closeHelpTag()"></div>

                        <div class="setting-text" id="join-message-channel-settings-text">-- Channel To Send Message To:</div>
                        <select class="input-field-dark" name="channel" id="join-message-channel-settings">
                            ${textChannels}
                        </select>
                        <div class="help" id="join-message-channel-help" onmouseover="openHelpTag('Channel to send message to.')" onmouseleave="closeHelpTag()"></div>
                    </div>
                </div>

`)
    }
    if(admin){//or maintainer
        area.append(`
                <div class="container">
                    <div class="setting-text" id="in-maintainance-settings-text">Maintainance Mode</div>
                    <input ${chatSettings["in-maintainance"]==="true"?"checked":""} type="checkbox" id="in-maintainance-settings"  onclick="if(this.checked){$('#maintainance-message-settings').removeClass('hidden')}else{$('#maintainance-message-settings').addClass('hidden')}"/>
                    <div class="help" id="in-maintainance-help" onmouseover="openHelpTag('Prevents users from opening the chat when enabled.')" onmouseleave="closeHelpTag()"></div>
                </div>
                <div class="container">
                    <div class="${chatSettings["in-maintainance"]==="true"?"":"hidden"}" id="maintainance-message-settings">
                        <div class="setting-text" id="maintainance-message-content-settings-text">-- Maintenance Message:</div>
                        <input class="input-field-dark" id="maintainance-message-content-settings" value="${chatSettings["maintainance-message"]}"/>
                        <div class="help" id="maintainance-message-content-help" onmouseover="openHelpTag('Message to be displayed to users.')" onmouseleave="closeHelpTag()"></div>
                    </div>
                </div>

                <div class="container">
                    <div class="setting-text" id="in-maintainance-whitelist-settings-text">Server Maintainers:</div>
                    <div id="in-maintainance-whitelist-settings">
                        <div id="maintainance-whitelist-names" class="scrollable" style="height: 100%;width: 75%"></div>
                        <input class="input-field-dark" id="maintainance-user-search" placeholder="Type username">
                        <button class="btn-true btn-cancel" onclick="maintainanceUser()">Add User!</button>
                    </div>                    
                    <div class="help" id="in-maintainance-users-help" onmouseover="openHelpTag('These users can bypasss maintenance mode.<br>Click a username to remove them.')" onmouseleave="closeHelpTag()"></div>
                </div>
`);
        for(let i = 0; i < i+1; i++) {
            let id = JSON.parse(currentChatData["settings"])["maintainers"].split(";")[i];
            if(!id)break;
            let user;
            for (let userID in currentChatUsers) {
                if (id===userID) {
                    let data = JSON.parse(currentChatUsers[userID]);
                    user = data["username"];
                    break;
                }
            }
            $('#maintainance-whitelist-names').append(`<div id="${id}-maintainer" onclick="$('#${id}-maintainer').remove()">${user}</div>`)
        }

    }
    area.append(`
                <div style="text-align: center;font-size: 20px;"><u>Rank and Channel Settings</u></div>
                <div class="container">
                    <div id="ranks-channels-settings">
                        <div id="channels-list-settings" class="scrollable">
                            <div class="title">Channels</div>
                            <div style="top:20px" class="container" id="channel-list-setting-edit">
                                <!--channels go here-->
                            </div>
                        </div>
                        <div id="rank-list-settings" class="scrollable">
                            <div class="title">Ranks</div>
                            <div style="top:20px" class="container" id="channel-rank-setting-edit">
                                <!--ranks go here-->
                            </div>
                        </div>
                        <!--left is ranks, right is channels-->
                    </div>
                </div>
`);
    let ranks = $('#channel-rank-setting-edit');
    ranks.append(`<div class="title">Sorry!  We underestimated the time it would take to make this, and it is not here yet.<br>Don't worry though!  It will be coming out as soon as it's ready, regardless of whether the next full update is complete.</div>`)

    // if(admin){//or can edit ranks
    //     let roles = JSON.parse(currentChatData["roles"]);
    //     for(let role in roles){
    //         let roleData = JSON.parse(roles[role]);
    //         if(!roleData["invisible"]){
    //             ranks.append(`<div id="${roleData["name"]}" class="chat-rank" style="color: ${roleData["colour"]}"><b>${roleData["name"]}</b></div>`);
    //         }
    //     }
    //     ranks.append(`<div id="online" class="chat-rank" style="color: #f8ffb3"><b>Online</b></div>`);
    //     ranks.parent().append(`<button class="btn-true" style="left:10px;bottom:10px;">Create Rank</button>`);
    //     ranks.parent().append(`<button class="btn-false" style="right:10px;bottom:10px;">Delete Rank</button>`);
    // }else{
    //     ranks.append(`<div class="title">You do not have permission to change the chats ranks</div>`)
    // }
    //
    let channelArea = $('#channel-list-setting-edit');
    channelArea.append(`<div class="title">Sorry!  We underestimated the time it would take to make this, and it is not here yet.<br>Don't worry though!  It will be coming out as soon as it's ready, regardless of whether the next full update is complete.</div>`)

    // channelArea.html("");
    // if(!admin){//and can't edit chats
    //     channelArea.append(`<div class="title">You do not have permission to change the chats channels</div>`)
    // }else {
    //     raw = JSON.parse(currentChatData["channels"]);
    //     for (let key in raw) {
    //         let d1 = JSON.parse(raw[key]);
    //         channelArea.append(`<div class="channel-list-0 channel-list channel-list-edit" id="${d1["id"]}-edit" title="${d1["name"]}" onclick="editChannels($('#${d1["id"]}-edit'))"><b>${d1["name"] + (d1["type"] === "catagory" ? " v " : "")}</b></i></div>`);
    //         let c1 = JSON.parse(d1["contents"]);
    //         if (d1["type"] === "catagory") {
    //             channels.push("cat-0");
    //         } else if (d1["type"] === "chat") {
    //             channels.push("text-0");
    //         }
    //         for (let key2 in c1) {
    //             let d2 = JSON.parse(c1[key2]);
    //             let c2 = JSON.parse(d2["contents"]);
    //             let u1 = $(`#${d1["id"]}-edit`);
    //             u1.append(`<div class="channel-list-1 channel-list channel-list-edit" id="${d2["id"]}-edit" title="${d2["name"]}" onclick="editChannels($('#${d2["id"]}-edit'))"><b>${d2["name"] + (d2["type"] === "catagory" ? " v " : "")}</b></i></div>`);
    //             if (d2["type"] === "catagory") {
    //                 channels.push("cat-1");
    //             } else if (d2["type"] === "chat") {
    //                 channels.push("text-1");
    //             }
    //             for (let key3 in c2) {
    //                 let d3 = JSON.parse(c2[key3]);
    //                 let c3 = JSON.parse(d3["contents"]);
    //                 let u2 = $(`#${d2["id"]}-edit`);
    //                 u2.append(`<div class="channel-list-2 channel-list channel-list-edit" id="${d3["id"]}-edit" title="${d3["name"]}" onclick="editChannels($('#${d3["id"]}-edit'))"><b>${d3["name"] + (d2["type"] === "catagory" ? " v " : "")}</b></i></div>`);
    //                 if (d3["type"] === "catagory") {
    //                     channels.push("cat-2");
    //                 } else if (d3["type"] === "chat") {
    //                     channels.push("text-2");
    //                 }
    //                 for (let key4 in c3) {
    //                     let d4 = JSON.parse(c3[key4]);
    //                     let u3 = $(`#${d3["id"]}-edit`);
    //                     u3.append(`<div class="channel-list-3 channel-list channel-list-edit"  id="${d4["id"]}-edit" title="${d1["name"]}" onclick="editChannels($('#${d4["id"]}-edit'))"><b>${d4["name"]}</b></i></div>`);
    //                     if (d4["type"] === "chat") {
    //                         channels.push("text-3");
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     console.log(channels);
    // }
    if(admin){
        area.append(`
                <div class="container">
                    <div class="setting-text" id="user-search-settings-text">User Settings:</div>
                    <input class="input-field-dark" id="user-search-settings" placeholder="Type a users name here"/>
                    <button class="btn-blue" id="user-search-button-settings" onclick="searchChatUsers()">Search for user</button>
                    <div class="help" id="user-search-settings-help" onmouseover="openHelpTag('Opens a users profile')" onmouseleave="closeHelpTag()"></div>
                </div>

                <div class="container">
                    <div id="user-settings"></div>
                </div>
        `)
    }
    if(!admin){//or any other perms
        area.prepend(`
                <div class="container">
                    <div class="subtitle">You must be an [ADMIN] or have specific permissions to edit the global chat settings</div>
                </div>
`);
    }
}

function openHelpTag(message){
    let area = $('#help-tag');
    area.html(message);
    area.css("left", (getRelativeMouseX()+10)+"px");
    area.css("top", getRelativeMouseY()+"px");
    area.removeClass("hidden").addClass("show");
}
function closeHelpTag(){
    let area = $('#help-tag');
    area.addClass("hidden").removeClass("show");
}

function openInviteManager(){
    $('#invite-area').html("Loading invites...");
    show(document.getElementById('invite-settings-popup'));
    let json = {"username":read("username"), "token":read("token"), "data":"request", "requests":"invites", "chatID":currentChatID};
    send(json, displayInvites);
}

let inviteJson;
let deletedInvites = "";

function displayInvites(data){
    let invites = data["invites"];
    let area = $('#invite-area');
    if(!invites || invites==="{}"){
        area.html("This chat has no invites!");
    }else{
        area.html("");
        inviteJson = JSON.parse(invites);
        deletedInvites = "";
        for(let invite in inviteJson){
            area.append(`<div onclick="$('#${invite.replace('==', '')}').remove();delete inviteJson['${invite}'];deletedInvites += '${invite} '" id="${invite.replace('==', '')}">${window.location.href+"join/#"+invite}</div>`);
        }
    }
}

function updateInviteSettings(){
    $('#invite-area').html("Saving invites...");
    let json = {"username":read("username"), "token":read("token"), "data":"edit", "type":"invites", "chatID":currentChatID, "is_public":currentChatData["public-chat"]+"", "invites": JSON.stringify(inviteJson), "deleted":deletedInvites};
    send(json, invitesSaved);
}

function invitesSaved(data){
    if(invalid(data))return;
    message(data["message"]);
    hide(document.getElementById('invite-settings-popup'));
}

function searchChatUsers(){
    let user = $('#user-search-settings').val();
    if(!user)return;
    // let area = $('#user-settings');
    // area.html("");
    let id;
    for(let userID in currentChatUsers){
        let data = JSON.parse(currentChatUsers[userID]);
        if(data["username"].toLowerCase()===user.toLowerCase()){
            id = userID;
            break;
        }
    }
    if(!id){
        message("Unknown User");
        return;
    }
    openProfile(user, id);
}

function maintainanceUser(){
    let area = $('#maintainance-whitelist-names');
    let text = $('#maintainance-user-search');
    let user = text.val();
    let id;
    for(let userID in currentChatUsers){
        let data = JSON.parse(currentChatUsers[userID]);
        if(data["username"].toLowerCase()===user.toLowerCase()){
            id = userID;
            break;
        }
    }
    if(!id){
        message("Unknown User");
        return;
    }
    area.append(`<div id="${id}-maintainer" onclick="$('#${id}-maintainer').remove()">${user}</div>`)
}

let editing = false;
let indexOfEditingChat = -10;

function editChannels(area) {
    if(editing) return;
    editing = true;
    let name = area.attr("title");
    area.attr("onclick", null);
    area.children().filter("b").html(`<input class="edit-channel-input" value="${name}"/><div class="move-up arrow-up" onclick="moveChannel('${area.attr("id")}', -1)"></div><div class="move-down arrow-down" onclick="moveChannel('${area.attr("id")}', 1)"></div>`)
    let i = -10;
    let lookup = {};// for 1st channel in second catagory  cat-0:1, text-1:0
    let raw = JSON.parse(currentChatData["channels"]);
    for (let key in raw) {
        let d1 = JSON.parse(raw[key]);
        let c1 = JSON.parse(d1["contents"]);
        if (d1["type"] === "catagory") {
            lookup[0]={"type":"cat-0", "pos":key};
        } else if (d1["type"] === "chat") {
            lookup[0]={"type":"text-0", "pos":key};
        }
        for (let key2 in c1) {
            let d2 = JSON.parse(c1[key2]);
            let c2 = JSON.parse(d2["contents"]);
            if (d2["type"] === "catagory") {
                lookup[1]={"type":"cat-1", "pos":key2};
            } else if (d2["type"] === "chat") {
                lookup[1]={"type":"text-1", "pos":key2};
            }
            for (let key3 in c2) {
                let d3 = JSON.parse(c2[key3]);
                let c3 = JSON.parse(d3["contents"]);
                if (d3["type"] === "catagory") {
                    lookup[2]={"type":"cat-2", "pos":key3};
                } else if (d3["type"] === "chat") {
                    lookup[2]={"type":"text-2", "pos":key3};
                }
                for (let key4 in c3) {
                    let d4 = JSON.parse(c3[key4]);
                    if (d4["type"] === "catagory") {
                        lookup[3]={"type":"text-3", "pos":key4};
                    }
                }
            }
        }
    }
    let counts = {0:0, 1:0, 2:0, 3:0};
    for(let index = 0; index < channels.length; index++){
        if(channels[index]===lookup[0]["type"]){
            if(counts[0]+""===lookup[0]["pos"]){
                if(!lookup[1]){
                    indexOfEditingChat = index;
                    return;
                }else{
                    for(; index < channels.length; index++) {
                        if (channels[index] === lookup[1]["type"]) {
                            if (counts[1] + "" === lookup[1]["pos"]) {
                                if (!lookup[2]) {
                                    indexOfEditingChat = index;
                                    return;
                                } else {
                                    for (; index < channels.length; index++) {
                                        if (channels[index] === lookup[2]["type"]) {
                                            if (counts[2] + "" === lookup[2]["pos"]) {
                                                if (!lookup[3]) {
                                                    indexOfEditingChat = index;
                                                    return;
                                                } else {
                                                    for(; index < channels.length; index++) {
                                                        if (channels[index] === lookup[3]["type"]) {
                                                            if (counts[3] + "" === lookup[3]["pos"]) {
                                                                indexOfEditingChat = index;
                                                                return;
                                                            }
                                                            counts[3]++;
                                                        }
                                                    }
                                                }
                                            }
                                            counts[2]++;
                                        }

                                    }
                                }
                            }
                            counts[1]++;
                        }
                    }
                }
            }
            counts[0]++;
        }
    }
}

function moveChannel(id, dir) {
    if(dir > 1 || dir < -1) throw new Error;
    if(dir+indexOfEditingChat >= channels.length || indexOfEditingChat+dir < 0) return;

    let newarr = [];
    for(let n = 0; n < channels.length; n++){
        if(n==indexOfEditingChat+dir){
            let push = "";
            if(channels[indexOfEditingChat+dir].includes("cat")){
                push = "cat-";
            }else{
                push = "text-";
            }
            if(indexOfEditingChat+dir==0){
                push+=0;
            }else if(dir>1){
                let above = channels[indexOfEditingChat+dir];
                let num = Number(above.split("-")[1]);
                if(push.contains("cat")){
                    if(num == 3)push+=num;
                    else push+= (num+1);
                }else if(above.includes("cat")){
                    push+=(num+1);
                }else{
                    push+=num;
                }
            }else if(dir<1){
                let above = channels[indexOfEditingChat+dir-1];
                let num = Number(above.split("-")[1]);
                if(push.contains("cat")){
                    if(num == 3)push+=num;
                    else push+= (num+1);
                }else if(above.includes("cat")){
                    push+=(num+1);
                }else{
                    push+=num;
                }
            }
            newarr.push(channels[indexOfEditingChat]);
        }else if(n<indexOfEditingChat){
            newarr.push(channels[n]);
        }else if(n==indexOfEditingChat){
            newarr.push(channels[n+dir])
        }else{
            newarr.push(channels[n]);
        }
    }
    indexOfEditingChat += dir;
    channels = newarr;
    console.log(channels)
}

function safeClose(){
    hideMenus();
    $("#close").addClass("hide").removeClass("show");
    if(currentChatID == 0){
        //TODO alert saying no chat is selected
        showChats();
    }
}

function showChats(){
    requestData("chats");
    hideMenus();
    $("#chat-select").addClass("show").removeClass("hide");
    yourChats();
    $("#close").addClass("show").removeClass("hide").css("width", "20%").css("left", "0");
    reorderChats();
}
function showDMs(){
    hideMenus();
    $("#chat-select").addClass("show").removeClass("hide");
    yourDms();
    $("#close").addClass("show").removeClass("hide").css("width", "20%").css("left", "0");
}

function showUserList(tab){
    hideMenus();
    $("#user-list").addClass("show").removeClass("hide");
    tab();
    $("#close").addClass("show").removeClass("hide").css("width", "40%").css("left", "20%");
}
function openHelp() {
    hideMenus();
    $("#help-menu").addClass("show").removeClass("hide");
    $("#close").addClass("show").removeClass("hide").css("width", "10%").css("left", "70%");
}
function openSettings() {
    hideMenus();
    $("#settings-menu").addClass("show").removeClass("hide");
    $("#close").addClass("show").removeClass("hide").css("width", "10%").css("left", "80%");

    $('#user-setting-val').val(read("username"));
    $('#email-setting-val').val(read("email"));

    let settings = JSON.parse(read("settings"));
    $('#email-notif-setting-val').prop("checked", settings["email-notifs"]==="true");
    let id = settings["scan-id"];
    id=(id==null?"1":id);
    $('.scanner-settings-val').filter('[value="'+id+'"]').prop("checked", true);
}


function friends(){
    // showUserMenu('#browse-chat-list');
    userMenuButton('#friend-select-button');
    setUserList('friends');
    userOptionMethod = friends;
}
function closeFriends(){
    userMenuButton('#close-select-button');
    setUserList('close');
    userOptionMethod = closeFriends;
}
function pending() {
    userMenuButton('#pending-select-button');
    setUserList('pending');
    userOptionMethod = pending;
}
function blocked(){
    userMenuButton('#blocked-select-button');
    setUserList('blocked');
    userOptionMethod = blocked;
}

function setUserList(type){

    if(type === "blocked"){
        $("#add-friend").attr("placeholder", "Type username to block user");
        $('#add-friend-btn').html("Block!");
    }else{
        $("#add-friend").attr("placeholder", "Type username to add new friend");
        $('#add-friend-btn').html("Add!");
    }

    let area = $('#friend-list');
    let friends = JSON.parse(read(type));

    let message = "";
    if(type === "pending"){
        message = "Incoming friend request,<br>Click 'Add Friend' to add them!"
    }
    if(type === "outgoing"){
        message = "Outgoing friend request,<br>You need to wait for them to add you."
    }else{
        area.html("");
    }

    for(let user in friends) {
        let online = JSON.parse(JSON.parse(friends[user+""])["online"]);
        let name = JSON.parse(friends[user+""])["username"];
        let status = online["id"];
        let status_content = online["status"];
        if(!status_content)status_content="";
        if(status_content.length>32){
            status_content = status_content.substr(0, 32)+"<br>"+status_content.substr(32, status_content.length);
        }
        let col = JSON.parse(online["colours"])[status];
        if(!col){
            col = defaultColours[status];
        }else{
            col = '#' + col;
        }

        area.append(`
        <div class="h100 profile">
        <div class="profile-bg" id="${user}">
        </div>
        </div>
`);
        let elm = $('.profile-bg').filter('#'+user);
        elm.append(`
        <div class="title" style="color: #81ffb1;font-size: 25px;">${name}</div>
        <div id="profile-online-status">
            <div class="profile-pic" style="top:35px;background-image: url(${JSON.parse(friends[user+""])["avitar"]});">
                <div id="profile-online-status-icon" style="background-color: ${col}"></div>
            </div>
            <div class="profile-online-status-text" id="profile-online-status-text-${user}"></div>
            <div id="profile-status-text">${online["is_online_now"] === "true" ? status_content : ""}</div>
        </div>
        <div style="position:absolute;top: 100px; text-align: center">${message}</div>
    `);
        let text = $('#profile-online-status-text-'+user);
        let text_content = status < 4 ? defaultNames[status] : JSON.parse(online["names"])[user];
        text.css("color", col);
        text.html(text_content);

        if (JSON.parse(read("friends"))[user]) {
            elm.append(`<button class="btn-blue" id="friend" onclick="user('friend', false, '${user}')">Remove Friend</button>`);
        } else {
            if(type==="pending"){
                elm.append(`<button class="btn-blue" id="no-friend" onclick="user('deny', true, '${user}')">Don't Add</button>`);
            }
            elm.append(`<button class="btn-blue" id="friend" onclick="user('friend', true, '${user}')">Add Friend</button>`);
        }
        if (JSON.parse(read("close"))[user]) {
            elm.append(`<button class="btn-blue" id="close-friend" onclick="user('close-friend', false, '${user}')">Remove Close Friend</button>`);
        } else {
            elm.append(`<button class="btn-blue" id="close-friend" onclick="user('close-friend', true, '${user}')">Add Close Friend</button>`);
        }
        if (JSON.parse(read("blocked"))[user]) {
            elm.append(`<button class="btn-blue" id="blocked" onclick="user('block', false, '${user}')">Unblock User</button>`);
        } else {
            elm.append(`<button class="btn-blue" id="blocked" onclick="user('block', true, '${user}')">Block User</button>`);
        }
        elm.append(`<button class="btn-blue" id="start-dm" onclick="createNewDM('${user}')">Start DM</button>`);
    }
    if(type === "pending"){setUserList("outgoing")}
}

// function showUserMenu(menu){
//     $('#browse-chat-list').removeClass("show").addClass("hide");
//     $('#your-dm-list').removeClass("show").addClass("hide");
//     $('#current-chat-list').removeClass("show").addClass("hide");
//     $(menu).removeClass("hide").addClass("show");
// }

function addSearchedFriend(){
    let area = $('#add-friend');
    let usr = area.val();
    area.val("");
    user('friend', true, usr);
}
function blockSearchedUser(){
    let area = $('#add-friend');
    let usr = area.val();
    area.val("");
    user('block', true, usr);
}

function userMenuButton(button){
    $('#friend-select-button').removeClass("btn-100-br-selected").addClass("btn-100-off-br");
    $('#close-select-button').removeClass("btn-100-br-selected").addClass("btn-100-off-br");
    $('#pending-select-button').removeClass("btn-100-br-selected").addClass("btn-100-off-br");
    $('#blocked-select-button').removeClass("btn-100-br-selected").addClass("btn-100-off-br");
    $(button).removeClass("btn-100-off-br").addClass("btn-100-br-selected");
}


function requestData(data){
    if(!data){
        data = "chats;dms;avitar;friends;close;blocked;online;settings;id;pending;outgoing;email;unread;";
    }
    let json = {"username":read("username"), "token":read("token"), "data":"request", "requests":data};
    send(json, handleRequest);
}

function handleRequest(data){
    if(invalid(data))return;
    for(let key in data) save(key, data[key]);
    if(data["unread"]){
        messageStore=JSON.parse(data["unread"]);
        messageStoreDisply();
    }
    method();
    method = none;
    onlineStatusUpdate();
    if(nextChatID){
        switchChat(nextChatID, nextChatDM);
        nextChatID = null;
    }
    userOptionMethod();
    userChatMethod();

    setDropDownData();


}

function setDropDownData(){
    let chats = $('#chat-drop-down');
    let dms = $('#DM-drop-down');
    let friends = $('#friend-drop-down');
    let close = $('#close-friend-drop-down');
    let pending = $('#pending-drop-down');
    let blocked = $('#blocked-drop-down');
    //search for me
    //chats
    chats.html("<u>Chats</u>");
    let data = JSON.parse(read("chats"));
    let count = 0;
    for(let chat in data) {
        if(count >= 3)break;
        let data = JSON.parse(read("chats"));
        let d = JSON.parse(data[(chat + "")]);
        if (d.starred === "true") {
            addMenuChat(chat, chats, false);
            count++;
        }
    }
    for(let chat in data) {
        if(count >= 3)break;
        let data = JSON.parse(read("chats"));
        let d = JSON.parse(data[(chat + "")]);
        if (d.starred === "false") {
            addMenuChat(chat, chats, false);
            count++;
        }
    }

    //dms
    dms.html("<u>DMs</u>");
    data = JSON.parse(read("dms"));
    count = 0;
    for(let chat in data) {
        if (count >= 3) break;
        addMenuChat(chat, dms, true);
        count++;
    }

    //users
    count = 0;
    friends.html("<u>Friends</u>");
    data = JSON.parse(read("friends"));
    for(let id in data) {
        if(count >= 9) break;
        userDropDown(id, data, friends, this.friends);
        count++;
    }

    count = 0;
    close.html("<u>Close Friends</u>");
    data = JSON.parse(read("close"));
    for(let id in data) {
        if(count >= 9) break;
        userDropDown(id, data, close, this.closeFriends);
        count++;
    }

    count = 0;
    pending.html("<u>Pending Friends</u>");
    data = JSON.parse(read("pending"));
    for(let id in data) {
        if(count >= 9) break;
        userDropDown(id, data, pending, this.pending, "Incoming Request");
        count++;
    }
    data = JSON.parse(read("outgoing"));
    for(let id in data) {
        if(count >= 9) break;
        userDropDown(id, data, pending, this.pending, "Outgoing Request");
        count++;
    }

    count = 0;
    blocked.html("<u>Blocked Users</u>");
    data = JSON.parse(read("blocked"));
    for(let id in data) {
        if(count >= 9) break;
        userDropDown(id, data, this.blocked, blocked);
        count++;
    }
}

function userDropDown(id, data, area, menu, text){
    let userData = JSON.parse(data[id+""]);
    let online = JSON.parse(userData["online"]);
    let status = online["id"];
    if(!text)text="";

    let col = JSON.parse(online["colours"])[status];
    if(!col){
        col = defaultColours[status];
    }else{
        col = '#' + col;
    }

    area.append(`<div class="chat-user" id="${id}" onclick="showUserList(${menu});//openProfile('${userData["username"]}', ${"'" + id + "'"})">
                                    <div class="chat-user-pp" style="background-image: url(${userData["avitar"]})"></div>
                                    <div class="chat-user-online" style="background-color: ${col}"></div>
                                    <div class="chat-user-name">${userData["username"]}
                                    ${(userData["display-rank"]) ? `${!JSON.parse(currentChatRoles[userData["display-rank"]])["icon"] ? `` : `<div class="chat-user-icon" style="url(${JSON.parse(currentChatRoles[userData["display-rank"]])["icon"]})"></div>`}` : ``}</div>
                                    <!--</div>-->
                                    <div class="chat-user-status">${text}</div>
                                    </div>`);

}

function invalid(data){
    if(data.data === "error") {
        redirLogin(data["message"]);
        return true;
    }
    return false;
}

/**
 * Functions to change the view on the chats and DMs tabs.
 */
function yourChats(){
    showChatMenu('#current-chat-list');
    chatMenuButton('#chat-select-button');
    reorderChats();
    userChatMethod=yourChats;
    dmList=false;
}
function browseChats(){
    showChatMenu('#browse-chat-list');
    chatMenuButton('#browse-select-button');
    userChatMethod=browseChats;
    dmList=false;
}
function yourDms(){
    showChatMenu('#your-dm-list');
    chatMenuButton('#DM-select-button');
    let data = JSON.parse(read("dms"));
    if(Object.keys(data).length === 0){
        $('#your-dm-list').html("You currently have no DMs");
    }else{
        $('#your-dm-list').html("");
    }
    for(let chat in data){
        addChat(chat, true);
    }
    userChatMethod=yourDms;
    dmList=true;
}

function showChatMenu(menu){
    $('#browse-chat-list').removeClass("show").addClass("hide");
    $('#your-dm-list').removeClass("show").addClass("hide");
    $('#current-chat-list').removeClass("show").addClass("hide");
    $(menu).removeClass("hide").addClass("show");
}
function chatMenuButton(button){
    $('#chat-select-button').removeClass("btn-100-br-selected").addClass("btn-100-off-br");
    $('#browse-select-button').removeClass("btn-100-br-selected").addClass("btn-100-off-br");
    $('#DM-select-button').removeClass("btn-100-br-selected").addClass("btn-100-off-br");
    $(button).removeClass("btn-100-off-br").addClass("btn-100-br-selected");
}

function createNewChat(){
    create_dm = false;
    let json = {"username":read("username"), "token":read("token"), "data":"create", "is_dm":create_dm+"", "chat_name": $('#create-chat-name').val(), "desc": $('#create-chat-description').val()};
    send(json, handleCreateChat);
}
function createNewDM(user){
    create_dm = true;
    let json = {"username":read("username"), "token":read("token"), "data":"create", "is_dm":create_dm+"", "user":user};
    send(json, handleCreateChat);
}
function handleCreateChat(data){
    if(invalid(data))return;
    currentChatID=data["id"];
    method = createChatLoad;
    requestData();
}
function createChatLoad() {
    getChatMsgs = true;
    switchChat(currentChatID, create_dm);
    hide(document.getElementById('create-chat'));
}

function switchChat(chatID, dm){
    if(cancelOpen){
        cancelOpen = false;
        return;
    }
    isdm = dm;
    currentChatID = chatID+"";
    if(!messageStore[currentChatID]){

    }else {
        let amount = messageStore[isdm];
        amount -= messageStore[currentChatID];
        messageStore[isdm] = amount;
    }
    messageStoreDisply();

    messageStore[currentChatID]="";
    safeClose();
    let json = {"username":read("username"), "token":read("token"), "data":"request", "requests":"chat-data", "chatID": ""+chatID, "isdm":""+dm};
    getChatMsgs = true;
    send(json, handleOpenChat);
}

function messageStoreDisply() {
    let dms = messageStore["true"];
    let chats = messageStore["false"];

    $('#chat-select-button-count').html(chats);
    $('#chat-button-count').html(chats);

    $('#dm-select-button-count').html(dms);
    $('#dm-button-count').html(dms);
}

function updateChatUser(id, userData){
    $('#'+id).remove();
    try {
        let save = JSON.parse(currentChatUsers[id + ""])["online"] = userData;
        currentChatUsers[id + ""] = JSON.stringify(save);
    }catch(err){
        currentChatUsers[id + ""] = JSON.stringify(userData);
        userData = JSON.parse(currentChatUsers[id + ""]);
    }
    let area_to_add_user;
    let online = JSON.parse(userData["online"]);
    if(online["is_online_now"]==="true"){
        let rank = userData["display-rank"];
        if(!rank){
            area_to_add_user = $('#online');
        }else{
            area_to_add_user = $('#'+rank);
        }
    }else{
        area_to_add_user = $('#offline');
    }
    let status = online["id"];
    let status_content = online["status"];
    if(!status_content)status_content="";
    if(status_content.length>32){
        status_content = status_content.substr(0, 32)+"<br>"+status_content.substr(32, status_content.length);
    }
    let col = JSON.parse(online["colours"])[status];
    if(!col){
        col = defaultColours[status];
    }else{
        col = '#'+col;
    }

    area_to_add_user.append(`<div class="chat-user" id="${id}" onclick="openProfile('${userData["username"].split("'").join("\\'")}', ${"'"+id+"'"})">
                                    <div class="chat-user-pp" style="background-image: url(${userData["avitar"]})"></div>
                                    <div class="chat-user-online" style="background-color: ${col}"></div>
                                    <div class="chat-user-name">${userData["username"]}
                                    ${(userData["display-rank"]) ?`${!JSON.parse(currentChatRoles[userData["display-rank"]])["icon"]?``:`<div class="chat-user-icon" style="url(${JSON.parse(currentChatRoles[userData["display-rank"]])["icon"]})"></div>`}`:``}</div>
                                    <!--</div>-->
                                    <div class="chat-user-status">${online["is_online_now"]==="true"?status_content:""}</div>
                                    </div>`);

    while($('.chat-user').filter(function( index ) {
            return $( this ).attr( "id" ) === id+"";
        }
    ).length > 1){
        $('.chat-user').filter(function( index ) {
            return $( this ).attr( "id" ) === id+"";
        }).eq(1).remove();
    }
}

function handleOpenChat(data){//adds things to the storage when you select a chat
    if(invalid(data))return;

    //TODO stuff like users and channels
    currentChatData = data;
    if(getChatMsgs) {
        currentChannelID = data["main-chat"]+"";
    }

    if(!isdm){
        let chatData = JSON.parse(JSON.parse(read("chats"))[currentChatID]);

        if(JSON.parse(currentChatData["settings"])["in-maintainance"]==="true"){
            if(read("username")===chatData["owner"] || (!JSON.parse(currentChatData["settings"])["maintainers"]?false:JSON.parse(currentChatData["settings"])["maintainers"].includes(read("id")))){}else {
                message(JSON.parse(currentChatData["settings"])["maintainance-message"]);
                currentChatData = {};
                currentChatID = "";
                currentChannelID = "";
                safeClose();
                return;
            }
        }

        let userArea = $('#users');
        userArea.html("");
        let users = JSON.parse(data["users"]);
        let roles = JSON.parse(data["roles"]);
        currentChatUsers = users;
        currentChatRoles = roles;

        for(let role in roles){
            let roleData = JSON.parse(roles[role]);
            if(!roleData["invisible"]){
                userArea.append(`<div id="${roleData["name"]}" class="chat-rank" style="color: ${roleData["colour"]}"><b>${roleData["name"]}</b></div>`);
            }
        }
        userArea.append(`<div id="online" class="chat-rank" style="color: #FFEF0F"><b>Online</b></div>`);
        userArea.append(`<div id="offline" class="chat-rank" style="color: #A0B7FF"><b>Offline</b></div>`);
        // console.log(users);
        // console.log(roles);
        //TODO make note of users roles and permissions
        for(let user in users){
            let userData = JSON.parse(users[user]);
            //console.log(userData);
            let area_to_add_user;
            let online = JSON.parse(userData["online"]);
            if(online["is_online_now"]==="true"){
                let rank = userData["display-rank"];
                if(!rank){
                    area_to_add_user = $('#online');
                }else{
                    area_to_add_user = $('#'+rank);
                }
            }else{
                area_to_add_user = $('#offline');
            }
            let status = online["id"];
            let status_content = online["status"];
            if(!status_content)status_content="";
            if(status_content.length>32){
                status_content = status_content.substr(0, 32)+"<br>"+status_content.substr(32, status_content.length);
            }
            let col = JSON.parse(online["colours"])[status];
            if(!col){
                col = defaultColours[status];
            }else{
                col = '#' + col;
            }
            area_to_add_user.append(`<div class="chat-user" id="${user}" onclick="openProfile('${userData["username"].split("'").join("\\'")}', ${"'"+user+"'"})">
                                    <div class="chat-user-pp" style="background-image: url(${userData["avitar"]})"></div>
                                    <div class="chat-user-online" style="background-color: ${col}"></div>
                                    <div class="chat-user-name">${userData["username"]}
                                    ${(userData["display-rank"]) ?`${!JSON.parse(roles[user["display-rank"]])["icon"]?``:`<div class="chat-user-icon" style="url(${JSON.parse(roles[user["display-rank"]])["icon"]})"></div>`}`:``}</div>
                                    <div class="chat-user-status">${online["is_online_now"]==="true"?status_content:""}</div>
                                    </div>`);
        }
        let channels = $('#channels-list');
        channels.html("");
        let raw = JSON.parse(data["channels"]);
        for(let key in raw){
            let d1 = JSON.parse(raw[key]);
            console.log(d1["name"]);
            channels.append(`<div class="channel-list-0 channel-list" id="${d1["id"]}"><b>${(currentChannelID === d1["id"] ? "<i> -- ":"") + d1["name"] + (d1["type"]==="catagory"?" v " : "")}</b></i></div>`);
            let c1 = JSON.parse(d1["contents"]);
            for(let key2 in c1){
                let d2 = JSON.parse(c1[key2]);
                console.log("\t"+d2["name"]);
                let c2 = JSON.parse(d2["contents"]);
                let u1 = $(`#${d1["id"]}`);
                u1.append(`<div class="channel-list-1 channel-list" id="${d2["id"]}"><b>${(currentChannelID === d2["id"] ? "<i> -- ":"") + d2["name"] + (d2["type"]==="catagory"?" v " : "")}</b></i></div>`);
                for(let key3 in c2) {
                    let d3 = JSON.parse(c2[key3]);
                    console.log("\t" + "\t" + d3["name"]);
                    let c3 = JSON.parse(d3["contents"]);
                    let u2 = $(`#${d2["id"]}`);
                    u2.append(`<div class="channel-list-2 channel-list" id="${d3["id"]}"><b>${(currentChannelID === d3["id"] ? "<i> -- ":"") + d3["name"] + (d2["type"]==="catagory"?" v " : "")}</b></i></div>`);
                    for (let key4 in c3) {
                        let d4 = JSON.parse(c3[key4]);
                        console.log("\t" + "\t" + "\t" + d4["name"]);
                        let u3 = $(`#${d3["id"]}`);
                        u3.append(`<div class="channel-list-3 channel-list"  id="${d4["id"]}"><b>${(currentChannelID === d4["id"] ? "<i> -- ":"") + d4["name"]}</b></i></div>`);
                    }
                }
            }
        }
    }else{
        let chatData = JSON.parse(JSON.parse(read("dms"))[currentChatID]);
        let userArea = $('#users');
        userArea.html("");
        let users = JSON.parse(data["users"]);
        let roles = JSON.parse(data["roles"]);
        currentChatUsers = users;
        currentChatRoles = roles;

        for(let role in roles){
            let roleData = JSON.parse(roles[role]);
            if(!roleData["invisible"]){
                userArea.append(`<div id="${roleData["name"]}" class="chat-rank" style="color: ${roleData["colour"]}"><b>${roleData["name"]}</b></div>`);
            }
        }
        userArea.append(`<div id="online" class="chat-rank" style="color: #FFEF0F"><b>Online</b></div>`);
        userArea.append(`<div id="offline" class="chat-rank" style="color: #A0B7FF"><b>Offline</b></div>`);
        for(let user in users){
            let userData = JSON.parse(users[user]);
            let area_to_add_user;
            let online = JSON.parse(userData["online"]);
            if(online["is_online_now"]==="true"){
                    area_to_add_user = $('#online');
            }else{
                area_to_add_user = $('#offline');
            }
            let status = online["id"];
            let status_content = online["status"];
            if(!status_content)status_content="";
            if(status_content.length>32){
                status_content = status_content.substr(0, 32)+"<br>"+status_content.substr(32, status_content.length);
            }
            let col = JSON.parse(online["colours"])[status];
            if(!col){
                col = defaultColours[status];
            }else{
                col = '#' + col;
            }
            area_to_add_user.append(`<div class="chat-user" id="${user}" onclick="openProfile('${userData["username"].split("'").join("\\'")}', ${"'"+user+"'"})">
                                    <div class="chat-user-pp" style="background-image: url(${userData["avitar"]})"></div>
                                    <div class="chat-user-online" style="background-color: ${col}"></div>
                                    <div class="chat-user-name">${userData["username"]}
                                    ${(userData["display-rank"]) ?`${!JSON.parse(roles[user["display-rank"]])["icon"]?``:`<div class="chat-user-icon" style="url(${JSON.parse(roles[user["display-rank"]])["icon"]})"></div>`}`:``}</div>
                                    <div class="chat-user-status">${online["is_online_now"]==="true"?status_content:""}</div>
                                    </div>`);
        }
        let channels = $('#channels-list');
        channels.html("");
        channels.append("DM");
    }
    $('.channel-list').click(function (event) {
        event.stopPropagation();
        let title = $(this).children().filter("b").eq(0);
        let content = title.html();
        // console.log(event.ctrlKey);
        if(event.ctrlKey)return;
        event.ctrlKey = true;
        try {
            if ($(this).children().filter("div").eq(0).attr('class').split(/\s+/).includes("shrink-up-fade")) {
                $(this).children().filter("div").removeClass("shrink-up-fade").addClass("show");
                content = content.substr(0, content.length - 5);
                title.html(content + "v ");
            } else {
                $(this).children().filter("div").addClass("shrink-up-fade").removeClass("show");
                content = content.substr(0, content.length - 2);
                title.html(content + "> ");
            }
        }catch(err){
            content = " -- " + title.eq(0).html();
            if(content.includes("<i>"))return;
            let prevChat = $('#'+currentChannelID).children().eq(0);//bold element
            prevChat.html(prevChat.children().eq(0).html().split(" -- ")[1]);
            title.html("<i>"+content+"</i>");
            currentChannelID = title.parent().attr("id");
            let json = {"username":read("username"), "token":read("token"), "data":"request", "requests":"messages", "chatID": ""+currentChatID, "isdm":""+isdm, "channelID":""+currentChannelID};
            send(json, getMessages);
        }
    });

    if(getChatMsgs) {
        let json = {
            "username": read("username"),
            "token": read("token"),
            "data": "request",
            "requests": "messages",
            "chatID": "" + currentChatID,
            "isdm": "" + isdm,
            "channelID": "" + currentChannelID
        };
        send(json, getMessages);
    }
}

function getMessages(data){
    if(invalid(data))return;
    let area = $('#msgs');
    area.html("");
    for(let message_id in data){
        let message = JSON.parse(data[message_id]);
        addMessage(message);
    }
    let scrollArea = $('#message-area');
    let height = scrollArea[0].scrollHeight;
    scrollArea.scrollTop(height);
    messages = 25;
}

function addMessage(message){
//                                        ${!JSON.parse(roles[user["display-rank"]])["icon"]?``:`<div class="chat-user-icon" style="url(${JSON.parse(roles[user["display-rank"]])["icon"]})"></div>`}</div>
    let d = new Date(Number(message["date"]));
    let area = $('#msgs');
    let num = message["warning_value"];
    let warn = '#a53028';
    let tagmsg = 'This message has a '+num+'% chance of<br>asking you for personal information.<br>';
    if(num<=33){
        warn = '#5fc069';
        tagmsg+='This message should be fine';
    }else
    if(num<=50){
        warn = '#e28e4f';
        tagmsg+='If it is, you shouldn\\\'t tell them, <br> however there are many safe messages in this catagory.';
    }else
    if(num<=75){
        warn='#e25b54';
        tagmsg+='If it is asking for personal information,<br>you shouldn\\\'t reply and should block them.';
    }else{
        tagmsg+='If it is asking for personal information,<br>you shouldn\\\'t reply and should block them.';
    }
    let scanID = JSON.parse(read("settings"))["scan-id"];
    if(!scanID)scanID=1;

    if(scanID==3){
        warn='argb(1,0,0,0)';
    }else if(scanID==2){
        if(JSON.parse(read("friends"))[message["sender_id"]]){
            warn='argb(1,0,0,0)';
        }
    }else if(scanID==1){
        if(JSON.parse(read("close"))[message["sender_id"]]){
            warn='argb(1,0,0,0)';
        }
    }
    if(message["sender_id"]===read("id")){
        warn='argb(1,0,0,0)';
    }


    area.append(`<div class="chat-area">
                    ${!message["sender_name"]?`<div style="width:1px;height:30px;"></div>`:`<div class="chat-area-pp" style="background-image: url(${message["avitar"]})" onclick="openProfile('${message["sender_name"].split("'").join("\\'")+"', '"+message["sender_id"]+"'"})"></div>
                    <div class="chat-area-username" onclick="openProfile('${message["sender_name"].split("'").join("\\'")+"', '"+message["sender_id"]+"'"})">${message["sender_name"]}${!currentChatUsers[message["sender_id"]]?"":(JSON.parse(currentChatUsers[message["sender_id"]])["display-rank"])?`${!JSON.parse(currentChatRoles[JSON.parse(currentChatUsers[message["sender_id"]])["display-rank"]])["icon"] ?``:`<div class="chat-user-icon" style="url(${JSON.parse(currentChatRoles[JSON.parse(currentChatUsers[message["sender_id"]])["display-rank"]])["icon"]})"></div>`}`:""}</div>`}
                    <div class="warning" style="background-color:${warn}"  onmouseover="openHelpTag('${tagmsg}')" onmouseleave="closeHelpTag()"></div>
                    <div class="chat-area-date">${d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()+" at "+((""+d.getHours()).length==1?0+""+d.getHours():d.getHours())+":"+((""+d.getMinutes()).length==1?0+""+d.getMinutes():d.getMinutes())}</div>
                    <div class="chat-area-content">${emojify(linkify(message["content"]))}</div>
                    <div class="chat-area-bar"></div>
                    </div>`);
}

function openProfile(name, id) {
    let elm = $("#profile-bg");
    elm.css('left', '');

    // console.log(name + " " + id)
    let online = JSON.parse(JSON.parse(currentChatUsers[id+""])["online"]);
    $('#prf').removeClass('hidden');
    let status = online["id"];
    let status_content = online["status"];
    if(!status_content)status_content="";
    if(status_content.length>32){
        status_content = status_content.substr(0, 32)+"<br>"+status_content.substr(32, status_content.length);
    }
    let col = JSON.parse(online["colours"])[status];
    if(!col){
        col = defaultColours[status];
    }else{
        col = '#'+col;
    }

    let y = getRelativeMouseY();
    if(y+350>$( window ).height())y=$( window ).height()-350;

    elm.html("");
    elm.append(`
        <div class="title" style="color: #81ffb1;font-size: 25px;">${name}</div>
        <div id="profile-online-status">
            <div class="profile-pic" style="top:35px;background-image: url(${JSON.parse(currentChatUsers[id+""])["avitar"]})">
                <div id="profile-online-status-icon" style="background-color: ${col}"></div>
            </div>
            <div class="profile-online-status-text" id="profile-online-status-text-down"></div>
            <div id="profile-status-text">${online["is_online_now"]==="true"?status_content:""}</div>
        </div>
    `);
    let text = $('#profile-online-status-text-down');
    let text_content = status<4?defaultNames[status]:JSON.parse(online["names"])[status];
    text.css("color", col);
    text.html(text_content);
    /*
        <button class="btn-blue" id="friend">Add Friend</button>
        <button class="btn-blue" id="close-friend">Close Friend</button>
        <button class="btn-blue" id="block">Block User</button>
        <button class="btn-blue" id="start-dm">Start DM</button>
     */
    if(!isdm) {
        let chatData = JSON.parse(JSON.parse(read("chats"))[currentChatID]);
        if (chatData["owner"] === read("username")) {
            elm.append(`<button class="btn-blue" id="no-friend" onclick="kick('${id}')">Kick user</button>`);
        }
    }
    if(JSON.parse(read("friends"))[id]){
        elm.append(`<button class="btn-blue" id="friend" onclick="user('friend', false, '${id}')">Remove Friend</button>`);
    }else{
        elm.append(`<button class="btn-blue" id="friend" onclick="user('friend', true, '${id}')">Add Friend</button>`);
    }
    if(JSON.parse(read("close"))[id]){
        elm.append(`<button class="btn-blue" id="close-friend" onclick="user('close-friend', false, '${id}')">Remove Close Friend</button>`);
    }else{
        elm.append(`<button class="btn-blue" id="close-friend" onclick="user('close-friend', true, '${id}')">Add Close Friend</button>`);
    }
    if(JSON.parse(read("blocked"))[id]){
        elm.append(`<button class="btn-blue" id="blocked" onclick="user('block', false, '${id}')">Unblock User</button>`);
    }else{
        elm.append(`<button class="btn-blue" id="blocked" onclick="user('block', true, '${id}')">Block User</button>`);
    }

    elm.append(`<button class="btn-blue" id="start-dm" onclick="createNewDM('${id}')">Start DM</button>`);

    elm.addClass("show").removeClass("hide-shrink");
    elm.css("top", y);
    elm.css("left", getRelativeMouseX());

}

function kick(user){
    let json = {"username":read("username"), "token":read("token"), "data":"remove-user", "type":"kick", "user": ""+user, "chat":""+currentChatID};
    send(json, handleKickUser);
}
function handleKickUser(data){
    if(invalid(data))return;
    message(data["message"]);
}

function user(action, result, id){
    let json = {"username":read("username"), "token":read("token"), "data":"user-request", "request":action+"", "request-data": ""+result, "user":""+id};
    send(json, handleUserRequest);
}
function handleUserRequest(data){
    if(invalid(data))return;
    nextChatID = data["chatID"];
    nextChatDM = true;
    requestData("friends;blocked;pending;outgoing;close;dms;");
}

jQuery(function($) {
    $('.new-message-area').keyup(function (event) {
        if (event.keyCode == 13 && event.shiftKey) {
            event.stopPropagation();

        } else if (event.keyCode == 13) {
            event.stopPropagation();
            let content = this.value;
            if(content.length > 2000){
                message("Sorry, messages must be less than 2000 characters");
                return;
            }
            let caret = getCaret(this);
            this.value = content.substring(0, caret-1)+content.substring(caret, content.length);
            let mentions = "";
            let data = {"username":read("username"), "token":read("token"), "data":"msg", "channel_id": `${currentChannelID}`, "chat_id": `${currentChatID}`, "is_dm": `${isdm}`, "content": this.value, "embed_data": null, "uploads": null, "mentions": mentions};
            send(data, none);
            this.value = "";
        }
    });
    $('#message-area').scroll(function (event){
        let area = $(this);
        let bottom = area.scrollTop() + area.innerHeight() >= area[0].scrollHeight;
        if(bottom){
            $('#text-box').css("box-shadow", "none");
        }else{
            $('#text-box').css("box-shadow", "0px 0px 20px 4px #000");
        }
    });
    $('#search-bar').keyup(function (event) {
        if (event.keyCode == 13) {
            event.stopPropagation();
            searchChats();
        }
    });
});
function getCaret(el) {
    if (el.selectionStart) {
        return el.selectionStart;
    } else if (document.selection) {
        el.focus();

        let r = document.selection.createRange();
        if (r == null) {
            return 0;
        }

        let re = el.createTextRange(),
            rc = re.duplicate();
        re.moveToBookmark(r.getBookmark());
        rc.setEndPoint('EndToStart', re);

        return rc.text.length;
    }
    return 0;
}

function handlePublicChatSearch(data){
    let chats = (JSON.parse(data["chats"]));
    let area = $('#browse-chat-list');
    area.html("Type key words into the box above to search for a public chat.<br><br>" +
        "Eien.no Chat is new so there isn't that many public chats yet. Why not create your own one?");
    let find = $('#search-bar').val().toLowerCase();

    let checked = [];
    checked.push(null);
    checked.push(undefined);
    for(let chat in chats){
        if(checked.includes(chat))continue;
        let chatData = JSON.parse(chats[chat]);
        if(chatData["name"].toLowerCase() === find){
            checked.push(chat);
            addPublicChat(chat, area, chatData);
        }
    }
    for(let chat in chats){
        if(checked.includes(chat))continue;
        let chatData = JSON.parse(chats[chat]);
        if(chatData["name"].toLowerCase().includes(find)){
            checked.push(chat);
            addPublicChat(chat, area, chatData);
        }
    }
    for(let chat in chats){
        if(checked.includes(chat))continue;
        let chatData = JSON.parse(chats[chat]);
        if(chatData["desc"].toLowerCase().includes(find)){
            checked.push(chat);
            addPublicChat(chat, area, chatData);
        }
    }
    let scores = {};
    for(let chat in chats){
        if(checked.includes(chat))continue;
        if(!chat)continue;
        let chatData = JSON.parse(chats[chat]);
        let score = 0;
        for(let word in find) {
            if ((chatData["desc"] + " " + chatData["name"]).toLowerCase().includes(word)) {
                score ++;
            }
        }
        if(!scores[score]){
            scores[score] = chat+";";
        }else{
            scores[score] = scores[score]+chat+";";
        }
        checked.push(chat);
    }
    let list = [];
    for(let key in scores){
        if(!key)continue;
        list.push(scores[key])
    }
    for(let i = list.length; i >= 0; i--){
        if(!list[i])continue;
        for(let id in list[i].split(";")){
            try{
                addPublicChat(id, area, chats[id]);
            }catch(err){
                return;//results are useless
            }
        }
    }

}

function searchChats(){
    let find = $('#search-bar').val().toLowerCase();

    if(userChatMethod === browseChats){
        let json = {"username":read("username"), "token":read("token"), "data":"search", "term":find};
        send(json, handlePublicChatSearch);
        return;
    }

    let data = null;
    if(!dmList){
        data = JSON.parse(read("chats"));
    }else{
        data = JSON.parse(read("dms"))
    }
    if(find === ""){
        if(dmList){
            yourDms();
        }else{
            reorderChats();
        }
        return;
    }
    $('#starred-chats').html("Star your favourite chats and have them appear here to make it easier to find them!");
    $('#other-chats').html("Join public chats to meet new people by clicking the 'browse' button above, or create your own chat to talk to friends ☺");
    $('#your-dm-list').html("");
    let checked = [];
    checked.push(null);
    checked.push(undefined);
    for(let chat in data){
        if(checked.includes(chat))continue;
        let chatData = JSON.parse(data[chat]);
        if(chatData["name"].toLowerCase() === find){
            checked.push(chat);
            addChat(chat, dmList)
        }
    }
    for(let chat in data){
        if(checked.includes(chat))continue;
        let chatData = JSON.parse(data[chat]);
        if(chatData["name"].toLowerCase().includes(find)){
            checked.push(chat);
            addChat(chat, dmList)
        }
    }
    for(let chat in data){
        if(checked.includes(chat))continue;
        let chatData = JSON.parse(data[chat]);
        if(chatData["desc"].toLowerCase().includes(find)){
            checked.push(chat);
            addChat(chat, dmList)
        }
    }
    let scores = {};
    for(let chat in data){
        if(checked.includes(chat))continue;
        if(!chat)continue;
        let chatData = JSON.parse(data[chat]);
        let score = 0;
        for(let word in find) {
            if ((chatData["desc"] + " " + chatData["name"]).toLowerCase().includes(word)) {
                score ++;
            }
        }
        if(!scores[score]){
            scores[score] = chat+";";
        }else{
            scores[score] = scores[score]+chat+";";
        }
        checked.push(chat);
    }
    let list = [];
    for(let key in scores){
        if(!key)continue;
        list.push(scores[key])
    }
    for(let i = list.length; i >= 0; i--){
        if(!list[i])continue;
        for(let id in list[i].split(";")){
            try{
                addChat(id, dmList)
            }catch(err){
                return;//results are useless
            }
        }
    }
}
function reorderChats(){
    $('#starred-chats').html("Star your favourite chats and have them appear here to make it easier to find them!");
    $('#other-chats').html("Join public chats to meet new people by clicking the 'browse' button above, or create your own chat to talk to friends ☺");
    let data = JSON.parse(read("chats"));
    for(let chat in data){
        addChat(chat, false);
    }
}

function addPublicChat(chatID, menu, d){
    if(!chatID)return;
        menu.append(
            `<div class="chats-list-background" onclick="join('${chatID}')" id="${chatID}">
             <div class="chats-list-icon" style="background-image: url(${d["icon"]})"></div>
             <div class="chats-list-name-owner">${d['name']} | ${d['owner']}</div>
             <div class="chats-list-description">${split(d['desc'], 50)}</div>
        </div>`);
}
function join(chat){
    let json = {"username":read("username"), "token":read("token"), "data":"join", "code":chat};
    send(json, handleJoinChat);
    nextChatID = chat;
    nextChatDM = false;
}

function handleJoinChat(data){
    requestData("chats");
}

function addMenuChat(chatID, menu, isdm, chatData){
    if(!chatID)return;
    let data = chatData?chatData:JSON.parse(read(isdm?"dms":"chats"));
    let d = JSON.parse(data[(chatID+"")]);
    if(d.starred === "false" || !d.starred){
        menu.append(
            `<div class="chats-list-background" onclick="switchChat('${chatID}', ${isdm})">
             <div class="chats-list-icon" style="background-image: url(${d["icon"]})"></div>
             <div class="chats-list-name-owner">${d['name']} | ${d['owner']}</div>
             ${isdm?"":`<div class="chats-list-starred" onclick="star('${chatID}')">Star chat<div class="chats-list-star-false chats-list-star"></div></div>`}
        </div>`)

    }else if(d.starred === "true"){
        menu.append(
            `<div class="chats-list-background" onclick="switchChat('${chatID}', ${isdm})">
                 <div class="chats-list-icon" style="background-image: url(${d["icon"]})"></div>
                 <div class="chats-list-name-owner">${d['name']} | ${d['owner']}</div>
                 <div class="chats-list-starred" onclick="unstar('${chatID}')">Starred<div class="chats-list-star-true chats-list-star"></div></div>
            </div>`)
    }
}
function addChat(chatID, isdm){
    if(!chatID)return;
    let data = JSON.parse(read(isdm?"dms":"chats"));
    let d = JSON.parse(data[(chatID+"")]);
    if(d.starred === "false"){
        $(isdm?'#your-dm-list':'#other-chats').append(
            `<div class="chats-list-background" onclick="switchChat('${chatID}', ${isdm})" id="${chatID}">
             <div class="chats-list-icon" style="background-image: url(${d["icon"]})"></div>
             <div class="chats-list-name-owner">${d['name']} | ${d['owner']}</div>
             ${isdm?"":`<div class="chats-list-starred" onclick="star('${chatID}')">Star chat<div class="chats-list-star-false chats-list-star"></div></div>`}
             <div class="chats-list-description">${split(d['desc'], 50)}</div>
             ${!messageStore[chatID]?'':`<div class="chat-mmessage-count">${messageStore[chatID]}</div>`}
        </div>`)

    }else if(d.starred === "true"){
        $('#starred-chats').append(
            `<div class="chats-list-background" onclick="switchChat('${chatID}', ${isdm})" id="${chatID}">
                 <div class="chats-list-icon" style="background-image: url(${d["icon"]})"></div>
                 <div class="chats-list-name-owner">${d['name']} | ${d['owner']}</div>
                 <div class="chats-list-starred" onclick="unstar('${chatID}')">Starred<div class="chats-list-star-true chats-list-star"></div></div>
                 <div class="chats-list-description">${split(d['desc'], 50)}</div>
                 ${!messageStore[chatID] ? '' :`<div class="chat-mmessage-count">${messageStore[chatID]}</div>`}
                </div>`)
    }
    if(!isdm) {
        $('#' + chatID).bind("contextmenu", (function (e) {
            chatContext(chatID);
            e.preventDefault();
        }));
    }

}

function split(text, repeat){
    let add = repeat;
    while(text.length > repeat){
        text = text.substr(0, repeat) + "<br>" + text.substr(repeat)
        repeat += add + 4;//factor in for the 4 chats in <br>
    }
    return text;
}

function chatContext(chatID){
    let menu = $('.contextmenu');
    menu.html("");
    menu.append(`<div id="leaveChat" onclick="$('#prf').click();leaveChat('${chatID}')">Leave Chat</div>`)
    menu.removeClass("hide");
    menu.css('left', getRelativeMouseX());
    menu.css('top', getRelativeMouseY());
    $('#prf').removeClass("hidden");
}
function leaveChat(chatID) {
    let json = {"username":read("username"), "token":read("token"), "data":"leave", "chatID":""+chatID};
    send(json, none);
}

function star(chat){
    _star(chat, true);
}
function unstar(chat){
    _star(chat, false);
}
var _star = function(chat, bool){
    cancelOpen = true;
    let chats = JSON.parse(read("chats"));
    let chatData = JSON.parse(chats[chat]);
    chatData["starred"] = ""+bool;
    chats[chat] = JSON.stringify(chatData);
    save("chats", JSON.stringify(chats));
    reorderChats();
    let json = {"username":read("username"), "token":read("token"), "data":"edit", "type":"chat-star", "edit-info": "", "chatID":""+chat, "bool":""+bool};
    send(json, none);
};