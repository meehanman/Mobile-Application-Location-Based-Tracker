app.controller('UsersCtrl', [ '$scope', 'Users', function($scope, Users){
    $scope.message = "From Dean Meehan. I'm in useres.js";
    $scope.users;
    Users.getUsers(function(users){
      $scope.users = users;
    });
}]);
