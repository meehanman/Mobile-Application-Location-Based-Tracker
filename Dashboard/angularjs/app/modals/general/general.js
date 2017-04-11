/*
$scope.showModal = function() {
    ModalService.showModal({
        templateUrl: 'app/modals/general/tpl.general.html',
        controller: "GeneralModalCtrl",
        inputs: {
          title: "My Title",
          message: "Dean is awesome!"
        }
    }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {
            $scope.message = "You said " + result;
            console.log(result);
        });
    });
};
*/
app.controller('GeneralModalCtrl', function($scope, title, message, close){

  $scope.close = function(result) {
  	close(result, 500);
  };

  $scope.message = title+" "+message;

});
