
#GET
```
/
```

Returns all users
```
/user
```

Returns user by id
```
/user/:id
```

Returns events that user
```
/user/events
```

Returns all locations
```
/location
```

Returns a location by id
```
/location/:id
```

Returns all events
```
/event //Returns all events
```

Returns an event by id
```
/event/:id
```

#POST

TESTING: Upload Images
```
/imageUpload
```

Adds a user
```
/user
```

Adds a location
```
/location
```

Adds an event
```
/event
```

Add an attendee to an event
```
/event/:eventID/attendee
```

Accept or Decline an event invitation
> ['accept','decline']
```
/event/:id/:status
```

TESTING: Used for polling location to server
```
/poll
```

#DELETE

Delete user from event
```
/event/:eventID/attendee
```
