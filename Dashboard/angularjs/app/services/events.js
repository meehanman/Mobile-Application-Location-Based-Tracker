app.factory('Events', ['$rootScope', '$http', function($rootScope, $http){
var events;

var get = function(callback){
  $http.get('https://cloud.dean.technology/event/all').then(function(events){
    events = events.data;
    callback(events);
  }, function(fail){
    console.log("Failed to get Events",fail);
    callback(fail);
  });
}

var getUpcoming = function(callback){
  $http.get('https://cloud.dean.technology/event/upcoming').then(function(events){
    events = events.data;
    callback(events);
  }, function(fail){
    console.log("Failed to get Events",fail);
    callback(fail);
  });
}

var getPrevious = function(callback){
  $http.get('https://cloud.dean.technology/event/previous').then(function(events){
    events = events.data;
    callback(events);
  }, function(fail){
    console.log("Failed to get Events",fail);
    callback(fail);
  });
}

var add = function(eventObject, callback){
  //String attendees to array of userID's
  var temp=[];
  for(var i=0;i<eventObject.attendees.length;i++){
    temp.push(eventObject.attendees[i].id);
  }
  eventObject.attendees = JSON.stringify(temp);
  $http({
    method: 'POST',
    url: 'https://cloud.dean.technology/event',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
    },
    data: eventObject
  }).then(function(data){
    callback(data);
  }, function(fail){
    console.log("Failed to add user",fail);
    callback(fail);
  });
}

var del = function(id, callback){
    $http.delete('https://cloud.dean.technology/event/'+id).then(function(success){
      callback(success);
    }, function(fail){
      callback(fail);
    });
  }

  var updateStatus = function(id, status, callback){
    $http.put('https://cloud.dean.technology/event/'+id+'/'+status).then(function(success){
      callback(success);
    }, function(fail){
      callback(fail);
    });
  }

return{
  get, add, del, getUpcoming, getPrevious, updateStatus
}

}]);
