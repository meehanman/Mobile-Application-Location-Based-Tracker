app.controller('locationsCtrl', [ '$scope', 'Locations', 'ModalService', function($scope, Locations, ModalService){
    $scope.locations;

    Locations.getLocations(function(locations){
      $scope.locations = locations;
    });

    $scope.selectPlace = function() {
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

}]);
