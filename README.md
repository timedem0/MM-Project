## Mobile-Multiplayer-Project

### Status

All the main features are working.

### Description

A mini-game of Rock-Paper-Scissors, which two users will be able to play in a multi-player environment, each from their own Mobile Devices.

The app starts with a user account creation / login system, powered by Firebase Authentication. At the same time, a user profile will be created in the Firebase Real-time Database, holding useful information such as email and player statistics regarding the games played.

After the Login screen the user will be presented with a Welcome screen displaying relevant user information and real-time database statistics. Most importantly, from here he is be able to search for other available users that want to play (much like Blizzard’s famous Battle.Net system).

If another person, on another mobile device is searching for a game at the same time, they will be paired together and moved from the Welcome screen to the actual Game screen. Here they will be able to play a game of Rock-Paper-Scissors with a twist: the selection will be made using each phone’s gyroscope component (for example, to choose paper, tilt the phone to the right).

Statistics for games played, wins, losses and draws will be recorded in each of the player’s account.

It is also possible to play against the AI.

### Technologies used:

* Firebase Authentication
* Firebase Real-time Database
* Expo Gyroscope and Audio Components
* React Native Navigation
* ~~React Native Elements or some other UI Toolkit~~ Writing my own styling, for learning purposes
* Avatar Images provided by [Adorable Avatars](http://avatars.adorable.io/)

### Author

Tudor Nica

[timedemo.eu](http://www.timedemo.eu/)
