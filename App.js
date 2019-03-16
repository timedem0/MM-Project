import React from 'react';
import { createAppContainer, createStackNavigator } from 'react-navigation';
import * as firebase from 'firebase';
import { firebaseConfig } from './MyKeys';
import Main from './components/Main';
import Game from './components/Game';

firebase.initializeApp(firebaseConfig);

export default class App extends React.Component {

  render() {
    return <AppContainer />;
  }
}

const MyApp = createStackNavigator(
  { 
    Main,
    Game,
  }, {
    initialRouteName: 'Main'
  }
);

const AppContainer = createAppContainer(MyApp);
