import { View } from 'tamagui';

import FileSync from './fileSync';

export default function Page() {
  return (
    <View marginHorizontal={8} mt={16} flex={1}>
      <FileSync />
    </View>
  );
}
