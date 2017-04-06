app.factory('Auth', ['$rootScope', '$http', 'localStorageService', function($rootScope, $http, localStorageService){
var user;
var authEncoded = localStorageService.get('authEncoded')||"";

return{
    test: authEncoded,
    setUser : function(aUser){
       user = aUser;
   },
   setAuthHeader: function(){
     $http.defaults.headers.common.Authorization = 'Basic '+authEncoded;
     var req = {
       method: 'GET',
       url: 'https://cloud.dean.technology/whoami'
      }

      $http(req).then(function(success){
        console.log("Success",success);
      }, function(fail){
        console.log("fail",fail);
      });
   },
   isLoggedIn : function(){
       return(user)? user : false;
   },
   login: function(u,p){
     localStorageService.set('authEncoded',btoa(u+":"+p));
     authEncoded = localStorageService.get('authEncoded')
     console.log(authEncoded);
     this.setAuthHeader();
   },
 }
}]);
