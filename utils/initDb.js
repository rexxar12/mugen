import initDatabase, { createAlbumInfoTable, createFilesTable } from '../sqlite/sqlite.config';

export default async function initDb() {
  try {
    const db = await initDatabase();
    await createFilesTable(db);
    await createAlbumInfoTable(db).then(() => {
      console.log('Album info table created');
    })
    console.log('Database initialized');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}
