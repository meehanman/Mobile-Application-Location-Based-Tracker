app.controller('UsersCtrl', [ '$scope', 'Users', 'ModalService', function($scope, Users, ModalService){
    $scope.message = "From Dean Meehan. I'm in useres.js";
    $scope.users;

    $scope.refresh = function(){
      Users.getUsers(function(users){
        $scope.users = users;
      });
    }

    $scope.del = function(user) {
        ModalService.showModal({
            templateUrl: 'app/modals/general/tpl.general.html',
            controller: "GeneralModalCtrl",
            inputs: {
                title: "Confirmation",
                message: "Are you sure you wish to delete " + user.name,
                trueOption: "Yes",
                falseOption: "No"
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if (result) {
                    Users.del(user.id, function(data) {
                        $scope.refresh();
                    });
                }
            });
        });
    }

    $scope.refresh();
}]);
