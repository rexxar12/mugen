import { Stack, Link } from 'expo-router';
import { View, YStack } from 'tamagui';

import { Container, Main, Title, Subtitle, Button, ButtonText } from '../tamagui.config';
import FileSync from './fileSync';

export default function Page() {
  return (
    <View marginHorizontal={8} mt={8}>
      <FileSync />
    </View>
  );
}
