// Initialize app and store it to myApp variable for futher access to its methods
var myApp = new Framework7({
    modalTitle: 'MALBT',
    material: true,
    materialRipple: true,
    animatePages: false,
    init: true,
    template7Pages: true,
    template7Data: {
        date: getTodaysDate(),
        debugCounterLogin: 0,
        auth: {},
        meetings: {},
        locations: {},
        upcomingEvents: []
    }
});
// We need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
// Add view
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});
var authView = myApp.addView('.view-auth');

//Store Global Settings
var settings = {};
settings.host = "https://cloud.dean.technology";

//1 taps of the logo for debugging purposes
$$('.loginLogo').on('click', function() {
    myApp.template7Data.debugCounterLogin++;
    if (myApp.template7Data.debugCounterLogin >= 2) {
        myApp.template7Data.debugCounterLogin = 0;
        $$('#login-username').val("d3an.meehan@hotmail.com");
        $$('#login-password').val("Password");
    }
});
//Send the login details to the server
$$('#login-button').click(function() {
    var username = $$('#login-username').val();
    var password = $$('#login-password').val();
    if (!username || !password) {
        myApp.alert('Please fill in all Registration form fields');
        return;
    }

    console.warn("Login Clicked");

    //Show some sort of indicator
    $$('#login-button').html("Loading...");

    $$.ajax({
        url: settings.host + "/whoami",
        type: "GET",
        contentType: "application/json",
        timeout: 5000,
        headers: {
            'Authorization': "Basic " + btoa(username + ":" + password)
        },
        success: function(data, textStatus, jqXHR) {

            //Sync data between localstorage and template7Data used within the app
            var parsedData = JSON.parse(data);
            parsedData['basic_auth'] = "Basic " + btoa(username + ":" + password);

            window.localStorage['auth'] = JSON.stringify(parsedData);
            myApp.template7Data.auth = parsedData;

            //On login - Load upcoming events
            getUpcomingEvents();

            //Move to main page
            mainView.router.load({
                url: 'index.html',
                context: myApp.template7Data
            });

            //Hide login and show main router
            //This could be moved to ajax:completed etc.
            $$('.view-main').show();
            $$('.view-auth').hide();
        },
        error: function(data, textStatus, jqXHR) {
            if (data.responseText) {
                myApp.alert(JSON.parse(data.responseText).message);
                $$('#login-password').val("");
            } else {
                myApp.alert("Connection Refused. Are you connected to the internet?");
            }
            $$('#login-button').html("LOGIN");
        },
        complete: function() {
            $$('#login-button').html("LOGIN");
        }
    });
});

//Logout
$$(document).on('click', '#logout-button', function() {

    console.log("Logout-button");

    delete window.localStorage['auth'];
    delete myApp.template7Data.auth;

    //Reset template7Data
    myApp.template7Data = {
        date: getTodaysDate(),
        debugCounterLogin: 0,
        auth: {},
        meetings: {},
        locations: {},
        upcomingEvents: []
    }

    if (window.localStorage['auth']) {
        $$('.view-main').show();
        $$('.view-auth').hide();
    } else {
        $$('.view-main').hide();
        $$('.view-auth').show();
    }

    myApp.closePanel(true);
});

//Used to update everything after something is called
$$(document).on('ajax:complete', function(e) {
    if (window.localStorage['auth']) {
        myApp.template7Data.auth = JSON.parse(window.localStorage['auth']);
    }
    if (window.localStorage['auth']) {
        mainView.router.load({
            url: 'index.html',
            context: myApp.template7Data
        });
        $$('.view-main').show();
    } else {
        $$('.view-auth').show();
    }
    $$('body').show();
    console.info("ajax:complete", myApp.template7Data, window.localStorage['auth']);
});
//Used to update everything after something is called
$$(document).on('ajax:start', function(e) {
    //Send Auth header if we have it
    if (myApp.template7Data.auth && myApp.template7Data.auth.basic_auth) {
        e.detail.xhr.setRequestHeader('Authorization', myApp.template7Data.auth.basic_auth);
    }
});
//Check if the user is logged in and apply the login page if needed.
myApp.onPageInit('mainView', function() {
    console.info("mainView.trigger()", myApp.template7Data, window.localStorage['auth']);

    if (window.localStorage['auth']) {
        myApp.template7Data.auth = JSON.parse(window.localStorage['auth']);
        console.log(window.localStorage['auth'], "getUpcomingEvents")
        getUpcomingEvents();
    }

    //Hide everything
    $$('.view-auth').hide();
    $$('.view-main').hide();

    //If logged in show view-main otherwise request a login
    if (window.localStorage['auth']) {
        //$$('.view-main').show();
        getUpcomingEvents(function() {
            mainView.router.load({
                url: 'index.html',
                context: myApp.template7Data
            });
            $$('.view-main').show();
        });

    } else {
        console.log("Auth should show");
        $$('.view-auth').show();
        mainView.router.load({
            pageName: 'auth'
        });

    }
}).trigger();


