app.controller('DashboardCtrl', function($scope){
    $scope.message = "From Dean Meehan. I'm in home.js";

       // === Prepare the chart data ===/
  	var sin = [], cos = [];
      for (var i = 0; i < 50; i += 0.25) {
          sin.push([i, Math.sin(i)]);
          cos.push([i, Math.cos(i)]);
      }

  $scope.dataset = [{ data: sin, label: "sin(x)", color: "#ee7951"}, { data: cos, label: "cos(x)",color: "#4fb9f0" }];
   $scope.options = {
             series: {
                 lines: { show: true },
                 points: { show: true }
             },
             grid: { hoverable: true, clickable: true },
             yaxis: { min: -1.6, max: 1.6 }
     };

});
