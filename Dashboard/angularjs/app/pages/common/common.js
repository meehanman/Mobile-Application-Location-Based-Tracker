app.controller('CommonCtrl', ['$scope', 'Auth', '$location', '$state', function($scope, Auth, $location, $state){
    $scope.user = Auth.getUser();
    $scope.logout = Auth.logout;

    $scope.nav = function(location){
      //Reset side-menu
      $scope.menu = 'None';
      $location.path('/'+location);
    }

    $scope.menu = 'None';
    $scope.menuSet = function(item){
      if($scope.menu==item){
        $scope.menu='None';
      }else{
        $scope.menu=item;
      }
    }

    $scope.LocationSplit = function(string){
      return string.split(".")[0];
    }
}]);
