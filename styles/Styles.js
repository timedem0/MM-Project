import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: '#D7EBE7',
    alignItems: 'center',
  },

  pageText: {
    fontSize: 18,
    color: '#505050',
    lineHeight: 24,
    textAlign: 'center',
  },

  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: 250,
    height: 45,
    marginTop: 20,
    flexDirection: 'row',
    alignItems:'center',
    elevation: 5,
  },

  inputText: {
    fontSize: 17,
    height: 45,
    marginLeft: 16,
    width: '90%',
  },

  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },

  actionButton: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    borderRadius: 15,
    elevation: 5,
  },

  signupButton: {
    backgroundColor: 'blue',
    marginRight: 5,
  },

  loginButton: {
    backgroundColor: '#3DAF72',
    marginLeft: 5,
  },

  quitButton: {
    backgroundColor: 'grey',
  },

  gameButton: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    width: 240,
    borderRadius: 15,
    elevation: 5,
  },

  gameFoundButton: {
    backgroundColor: 'blue',
  },

  searchStartButton: {
    backgroundColor: '#3DAF72',
  },

  searchStopButton: {
    backgroundColor: 'orange',
  },

  actionText: {
    fontSize: 16,
    color: 'white',
  },

  errorContainer: {
    backgroundColor: 'rgba(0,0,0,.05)',
    marginTop: 20,
    borderRadius: 5,
    paddingHorizontal: 4,
  },

  gyroContainer: {
    backgroundColor: 'white',
    borderRadius: 30,
    elevation: 20,
  },

  matchupContainer: {
    flex: 2,
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },

  playerOneContainer: {
    backgroundColor: 'skyblue',
    padding: 10,
    width: '40%',
    height: 200,
  },

  playerTwoContainer: {
    backgroundColor: 'lightgrey',
    padding: 10,
    width: '40%',
    height: 200,
  },

  gameContainer: {
    flex: 6,
    alignItems: 'center',
  },

  mainTop: {
    flex: 5,
    width: '90%',
    alignItems: 'center',
  },

  mainBottom: {
    flex: 5,
    width: '90%',
    alignItems: 'center',
    marginTop: 20,
  },

  playerCard: {
    flex: 6,
    alignItems: 'center',
  },

  playerStats: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 5,
    width: '70%',
    marginTop: 10,
  },

  textInfo: {
    fontSize: 16,
  },

  avatarMain: {
    width: 100,
    height: 100,
    borderRadius: 15,
    marginVertical: 10,
  },

  activity: {
    marginTop: 8,
  },

});
