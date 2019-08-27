var config = {
  apiKey: "AIzaSyB3Zr60MkUQVj-pZw9M10Ylt53EPzuBGVs",
  authDomain: "online-tutor-a67cc.firebaseapp.com",
  databaseURL: "https://online-tutor-a67cc.firebaseio.com/",
  projectId: "online-tutor-a67cc",
  storageBucket: "online-tutor-a67cc.appspot.com",
  messagingSenderId: "544691356842"
};
firebase.initializeApp(config);
var id;
var pc;
var theirVideo;
var myVideo;
var database;
var message;
var server;
var sourceId;
var friendId;
window.onload = function()
{
  //set_screensharing();
  set_datachannel();
  pc = new webkitRTCPeerConnection(server);
  id = Math.floor(Math.random()*1000000000);
  //friendId = this.document.getElementById("friend's_id").value;
  database = firebase.database();
  myVideo = document.querySelector('#myvideoTag');
  theirVideo = document.querySelector('#theirvideoTag');
  server = {'iceServers':[{'url':'stun:stun.l.google.com:19302'}]};
  pc.onicecandidate = function(event)
  {
    if (event.candidate)
    {
      console.log("onicecandidate");
      sendMessage(id ,friendId, JSON.stringify({ 'ice': event.candidate }));
    }
  }
  pc.onaddstream = function(event)
  {
    console.log("onaddstream");
    theirVideo.srcObject = event.stream;
  }
  database.ref('users/'+id).on('child_added' , function(data)
  {
    friendId = this.document.getElementById("friend's_id").value;
    readMessage(data);
    database.ref('users/'+id).remove();
  });
  console.log("id: "+id);
}
function sendMessage(myId ,friendId , data) 
{
  message = database.ref('users/'+friendId).push({ sender: myId, message: data });
}
function readMessage(data)
{
  var msg = data.val().message;
  //if(data.val().message !="hang_up")
    msg = JSON.parse(data.val().message);
  var sender = data.val().sender;
  if(sender != id)
  {
    if(msg != "hang_up")//handle connect event
    {
      if (msg.ice != undefined)
        pc.addIceCandidate(new RTCIceCandidate(msg.ice));
      else if(msg.sdp.type == "offer")
      {
        var rtcs = new RTCSessionDescription(msg.sdp);
        pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
        .then(() => pc.createAnswer())
        .then(answer => pc.setLocalDescription(answer))
        .then(() => sendMessage(id,friendId, JSON.stringify({'sdp': pc.localDescription})));
      }
      else if (msg.sdp.type == "answer")
      {
        console.log("is answerer");
        pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      }
        
    }
    if(data.val().message =="hang_up")//handle disconnect event
    {
      theirVideo.srcObject = null;
      myVideo.srcObject = null;
      pc.close();
      pc.onicecandidate = null;
      pc.onaddstream = null;
      pc = null;
      location.reload(true);
    }
  }
}
function sendLocalDesc(desc)
{
  pc.setLocalDescription(desc, function () {
    console.log("sending local description");
    sendMessage(id,friendId, JSON.stringify({'sdp': pc.localDescription}));
  }, logError);
}

function logError(error)
{
  console.log(error.name +" : " + error.message);
}
function call()
{
  friendId = this.document.getElementById("friend's_id").value;
  if(!pc)
    pc = new webkitRTCPeerConnection(server);
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.getUserMedia({
        'audio': false,
        'video': true
      }, function (stream) {
        console.log("going to display my stream...");
        myVideo.srcObject = stream;
        pc.addStream(stream);
        pc.createOffer(sendLocalDesc, logError);
      }, logError);

}

function closeMedia()
{
  console.log("close");
  sendMessage(id ,friendId, "hang_up");
  theirVideo.srcObject = null;
  myVideo.srcObject = null;
  pc.close();
  pc.onicecandidate = null;
  pc.onaddstream = null;
  pc = null;
  location.reload(true);
}
function turnToFullscreen()
{
    if (screenfull.enabled) {
        screenfull.request(document.getElementById('theirvideoTag'));
      }
}
function getPicture()
{
    var pictureCanvas = document.querySelector("#pictureCanvas");
    var height = 0;
    var width = 240;
    var context = pictureCanvas.getContext('2d');
    
    if(width&&height)
    {
        context.drawImage(theirVideo , 0 , 0 , width , height);
    }
}