$$(document).on('click', '#startBeaconTracking', function() {
    mainView.router.load({
        url: 'track.html'
    });
    myApp.closePanel(true);
});

$$(document).on('click', '#btnAbout', function() {
    //getUpcomingEvents();
    mainView.router.load({
        url: 'about.html',
        context: myApp.template7Data
    });
    myApp.closePanel(true);
});

$$(document).on('click', '#btnAddEvent', function() {
    //getUpcomingEvents();
    mainView.router.load({
        url: 'new-event.html',
        context: myApp.template7Data
    });
    myApp.closePanel(true);
});

$$(document).on('click', '#btnRefreshUpcomingEvents', function(){
  getUpcomingEvents();
});


$$(document).on('click', '.upcomingEventrow', function(event) {
    var eventID = $$(this).attr('data-id');
    myApp.template7Data.selectedEventID = eventID;

    $$.ajax({
        url: settings.host + "/event/" + eventID,
        type: "GET",
        contentType: "application/json",
        "crossDomain": true,
        success: function(data, textStatus, jqXHR) {
            data = JSON.parse(data);

            //Preprocessing
            //Get date from 2017-03-08T12:00:00.000Z to 17:00-18:00 31 March 2017
            var start_date = new Date(data.starts_at);
            var end_date = new Date(data.ends_at);
            //0 pad numbers below 10
            var startTimeHours = start_date.getHours() < 10 ? start_date.getHours() + "0" : start_date.getHours();
            var startTimeMinutes = start_date.getMinutes() < 10 ? start_date.getMinutes() + "0" : start_date.getMinutes();
            var endTimeHours = end_date.getHours() < 10 ? end_date.getHours() + "0" : end_date.getHours();
            var endTimeMinutes = end_date.getMinutes() < 10 ? end_date.getMinutes() + "0" : end_date.getMinutes();

            var mon = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Satuday"];

            //Save results
            var dateString = start_date.getDate() + " " + mon[start_date.getMonth()].toUpperCase() + "  " + start_date.getFullYear();
            var timeString = startTimeHours + ":" + startTimeMinutes + "-" + endTimeHours + ":" + endTimeMinutes;
            var dayString = day[start_date.getDay()].substring(0, 3).toUpperCase();

            data.dateTimeString = dayString + ", " + dateString + ", " + timeString;

            //Assign Current Users Status for Picker
            for (var i=0;i<data.attendees.length;i++) {
                console.log("234",data.attendees[i], myApp.template7Data.auth.id);
                if (data.attendees[i]._id == myApp.template7Data.auth.id) {
                    data.myStatus = data.attendees[i].status;
                    console.log("My Status set to ", data.MyStatus);
                }
            }

            //Shorten List for Viewing
            if (data.attendees.length >= 5) {
                data.attendeesList = data.attendees.slice(0, 5);
            } else {
                data.attendeesList = data.attendees;
            }

            //If attendee has no image, assign a placeholder
            for(at in data.attendees){
              if(data.attendees[at].image==undefined){
                data.attendees[at].image = "http://i.pravatar.cc/100?u="+data.attendees[at].name;
              }
            }

            myApp.template7Data.event = data;

            //Get Map.
            myApp.template7Data.event.mapSRC = GMaps.staticMapURL({
                size: [$$(window).width(), 200],
                lat: data.location.gps.x,
                lng: data.location.gps.y,
                zoom: 12,
                markers: [{
                    lat: data.location.gps.x,
                    lng: data.location.gps.y
                }]
            });

            console.log("event load", data, myApp.template7Data);

            mainView.router.load({
                url: 'event.html',
                context: myApp.template7Data
            });
        },
        error: function(data, textStatus, jqXHR) {
            data = JSON.parse(data);
            console.log(data);
            myApp.alert(data.message);
        }
    });

});

