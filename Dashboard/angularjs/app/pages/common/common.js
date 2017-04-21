app.controller('CommonCtrl', ['$scope', 'Auth', '$location', '$state', '$interval', function($scope, Auth, $location, $state, $interval) {
    $scope.user = Auth.getUser();
    $scope.logout = Auth.logout;
    $scope.notifications = [];

    $scope.nav = function(location) {
        console.log("common.nav", location);
        //Reset side-menu
        $scope.menu = 'None';
        $location.path('/' + location);
    }

    $scope.stateNav = function(location, params){
      $state.go(location, params);
    }

    $scope.menu = 'None';
    $scope.menuSet = function(item) {
        if ($scope.menu == item) {
            $scope.menu = 'None';
        } else {
            $scope.menu = item;
        }
    }

    $scope.LocationSplit = function(string) {
        return string.split(".")[0];
    }

    $scope.notifications = [];
    $scope.getNotifications = function() {
        Auth.getNotifications(function(data) {
            //Only keep the invited status
            for (var i = 0; i < data.data.length; i++) {
                if (data.data[i].status == "invited") {
                    $scope.notifications.push(data.data[i]);
                }
            }
        });
    }

    $interval($scope.getNotifications, 100000);
    $scope.getNotifications()
}]);
