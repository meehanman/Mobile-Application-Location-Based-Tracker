app.controller('PlacesAddCtrl', [ '$scope', 'Places', function($scope, Users){

    Users.addPlace(function(data){
      console.log(data);
    });
    
}]);
