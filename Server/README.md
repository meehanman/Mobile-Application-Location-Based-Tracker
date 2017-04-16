
# MALBT Server

This server provides a restful api interface for the MALBT dashboard running on
the url `https://cloud.dean.technology`

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


## General Routes

### ```GET /```
**Returns:** `{"version":1,"author":"Dean Meehan"}`


### ```GET /whoami```
As there is no login function, there is a route available that will return basic
information about a user as long as Authentication is correct.

> **Returns:** A user object containing basic user information

### ```GET /favicon.ico```

> **Returns:** Returns a favicon for the project

---

## User Routes

### ```GET /user```
**Returns:** Returns the current user's object

### ```GET /user/all```
**Returns:** Returns all users. (Restricted to admin users)

### ```GET /user/:id```
**Returns:** Get's a users detailed from a user id. (Restricted to admin users)

### ```POST /user```
**Returns:** Creates a new user (Restricted to admin users)

### ```DELELE /user/:id```
**Returns:** Deletes a user by ID (Restricted to admin users)

### ```PUT /user```
**Returns:** Passing in a User object will edit the user details that have changed
 (Restricted to admin users)

---

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

 ### ```PUT /event/:id```
**Returns:** Edits an event with the id :id with the object provided.

 ### ```PUT /event/:id/:status```
**Returns:** Changes the status for the current logged in user for the event :id to the status :status

 ### ```PUT /notifications```
**Returns:** Returns an object detailing events the current logged in user needs to accept or decline (Events stuck in the invited status)
