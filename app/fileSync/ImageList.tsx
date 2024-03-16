import { View, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'tamagui';
import * as MediaLibrary from 'expo-media-library';
import initDb from '~/utils/initDb';
import { getAlbums, getFiles } from '~/sqlite/sqlite.config';

interface MediaItem {
  albumId: string;
  creationTime: number;
  duration: number;
  filename: string;
  height: number;
  id: string;
  localUri: string;
  modificationTime: number;
  uri: string;
  width: number;
}

const fetchMedia = async (title: string) => {
  const db = await initDb();
  const files = await getFiles(db, title);
  await getAlbums(db);
  console.log(files);
  const album = await MediaLibrary.getAlbumAsync(title);
  const media = await MediaLibrary.getAssetsAsync({
    album: album,
    sortBy: MediaLibrary.SortBy.modificationTime,
    mediaType: ['photo', 'video'],
  });
  const sortedAssets = media.assets.sort((a, b) => b.creationTime - a.creationTime);
  return sortedAssets;
};

export default function ImageList() {
  const searchParams = useLocalSearchParams();
  const title = searchParams.title;
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handlePress = (id: string) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(id)) {
        return prevSelectedItems.filter((item) => item !== id);
      } else {
        return [...prevSelectedItems, id];
      }
    });
  };

  useEffect(() => {
    fetchMedia(title as string).then((media) => {
      setMediaItems(media);
    });
  }, [title]);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'ImageList' }} />
      <FlatList
        data={mediaItems}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={{ marginHorizontal: 2, height: 120, width: '33%', marginVertical: 2 }}>
            <TouchableOpacity
              onPress={() => handlePress(item.id)}
              style={{
                borderWidth: selectedItems.includes(item.id) ? 2 : 0,
                borderColor: 'blue',
                width: '100%',
                height: 120,
                margin: 1,
              }}>
              <Image
                source={{ uri: item.uri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item: MediaItem) => item.id}
      />
    </View>
  );
}
