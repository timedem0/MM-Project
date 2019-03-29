import React from 'react';
import { Text, TextInput, View, Keyboard, Image, TouchableHighlight, TouchableWithoutFeedback } from 'react-native';
import { Audio } from 'expo';
import * as firebase from 'firebase';
import { styles } from '../styles/Styles';

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

    // prefetch the sounds
    this.loadSounds();
  }

  // navbar maintenance
  static navigationOptions = () => {
    return {
      title: 'Mobile Multiplayer Project',
      headerLeft: null,
    }
  }

  // async function to pre-load the sounds
  loadSounds = async () => {
    try {
      await gameFound.loadAsync(require('../assets/sounds/game_found.wav'));
      await resultDraw.loadAsync(require('../assets/sounds/result_draw.wav'));
      await resultLoss.loadAsync(require('../assets/sounds/result_loss.wav'));
      await resultNuke.loadAsync(require('../assets/sounds/result_nuke.wav'));
      await resultWin.loadAsync(require('../assets/sounds/result_win.wav'));  
    } catch (error) {
      console.warn(error);
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
      .catch( (error) => console.warn(error) );
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
      .catch( error => console.warn(error) );
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
      .catch( error => console.warn(error) );
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
        .catch( error => console.warn(error) );
        if (searchingUsersArray.length > 0) {
          // stop the cycle, extract a random opponent from the array and update the state
          clearInterval(timerId);
          const item = searchingUsersArray[Math.floor(Math.random()*searchingUsersArray.length)];
          this.setState({ opponentFound: item });
          gameFound.setPositionAsync(0);
          gameFound.playAsync();
        }
      }
    }, 2500);
  }

  // prepare for game start and navigate to the game component with the required props
  startGame = () => {
    this.stopSearching();
    const opponentFound = this.state.opponentFound;
    this.setState({ opponentFound: null });
    this.props.navigation.navigate('Game', { data: opponentFound, resultDraw, resultLoss, resultNuke, resultWin });
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

      const name = this.state.currentUser.email.substring(0, this.state.currentUser.email.lastIndexOf('@'));
      const nameToUpperCase = name.charAt(0).toUpperCase() + name.slice(1);
      let losses = this.state.games - (this.state.wins + this.state.draws);
      let ratio = this.state.ratio;
      if (isNaN(ratio)) {
        ratio = 0;
      }
      let searching = this.state.searching;
      let opponentFound = this.state.opponentFound;

      return (
        <View style={styles.container}>
          <View style={styles.mainTop}>
            <View style={styles.playerCard}>
              <Text style={styles.pageText}>Hello {nameToUpperCase}!</Text>
              <Image
                style={styles.avatarMain}
                source={{uri: `https://api.adorable.io/avatars/120/${this.state.currentUser.email}.png`}}
              />
              <TouchableHighlight style={[styles.actionButton, styles.quitButton]} onPress={this.handleLogout}>
                <Text style={styles.actionText}>Log Out</Text>
              </TouchableHighlight>
            </View>
            <View style={styles.playerStats}>
              <Text>Games played: {this.state.games}</Text>
              { this.state.ratio
                ? <View style={{ alignItems: 'center' }}>
                    <Text>Success ratio: {ratio}%</Text>
                    <Text>{this.state.wins} wins - {this.state.draws} draws - {losses} losses</Text>
                  </View>
                : <Text>No games played yet</Text>
              }
            </View>
          </View>
          <View style={styles.mainBottom}>
            <Text>There are {this.state.totalPlayers} registered players,</Text>
            <Text>and {this.state.totalPlaying} are in a game at the moment.</Text>
            <Text> </Text>
            { opponentFound
              ? <View style={{ alignItems: 'center' }}>
                  <TouchableHighlight style={[styles.gameButton, styles.gameStartButton]} onPress={this.startGame}>
                    <Text style={styles.textInfo}>Start the Game!</Text>
                  </TouchableHighlight>
                  <View style={styles.errorContainer}>
                    <Text style={styles.pageText}>Game Found</Text>
                  </View>
                </View>
              : <View>
                  { searching
                    ? <View style={{ alignItems: 'center' }}>
                        <TouchableHighlight style={[styles.gameButton, styles.searchStopButton]} onPress={this.stopSearching}>
                          <Text style={styles.actionText}>Stop searching!</Text>
                        </TouchableHighlight>
                        <View style={styles.errorContainer}>
                          <Text style={styles.textInfo}>Searching for a match...</Text>
                        </View>
                      </View>
                    : <TouchableHighlight style={[styles.gameButton, styles.searchStartButton]} onPress={this.startSearching}>
                        <Text style={styles.actionText}>Search for a game!</Text>
                      </TouchableHighlight>
                  }
                </View>  
            }
          </View>
        </View>
      )

    } else {

      return (
        <TouchableWithoutFeedback onPress={ () => Keyboard.dismiss() }>
          <View style={styles.container}>
            <Text style={styles.pageText}>Enter Your Account Details</Text>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Email"
                autoCapitalize="none"
                style={styles.inputText}
                onChangeText={email => this.setState({ email })}
                value={this.state.email}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                secureTextEntry
                placeholder="Password"
                autoCapitalize="none"
                style={styles.inputText}
                onChangeText={password => this.setState({ password })}
                value={this.state.password}
              />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableHighlight style={[styles.actionButton, styles.signupButton]} onPress={this.handleSignUp}>
                <Text style={styles.actionText}>Sign Up</Text>
              </TouchableHighlight>
              <TouchableHighlight style={[styles.actionButton, styles.loginButton]} onPress={this.handleLogin}>
                <Text style={styles.actionText}>Log In</Text>
              </TouchableHighlight>
            </View>
            <View style={styles.errorContainer}>
              {this.state.errorMessage &&
                <Text style={{ color: 'red' }}>
                  {this.state.errorMessage}
                </Text>}
            </View>
          </View>
        </TouchableWithoutFeedback>
      )
    }
  }
}

const gameFound = new Audio.Sound();
const resultDraw = new Audio.Sound();
const resultLoss = new Audio.Sound();
const resultNuke = new Audio.Sound();
const resultWin = new Audio.Sound();
