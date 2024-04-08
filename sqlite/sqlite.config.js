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

export async function insertFiles(db, assets, albumTitle) {
  const query = `INSERT OR IGNORE INTO files (fileId, fileName, albumId, albumTitle, uri, flag) VALUES (?, ?, ?, ?, ?, ?)`;

  const promises = assets.map(
    (asset) =>
      new Promise((resolve, reject) => {
        db.transaction(
          (tx) => {
            tx.executeSql(
              query,
              [asset.id, asset.filename, asset.albumId, albumTitle, asset.uri, 1],
              (_, { rowsAffected }) => {
                resolve(rowsAffected);
              },
              (_, error) => {
                console.error('Error inserting row:', error);
                reject(error);
              }
            );
          },
          null,
          null
        );
      })
  );

  await Promise.all(promises)
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

export async function insertAlbumInfo(db, albums) {
  const query = `INSERT OR REPLACE INTO ${ALBUM_INFO} (albumTitle, albumId, albumSize) VALUES (?, ?, ?)`;
  await db.transaction((tx) => {
    for (const album of albums) {
      tx.executeSql(query, [album.title, album.id, album.assetCount]);
    }
  })
}

export async function getAlbums(db) {
  const query = `SELECT * FROM album_info`;
  let albums = await new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        query,
        [],
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

  const promises = fileIds.map(
    (id) =>
      new Promise((resolve, reject) => {
        db.transaction(
          (tx) => {
            tx.executeSql(
              query,
              [id],
              (_, { rowsAffected }) => {
                resolve();
              },
              (_, error) => {
                console.error('Error updating row:', error);
                reject(error);
              }
            );
          },
          null,
          null
        );
      })
  );

  await Promise.all(promises);
}

export async function unmarkSyncItem(db, fileIds) {
  const query = `UPDATE files SET flag = 0 WHERE fileId = ?`;

  const promises = fileIds.map(
    (id) =>
      new Promise((resolve, reject) => {
        db.transaction(
          (tx) => {
            tx.executeSql(
              query,
              [id],
              (_, { rowsAffected }) => {
                resolve();
              },
              (_, error) => {
                console.error('Error updating row:', error);
                reject(error);
              }
            );
          },
          null,
          null
        );
      })
  );

  await Promise.all(promises);
}

export async function getMarkedForSync(db, title) {
  const query = `SELECT fileId,flag FROM files WHERE albumTitle = ? AND flag = 1 OR flag = 2`;
  try {
    let files = await new Promise((resolve, reject) => {
      db.readTransaction((tx) => {
        tx.executeSql(
          query,
          [title],
          (_, { rows }) => {
            let fileIds = [];
            for (let i = 0; i < rows.length; i++) {
              fileIds.push({id: rows.item(i).fileId, flag: rows.item(i).flag});
            }
            resolve(fileIds);
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

export async function getFilesToSync(db) {
  try {
    const query = `SELECT * FROM files WHERE flag = 1 limit 10`;
    return await new Promise((resolve, reject) => {
      db.readTransaction((tx) => {
        tx.executeSql(
          query,
          [],
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
  } catch (error) {
    console.error('Error getting files:', error);
    throw error;
  }
}

export async function updateFilesStatus(db, fileIds) {
  const query = `UPDATE files SET flag = 2 WHERE id = ?`;

  const promises = fileIds.map(
    (id) =>
      new Promise((resolve, reject) => {
        db.transaction(
          (tx) => {
            tx.executeSql(
              query,
              [id],
              (_, { rowsAffected }) => {
                resolve();
              },
              (_, error) => {
                console.error('Error updating row:', error);
                reject(error);
              }
            );
          },
          null,
          null
        );
      })
  );

  await Promise.all(promises);
}
