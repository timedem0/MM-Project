import React from 'react';
import { InteractionManager } from 'react-native';
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


const _setTimeout = global.setTimeout;
const _clearTimeout = global.clearTimeout;
const MAX_TIMER_DURATION_MS = 60 * 1000;

// Work around issue `Setting a timer for long time`
// see: https://github.com/firebase/firebase-js-sdk/issues/97

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
