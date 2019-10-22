// jquerry start function
$(function(){
    // 申請帳號
    $('#signupBtn').on('click' , function(){
        var account = $('#InputAccount').val();
        var password = $('#InputPassword').val();
        firebase.auth().createUserWithEmailAndPassword(account,password)
        .then(function(){
            alert("帳號申請成功!");
            firebase.auth().signOut();
            $('#InputAccount').val("");
            $('#InputPassword').val("");
            $('.login').modal('toggle');
        })
        .catch(function(error) { 
            // Handle Errors here. 
            var errorCode = error.code; 
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
            var errorCode = error.code; 
            var errorMessage = error.message; 
            $('#InputAccount').val("");
            $('#InputPassword').val("");
        });
    });

    // google 登入
    $('#googleLoginImg').on('click' , function(){
        console.log('click');
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
        .then(function(result){ // This gives you a Google Access Token. You can use it to access the Google API. 
            console.log(result)
            var token = result.credential.accessToken; // The signed-in user info. 
            var user = result.user;  
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
        if (user) { // User is signed in. 
            var displayName = user.displayName;
            if(displayName){
                $('#onLoginStateChange').html(displayName)
            }
            else{
                $('#onLoginStateChange').html(user.email);
            }
            $('#logoutBtn').html('<button class="btn btn-danger">logout</button>');
        } 
        else { // No user is signed in. 
            $('#logoutBtn').html('');
            $('#onLoginStateChange').html('<button class="btn btn-primary" data-toggle="modal" data-target=".login">login</button>');
        } 
    });

    // 登出功能
    $('#logoutBtn').on('click' , function(){
        firebase.auth().signOut();
        var sideslider = $('[data-toggle=collapse-side]');
        var get_sidebar = sideslider.attr('data-target-sidebar');
        $(get_sidebar).toggleClass('in');
    });
});
