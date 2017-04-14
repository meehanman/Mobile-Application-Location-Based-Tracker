app.controller('EventAddCtrl', ['$scope', 'Events', 'Locations', 'ModalService', 'Auth', function($scope, Events, Locations, ModalService, Auth) {
    $scope.owner = Auth.getUser();
    $scope.form = {};
    $scope.form.owner = $scope.owner.id;

    $scope.selectLocation = function() {
                ModalService.showModal({
                    templateUrl: 'app/modals/locationSearch/tpl.locationSearch.html',
                    controller: "LocationSearchModalCtrl",
                    inputs: {
                        title: "Select Location",
                        Locations: Locations
                    }
                }).then(function(modal) {
                    modal.element.modal();
                    modal.close.then(function(result) {
                        if(result!==undefined){
                        }
                    });
                });
        };

    //DateTimePickerControls
    $scope.startDateOnSetTime = function() {
        $scope.$broadcast('start-date-changed');
    }

    $scope.endDateOnSetTime = function() {
        $scope.$broadcast('end-date-changed');
    }

    $scope.startDateBeforeRender = function($dates) {
        var activeDate = moment();

        $dates.filter(function(date) {
            return date.localDateValue() <= activeDate.valueOf()
        }).forEach(function(date) {
            date.selectable = false;
            //Fixes bug that doesn't allow today to be selected
            if(date.current) date.selectable = true;
        })

        //If an end date is set, ensure the time cannot be after the end date
        if ($scope.dateRangeEnd) {
            var activeDate = moment($scope.dateRangeEnd);

            $dates.filter(function(date) {
                return date.localDateValue() >= activeDate.valueOf()
            }).forEach(function(date) {
                date.selectable = false;
            })
        }
    }

    $scope.endDateBeforeRender = function($view, $dates) {
        if ($scope.dateRangeStart) {
            var activeDate = moment($scope.dateRangeStart).subtract(1, $view).add(1, 'minute');

            $dates.filter(function(date) {
                return date.localDateValue() <= activeDate.valueOf()
            }).forEach(function(date) {
                date.selectable = false;
            })
        }
    }
}]);
