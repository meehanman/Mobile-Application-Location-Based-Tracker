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
        upcomingEvents: [],
        newEvent: {}
    }
});
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});
var authView = myApp.addView('.view-auth');

$$(document).on('deviceready', function() {
    console.info("Your Device is Ready Dean!");
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

            $$('login-password').val("");

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
    } else {
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
    //Reset saved fields
    myApp.template7Data.newEvent = {};

    mainView.router.load({
        url: 'app/pages/new-event.html',
        context: myApp.template7Data
    });
    myApp.closePanel(true);
});

$$(document).on('click', '#btnRefreshUpcomingEvents', function() {
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

            data.timeString = moment(data.starts_at).format('HH:mm') + "-" + moment(data.ends_at).format('HH:mm');
            data.dateString = moment(data.starts_at).format('D MMMM YYYY');

            data.dateTimeString = data.timeString + " " + data.dateString;

            for (var i = 0; i < data.attendees.length; i++) {
                //Assign color for rings
                if (data.attendees[i].status == "accepted") {
                    data.attendees[i].color = "#5cb85c";
                } else if (data.attendees[i].status == "declined") {
                    data.attendees[i].color = "#ad3a3a";
                } else {
                    data.attendees[i].color = "#a5a5a5";
                }

                //Get Current Users Option
                if (myApp.template7Data.auth.id == data.attendees[i].user._id) {

                    //Set button color
                    if (data.attendees[i].status == 'accepted') {
                        data.userChoiceColor = "green";
                    } else if (data.attendees[i].status == 'declined') {
                        data.userChoiceColor = "red";
                    }

                    //Set Button Text
                    if (data.attendees[i].status == 'accepted') {
                        data.userChoice = "Accepted";
                    } else if (data.attendees[i].status == 'declined') {
                        data.userChoice = "Declined";
                    } else if (data.attendees[i].status == 'invited') {
                        data.userChoice = "Please respond";
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

$$(document).on('click', '#attendeeList', function(e) {
    mainView.router.load({
        url: 'app/pages/event-attendees.html',
        context: myApp.template7Data.event
    });
});

$$(document).on('click', '#btnEventPhoto', function() {
    console.log("Event Photo");
    navigator.camera.getPicture(function(ImageURI) {
        if (ImageURI != undefined || ImageURI != null) {

            myApp.template7Data.newEvent.image = "data:image/jpeg;base64," + ImageURI;
            myApp.template7Data.newEvent.imageSet = true;

            $$('#smallImage').css("display", 'block');
            $$('#smallImage').attr("src", myApp.template7Data.newEvent.image);


            console.log(myApp.template7Data.newEvent);
        }
    }, function() {}, {
        quality: 50,
        destinationType: navigator.camera.DestinationType.DATA_URL,
        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
    });
});



$$(document).on('click', '#btnReturnHome', function() {
    openHome();
    myApp.closePanel(true);
});

$$(document).on('click', '#btnSelectLocation', function() {
    syncNewEvent();
    getLocations(function() {
        console.log("btnSelectLocation Done", myApp.template7Data);
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
    getGPS(function(data) {
        $$('#getGPSoutput').html(data);
    });
});

$$(document).on('click', '#getWifi', function(e) {
    $$('#getWifioutput').html("Loading Wifi...");
    getWifi(function(data) {
        $$('#getWifioutput').html(data);
    });
});

$$(document).on('click', '#pollServer', function(e) {

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
            console.warn("Poll Response", data);
            $$('#pollServeroutput').html(JSON.stringify(data));
        },
        error: function(data, textStatus, jqXHR) {
            console.log("Error:", data, output);
        }
    });
});

$$(document).on('click', '#setConfig', function(e) {
    backgroundservice.setConfiguration({
        "authentication": myApp.template7Data.auth.basic_auth
    });
});

$$(document).on('click', '#toggleService', function(e) {
    backgroundservice.toggleService();
});

var openMap = function(lat, lon) {
    console.log("mapOpen", lat, lon);
    launchnavigator.navigate([lat, lon]);
};

$$(document).on('click', '#poll', function(e) {
    $$('#getWifioutput').html("Loading Wifi...");
    getWifi(function(data) {
        $$('#getWifioutput').html(data);
    });
});

$$(document).on('click', '.toggle-userChoice', function() {
    mainView.router.load({
        url: 'app/pages/event-choose-status.html',
        context: myApp.template7Data
    });
});

/** Change the status of an event **/
var eventStatus = function(status) {
    $$.ajax({
        url: "https://cloud.dean.technology/event/" + myApp.template7Data.event._id + "/" + status,
        type: "PUT",
        contentType: "application/json",
        "crossDomain": true,
        success: function(data, textStatus, jqXHR) {

            if (status == "accepted") {
                myApp.template7Data.event.userChoiceColor = "green";
                myApp.template7Data.event.userChoice = "Accepted"
            } else if (status == "declined") {
                myApp.template7Data.event.userChoiceColor = "red";
                myApp.template7Data.event.userChoice = "Declined";
            }


            mainView.router.load({
                url: 'app/pages/event.html',
                context: myApp.template7Data
            });
        },
        error: function(data, textStatus, jqXHR) {
            console.log("Error Settings userchoice", data);
            alert("Error setting status.");
        }
    });
};

var selectLocation = function(locID, name) {
    myApp.template7Data.newEvent.location = locID;
    myApp.template7Data.newEvent.locationName = name;
    mainView.router.load({
        url: 'app/pages/new-event.html',
        context: myApp.template7Data
    });
}

var addEvent = function() {
    console.log("Add Event", ":00.000Z", myApp.template7Data.newEvent);
    var temp = myApp.template7Data.newEvent;
    if (!myApp.template7Data.newEvent.name ||
        !myApp.template7Data.newEvent.description ||
        !myApp.template7Data.newEvent.starts_at ||
        !myApp.template7Data.newEvent.ends_at ||
        !myApp.template7Data.newEvent.image ||
        !myApp.template7Data.newEvent.attendees ||
        myApp.template7Data.newEvent.attendees.length == 0 ||
        !myApp.template7Data.newEvent.location ||
        !myApp.template7Data.newEvent.type) {
        alert("Validation Failed. Please enter all fields");
        return false;
    }

    //Remove Helpers
    delete myApp.template7Data.newEvent.imageSet;
    delete myApp.template7Data.newEvent.attendeeNames;

    //Append MS to JSON type format
    myApp.template7Data.newEvent.starts_at = myApp.template7Data.newEvent.starts_at + ":00.000Z";
    myApp.template7Data.newEvent.ends_at = myApp.template7Data.newEvent.ends_at + ":00.000Z";

    myApp.template7Data.newEvent.attendees = JSON.stringify(myApp.template7Data.newEvent.attendees);

    var form_data = [];
    for (var p in myApp.template7Data.newEvent)
        //encodeURIComponent
        form_data.push((p) + "=" + (myApp.template7Data.newEvent[p]));
    form_data = form_data.join("&");


    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log("EVENT ADDED",this);
        alert("Event Added");
        mainView.router.load({
            url: 'index.html',
            context: myApp.template7Data
        });
      }else{
        console.log("showUserSelectScreen ERROR", data);
        alert("Error Adding Event");
        myApp.template7Data.newEvent=temp;
      }
    });

    xhr.open("POST", "https://cloud.dean.technology/event");
    xhr.setRequestHeader("authorization", myApp.template7Data.auth.basic_auth);
    xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("cache-control", "no-cache");

    xhr.send(form_data);
}

var showUserSelectScreen = function() {
    syncNewEvent();
    console.log("Select Users", myApp.template7Data.newEvent);
    $$.ajax({
        url: "https://cloud.dean.technology/user/all",
        type: "GET",
        contentType: "application/json",
        "crossDomain": true,
        success: function(data, textStatus, jqXHR) {
            data = JSON.parse(data);
            myApp.template7Data.allUsers = data;
            mainView.router.load({
                url: 'app/pages/new-event-attendees.html',
                context: myApp.template7Data
            });
        },
        error: function(data, textStatus, jqXHR) {
            console.log("showUserSelectScreen ERROR", data);
        }
    });
}

var saveAttendees = function() {
    var attendeeListNames = [];
    var attendeeListID = [];
    for (var i = 0; i < document.getElementById('attendeeList').options.length; i++) {
        if (document.getElementById('attendeeList').options[i].selected) {
            attendeeListID.push(document.getElementById('attendeeList').options[i].value);
            attendeeListNames.push(document.getElementById('attendeeList').options[i].text);
        }
    }
    myApp.template7Data.newEvent.attendees = attendeeListID;
    myApp.template7Data.newEvent.attendeeNames = attendeeListNames;
    console.log(myApp.template7Data.newEvent);

    mainView.router.load({
        url: 'app/pages/new-event.html',
        context: myApp.template7Data
    });
    myApp.closePanel(true);
}

var syncNewEvent = function() {
    myApp.template7Data.newEvent.name = document.getElementById('new-event-field-name').value;
    myApp.template7Data.newEvent.description = document.getElementById('new-event-field-description').value;
    for (var i = 0; i < document.getElementById('new-event-field-type').options.length; i++) {
        if (document.getElementById('new-event-field-type').options[i].selected) {
            myApp.template7Data.newEvent.type = document.getElementById('new-event-field-type').options[i].value;
        }
    }
    myApp.template7Data.newEvent.starts_at = document.getElementById('new-event-field-starts_at').value;
    myApp.template7Data.newEvent.ends_at = document.getElementById('new-event-field-ends_at').value;
}

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
            console.log("getLocations ERROR", data);
        }
    });
}

