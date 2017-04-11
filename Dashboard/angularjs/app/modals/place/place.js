app.controller('PlaceModalCtrl', function($scope, title, places, close){
  $scope.title = title;
  $scope.places = places;

  $scope.close = function(result) {
  	close(result, 250);
  };

});
