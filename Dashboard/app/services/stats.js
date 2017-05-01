app.factory('Stats', ['$rootScope', '$http', function($rootScope, $http) {

    var location = function(id, callback) {
        $http.get('https://cloud.dean.technology/stats/location/' + id).then(function(user) {
            callback(user);
        }, function(fail) {
            callback(fail);
        });
    }

    return {
        location: location
    }

}]);
