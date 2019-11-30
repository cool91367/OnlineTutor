$(function(){
    var storage = firebase.storage().ref('root/user/');
    var database = firebase.database();
    $('.uploadFile').on('change' , function(){
        var file = $(this).prop('files');
        storage.child(file[0].name).put(file[0])
        .then(function(){
            console.log("success");
        })
        .catch(function(err){
            console.log(err);
        });
    });
    // show add homework modal
    $('.addHomeworkBtn').on('click' , function(){
        $('#modalAddHomework').stop().show(100);
        var myUid = firebase.auth().currentUser.uid;
        var students = "";
        var day = "";
        database.ref('root/user/' + myUid + '/student').on('child_added' , function(data){
            students += '<option>' + data.val().Nickname + '</option>';
            $('#selectHomeworkStudent').html(students);
        });
        for(i = 1;i <= 31;i++){
            day += '<option>' + i + '</option>';
        }
        $('#selectHomeworkDeadlineDay').html(day);
    });
    $('.closeAddHomework').on('click' , function(){
        $('#modalAddHomework').stop().hide(100);
    });
    // show date
    $('#selectHomeworkDeadlineMonth').on('change' , function(){
        if($(this).val() == "1" ||$(this).val() == "3" ||$(this).val() == "5" ||$(this).val() == "7" ||
        $(this).val() == "8" ||$(this).val() == "10" ||$(this).val() == "12"){
            var day = "";
            for(i = 1;i <= 31;i++){
                day += '<option>' + i + '</option>';
            }
            $('#selectHomeworkDeadlineDay').html(day);
        }
        else if($(this).val() == "2"){
            var day = "";
            for(i = 1;i <= 28;i++){
                day += '<option>' + i + '</option>';
            }
            $('#selectHomeworkDeadlineDay').html(day);
        }
        else{
            var day = "";
            for(i = 1;i <= 30;i++){
                day += '<option>' + i + '</option>';
            }
            $('#selectHomeworkDeadlineDay').html(day);
        }
    });
    
    // add homework
    $('.addHomeworkOK').on('click' , function(){
        var file = $('#addHomeworkFile').prop('files');
        if(file[0] == undefined){
            alert('plz choose a file!')
        }
        else{
            var myUid = firebase.auth().currentUser.uid;
            storage.child(myUid).child('teacher').child(file[0].name).put(file[0])
            .then(function(){
                alert("success");
                $('#addHomeworkFile').prop('files' , null);
                $('#modalAddHomework').hide(100);
            })
            .catch(function(err){
                console.log(err);
            });
        }
    });
});