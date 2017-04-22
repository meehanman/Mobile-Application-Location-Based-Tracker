var Events = {
    get: function(callback) {
        $http.get('https://cloud.dean.technology/event/all').then(function(events) {
            callback(events);
        }, function(fail) {
            callback(fail);
        });
    }
}
