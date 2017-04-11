/*
$scope.addPlace = function() {
    ModalService.showModal({
        templateUrl: 'app/modals/place/tpl.place.html',
        controller: "PlaceModalCtrl"
    }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {
            $scope.message = "You said " + result;
            console.log(result);
        });
    });
};
*/
app.controller('PlaceModalCtrl', function($scope, close){

  $scope.close = function(result) {
  	close(result, 500);
  };

});
