app.controller('placesCtrl', [ '$scope', 'Places', function($scope, Places){
    $scope.message = "From Dean Meehan. I'm in placesCtrl.js";
    $scope.places;
    Places.getPlaces(function(places){
      $scope.places = places;
    });
}]);
