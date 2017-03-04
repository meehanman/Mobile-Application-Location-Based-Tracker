var login  = function() {
    $('#login-output').html("Loading...");
    var settings = {
        "async": true
        , "crossDomain": true
        , "url": "http://192.168.1.134:2110/Token"
        , "method": "POST"
        , "headers": {
            "cache-control": "no-cache"
            , "postman-token": "11525df5-6d62-2b2e-ca7b-d63c78932d3d"
        }
        , "data": "grant_type=password&password=Password.01&username=administrator@eventclouddemo.com"
    }
    var OAuth = null;
    $.ajax(settings).done(function (response) {
        console.log(response);
        $('#login-output').html("OAuth Token: Bearer "+response.access_token);
        //getLocations(response.access_token);
    });
}

var getLocations = function(access_token) {
    var settings = {
        "async": true
        , "crossDomain": true
        , "url": "http://192.168.1.131:2110/api/locations"
        , "method": "GET"
        , "headers": {
            "cache-control": "no-cache"
            , "postman-token": "11525df5-6d62-2b2e-ca7b-d63c78932d3d"
            , "Accept": "text/json"
            , "Authorization": "Bearer " + access_token
        }
        , "data": "grant_type=password&password=Password.01&username=administrator@eventclouddemo.com"
    }
    $.ajax(settings).done(function (response) {
        console.log(response);
    })
}