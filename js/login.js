// jquerry start function
$(function(){
    var database = firebase.database();
    // 申請帳號
    $('#signupBtn').on('click' , function(){
        var account = $('#InputAccount').val();
        var password = $('#InputPassword').val();
        firebase.auth().createUserWithEmailAndPassword(account,password)
        .then(function(user){
            database.ref('root/user/' + user.uid + '/information')
            .set({'Account': account , 'Nickname' : account , 'Stiker': null , 'Introduction':"" ,'Educate':''});
            alert("帳號申請成功!");
            firebase.auth().signOut();
            $('#InputAccount').val("");
            $('#InputPassword').val("");
            $('.login').modal('toggle');
        })
        .catch(function(error) { 
            // Handle Errors here. 
            var errorMessage = error.message; 
            alert(errorMessage);
            $('#InputAccount').val("");
            $('#InputPassword').val("");
        });
    });

    // 登入
    $('#loginBtn').on('click' , function(){
        var account = $('#InputAccount').val();
        var password = $('#InputPassword').val();
        firebase.auth().signInWithEmailAndPassword(account, password)
        .then(function(){
            alert("登入成功!");
            $('#InputAccount').val("");
            $('#InputPassword').val("");
            $('.login').modal('toggle');
        })
        .catch(function(error) { // Handle Errors here. 
            $('#InputAccount').val("");
            $('#InputPassword').val("");
            alert(error.message);
        });
    });

    // google 登入
    $('#googleLoginImg').on('click' , function(){
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
        .then(function(result){ // This gives you a Google Access Token. You can use it to access the Google API. 
            console.log(result)
            var token = result.credential.accessToken; // The signed-in user info. 
            var user = result.user;
            database.ref(user.uid + '/information').set({Account: account , Nickname : account , Stiker: null , Introduction:"" ,Educate:''});          
        })
        .catch(function(error) { // Handle Errors here. 
            var errorCode = error.code; 
            var errorMessage = error.message; // The email of the user's account used. 
            var email = error.email; // The firebase.auth.AuthCredential type that was used. 
            var credential = error.credential; 
            console.log(errorMessage);
        });
    });

    // 聽取登入狀態
    firebase.auth().onAuthStateChanged(function(user) { 
        if (user) { // User signed in. 
            var displayName = user.displayName;
            if(displayName){
                $('#onLoginStateChange').html(displayName)
            }
            else{
                $('#onLoginStateChange').html(user.email);
            }
            $('#logoutBtn').html('<button class="btn btn-danger">logout</button>');
            // add classroom's selection of students
            addStudentSelection(user.uid);
            // load chat student's chat message information
            var contactPersonHtml = $('#contactPerson').html();
            loadStudentChat(contactPersonHtml , user.uid);
            loadTeacherChat(contactPersonHtml , user.uid);
            console.log('here');
            // 聽取全部的message
            database.ref('root/user/' + user.uid + '/message/student').on('child_added' , function(data){
                //console.log(data.key);// 可以知道是哪一個人有新的訊息
                database.ref('root/user/' + user.uid + '/message/student/' + data.key).on('child_added' , function(data){
                    //console.log(data.val().Message);
                });
            });
            database.ref('root/user/' + user.uid + '/message/teacher').on('child_added' , function(data){
                //console.log(data.key);// 可以知道是哪一個人有新的訊息
                database.ref('root/user/' + user.uid + '/message/teacher/' + data.key).on('child_added' , function(data){
                    //console.log(data.val().Message);
                });
            });
        } 
        else { // No user is signed in. 
            $('#logoutBtn').html('');
            $('#onLoginStateChange').html('<button class="btn btn-primary" data-toggle="modal" data-target=".login">login</button>');
            $('#selectStudent').html('');
        } 
    });

    // 登出功能
    $('#logoutBtn').on('click' , function(){
        firebase.auth().signOut();
        var sideslider = $('[data-toggle=collapse-side]');
        var get_sidebar = sideslider.attr('data-target-sidebar');
        $(get_sidebar).toggleClass('in');
        window.location = 'index.html';
    });

    // add classroom's selection of students' function
    function addStudentSelection(myUid){
        var students;
        var teachers;
        database.ref('root/user/' + myUid + '/student').on('child_added' , function(data){
            students += '<option>' + data.val().Nickname + '</option>';
            $('#selectStudent').html(students);
        });
        database.ref('root/user/' + myUid + '/teacher').on('child_added' , function(data){
            teachers += '<option>' + data.val().Nickname + '</option>';
            $('#selectStudent').html(teachers);
        });
    }

    // load students chat message's function
    function loadStudentChat(html , myUid){
        database.ref('root/user/' + myUid + '/student').on('child_added' , function(data){
            var nickname = data.val().Nickname;
            var studentId = data.val().StudentId;
            html += '<div class="friendChat">'
                        +'<div class="chatStickerArea">'
                            +'<img width="100%" height="100%" src="src/luffy.jpg" style="border-radius: 50%;">'
                        +'</div>'
                        +'<div class="chatName">' + nickname + '</div>'
                        +'<div class= "chatStudentId">' + studentId + '</div>'
                        +'<div class="chatPartialContent">partial content ~~~~~~~~~~~~~~</div>'
                    +'</div>';
            $('#contactPerson').html(html);
        });
    }
    // load teacher's chat message's function
    function loadTeacherChat(html , myUid){
        database.ref('root/user/' + myUid + '/teacher').on('child_added' , function(data){
            var nickname = data.val().Nickname;
            var teacherId = data.val().TeacherId;
            html += '<div class="friendChat">'
                        +'<div class="chatStickerArea">'
                            +'<img width="100%" height="100%" src="src/luffy.jpg" style="border-radius: 50%;">'
                        +'</div>'
                        +'<div class="chatName">' + nickname + '(teacher)</div>'
                        +'<div class= "chatTeacherId">' + teacherId + '</div>'
                        +'<div class="chatPartialContent">partial content ~~~~~~~~~~~~~~</div>'
                    +'</div>';
            $('#contactPerson').html(html);
        });
    }
});
