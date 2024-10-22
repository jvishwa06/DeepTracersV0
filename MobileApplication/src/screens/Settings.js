import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import React, {useState} from 'react';
import {useAppData} from '../providers/AppProvider';
import Toast from 'react-native-toast-message';

export default function Settings() {
  const {ipAddr, setIpAddr} = useAppData();
  const [input, setInput] = useState(ipAddr);
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />

      <Text style={styles.title}>Settings</Text>
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 10,
          padding: 20,
          marginBottom: 20,
          borderWidth: 0.5,
          borderColor: '#e5e5e5',
          elevation: 2,
        }}>
        <View style={{marginBottom: 10}}>
          <Text style={{color: '#2e2e2e', marginBottom: 10}}>Image URL</Text>
          <TextInput
            style={{
              borderColor: '#ccc',
              color: '#2e2e2e',
              borderWidth: 1,
              padding: 10,
              borderRadius: 10,
              marginBottom: 10,
            }}
            placeholder="Enter IP Address"
            value={input}
            onChangeText={text => setInput(text)}
          />
          <TouchableOpacity
            style={{
              backgroundColor: '#2e2e2e',
              padding: 13,
              borderRadius: 10,
              alignItems: 'center',
              marginTop: 15,
            }}
            onPress={() => {
              setIpAddr(input);
              Toast.show({
                type: 'success',
                text1: `IP Address Changed`,
              });
            }}>
            <Text style={{color: '#fff', fontSize: 16}}>Change IP</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text
          style={{
            color: '#2e2e2e',
          }}>
          © 2024 DeepTracer Detector. All rights reserved.
        </Text>
      </View>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    // alignItems: 'center',
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
