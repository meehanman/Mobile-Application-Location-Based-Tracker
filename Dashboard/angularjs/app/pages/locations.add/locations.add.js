app.controller('LocationsAddCtrl', ['$scope', '$timeout', 'Places', 'Locations', 'ModalService', 'NgMap', function($scope, $timeout, Places, Locations, ModalService, NgMap) {
    $scope.statusText = undefined;

    $scope.PlaceName = "";
    $scope.form = {};
    $scope.form.services = [{name:"",description:""}];

    $scope.add = function() {
        $scope.statusText = "Loading...";
        if($scope.form.services.length<=1&&$scope.form.services[0].name==""){
          $scope.form.services == undefined;
        }
        Locations.add($scope.form, function(data) {
            if(data.status==200){
              $scope.form = {};
              $scope.typeDropdown = "";
              $scope.PlaceName = "";
            }
            $scope.status(data.data.message);
        });
    }

    $scope.addService = function(){
        $scope.form.services.push({name:"",description:""});
    }

    $scope.removeService = function(){
      if($scope.form.services.length>1){
        $scope.form.services.splice(-1,1)
      }
    }

    $scope.selectPlace = function() {
        Places.get(function(locations) {
                ModalService.showModal({
                    templateUrl: 'app/modals/place/tpl.place.html',
                    controller: "PlaceModalCtrl",
                    inputs: {
                        title: "Select Building",
                        places: locations.data
                    }
                }).then(function(modal) {
                    modal.element.modal();
                    modal.close.then(function(result) {
                        if(result!==undefined){
                          $scope.form.place = result._id;
                          $scope.address = result.address.street+", "+result.address.city+", "+result.address.postcode;
                          $scope.PlaceName = result.name;
                        }
                    });
                });
            });
        };

        $scope.onDragEnd = function (marker, $event) {
            $scope.form.gps = {};
            $scope.form.gps.x = marker.latLng.lat();
            $scope.form.gps.y = marker.latLng.lng();
            geocoder = new $event.google.maps.Geocoder();
            geocoder.geocode({
                'latLng': new $event.google.maps.LatLng($scope.form.gps.x, $scope.form.gps.y)
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

        $scope.status = function(s) {
            $scope.statusText = s;
            $timeout(function() {
                $scope.statusText = undefined;
            }, 5000);
        }
}]);
