import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { uploadFilesBatch } from '~/api/upload.service';
import initDatabase, { getFilesToSync, updateFilesStatus } from '~/sqlite/sqlite.config';

const BACKGROUND_UPLOAD = 'background-upload';

interface Files {
  id: number;
  fileId: string;
  fileName: string;
  albumId: string;
  albumTitle: string;
  uri: string;
  flag: number;
}

export const handleUpload = async () => {
  console.log('Running background upload task...');
  const db = await initDatabase();
  const files: Files[] = await getFilesToSync(db);
  if (files.length === 0) {
    console.log('No files to upload');
    return;
  }

  await uploadFilesBatch(files).then(async (fileIdArray) => {
    if (fileIdArray) {
      await updateFilesStatus(db, fileIdArray);
      console.log('Files uploaded successfully');
    }
  });
  await handleUpload();
};

TaskManager.defineTask(BACKGROUND_UPLOAD, handleUpload);

export const RegisterBackgroundUpload = async () => {
  try {
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_UPLOAD);
    if (!isTaskRegistered) {
      console.log('Task is not registered, registering now...');
      await BackgroundFetch.registerTaskAsync(BACKGROUND_UPLOAD, {
        minimumInterval: 100,
        stopOnTerminate: false,
        startOnBoot: true,
      });
    } else console.log('Task is already registered');
    await BackgroundFetch.setMinimumIntervalAsync(100);
  } catch (error) {
    console.error('Error checking task registration:', error);
  }
};
