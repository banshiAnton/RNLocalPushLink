import React, { Component } from 'react'
import { Button, StyleSheet, Text, View, AppState, Picker, Platform } from 'react-native'
import PushNotification from 'react-native-push-notification'
import DeviceInfo from 'react-native-device-info'
import ConnectyCube from 'connectycube-reactnative'

ConnectyCube.init({
  appId: 617,
  authKey: 'EuttymgdCkUQbCr',
  authSecret: 'RquZgHxx5DXUWK8'
}, {
  debug: { mode: 1 }
})

const SENDER_ID = '275286813344'
export default class App extends Component {

  state = {
    timeout: '10'
  }

  _configPush() {
    PushNotification.configure({

        // (optional) Called when Token is generated (iOS and Android)
        onRegister: this.onSubscribe,
  
      // (required) Called when a remote or local notification is opened or received
       onNotification: this.onNotification,
    
        // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications) 
        senderID: SENDER_ID,
    
        // IOS ONLY (optional): default: all - Permissions to register.
        permissions: {
            alert: true,
            badge: true,
            sound: true
        },
    
        // Should the initial notification be popped automatically
        // default: true
        popInitialNotification: true,
    
        /**
          * (optional) default: true
          * - Specified if permissions (ios) and token (android and ios) will requested or not,
          * - if not, you must call PushNotificationsHandler.requestPermissions() later
          */
        requestPermissions: true,
    });
  }

  onSubscribe(register) {
    const params = {
      notification_channels: Platform.OS === 'ios' ? 'apns' : 'gcm',
      device: {
        platform: Platform.OS,
        udid: DeviceInfo.getUniqueID()
      },
      push_token: {
        environment: __DEV__ ? 'development' : 'production',
        client_identification_sequence: register.token
      }
    }

    console.log('[PushNotificationService][onSubscribe] params', params)

    ConnectyCube.createSession({ login: 'testeranton', password: '12345678' }, (error, session) => {
      console.warn({ error, session })
      ConnectyCube.pushnotifications.subscriptions.create(params, (error, response) => {
        console.warn({ error, response })
      })
    })
    console.log('[PushNotificationService][onNotification] reg', register)
  }

  onNotification(message) {
    console.log('[PushNotificationService][onNotification] message', message)
  }

  componentDidMount() {
    AppState.addEventListener('change', this.onStateChange)
    this._configPush()
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.onStateChange)
  }

  onStateChange = state => {
    if (state !== 'active') {
      this._pushShedul()
    }
  }

  _pushShedul = () => {
    console.log('ON ACTIVE')
    const { timeout } = this.state
    PushNotification.localNotificationSchedule({
      message: "My Notification Message", // (required)
      date: new Date(Date.now() + (+timeout * 1000)) // in 60 secs
    })
  }
  
  _createLocalPush() {
    console.log('ACTIVE PUSH')
    PushNotification.localNotification({
        /* Android Only Properties */
        ticker: "My Notification Ticker", // (optional)
        autoCancel: true, // (optional) default: true
        largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
        smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
        bigText: "My big text that will be shown when notification is expanded", // (optional) default: "message" prop
        subText: "This is a subText", // (optional) default: none
        color: "green", // (optional) default: system default
        vibrate: true, // (optional) default: true
        vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
        tag: 'some_tag', // (optional) add tag to message
        group: "group" + Math.random() , // (optional) add group to message
        ongoing: false, // (optional) set whether this is an "ongoing" notification
    
        /* iOS only properties 
        alertAction: // (optional) default: view
        category: // (optional) default: null
        userInfo: // (optional) default: null (object containing additional notification data)
        */

        /* iOS and Android properties */
        title: "My Notification Title", // (optional, for iOS this is only used in apple watch, the title will be the app name on other iOS devices)
        message: "My Notification Message", // (required)
        playSound: true, // (optional) default: true
        soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        number: '10', // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Picker
          selectedValue={this.state.timeout}
          style={{height: 50, width: 70}}
          onValueChange={ timeout => this.setState({ timeout }) }>
          {
            [...new Array(120)].map((val, i) => <Picker.Item key={i} label={i + ''} value={i + ''} />)
          }
        </Picker>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Button title="create push notification" onPress={this._createLocalPush} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  }
})
