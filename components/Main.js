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
      games: 0, wins: 0, draws: 0,
      searching: 0,
      choice: 0,
    };
  }

  componentDidMount() {
    firebase
      .auth()
      .onAuthStateChanged( (user) => {
        // this.props.navigation.navigate(user ? 'Game' : 'SignUp')
        this.setState({ currentUser: user });
        this.getUserData();
    })
  }

  handleSignUp = () => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then( () => this.writeNewUserData() )
      .then( () => this.clearFields() )
      .catch( (error) => this.setState({ errorMessage: error.message }) )
  }

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
        choice: 0,
      })
      .catch( (error) => Alert.alert(error) );
  }

  handleLogin = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then( () => this.clearFields() )
      .then( () => this.props.navigation.navigate('Main') )
      .catch( (error) => this.setState({ errorMessage: error.message }) )
  }

  handleLogout = () => {
    this.stopSearching();
    firebase
      .auth()
      .signOut()
      .catch( error => this.setState({ errorMessage: error.message }) )
  }

  getUserData = () => {
    const user = firebase.auth().currentUser;
    if (user) {
      firebase
      .database()
      .ref('users/' + user.uid)
      .once('value', snapshot => {
        const data = snapshot.val();
        this.setState({ games: data.games, wins: data.wins, draws: data.draws });
      })
      .catch( error => Alert.alert(error) );
    }
  }

  startSearching = () => {
    const user = this.state.currentUser;
    this.setState({ searching: 1 });
    firebase
      .database()
      .ref('users/' + user.uid)
      .update({ searching: 1 })
      .catch( error => Alert.alert(error) );
  }

  stopSearching = () => {
    const user = this.state.currentUser;
    this.setState({ searching: 0 });
    firebase
      .database()
      .ref('users/' + user.uid)
      .update({ searching: 0 })
      .catch( error => Alert.alert(error) );
  }

  tryFind = () => {
    const user = this.state.currentUser;
    firebase
      .database()
      .ref('users')
      .once('value', snapshot => {
        snapshot.forEach(childSnapshot => {
          var childKey = childSnapshot.key;
          var childVal = childSnapshot.val();
          if (childVal.searching == 1 /*&& childKey != user.uid*/) {
            console.log(childKey);
            this.props.navigation.navigate('Game', { data: childKey });
          }
        })
      })
      .catch( error => Alert.alert(error) );
  }

  clearFields = () => {
    this.setState({ email: '', password: '', errorMessage: null, });
  }

  render() {
    if (this.state.currentUser) {
      const user = this.state.currentUser;
      const searching = this.state.searching;
      return (
        <View style={styles.container}>
          <Text>Hi {user.email}!</Text>
          <Text>You have {this.state.wins} wins.</Text>
          <Text>Searching status: {this.state.searching}.</Text>
          <Text> </Text>
          { searching
            ? <View>
                <Button title="Mark as NOT Available" onPress={this.stopSearching} />
                <Text> </Text>
                <Button title="Find Opponent" onPress={this.tryFind} />
              </View>
            : <Button title="Mark as Available" onPress={this.startSearching} />
          }
          <Text> </Text>
          <Button title="Logout" onPress={this.handleLogout} />
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
