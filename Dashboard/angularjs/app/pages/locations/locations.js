app.controller('locationsCtrl', [ '$scope', 'Locations', 'ModalService', function($scope, Locations, ModalService){
    $scope.locations;

    $scope.refresh = function() {
        Locations.get(function(locations) {
            console.warn(locations.data);
            $scope.locations = locations.data;
        });
    };

    $scope.alert = function(m){
      alert(m);
    }
    
    $scope.del = function(location) {
        ModalService.showModal({
            templateUrl: 'app/modals/general/tpl.general.html',
            controller: "GeneralModalCtrl",
            inputs: {
                title: "Confirmation",
                message: "Are you sure you wish to delete " + location.name,
                trueOption: "Yes",
                falseOption: "No"
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                console.log(result,location);
                if (result) {
                    Locations.del(location._id, function(data) {
                        $scope.refresh();
                    });
                }
            });
        });
    }

    $scope.refresh();
}]);
