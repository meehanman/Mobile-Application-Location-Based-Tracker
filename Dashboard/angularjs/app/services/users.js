app.factory('Users', ['$rootScope', '$http', function($rootScope, $http){
var users;

var getUsers = function(callback){
  $http.get('https://cloud.dean.technology/user').then(function(user){
    users = user.data;
    console.log(user);
    callback(users);
  }, function(fail){
    callback(fail);
  });
}

var getOne = function(id,callback){
  $http.get('https://cloud.dean.technology/user/'+id).then(function(user){
    callback(user);
  }, function(fail){
    callback(fail);
  });
}

var addUser = function(userObject, callback){
  console.log("AddUser",userObject)
  //Quick Validation
  if(!userObject.name || !userObject.email || !userObject.password || !userObject.image){
    alert("Please fill out all the fields");
  }

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
    callback(data);
  }, function(fail){
    callback(fail);
  });
}

var del = function(id, callback){
    $http.delete('https://cloud.dean.technology/user/'+id).then(function(success){
      callback(success);
    }, function(fail){
      callback(fail);
    });
  }

  var update = function(user, callback){
    $http({
      method: 'PUT',
      url: 'https://cloud.dean.technology/user',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      transformRequest: function(obj) {
          var str = [];
          for(var p in obj)
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          return str.join("&");
      },
      data: user
    }).then(function(success){
      callback(success);
    }, function(fail){
      callback(fail);
    });
  }

return{
  getUsers, addUser, del, getOne, update
}

}]);
