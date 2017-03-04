// Initialize app and store it to myApp variable for futher access to its methods
var myApp = new Framework7({
    modalTitle: 'EventMap'
    , material: true
    , materialRipple: true
    , init: true
    , template7Pages: true
    , template7Data: {
        debugCounterLogin: 0
        , auth: {}
        , meetings: {}
        , rooms: {}
    }
});
// We need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
// Add view
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});
var authView = myApp.addView('.view-auth');

//5 taps of the logo for debugging purposes
$$('.loginLogo').on('click', function () {
    myApp.template7Data.debugCounterLogin++;
    if (myApp.template7Data.debugCounterLogin >= 5) {
        myApp.template7Data.debugCounterLogin = 0;
        $$('#login-username').val("administrator@eventclouddemo.com");
        $$('#login-password').val("Password.01");
        //Login URL Changes
        //$$('#login-url').val("192.168.1.134");
        $$('#login-url').val("localhost");
    }
});
//Send the login details to the server
$$('#login-button').click(function () {
    var username = $$('#login-username').val();
    var password = $$('#login-password').val();
    var loginUrl = $$('#login-url').val();
    $$('#login-button').html("Loading...");
    if (!username || !password || !loginUrl) {
        myApp.alert('Please fill in all Registration form fields');
        return;
    }
    //Show some sort of indicator
    $$.ajax({
        url: "http://" + loginUrl + ":2110" + "/Token"
        , type: "POST"
        , contentType: "application/json"
        , timeout: 5000
        , data: "grant_type=password&password=" + password + "&username=" + username
        , success: function (data, textStatus, jqXHR) {
            var parsedData = JSON.parse(data);
            parsedData['authUrl'] = loginUrl;
            $$('#login-username').val("");
            $$('#login-password').val("");
            $$('#login-url').val("");
            window.localStorage['auth'] = JSON.stringify(parsedData);
            myApp.template7Data.auth = parsedData;
            mainView.router.load({
                url: 'index.html'
                , context: myApp.template7Data
            });
        }
        , error: function (data, textStatus, jqXHR) {
            if (data.responseText) {
                myApp.alert(JSON.parse(data.responseText).error_description);
                $$('#login-password').val("");
            }else{
                myApp.alert("Connection Refused. Are you connected to the internet?");
            }
            $$('#login-button').html("LOGIN");
        }
        , complete: function () {
            $$('#login-button').html("LOGIN");
        }
    });
});

//Logout
$$(document).on('click', '#logout-button', function () {
    console.log("delete");
    delete window.localStorage['auth'];
    delete myApp.template7Data.auth;
    if (window.localStorage['auth']) {
        $$('.view-main').show();
        $$('.view-auth').hide();
    }
    else {
        $$('.view-main').hide();
        $$('.view-auth').show();
    }
});

//Used to update everything after something is called
$$(document).on('ajax:complete', function (e) {
    if (window.localStorage['auth']) {
        myApp.template7Data.auth = JSON.parse(window.localStorage['auth']);
    }
    if (window.localStorage['auth']) {
        mainView.router.load({
            url: 'index.html'
            , context: myApp.template7Data
        });
        $$('.view-main').show();
    }
    else {
        $$('.view-auth').show();
    }
    $$('body').show();
    console.info("ajax:complete", myApp.template7Data, window.localStorage['auth']);
});

//Check if the user is logged in and apply the login page if needed.
myApp.onPageInit('mainView', function () {
    console.info("mainView.trigger()", myApp.template7Data, window.localStorage['auth']);
    if (window.localStorage['auth']) {
        myApp.template7Data.auth = JSON.parse(window.localStorage['auth']);
    }
    $$('.view-auth').hide();
    $$('.view-main').hide();
    if (window.localStorage['auth']) {
        //$$('.view-main').show();
        mainView.router.load({
            url: 'index.html'
            , context: myApp.template7Data
        });
        $$('.view-main').show();
    }
    else {
        mainView.router.load({
            pageName: 'auth'
        });
        $$('.view-auth').show();
    }
}).trigger();

//View Meetings Button
$$(document).on('click', '#loadMeetings', function () {
    var loginUrl = myApp.template7Data.auth.authUrl;
    var access_token = myApp.template7Data.auth.access_token;
    console.log(loginUrl, access_token, "loadMeetings")
        //Show some sort of indicator
    $$.ajax({
        url: "http://" + loginUrl + ":2110" + "/api/meetings/all"
        , type: "GET"
        , contentType: "application/json"
        , "crossDomain": true
        , "headers": {
            "Authorization": "Bearer " + access_token
        }
        , success: function (data, textStatus, jqXHR) {
            console.log(data);
            myApp.template7Data.meetings = JSON.parse(data);
            mainView.router.load({
                url: 'meetings.html'
                , context: myApp.template7Data.meetings
            });
        }
        , error: function (data, textStatus, jqXHR) {
            console.log(data);
            myApp.alert(JSON.parse(data.responseText).error_description);
        }
    });
});
$$(document).on('click', '#loadRooms', function () {
    var loginUrl = myApp.template7Data.auth.authUrl;
    var access_token = myApp.template7Data.auth.access_token;
    console.log(loginUrl, access_token, "loadMeetings")
        //Show some sort of indicator
    $$.ajax({
        url: "http://" + loginUrl + ":2110" + "/api/rooms"
        , type: "GET"
        , contentType: "application/json"
        , "crossDomain": true
        , "headers": {
            "Authorization": "Bearer " + access_token
        }
        , success: function (data, textStatus, jqXHR) {
            console.log(data);
            myApp.template7Data.rooms = JSON.parse(data);
            mainView.router.load({
                url: 'rooms.html'
                , context: myApp.template7Data.rooms
            });
        }
        , error: function (data, textStatus, jqXHR) {
            console.log(data);
            myApp.alert(JSON.parse(data.responseText).error_description);
        }
    });
});
$$(document).on('click', '#startBeaconTracking', function () {
    mainView.router.load({
        url: 'track.html'
    });
});
$$(document).on('page:init', '.page[data-page="track"]', function (e) {
    //myApp.alert("Entered Tracking State");
    startBeaconTracking();
});
$$(document).on('page:init', '.page[data-page="home"]', function (e) {
    onBackButtonDown();
});