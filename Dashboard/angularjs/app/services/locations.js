app.factory('Locations', ['$rootScope', '$http', function($rootScope, $http){
var locations;

var getLocations = function(callback){
  $http.get('https://cloud.dean.technology/location').then(function(user){
    locations = user.data;
    console.log(locations);
    callback(locations);
  }, function(fail){
    console.log("Failed to get locationss",fail);
    return false;
  });
}

return{
  getLocations
}

}]);
