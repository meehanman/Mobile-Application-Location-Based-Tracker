## Background Service Test App

*Installed by running*

`phonegap run android`

or

`phonegap run ios`

[Note: requires Android SDK to be installed]

This test app was created following the tutorial located

`https://github.com/Red-Folder/bgs-core/wiki/Using-the-MyService-Sample`

from

`https://github.com/Red-Folder/bgs-core/wiki/Using-the-MyService-Sample`

For managing plugins, this was advised? 

`npm i -g plugman`
------


To demonstrate the use of the background service, I provide the MyService plugin sample.

The sample can be installed using the following command (this assumes you are familiar with the [Cordova Android Getting Started] (http://docs.phonegap.com/en/3.3.0/guide_platforms_android_index.md.html#Android%20Platform%20Guide)):

* cordova create hello com.example.hello "HelloWorld"
* cd hello
* cordova platform add android
* cordova plugin add https://github.com/Red-Folder/bgs-sample.git
* Amend the `hello/config.xml`, replace any existing content node with: `<content src="myService.html" />` (add the content node if not already present)
* cordova build

You should be able to run this example.

## Java part explained
The src\com\red_folder\phonegap\plugin\backgroundservice\sample\MyService.java provides the background service.

This class extends the com.red_folder.phonegap.plugin.backgroundservice.BackgroundService class.

The class holds a property to store who it is we are saying hello to (note that in production code, this should be stored in a persistent store):

`private String mHelloTo = "World";`

The class allows the mHelloTo be set via the [setConfig] (setConfig):

```
@Override
protected void setConfig(JSONObject config) {
   try {
      if (config.has("HelloTo"))
         this.mHelloTo = config.getString("HelloTo");
      } catch (JSONException e) {
      }
   }
} 
```

The class allows the mHelloTo value to be provided to the HTML/ Javascript Front-end via [getConfig] (getConfig).  This configuration is made available to the HTML/ Javascript Front-End through the [Returned JSON] (Returned-JSON):

```
@Override
protected JSONObject getConfig() {
   JSONObject result = new JSONObject();
	
   try {
      result.put("HelloTo", this.mHelloTo);
   } catch (JSONException e) {
   }
	
   return result;
}
```

The class provides the background service logic in the [doWork] (doWork).  Notice that the [doWork] (doWork) is not only performing the logic required (in this case it simply prints a Hello World message to the logcat) it also produces a result JSONObject.  This result is made available to the HTML/ Javascript Front-End through the [Returned JSON] (Returned-JSON):

```
@Override
protected JSONObject doWork() {
   JSONObject result = new JSONObject();
		
   try {
      SimpleDateFormat df = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss"); 
      String now = df.format(new Date(System.currentTimeMillis())); 

      String msg = "Hello " + this.mHelloTo + " - its currently " + now;
      result.put("Message", msg);

      Log.d(TAG, msg);
   } catch (JSONException e) {
   }
		
   return result;	
}
```

The Plugman logic automatically adds the service into the Android Manifest (AndroidManifest.xml):

```
<service android:name="com.red_folder.phonegap.plugin.backgroundservice.sample.MyService">
   <intent-filter>
      <action android:name="com.red_folder.phonegap.plugin.backgroundservice.sample.MyService" />
   </intent-filter>
</service>
```

## Javascript part explained
The assets/www/plugins/com.red_folder.phonegap.plugin.backgroundservice.sample/www/myService.js provide the Javascript interface for the MyService background service.

The core Javascript logic is provided by the background service core logic.  This file extends that for the specific background service.

```
var serviceName = 'com.red_folder.phonegap.plugin.backgroundservice.sample.MyService';

var factory = require('com.red_folder.phonegap.plugin.backgroundservice.BackgroundService')
module.exports = factory.create(serviceName);
```

The Plugman logic automatically adds the plugin into the Cordova config (res/xml/config.xml):

```
<feature name="BackgroundServicePlugin">
   <param name="android-package" value="com.red_folder.phonegap.plugin.backgroundservice.BackgroundServicePlugin" />
</feature>
```

## HTML part explained
The Plugman logic automatically creates a reference to the MyService as cordova.plugins.myService.

The HTML/ Javscript front-end (assets/www/myService.html) provides example code on how to use the background service.

Firstly it sets up global variable to the cordova.plugins.myService (this is for convenience - you could just reference the cordova.plugins.myService anywhere I use myService):

```
var myService;
        	
document.addEventListener('deviceready', function() {
   myService = cordova.plugins.myService;;
   getStatus();
}, true);
```

The above waits for the "deviceready" event before setting the myService variable.  This is because we need Cordova to start up correctly and build the cordova.plugins.myService before we can use it.  The code then calls the [getStatus] (getStatus) to retrieve the current status of the background service and update the screen options as appropriate.  Note that we do this first [getStatus] (getStatus) because the background service may already be running or configured from a previous run of the Hello World application.

The rest of the HTML/ Javscript front-end should be fairly self documenting.  The front-end provides you with the ability to toggle on/ off most of the plugin options (start/ stop service, enable/ disable timer, etc) and should give you a good idea of most common jobs.  Note of course that in a production app you will likely chain a number of these methods together to just start the service running - in these cases please remember that the calls are asynchronous (in line with the whole of Cordova/ Phonegap) so you must call the subsequent method on the success callback.

For example, in most cases where you want the service just to always be started, you will probably want something similar to:

```
var myService;
        	
document.addEventListener('deviceready', function() {
   myService = cordova.plugins.myService;;
   go();
}, true);

function go() {
   myService.getStatus(function(r){startService(r)}, function(e){handleError(e)});
};

function startService(data) {
   if (data.ServiceRunning) {
      enableTimer(data);
   } else {
      myService.startService(function(r){enableTimer(r)}, function(e){handleError(e)});
   }
}

function enableTimer(data) {
   if (data.TimerEnabled) {
      allDone();
   } else {
      myService.enableTimer(60000, function(r){allDone(r)}, function(e){handleError(e)});
   }
}

function allDone() {
   alert("Service now running");
}

```