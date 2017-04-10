app.factory('Users', ['$rootScope', '$http', function($rootScope, $http){
var users;

var getUsers = function(callback){
  $http.get('https://cloud.dean.technology/user').then(function(user){
    users = user.data;
    console.log(user);
    callback(users);
  }, function(fail){
    console.log("Failed to get users",fail);
    return false;
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
    console.log(data);
    callback(data);
  }, function(fail){
    console.log("Failed to add user",fail);
    alert(fail.message);
    return false;
  });
}

return{
  getUsers, addUser
}

}]);
