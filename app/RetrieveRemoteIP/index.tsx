import { TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { Stack } from 'expo-router';
import QRScanner from '~/components/QRScanner';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { useIPStore } from '~/state/ipStore';
import { Check } from '~/components/Icons';
import { Button } from '~/components/ui/button';

export default function GetIP() {
  const [inputIP, setInputIP] = useState<string>('');
  const ip = useIPStore((state) => state.ip);
  const setIP = useIPStore((state) => state.setIP);

  const handleIPSet = () => {
    setIP(inputIP);
    
  }

  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          title: 'Get IP Address',
          headerRight: () =>
            inputIP !== '' && (
              <View>
                <TouchableOpacity onPress={() => setIP(inputIP)}>
                  <Check className="text-foreground" size={20} strokeWidth={1.25} />
                </TouchableOpacity>
              </View>
            ),
        }}
      />
      <View className="flex-row justify-center mt-5">
        <View className="flex-1 flex-row justify-center">
          <Text className="text-white mt-3 ml-5 font-semibold">IP Address: </Text>
          <Input
            placeholder="Enter IP Address"
            className="flex-1 mx-5"
            onChangeText={(text) => setInputIP(text)}
          />
          <Button onPress={handleIPSet} className="p-2 rounded-lg mr-2" variant='outline'>
            <Check className="text-foreground" size={20} strokeWidth={1.25} />
          </Button>
        </View>
      </View>
      <QRScanner />
    </View>
  );
}
