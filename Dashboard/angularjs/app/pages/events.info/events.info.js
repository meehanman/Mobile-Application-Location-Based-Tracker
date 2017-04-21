app.controller('EventInfoCtrl', ['$scope', 'Auth', 'Events', 'ModalService', '$stateParams', 'moment', function($scope, Auth, Events, ModalService, $stateParams, moment) {
    $scope.event;
    $scope.user = Auth.getUser();

    //Bar Chart
    $scope.chartOptions = {
        legend: {
            display: true
        }
    };

    $scope.refresh = function() {
        Events.getOne($stateParams.id, function(event) {
            $scope.event = event.data;
            $scope.event.duration = moment.duration(Date.parse($scope.event.starts_at) - Date.parse($scope.event.ends_at)).humanize();

            //If the event is over. Then lets display if they attended or not.
            if (Date.parse($scope.event.ends_at) < Date.now()) {
              $scope.labels = ["Attended", "Absent"];
              $scope.data = [0, 0];
                for (var i = 0; i < $scope.event.attendees.length; i++) {
                    console.log($scope.event.attendees[i]);
                    if ($scope.event.attendees[i].status != "attended") {
                        $scope.event.attendees[i].status = "absent";
                        $scope.data[1]++;
                    }else{
                      $scope.data[0]++;
                    }
                }
            } else {
                $scope.labels = ["Accepted", "Declined", "Invited"];
                $scope.data = [0, 0, 0];
                for (var i = 0; i < $scope.event.attendees.length; i++) {
                    switch ($scope.event.attendees[i].status) {
                        case ('accepted'):
                            $scope.data[0]++;
                            break;
                        case ('declined'):
                            $scope.data[1]++;
                            break;
                        case ('invited'):
                            $scope.data[3]++;
                            break;
                    }
                }
            }
        });
    }

    $scope.updateEventStatus = function(id, status) {
        Events.updateStatus(id, status, function(data) {
            if (data.status == 200) {
                $scope.refresh();
            }
        });
    }

    $scope.refresh();
}]);
