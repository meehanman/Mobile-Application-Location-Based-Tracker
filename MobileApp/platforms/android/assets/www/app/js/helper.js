var $$ = Dom7;
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
var mainView = myApp.addView('.view-main', {dynamicNavbar: true});
var authView = myApp.addView('.view-auth');

$$(document).on('deviceready',function(){
  console.info("deviceready.mainView.init");
  if (window.localStorage['auth']) {
      myApp.template7Data.auth = JSON.parse(window.localStorage['auth']);
      openHome();
      $$('.view-main').show();
      $$('.view-auth').hide();
  } else {
      $$('.view-main').hide();
      $$('.view-auth').show();
  }
  $$('body').show();
});

myApp.onPageInit('map', function() {
    new GMaps({
        div: '#map',
        lat: myApp.template7Data.event.location.gps.x,
        lng: myApp.template7Data.event.location.gps.y
    });

});

//Send the login details to the server
$$(document).on('click', '#login-button', function() {
    console.log("login-button clicked");
    var username = $$('#login-username').val();
    var password = $$('#login-password').val();
    if (!username || !password) {
        myApp.alert('Please fill in all Registration form fields');
        return;
    }

    //Show some sort of indicator
    $$('#login-button').html("Loading...");

    $$.ajax({
        url: "https://cloud.dean.technology/whoami",
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
            openHome();

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

  });

//Used to update everything after something is called
$$(document).on('ajax:start', function(e) {
    console.log("ajax:start");
    //Send Auth header if we have it
    if (myApp.template7Data.auth && myApp.template7Data.auth.basic_auth) {
        e.detail.xhr.setRequestHeader('Authorization', myApp.template7Data.auth.basic_auth);
        e.detail.xhr.setRequestHeader('Test', 'ThisTestIsAwesome');
    }else{
      console.log("No Auth Data", myApp.template7Data.auth, myApp.template7Data.auth.basic_auth);
    }
});

$$(document).on('click', '#startBeaconTracking', function() {
    mainView.router.load({
        url: 'app/pages/track.html'
    });
    myApp.closePanel(true);
});

$$(document).on('click', '#btnAbout', function() {
    mainView.router.load({
        url: 'app/pages/about.html',
        context: myApp.template7Data
    });
    myApp.closePanel(true);
});

$$(document).on('click', '#btnAddEvent', function() {
    mainView.router.load({
        url: 'app/pages/new-event.html',
        context: myApp.template7Data
    });
    myApp.closePanel(true);
});

$$(document).on('click', '#btnRefreshUpcomingEvents', function(){
  openHome();
});

$$(document).on('click', '.upcomingEventrow', function(event) {
    var eventID = $$(this).attr('data-id');
    myApp.template7Data.selectedEventID = eventID;

    $$.ajax({
        url: "https://cloud.dean.technology/event/" + eventID,
        type: "GET",
        contentType: "application/json",
        "crossDomain": true,
        success: function(data, textStatus, jqXHR) {
            data = JSON.parse(data);

            data.timeString = moment(data.starts_at).format('HH:mm')+"-"+moment(data.ends_at).format('HH:mm');
            data.dateString = moment(data.starts_at).format('D MMMM YYYY');

            data.dateTimeString = data.timeString+" "+data.dateString;

            for(var i=0;i<data.attendees.length;i++){
              //Assign color for rings
              if(data.attendees[i].status=="accepted"){
                data.attendees[i].color="#5cb85c";
              }else if(data.attendees[i].status=="declined"){
                data.attendees[i].color="#ad3a3a";
              }else{
                data.attendees[i].color="#a5a5a5";
              }

              //Get Current Users Option
              if(myApp.template7Data.auth.id==data.attendees[i].user._id){
                  if(data.attendees[i].status=='accepted'){
                      data.userAccept="Accepted";
                  }else if(data.attendees[i].status=='declined'){
                    data.userAccept="Declined";
                  }
              }
            }

            //Shorten List for Viewing
            data.attendeesList = data.attendees.slice(0, 5);

            myApp.template7Data.event = data;

            //Get Map.
            myApp.template7Data.event.mapSRC = GMaps.staticMapURL({
                size: [$$(window).width(), 200],
                lat: data.location.gps[0],
                lng: data.location.gps[1],
                zoom: 12,
                markers: [{
                    lat: data.location.gps[0],
                    lng: data.location.gps[1]
                }]
            });

            console.log("event load", data, myApp.template7Data);

            mainView.router.load({
                url: 'app/pages/event.html',
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
        url: 'app/pages/event-attendees.html',
        context: myApp.template7Data.event
    });
});

$$(document).on('click', '#btnEventPhoto', function(){
  console.log("Event Photo");
  navigator.camera.getPicture(function(ImageURI){
    $$('#smallImage').css("display",'block');
    $$('#smallImage').attr("src",ImageURI);
  }, function(){}, { quality: 50,
    destinationType: navigator.camera.DestinationType.FILE_URI,
    sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY });
});

$$(document).on('click', '#btnReturnHome', function() {
    openHome();
    myApp.closePanel(true);
});

$$(document).on('click', '#btnSelectLocation', function() {
    getLocations(function(){
      console.log("Dome");
      mainView.router.load({
          url: 'app/pages/new-event-location.html',
          context: myApp.template7Data
      });
      myApp.closePanel(true);
    });
});

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
      url: "https://cloud.dean.technology/poll",
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

$$(document).on('click','#setConfig', function(e){
  backgroundservice.setConfiguration({"name":"DDean-new"});
});

$$(document).on('click','#toggleService',function(e){
  backgroundservice.toggleService();
});

var openMap = function(lat,lon){
    console.log("mapOpen",lat, lon);
    launchnavigator.navigate([lat, lon]);
};

$$(document).on('click', '#poll', function(e) {
  $$('#getWifioutput').html("Loading Wifi...");
  getWifi(function(data){
    $$('#getWifioutput').html(data);
  });
});

//Gets upcoming events and saves them to template7Data.upComingEvents
function getLocations(callBack) {
    $$.ajax({
        url: "https://cloud.dean.technology/location",
        type: "GET",
        contentType: "application/json",
        "crossDomain": true,
        success: function(data, textStatus, jqXHR) {
            data = JSON.parse(data);
            myApp.template7Data.locations = data;
            callBack();
        },
        error: function(data, textStatus, jqXHR) {
            console.log("getLocations ERROR",data);
        }
    });
}

//Gets upcoming events and saves them to template7Data.upComingEvents
function openHome(){
  console.log("openHome");
  $$.ajax({
      url: "https://cloud.dean.technology/event/upcoming",
      type: "GET",
      contentType: "application/json",
      "crossDomain": true,
      success: function(data, textStatus, jqXHR) {
          data = JSON.parse(data);
          console.log("GetUpcomingEvnts",data);
          for (var i=0; i<data.length;i++) {
            data[i].timeString = moment(data[i].starts_at).format('HH:mm')+"-"+moment(data[i].ends_at).format('HH:mm');
            data[i].dateString = moment(data[i].starts_at).format('D MMMM YYYY');
            data[i].attendees = data[i].attendees.slice(0, 5);
          }

          myApp.template7Data.upcomingEvents = data;

          mainView.router.load({
              url: 'index.html',
              context: myApp.template7Data
          });
      },
      error: function(data, textStatus, jqXHR) {
          console.log("Upcoming Events Failure", data);
      }
  });
}

function getTodaysDate() {
    var d = new Date();
    var mon = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return mon[d.getMonth()].toUpperCase() + " " + d.getDate() + ", " + d.getFullYear();
}

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
