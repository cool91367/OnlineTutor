$(function(){
    var database = firebase.database();
    var account;
    var img;
    var myUid;
    firebase.auth().onAuthStateChanged(function(user) { 
        if(user){
            database.ref('root/user/' + user.uid + '/information').once('value' , function(data){
                $('#educate').prop('placeholder' , data.val().Educate);
                $('#introduction').prop('placeholder' , data.val().Introduction);
                $('#nickname').prop('placeholder' , data.val().Nickname);
                $('#image').prop('src' , data.val().Image);
                account = data.val().Account;
                img = data.val().Image;
                console.log(data.val().Educate);
            });
            myUid = user.uid;
        }
        else{
            alert('not login');
        }
    });
    // preview image
    $('#picture').on('change' , function(){
        var file    = document.querySelector('#picture').files[0];
        var reader  = new FileReader();

        reader.addEventListener("load", function () {
            $('#image').prop('src' , reader.result);
            console.log(reader.result);
            img = reader.result;
        }, false);

        if (file) {
            reader.readAsDataURL(file);
        }
    });
    // send the modify to database
    $('#submit').on('click' , function(){
        if(img){
            database.ref('root/user/' + myUid + '/information')
            .set({
                Account: account,
                Educate: $('#educate').val(),
                Introduction: $('#introduction').val(),
                Nickname: $('#nickname').val(),
                Image: img
            });
        }
        else{
            database.ref('root/user/' + myUid + '/information')
            .set({
                Account: account,
                Educate: $('#educate').val(),
                Introduction: $('#introduction').val(),
                Nickname: $('#nickname').val(),
                Image: ""
            });
        }
        window.location = 'index.html';
    });
});