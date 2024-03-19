import * as SQLite from 'expo-sqlite';
const FILES = 'files';
const ALBUM_INFO = 'album_info';

export default async function initDatabase() {
  try {
    const db = SQLite.openDatabase('mugen');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export async function createFilesTable(db) {
  const query = ` CREATE TABLE IF NOT EXISTS ${FILES} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fileId VARCHAR UNIQUE,
        fileName VARCHAR,
        albumId VARCHAR,
        albumTitle VARCHAR,
        uri VARCHAR UNIQUE,
        flag INTEGER)
        `;
  await db.transaction((tx) => {
    tx.executeSql(query);
  });
}

export async function insertFile(db, fileId, fileName, albumId, albumTitle, uri) {
  const query = `INSERT OR IGNORE INTO ${FILES} (fileId, fileName, albumId, albumTitle, uri, flag) VALUES (?, ?, ?, ?, ?, ?)`;
  await db.transaction((tx) => {
    tx.executeSql(query, [fileId, fileName, albumId, albumTitle, uri, 0]);
  });
}

export async function createAlbumInfoTable(db) {
  const query = ` CREATE TABLE IF NOT EXISTS ${ALBUM_INFO} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            albumTitle VARCHAR UNIQUE,
            albumId VARCHAR UNIQUE,
            albumSize INTEGER)
            `;
  await db.transaction((tx) => {
    tx.executeSql(query);
  });
}

export async function insertAlbumInfo(db, albumTitle, albumId, albumSize) {
  const query = `INSERT OR REPLACE INTO ${ALBUM_INFO} (albumTitle, albumId, albumSize) VALUES (?, ?, ?)`;
  await db.transaction((tx) => {
    tx.executeSql(query, [albumTitle, albumId, albumSize]);
  });
}

export async function getAlbums(db) {
  const query = `SELECT * FROM album_info`;
  let albums = await new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        query,
        [],
        (_, { rows }) => {
          console.log('rows', rows);
          resolve(rows._array);
        },
        (_, error) => {
          console.log('error', error);
          reject(error);
        }
      );
    });
  });
  console.log('albums', albums);
  return albums;
}

export async function getFiles(db, title) {
  const query = `SELECT * FROM files WHERE albumTitle = ?`;
  try {
    let files = await new Promise((resolve, reject) => {
      db.readTransaction((tx) => {
        tx.executeSql(
          query,
          [title],
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => {
            console.log('error', error);
            reject(error);
          }
        );
      });
    });
    return files;
  } catch (error) {
    console.error('Error getting files:', error);
    throw error;
  }
}

export async function markForSync(db, fileIds) {
  
  const query = `UPDATE files SET flag = 1 WHERE fileId = ?`;
  for(id of fileIds){
    await db.transaction(
      (tx) => {
        tx.executeSql(
          query,
         [id],
          (_, { rowsAffected }) => {
            if (rowsAffected > 0) {
              console.log(`Row with ID ${id} updated successfully`);
            } else {
              console.log(`Row with ID ${id} not found`);
            }
          },
          (_, error) => {
            console.error('Error updating row:', error);
          }
        );
      },
      null,
      null
    );
  }
}

export async function getMarkedForSync(db, title) {
  const query = `SELECT * FROM files WHERE albumTitle = ? AND flag = 1`;
  try {
    let files = await new Promise((resolve, reject) => {
      db.readTransaction((tx) => {
        tx.executeSql(
          query,
          [title],
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => {
            console.log('error', error);
            reject(error);
          }
        );
      });
    });
    return files;
  } catch (error) {
    console.error('Error getting files:', error);
    throw error;
  }
}
