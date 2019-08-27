var chat_server;
var myId = Math.floor(Math.random()*1000000000);
var connection;
var c_database;
var sendchannel;
var recievechannel;
var recieveFileName;
var recieveFileSize;
var sendFile;
var fileProgress; 
var fileBuffer ;
var fileSize ;
var file_database;
function set_datachannel()
{ 
    fileProgress = document.getElementById("fileProgress");
    sendFile = document.getElementById("sendFile");   
    fileBuffer = [];
    fileSize = 0;
    data_server = {'iceServers':[{'url':'stun:stun.l.google.com:19302'}]};
    connection = new webkitRTCPeerConnection(data_server);
    myId = Math.floor(Math.random()*1000000000);
    c_database = firebase.database().ref('dataroom/');
    file_database = firebase.database().ref('fileroom/');
    c_database.on('child_added' , function(data)
    {
        read_dataroom_message(data);
        c_database.remove();
    });
    file_database.on('child_added',function(data)
    {
        if(data.val().id != myId)
        {
            recieveFileName = data.val().fileName;
            recieveFileSize = data.val().fileSize;
            console.log("recieveFileSize = "+recieveFileSize);
            file_database.remove();
            console.log("recieve fileName = "+recieveFileName+" fileSize = "+recieveFileSize);
        }
    });
    sendFile.addEventListener("change" , function(event){
        var file = sendFile.files[0];
        console.log("sending files");
        file_database.push({id:myId , fileName : file.name , fileSize : file.size});
        fileProgress.max = file.size;
    } , false);




    connection.ondatachannel = function(event){
        recievechannel = event.channel;
        recievechannel.onopen = ev => console.log('recieve channel');
        recievechannel.onmessage = handleMessage;
    }
    connection.onicecandidate = function(event){
        send_dataroom_message(myId , JSON.stringify({'ice':event.candidate}));//等待setLocalDescription
        console.log("added");
    };
}
//handle recieved data
function send_file()
{
    var file = sendFile.files[0];
    var chunkSize = 16384;
    var sliceFile = function(offset){
        var reader = new window.FileReader();
        reader.onload = (function(){
            return function(event){
                sendchannel.send(event.target.result);
                if(file.size > offset+event.target.result.byteLength)
                {
                    window.setTimeout(sliceFile , 0 , offset+chunkSize);
                }
                fileProgress.value = offset+event.target.result.byteLength;
            };
        })(file);
        var slice = file.slice(offset , offset+chunkSize);
        reader.readAsArrayBuffer(slice);
    };
    sliceFile(0);
}
function handleMessage(event)
{
    fileBuffer.push(event.data);
    fileSize += event.data.byteLength;
    fileProgress.value = fileSize;
    console.log(fileSize+"  "+recieveFileSize);

    if(fileSize === recieveFileSize)
    {
        var recieve = new window.Blob(fileBuffer);
        fileBuffer = [];
        console.log("completed");
        var downloadLink = document.getElementById("receivedFileLink");
        downloadLink.href = URL.createObjectURL(recieve);
        downloadLink.download = recieveFileName;
        downloadLink.appendChild(document.createTextNode(recieveFileName+"("+fileSize+")bytes"));
    }
}
function sendchannelMessage()
{
    sendchannel.send("abc");
}
function send_dataroom_message(myId , msg)
{
    c_database.push({sender : myId , message : msg});
}
function read_dataroom_message(data)
{
    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    if(sender != myId)
    {
        if(msg.ice != undefined)
            connection.addIceCandidate(new RTCIceCandidate(msg.ice));
        else if(msg.sdp.type == "offer")
        {
            var rtcs = new RTCSessionDescription(msg.sdp);
            connection.setRemoteDescription(rtcs)
            .then(()=>connection.createAnswer())
            .then(answer=>connection.setLocalDescription(answer))
            .then(()=>send_dataroom_message(myId , JSON.stringify({'sdp':connection.localDescription})));
        }
        else if(msg.sdp.type == "answer")
        {
            connection.setRemoteDescription(msg.sdp);
        }
    }
}
function sendLocalDc(dc)
{
    connection.setLocalDescription(dc, function () {
        console.log("sending local description");
        send_dataroom_message(myId, JSON.stringify({'sdp':connection.localDescription}));
      }, logError);
}
function open_dataroom()
{
    if(!sendchannel)
    {
        sendchannel = connection.createDataChannel('chat');
        sendchannel.onopen = ()=>console.log("open channel");
        
    }  
    connection.createOffer(sendLocalDc , logError);
}