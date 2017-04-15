app.controller('DashboardCtrl', ['$scope', 'Events', function($scope, Events){
  $scope.pastEvents = [];
  $scope.upcomingEvents = [];

  $scope.refresh = function(){
    Events.getUpcoming(function(data){
      $scope.upcomingEvents = data;
      console.log(data);
    });

    Events.getPrevious(function(data){
      $scope.pastEvents = data;
    });
  }


  $scope.updateEventStatus = function(id, status){
    Events.updateStatus(id,status,function(data){
      if(data.status==200){
          $scope.refresh();
      }
    });
  }

  $scope.refresh();
}]);
