import { View } from 'tamagui';

import FileSync from './fileSync';

export default function Page() {
  return (
    <View marginHorizontal={16} mt={16}>
      <FileSync />
    </View>
  );
}
