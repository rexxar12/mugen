import React, { useEffect, useState } from 'react';
import { TouchableOpacity, FlatList, View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import FolderCard from '../../components/FolderCard';
import { insertAlbumInfo } from '~/sqlite/sqlite.config';
import { MaterialIcons } from '@expo/vector-icons';
import initDb from '~/utils/initDb';
import { RegisterBackgroundUpload, handleUpload } from '~/utils/backgroundServices';

export interface MediaAlbums {
  [key: string]: { assets: any[]; total: number };
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
  const mediaByAlbum: MediaAlbums = {}; // Explicitly define the type of mediaByAlbum
  const db = await initDb();
  await insertAlbumInfo(db, albums);
  for (const album of albums) {
    const media = await MediaLibrary.getAssetsAsync({
      album: album,
      mediaType: ['photo', 'video'],
      first: 1, // Fetch only the first image or video from each album
    });
    if (media.assets.length > 0)
      mediaByAlbum[album.title] = { assets: media.assets, total: album.assetCount };
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
    getPermissionsAndFetchMedia()
      .catch((error) => {
        console.error('Error fetching media:', error);
      })
      .finally(() => {
        setLoading(false);
        RegisterBackgroundUpload();
      });
  }, []);

  if (loading)
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'FileSync',
          headerRight: () => {
            return (
              <View style={{ flexDirection: 'row' }}>
                <Link href="/RetrieveRemoteIP/" style={{ marginRight: 20 }}>
                  <MaterialIcons name="qr-code-scanner" size={24} />
                </Link>
                <TouchableOpacity onPress={async () => await handleUpload()}>
                  <MaterialIcons name="refresh" size={24} />
                </TouchableOpacity>
              </View>
            );
          },
        }}
      />
      <View style={{ flex: 1, marginTop: 12 }}>
        <FlatList
          data={Object.keys(mediaAlbums)}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <FolderCard props={mediaAlbums[item]} title={item} index={index} />
          )}
          keyExtractor={(item) => item}
        />
      </View>
    </View>
  );
};

export default FileSync;
