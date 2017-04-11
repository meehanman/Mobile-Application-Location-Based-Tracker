app.controller('placesCtrl', ['$scope', 'Places', 'ModalService', function($scope, Places, ModalService) {
    $scope.places;

    $scope.refresh = function() {
        Places.get(function(places) {
            $scope.places = places.data;
        });
    };

    $scope.del = function(place) {
        ModalService.showModal({
            templateUrl: 'app/modals/general/tpl.general.html',
            controller: "GeneralModalCtrl",
            inputs: {
                title: "Confirmation",
                message: "Are you sure you wish to delete " + place.name,
                trueOption: "Yes",
                falseOption: "No"
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                console.log(result,place);
                if (result) {
                    Places.del(place._id, function(data) {
                        $scope.refresh();
                    });
                }
            });
        });
    }

    $scope.refresh();
}]);
