/*! 
 * chatbox.js v1.0.0
 * (c) 2020 Huu Ha Nguyen and Phu H. Phung
 * Released under the MIT License for 
 * Cloud Computing and Applications course at the University of Dayton.
 * 
 * The MIT License:
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/ 

/*! 
 * INTRODUCTION
 *
 *  This library provides APIs to render a userlist and a private chatbox for each user.
 *  You need to implement some key JavaScript functions and call provided function APIs to integrate with your existing HTML UI.
 *  See the usage below.
 *
 * PREREQUISITES
 *  
 *  1. You need to have the jQuery library included in your page before you can use this library.
 *
 *  2. You must have the following JavaScript functions implemented in your page since these functions are called from this library:
 *     a. function sendPrivateChat(receiver, message){
 *          //your code to send a private chat message ${message} to ${receiver}
 *        }
 *     b. function requestChatHistory(username){
 *          //your code to send a request message to the server 
 *          // to get private chat history between the current user and the user ${username}
 *          // if you do not have the chat history implementation in your system, just provide blank code
 *        }
 *   
 * USAGE
 *
 *  1. Library inclusion:
 *     This JavaScript library is available at https://udayton-cloud.bitbucket.io/chatbox.js,
 *     together with a CSS file: https://udayton-cloud.bitbucket.io/chatbox.css.
 *     Before using it, you need to include these two files into your front-end HTML.
 *     You can include this library using one of two following options
 *       
 *     a. Include the URLs directly
 *        You can use the following jQuery to include the files WHEN you need 
 *        to display the chatUI:
 *          $('head').append('<link href="https://udayton-cloud.bitbucket.io/chatbox.css" rel="stylesheet">');
 *          $('head').append('<script type="text/javascript" src="https://udayton-cloud.bitbucket.io/chatbox.js"><\/script>');
 *
 *     b. Manually download and inclusion 
 *        You can manually download these two files and store them within your application's static folder 
 *        (the ROOT folder of static files). 
 *        Doing this way, you can freely customize the code. Similar to the above, 
 *        you can use the following jQuery to include the files WHEN you need 
 *        to display the chatUI:
 *           $('head').append('<link href="chatbox.css" rel="stylesheet">');
 *           $('head').append('<script type="text/javascript" src="chatbox.js"><\/script>');
 *
 *   2. APIs 
 *      You can use the following APIs available in this library:
 *
 *      a. setCurrentUser(account)
 *         You MUST call this function first to set the current user so that
 *         it will not be displayed in the userlist
 *          account is the parameter and MUST be in a JSON object of: 
 *          {username:"", fullname:"",avatar:""}
 *
 *      b. displayUserList(userlist)
 *         Call this function in your UI to display the list of online user.
 *         userlist must be in a JSON array of: [{username:"", fullname:"",avatar:""},...]
 *         You also need to set the value of currentUserListPositionID to the element ID 
 *         you want to display the userlist. If you do not set it, "menubar" ID is used by default.
 *         WARNING: if none of these exists in your code, the userlist cannot be displayed.
 *  
 *      c. updateUserList(userlist)
 *         Call this function in your UI to update the list of online user 
 *         in the case a user is offline
 *         userlist must be in a JSON array of: [{username:"", fullname:"",avatar:""},...]
 * 
 *      d. displayFriendMessage(sender, message) 
 *         Call the function in your UI to display a message from @sender (parameter) with @message (parameter)
 *         when it is arrived. 
 *  
 *      e. displaySelfMessage(receiver,message) 
 *         Call the function in your UI to display a message from current user
 *         sent to @receiver (parameter) with @message (parameter). 
 *         Use this WHEN you display message history
 *      
 */
 
if(!$){
    alert('This chatbox UI needs jQuery library, please include it and try again!');
}
var currentUserListPositionID = currentUserListPositionID || 'menubar';
var currentUserList = [];
activeUserList = [];
var currentUser="";

function setCurrentUser(user) {  
    if(!user || !user.username){
    //Only the current user, then no other users is online    
        chatboxAlert('Developers: You must provide a user account in a JSON object of: {username:"", fullname:"",avatar:""}');
        return;
    }
    currentUser= user.username; 
}

