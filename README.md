# Mobile Application Location based Tracker
Cloud-based space management

# Instructions

The project is split into three sections, server, mobile app and dashboard.

(Server)[/Server]

(Mobile App)[/MobileApp]

(Dashboard)[/Dashboard]  

# Postman Config

You can see example calls from the postman link here acting as a client
`https://www.getpostman.com/collections/5760a7b5dffe14225012`


# Initial Problem Description
Many companies, universities, and organisations would benefit from having a strategic approach with space utilisation from managing meeting locations to classrooms. Having a centralised space management application should maximise the potential of existing spaces and allow for saving in building management costs.

This problem can be solved by developing a cloud-based system that can organise spaces within an organisation by providing features for organising and managing meetings, events or other activities involving rooms, services and people. The system can also use existing technologies such as mobile tracking through GPS or Bluetooth beacons to identify when people use the spaces and record the building utilisation in real-time allowing building administration to make more informed decisions.

End devices such as web browsers, tablets and mobile phones can be used to provide a flexible, user-friendly interface providing incite of room utilisation so they can quickly find available spaces, book rooms, and even check attendance at meetings. Devices such as tablets could be mounted beside meeting rooms to check availably of a particular room, including current information about meetings taking place such as the meeting name, people attending and times.

# Work Plan

The project will be a cloud based application that will do most of the processing remotely with the end user device such as web browsers, mobiles and tablets able to use their internet connection to connect to a central server. The cloud service should store information about buildings, rooms, companies and users allowing end devices to login and request rooms. Mobile devices will report on their location using assigned beacons placed in rooms.
The first step of this project would be to create a cloud-based application with API endpoints that will store all information regarding spaces/rooms and their locations, users and attendance. The cloud-based application will also be responsible for processing metrics of utilization and assigning meeting rooms based on numbers, location and other requirements. The API then can be easily consumed using a range of different devices and technologies without exposing the internal architecture.

Once the cloud-based system is up and running; development can begin on creating a browser based user-interface to allow users to login, view and book rooms and then finally showing reports to admin users and displaying room utilisation. The UI could use Google Maps to do route planning to the next event, and also provide push notifications to notify users if a meeting is coming up they are attending. Finally, a mobile app can be created with the same features as the browser-based UI but with additional features such as user tracking using GPS and/or Bluetooth beacons.

When requesting a room device information such as location can be used to allocate a room that is best suited using GPS and beacons to find the closest location, number of people, free rooms or resources needed.
There are additional features that would come as nice additions to the application if time permits such as incorporating chat into events/meetings and could be added after the initial phases are complete.

# Planned Software and Hardware Environment
During initial development and testing, the cloud-based application can be run locally on a private network while cloud services such as Microsoft Azure, Amazon Web Services, and Digital Ocean would be used for production setups.
A range of available technologies to complete the project:
- Server -  The service will be built on an existing solution provided by Event Map called Event Cloud. This solution is developed using the .NET framework using C# and JavaScript. The .NET framework will manage the user interface, data access, database connectivity and RESTful API which can be consumed by other services.
- Browser Client – A browser-client is already managed by Event Cloud that provides code functionality that manages meeting and timetabling. The existing client will be provided with additional functionality to allow for reporting of utilisation. An additional interface will be created for purpose of use by a tablet device connected outside a meeting room to show meeting room information.
- Mobile Client – Using Apache Cordova, the project can be targeted to multiple platforms with one code base to enable push notifications, GPS and Bluetooth Beacon support on top of the cloud-based RESTful API. The mobile client will also have components that will listen in the background for beacon requests and notify the server of their locations. The app will be designed to alert users of meetings they may have and

# Success Criteria
The project can be considered a success if there is a product created that is able to manage space within a building for meetings and classes, the ability to track people’s attendance of the meetings and generate live reports based on the findings to allow the end user to view building and room utilisation.
