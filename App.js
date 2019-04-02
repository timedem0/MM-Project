import React from 'react';
import { InteractionManager } from 'react-native';
import { Font, Icon, Audio, AppLoading } from 'expo';
import { createAppContainer, createStackNavigator } from 'react-navigation';
import * as firebase from 'firebase';
import { firebaseConfig } from './MyKeys';
import Main from './components/Main';
import Game from './components/Game';

firebase.initializeApp(firebaseConfig);

export default class App extends React.Component {

  state = { isReady: false, };

  cacheResourcesAsync = async () => {
    
    // load the sounds and assign them to variables
    try {
      await gameFound.loadAsync(require('./assets/sounds/game_found.wav'));
      await resultDraw.loadAsync(require('./assets/sounds/result_draw.wav'));
      await resultLoss.loadAsync(require('./assets/sounds/result_loss.wav'));
      await resultNuke.loadAsync(require('./assets/sounds/result_nuke.wav'));
      await resultWin.loadAsync(require('./assets/sounds/result_win.wav'));  
    } catch (error) {
      console.warn(error);
    };

    // load the iconset
    return Promise.all([
      Font.loadAsync({
        ...Icon.Feather.font,
      }),
    ]);
  };

  render() {

    if (!this.state.isReady) {

      return (
        <AppLoading
          startAsync = {this.cacheResourcesAsync}
          onFinish = {() => this.setState({ isReady: true })}
          onError = {console.warn}
        />
      );

    } else {

      const MyApp = createStackNavigator({
          Main: { screen: Main, params: { gameFound, } },
          Game: { screen: Game, params: { resultDraw, resultLoss, resultNuke, resultWin, } },
        }, {
          initialRouteName: 'Main',
          defaultNavigationOptions: {
            headerStyle: { backgroundColor: '#00635C', },
            headerTintColor: '#fff',
          },
        },
      );

      const AppContainer = createAppContainer(MyApp);
      
      return <AppContainer />;
    }
  }
}

// sound containers
const gameFound = new Audio.Sound();
const resultDraw = new Audio.Sound();
const resultLoss = new Audio.Sound();
const resultNuke = new Audio.Sound();
const resultWin = new Audio.Sound();

// workaround issue `Setting a timer for long time`
// see: https://github.com/firebase/firebase-js-sdk/issues/97

const _setTimeout = global.setTimeout;
const _clearTimeout = global.clearTimeout;
const MAX_TIMER_DURATION_MS = 60 * 1000;

const timerFix = {};
const runTask = (id, fn, ttl, args) => {
  const waitingTime = ttl - Date.now();
  if (waitingTime <= 1) {
    InteractionManager.runAfterInteractions(() => {
      if (!timerFix[id]) {
        return;
      }
      delete timerFix[id];
      fn(...args);
    });
    return;
  }

  const afterTime = Math.min(waitingTime, MAX_TIMER_DURATION_MS);
  timerFix[id] = _setTimeout(() => runTask(id, fn, ttl, args), afterTime);
};

global.setTimeout = (fn, time, ...args) => {
  if (MAX_TIMER_DURATION_MS < time) {
    const ttl = Date.now() + time;
    const id = '_lt_' + Object.keys(timerFix).length;
    runTask(id, fn, ttl, args);
    return id;
  }
  return _setTimeout(fn, time, ...args);
};

global.clearTimeout = id => {
  if (typeof id === 'string' && id.startWith('_lt_')) {
    _clearTimeout(timerFix[id]);
    delete timerFix[id];
    return;
  }
  _clearTimeout(id);
};
