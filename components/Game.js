import React from 'react';
import { StyleSheet, Text, View, Button, Alert, Picker } from 'react-native';
import * as firebase from 'firebase';

export default class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      p1Email: '', p1Games: 0, p1Wins: 0, p1Draws: 0, p1Choice: 0,
      p2Email: '', p2Games: 0, p2Wins: 0, p2Draws: 0, p2Choice: 0,
    };
  }

  componentDidMount() {
    this.getUsersData();
  }

  /*
  static navigationOptions = ({ navigation }) => {
    return { title: navigation.getParam('data'), }
  }
  */

  getUsersData = () => {

    const { navigation } = this.props;
    const userOne = firebase.auth().currentUser;
    const userTwo = navigation.getParam('data', 'NO-ID');

    firebase
      .database()
      .ref('/users/' + userOne.uid)
      .on('value', snapshot => {
        const userOneDetails = snapshot.val();
        this.setState({ currentUser: userOne, p1Email: userOneDetails.email, p1Games: userOneDetails.games, p1Wins: userOneDetails.wins, p1Draws: userOneDetails.draws, p1Choice: userOneDetails.choice });
      });

    firebase
      .database()
      .ref('/users/' + userTwo)
      .on('value', snapshot => {
        const userTwoDetails = snapshot.val();
        this.setState({ p2Email: userTwoDetails.email, p2Games: userTwoDetails.games, p2Wins: userTwoDetails.wins, p2Draws: userTwoDetails.draws, p2Choice: userTwoDetails.choice });
      });
  }

  updateChoice = (choice) => {
    // Alert.alert(e.target.id);
    this.setState({ p1Choice: choice });
    const user = this.state.currentUser;
    firebase
      .database()
      .ref('users/' + user.uid)
      .update({ choice: choice })
      .catch( error => Alert.alert(error) );
  }

  render() {
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
