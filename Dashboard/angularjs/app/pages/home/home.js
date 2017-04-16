app.controller('DashboardCtrl', ['$scope', 'Events', function($scope, Events) {
    $scope.pastEvents = [];
    $scope.upcomingEvents = [];

    $scope.refresh = function() {
        Events.getUpcoming(function(data) {
            $scope.upcomingEvents = data;
            console.log(data);
            $scope.labels = ["Accepted", "Declined", "Attended", "Invited"];
            $scope.data = [0, 0, 0, 0];
            for (var i = 0; i < data.attendees.length; i++) {
                switch (data.attendees[i].status) {
                    case ('attended'):
                        $scope.data[0]++;
                        break;
                    case ('attended'):
                        $scope.data[1]++;
                        break;
                    case ('attended'):
                        $scope.data[2]++;
                        break;
                    case ('attended'):
                        $scope.data[3]++;
                        break;
                }
            }
        });

        Events.getPrevious(function(data) {
            $scope.pastEvents = data;
        });
    }


    $scope.updateEventStatus = function(id, status) {
        Events.updateStatus(id, status, function(data) {
            if (data.status == 200) {
                $scope.refresh();
            }
        });
    }

    $scope.labels = ["Attended", "Didn't Attend"];
    $scope.data = [1, 3];


    $scope.refresh();
}]);
