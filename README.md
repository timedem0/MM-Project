## Mobile-Multiplayer-Project

### Description

A mobile mini-game of Rock-Paper-Scissors in a multi-player environment.

#### Login / Database
The app starts with a user account creation / login system, powered by Firebase Authentication. Each will have a profile recorded in the Firebase Real-time Database, holding useful information such as email and player statistics.

#### Multi-player Game Searching
After the Login screen the user will be presented with a Welcome screen displaying relevant user information and real-time database statistics. Most importantly, from here he is be able to search for other available users that want to play (much like Blizzard’s famous Battle.Net system). If another person, on another mobile device is searching for a game at the same time, they will be paired together and moved from the Welcome screen to the actual Game screen.

#### Gameplay
The mini-game consists in a modified version of Rock-Paper-Scissors with a twist: the selection is made using each phone’s gyroscope component (for example, to choose paper, tilt the phone to the right).

#### Single-player vs AI
It is also possible to play against the AI, on two difficulty levels: one that makes simple random choices and a second one, that bases its choices on previous player behavior (recorded in the database).

### Technologies used:

* Firebase Authentication
* Firebase Real-time Database
* Expo Gyroscope and Audio Components
* React Native Navigation
* ~~React Native Elements or some other UI Toolkit~~ Wrote my own styling, for learning purposes
* Avatar Images provided by [Adorable Avatars](http://avatars.adorable.io/)

### Author

Tudor Nica

[timedemo.eu](http://www.timedemo.eu/)
