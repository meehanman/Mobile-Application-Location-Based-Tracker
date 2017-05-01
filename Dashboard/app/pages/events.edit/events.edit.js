app.controller('EventEditCtrl', ['$scope', '$stateParams', 'Events', 'Users', 'Locations', 'ModalService', 'Auth', '$timeout', function($scope, $stateParams, Events, Users, Locations, ModalService, Auth, $timeout) {
    $scope.owner = Auth.getUser();
    $scope.form = {};
    $scope.form.owner = $scope.owner.id;
    $scope.users = [];
    $scope.locationName;
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

    $scope.getEvent = function(){
      Events.getOne($stateParams.id,function(event){
        $scope.form = event.data;
        $scope.locationName = event.data.location.name;
        console.log(event);
      });
    }

    $scope.update = function() {
      $scope.statusText = "Loading...";
      Events.edit($scope.form, function(data){
        if(data.status==200){
          $scope.form = {};
          $scope.form.attendees = [];
          $scope.getEvent();
          $scope.editing=false;
          $scope.searchText="";
          $scope.showUserTable=false;
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
                image: users[user].image,
                displayName: users[user].name + " <" + users[user].email + ">",
                name: users[user].name,
                id: users[user].id
            });
        }
    });

    $scope.removeUser = function(id){
      for(var i=0;i<$scope.form.attendees.length;i++){
        if(id==$scope.form.attendees[i]._id){
          $scope.form.attendees.splice(i,1);
        }
      }
    }

    $scope.addUser = function(user){
      user._id = user.id;
      $scope.form.attendees.push({user:user,status:"Added"});
      console.log($scope.form.attendees);
      $scope.searchText="";
    }

    $scope.status = function(s) {
        $scope.statusText = s;
        $timeout(function() {
            $scope.statusText = undefined;
        }, 5000);
    }

    $scope.getEvent();
}]);
