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
      games: 0, wins: 0, draws: 0, playing: 0,
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
          this.userListener = firebase.database().ref('/users/' + user.uid);
          this.getUserData();
        }
    });
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
      // .then( () => this.props.navigation.navigate('Main') )
      .catch( (error) => this.setState({ errorMessage: error.message }) )
  }

  // logout procedures
  handleLogout = () => {
    this.stopSearching();
    this.setState({ opponentFound: null, playing: 0, });
    firebase
      .auth()
      .signOut()
      .catch( error => this.setState({ errorMessage: error.message }) )
  }

  // get user data from database and update the state
  getUserData = () => {
    this.userListener.on('value', snapshot => {
      const data = snapshot.val();
      this.setState({ games: data.games, wins: data.wins, draws: data.draws });
    })
  }

  // start game searching by updating the database
  startSearching = () => {
    const user = this.state.currentUser;
    this.setState({ searching: 1 });
    firebase
      .database()
      .ref('users/' + user.uid)
      .update({ searching: 1 })
      .catch( error => Alert.alert(error) );
    this.tryFind(user);
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

  // game finding procedures
  tryFind = (user) => {
    let timerId = setInterval(() => {
      console.log('tick');
      if (this.state.searching == 0) {
        clearInterval(timerId);
      } else {
        firebase
        .database()
        .ref('users')
        .once('value', snapshot => {
          snapshot.forEach(childSnapshot => {
            var childKey = childSnapshot.key;
            var childVal = childSnapshot.val();
            if (childVal.searching == 1 && childKey != user.uid) {
              clearInterval(timerId);
              this.setState({ opponentFound: childKey });
            }
          })
        })
        .catch( error => Alert.alert(error) );
      }
    }, 2000);
    /*
    setTimeout(() => { 
      clearInterval(timerId);
      console.log('stop');
    }, 10000);
    */
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

  // stop the listeners before unmount
  componentWillUnmount() {
    this.userListener.off();
  }

  render() {

    if (this.state.currentUser) {

      const user = this.state.currentUser.email;
      const name = user.substring(0, user.lastIndexOf('@'));
      const losses = this.state.games - (this.state.wins + this.state.draws);
      // const ratio =  (this.state.wins/this.state.games) * 100;
      let searching = this.state.searching;
      let opponentFound = this.state.opponentFound;

      return (
        <View style={styles.container}>
          <Text>Hi {name}!</Text>
          <Text> </Text>
          <Button title="Logout" onPress={this.handleLogout} />
          <Text> </Text>
          <Text>You have played {this.state.games} games.</Text>
          <Text>{this.state.wins} wins - {this.state.draws} draws - {losses} losses</Text>
          <Text> </Text>
          <Text>There are {this.state.totalPlayers} registered players.</Text>
          <Text>Out of which {this.state.totalPlaying} playing at the moment.</Text>
          <Text> </Text>
          { opponentFound
            ? <View>
                <Button title="Start Game!" onPress={this.startGame} />
                <Text>Game Found</Text>
              </View>
            : <View>
                { searching
                  ? <View>
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
