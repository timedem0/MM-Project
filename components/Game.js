import React from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import * as firebase from 'firebase';

export default class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentUser: null, wins: 0, draws: 0, losses: 0, searching: 0, choice: 0
    };
  }

  render() {
    const { navigation } = this.props;
    const data = navigation.getParam('data', 'NO-ID');
    return (
      <View style={styles.container}>
        <Text>
          hello {data}
        </Text>
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
