import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SerializedDbStore } from './loadDbStore.js';

export function saveDbStore(store: SerializedDbStore, storagePath?: string): void {
  const filePath = storagePath || fileURLToPath(new URL('../../data/db-store.json', import.meta.url));
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[Persistence] Could not save DB store to ${filePath}:`, err);
  }
}
