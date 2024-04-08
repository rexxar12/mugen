import initDatabase, { createAlbumInfoTable, createFilesTable } from '../sqlite/sqlite.config';

export default async function initDb() {
  try {
    const db = await initDatabase();
    await createFilesTable(db);
    await createAlbumInfoTable(db)
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
