import { View, TouchableOpacity, FlatList, Image } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import ImageView from 'react-native-image-viewing';
import { FontAwesome5, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import initDatabase, {
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

type MarkedItem = {
  id: string;
  flag: number;
};

const fetchMedia = async (title: string) => {
  const album = await MediaLibrary.getAlbumAsync(title);
  const media = await MediaLibrary.getAssetsAsync({
    album: album,
    sortBy: MediaLibrary.SortBy.modificationTime,
    mediaType: ['photo', 'video'],
    first: 100,
  });
  return media.assets;
};

const syncMarkedFiles = async (title: string) => {
  const db = await initDatabase();
  const files = await getMarkedForSync(db, title);
  return files;
};

//ts-ignore
const ImageListItem = React.memo(
  ({ item, index, handlePress, handleLongPress, markedForSync, selectedItems }) => {
    const markedItem = markedForSync.find((marked) => marked.id === item.id);
    let flagComponent = null;
    if (markedItem) {
      const iconName = markedItem.flag === 2 ? 'cloud-check-outline' : 'cloud-off-outline';
      flagComponent = (
        <View style={{ position: 'absolute', flex: 1, zIndex: 1, right: 4, bottom: 4 }}>
          <MaterialCommunityIcons name={iconName} size={20} color="white" />
        </View>
      );
    }
    return (
      <View style={{ marginHorizontal: 2, height: 120, width: '33%', marginVertical: 4 }}>
        {flagComponent}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handlePress(index)}
          onLongPress={() => handleLongPress(index)}
          style={{
            borderWidth: selectedItems.has(index) ? 2 : 0,
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
    );
  }
);

export default function ImageList() {
  const searchParams = useLocalSearchParams();
  const title = searchParams.title as string;

  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [imageUri, setImageUri] = useState<any[]>([]);
  const [visible, setIsVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSelectorActive, setIsSelectorActive] = useState(false);
  const [markedForSync, setMarkedForSync] = useState<MarkedItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);

  const handleLongPress = useCallback((index: number) => {
    setIsSelectorActive(true);
    setSelectedItems((prevSelectedItems) => {
      const newSelectedItems = new Set(prevSelectedItems);
      if (newSelectedItems.has(index)) {
        newSelectedItems.delete(index);
        newSelectedItems.size === 0 && setIsSelectorActive(false);
      } else {
        newSelectedItems.add(index);
      }
      return newSelectedItems;
    });
  }, []);

  const handlePress = useCallback(
    (index: number) => {
      if (isSelectorActive) {
        handleLongPress(index);
      } else {
        setIsVisible(true);
        setSelectedIndex(index);
      }
    },
    [isSelectorActive, handleLongPress]
  );

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


  const HeaderRight = useMemo(() => {
    if (!isSelectorActive) return null;
    return (
      <View style={{ flexDirection: 'row', width: 70, justifyContent: 'space-between' }}>
        <TouchableOpacity
          onPress={async () => {
            const db = await initDatabase();
            await unmarkSyncItem(db, selectedItems).then(() => {
              setIsSyncing(true);
              setSelectedItems(new Set());
              console.log('Synced');
              setIsSelectorActive(false);
            });
          }}>
          <FontAwesome6 name="xmark" size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            const files = mediaItems.filter((_, index) => selectedItems.has(index));
            const db = await initDatabase();
            await insertFiles(db, files, title).then(() => {
              setIsSyncing(true);
              setSelectedItems(new Set());
              console.log('Files set');
              setIsSelectorActive(false);
            });
          }}>
          <FontAwesome5 name="sync" size={16} />
        </TouchableOpacity>
      </View>
    );
  }, [isSelectorActive, selectedItems, mediaItems, title]);
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: title,
          headerRight: () => HeaderRight,
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
          <ImageListItem
            item={item}
            index={index}
            handlePress={handlePress}
            handleLongPress={handleLongPress}
            markedForSync={markedForSync}
            selectedItems={selectedItems}
          />
        )}
        keyExtractor={(item: MediaItem) => item.id}
      />
    </View>
  );
}
