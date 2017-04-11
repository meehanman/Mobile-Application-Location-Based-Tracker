/*
$scope.showModal = function() {
    ModalService.showModal({
        templateUrl: 'app/modals/general/tpl.general.html',
        controller: "GeneralModalCtrl",
        inputs: {
          title: "My Title",
          message: "Dean is awesome!",
          trueOption: "True",
          falseOption: "Fasle"
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
app.controller('GeneralModalCtrl', function($scope, title, message, trueOption, falseOption, close){

  $scope.title = title;
  $scope.message = message;
  $scope.trueOption = trueOption;
  $scope.falseOption = falseOption;

  $scope.close = function(result) {
  	close(result, 500);
  };

});
