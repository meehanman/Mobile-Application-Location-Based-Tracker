// Dictionary of beacons.
var beacons = {};
// Timer that displays list of beacons.
var timer = null;

function startBeaconTracking() {
    // Start tracking beacons!
    //setTimeout(startScan, 1000);
    // Timer that refreshes the display.
    timer = setInterval(updateBeaconList, 1000);

    return startScan();
}

function onBackButtonDown() {
    evothings.eddystone.stopScan();
}

function startScan() {
    console.log("Scanning...", evothings);
    showMessage('Scan in progress.');
    evothings.eddystone.startScan(function (beacon) {
        // Update beacon data.
        beacon.timeStamp = Date.now();
        beacons[beacon.address] = beacon;
        showMessage(JSON.stringify(beacons));
        return beacons;
    }, function (error) {
        showMessage('Eddystone scan error: ' + error);
    });
}
// Map the RSSI value to a value between 1 and 100.
function mapBeaconRSSI(rssi) {
    if (rssi >= 0) return 1; // Unknown RSSI maps to 1.
    if (rssi < -100) return 100; // Max RSSI
    return 100 + rssi;
}

function getSortedBeaconList(beacons) {
    var beaconList = [];
    for (var key in beacons) {
        beaconList.push(beacons[key]);
    }
    beaconList.sort(function (beacon1, beacon2) {
        return mapBeaconRSSI(beacon1.rssi) < mapBeaconRSSI(beacon2.rssi);
    });
    return beaconList;
}

function updateBeaconList() {
    removeOldBeacons();
    displayBeacons();
}

function removeOldBeacons() {
    var timeNow = Date.now();
    for (var key in beacons) {
        // Only show beacons updated during the last 60 seconds.
        var beacon = beacons[key];
        if (beacon.timeStamp + 60000 < timeNow) {
            delete beacons[key];
        }
    }
}

function displayBeacons() {
    var html = '';
    var sortedList = getSortedBeaconList(beacons);
    for (var i = 0; i < sortedList.length; ++i) {
        var beacon = sortedList[i];
        var meeting_room_01 = "64 32 38 32 62 32 39 64 35 66".replace(/ /g, '');;
        var beacon_NID = uint8ArrayToString(beacon.nid).replace(/ /g, '');
        if (beacon_NID == meeting_room_01) {
            beacon.name = "Meeting Room 01";
        }
        var htmlBeacon = '<p>' + htmlBeaconName(beacon) + htmlBeaconURL(beacon) + htmlBeaconNID(beacon) + htmlBeaconBID(beacon) + htmlBeaconEID(beacon) + htmlBeaconVoltage(beacon) + htmlBeaconTemperature(beacon) + htmlBeaconRSSI(beacon) + '</p>';
        html += htmlBeacon
        console.log(beacon);
    }
    $$('#found-beacons').html(html);
}

function htmlBeaconName(beacon) {
    var name = beacon.name || 'no name';
    return '<strong>' + name + '</strong><br/>';
}

function htmlBeaconURL(beacon) {
    return beacon.url ? 'URL: ' + beacon.url + '<br/>' : '';
}

function htmlBeaconURL(beacon) {
    return beacon.url ? 'URL: ' + beacon.url + '<br/>' : '';
}

function htmlBeaconNID(beacon) {
    return beacon.nid ? 'NID: ' + uint8ArrayToString(beacon.nid) + '"  <br/>' : '';
}

function htmlBeaconBID(beacon) {
    return beacon.bid ? 'BID: ' + uint8ArrayToString(beacon.bid) + '<br/>' : '';
}

function htmlBeaconEID(beacon) {
    return beacon.eid ? 'EID: ' + uint8ArrayToString(beacon.eid) + '<br/>' : '';
}

function htmlBeaconVoltage(beacon) {
    return beacon.voltage ? 'Voltage: ' + beacon.voltage + '<br/>' : '';
}

function htmlBeaconTemperature(beacon) {
    return beacon.temperature && beacon.temperature != 0x8000 ? 'Temperature: ' + beacon.temperature + '<br/>' : '';
}

function htmlBeaconRSSI(beacon) {
    return beacon.rssi ? 'RSSI: ' + beacon.rssi + '<br/>' : '';
}

function uint8ArrayToString(uint8Array) {
    function format(x) {
        var hex = x.toString(16);
        return hex.length < 2 ? '0' + hex : hex;
    }
    var result = '';
    for (var i = 0; i < uint8Array.length; ++i) {
        result += format(uint8Array[i]) + ' ';
    }
    return result;
}

function showMessage(text) {
    $$('#message').html(text);
    console.warn("eddy", text);
}
// This calls onDeviceReady when Cordova has loaded everything.
//document.addEventListener('deviceready', onDeviceReady, false);
// Add back button listener (for Android).
//document.addEventListener('backbutton', onBackButtonDown, false);
