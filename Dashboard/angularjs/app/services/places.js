app.factory('Places', ['$rootScope', '$http', function($rootScope, $http){
var places;

var getPlaces = function(callback){
  $http.get('https://cloud.dean.technology/place').then(function(place){
    places = place.data;
    console.log(places);
    callback(places);
  }, function(fail){
    console.log("Failed to get locationss",fail);
    return false;
  });
}

return{
  getPlaces
}

}]);
