app.controller('LocationsBookCtrl', ['$scope', '$stateParams', 'Users', 'Locations', '$interval', '$state', function($scope, $stateParams, Users, Locations, $interval, $state) {
  $scope.date = new Date();
  $scope.location;
  $scope.eventStep=0;
  $scope.form={};

  $scope.btnText="Next";
  $scope.value="d3an.meehan@hotmail.com";
  $scope.question = "BOOK ROOM";
  $scope.valuePlaceholder="Please enter your email";
  $scope.statusMessage;

  var tick = function() {
      $scope.date = Date.now() // get the current time
  }

  $scope.back = function(){
    $state.go('locations-info', {id:$stateParams.id});
  }

  Locations.getOne($stateParams.id, function(location) {
      $scope.location = location.data;
  });

  $scope.next = function(){
    var step = $scope.eventStep;
    $scope.statusMessage = "Loading..."
    if($scope.value==""||$scope.value==undefined){
      $scope.statusMessage
    }
    //Email
    if(step==0){
      Users.getIDfromEmail($scope.value, function(response){
        if(response.status==200){
            $scope.form.owner=response.data.id;
            $scope.form.ownerName=response.data.name;
            $scope.statusMessage="";
            $scope.value="";
            $scope.valuePlaceholder="Hi "+$scope.form.ownerName+", please enter event name"
            $scope.question="Enter Event Name";
            $scope.eventStep++;
        }else{
          $scope.statusMessage = response.data.message;
        }

      });
    }

    if(step==2){
      $scope.form.name=$scope.value;
      $scope.statusMessage="";
      $scope.value=""
      $scope.eventStep++;
      $scope.question="Select Start Time";
      $scope.eventStep++;
    }

    if(step==3){
      $scope.form.name=$scope.value;
      $scope.statusMessage="";
      $scope.value=""
      $scope.eventStep++;
      $scope.valuePlaceholder="Please enter event name"
      $scope.eventStep++;
    }

    $scope.form.location=$stateParams.id;
    $scope.form.description="Event added at Kiosk by "+$scope.form.ownerName;

  }

  $interval(tick, 1000);
}]);
