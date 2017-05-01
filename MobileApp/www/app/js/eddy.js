// Dictionary of beacons.
var beacons = {};
// Timer that displays list of beacons.
var timer = null;
var scanActive = false

function stopBeaconTracking() {
    setTimeout(evothings.eddystone.stopScan, 0);
}

function startScan() {
    console.log("BLE startScan Scanning...", evothings);
    if (scanActive) {
        console.log("Scan already active");
        return beacons;
    } else {
        evothings.eddystone.startScan(function(beacon) {
            scanActive = true;
            beacon.timeStamp = Date.now();
            beacons[beacon.address] = beacon;
        }, function(error) {
            console.log('Eddystone scan error: ' + error);
            return undefined;
        });
        return beacons;
    }
}


function getSortedBeaconList(beacons) {
    var beaconList = [];
    for (var key in beacons) {
        beaconList.push(beacons[key]);
    }
    beaconList.sort(function(beacon1, beacon2) {
        return mapBeaconRSSI(beacon1.rssi) < mapBeaconRSSI(beacon2.rssi);
    });
    return beaconList;
}
