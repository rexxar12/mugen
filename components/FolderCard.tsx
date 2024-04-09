import React, { useEffect, useState } from 'react';
import { ImageBackground, TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';

type File = {
  albumId: string;
  creationTime: number;
  duration: number;
  filename: string;
  height: number;
  id: string;
  mediaType: string;
  modificationTime: number;
  uri: string;
  width: number;
};

interface FolderCardData {
  assets: File[];
  total: number;
}

export default function FolderCard({
  props,
  title,
  index,
}: {
  props: FolderCardData;
  title: string;
  index: number;
}) {
  const [data, setData] = useState<File[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (props) {
      setData([...props.assets]);
    }
  }, []);

  const borders = {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: index % 2 !== 0 ? 0 : 20,
    borderBottomRightRadius: index % 2 === 0 ? 0 : 20,
  };

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
          marginHorizontal: 8,
          marginBottom: 12,
          ...borders,
        }}>
        {data && data.length > 0 && (
          <ImageBackground
            source={{ uri: data[0].uri }}
            style={{ width: '100%', height: '100%' }}
            imageStyle={borders}>
            <View
              style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                ...borders,
              }}></View>
          </ImageBackground>
        )}
        <View style={{ position: 'absolute', bottom: 24, left: 20 }}>
          <Text style={{ color: 'white', fontWeight: '700' }} numberOfLines={2}>
            {title}
          </Text>
          <Text style={{ color: 'white' }}>{props.total} items</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
