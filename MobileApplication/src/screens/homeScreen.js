import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import React from 'react';
import {Button} from 'react-native-paper';
import {useAppData} from '../providers/AppProvider';

export default function HomeScreen({navigation}) {
  const {ipAddr} = useAppData();
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />

      <Button
        textColor="#2e2e2e"
        style={{position: 'absolute', top: 10, right: 10}}
        onPress={() => {
          navigation.navigate('Settings');
        }}>
        Settings
      </Button>

      <View style={styles.main}>
        <Text style={styles.title}>Welcome to the DeepTracerV0</Text>

        <Text style={styles.description}>
          Detect deepfakes, reverse search images, and view detection statistics
          all in one place.
        </Text>

        {/* <TouchableOpacity onPress={() => navigation.navigate('Detect')}>
            <Text style={styles.button}>Detect Deepfakes</Text>
          </TouchableOpacity> */}
        <TouchableOpacity onPress={() => navigation.navigate('ReverseSearch')}>
          <Text style={styles.button}>Detection with RIS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('WebView', {
              url: `http://${ipAddr}:3000/dashboard`,
            });
          }}>
          <Text style={styles.button}>View Dashboard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text
          style={{
            color: '#2e2e2e',
          }}>
          © 2024 DeepTracer. All rights reserved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    marginHorizontal: 5,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2e2e2e',
    textAlign: 'center',
  },
  description: {
    color: '#2e2e2e',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    paddingVertical: 13,
    width: 180,
    backgroundColor: '#2e2e2e',
    color: '#fff',
    borderRadius: 10,
    marginVertical: 10,
    textAlign: 'center',
  },
  footer: {
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
