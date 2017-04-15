app.controller('EventsCtrl', [ '$scope', 'Events', 'ModalService', function($scope, Events, ModalService){
    $scope.events;

    $scope.refresh = function(){
      Events.get(function(events){
        $scope.events = events;
      });
    }

    $scope.del = function(event) {
        ModalService.showModal({
            templateUrl: 'app/modals/general/tpl.general.html',
            controller: "GeneralModalCtrl",
            inputs: {
                title: "Confirmation",
                message: "Are you sure you wish to delete " + event.name,
                trueOption: "Yes",
                falseOption: "No"
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if (result) {
                    Events.del(event._id, function(data) {
                        $scope.refresh();
                    });
                }
            });
        });
    }

    $scope.refresh();
}]);
