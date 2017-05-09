
# MALBT Server

This server provides a restful api interface for the MALBT dashboard running on
the url <https://cloud.dean.technology>

## Server Install Instructions

Server is setup to run on digital ocean Ubuntu Droplet

Install NodeJS
`sudo apt-get install nodejs`

Install NPM
`sudo apt-get install npm`

Install MongoDB
`https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-16-04`

Install Supervisor
`sudo apt-get install npm`

Install NPM Requirements from package.json

Security setup with Basic Authentication over TLS/HTTPS using (apache and nodejs)[https://gist.github.com/meehanman/005d6d942c8979fb68356c688ea2459a]

HTTPS certificates for TLS/SSL provided by LetsEncrypt with this (tutorial)[https://www.digitalocean.com/community/tutorials/how-to-secure-apache-with-let-s-encrypt-on-ubuntu-14-04]


## API Reference


All API requests require authentication by a user. Some users with admin privileges
will have access to greater information and additional calls that will be detailed
in the documentation.

The content type of the API calls for `POST` requests should be specified to
`x-www-form-encoded` and may be left in for all requests.

`Content-Type application/x-www-form-urlencoded`

All requests are returned in **JSON**.

---
## Authentication

Authentication is handled using "Basic Authentication" header type. All requests
shall be sent with this header or the request will be denied.

The basic authentication header is structures with the word "Basic " followed by
a base64 encoding of "username:password". For example the header would be formatted
as follows.

`Authorization: Basic ZDNhbi4353FdsfdFAaG90bWFpbC5jDf43SDWFAdvcmQ=`

This is **NOT** encryption or a hashing function and it is expected that this
string is stored on a secure device. All access the API is provided through
SSL/TLS certificate that ensures all packets sent between the server and client
are secured and encrypted. The only point of failure in a security standpoint is
the token being stolen from the user's machine itself.

As there is no explicit login or logout function so users with the Authorization
token have access until the password is changed. Logout should be implemented
by providing a function that simply deletes the saved user Authorization token.


## Other Routes

### ```GET /```
**Returns:** `{"version":1,"author":"Dean Meehan"}`


### ```GET /whoami```
> As there is no login function, there is a route available that will return basic
> information about a user as long as Authentication is correct.

**Returns:** A user object containing basic user information

### ```GET /favicon.ico```

**Returns:** Returns a favicon for the project

## User Routes

### ```GET /user```
**Returns:** Returns the current user's object

### ```GET /user/all```
**Returns:** Returns all users. (Restricted to admin users)

### ```GET /user/:id```
**Returns:** Get's a users detailed from a user id. (Restricted to admin users)

### ```POST /user/email```
**Returns:** Returns the ID and Name of a user by email. (Used in searches)

### ```POST /user```
**Returns:** Creates a new user (Restricted to admin users)

### ```DELELE /user/:id```
**Returns:** Deletes a user by ID (Restricted to admin users)

### ```PUT /user```
**Returns:** Passing in a User object will edit the user details that have changed
(Restricted to admin users)

### ```PUT /user/token/:token```
**Returns:** Passing in a token updates the saved Firebase token for the user for push notifications

## Event Routes

### ```GET /event```
**Returns:** Returns all the current user's events sorted with newest first

### ```GET /event/all```
**Returns:** Returns all events sorted with newest first (Restricted to admin users)

### ```GET /event/upcoming```
**Returns:** Returns all the current user's events from today on, sorted with next first

### ```GET /event/previous```
**Returns:** Returns all the current user's past events, sorted with most recent first

### ```GET /event/:id```
**Returns:** Returns all data about an event with the id :id (Restricted to admin users)

### ```POST /event```
**Returns:** Creates a new event

### ```DELETE /event/:id```
**Returns:** Deletes an event with the id :id (Users can delete their own events, while admins can delete all events)

### ```PUT /event/:eventID/:status```
**Returns:** Changes the status for the current logged in user for the event :eventID to the status :status

### ```PUT /event/:id```
**Returns:** Edits an event with the id :id with the object provided.

### ```GET /notifications```
**Returns:** Returns an object detailing events the current logged in user needs to accept or decline (Events stuck in the invited status)

## Location Routes

The location object holds more specific information about a lecture hall, classroom,
or room within a place. They should be specified with basic details plus location
specific information such as `floor`, max people, services available, `beaconid`, `gps
coordinates` and `access point BSSID`. These are used for tracking attendance and
utilization.

### ```GET /location```
**Returns:** Returns all locations

### ```GET /location/:id```
**Returns:** Returns all data stored about a location with id :id

### ```GET /location/:id/events```
**Returns:** Returns all events for the location of :id for today. (Used by Location Dashboard)

### ```GET /location/near/:x/:y/:distance```
**Returns:** Returns all locations in order of distance to a geolocation :x, :y limited to a distance in meters specified in :distance

### ```POST /location```
**Returns:** Adds a new location (Restricted to admin users)

### ```DELETE /location/:id```
**Returns:** Deletes the location with :id (Restricted to admin users)

### ```PUT /location```
**Returns:** Edits a location, the location is specified from the location object PUT's `id` field (Restricted to admin users)

## Place Routes

The place object is used by locations to specify where they are. They contain
basic location information such as address and also can contain a parent place.
The idea behind this will allow buildings and groups of buildings to be linked
together such as "EEECS Building, Ashby Building, Students Union can all have
the parent place Queens University Belfast. The EEECS Building can then be
the master place of 'EEECS Stranmillis Rd' and 'EEECS Elmwood'"

### ```GET /place```
**Returns:** Returns all places

### ```GET /place/:id```
**Returns:** Returns all data stored about a place with id :id

### ```POST /place```
**Returns:** Adds a new place (Restricted to admin users)

### ```DELETE /place/:id```
**Returns:** Deletes the place with :id (Restricted to admin users)

### ```PUT /place```
**Returns:** Edits a place, the place is specified from the place object PUT's `id` field (Restricted to admin users)

## Stat Routes

The stat route is used to provide statistics about the usage of locations.

### ```GET /stats/location/:location```
**Returns:** Returns statistical data about a locations usage over time including all events held at that location, the average usage etc. This data is used within the dashboard. (Restricted to admin users)

## Track Routes

The tracking routes don't keep or process a users data above checking if a location matches any data submitted to change the users attendance of an event to `attended`.

### ```POST /poll```
**Returns:** The interface where app can poll a uses location data such as GPS, Beacons and BSSID's from access points. Polling will update a users attendance at any events currently happening at any matching locations.