function displayUserList(userlist){
    currentUserList=userlist;
    renderUserList();
};

function displaySelfMessage(to_user,message){
    var user_chatbox = $("#chatbox_" + to_user);
    if (message.trim().length != 0) {
        var rel = $(user_chatbox).attr("rel");
        $('<span>You said: </span><div class="msg-right">' + message + '</div>').insertBefore('[rel="' + rel + '"] .msg_push');
        //Auto scroll the messages
        $('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
    }
}

function displayNoChatHistory(to_user){
    var user_chatbox = $("#chatbox_" + to_user);
    var rel = $(user_chatbox).attr("rel");
    $('<div>No chat history earlier.</div>').insertBefore('[rel="' + rel + '"] .msg_push');
    //Auto scroll the messages
    $('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
}

function displayFriendMessage(username, message) {
    //If chat box has not been displayed. Display
    var friendFullname;
    var friendAvatar;
    //Find user in list
    for (var idx in currentUserList) {
        user = currentUserList[idx]
        if (user.username == username) {
            friendFullname = user.fullname || user.username;
            friendAvatar = user.avatar || 'https://i.pravatar.cc/150?u='+username;
            break;
        }
    }
    if ($("#chatbox_" + username).length == 0) {
        renderChatbox(username, friendFullname);
        rearrangeChatbox();
        trigger_requestChatHistory(username); //version 2
        // return;
    }
    var user_chatbox = $("#chatbox_" + username);

    if (message && message.trim().length != 0) {
        var rel = $(user_chatbox).attr("rel");
        $('<img class="chat-avatar" src="' + friendAvatar + '" /><span>'+friendFullname+' said: </span><div class="msg-left">' + message + '</div>').insertBefore('[rel="' + rel + '"] .msg_push');
        //Auto scroll the messages
        $('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
    }
}


function updateUserList(userlist) {
    displayUserList(userlist);
    if(!activeUserList || activeUserList.length == 0){
        return;
    }
    $.each(activeUserList, function (index, username) {
        if ($("#chatbox_" + username).length == 1 && !currentUserList[username]) {
            removeChatbox(username);
        }
    });
}

/**
 * This function will render Friend List on Side Bar
 */

function renderUserList() {
    $("#chat-sidebar").empty();
    //alert("chatbox: " + currentUserList);
    if(!currentUserList || currentUserList.length == 0 || !currentUserList[0].username){
    //Only the current user, then no other users is online    
        chatboxAlert('Developers: You must provide a userlist in a JSON array of: [{username:"", fullname:"",avatar:""},...]');
        return;
    }
    if(!currentUserList || currentUserList.length == 1){
    //Only the current user, then no other users is online    
        $("#chat-sidebar").append('<span>You are the only online user</span>');
        clearAllChatbox();
        return;
    }
    for (var idx in currentUserList) {
        const user = currentUserList[idx];
        //console.log(currentUser) 
        if(user.username && user.username != currentUser){
            const avatar = user.avatar || 'https://i.pravatar.cc/150?u='+user.username;
            const fullname = user.fullname || user.username;
            const newusr = '<div id="sidebar-user-box" class="' + user.username + '">' +
            '<img class="user-avatar" id="avatar_'+user.username+'" src="' + avatar  + '" />' +
            '<span id="' + user.username + '"">' + fullname + '</span>' +
            '</div> '
            $("#chat-sidebar").append(newusr);
        } 
    }
}

/**
 * This function will render a chatbox with a specific username
 */
function renderChatbox(username, fullname) {
    if ($("#chatbox_" + username).length == 0) {
        chatPopup = '<div class="msg_box" style="right:270px" id="chatbox_' + username + '" rel="' + username + '">' +
            '<div class="msg_head">' + fullname + 
            '<div class="close">x</div> </div>' +
            '<div class="msg_wrap"> <div class="msg_body"> <div class="msg_push"></div> </div>' +
            '<div class="msg_footer"><textarea id="message" class="msg_input" rows="2"></textarea></div></div>  </div>';
        $("body").append(chatPopup);
        activeUserList.push(username);
    }else{
        $("#chatbox_" + username).show();
    }
}

function clearAllChatbox() {
    if(!activeUserList || activeUserList.length == 0){
        return;
    }
    $.each(activeUserList, function (index, username) {
        var chatbox = $("#chatbox_" + username);
        if (chatbox != null) {
            chatbox.remove();
            //Remove from active List
            var rel = chatbox.attr('rel');
            const index = activeUserList.indexOf(rel);
            if (index > -1) {
                activeUserList.splice(index, 1);
            }
        }
    });
}
function removeChatbox(username) {
    var chatbox = $("#chatbox_" + username);
    if (chatbox != null) {
        chatbox.remove();
        //Remove from active List
        var rel = chatbox.attr('rel');
        const index = activeUserList.indexOf(rel);
        if (index > -1) {
            activeUserList.splice(index, 1);
        }
        rearrangeChatbox();
    }
}

/**
 * This function will re-arrange the Chatbox
 */

function rearrangeChatbox() {
    i = 10; // start position
    j = 260;  //next position
    //alert(activeUserList);
    if(!activeUserList || activeUserList.length == 0){
        return;
    }
    $.each(activeUserList, function (index, username) {
        if ($("#chatbox_" + username).length == 1) {
            if (index < 4) {
                $('[rel="' + username + '"]').css("right", i);
                $('[rel="' + username + '"]').show();
                i = i + j;
            }
            else {
                $('[rel="' + username + '"]').hide();
            }
        }
    });
}

/**
 * Check if chat-sidebar exists , Not not , append to the body
 */

if ($("#chat-sidebar").length == 0) {
    //console.log("Automatically Adding chat-sidebar");
    $("#" + currentUserListPositionID).append('Online users: <div id="chat-sidebar">');
}

//Handle Event clicking on user name on friend-list
$(document).on('click', '#sidebar-user-box', function () {
    var username = $(this).attr("class");
    var fullname = $(this).children().text();
    if ($("#chatbox_" + username).length != 0) {
        $("#chatbox_" + username).show();
        return;
    }
    renderChatbox(username, fullname);
    rearrangeChatbox();
    trigger_requestChatHistory(username); //version 2
});

$(document).on('click', '.close', function () {
    //Find and remove the box
    var chatbox = $(this).parent().parent();
    if (chatbox != null) {
        chatbox.remove();
        //Remove from active List
        var rel = chatbox.attr('rel');
        const index = activeUserList.indexOf(rel);
        if (index > -1) {
            activeUserList.splice(index, 1);
        }
    }
    //Re-arrane the chatbox
    rearrangeChatbox();
});
//This will hide chat box
$(document).on('click', '.msg_head', function () {
    var chatbox = $(this).parents().attr("rel");
    $('[rel="' + chatbox + '"] .msg_wrap').slideToggle('slow');
    return false;
});

/** 
 * Handle when a message is typed and entered 
 */

$(document).on('keypress', '.msg_footer textarea', function (e) {
    if (e.keyCode == 13) {
        var msg = $(this).val();
        var receiver = $(this).parent().parent().parent().attr("rel");
        //Clean up the box
        $(this).val('');
        
        if (msg.trim().length != 0) {
            // Display the message
            displaySelfMessage(receiver,msg)          
            //Send to Socket
            if (typeof sendPrivateChat === "undefined" ) { 
                console.log("TODO: Implement function sendPrivateChat(receiver,msg). Function name is case-sensitive.");
                chatboxAlert("Developers: Implement function sendPrivateChat(receiver,msg). Function name is case-sensitive.")
            }else{
                sendPrivateChat(receiver,msg);
            }
        }
    }
});

function chatboxAlert(msg){
    var alertmessage='<div class="alert">  <span class="closebtn" onclick="this.parentElement.style.display=\'none\';">&times;</span>'+
    msg +'</div>';
    $('body').append(alertmessage);
}
function trigger_requestChatHistory(receiver){
    if (typeof requestChatHistory === "undefined" ) { 
        console.log("TODO: Implement the function requestChatHistory(receiver). Function name is case-sensitive.");
        chatboxAlert("Developers: Implement the function requestChatHistory(receiver). Function name is case-sensitive.")
    }else{
        requestChatHistory(receiver);
    }
}