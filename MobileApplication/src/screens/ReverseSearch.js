import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import React, {useState} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import {DataTable} from 'react-native-paper';
import {useAppData} from '../providers/AppProvider';

export default function ReverseSearch() {
  const {ipAddr} = useAppData();
  const [searchResult, setSearchResult] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportedIds, setReportedIds] = useState([]);
  const [image, setImage] = useState(null);

  const handleChoosePhoto = () => {
    launchImageLibrary({noData: true}, response => {
      // console.log(response);
      if (response?.assets) {
        setInput(response?.assets[0].originalPath);
        setImage(response?.assets[0]);
      }
    });
  };

  const handleSubmit = async () => {
    if (!input) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append('image', {
      name: 'photo.jpeg',
      uri: image.uri,
      type: 'image/jpeg',
    });

    // console.log(image);

    // Simulated API call
    try {
      const response = await fetch(`http://${ipAddr}:5000/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await response.json();
      if (response.status === 200) {
        if (data?.error) {
          return Alert.alert('Error', `${data?.error}`);
        }
        // console.log(data);
        setSearchResult([
          {id: Math.floor(Math.random() * 10000), result: data.prediction},
        ]);
      }
    } catch (error) {
      Alert('Error', error);
      console.error('Error uploading file:', error);
    }
    setIsLoading(false);
  };

  const handleReport = id => {
    setReportedIds(prev => [...prev, id]);
    Toast.show({
      type: 'success',
      text1: `Result ${id} has been reported and removed.`,
    });
  };

  const handleReportAll = () => {
    if (searchResult) {
      const unreportedIds = searchResult
        .filter(result => !reportedIds.includes(result.id))
        .map(result => result.id);
      setReportedIds(prev => [...prev, ...unreportedIds]);
      Toast.show({
        type: 'success',
        text1: `All ${unreportedIds.length} remaining results have been reported and removed.`,
      });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingBottom: 50}}>
      <Text style={styles.title}>DeepTracerV0 - Advanced Deepfake Detextion Platform</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Deepfake Detector with Reverse Image Search</Text>
        <Text style={styles.cardDescription}>
          Uncover the truth behind images with our advanced reverse search
          technology.
        </Text>

        <View style={styles.formGroup}>
          <Text style={{color: '#2e2e2e', marginBottom: 10}}>Image URL</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter image URL"
            value={input}
            onChangeText={text => setInput(text)}
          />
        </View>

        <Text style={{color: '#2e2e2e', marginBottom: 10}}>
          Or upload an image
        </Text>
        {image != null && (
          <Image
            source={{uri: image.uri}}
            style={{
              width: '100%',
              height: 250,
              resizeMode: 'contain',
              marginBottom: 15,
            }}
          />
        )}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleChoosePhoto}>
          <Text style={[styles.buttonText, {color: '#2e2e2e'}]}>
            Upload Image
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={!input || isLoading}>
          <Text style={[styles.buttonText, {color: '#fff'}]}>
            {isLoading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {searchResult && searchResult.length > reportedIds.length && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Search Results</Text>
          <TouchableOpacity
            style={styles.reportAllButton}
            onPress={handleReportAll}>
            <Text style={[styles.buttonText, {color: '#fff'}]}>Report All</Text>
          </TouchableOpacity>

          {searchResult
            .filter(result => !reportedIds.includes(result.id))
            .map(item => (
              <View key={item.id.toString()} style={styles.resultRow}>
                <DataTable style={{padding: 15}}>
                  <DataTable.Header style={{backgroundColor: '#DCDCDC'}}>
                    <DataTable.Title>ID</DataTable.Title>
                    <DataTable.Title>Name</DataTable.Title>
                    <DataTable.Title>Result</DataTable.Title>
                  </DataTable.Header>
                  <DataTable.Row
                    style={{
                      padding: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <DataTable.Cell>{item.id}</DataTable.Cell>
                    <DataTable.Cell>
                      <Text style={{color: '#2e2e2e', padding: 4}}>
                        {image.fileName}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell>{item.result}</DataTable.Cell>
                  </DataTable.Row>
                </DataTable>
                <TouchableOpacity onPress={() => handleReport(item.id)}>
                  <Text style={styles.reportButton}>Report</Text>
                </TouchableOpacity>
              </View>
            ))}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>How It Works?</Text>
        <Text style={styles.cardDescription}>
          {`1. Upload an image or provide a URL\n2. Our system analyzes the image and searches across multiple platforms\n3. We present you with potential matches and their similarity scores\n4. Review the results to determine if the image might be manipulated\n5. Report any suspicious or problematic results individually or all at once`}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>About DeepTracer</Text>
        <Text style={styles.cardDescription}>
          DeepTracer is a cutting-edge tool designed to help you
          identify potential deepfakes and manipulated images. Our advanced
          algorithms search across multiple platforms to find similar images and
          analyze their authenticity
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Disclaimer</Text>
        <Text style={styles.cardDescription}>
          While our tool is highly effective, it's not infallible. Always use
          critical thinking and multiple sources to verify the authenticity of
          an image.
        </Text>
      </View>

      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2e2e2e',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#e5e5e5',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 22,
    color: '#2e2e2e',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 20,
    color: '#434242',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 10,
  },
  input: {
    borderColor: '#ccc',
    color: '#2e2e2e',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#2e2e2e',
    padding: 13,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    fontSize: 16,
  },
  resultRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  reportButton: {
    color: 'red',
  },
  reportAllButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
});
