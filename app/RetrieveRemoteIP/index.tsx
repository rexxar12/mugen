import { View } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import QRScanner from '~/components/QRScanner';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';

export default function GetIP() {
  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          title: 'Get IP Address',
        }}
      />
      <View className="flex-row justify-center mt-5">
        <View className="flex-1 flex-row justify-center">
          <Text className="text-white mt-3 ml-5 font-semibold">IP Address: </Text>
          <Input placeholder="Enter IP Address" className="flex-1 mx-5" />
        </View>
      </View>
      <QRScanner />
    </View>
  );
}