//Gets upcoming events and saves them to template7Data.upComingEvents
function openHome() {
    console.log("openHome");
    $$.ajax({
        url: "https://cloud.dean.technology/event/upcoming",
        type: "GET",
        contentType: "application/json",
        "crossDomain": true,
        success: function(data, textStatus, jqXHR) {
            data = JSON.parse(data);
            console.log("GetUpcomingEvnts", data);
            for (var i = 0; i < data.length; i++) {
                data[i].timeString = moment(data[i].starts_at).format('HH:mm') + "-" + moment(data[i].ends_at).format('HH:mm');
                data[i].dateString = moment(data[i].starts_at).format('D MMMM YYYY');
                data[i].attendees = data[i].attendees.slice(0, 5);
            }

            myApp.template7Data.upcomingEvents = data;

            //Begin Polling Service
            //Backgorund Service for Wifi
            backgroundservice.deviceReady();
            console.log("Setting backgroundservice config to:"+myApp.template7Data.auth.basic_auth);

            //Run every minute when open
            foregroundTracking();
            setInterval(foregroundTracking, 60 * 1000);

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

function foregroundTracking(){
  console.info("foregroundTracking Started()");
  getGPS(function(gps){
    //getBeacons(function(beacons){
      getWifi(function(bssid){
        console.log(gps,beacons,bssid);
      });
    //});
  })
}

function getTodaysDate() {
    var d = new Date();
    var mon = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return mon[d.getMonth()].toUpperCase() + " " + d.getDate() + ", " + d.getFullYear();
}

function getGPS(callback) {
    console.log("Getting GPS Results...");
    navigator.geolocation.getCurrentPosition(function(position) {
        var GPSLocation = [position.coords.latitude, position.coords.longitude]
        console.log("GPS Location:", GPSLocation);
        callback(JSON.stringify(GPSLocation));
    }, function(error) {
        console.error("Failed at getting GPS results");
    });

}

function getBeacons() {
    console.log("Start Beacon Tracking Called", startBeaconTracking());
}

function getWifi(callback) {
    console.log("Getting Wifi Results...");
    WifiWizard.getScanResults({
        numLevels: false
    }, function(data) {
        console.log("Wifi Scan Results", data);
        var scanResults = [];
        for (var i = 0; i < data.length; i++) {
            console.log("<br><div><b>" + data[i].BSSID + "</b>(" + data[i].SSID + ")</div>");
            scanResults.push(data[i].BSSID);
        }

        callback(JSON.stringify(scanResults));

    }, function(data) {
        console.error("Failed to get Wifi Scan Results");
    });
}
