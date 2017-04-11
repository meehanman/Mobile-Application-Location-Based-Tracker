app.controller('PlacesAddCtrl', ['$scope', 'Places', 'ModalService', function($scope, Places, ModalService) {
    $scope.parentPlaceName = "";
    $scope.form = {"name":"EEECS Building","description":"School of Electronics, Electrical Engineering and Computer Science","addressStreet":"18 Malone Rd","addressCity":"Belfast","addressPostcode":"BT9 5BN","addressCountry":"UK"};

    $scope.add = function() {
        Places.add($scope.form, function(data) {
            console.log(data);
            $scope.form = {};
            $scope.parentPlaceName = "";
        });
    }

    $scope.select = function() {
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
                        if(result!==undefined){
                          $scope.form.parentPlace = result._id;
                          $scope.parentPlaceName = result.name;
                        }
                    });
                });
            });
        };
}]);
