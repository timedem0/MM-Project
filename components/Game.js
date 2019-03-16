import React from 'react';
import { StyleSheet, Text, View, Button, Alert, Picker } from 'react-native';
import * as firebase from 'firebase';

export default class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      p1Email: '', p1Games: 0, p1Wins: 0, p1Draws: 0, p1Choice: 0,
      p2Email: '', p2Games: 0, p2Wins: 0, p2Draws: 0, p2Choice: 0,
      p2Playing: 0,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    const userOne = firebase.auth().currentUser;
    const userTwo = navigation.getParam('data', 'NO-ID');
    this.p1 = firebase.database().ref('/users/' + userOne.uid);
    this.p2 = firebase.database().ref('/users/' + userTwo);
    this.getUsersData();
    this.joinGame();
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Gaming Arena',
      headerLeft: null,
    }
  }

  getUsersData = () => {
    this.p1.on('value', snapshot => {
      const userOneDetails = snapshot.val();
      this.setState({ p1Email: userOneDetails.email, p1Games: userOneDetails.games, p1Wins: userOneDetails.wins, p1Draws: userOneDetails.draws, p1Choice: userOneDetails.choice, });
    });
    this.p2.on('value', snapshot => {
      const userTwoDetails = snapshot.val();
      this.setState({ p2Email: userTwoDetails.email, p2Games: userTwoDetails.games, p2Wins: userTwoDetails.wins, p2Draws: userTwoDetails.draws, p2Choice: userTwoDetails.choice, p2Playing: userTwoDetails.playing, });
    });
  }

  joinGame = () => {
    const userOne = firebase.auth().currentUser;
    firebase
      .database()
      .ref('users/' + userOne.uid)
      .update({ playing: 1 })
      .catch( error => Alert.alert(error) );
  }

  updateChoice = (choice) => {
    const userOne = firebase.auth().currentUser;
    const choiceAsNumber = Number(choice);
    this.setState({ p1Choice: choiceAsNumber });
    firebase
      .database()
      .ref('users/' + userOne.uid)
      .update({ choice: choiceAsNumber })
      .catch( error => Alert.alert(error) );
  }

  leaveGame = () => {
    const userOne = firebase.auth().currentUser;
    firebase
      .database()
      .ref('users/' + userOne.uid)
      .update({ playing: 0, choice: 0 })
      .catch( error => Alert.alert(error) );
    this.props.navigation.navigate('Main');
  }

  componentWillUnmount() {
    this.p1.off();
    this.p2.off();
  }

  render() {
    const p2Playing = this.state.p2Playing;
    return (
      <View style={styles.container}>
        <Text>
          {this.state.p1Email} - {this.state.p1Games} games, {this.state.p1Wins} wins - choice: {this.state.p1Choice}
        </Text>
        <Text>
          - vs -
        </Text>
        <Text>
          {this.state.p2Email} - {this.state.p2Games} games, {this.state.p2Wins} wins - choice: {this.state.p2Choice}
        </Text>
        <Text> </Text>
        { p2Playing
          ? <View>
              <Text>
                Your Choice!
              </Text>
              <Picker
                // selectedValue={this.state.p1Choice}
                style={{height: 50, width: 100}}
                onValueChange={ (itemValue) => this.updateChoice(itemValue) }
              >
                <Picker.Item label="Default" value="0" />
                <Picker.Item label="Foot" value="1" />
                <Picker.Item label="Nuke" value="2" />
                <Picker.Item label="Cockroach" value="3" />
              </Picker>
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
    justifyContent: 'center',
    alignItems: 'center'
  }
})