$$(document).on('click', '#attendeeList', function(e){
    mainView.router.load({
        url: 'event-attendees.html',
        context: myApp.template7Data.event
    });
});

$$(document).on('click', '#openEventMap', function() {
    mainView.router.load({
        url: 'map.html',
        context: myApp.template7Data
    });
});


myApp.onPageInit('map', function() {
    new GMaps({
        div: '#map',
        lat: myApp.template7Data.event.location.gps.x,
        lng: myApp.template7Data.event.location.gps.y
    });

});

// A button will call this function http://stackoverflow.com/questions/22558441/phonegap-upload-image-to-server-on-form-submit
  //
  $$(document).on('click', '#btnEventPhoto', function(){
    console.log("Event Photo");
    navigator.camera.getPicture(function(ImageURI){
      $$('#smallImage').css("display",'block');
      $$('#smallImage').attr("src",ImageURI);
    }, function(){}, { quality: 50,
      destinationType: navigator.camera.DestinationType.FILE_URI,
      sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY });
  });


myApp.onPageInit('event', function() {

    var statusPlaceholder = "UNKNOWN";
    if(myApp.template7Data.event.myStatus=="accepted"){
      statusPlaceholder = "Going";
    }else if(myApp.template7Data.event.myStatus=="declined"){
      statusPlaceholder = "Can't Go";
    }else if(myApp.template7Data.event.myStatus=="invited"){
      statusPlaceholder = "Invited - Please RSVP";
    }
});




$$(document).on('click', '#btnReturnHome', function() {
    //getUpcomingEvents();
    mainView.router.load({
        url: 'index.html',
        context: myApp.template7Data
    });
    myApp.closePanel(true);
});


$$(document).on('click', '#btnSelectLocation', function() {
    getLocations(function(){
      console.log("Dome");
      mainView.router.load({
          url: 'new-event-location.html',
          context: myApp.template7Data
      });
      myApp.closePanel(true);
    });
});

//Gets upcoming events and saves them to template7Data.upComingEvents
function getLocations(callBack) {
    $$.ajax({
        url: settings.host + "/location",
        type: "GET",
        contentType: "application/json",
        "crossDomain": true,
        success: function(data, textStatus, jqXHR) {
            data = JSON.parse(data);
            myApp.template7Data.locations = data;
            console.log(myApp.template7Data.locations);
            callBack();
        },
        error: function(data, textStatus, jqXHR) {
            console.log(data);
            //myApp.alert(JSON.parse(data.responseText).message);
        }
    });
}

//Gets upcoming events and saves them to template7Data.upComingEvents
function getUpcomingEvents(callBack) {
    $$.ajax({
        url: settings.host + "/user/events",
        type: "GET",
        contentType: "application/json",
        "crossDomain": true,
        success: function(data, textStatus, jqXHR) {
            data = JSON.parse(data);
            for (i in data) {
                //Get date from 2017-03-08T12:00:00.000Z to 17:00-18:00 31 March 2017
                var start_date = new Date(data[i].starts_at);
                var end_date = new Date(data[i].ends_at);
                console.log(data[i])
                //0 pad numbers below 10
                var startTimeHours = start_date.getHours() < 10 ? start_date.getHours() + "0" : start_date.getHours();
                var startTimeMinutes = start_date.getMinutes() < 10 ? start_date.getMinutes() + "0" : start_date.getMinutes();
                var endTimeHours = end_date.getHours() < 10 ? end_date.getHours() + "0" : end_date.getHours();
                var endTimeMinutes = end_date.getMinutes() < 10 ? end_date.getMinutes() + "0" : end_date.getMinutes();

                var mon = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                //Save results
                data[i].dateString = start_date.getDate() + " " + mon[start_date.getMonth()].toUpperCase() + "  " + start_date.getFullYear();
                data[i].timeString = startTimeHours + ":" + startTimeMinutes + "-" + endTimeHours + ":" + endTimeMinutes;

                //Attendees
                for(at in data[i].attendees){
                  if(data[i].attendees[at].image==undefined){
                    data[i].attendees[at].image = "http://i.pravatar.cc/100?u="+data[i].attendees[at].name;
                  }
                }

            }

            //Sort by date
            data = data.sort(function(a, b) {
                return new Date(a.starts_at) - new Date(b.starts_at);
            });
            myApp.template7Data.upcomingEvents = data;
            //Call callback
            if (typeof callBack == 'function') {
                callBack();
            }
            console.log("user/event", (data), myApp.template7Data);
        },
        error: function(data, textStatus, jqXHR) {
            console.log(data);
            //myApp.alert(JSON.parse(data.responseText).message);
        }
    });
}

