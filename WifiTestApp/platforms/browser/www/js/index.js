/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        
        //get a reference to the element
        var btnStartScan = document.getElementById('btnStartScan');
        var btnGetScanResults = document.getElementById('btnGetScanResults');
        var btnListNetworks = document.getElementById("btnListNetworks");
        var output = document.getElementById('output');
        
        //Starting Scan
        btnStartScan.addEventListener('click', function(event) {
            alert("CLICKED");
            output.innerHTML = "<br>" + output.innerHTML + "Starting Scan...";
            WifiWizard.startScan(function(data){
                output.innerHTML = "<br>" + output.innerHTML + JSON.stringify(data);
            },function(data){
                output.innerHTML = "<br>" + output.innerHTML + "Starting Scan... [Failed]";
            });
        });
        
        //Get Scan Results
        btnGetScanResults.addEventListener('click', function(event) {
            output.innerHTML = "<br>" + output.innerHTML + "Getting Scan Results...";
            WifiWizard.getScanResults({numLevels: false}, function(data){
                output.innerHTML = "<br>" + output.innerHTML + JSON.stringify(data);
            },function(data){
                output.innerHTML = "<br>" + output.innerHTML + "Getting Scan Results... [Failed]";
            });
        });      
           
        //List Networks
        btnGetScanResults.addEventListener('click', function(event) {
            output.innerHTML = "<br>" + output.innerHTML + "List Networks...";
            WifiWizard.listNetworks(function(data){
                output.innerHTML = "<br>" + output.innerHTML + JSON.stringify(data);
            },function(data){
                output.innerHTML = "<br>" + output.innerHTML + "List Networks... [Failed]";
            });
        });      
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
