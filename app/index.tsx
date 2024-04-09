import { View } from 'tamagui';

import FileSync from './fileSync';

export default function Page() {
  return (
    <View marginHorizontal={8} flex={1}>
      <FileSync />
    </View>
  );
}
