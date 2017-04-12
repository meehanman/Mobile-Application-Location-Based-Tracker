app.controller('PlacesEditCtrl', ['$scope', '$stateParams', 'Places', 'ModalService', '$timeout', function($scope, $stateParams, Places, ModalService, $timeout) {
    $scope.place = {};

    $scope.parentPlaceName = undefined;
    $scope.editing = false;
    $scope.statusText = undefined;

    $scope.refresh = function() {
        $scope.editing = false;
        $scope.place = {};
        $scope.parentPlaceName = undefined;
        Places.getOne($stateParams.id, function(result) {
            console.log(result);
            $scope.place.id = $stateParams.id;
            $scope.place.name = result.data.name;
            $scope.place.description = result.data.description;
            $scope.place.addressStreet = result.data.address.street;
            $scope.place.addressCity = result.data.address.city;
            $scope.place.addressPostcode = result.data.address.postcode;
            $scope.place.addressCountry = result.data.address.country;
            if (result.data.parentPlace) {
                $scope.place.parentPlace = result.data.parentPlace._id;
                $scope.parentPlaceName = result.data.parentPlace.name;
            }
        });
    }

    $scope.update = function() {
        $scope.statusText = "Loading..."
        Places.update($scope.place, function(data) {
            if (data.status === 200) {
                $scope.status(data.data.message);
                $scope.refresh();
            }
            $scope.status(data.data.message);
        });
    }

    $scope.selectParent = function() {
        Places.get(function(places) {
            ModalService.showModal({
                templateUrl: 'app/modals/place/tpl.place.html',
                controller: "PlaceModalCtrl",
                inputs: {
                    title: "Select Place",
                    places: places.data
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    if (result._id) {
                        $scope.place.parentPlace = result._id;
                        $scope.parentPlaceName = result.name;
                    }
                    if (result === "None") {
                        $scope.place.parentPlace = "";
                        $scope.parentPlaceName = undefined;
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
