$(function(){
    var database = firebase.database();
    var studentIndex = 1;
    var teacherIndex = 1;
    database.ref('root/user/').once('value' , function(data){
        data.forEach(function(info){
            //console.log(info.val().information.Nickname);
            var html = '<div class="mycard">'
                            +'<div class="card-deck">'
                                +'<div class="card text-center">'
                                    +'<img src="' + info.val().information.Image + '"class="card-img-top" width="100%">'
                                    +'<div class="card-body">'
                                        +'<h4 class="card-title studentNickname">' + info.val().information.Nickname + '</h4>'
                                        +'<p class="card-text">' + info.val().information.Educate +'</p>'
                                        +'<p class="card-text card-introduction">look my intriduction</a>'
                                    +'</div>'
                                    +'<div class="card-footer text-right">'
                                        +'<button class="btn btn-primary">contact me</button>'
                                    +'</div>  '
                                +'</div>'
                            +'</div>'
                        +'</div>';
            $('.findStudentHtml').append(html);
            if(studentIndex % 4 == 0){
                $('.findStudentHtml').append('<br><br><br>');
            }
            studentIndex++;
        });
    });
    database.ref('root/user/').once('value' , function(data){
        data.forEach(function(info){
            //console.log(info.val().information.Nickname);
            var html = '<div class="mycard">'
                            +'<div class="card-deck">'
                                +'<div class="card text-center">'
                                    +'<img src="' + info.val().information.Image + '"class="card-img-top" width="100%">'
                                    +'<div class="card-body">'
                                        +'<h4 class="card-title studentNickname">' + info.val().information.Nickname + '</h4>'
                                        +'<p class="card-text">' + info.val().information.Educate +'</p>'
                                        +'<p class="card-text card-introduction">look my intriduction</a>'
                                    +'</div>'
                                    +'<div class="card-footer text-right">'
                                        +'<button class="btn btn-primary">contact me</button>'
                                    +'</div>  '
                                +'</div>'
                            +'</div>'
                        +'</div>';
            $('.findTeacherHtml').append(html);
            if(teacherIndex % 4 == 0){
                $('.findTeacherHtml').append('<br><br><br>');
            }
            teacherIndex++;
        });
    })
});