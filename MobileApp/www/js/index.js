var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    }, // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    }, // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //Attempt to login automatically
        console.info("Logging in...");
        $('#login-button').click(login);
        //app.receivedEvent('deviceready');
    }, // Update DOM on a Received Event
    receivedEvent: function(id) {
        //TOOD: This could be removed
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
    }
};

document.addEventListener('deviceready', function() {
  console.warn("DEVICEREADY BGS");
  backgroundservice.deviceReady();
}, true);

var backgroundservice = {
    myService: null,
    deviceReady: function() {
        var serviceName = 'technology.dean.backgroundservice.MyService';
        var factory = cordova.require('com.red_folder.phonegap.plugin.backgroundservice.BackgroundService');
        backgroundservice.myService = factory.create(serviceName);
        backgroundservice.go();
    },
    getStatus: function() {
        backgroundservice.myService.getStatus(function(r) {
            backgroundservice.displayResult(r);
        }, function(e) {
            backgroundservice.displayError(e);
        });
    },
    setConfiguration(config){
      config.onLoadValue = "Dean";
      backgroundservice.myService.setConfiguration(config, function(){console.warn("Set config Success");}, function(e){console.warn("Set config Fail",e);});
    },
    displayResult: function(data) {
        console.info("Is service running: " + data.ServiceRunning);
    },
    displayError: function() {
        console.warn("We have an error");
    },
    updateHandler: function(data) {
        if (data.LatestResult != null) {
            try {
                console.warn("BGS updateHandler:", data.LatestResult.Message);
            } catch (err) {}
        }
    },
    go: function() {
        backgroundservice.setConfiguration({"name":"CalledAtGO()"});
        backgroundservice.myService.getStatus(function(r) {
          $$('#toggleService').attr("value","Stop Service");
            backgroundservice.startService(r)
        }, function(e) {
            backgroundservice.displayError(e)
        });
        console.log("Checking status after startService()");
        backgroundservice.getStatus();
    },
    startService: function(data) {
        if (data.ServiceRunning) {
            backgroundservice.enableTimer(data);
        } else {
            backgroundservice.myService.startService(function(r) {
                backgroundservice.enableTimer(r)
            }, function(e) {
                backgroundservice.displayError(e)
            });
        }
    },
    stopService: function(){
      backgroundservice.myService.stopService(function(){console.warn("Set config Success");}, function(e){console.warn("Set config Fail",e);});
    },
    disableTimer: function(){
      backgroundservice.myService.disableTimer(function(){console.warn("Set config Success");}, function(e){console.warn("Set config Fail",e);});
    },
    toggleService: function(){
      backgroundservice.myService.getStatus(function(data) {
        if (data.ServiceRunning) {
            backgroundservice.stopService();
            backgroundservice.disableTimer();
            $$('#toggleService').attr("value","Start Service");
          }else{
            backgroundservice.startService(data);
            backgroundservice.enableTimer(data);
            $$('#toggleService').attr("value","Stop Service");
          }
      }, function(e) {
          backgroundservice.displayError(e)
      });
    },
    enableTimer: function(data) {
        if (data.TimerEnabled) {
            backgroundservice.registerForUpdates(data);
        } else {
            backgroundservice.myService.enableTimer(15*60000, function(r) {
                backgroundservice.registerForUpdates(r)
            }, function(e) {
                backgroundservice.displayError(e)
            });
        }
    },
    registerForUpdates: function(data) {
        if (!data.RegisteredForUpdates) {
            backgroundservice.myService.registerForUpdates(function(r) {
                backgroundservice.updateHandler(r)
            }, function(e) {
                backgroundservice.handleError(e)
            });
        }
    }
}
