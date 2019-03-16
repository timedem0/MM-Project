import React from 'react';
import { StyleSheet, Text, View, Button, Alert, Picker } from 'react-native';
import * as firebase from 'firebase';

export default class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      /*currentUser: null,*/
      p1Email: '', p1Games: 0, p1Wins: 0, p1Draws: 0, p1Choice: 0,
      /*searching: 0,*/
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

    userOne = firebase.auth().currentUser.uid;
    firebase.database().ref('/users/' + userOne).once('value', snapshot => {
      const userOneDetails = snapshot.val();
      this.setState({ p1Email: userOneDetails.email, p1Games: userOneDetails.games, p1Wins: userOneDetails.wins, p1Draws: userOneDetails.draws });
    });

    const { navigation } = this.props;
    const userTwo = navigation.getParam('data', 'NO-ID');
    firebase.database().ref('/users/' + userTwo).once('value', snapshot => {
      const userTwoDetails = snapshot.val();
      this.setState({ p2Email: userTwoDetails.email, p2Games: userTwoDetails.games, p2Wins: userTwoDetails.wins, p2Draws: userTwoDetails.draws });
    });
  }

  updateChoice = (e) => {
    Alert.alert(e.target.id);
    // this.setState({ p1Choice: e.target.id });
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
          onValueChange={(itemValue, itemIndex) =>
            this.setState({p1Choice: Number(itemValue)})
          }>
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
