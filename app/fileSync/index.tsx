import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Link, Stack } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import { FlashList } from '@shopify/flash-list';
import FolderCard from '../../components/FolderCard';
import initDatabase, { insertAlbumInfo } from '~/sqlite/sqlite.config';
import { Text } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';

export interface MediaAlbums {
  [key: string]: any[];
}

const requestPermissions = async () => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Sorry, we need camera roll permissions to fetch photos and videos.');
  }
  return status;
};

const fetchMedia = async () => {
  const albums = await MediaLibrary.getAlbumsAsync();
  const mediaByAlbum: { [key: string]: any[] } = {};

  const db = await initDatabase();
  for (const album of albums) {
    await insertAlbumInfo(db, album.title, album.id, album.assetCount);
    const media = await MediaLibrary.getAssetsAsync({
      album: album,
      mediaType: ['photo', 'video'],
    });
    if (media.assets.length > 0) mediaByAlbum[album.title] = media.assets;
  }
  return mediaByAlbum;
};

const FileSync = () => {
  const [mediaAlbums, setMediaAlbums] = useState<MediaAlbums>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getPermissionsAndFetchMedia = async () => {
      const permission: string = await requestPermissions();
      if (permission === 'granted') {
        const mediaByAlbum = await fetchMedia();
        setMediaAlbums(mediaByAlbum);
      }
    };
    getPermissionsAndFetchMedia().then(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <ScrollView>
      <Stack.Screen
        options={{
          title: 'FileSync',
          headerRight: () => {
            return (
              <View>
                <Link href="/RetrieveRemoteIP/">
                  <MaterialIcons name="qr-code-scanner" size={24} />
                </Link>
              </View>
            );
          },
        }}
      />
      <View style={{ flex: 1 }}>
        <FlashList
          data={Object.keys(mediaAlbums)}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={210}
          renderItem={({ item }) => <FolderCard props={mediaAlbums[item]} title={item} />}
          keyExtractor={(item) => item}
        />
      </View>
    </ScrollView>
  );
};

export default FileSync;
