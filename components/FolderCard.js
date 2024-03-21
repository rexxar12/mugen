import { View, Text, Image, YStack, XStack, Heading, H6 } from 'tamagui';
import React, { useEffect, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function FolderCard({ props, title }) {
  const [data, setData] = useState([]);
  const router = useRouter();
  
  useEffect(() => {
    if (props) {
      const splicedData = [...props].splice(0, 4);
      setData(splicedData);
    }
  }, []);
  return (
    <TouchableOpacity
      style={{ flex: 1 }}
      onPress={() => {
        router.push(`/fileSync/ImageList?title=${title}`);
      }}>
      <View margin={5} height={210} flex={1}>
        <FlashList
          data={data}
          numColumns={2}
          estimatedItemSize={91}
          renderItem={({ item, index }) => (
            <View style={{ height: 90, width: '100%' }}>
              <Image
                src={item.uri}
                style={{
                  height: 88,
                  borderTopLeftRadius: index === 0 ? 15 : 0,
                  borderTopRightRadius: index === 1 ? 15 : 0,
                  borderBottomLeftRadius: index === 2 ? 15 : 0,
                  borderBottomRightRadius: index === 3 ? 15 : 0,
                  marginHorizontal: 1,
                }}
                resizeMode="cover"
              />
              <Text>{item.name}</Text>
            </View>
          )}
        />
        <H6 color={'black'} numberOfLines={1}>
          {title}
        </H6>
      </View>
    </TouchableOpacity>
  );
}
