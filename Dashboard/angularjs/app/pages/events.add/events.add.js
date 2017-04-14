app.controller('EventAddCtrl', ['$scope', 'Events', 'Users', 'Locations', 'ModalService', 'Auth', '$timeout', function($scope, Events, Users, Locations, ModalService, Auth, $timeout) {
    $scope.owner = Auth.getUser();
    $scope.form = {};
    $scope.form.owner = $scope.owner.id;
    $scope.users = [];
    $scope.form.attendees = [];

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
                if (result !== undefined) {
                    $scope.form.location = result._id;
                    $scope.locationName = result.name;
                }
            });
        });
    };

    $scope.addEvent = function() {
      //Do checks on input

      $scope.statusText = "Loading...";
      Events.add($scope.form, function(data){
        if(data.status==200){
          $scope.form = {};
          $scope.form.attendees = [];
        }
        $scope.status(data.data.message);
      });
    }

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
            if (date.current) date.selectable = true;
        })

        //If an end date is set, ensure the time cannot be after the end date
        if ($scope.form.ends_at) {
            var activeDate = moment($scope.form.ends_at);

            $dates.filter(function(date) {
                return date.localDateValue() >= activeDate.valueOf()
            }).forEach(function(date) {
                date.selectable = false;
            })
        }
    }

    $scope.endDateBeforeRender = function($view, $dates) {
        if ($scope.form.starts_at) {
            var activeDate = moment($scope.form.starts_at).subtract(1, $view).add(1, 'minute');

            $dates.filter(function(date) {
                return date.localDateValue() <= activeDate.valueOf()
            }).forEach(function(date) {
                date.selectable = false;
            })
        }
    }

    Users.getUsers(function(users) {
        //Only store the name string and id
        for (user in users) {
            var wordList = users[user].name.split(" ");
            input = "";
            for (var i = 0; i < wordList.length; i++) {
                input += wordList[i].charAt(0).toUpperCase() + wordList[i].substr(1).toLowerCase() + " "
            }
            users[user].name = input.slice(0, -1);
            $scope.users.push({
                name: users[user].name + " <" + users[user].email + ">",
                id: users[user].id
            });
        }
    });

    $scope.status = function(s) {
        $scope.statusText = s;
        $timeout(function() {
            $scope.statusText = undefined;
        }, 5000);
    }
}]);
