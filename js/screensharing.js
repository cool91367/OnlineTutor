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
  window.onload = function()
  {
    pc = new webkitRTCPeerConnection(server);
    id = Math.floor(Math.random()*1000000000);
    database = firebase.database();
    myVideo = document.querySelector('#myvideoTag');
    theirVideo = document.querySelector('#theirvideoTag');
    server = {'iceServers':[{'url':'stun:stun.l.google.com:19302'}]};
    pc.onicecandidate = function(event)
    {
      if (event.candidate)
      {
        console.log("onicecandidate");
        sendMessage(id , JSON.stringify({ 'ice': event.candidate }));
      }
    }
    pc.onaddstream = function(event)
    {
      console.log("onaddstream");
      theirVideo.srcObject = event.stream;
    }
    database.ref('users/').on('child_added' , function(data)
    {
      readMessage(data);
      database.ref('users/').remove();
    });
  }
  function sendMessage(senderId, data) 
  {
    message = database.ref('users/').push({ sender: senderId, message: data });
  }
  function readMessage(data)
  {
    var msg = data.val().message;
    if(data.val().message !="hang_up")
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
          .then(() => sendMessage(id, JSON.stringify({'sdp': pc.localDescription})));
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
      sendMessage(id, JSON.stringify({'sdp': pc.localDescription}));
    }, logError);
  }
  
  function logError(error)
  {
    console.log(error.name +" : " + error.message);
  }
  function screensharing()
  {
    var stream;
    if(!pc)
      pc = new webkitRTCPeerConnection(server);
      //navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      navigator.mediaDevices.getDisplayMedia({
          video:{mediaSource:'screen'}
          //audio : true,{mediaSource:'screen'}
          //'video': true
        }).then(function (stream) {
          console.log("going to display my stream...");
          myVideo.srcObject = stream;
          pc.addStream(stream);
          pc.createOffer(sendLocalDesc, logError);
        }, logError);
  
  }
  
  function closeMedia()
  {
    console.log("close");
    sendMessage(id , "hang_up");
    theirVideo.srcObject = null;
    myVideo.srcObject = null;
    pc.close();
    pc.onicecandidate = null;
    pc.onaddstream = null;
    pc = null;
    location.reload(true);
  }
  