app.controller('LoginCtrl', function($scope, Auth){
    $scope.username = "";
    $scope.password = "";
    $scope.message;

    $scope.login = function(){
      Auth.login($scope.username, $scope.password, function(data){
        $scope.message = data.data.message;
      });
    }
});
