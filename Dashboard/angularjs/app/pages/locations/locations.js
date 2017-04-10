app.controller('locationsCtrl', [ '$scope', 'Locations', function($scope, Locations){
    $scope.message = "From Dean Meehan. I'm in LocationsCtrl.js";
    $scope.locations;
    Locations.getLocations(function(locations){
      $scope.locations = locations;
    });
}]);
