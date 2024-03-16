import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import { FlashList } from '@shopify/flash-list';
import FolderCard from '../../components/FolderCard';
import { getAlbums, insertAlbumInfo, insertFile } from '~/sqlite/sqlite.config';
import initDb from '../../utils/initDb';

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
  // console.log(albums); //album-> assetCount,title of album
  const db = await initDb();

  for (const album of albums) {
    await insertAlbumInfo(db, album.id, album.title, album.assetCount);
    const media = await MediaLibrary.getAssetsAsync({
      album: album,
      mediaType: ['photo', 'video'],
    });
    for (const asset of media.assets) {
      await insertFile(db, asset.id, asset.filename, album.id, album.title, asset.uri);
    }
    if (media.assets.length > 0) mediaByAlbum[album.title] = media.assets;
  }
  return mediaByAlbum;
};

const FileSync = () => {
  const [mediaAlbums, setMediaAlbums] = useState<MediaAlbums>({});
  
  useEffect(() => {
    const getPermissionsAndFetchMedia = async () => {
      const permission: string = await requestPermissions();
      if (permission === 'granted') {
        const mediaByAlbum = await fetchMedia();
        setMediaAlbums(mediaByAlbum);
      }
    };
    getPermissionsAndFetchMedia();
  }, []);

  return (
    <ScrollView>
      <Stack.Screen options={{ title: 'FileSync' }} />
      <View>
        <FlashList
          data={Object.keys(mediaAlbums)}
          numColumns={2}
          estimatedItemSize={100 || 0}
          renderItem={({ item }) => <FolderCard props={mediaAlbums[item]} title={item} />}
          keyExtractor={(item) => item}
        />
      </View>
    </ScrollView>
  );
};

export default FileSync;
