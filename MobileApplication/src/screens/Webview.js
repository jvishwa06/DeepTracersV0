import React, {useState} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import WebView from 'react-native-webview';

export default function Webview({route}) {
  const {url} = route.params;
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  return (
    <>
      {error ? (
        <Error errorMessage={error.message} />
      ) : (
        <WebView
          source={{uri: url}}
          style={{flex: 1}}
          startInLoadingState={true}
          onError={error => setError(error)}
          onLoad={() => {
            setIsLoading(false);
          }}
          renderLoading={() => (
            <ActivityIndicator size="large" color={'#2e2e2e'} />
          )}
          onNavigationStateChange={navState => {
            // console.log(navState);
          }}
        />
      )}
      {isLoading == true && (
        <View
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color={'#2e2e2e'} />
        </View>
      )}
    </>
  );
}
