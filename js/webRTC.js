$(function(){
    // 只能用這種選擇器   其他種都不行
    var video = document.querySelector('#myVideo');
    var otherVideo = document.querySelector('#othersVideo');
    var myStream;
    var database = firebase.database();
    var server = {'iceServers':[{'url':'stun:stun.l.google.com:19302'}]};
    var pc = new webkitRTCPeerConnection(server);
    var myUid;
    var othersUid;
    var othersNickname = $('#selectStudent').val();
    // start the class
    $('.classBtn').on('click' , function(){
        if( $('.classBtn').text() == '上課囉~' ){
            $('#breaktimeImg').prop('src' , 'src/hurryup.jpg');
            /*othersNickname = $('#selectStudent').val();
            myUid = firebase.auth().currentUser.uid;
            database.ref('root/user/' + myUid + '/student').on('child_added' , function(data){
                if(data.val().Nickname == othersNickname){
                    console.log(data.val().Nickname);
                    othersUid = data.val().StudentId;
                    startConnection();
                }
            });*/
            startConnection();
        }
        else if( $('.classBtn').text() == '下課~' ){
            database.ref(myUid + '/connection').off();
            video.srcObject = null;
            otherVideo.srcObject = null;
            otherVideo.disablePictureInPicture = true;
            $('#myVideo').hide();
            $('#breaktimeImg').prop('src' , 'src/breaktime.png');
            $('#breaktimeImg').show();
            $('.classBtn').text("上課囉~");
            myStream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
    });
    otherVideo.addEventListener('loadedmetadata', function(e) {
        console.log('loaded');
        otherVideo.disablePictureInPicture = false;
        otherVideo.requestPictureInPicture();
    });

    // connect function
    function startConnection(){
        pc = new webkitRTCPeerConnection(server);
        myUid = firebase.auth().currentUser.uid;
        othersUid = $('#selectStudent').val();
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        var constraint = {video: true , audio: false};
        pc.onicecandidate = function(evt){
            if (evt.candidate){
                sendMessage(othersUid ,myUid, JSON.stringify({ 'ice': event.candidate }));
                console.log('ice candidate');
            }
        };
        pc.onnegotiationneeded = function(){
            pc.createOffer(localDescCreated, logError);
            console.log('negotiate');
        };
        pc.ontrack = (event) => {
            // don't set srcObject again if it is already set.
            if (video.srcObject) return;
            video.srcObject = event.streams[0];
        };
        /*pc.onaddstream = function (evt) {
            console.log('addstream');
            video.srcObject = evt.stream;
            $('#breaktimeImg').hide();
            $('.myVideo').show();
        };*/
        database.ref('root/user/' + myUid + '/connection').on('child_added' , function(data)
        {
            readMessage(data);
            //database.ref('root/user/' + myUid + '/connection').remove();
        });
        navigator.mediaDevices.getUserMedia(constraint)
        .then(function(stream) {
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
            otherVideo.srcObject = stream;
            /*myStream = stream;
            otherVideo.srcObject = myStream;
            pc.addStream(stream);*/
            $('.classBtn').text('下課~');
        })
        .catch(function(err) {
            console.log(err);
            $('.myVideo').hide();
            $('#breaktimeImg').show();
        });
    }

    // send message to database's connection folder
    function sendMessage(receiver , sender , message){
        database.ref('root/user/' + receiver + '/connection').push({Sender : sender , Message: message });
    }
    // read message to accecute connection
    function readMessage(data){
        var sender = data.val().Sender;
        var message = JSON.parse(data.val().Message);
        if(sender != myUid){
            if (message.ice != undefined)
                pc.addIceCandidate(new RTCIceCandidate(message.ice));
            else if(message.sdp.type == "offer")
            {
                var rtcs = new RTCSessionDescription(message.sdp);
                pc.setRemoteDescription(new RTCSessionDescription(message.sdp))
                .then(() => pc.createAnswer())
                .then(answer => pc.setLocalDescription(answer))
                .then(() => sendMessage(othersUid,myUid, JSON.stringify({'sdp': pc.localDescription})));
            }
            else if (message.sdp.type == "answer")
            {
                console.log("is answerer");
                pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
            }
        }
    }
    // create local description
    function localDescCreated(desc) {
        pc.setLocalDescription(desc, function () {
            sendMessage(othersUid , myUid , JSON.stringify({ "sdp": pc.localDescription }));  
        }, logError);
    }

    // error function
    function logError(err){
        console.log(err);
    }
});