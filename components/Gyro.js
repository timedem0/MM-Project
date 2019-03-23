import React from 'react';
import { Gyroscope } from 'expo';
import { StyleSheet, Text, View, Button } from 'react-native';

export default class Gyro extends React.Component {

  state = {
    gyroscopeData: {},
    south: 0, east: 0, west: 0,
    southColor: 'rgba(155, 225, 155, 0)', eastColor: 'rgba(155, 225, 155, 0)', westColor: 'rgba(155, 225, 155, 0)',
  };

  componentDidMount() {
    this.callGyro();
  }

  callGyro = () => {

    // add listener to Gyro component
    this.gyro = Gyroscope.addListener(result => {

      // pass the incoming data stream to state
      this.setState({ gyroscopeData: result });

      // calculate amplitude of the desired 3 rotations
      this.state.south = this.state.south + this.state.gyroscopeData.x;
      this.state.east = this.state.east + this.state.gyroscopeData.y;
      this.state.west = this.state.west - this.state.gyroscopeData.y;

      // set the color accordingly
      this.state.southColor = `rgba(155, 225, 155, ${this.state.south/10})`;
      this.state.eastColor = `rgba(155, 225, 155, ${this.state.east/10})`;
      this.state.westColor = `rgba(155, 225, 155, ${this.state.west/10})`;

      // calculate the thresholds for applying the choice
      if (this.state.south >= 10) {
        this.props.updateChoice('Nuke');
      } else if (this.state.east >= 10) {
        this.props.updateChoice('Roach');
      } else if (this.state.west >= 10) {
        this.props.updateChoice('Foot');
      }
    });
  };

  // reset amplitudes, if needed
  reset = () => {
    this.setState({ south: 0, east: 0, west: 0, });
  }

  // stop the listener before unmount
  componentWillUnmount() {
    this.gyro && this.gyro.remove();
    this.gyro = null;
  }

  render() {

    return (
      <View>

        <View style={styles.shapeContainer}>
          <View style={[styles.trapezoid, {borderBottomColor: this.state.westColor, transform: [{rotate: '90deg'}]}]}><Text>{"\n\n"}FOOT</Text></View>
          <View style={[styles.trapezoid, {borderBottomColor: this.state.southColor, marginTop: 30}]}><Text>{"\n\n"}NUKE</Text></View>
          <View style={[styles.trapezoid, {borderBottomColor: this.state.eastColor, transform: [{rotate: '270deg'}]}]}><Text>{"\n\n"}ROACH</Text></View>
        </View>

        <View style={{marginTop: 30}}>
          <Button title="Reset" onPress={this.reset} />
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  shapeContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    marginTop: 50,
  },
  trapezoid: {
    width: 100,
    height: 0,
    borderBottomWidth: 50,
    borderBottomColor: 'red',
    borderLeftWidth: 25,
    borderLeftColor: 'transparent',
    borderRightWidth: 25,
    borderRightColor: 'transparent',
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
