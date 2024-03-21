import { View, YStack, Input, XStack, Label } from 'tamagui';
import React from 'react';
import { Stack } from 'expo-router';
import QRScanner from '~/components/QRScanner';

export default function GetIP() {
  return (
    <View flex={1}>
      <Stack.Screen
        options={{
          title: 'Get IP Address',
        }}
      />
      <YStack marginHorizontal={16} mt={16}>
        <XStack alignItems="center" space="$4">
          <Label width={90}>IP Address</Label>
          <Input placeholder="Enter IP Address" flex={1} />
        </XStack>
      </YStack>
      <QRScanner />
    </View>
  );
}
