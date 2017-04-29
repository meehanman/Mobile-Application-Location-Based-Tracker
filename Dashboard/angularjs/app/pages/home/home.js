app.controller('DashboardCtrl', ['$scope', 'Events', function($scope, Events) {

    $scope.currentlyActive = function(starts_at,ends_at){
      var now = new Date();
      var starts_at = new Date(starts_at);
      var ends_at = new Date(ends_at);
      return (starts_at < now && now < ends_at)
    }

    $scope.refresh = function() {
        Events.getUpcoming(function(data) {
            $scope.upcomingEvents = data.data;

            if(data.data.length==0) return;

            $scope.labels = ["Accepted", "Declined", "Attended", "Invited"];
            $scope.data = [0, 0, 0, 0];
            for (var i = 0; i < $scope.upcomingEvents[0].attendees.length; i++) {
              console.log(2,$scope.upcomingEvents[0].attendees[i]);
                switch ($scope.upcomingEvents[0].attendees[i].status) {
                    case ('accepted'):
                        $scope.data[0]++;
                        break;
                    case ('declined'):
                        $scope.data[1]++;
                        break;
                    case ('attended'):
                        $scope.data[2]++;
                        break;
                    case ('invited'):
                        $scope.data[3]++;
                        break;
                }
            }
        });

        Events.getPrevious(function(data) {
            $scope.pastEvents = data.data;
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
