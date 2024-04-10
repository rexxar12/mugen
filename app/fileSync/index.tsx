import React, { useEffect, useState } from 'react';
import { TouchableOpacity, FlatList, View } from 'react-native';
import { Link, Stack } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import FolderCard from '../../components/FolderCard';
import { insertAlbumInfo } from '~/sqlite/sqlite.config';
import { MaterialIcons } from '@expo/vector-icons';
import initDb from '~/utils/initDb';
import { RegisterBackgroundUpload, handleUpload } from '~/utils/backgroundServices';

import { RefreshCcw, ScanLine } from '~/components/Icons';
import { Text } from '~/components/ui/text';
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
    <View className='flex-1 mt-4'>
      <Stack.Screen
        options={{
          title: 'Albums',
          headerRight: () => {
            return (
              <View style={{ flexDirection: 'row' }}>
                <Link href="/RetrieveRemoteIP/" style={{ marginRight: 24 }}>
                  <ScanLine className="text-foreground" size={20} strokeWidth={1.25} />
                </Link>

                <TouchableOpacity onPress={async () => await handleUpload()}>
                  <RefreshCcw className="text-foreground" size={20} strokeWidth={1.25} />
                </TouchableOpacity>
              </View>
            );
          },
        }}
      />
      <View>
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
