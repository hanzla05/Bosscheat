import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ToastAndroid, Alert, LogBox } from 'react-native';
import { authorize } from 'react-native-app-auth';
import AzureAuth from 'react-native-azure-auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
LogBox.ignoreAllLogs()

const TENANT_ID = '7da7b706-601a-468d-a6c2-a2e74c62af76';
const CLIENT_ID = '25b62871-76db-4921-a999-a0bd9f45f492';

const azureAuth = new AzureAuth({
  tenantId: TENANT_ID,
  clientId: CLIENT_ID,
});

const configs = {
  identityserver: {
    issuer: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
    clientId: CLIENT_ID,
    redirectUrl: Platform.OS === 'android'
      ? 'com.community360connect://com.community360connect/android/callback'
      : null,
    additionalParameters: {},
    scopes: ['openid', 'profile', 'email', 'phone', 'address', 'User.Read'],
  },
};

const App = () => {
  GoogleSignin.configure({
    webClientId: '225695230346-j60s61g5f2ogn57410obke57kbf3ldkk.apps.googleusercontent.com',
  });

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo)
      const idToken = userInfo?.data?.idToken;

      if (!idToken) throw new Error('idToken is not available in the response');

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);

      console.log('Sign-in successful');
      ToastAndroid.show('Sign-in successful',ToastAndroid.LONG)
      const { name, email } = userInfo?.data?.user || {};
      Alert.alert('Login Successful', `Name: ${name}\nEmail: ${email}`);
    } catch (error) {
      console.error('Google Sign-In Error:', error);

      if (error.code) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('User cancelled the login');
            break;
          case statusCodes.IN_PROGRESS:
            console.log('Sign-in in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('Play services not available or outdated');
            break;
          default:
            console.log('Unknown error:', error.message);
        }
      }
    }
  };

  const handleLogin = useCallback(async () => {
    try {
      const result = await authorize(configs.identityserver);
      console.log('Result:', result);

      if (result) {
        const info = await azureAuth.auth.msGraphRequest({
          token: result.accessToken,
          path: '/me',
        });
        console.log('info', info);
      }
    } catch (error) {
      console.error('Error:', JSON.stringify(error, null, 2));
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Welcome to the Community App</Text>

      <TouchableOpacity style={styles.microsoftButton} onPress={handleLogin}>
        <Text style={styles.microsoftButtonText}>Sign in with Microsoft</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  microsoftButton: {
    backgroundColor: '#0078d4',
    width: '90%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  microsoftButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#db4437',
    width: '90%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
