import React from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import * as firebase from 'firebase';
import Gyro from './Gyro';
import { computeResult } from './Logic';

export default class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      pOneEmail: '', pOneGames: 0, pOneWins: 0, pOneDraws: 0, pOneChoice: '', pOneRatio: 0,
      pTwoEmail: '', pTwoGames: 0, pTwoWins: 0, pTwoDraws: 0, pTwoChoice: '', pTwoRatio: 0,
      pTwoPlaying: 0, gameEnded: 0, output: '',
    };
  }

  componentDidMount() {

    // get the users id
    const { navigation } = this.props;
    const userOne = firebase.auth().currentUser;
    const userTwo = navigation.getParam('data', 'NO-ID');
    this.pOne = firebase.database().ref('/users/' + userOne.uid);
    this.pTwo = firebase.database().ref('/users/' + userTwo);

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
    this.pOne.on('value', snapshot => {
      const pOneVal = snapshot.val();
      this.setState({
        pOneEmail: pOneVal.email,
        pOneGames: pOneVal.games, pOneWins: pOneVal.wins, pOneDraws: pOneVal.draws, pOneRatio: ((pOneVal.wins/(pOneVal.games-pOneVal.draws)) * 100).toFixed(2),
        pOneChoice: pOneVal.choice, 
      });
    });
    // player 2 listener
    this.pTwo.on('value', snapshot => {
      const pTwoVal = snapshot.val();
      this.setState({
        pTwoEmail: pTwoVal.email,
        pTwoGames: pTwoVal.games, pTwoWins: pTwoVal.wins, pTwoDraws: pTwoVal.draws, pTwoRatio: ((pTwoVal.wins/(pTwoVal.games-pTwoVal.draws)) * 100).toFixed(2),
        pTwoChoice: pTwoVal.choice, pTwoPlaying: pTwoVal.playing, });
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

  // get player 1 choice, update the state and the database, call for the end game function
  updateChoice = (choice) => {  
    const userOne = firebase.auth().currentUser;
    this.setState({ pOneChoice: choice });
    firebase
      .database()
      .ref('users/' + userOne.uid)
      .update({ choice: choice })
      .catch( error => Alert.alert(error) );
    this.endGame();
  }

  // get the player 2 choice or keep trying, then calculate and update result
  endGame = () => {
    let timerId = setInterval(() => {
      console.log('tick-game');
      // initiate the try cycle
      if (this.state.gameEnded == 1) {
        // if game has ended, stop the cycle
        clearInterval(timerId);
        console.log('stop');
      } else if (this.state.pTwoChoice == '') {
        // zzz
        console.log('waiting for opponent');
      } else {
        // call the logic function
        const result = computeResult(this.state.pOneChoice, this.state.pTwoChoice);
        // update the state with the results
        if (result == 'win') {
          this.setState({ pOneWins: this.state.pOneWins + 1, output: 'Congratulations, you Won!' });
        } else if (result == 'lose') {
          this.setState({ output: 'Too bad.. you Lost!' });
        } else if (result == 'tie') {
          this.setState({ pOneDraws: this.state.pOneDraws + 1, output: 'The match ended in a Tie' });
        } else if (result == 'nuke') {
          this.setState({ pOneDraws: this.state.pOneDraws + 1, output: 'You are both DEAD!' });
        }
        // mark the game as ended, so the cycle can stop
        this.setState({ pOneGames: this.state.pOneGames + 1, gameEnded: 1 });
      }
    }, 1000);
  }

  // database update and maintenance for clean player exit from game
  leaveGame = () => {
    const userOne = firebase.auth().currentUser;
    firebase
      .database()
      .ref('users/' + userOne.uid)
      .update({ playing: 0, choice: '', games: this.state.pOneGames, wins: this.state.pOneWins, draws: this.state.pOneDraws })
      .catch( error => Alert.alert(error) );
    this.props.navigation.navigate('Main');
  }

  // stop the listeners before unmount
  componentWillUnmount() {
    this.pOne.off();
    this.pTwo.off();
  }

  render() {

    const pTwoPlaying = this.state.pTwoPlaying;
    const gameEnded = this.state.gameEnded;
    const pOneEmail = this.state.pOneEmail;
    const pOneName = pOneEmail.substring(0, pOneEmail.lastIndexOf('@'));
    const pOneNameToUpperCase = pOneName.charAt(0).toUpperCase() + pOneName.slice(1);
    const pTwoEmail = this.state.pTwoEmail;
    const pTwoName = pTwoEmail.substring(0, pTwoEmail.lastIndexOf('@'));
    const pTwoNameToUpperCase = pTwoName.charAt(0).toUpperCase() + pTwoName.slice(1);
    
    return (
      <View style={styles.container}>
        <Text>{pOneNameToUpperCase}</Text>
        { this.state.pOneGames
          ? <Text>{this.state.pOneGames} games, {this.state.pOneRatio}%</Text>
          : <Text> </Text>
        }
        <Text>
          - vs -
        </Text>
        <Text>{pTwoNameToUpperCase}</Text>
        { this.state.pTwoGames
          ? <Text>{this.state.pTwoGames} games, {this.state.pTwoRatio}%</Text>
          : <Text> </Text>
        }
        <Text> </Text>
        { pTwoPlaying
          ? <View>
              { gameEnded
                ? <View style={{ alignItems: 'center' }}>
                    <Text>Your choice: {this.state.pOneChoice} - Opponent choice: {this.state.pTwoChoice}</Text>
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
