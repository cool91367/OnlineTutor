var chatroom;
var content;
var conversation;
function set_chatroom()
{
    console.log("123123");
    chatroom = firebase.database().ref('chatroom/');
    chatroom.on('child_added' , function(data)
    {
        message_handling(data);
    });
}
function send_message()
{
    console.log(id);
    content = document.getElementById('word');
    chatroom.push({name:id,message:content.value});
    content.value = "";
}
function message_handling(data)
{
    conversation = document.getElementById('conversation');
    if(data.val().name == id)
    {
        conversation.innerHTML += "<p align='right'>"+"我說:"+data.val().message;
    }
    else
    {
        conversation.innerHTML += "<p>"+data.val().message;
    }
}
function sendMessageByEnter(event)
{
    if(event.keyCode == 13)
        send_message();
}