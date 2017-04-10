app.factory('Auth', ['$rootScope', '$location', '$http', 'localStorageService', function($rootScope, $location, $http, localStorageService){
var user;

var setAuthHeader = function(authEncoded){
  if(authEncoded!==undefined){
    localStorageService.set('authEncoded',authEncoded);
    $http.defaults.headers.common.Authorization = 'Basic '+authEncoded;
  }else{
    localStorageService.remove('authEncoded');
    $http.defaults.headers.common.Authorization = undefined;
  }
}
var setUser = function(userObject){
  if(userObject!==undefined){
   localStorageService.set('user',JSON.stringify(userObject));
   user = userObject;
 }else{
   localStorageService.remove('user');
   user=undefined;
 }
}
//Loads data stored in memory to the application
var load = function(){
    user = JSON.parse(localStorageService.get('user'));
    setAuthHeader(localStorageService.get('authEncoded'));
}
var isLoggedIn = function(){
    load();
    return(user)? user : false;
}
var login = function(u,p){
  //Save Auth Header to Storage
  setAuthHeader(btoa(u+":"+p));
  //Set Auth Header for all remaining requests
  setAuthHeader(localStorageService.get('authEncoded'));
  //Authenticate the user with the header set
  whoami(function(){
    if(isLoggedIn()){
      $location.path('/dashboard');
    }else{
      alert("Username or Password Incorrect.");
    }
  });
}
var logout = function(){
  setUser(undefined);
  setAuthHeader(undefined);
  $location.path('/login');
}
var whoami = function(callback){
  $http.get('https://cloud.dean.technology/whoami').then(function(user){
    setUser(user.data);
    console.info(user.data.name+" logged in",user);
    if(typeof callback === "function"){
      callback();
    }
  }, function(fail){
    console.log("Failed to Login",fail);
  });
}
var getUser = function(){
  return user;
}
return{
  login, logout, isLoggedIn, getUser
}

}]);
