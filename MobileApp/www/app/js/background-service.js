var backgroundservice = {
    myService: null,
    deviceReady: function() {
        console.log("backgroundservice deviceReady technology.dean.backgroundservice.MyService.create().go()");
        var serviceName = 'technology.dean.backgroundservice.MyService';
        var factory = cordova.require('com.red_folder.phonegap.plugin.backgroundservice.BackgroundService');

        backgroundservice.myService = factory.create(serviceName);

        backgroundservice.go();
    },
    go: function() {
        backgroundservice.myService.getStatus(function(r) {
          console.log(r);
            backgroundservice.startService(r)
        }, function(e) {
          console.log("Error",e);
          backgroundservice.displayError(e)
        });
        console.log("Checking status after startService()");
        backgroundservice.getStatus();
    },
    getStatus: function() {
        backgroundservice.myService.getStatus(function(r) {
          console.log(r);
            backgroundservice.displayResult(r);
        }, function(e) {
          console.log(r);
            backgroundservice.displayError(e);
        });
    },
    setConfiguration(config){
      console.info("setConfiguration",config);
      backgroundservice.myService.setConfiguration(config,
        function(r){
          console.log(r);
        }, function(e){
          console.warn("Set config Fail",config,e);
        });
    },
    displayResult: function(data) {
        console.info("displayResult","Is service running: " + data.ServiceRunning);
    },
    displayError: function() {
        console.warn("displayError","We have an error");
    },
    updateHandler: function(data) {
        if (data.LatestResult != null) {
            try {
                backgroundservice.setConfiguration({"authentication": myApp.template7Data.auth.basic_auth});
                console.info("BGS updateHandler:", data.LatestResult);
                myApp.template7Data.serviceStatus = data;
                console.log("Traffix",myApp.template7Data.serviceStatus);
            } catch (err) {}
        }
    },
    startService: function(data) {
        if (data.ServiceRunning) {
            backgroundservice.enableTimer(data);
        } else {
            backgroundservice.myService.startService(function(r) {
                console.log(r);
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
            backgroundservice.myService.enableTimer(300000, function(r) {
                backgroundservice.registerForUpdates(r)
            }, function(e) {
                backgroundservice.displayError(e)
            });
            //BootStart
            backgroundservice.myService.registerForBootStart(function(e){
              console.log("BOOT SUCCESS");
            },function(e){
              console.log("NO BOOT SUCCESS");
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
