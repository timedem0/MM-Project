import React from 'react';
import { StyleSheet, Text, View, Button, Alert, Picker } from 'react-native';
import * as firebase from 'firebase';
import Gyro from './Gyro';
import { computeResult } from './Logic';

export default class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      p1Email: '', p1Games: 0, p1Wins: 0, p1Draws: 0, p1Choice: '',
      p2Email: '', p2Games: 0, p2Wins: 0, p2Draws: 0, p2Choice: '',
      p2Playing: 0, gameEnded: 0, output: '',
    };
  }

  componentDidMount() {

    // get the users id
    const { navigation } = this.props;
    const userOne = firebase.auth().currentUser;
    const userTwo = navigation.getParam('data', 'NO-ID');
    this.p1 = firebase.database().ref('/users/' + userOne.uid);
    this.p2 = firebase.database().ref('/users/' + userTwo);

    // start the listeners
    this.getUsersData();

    // player 1 has joined a game
    this.joinGame();
  }

  // navbar maintenance
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Gaming Arena',
      headerLeft: null,
    }
  }

  getUsersData = () => {

    // player 1 listener
    this.p1.on('value', snapshot => {
      const userOneDetails = snapshot.val();
      this.setState({ p1Email: userOneDetails.email, p1Games: userOneDetails.games, p1Wins: userOneDetails.wins, p1Draws: userOneDetails.draws, p1Choice: userOneDetails.choice, });
    });

    // player 2 listener
    this.p2.on('value', snapshot => {
      const userTwoDetails = snapshot.val();
      this.setState({ p2Email: userTwoDetails.email, p2Games: userTwoDetails.games, p2Wins: userTwoDetails.wins, p2Draws: userTwoDetails.draws, p2Choice: userTwoDetails.choice, p2Playing: userTwoDetails.playing, });
    });
  }

  // update player 1 status in the database as joined a game
  joinGame = () => {
    const userOne = firebase.auth().currentUser;
    firebase
      .database()
      .ref('users/' + userOne.uid)
      .update({ playing: 1 })
      .catch( error => Alert.alert(error) );
  }

  updateChoice = (choice) => {

    // get player 1 choice, update the state and the database
    const userOne = firebase.auth().currentUser;
    this.setState({ p1Choice: choice });
    firebase
      .database()
      .ref('users/' + userOne.uid)
      .update({ choice: choice })
      .catch( error => Alert.alert(error) );

    // call for the end game function
    this.endGame();
  }

  endGame = () => {
        
    // get the player 2 choice or wait until it happens
    
    let timerId = setInterval(() => {
      console.log('tick-game');
      if (this.state.gameEnded == 1) {
        clearInterval(timerId);
        console.log('stop');
      } else if (this.state.p2Choice == '') {
        console.log('waiting for opponent');
      } else {
        const result = computeResult(this.state.p1Choice, this.state.p2Choice);
        if (result == 'win') {
          this.setState({ output: 'Congratulations, you Won!' });
        } else if (result == 'lose') {
          this.setState({ output: 'Too bad.. you Lost!' });
        } else if (result == 'tie') {
          this.setState({ output: 'The match ended in a Tie' });
        } else if (result == 'nuke') {
          this.setState({ output: 'You are both DEAD!' });
        }
        this.setState({ gameEnded: 1 })
      }
    }, 1000);
  }

  // database maintenance for clean player exit from game
  leaveGame = () => {
    const userOne = firebase.auth().currentUser;
    firebase
      .database()
      .ref('users/' + userOne.uid)
      .update({ playing: 0, choice: '' })
      .catch( error => Alert.alert(error) );
    this.props.navigation.navigate('Main');
  }

  // stop the listeners before unmount
  componentWillUnmount() {
    this.p1.off();
    this.p2.off();
  }

  render() {

    const p2Playing = this.state.p2Playing;
    const gameEnded = this.state.gameEnded;
    
    return (
      <View style={styles.container}>
        <Text>
          {this.state.p1Email} - {this.state.p1Games} games, {this.state.p1Wins} wins
        </Text>
        <Text>
          - vs -
        </Text>
        <Text>
          {this.state.p2Email} - {this.state.p2Games} games, {this.state.p2Wins} wins
        </Text>
        <Text> </Text>
        { p2Playing
          ? <View>
              { gameEnded
                ? <View>
                    <Text>Your choice: {this.state.p1Choice} - Opponent choice: {this.state.p2Choice}</Text>
                    <Text>{this.state.output}</Text>
                  </View>
                : <View>
                    <Gyro updateChoice={this.updateChoice} />
                  </View>
              }
            </View>
          : <Text>Opponent is not in the game!</Text>
        }
        <Text> </Text>
        <Button title="Leave Game" onPress={this.leaveGame} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    // justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  }
})
