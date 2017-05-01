app.controller('UserAddCtrl', [ '$scope', 'Users', function($scope, Users){
  $scope.form = {};
  $scope.formSending = false;

  //Validates Passwords
  $scope.validatePasswords = function(password1,password){
    //Check they have been used yet.
    if(password==undefined||password1==undefined){
      return;
    }

    var valid = false;
    var message = "";

    //Check passwords are at least 6 chars long
    if(password.length<=6){
      message+=" Passwords must be at least 6 characters long";
    }

    //Check Passwords Match
    if(password!=password1){
      message+=" Passwords Must Match"
    }

    //Set Password
    $scope.validatePasswordMessage=message;
    if(message==""){
      $scope.form.password=password;
    }else{
      $scope.form.password=undefined;
    }
  }

  $scope.addUser = function(){
    $scope.formSending=true;
    Users.addUser($scope.form, function(data){
      $scope.formSending=false;
      $scope.form={};
      $scope.password="";
      $scope.password1="";
      $scope.responseMessage = data.data.title+": "+data.data.message;
    });
  }
}]);
