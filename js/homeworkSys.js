$(function(){
    var storage = firebase.storage().ref('root/user/');
    var database = firebase.database();
    var myUid;
    // show files
    firebase.auth().onAuthStateChanged(function(user) { 
        if (user) { // User signed in. 
            showTeacherHomework(user.uid);
            showStudentHomework(user.uid);
            myUid = user.uid;
        }
    });

    $('.student').on('change' , '.uploadFileBtn' , function(){
        /*console.log($(this).prop('name'));
        console.log($(this).siblings('#teacherKey').text());*/
        var file = $(this).prop('files');
        var teacherKey = $(this).siblings('#teacherKey').text();
        var filekey = $(this).prop('name');
        var studentUpdates = {};
        var teacherUpdates = {};
        var fileDownload = $(this).parents('.file');
        // upload
        storage.child(myUid).child('student').child(teacherKey).child(file[0].name).put(file[0])
        .then(function(){
            studentUpdates['/upload'] = file[0].name;
            firebase.database().ref('root/user/' + myUid + '/homework/student/' + teacherKey + '/' + filekey).update(studentUpdates);
            //console.log(s.html());
            storage.child(myUid).child('student').child(teacherKey).child(file[0].name).getDownloadURL()
            .then(function(url){
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function(event) {
                    var blob = xhr.response;
                    var href = window.URL.createObjectURL(blob);
                    fileDownload.html('<a href="' + href + '" download="' + file[0].name+  '">' + file[0].name + '</a>');
                };
                xhr.open('GET', url);
                xhr.send();
            });
        });
        storage.child(teacherKey).child('teacher').child(myUid).child(file[0].name).put(file[0])
        .then(function(){
            teacherUpdates['/download'] = file[0].name;
            firebase.database().ref('root/user/' + teacherKey + '/homework/teacher/' + myUid + '/' + filekey).update(teacherUpdates);
        });
        /*storage.child(myUid).child('student').child(teacherKey).child(file[0].name).getDownloadURL()
        .then(function(url){
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function(event) {
                var blob = xhr.response;
                var href = window.URL.createObjectURL(blob);
                console.log(href);
                $(this).parents('.file').html('<a href="' + href + '" download="' + file[0].name+  '">' + file[0].name + '</a>');
            };
            xhr.open('GET', url);
            xhr.send();
        });*/
        //$(this).parents('.file').html('<div>' + file[0].name + '</div>');
    });

    // show add homework modal
    $('.addHomeworkBtn').on('click' , function(){
        var myUid = firebase.auth().currentUser.uid;
        var students = "";
        var day = "";
        /*storage.child(myUid).child('teacher').child('105062336.py').getMetadata()
            .then(function(meta){
                console.log(meta.customMetadata.deadlineYear);
                console.log(meta.customMetadata.deadlineMonth);
                console.log(meta.customMetadata.deadlineDate);
            });*/
        $('#modalAddHomework').stop().show(100);
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
            addHomework(file);
        }
    });
    // show files
    function showStudentHomework(myUid){
        var preNickname = "";
        var teacherCnt = 0;
        database.ref('root/user/' + myUid + '/homework/student/').once('value' , function(data){
            data.forEach(function(teacherId){
                database.ref('root/user/' + myUid + '/homework/student/' + teacherId.key).once('value' , function(data){
                    data.forEach(function(fileInfo){
                        var teacherNickname;
                        var fileCnt = 1;
                        var hwName = fileInfo.val().homeworkName;
                        var hwDeadlineYear = fileInfo.val().deadlineYear;
                        var hwDeadlineMonth = fileInfo.val().deadlineMonth;
                        var hwDeadlineDate = fileInfo.val().deadlineDate;
                        /*console.log(teacherId.key);
                        console.log(myUid);*/
                        // get teacher nickName
                        database.ref('root/user/' + teacherId.key + '/information').once('value' , function(info){
                            teacherNickname = info.val().Nickname;
                        });
                        if(teacherNickname != preNickname){
                            preNickname = teacherNickname;
                            teacherCnt = teacherCnt + 1;
                            var html = '<div class="row myHomework' + teacherCnt + '" style="margin-top:2%;">'
                                            + '<div class="col-2 teacherName">' + teacherNickname + '</div>'
                                            + '<div class="col-2 homeworkName"></div>'
                                            + '<div class="col-2 homeworkFile"></div>'
                                            + '<div class="col-2 homeworkDeadline"></div>'
                                            + '<div class="col-4 homeworkUpload"></div>'
                                        + '</div>';
                            $('.homeworkSys').children('.container').children('.student').append(html);
                        }
                        // create download link and show infomation(如果無法同步的話就改用存在metadata的方式)
                        storage.child(myUid).child('student').child(teacherId.key).child(fileInfo.val().download).getDownloadURL()
                        .then(function(url){
                            var xhr = new XMLHttpRequest();
                            xhr.responseType = 'blob';
                            xhr.onload = function(event) {
                                var blob = xhr.response;
                                var href = window.URL.createObjectURL(blob);
                                $('.myHomework' + teacherCnt).children('.homeworkFile').append('<a href="' + href + '" download="' + fileInfo.val().download +  '">' + fileInfo.val().download + '</a><br><br>')
                                // show homework name
                                $('.myHomework' + teacherCnt).children('.homeworkName').append('<div>' + hwName + '</div><br>');
                                // add file key
                                if(fileInfo.val().upload != ""){
                                    storage.child(myUid).child('student').child(teacherId.key).child(fileInfo.val().upload).getDownloadURL()
                                    .then(function(url){
                                        var xhr2 = new XMLHttpRequest();
                                        xhr2.responseType = 'blob';
                                        xhr2.onload = function(event) {
                                            var blob = xhr.response;
                                            var href = window.URL.createObjectURL(blob);
                                            $('.myHomework' + teacherCnt).children('.homeworkUpload').append('<a href="' + href + '" download="' + fileInfo.val().upload +  '">' + fileInfo.val().upload + '</a><br><br>');
                                        }
                                        xhr2.open('GET', url);
                                        xhr2.send();
                                    });
                                }
                                else
                                    $('.myHomework' + teacherCnt).children('.homeworkUpload').append('<div class="file"><input class="uploadFileBtn" type="file" name="' + fileInfo.key + '"><div id="teacherKey" style="display:none">'+teacherId.key+'</div></div><br>');                                                            
                                // show homework deadline
                                if(deadline(hwDeadlineYear , hwDeadlineMonth , hwDeadlineDate))
                                    $('.myHomework' + teacherCnt).children('.homeworkDeadline').append('<div>' + hwDeadlineYear + '/' + hwDeadlineMonth + '/' + hwDeadlineDate + '</div><br>');
                                else
                                    $('.myHomework' + teacherCnt).children('.homeworkDeadline').append('<div style="color:red;">' + hwDeadlineYear + '/' + hwDeadlineMonth + '/' + hwDeadlineDate + '</div><br>');
                            };
                            xhr.open('GET', url);
                            xhr.send();
                        });
                    });
                })
            }); 
        });
    }
    function showTeacherHomework(myUid){
        var preNickname = "";
        var studentCnt = 0;
        database.ref('root/user/' + myUid + '/homework/teacher/').once('value' , function(data){
            data.forEach(function(studentId){
                database.ref('root/user/' + myUid + '/homework/teacher/' + studentId.key).once('value' , function(data){
                    data.forEach(function(fileInfo){
                        var studentNickname;
                        var hwName = fileInfo.val().homeworkName;
                        var hwDeadlineYear = fileInfo.val().deadlineYear;
                        var hwDeadlineMonth = fileInfo.val().deadlineMonth;
                        var hwDeadlineDate = fileInfo.val().deadlineDate;
                        /*console.log(studentId.key);
                        console.log(myUid);*/
                        // get student nickName
                        database.ref('root/user/' + studentId.key + '/information').once('value' , function(info){
                            studentNickname = info.val().Nickname;
                        });
                        if(studentNickname != preNickname){
                            preNickname = studentNickname;
                            studentCnt = studentCnt + 1;
                            var html = '<div class="row studentsHomework' + studentCnt + '" style="margin-top:2%;">'
                                            + '<div class="col-2 studentName">' + studentNickname + '</div>'
                                            + '<div class="col-2 homeworkName"></div>'
                                            + '<div class="col-2 homeworkFile"></div>'
                                            + '<div class="col-2 homeworkDeadline"></div>'
                                            + '<div class="col-4 homeworkUpload"></div>'
                                        + '</div>';
                            $('.homeworkSys').children('.container').children('.teacher').append(html);
                        }
                        // create download link and show infomation(如果無法同步的話就改用存在metadata的方式)
                        storage.child(myUid).child('teacher').child(studentId.key).child(fileInfo.val().upload).getDownloadURL()
                        .then(function(url){
                            var xhr = new XMLHttpRequest();
                            xhr.responseType = 'blob';
                            xhr.onload = function(event) {
                                var blob = xhr.response;
                                var href = window.URL.createObjectURL(blob);
                                $('.studentsHomework' + studentCnt).children('.homeworkFile').append('<a href="' + href + '" download="' + fileInfo.val().upload +  '">' + fileInfo.val().upload + '</a><br><br>')
                                // show homework name
                                $('.studentsHomework' + studentCnt).children('.homeworkName').append('<div>' + hwName + '</div><br>');
                                // show recieve homework
                                if(fileInfo.val().download != ""){
                                    storage.child(myUid).child('teacher').child(studentId.key).child(fileInfo.val().download).getDownloadURL()
                                    .then((url) =>{
                                        var xhr2 = new XMLHttpRequest();
                                        xhr2.responseType = 'blob';
                                        xhr2.onload = function(event) {
                                            var blob = xhr.response;
                                            var href = window.URL.createObjectURL(blob);
                                            $('.studentsHomework' + studentCnt).children('.homeworkUpload').append('<a href="' + href + '" download="' + fileInfo.val().download +  '">' + fileInfo.val().download + '</a><br><br>');
                                        }
                                        xhr2.open('GET', url);
                                        xhr2.send();
                                    });
                                    var x = 0;
                                    while(x < 100000){
                                        x++;
                                    }
                                }
                                else{
                                    $('.studentsHomework' + studentCnt).children('.homeworkUpload').append('<br><br>')
                                }
                                // show homework deadline
                                if(deadline(hwDeadlineYear , hwDeadlineMonth , hwDeadlineDate))
                                    $('.studentsHomework' + studentCnt).children('.homeworkDeadline').append('<div>' + hwDeadlineYear + '/' + hwDeadlineMonth + '/' + hwDeadlineDate + '</div><br>');
                                else
                                    $('.studentsHomework' + studentCnt).children('.homeworkDeadline').append('<div style="color:red;">' + hwDeadlineYear + '/' + hwDeadlineMonth + '/' + hwDeadlineDate + '</div><br>');
                            };
                            xhr.open('GET', url);
                            xhr.send();
                        });
                    });
                })
            }); 
        });
    }
    function deadline(year , month , date){
        var time = Date.now();
        var now = new Date();
        now.setTime(time);
        if(year < now.getFullYear()){
            return false;
        }
        else if(month < now.getMonth() + 1){
            return false;
        }
        else if(date < now.getDate()){
            return false;
        }
        else{
            return true;
        }
    }
    function addHomework(file){
        var myUid = firebase.auth().currentUser.uid;
        var date = new Date();
        var othersNickname = $('#selectHomeworkStudent').val();
        var othersUid;
        var hwName = $('#inputHomeworkName').val();
        date.setDate($('#selectHomeworkDeadlineDay').val());
        date.setFullYear($('#selectHomeworkDeadlineYear').val());
        date.setMonth($('#selectHomeworkDeadlineMonth').val()-1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        database.ref('root/user/' + myUid + '/student').on('child_added' , function(data){
            if(data.val().Nickname == othersNickname){
                othersUid = data.val().StudentId;
            }
        });
        storage.child(myUid).child('teacher').child(othersUid).child(file[0].name).put(file[0])
        .then(function(){
            var customMetaData = {
                customMetadata:{
                    homeworkName: hwName,
                    deadlineYear: date.getFullYear(),
                    deadlineMonth: date.getMonth()+1,
                    deadlineDate: date.getDate()
                }
            }
            storage.child(myUid).child('teacher').child(othersUid).child(file[0].name).updateMetadata(customMetaData)
            .then(function(){
                $('#addHomeworkFile').prop('files' , null);
                $('#modalAddHomework').hide(100);
            });
        })
        .catch(function(err){
            console.log(err);
        });
        database.ref('root/user/' + myUid + '/student').on('child_added' , function(data){
            if(data.val().Nickname == othersNickname){
                othersUid = data.val().StudentId;
                storage.child(othersUid).child('student').child(myUid).child(file[0].name).put(file[0])
                .then(function(){
                    var customMetaData = {
                        customMetadata:{
                            homeworkName: hwName,
                            deadlineYear: date.getFullYear(),
                            deadlineMonth: date.getMonth()+1,
                            deadlineDate: date.getDate()
                        }
                    }
                    storage.child(othersUid).child('student').child(myUid).child(file[0].name).updateMetadata(customMetaData)
                    .then(function(){
                        var homeworkInfoTeacher = {
                            deadlineYear: date.getFullYear(),
                            deadlineMonth: date.getMonth()+1,
                            deadlineDate: date.getDate(),
                            homeworkName: hwName,
                            upload: file[0].name,
                            download: ""
                        }
                        /*var homeworkInfoStudent = {
                            deadlineYear: date.getFullYear(),
                            deadlineMonth: date.getMonth()+1,
                            deadlineDate: date.getDate(),
                            homeworkName: hwName,
                            upload: "",
                            download: file[0].name
                        }*/
                        var fileKey = database.ref('root/user/' + myUid + '/homework/teacher/' + othersUid).push(homeworkInfoTeacher).key;
                        var homeworkInfoStudent = {
                            deadlineYear: date.getFullYear(),
                            deadlineMonth: date.getMonth()+1,
                            deadlineDate: date.getDate(),
                            homeworkName: hwName,
                            upload: "",
                            download: file[0].name
                        }
                        database.ref('root/user/' + othersUid + '/homework/student/' + myUid + '/' + fileKey).set(homeworkInfoStudent);
                        alert("success");
                        $('#addHomeworkFile').prop('files' , null);
                        $('#modalAddHomework').hide(100);
                    });
                })
                .catch(function(err){
                    console.log(err);
                });
            }
        });
    }
});