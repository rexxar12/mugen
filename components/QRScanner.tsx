import { View, Text, Button, Image } from 'tamagui';
import React, { useEffect, useState } from 'react';
import { CameraView, Camera } from 'expo-camera/next';
import { Alert, StyleSheet } from 'react-native';
import { useIPStore } from '~/state/ipStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function QRScanner() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [scanned, setScanned] = useState(false);
  const ip = useIPStore((state) => state.ip);
  const setIP = useIPStore((state) => state.setIP);

  useEffect(() => {
    if (ip) {
      const storeEndpoint = async () => await AsyncStorage.setItem('endpoint', ip);
      storeEndpoint().then(() => {
        console.log('IP stored');
      });
    }
  }, [ip]);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setIP(data);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ position: 'absolute', height: '100%', width: '100%', zIndex: -1 }}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417'],
        }}
        style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{}}>
          <Image
            src={require('../assets/images/qr_overlay.png')}
            style={{ height: 270, width: 289 }}
            resizeMode="cover"
          />
        </View>
      </CameraView>
    </View>
  );
}
