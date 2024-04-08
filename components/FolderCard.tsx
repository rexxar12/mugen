import { View, Text, Image, YStack, XStack, Heading, H6 } from 'tamagui';
import React, { useEffect, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface FolderCardData {
  uri: string;
  name: string;
}

export default function FolderCard({ props, title }: { props: FolderCardData[]; title: string }) {
  const [data, setData] = useState<FolderCardData[]>([]); // Add type annotation for data state variable
  const router = useRouter();
  useEffect(() => {
    if (props) {
      setData([...props]);
    }
  }, []);

  return (
    <TouchableOpacity
      style={{ flex: 1 }}
      onPress={() => {
        //@ts-ignore
        router.push(`/fileSync/ImageList?title=${title}`);
      }}>
      <View
        style={{
          flex: 1,
          height: 160,
          borderRadius: 16,
          marginHorizontal: 8,
          marginBottom: 40,
        }}>
        {data && data.length > 0 && (
          <Image
            source={{ uri: data[0].uri }}
            style={{ width: '100%', height: '100%', borderRadius: 16 }}
          />
        )}
        <Text color={'black'} numberOfLines={1} mt={4}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
