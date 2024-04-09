import { View } from 'react-native';

import FileSync from './fileSync';

export default function Page() {
  return (
    <View style={{ marginHorizontal: 8, flex: 1 }}>
      <FileSync />
    </View>
  );
}
