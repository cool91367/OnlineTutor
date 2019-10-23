$(function(){
    var studentId;
    var subject;
    var cost;
    var chargeMethod;
    var database = firebase.database();
    var myUid;
    
    $('#submit').on('click' , function(){
        studentId = $('#studentIdentify').val();
        subject = $('#subject').val();
        cost = $('#cost').val();
        chargeMethod = $('#chargeMethod').val();
        myUid =firebase.auth().currentUser.uid;
        var studentInformation;
        if(studentId == myUid){
            alert("can't add yoursalves");
            return;
        }
        database.ref('root/user/' + studentId + '/information').on('value' , function(data){
            console.log(data.val());
            studentInformation = data.val();
            if(studentInformation == null){
                alert('there is no this person');
                return;
            }
            if(studentId && subject && cost && chargeMethod){
                database.ref('root/user/' + myUid + '/student')
                .push({StudentId: studentId , Subject: subject , Cost: cost , ChargeMethod: chargeMethod , Nickname: studentInformation.Nickname})
                .then(()=>{
                    alert("success");
                    window.location = 'index.html';
                })
                .catch((err)=>{
                    console.log(err);
                });
            }
        });
    });

});