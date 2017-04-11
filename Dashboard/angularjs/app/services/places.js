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

var addPlace = function(placeObject, callback){
  console.log("Adding Place",placeObject)

  $http({
    method: 'POST',
    url: 'https://cloud.dean.technology/user',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
    },
    data: userObject
  }).then(function(data){
    console.log(data);
    callback(data);
  }, function(fail){
    console.log("Failed to add user",fail);
    alert(fail.message);
    return false;
  });
}

return{
  getPlaces, addPlace
}

}]);
