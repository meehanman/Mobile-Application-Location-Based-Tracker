app.controller('UserAddCtrl', [ '$scope', 'Users', function($scope, Users){
    $scope.message = "From Dean Meehan. I'm in useres.js";

    //Validate Options for Field
    $scope.validationOptions = {
      rules: {
          email: {
              required: true,
              email: true
          },
          password: {
              required: true,
              minlength: 6
          }
      },
      messages: {
          email: {
              required: "We need your email address to contact you",
              email: "Your email address must be in the format of name@domain.com"
          },
          password: {
              required: "You must enter a password",
              minlength: "Your password must have a minimum length of 6 characters"
          }
      }
  }

}]);
