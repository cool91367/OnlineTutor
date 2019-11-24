$(function(){
    var database = firebase.database();
    var myNickname;
    var month = new Array(12);
        month[0] = "一月";
        month[1] = "二月";
        month[2] = "三月";
        month[3] = "四月";
        month[4] = "五月";
        month[5] = "六月";
        month[6] = "七月";
        month[7] = "八月";
        month[8] = "九月";
        month[9] = "十月";
        month[10] = "十一月";
        month[11] = "十二月";
    var now = new Date();
    console.log(now.getMilliseconds());
    firebase.auth().onAuthStateChanged(function(user) { 
        if(user){
            database.ref('root/user/' + user.uid + '/information').once('value' , function(data){
                myNickname = data.val().Nickname;
                console.log(myNickname)
            });
        }
    });
    $('.addMessageBtn').on('click' , function(){
        $('#modalMessage').stop().show(100);
    });
    $('.closePostMessage').on('click' , function(){
        $('#modalMessage').stop().hide(100);
    });
    // can only choose one
    $('.postCheckBox').on('click' , function(){
        $('.postCheckBox').prop('checked' , false);
        $(this).prop('checked' , true);
        console.log($(this).prop('checked'));
    });
    $('div.messageContentInput').css('height' , $('div.modal-body.messageBody').height() / 1.5);
    // send post
    $('.submitPost').on('click' , function(){
        var myUid = firebase.auth().currentUser.uid;
        var title = $('input#title.form-control').val();
        var content = $('textarea.form-control').val();
        var private = $('.postCheckBox').eq(0).prop('checked');
        var public = $('.postCheckBox').eq(1).prop('checked');
        if(title && content && (public || private)){
            if(public){
                var dbRef = database.ref('root/post/public/');
                dbRef.push({AuthorId: myUid, 
                            AuthorNickname: myNickname,
                            Title: title,
                            Content: content,
                            Year: now.getFullYear(),
                            Month: now.getMonth(),
                            Date: now.getDate(),
                            Hour: now.getHours(),
                            Minute:now.getMinutes(),
                            Second:now.getMilliseconds()
                            });
            }
            else if(private){
                var dbRef = database.ref('root/post/private/' + myUid);
                dbRef.push({AuthorId: myUid, 
                            AuthorNickname: myNickname,
                            Title: title,
                            Content: content,
                            Year: now.getFullYear(),
                            Month: now.getMonth(),
                            Date: now.getDate(),
                            Hour: now.getHours(),
                            Minute:now.getMinutes(),
                            Second:now.getMilliseconds()
                            });
            }
            alert('success');
            $('input#title.form-control').val('');
            $('textarea.form-control').val('');
            $('#modalMessage').hide();
        }
        else
            alert("not yet!");
    });
    // on post folder
    database.ref('root/post/public').on('child_added' , function(data){
        var title = data.val().Title;
        var content = data.val().Content;
        var nickname = data.val().AuthorNickname;
        var authorId = data.val().AuthorId;
        var hour = data.val().Hour;
        var min = data.val().Minute;
        var key = data.key;
        addMessage(title , content , nickname , min , hour , key);
        var random;
        var cardLocation;// height
        var paddingLeft = 10;
        var padding = $('.card').width()+20;
        var lastSecond = $('.schadualContainer').last().index() - 2;
        if($('.schadualContainer').eq(lastSecond).offset().left == 0 ||$('.schadualContainer').eq(lastSecond).offset().left == 10){
            for(var i = $('.schadualContainer').last().index()-1; i >= 0; i--){
                random = Math.floor(Math.random()*1000);
                cardLocation = random % ($('.schadualBar').height()-100);
                if(cardLocation < $('.myNavbar').height() + 10){
                    cardLocation = $('.myNavbar').height()+10;
                }
                $('.schadualContainer').eq(i).css("left" , paddingLeft);
                $('.schadualContainer').eq(i).css("top" , cardLocation);
                paddingLeft = paddingLeft + padding;
            }
        }
        else{
            random = Math.floor(Math.random()*1000);
            cardLocation = random % ($('.schadualBar').height()-100);
            if(cardLocation < $('.myNavbar').height() + 10){
                cardLocation = $('.myNavbar').height()+10;
            }
            $('.schadualContainer').last().css("top" , cardLocation);
            $('.schadualContainer').last().css("left" , $('.schadualContainer').eq(lastSecond).offset().left - padding);
        }
    });

    function addMessage(title , content , nickname , min , hour , key){
        var html = '<div class="schadualContainer">'
                        +'<div class="postKey" style="display:none;">'+key+'</div>'
                        +'<div class="postName" style="display:inline;">' + nickname + '</div>'
                        +'<div class="card">'
                            +'<div class="card-header">'
                                +'<div class="postTitle">'+title+'</div>'
                            +'</div>'
                            +'<div class="card-body postContent" style="display: none;">'
                                +'<p>'+content+'</p>'
                            +'</div>'
                            +'<div class="card-body postFooter" style="display: none;padding: 0px;">'
                                +'<div class="footBorder">'
                                    +'<div class="leavemessageBtn">留言</div>'
                                    +'<div class="press">按讚</div>'
                                +'</div>'
                            +'</div>'
                            +'<div class="card-body postMessage">'
                                +'<div class="content">'
                                    +'我是內容'
                                +'</div>'
                                +'<div class="leavemessageImg">我是大頭照</div>'
                                +'<div class="leavemessageInput">'
                                    +'<input type="text" class="form-control" placeholder="留言...">'
                                +'</div>'
                            +'</div>'
                        +'</div>'
                        +'<div class="postTime" style="position: absolute;left:0;">' + hour + ':' + min + '</div>'
                    +'</div>';
        $('.schadualBar').append(html);   
    }
});