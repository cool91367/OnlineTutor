$(function(){
    var database = firebase.database();
    var othersUid = null;
    var sendToTeacher = 0;
    var myNickname;
    // get my nickname
    firebase.auth().onAuthStateChanged(function(user) { 
        if(user){
            database.ref('root/user/' + user.uid + '/information').once('value' , function(data){
                myNickname = data.val().Nickname;
                database.ref('root/user/' + user.uid + '/message/student/').on('child_changed' , function(data){
                    console.log("changed!!!");
                });
            });
        }
    });
    $('#contactPerson').on('click' , ".friendChat" , function(){
        othersUid = $(this).children('.chatStudentId').text();
        sendToTeacher = 0;
        if(othersUid == ''){// 代表要傳給的人是老師
            sendToTeacher = 1;
            othersUid = $(this).children('.chatTeacherId').text();
        }
        if(sendToTeacher){
            // 先清空內容
            $('#chatContent').html('');
            html ='';
            loadMessageFromTeacher();
        }
        else{
            // 先清空內容
            $('#chatContent').html('');
            html ='';
            loadMessageFromStudent();
        }
    });
    $('#textArea').on('keypress' , function(eve){
        if(eve.which == 13){
            if (event.shiftKey){
                $(this)[0].value += '\n';
                return false;
            }
            else if($(this).val() == "")
            {
                return false;
            }
            else{
                if(sendToTeacher)
                    sendChatMessageToTeacher(othersUid , $(this).val());
                else
                    sendChatMessageToStudent(othersUid , $(this).val());
                $(this).val("");
                return false;//回到開頭
            }
        }
    })

    // function load message
    function loadMessageFromTeacher(){
        var myUid = firebase.auth().currentUser.uid;
        database.ref('root/user/' + myUid + '/message/student/' + othersUid).off();
        database.ref('root/user/' + myUid + '/message/teacher/' + othersUid).on('child_added' , function(data){
            var sender = data.val().Sender;
            var message = data.val().Message;
            var read = data.val().read;
            var pLength = 8 + 2 * message.length;
            if(pLength >= 80)
                pLength = 80;
            var key = data.key;
            if(sender == myNickname && read){
                var html = '<div class="chatMyMessage" >'
                                +'<div class="myChatContentStickerArea">'
                                    +'<img width="100%" height="100%" src="src/luffy.jpg" style="border-radius: 50%;">'
                                +'</div>'
                                +'<div id="myChatMessage">'
                                    +'<p align="right" class="myChatContentParagraph" style="width:' + pLength + '%;">' + message + '</p>'
                                    +'<p align="right" style="width:15%;color:gray;text-align:center;position:absolute;right:'+ pLength +'%;">readed</p>'
                                +'</div>'
                            +'</div>';
                $('#chatContent').append(html);
                $('.chatMyMessage').last().css("height" , $(".myChatContentParagraph").last().height() + 10);
            }
            else if(sender == myNickname){
                var html = '<div class="chatMyMessage" >'
                                +'<div class="myChatContentStickerArea">'
                                    +'<img width="100%" height="100%" src="src/luffy.jpg" style="border-radius: 50%;">'
                                +'</div>'
                                +'<div id="myChatMessage">'
                                    +'<p align="right" class="myChatContentParagraph" style="width:' + pLength + '%;">' + message + '</p>'
                                +'</div>'
                            +'</div>';
                $('#chatContent').append(html);
                $('.chatMyMessage').last().css("height" , $(".myChatContentParagraph").last().height() + 10);
            }
            else{
                var html = '<div class="chatOthersMessage" >'
                                +'<div class="othersChatContentStickerArea">'
                                    +'<img width="100%" height="100%" src="src/luffy.jpg" style="border-radius: 50%;">'
                                +'</div>'
                                +'<p class="othersMessage" style="width:' + pLength + '%;">' + message + '</p>'
                            +'</div>';
                $('#chatContent').append(html);
                $('.chatOthersMessage').last().css("height" , $(".othersMessage").last().height() + 10);
            }
            database.ref('root/user/' + othersUid + '/message/student/' + myUid).on("child_added" , function(data){
                console.log(data.key);
                console.log(data.val().Message);
                var message = data.val().Message;
                var sender = data.val().Sender;
                database.ref('root/user/' + othersUid + '/message/student/' + myUid + '/' + data.key).set({Sender: sender , Message: message , read:1});
            });
            database.ref('root/user/' + othersUid + '/message/student/' + myUid).off();
        });
    }
    function loadMessageFromStudent(){
        var myUid = firebase.auth().currentUser.uid;
        database.ref('root/user/' + myUid + '/message/student/' + othersUid).off();
        database.ref('root/user/' + myUid + '/message/student/' + othersUid).on('child_added' , function(data){
            console.log('changed!');
            var sender = data.val().Sender;
            var message = data.val().Message;
            var read = data.val().read;
            var pLength = 8 + 2 * message.length;
            if(pLength >= 80)
                pLength = 80;
            var key = data.key;
            if(sender == myNickname && read){
                var html = '<div class="chatMyMessage" >'
                                +'<div class="myChatContentStickerArea">'
                                    +'<img width="100%" height="100%" src="src/luffy.jpg" style="border-radius: 50%;">'
                                +'</div>'
                                +'<div id="myChatMessage">'
                                    +'<p align="right" class="myChatContentParagraph" style="width:' + pLength + '%;">' + message + '</p>'
                                    +'<p align="right" style="width:15%;color:gray;text-align:center;position:absolute;right:'+ pLength +'%;">readed</p>'
                                +'</div>'
                            +'</div>';
                $('#chatContent').append(html);
                $('.chatMyMessage').last().css("height" , $(".myChatContentParagraph").last().height() + 10);
            }
            else if(sender == myNickname){
                var html = '<div class="chatMyMessage" >'
                                +'<div class="myChatContentStickerArea">'
                                    +'<img width="100%" height="100%" src="src/luffy.jpg" style="border-radius: 50%;">'
                                +'</div>'
                                +'<div id="myChatMessage">'
                                    +'<p align="right" class="myChatContentParagraph" style="width:' + pLength + '%;">' + message + '</p>'
                                +'</div>'
                            +'</div>';
                $('#chatContent').append(html);
                $('.chatMyMessage').last().css("height" , $(".myChatContentParagraph").last().height() + 10);
            }
            else{
                var html = '<div class="chatOthersMessage" >'
                                +'<div class="othersChatContentStickerArea">'
                                    +'<img width="100%" height="100%" src="src/luffy.jpg" style="border-radius: 50%;">'
                                +'</div>'
                                +'<p class="othersMessage" style="width:' + pLength + '%;">' + message + '</p>'
                            +'</div>';
                $('#chatContent').append(html);
                $('.chatOthersMessage').last().css("height" , $(".othersMessage").last().height() + 10);
            }
            database.ref('root/user/' + othersUid + '/message/teacher/' + myUid).on("child_added" , function(data){
                data.val().read = 1;
                console.log(data.key);
                console.log(data.val().Message);
                var message = data.val().Message;
                var sender = data.val().Sender;
                database.ref('root/user/' + othersUid + '/message/teacher/' + myUid + '/' + data.key).set({Sender: sender , Message: message , read:1});
            });
        });
    }
    // function send chat message to student
    function sendChatMessageToStudent(othersUid , message){
        var myUid = firebase.auth().currentUser.uid;
        var myChatDb = database.ref('root/user/' + myUid + '/message/student/' + othersUid);
        var othersChatDb = database.ref('root/user/' + othersUid + '/message/teacher/' + myUid);
        myChatDb.push({Sender: myNickname , Message: message , read: 0});
        othersChatDb.push({Sender: myNickname , Message: message , read: 0});
    }
    // function send chat message to teacher
    function sendChatMessageToTeacher(othersUid , message){
        var myUid = firebase.auth().currentUser.uid;
        var myChatDb = database.ref('root/user/' + myUid + '/message/teacher/' + othersUid);
        var othersChatDb = database.ref('root/user/' + othersUid + '/message/student/' + myUid);
        myChatDb.push({Sender: myNickname , Message: message , read: 0});
        othersChatDb.push({Sender: myNickname , Message: message , read: 0});
    }
});