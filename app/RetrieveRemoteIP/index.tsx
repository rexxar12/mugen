import { View, Text, TextInput } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import QRScanner from '~/components/QRScanner';
import { Input } from '~/components/ui/input';

export default function GetIP() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Get IP Address',
        }}
      />
      <View style={{flexDirection:'row'}}>
        <Text>IP Address</Text>
        <Input placeholder="Enter IP Address" />
      </View>
      <QRScanner />
    </View>
  );
}
