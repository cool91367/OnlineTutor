$(function(){
    var database = firebase.database();
    $('#contactPerson').on('click' , ".friendChat" , function(){
        console.log('click');
    });

    // function load message
    function loadMessage(myUid , othersUid){
        database.ref('root/user/' + myUid + '/message/student' + othersUid).on('child_added' , function(data){
            var sender = data.val().SenderId;
            var message = data.val().Message;
            
        });
    }
});