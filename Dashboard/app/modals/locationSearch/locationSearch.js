app.controller('LocationSearchModalCtrl', function($scope, title, Locations, close){
  $scope.title = title;
  $scope.locations = {};
  $scope.tableTitle = "Locations"
  $scope.position = [];
  $scope.distance = 10000000;

  //Ash for Geolocation access and ask for closes location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position){
      $scope.$apply(function(){
        $scope.position = [position.coords.latitude, position.coords.longitude];
        $scope.getClosestLocations();
      });
    });
  }else{
    //Otherwise just get locations
    getLocations();
  }

  $scope.getClosestLocations = function(){
    Locations.getClosest($scope.position[0], $scope.position[1], $scope.distance, function(data) {
      $scope.tableTitle = "Locations sorted by distance"
      $scope.locations = data.data;
    });
  }

  $scope.getLocations = function(){
    Locations.get(function(data) {
      $scope.tableTitle = "Locations"
      $scope.locations = data.data;
    });
  }

  $scope.close = function(result) {
  	close(result, 250);
  };

  $scope.getLocations();
});
