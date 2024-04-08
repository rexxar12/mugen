import { View, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Image, Text } from 'tamagui';
import * as MediaLibrary from 'expo-media-library';
import ImageView from 'react-native-image-viewing';
import { FontAwesome5, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import initDatabase, {
  getFiles,
  getMarkedForSync,
  insertFiles,
  unmarkSyncItem,
} from '~/sqlite/sqlite.config';

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
    first: 50,
  });
  return media.assets;
};

const syncMarkedFiles = async (title: string) => {
  const db = await initDatabase();
  const files = await getMarkedForSync(db, title);
  return files;
};

export default function ImageList() {
  const searchParams = useLocalSearchParams();
  const title = searchParams.title as string;

  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [imageUri, setImageUri] = useState<any[]>([]);
  const [visible, setIsVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSelectorActive, setIsSelectorActive] = useState(false);
  const [markedForSync, setMarkedForSync] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);

  const handleLongPress = (index: number) => {
    setIsSelectorActive(true);
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(index)) {
        prevSelectedItems.length === 1 && setIsSelectorActive(false);
        return prevSelectedItems.filter((item) => item !== index);
      } else {
        return [...prevSelectedItems, index];
      }
    });
  };

  const handlePress = (index: number) => {
    if (isSelectorActive) {
      handleLongPress(index);
    } else {
      setIsVisible(true);
      setSelectedIndex(index);
    }
  };

  useEffect(() => {
    fetchMedia(title as string).then((media) => {
      setMediaItems(media);
      const newImageUri = media.map((item) => ({ uri: item.uri }));
      setImageUri(newImageUri);
    });
  }, [title]);

  useEffect(() => {
    syncMarkedFiles(title as string).then((files) => {
      setMarkedForSync(files);
      setIsSyncing(false);
    });
  }, [title, isSyncing]);
  console.log('Marked for sync:', markedForSync);
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: title,
          headerRight: () =>
            isSelectorActive && (
              <View style={{ flexDirection: 'row', width: 70, justifyContent: 'space-between' }}>
                <TouchableOpacity
                  onPress={async () => {
                    const db = await initDatabase();
                    await unmarkSyncItem(db, selectedItems).then(() => {
                      setIsSyncing(true);
                      setSelectedItems([]);
                      console.log('Synced');
                      setIsSelectorActive(false);
                    });
                  }}>
                  <FontAwesome6 name="xmark" size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    const files = mediaItems.filter((item, index) => selectedItems.includes(index));
                    const db = await initDatabase();
                    await insertFiles(db, files, title).then(() => {
                      setIsSyncing(true);
                      setSelectedItems([]);
                      console.log('Files set');
                      setIsSelectorActive(false);
                    });
                  }}>
                  <FontAwesome5 name="sync" size={16} />
                </TouchableOpacity>
              </View>
            ),
        }}
      />
      <ImageView
        images={imageUri}
        imageIndex={selectedIndex}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
      />

      {/* Render image list */}
      <FlatList
        data={mediaItems}
        numColumns={3}
        renderItem={({ item, index }) => (
          <View style={{ marginHorizontal: 2, height: 120, width: '33%', marginVertical: 4 }}>
            {markedForSync.includes(item.id) && (
              <View style={{ position: 'absolute', flex: 1, zIndex: 1, right: 4, top: 4 }}>
                <MaterialCommunityIcons name="flag" color="red" size={20} />
              </View>
            )}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handlePress(index)}
              onLongPress={() => handleLongPress(index)}
              style={{
                borderWidth: selectedItems.includes(index) ? 2 : 0,
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
