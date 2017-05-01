app.controller('EventsCtrl', ['$scope', 'Events', 'Auth', 'ModalService', function($scope, Events, Auth, ModalService) {
    $scope.events;
    $scope.user = Auth.getUser();
    $scope.page = {};
    $scope.page.title = "Your Events";
    $scope.page.buttonText = "View All Events";

    $scope.toggleEventLoad = function() {
        delete $scope.events;
        if ($scope.page.title == "Your Events") {
            $scope.page.title = "All Events";
            $scope.page.buttonText = "View Your Events";
        } else {
            $scope.page.title = "Your Events";
            $scope.page.buttonText = "View All Events";
        }
        $scope.refresh()
    }

    $scope.refresh = function() {
        if ($scope.page.title == "Your Events") {
            Events.getUsers(function(events) {
                console.log("sSEsefseffe", events);
                $scope.events = events;
            });
        } else {
          Events.get(function(events) {
              console.log("sSEsefseffe", events);
              $scope.events = events;
          });
        }
    }

    $scope.currentlyActive = function(starts_at, ends_at) {
        var now = new Date();
        var starts_at = new Date(starts_at);
        var ends_at = new Date(ends_at);
        if (starts_at < now && now < ends_at) {
            return {
                'border-left': '#45941b 5px solid'
            };
        }
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
