import { View, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'tamagui';
import * as MediaLibrary from 'expo-media-library';
import ImageView from 'react-native-image-viewing';
import { FontAwesome5 } from '@expo/vector-icons';
import initDatabase, { getFiles, getMarkedForSync, markForSync } from '~/sqlite/sqlite.config';

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
  const album = await MediaLibrary.getAlbumAsync(title);
  const media = await MediaLibrary.getAssetsAsync({
    album: album,
    sortBy: MediaLibrary.SortBy.modificationTime,
    mediaType: ['photo', 'video'],
  });
  const sortedAssets = media.assets.sort((a, b) => b.modificationTime - a.modificationTime);

  return sortedAssets;
};

const syncMarkedFiles = async (title: string) => {
  const db = await initDatabase();
  const files = await getMarkedForSync(db, title);
  console.log('Marked for sync files: ', files);
  return files;
};

export default function ImageList() {
  const searchParams = useLocalSearchParams();
  const title = searchParams.title as string;
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [imageUri, setImageUri] = useState<any[]>([]);
  const [visible, setIsVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSelectorActive, setIsSelectorActive] = useState(false);
  const [markedForSync, setMarkedForSync] = useState<string[]>([]);

  const handleLongPress = (id: string) => {
    console.log('long press id: ', id);
    setIsSelectorActive(true);
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(id)) {
        prevSelectedItems.length === 1 && setIsSelectorActive(false);

        return prevSelectedItems.filter((item) => item !== id);
      } else {
        return [...prevSelectedItems, id];
      }
    });
  };

  const handlePress = (id: string, index: number) => {
    if (isSelectorActive) {
      handleLongPress(id);
    } else {
      setIsVisible(true);
      setSelectedIndex(index);
    }
  };

  useEffect(() => {
    fetchMedia(title as string).then((media) => {
      setMediaItems(media);
      media.forEach((item) => {
        setImageUri((prevImageUri) => {
          return [...prevImageUri, { uri: item.uri }];
        });
      });
    });

    syncMarkedFiles(title as string).then((files) => {
      setMarkedForSync(files);
    });
  }, [title]);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: title,
          headerRight: () =>
            isSelectorActive && (
              <TouchableOpacity
                onPress={async () => {
                  const db = await initDatabase();
                  await markForSync(db, selectedItems);
                  const files = await getFiles(db, title);
                  console.log('files: ', files);
                }}>
                <FontAwesome5 name="sync" size={16} />
              </TouchableOpacity>
            ),
        }}
      />
      <ImageView
        images={imageUri}
        imageIndex={selectedIndex}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
      />
      <FlatList
        data={mediaItems}
        numColumns={3}
        renderItem={({ item, index }) => (
          <View style={{ marginHorizontal: 2, height: 120, width: '33%', marginVertical: 2 }}>
            <TouchableOpacity
              onPress={() => handlePress(item.id, index)}
              onLongPress={() => handleLongPress(item.id)}
              style={{
                borderWidth: selectedItems.includes(item.id) ? 2 : 0,
                borderColor: 'blue',
                width: '100%',
                height: 120,
                margin: 1,
              }}>
              <View style={{position:'absolute', flex:1, height:100}}>
                <FontAwesome5 name="flag" />
              </View>
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
