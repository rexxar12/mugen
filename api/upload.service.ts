import AsyncStorage from '@react-native-async-storage/async-storage';

interface Files {
  id: number;
  fileId: string;
  fileName: string;
  albumId: string;
  albumTitle: string;
  uri: string;
  flag: number;
}

export const uploadFilesBatch = async (files: Files[]) => {
  const endpoint: string | null = await AsyncStorage.getItem('endpoint');
  console.log('endpoint',endpoint)
  if (!endpoint) return;

  const formData = new FormData();
  let fileIdArray = [];

  for (const file of files) {
    const filename = file.fileName; // Extract filename from URI
    fileIdArray.push(file.id);
    // @ts-ignore
    formData.append('files', {
      uri: file.uri,
      name: filename,
      type: 'application/octet-stream', // Adjust content type based on file type
    });
  }
 
  try {
    const response = await fetch(`${endpoint}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      console.error('Upload failed:', response.statusText);
      // Handle upload failure (e.g., retry mechanism)
    } else {
      console.log('Upload successful for batch of files');
      // Handle successful upload (e.g., remove files from database)
      return fileIdArray;
    }
  } catch (error) {
    console.error('Upload error:', error);
    // Handle upload errors
  }
};
