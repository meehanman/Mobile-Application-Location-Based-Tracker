app.controller('LocationsEditCtrl', ['$scope', '$stateParams', 'Locations', 'Places', 'ModalService', '$timeout', 'NgMap', function($scope, $stateParams, Locations, Places, ModalService, $timeout, NgMap) {
    $scope.location = {};

    $scope.parentlocationName = undefined;
    $scope.editing = false;
    $scope.statusText = undefined;

    $scope.refresh = function() {
        $scope.editing = false;
        $scope.location = {};
        $scope.location.services = [];
        $scope.parentlocationName = undefined;
        Locations.getOne($stateParams.id, function(result) {
            $scope.location = result.data;
            $scope.location.id = result.data._id;
            $scope.PlaceName = result.data.place.name;
            $scope.address = result.data.place.address.street + ", " + result.data.place.address.city + ", " + result.data.place.address.postcode;
        });
    }

    $scope.update = function() {
        $scope.statusText = "Loading...";
        Locations.update($scope.location, function(data) {
            if (data.status === 200) {
                $scope.status(data.data.message);
                $scope.refresh();
            } else {
                $scope.status(data.data.message);
            }

        });
    }

    $scope.redrawMap = function() {
        NgMap.getMap().then(function(map) {
            window.setTimeout(function() {
                var center = map.getCenter();
                google.maps.event.trigger(map, "resize");
                map.setCenter(center);
            }, 100);
        });
    }

    $scope.addService = function() {
        $scope.location.services.push({
            name: "",
            description: ""
        });
    }

    $scope.removeService = function() {
        if ($scope.location.services.length > 1) {
            $scope.location.services.splice(-1, 1)
        }
    }

    $scope.onDragEnd = function (marker, $event) {
        $scope.location.gps = {};
        $scope.location.gps.x = marker.latLng.lat();
        $scope.location.gps.y = marker.latLng.lng();
        geocoder = new $event.google.maps.Geocoder();
        geocoder.geocode({
            'latLng': new $event.google.maps.LatLng($scope.location.gps.x, $scope.location.gps.y)
        }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    var formatted_address = results[0].formatted_address;
                    $timeout(function () {
                        $scope.address = formatted_address;
                    }, 300);
                } else {
                    alert('No results found');
                }
            } else {
                alert('Geocoder failed due to: ' + status);
            }
        });
    };


    $scope.selectPlace = function() {
        Places.get(function(place) {
                ModalService.showModal({
                    templateUrl: 'app/modals/place/tpl.place.html',
                    controller: "PlaceModalCtrl",
                    inputs: {
                        title: "Select Building",
                        places: place.data
                    }
                }).then(function(modal) {
                    modal.element.modal();
                    modal.close.then(function(result) {
                        if (result._id) {
                          $scope.location.place = result;
                          $scope.address = result.address.street+", "+result.address.city+", "+result.address.postcode;
                          $scope.PlaceName = result.name;
                        }
                        if (result === "None") {
                            $scope.location.place = "";
                            $scope.address = "";
                            $scope.PlaceName = undefined;
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