import { View, Text } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import QRScanner from '~/components/QRScanner';

export default function GetIP() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Get IP Address',
        }}
      />

      <Text>IP Address</Text>
      {/* <Input placeholder="Enter IP Address" flex={1} /> */}

      <QRScanner />
    </View>
  );
}
