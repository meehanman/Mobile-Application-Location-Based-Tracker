app.controller('UsersEditCtrl', ['$scope', '$stateParams', 'Users', 'ModalService', '$timeout', function($scope, $stateParams, Users, ModalService, $timeout) {
    $scope.user = {};

    $scope.editing = false;
    $scope.statusText = undefined;

    $scope.refresh = function() {
        $scope.editing = false;
        $scope.user = {};
        Users.getOne($stateParams.id, function(result) {
            $scope.user.id = $stateParams.id;
            $scope.user = result.data;
            console.log(result);
        });
    }

    $scope.update = function() {
        $scope.statusText = "Loading..."
        Users.update($scope.user, function(data) {
            if (data.status === 200) {
                $scope.status(data.data.message);
                $scope.refresh();
            }
            $scope.status(data.data.message);
        });
    }

    $scope.status = function(s) {
        $scope.statusText = s;
        $timeout(function() {
            $scope.statusText = undefined;
        }, 5000);
    }

    $scope.refresh();
}]);
