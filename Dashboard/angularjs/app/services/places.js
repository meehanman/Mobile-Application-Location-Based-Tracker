app.factory('Places', ['$rootScope', '$http', function($rootScope, $http){
var places;

var get = function(callback){
    $http.get('https://cloud.dean.technology/place').then(function(success){
      places = success.data;
      callback(success);
    }, function(fail){
      callback(fail);
    });
  }

  var del = function(id, callback){
      $http.delete('https://cloud.dean.technology/place/'+id).then(function(success){
        callback(success);
      }, function(fail){
        callback(fail);
      });
    }

var add = function(form, callback){
  $http({
    method: 'POST',
    url: 'https://cloud.dean.technology/place',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
    },
    data: form
  }).then(function(success){
    callback(success);
  }, function(fail){
    callback(faila);
  });
}

return{
  add, get, del
}

}]);
