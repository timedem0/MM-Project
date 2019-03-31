import React from 'react';
import { Text, View, Image, TouchableHighlight } from 'react-native';
import * as firebase from 'firebase';
import Gyro from './Gyro';
import { computeResult } from './Logic';
import { aiEasy, aiHard } from './Ai';
import { styles } from '../styles/Styles';

export default class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      pOneEmail: '', pOneGames: 0, pOneWins: 0, pOneDraws: 0, pOneChoice: '', pOneRatio: 0,
      pTwoEmail: '', pTwoGames: 0, pTwoWins: 0, pTwoDraws: 0, pTwoChoice: '', pTwoRatio: 0,
      pOneNukeCount: 0, pOneFootCount: 0, pOneRoachCount: 0,
      pTwoPlaying: 0, gameEnded: 0, output: '',
      nav: this.props.navigation, againstAi: false, aiVersion: null,
    };
  }

  componentDidMount() {

    // get the users id
    const userOne = firebase.auth().currentUser;
    const userTwo = this.state.nav.getParam('data', 'NO-ID');
    this.pOne = firebase.database().ref('/users/' + userOne.uid);
    this.pTwo = firebase.database().ref('/users/' + userTwo);

    // check if the game is against ai, and go to the appropiate listener body
    if (userTwo == 'KrBjN2nl3NWalwU3OAJdnpaUC5k2') { // ai easy
      this.setState({ againstAi: true, aiVersion: userTwo, });
      this.getAiEasyChoice();
      this.getAiOpponentData();
    } else if (userTwo == 'jQEUwYCq4dZzV3Q4TvraCLN6LNU2') { // ai hard
      this.setState({ againstAi: true, aiVersion: userTwo, });
      this.getAiHardChoice();
      this.getAiOpponentData();
    } else {
      this.getHumanOpponentData(); // human opponent
    }

    // start the player 1 listener
    this.getUsersData();

    // player 1 has joined a game
    this.joinGame();
  }

  // navbar maintenance
  static navigationOptions = () => {
    return {
      title: 'Gaming Arena',
      headerLeft: null,
    }
  }

  // player 1 listener body
  getUsersData = () => {
    this.pOne.on('value', snapshot => {
      const pOneVal = snapshot.val();
      this.setState({
        pOneEmail: pOneVal.email,
        pOneGames: pOneVal.games, pOneWins: pOneVal.wins, pOneDraws: pOneVal.draws,
        pOneNukeCount: pOneVal.nukeCount, pOneFootCount: pOneVal.footCount, pOneRoachCount: pOneVal.roachCount,
        pOneRatio: ((pOneVal.wins/(pOneVal.games-pOneVal.draws)) * 100).toFixed(2),
        pOneChoice: pOneVal.choice, 
      });
    });
  }

  // human opponent listener body
  getHumanOpponentData  = () => {
    this.pTwo.on('value', snapshot => {
      const pTwoVal = snapshot.val();
      this.setState({
        pTwoEmail: pTwoVal.email,
        pTwoGames: pTwoVal.games, pTwoWins: pTwoVal.wins, pTwoDraws: pTwoVal.draws,
        pTwoRatio: ((pTwoVal.wins/(pTwoVal.games-pTwoVal.draws)) * 100).toFixed(2),
        pTwoPlaying: pTwoVal.playing, pTwoChoice: pTwoVal.choice,
      });
    });
  }

  // ai opponent listener body
  getAiOpponentData  = () => {
    this.pTwo.on('value', snapshot => {
      const pTwoVal = snapshot.val();
      this.setState({
        pTwoEmail: pTwoVal.email,
        pTwoGames: pTwoVal.games, pTwoWins: pTwoVal.wins, pTwoDraws: pTwoVal.draws,
        pTwoRatio: ((pTwoVal.wins/(pTwoVal.games-pTwoVal.draws)) * 100).toFixed(2),
      });
    });
  }

  // update player 1 status in the database as joined a game
  joinGame = () => {
    const userOne = firebase.auth().currentUser;
    firebase
      .database()
      .ref('users/' + userOne.uid)
      .update({ playing: 1 })
      .catch( error => console.warn(error) );
  }

  // get player 1 choice, update the state and the database, call for the end game function
  updateChoice = (choice) => {  
    const userOne = firebase.auth().currentUser;
    let pOneNukeCount = this.state.pOneNukeCount;
    let pOneFootCount = this.state.pOneFootCount;
    let pOneRoachCount = this.state.pOneRoachCount;
    if (choice == 'Nuke') {
      pOneNukeCount++;
    } else if (choice == 'Foot') {
      pOneFootCount++;
    } else if (choice == 'Roach') {
      pOneRoachCount++;
    } else {
      console.warn('Gyro component not working as expected.');
    }
    this.setState({ pOneChoice: choice, pOneNukeCount, pOneFootCount, pOneRoachCount, });
    firebase
      .database()
      .ref('users/' + userOne.uid)
      .update({
        choice: choice,
        nukeCount: this.state.pOneNukeCount, footCount: this.state.pOneFootCount, roachCount: this.state.pOneRoachCount,
      })
      .catch( error => console.warn(error) );
    this.endGame();
  }

  // get ai easy choice
  getAiEasyChoice = async () => {
    const aiChoice = await aiEasy();
    this.setState({
      pTwoPlaying: 1, pTwoChoice: aiChoice,
    });
  }

  // get ai hard choice
  getAiHardChoice = async () => {
    const aiChoice = await aiHard(
      this.state.nav.getParam('nukeCount', null),
      this.state.nav.getParam('footCount', null),
      this.state.nav.getParam('roachCount', null)
    );
    this.setState({
      pTwoPlaying: 1, pTwoChoice: aiChoice,
    });
  }

  // get the player 2 choice or keep trying, then calculate and update result
  endGame = () => {
    // fetch the pre-loaded sounds
    const resultWin = this.state.nav.getParam('resultWin', null);
    const resultLoss = this.state.nav.getParam('resultLoss', null);
    const resultDraw = this.state.nav.getParam('resultDraw', null);
    const resultNuke = this.state.nav.getParam('resultNuke', null);
    // initiate the try cycle
    let timerId = setInterval(() => {
      console.log('tock');
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
          this.setState({ pOneWins: this.state.pOneWins + 1, output: 'Congratulations, you Won!', });
          resultWin.setPositionAsync(0);
          resultWin.playAsync();
        } else if (result == 'lose') {
          this.setState({ pTwoWins: this.state.pTwoWins + 1, output: 'Too bad.. you Lost!', });
          resultLoss.setPositionAsync(0);
          resultLoss.playAsync();
        } else if (result == 'tie') {
          this.setState({ pOneDraws: this.state.pOneDraws + 1, pTwoDraws: this.state.pTwoDraws + 1, output: 'The match ended in a Draw.', });
          resultDraw.setPositionAsync(0);
          resultDraw.playAsync();
        } else if (result == 'nuke') {
          this.setState({ output: 'You are both DEAD!', });
          resultNuke.setPositionAsync(0);
          resultNuke.playAsync();
        }
        // update stats and mark the game as ended, so the cycle can stop
        this.setState({ 
          gameEnded: 1,
          pOneGames: this.state.pOneGames + 1, pOneRatio: ((this.state.pOneWins/(this.state.pOneGames + 1 - this.state.pOneDraws)) * 100).toFixed(2),
          pTwoGames: this.state.pTwoGames + 1, pTwoRatio: ((this.state.pTwoWins/(this.state.pTwoGames + 1 - this.state.pTwoDraws)) * 100).toFixed(2),
        });
      }
    }, 1000);
  }

  // database update and maintenance for clean player exit from game
  leaveGame = () => {
    const userOne = firebase.auth().currentUser;
    this.setState({ gameEnded: 1 });
    firebase
      .database()
      .ref('users/' + userOne.uid)
      .update({
        playing: 0, choice: '',
        games: this.state.pOneGames, wins: this.state.pOneWins, draws: this.state.pOneDraws,
      })
      .catch( error => console.warn(error) );
    // update the computer statistics, if necessary
    if (this.state.againstAi) {
      firebase
        .database()
        .ref('users/' + this.state.aiVersion)
        .update({
          games: this.state.pTwoGames, wins: this.state.pTwoWins, draws: this.state.pTwoDraws,
        })
        .catch( error => console.warn(error) );
      this.setState({ againstAi: false, aiVersion: null, });
    }
    // back to main page
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
    const pOneName = this.state.pOneEmail.substring(0, this.state.pOneEmail.lastIndexOf('@'));
    const pOneNameToUpperCase = pOneName.charAt(0).toUpperCase() + pOneName.slice(1);
    const pTwoName = this.state.pTwoEmail.substring(0, this.state.pTwoEmail.lastIndexOf('@'));
    const pTwoNameToUpperCase = pTwoName.charAt(0).toUpperCase() + pTwoName.slice(1);
    let pOneRatio = this.state.pOneRatio;
    if (isNaN(pOneRatio)) {
      pOneRatio = 0;
    };
    let pTwoRatio = this.state.pTwoRatio;
    if (isNaN(pTwoRatio)) {
      pTwoRatio = 0;
    };
    
    return (
      <View style={styles.container}>
        <View style={styles.matchupContainer}>
          <View style={styles.playerOneContainer}>
            <Text style={styles.pageText}>{pOneNameToUpperCase}</Text>
            <Image
              style={styles.avatarMain}
              source={{uri: `https://api.adorable.io/avatars/100/${this.state.pOneEmail}.png`}}
            />
            { this.state.pOneGames
              ? <View style={{ alignItems: 'center' }}>
                  <Text>{this.state.pOneGames} games</Text>
                  <Text>{pOneRatio}%</Text>
                </View>
              : <View style={{ alignItems: 'center' }}>
                  <Text>No games</Text>
                  <Text>{pOneRatio}%</Text>
                </View>
            }
          </View>
          <View style={styles.playerTwoContainer}>
            <Text style={styles.pageText}>{pTwoNameToUpperCase}</Text>
            <Image
              style={styles.avatarMain}
              source={{uri: `https://api.adorable.io/avatars/100/${this.state.pTwoEmail}.png`}}
            />
            { this.state.pTwoGames
              ? <View style={{ alignItems: 'center' }}>
                  <Text>{this.state.pTwoGames} games</Text>
                  <Text>{pTwoRatio}%</Text>
                </View>
              : <View style={{ alignItems: 'center' }}>
                  <Text>No games</Text>
                  <Text>{pTwoRatio}%</Text>
                </View>
            }
          </View>
        </View>
        <View style={styles.gameContainer}>
          { pTwoPlaying
            ? <View>
                { gameEnded
                  ? <View>
                      <View style={styles.resultsContainer}>
                        <View style={styles.playerOneContainer}>
                          <Text style={styles.pageText}>{this.state.pOneChoice}</Text>
                        </View>
                        <View style={styles.playerTwoContainer}>
                          <Text style={styles.pageText}>{this.state.pTwoChoice}</Text>
                        </View>
                      </View>
                      <View style={styles.errorContainer}>
                        <Text style={styles.pageText}>{this.state.output}</Text>
                      </View>
                    </View>
                  : <View style={styles.gyroContainer}>
                      <Gyro updateChoice={this.updateChoice} opponentChoice={this.state.pTwoChoice} opponentName={pTwoNameToUpperCase} />
                    </View>
                }
              </View>
            : <View style={styles.errorContainer}>
                <Text style={styles.pageText}>Opponent is not in the game!</Text>
              </View>
          }
          <Text> </Text>
          <TouchableHighlight style={[styles.actionButton, styles.quitButton]} onPress={this.leaveGame}>
            <Text style={styles.actionText}>Leave Game</Text>
          </TouchableHighlight>
        </View>
      </View>
    )
  }
}