function getTodaysDate() {
    var d = new Date();
    var mon = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return mon[d.getMonth()].toUpperCase() + " " + d.getDate() + ", " + d.getFullYear();
}

/*
//Pull to fresh for index.html
$$(document).on('ptr:refresh', '.pull-to-refresh-content', function(e) {
    console.log("Pull to refresh","refresh");
    getUpcomingEvents(function(){
        console.log("Pull to refresh","done");
        myApp.pullToRefreshDone();
    });
});
*/
//Start and Stop Tracking
$$(document).on('page:init', '.page[data-page="track"]', function(e) {
    startBeaconTracking();
});
$$(document).on('page:init', '.page[data-page="home"]', function(e) {
    onBackButtonDown();
});


$$(document).on('click', '#getGPS', function(e) {
  $$('#getGPSoutput').html("Loading GPS...");
  getGPS(function(data){
    $$('#getGPSoutput').html(data);
  });
});

$$(document).on('click', '#getWifi', function(e) {
  $$('#getWifioutput').html("Loading Wifi...");
  getWifi(function(data){
    $$('#getWifioutput').html(data);
  });
});

$$(document).on('click','#pollServer', function(e){

  var output = {
    "gps": JSON.parse($$('#getGPSoutput').html()),
    "beacon": [],
    "access_point": JSON.parse($$('#getWifioutput').html())
  };

  $$.ajax({
      url: settings.host + "/poll",
      type: "POST",
      data: JSON.stringify(output),
      dataType: "application/json",
      contentType: "application/json",
      "crossDomain": true,
      success: function(data, textStatus, jqXHR) {
          data = JSON.parse(data);
          console.warn("Poll Response",data);
          $$('#pollServeroutput').html(JSON.stringify(data));
      },
      error: function(data, textStatus, jqXHR) {
          console.log("Error:", data, output);
      }
  });
});

$$(document).on('click', '#poll', function(e) {
  $$('#getWifioutput').html("Loading Wifi...");
  getWifi(function(data){
    $$('#getWifioutput').html(data);
  });
});

function getGPS(callback){
  console.log("Getting GPS Results...");
  navigator.geolocation.getCurrentPosition(function(position){
    var GPSLocation = {
      x:position.coords.latitude,
      y:position.coords.longitude
    };
    console.log("GPS Location:",GPSLocation);
    callback(JSON.stringify(GPSLocation));
  }, function(error){
    console.error("Failed at getting GPS results");
  });

}

function getBeacons(){
    console.log("Getting beacon Results...");
    console.log(startBeaconTracking());
}

function getWifi(callback){
    console.log("Getting Wifi Results...");
    WifiWizard.getScanResults({numLevels: false}, function(data){
        console.log("Wifi Scan Results", data);
        var scanResults = [];
        for(var i=0;i<data.length;i++){
            console.log("<br><div><b>"+data[i].BSSID+"</b>("+data[i].SSID+")</div>");
            scanResults.push(data[i].BSSID);
        }

        callback(JSON.stringify(scanResults));

    },function(data){
        console.error("Failed to get Wifi Scan Results");
    });
}
