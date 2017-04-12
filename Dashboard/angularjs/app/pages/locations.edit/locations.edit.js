app.controller('LocationsEditCtrl', ['$scope', '$stateParams', 'Locations', 'ModalService', '$timeout', function($scope, $stateParams, Locations, ModalService, $timeout) {
    $scope.location = {};

    $scope.parentlocationName = undefined;
    $scope.editing = false;
    $scope.statusText = undefined;

    $scope.refresh = function() {
        $scope.editing = false;
        $scope.location = {};
        $scope.parentlocationName = undefined;
        Locations.getOne($stateParams.id, function(result) {
            console.log(result);
            $scope.location.id = $stateParams.id;
            $scope.location.name = result.data.name;
            $scope.location.description = result.data.description;
        });
    }

    $scope.update = function() {
        $scope.statusText = "Loading..."
        Locations.update($scope.location, function(data) {
            if (data.status === 200) {
                $scope.status(data.data.message);
                $scope.refresh();
            } else {
                $scope.status(data.data.message);
            }

        });
    }

    $scope.selectParent = function() {
        Locations.get(function(locations) {
            ModalService.showModal({
                templateUrl: 'app/modals/location/tpl.location.html',
                controller: "locationModalCtrl",
                inputs: {
                    title: "Select location",
                    locations: locations.data
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    if (result._id) {
                        $scope.location.parentlocation = result._id;
                        $scope.parentlocationName = result.name;
                    }
                    if (result === "None") {
                        $scope.location.parentlocation = "";
                        $scope.parentlocationName = undefined;
                    }
                });
            });
        });
    };

    $scope.status = function(s) {
        $scope.statusText = s;
        $timeout(function() {
            $scope.statusText = undefined;
        }, 5000);
    }

    $scope.refresh();
}]);
