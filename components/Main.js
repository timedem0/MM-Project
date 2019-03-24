import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, Alert } from 'react-native';
import * as firebase from 'firebase';

export default class Main extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      email: '',
      password: '',
      errorMessage: null,
      games: 0, wins: 0, draws: 0, ratio: 0, playing: 0,
      searching: 0,
      opponentFound: null,
      totalPlayers: 0, totalPlaying: 0,
    };
  }

  componentDidMount() {

    // get the current authenticated user
    firebase
      .auth()
      .onAuthStateChanged( (user) => {
        this.setState({ currentUser: user });

        // start the listeners
        if (user) {
          this.db = firebase.database().ref('/users/');
          this.queryDatabase();
        }
    });
  }

  // navbar maintenance
  static navigationOptions = () => {
    return {
      title: 'Mobile Multiplayer Project',
      headerLeft: null,
    }
  }

  //  create new user from state data, write to database and clear input fields
  handleSignUp = () => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then( () => this.writeNewUserData() )
      .then( () => this.clearFields() )
      .catch( (error) => this.setState({ errorMessage: error.message }) )
  }

  // write new user in the database
  writeNewUserData = () => {
    const user = firebase.auth().currentUser;
    firebase
      .database()
      .ref('users/' + user.uid)
      .set({
        email: user.email,
        games: 0,
        wins: 0,
        draws: 0,
        searching: 0,
        choice: '',
        playing: 0,
      })
      .catch( (error) => Alert.alert(error) );
  }

  // login procedures and clear input fields
  handleLogin = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then( () => this.clearFields() )
      .catch( (error) => this.setState({ errorMessage: error.message }) )
  }

  // logout procedures and state maintenance
  handleLogout = () => {
    this.stopSearching();
    this.setState({ opponentFound: null, playing: 0, });
    firebase
      .auth()
      .signOut()
      .catch( error => this.setState({ errorMessage: error.message }) )
  }

  // listen to database changes and update the state
  queryDatabase = () => {
    this.db.on('value', snapshot => {    
      this.setState({ totalPlayers: snapshot.numChildren() }); // total number of users
      const arrayOfKeysPlaying = []; // empty array to hold the users playing at the moment
      snapshot.forEach(childSnapshot => {
        const key = childSnapshot.key;
        const data = childSnapshot.val();
        // if user is playing, add him to the array and update the state
        if (data.playing == 1) {
          if(arrayOfKeysPlaying.indexOf(key) === -1) { // make sure the key doesn't exist already
            arrayOfKeysPlaying.push(key);
          }
          this.setState({ totalPlaying: arrayOfKeysPlaying.length }); // number of users playing at the moment
        }
        // if user is not playing anymore, remove him from the array and update the state
        if (data.playing == 0) {
          let arrayFiltered = arrayOfKeysPlaying.filter( (value) => {
              return value != key;
          })
          this.setState({ totalPlaying: arrayFiltered.length }); // number of users playing at the moment
        }
        // get the data of current user and keep the state updated
        if (key == this.state.currentUser.uid) {
          this.setState({ games: data.games, wins: data.wins, draws: data.draws, ratio: ((data.wins/(data.games-data.draws)) * 100).toFixed(2), });
        }
      })
    })
  }

  // initiate game searching by updating the database and call the main function
  startSearching = () => {
    const user = this.state.currentUser;
    this.setState({ searching: 1 });
    firebase
      .database()
      .ref('users/' + user.uid)
      .update({ searching: 1 })
      .catch( error => Alert.alert(error) );
    this.findGame(user);
  }

  // stop game searching by updating the database
  stopSearching = () => {
    const user = this.state.currentUser;
    this.setState({ searching: 0 });
    firebase
      .database()
      .ref('users/' + user.uid)
      .update({ searching: 0 })
      .catch( error => Alert.alert(error) );
  }

  // find an opponent
  findGame = (user) => {
    let searchingUsersArray = [];
    // initiate the try cycle
    let timerId = setInterval(() => {
      console.log('tick');
      if (this.state.searching == 0) {
        // if searching is stopped, stop the cycle
        clearInterval(timerId);
      } else {
        // test if there are other users searching other than the current one
        firebase
        .database()
        .ref('users')
        .once('value', snapshot => {
          snapshot.forEach(childSnapshot => {
            var childKey = childSnapshot.key;
            var childVal = childSnapshot.val();
            if (childVal.searching == 1 && childKey != user.uid) {
              // add this user id into the array of users searching for a game
              searchingUsersArray.push(childKey);
            }
          })
        })
        .catch( error => Alert.alert(error) );
        if (searchingUsersArray.length > 0) {
          // stop the cycle, extract a random opponent from the array and update the state
          clearInterval(timerId);
          const item = searchingUsersArray[Math.floor(Math.random()*searchingUsersArray.length)];
          this.setState({ opponentFound: item });
        }
      }
    }, 2000);
  }

  // prepare for game start and navigate to the game component
  startGame = () => {
    this.stopSearching();
    const opponentFound = this.state.opponentFound;
    this.setState({ opponentFound: null });
    this.props.navigation.navigate('Game', { data: opponentFound });
  }

  // clear input fields
  clearFields = () => {
    this.setState({ email: '', password: '', errorMessage: null, });
  }

  // stop the listener before unmount
  componentWillUnmount() {
    this.db.off();
  }

  render() {

    if (this.state.currentUser) {

      const user = this.state.currentUser.email;
      const name = user.substring(0, user.lastIndexOf('@'));
      const nameToUpperCase = name.charAt(0).toUpperCase() + name.slice(1);
      const losses = this.state.games - (this.state.wins + this.state.draws);
      let searching = this.state.searching;
      let opponentFound = this.state.opponentFound;

      return (
        <View style={styles.container}>
          <Text>Hello {nameToUpperCase}!</Text>
          <Text> </Text>
          <Button title="Logout" onPress={this.handleLogout} />
          <Text> </Text>
          <Text>Total games played: {this.state.games}.</Text>
          { this.state.ratio
            ? <View style={{ alignItems: 'center' }}>
                <Text>Your win/loss ratio: {this.state.ratio}%.</Text>
                <Text>{this.state.wins} wins - {this.state.draws} draws - {losses} losses</Text>
              </View>
            : <Text> </Text>
          }
          <Text> </Text>
          <Text>There are {this.state.totalPlayers} registered players,</Text>
          <Text>and {this.state.totalPlaying} are playing at the moment.</Text>
          <Text> </Text>
          { opponentFound
            ? <View style={{ alignItems: 'center' }}>
                <Button title="Start Game!" onPress={this.startGame} />
                <Text>Game Found</Text>
              </View>
            : <View>
                { searching
                  ? <View style={{ alignItems: 'center' }}>
                      <Button title="Stop Searching" onPress={this.stopSearching} />
                      <Text>Searching for a match...</Text>
                    </View>
                  : <Button title="Search an Opponent" onPress={this.startSearching} />
                }
              </View>  
          }
        </View>
      )

    } else {

      return (
        <View style={styles.container}>
          <Text>Enter Your Account Details</Text>
          {this.state.errorMessage &&
            <Text style={{ color: 'red' }}>
              {this.state.errorMessage}
            </Text>}
          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            style={styles.textInput}
            onChangeText={email => this.setState({ email })}
            value={this.state.email}
          />
          <TextInput
            secureTextEntry
            placeholder="Password"
            autoCapitalize="none"
            style={styles.textInput}
            onChangeText={password => this.setState({ password })}
            value={this.state.password}
          />
          <Text> </Text>
          <Button title="Sign Up" onPress={this.handleSignUp} />
          <Text> </Text>
          <Button title="Login" onPress={this.handleLogin} />          
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    // justifyContent: 'center',
    alignItems: 'center'
  },
  textInput: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 8
  }
})
