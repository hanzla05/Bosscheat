import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, ScrollView, StyleSheet, Text, Alert, ToastAndroid, StatusBar } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
const App = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const cameraStatus = await check(PERMISSIONS.ANDROID.CAMERA);
    const photoStatus = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    const writeStatus = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);

    if (cameraStatus !== RESULTS.GRANTED) {
      await request(PERMISSIONS.ANDROID.CAMERA);
    }

    if (photoStatus !== RESULTS.GRANTED) {
      await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    }

    if (writeStatus !== RESULTS.GRANTED) {
      await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    }
  };

  const pickMultipleImages = () => {
    ImagePicker.openPicker({
      multiple: true,
    }).then(selectedImages => {
      setImages(selectedImages.map(img => {
        return { uri: img.path, width: img.width, height: img.height, mime: img.mime };
      }));
    }).catch(e => console.log(e));
  };

  const openCamera = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    }).then(image => {
      setImages([...images, { uri: image.path, width: image.width, height: image.height, mime: image.mime }]);
    }).catch(e => console.log(e));
  };

  const saveImages = async () => {
    const picturesDir = `${RNFS.ExternalDirectoryPath}/Pictures`;
    await RNFS.mkdir(picturesDir);

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const filePath = image.uri;
      const newFilePath = `${picturesDir}/image_${i}.jpg`;

      try {
        const exists = await RNFS.exists(filePath);
        if (exists) {
          await RNFS.moveFile(filePath, newFilePath);
          console.log('Image moved to', newFilePath);
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Success',
            textBody: `Image moved to ${newFilePath}`,
          })
          setImages([])
        } else {
          console.log('File does not exist:', filePath);
          ToastAndroid.show('File does not exist',ToastAndroid.LONG)
          Toast.show({
            type: ALERT_TYPE.WARNING,
            title: 'Failed',
            textBody: `File does not exist`,
          })
          setImages([])
        }
      } catch (error) {
        console.log('Error moving file:', error);
      }
    }
  };

  return (
    <AlertNotificationRoot>
<StatusBar backgroundColor={'#4CAF50'}/>
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickMultipleImages}>
          <Icon name="photo-library" size={30} color="#fff" />
          <Text style={styles.buttonText}>Pick Images</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={openCamera}>
          <Icon name="photo-camera" size={30} color="#fff" />
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={saveImages}>
          <Icon name="save" size={30} color="#fff" />
          <Text style={styles.buttonText}>Save Images</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.galleryContainer}>
        {images.length > 0 ? (
          images.map((image, index) => (
            <Image
              key={index}
              style={styles.image}
              source={{ uri: image.uri }}
            />
          ))
        ) : (
          <Text style={styles.noImagesText}>No images selected</Text>
        )}
      </ScrollView>
    </View>
    </AlertNotificationRoot>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize:11
  },
  galleryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
  },
  noImagesText: {
    fontSize: 18,
    color: '#757575',
    textAlign: 'center',
    marginTop: '60%',
    fontStyle:"italic"
  },
});

export default App;


