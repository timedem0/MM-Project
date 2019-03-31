import React from 'react';
import { Text, View } from 'react-native';
import { WebBrowser } from 'expo';
import { Feather } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import { styles } from '../styles/Styles';

export default class Footer extends React.Component {

  timedemo = () => {
    WebBrowser.openBrowserAsync('http://timedemo.eu');
  };

  about = () => {
    WebBrowser.openBrowserAsync('https://github.com/timedem0/MM-Project');
  };

  render() {

    return (
      <View style={styles.footer}>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.pageText, {fontWeight: 'bold'}]}>
            Nuke-Foot-Cockroach
          </Text>
          <Text style={styles.optionText}>
            Gyroscope Powered Experience
          </Text>
          <View style={{ marginTop: 10 }}>
            <Feather name="globe" size={80} color="#00635C" />
          </View>
        </View>
        <View>
          <Touchable
          background={Touchable.Ripple('#ccc', false)}
          onPress={this.about}
          style={styles.option}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.optionText}>
                GitHub page
              </Text>
            </View>
          </Touchable>
          <Touchable
          background={Touchable.Ripple('#ccc', false)}
          onPress={this.timedemo}
          style={styles.option}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.optionText}>
               timedemo.eu
              </Text>
            </View>
          </Touchable>
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <Text>
              &copy; 2019 Tudor Nica
            </Text>
          </View>
        </View>
      </View>
    )
  }
}
