app.factory('Locations', ['$rootScope', '$http', function($rootScope, $http){
var locations;

var get = function(callback){
  $http.get('https://cloud.dean.technology/location').then(function(locations){
    callback(locations);
  }, function(fail){
    console.log("Failed to get locationss",fail);
    callback(fail);
  });
}

var getOne = function(id, callback){
  $http.get('https://cloud.dean.technology/location/'+id).then(function(location){
    console.log(locations);
    callback(location);
  }, function(fail){
    console.log("Failed to get locationss",fail);
    return false;
  });
}

var add = function(form, callback){
  //Convert Objects to JSON Strings
  if(form.services){
    form.services = angular.toJson(form.services);
  }
  if(form.gps){
    form.gps = angular.toJson(form.gps);
  }

  $http({
    method: 'POST',
    url: 'https://cloud.dean.technology/location',
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
    callback(fail);
  });
}

var del = function(id, callback){
    $http.delete('https://cloud.dean.technology/location/'+id).then(function(success){
      callback(success);
    }, function(fail){
      callback(fail);
    });
  }

  var update = function(form, callback){

    form.place = form.place._id;

    if(form.services){
      form.services = angular.toJson(form.services);
    }
    
    if(form.gps){
      form.gps = angular.toJson(form.gps);
    }


    $http({
      method: 'PUT',
      url: 'https://cloud.dean.technology/location',
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
      callback(fail);
    });
  }

return{
  get, getOne, add, del, update
}

}]);