/**
 * One-time migration from the pre-namespace storage layout.
 *
 * Up to v37.11 everything lived under unversioned keys ("moniezi_core_data_v1",
 * IndexedDB "moniezi-app"). From v37.12 the keys carry a version suffix so two
 * builds served from the same origin no longer share one database.
 *
 * Without this, upgrading looks exactly like data loss: the records are still
 * there, the app is simply reading a different key and finds nothing. The old
 * copies are left in place rather than deleted, so an older build still opens
 * normally if you go back to it.
 */

const LEGACY_IDB_APP = 'moniezi-app';
const LEGACY_IDB_RECEIPTS = 'moniezi-receipts';
const IDB_STORE = 'kv';

type KeyPair = { legacy: string; current: string };

const openExisting = (name: string): Promise<IDBDatabase | null> =>
  new Promise(resolve => {
    let settled = false;
    const done = (db: IDBDatabase | null) => { if (!settled) { settled = true; resolve(db); } };
    try {
      const req = indexedDB.open(name);
      req.onupgradeneeded = () => {
        // The database did not exist. Abort so we don't create an empty one.
        try { req.transaction?.abort(); } catch { /* ignore */ }
        done(null);
      };
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) { db.close(); done(null); return; }
        done(db);
      };
      req.onerror = () => done(null);
      req.onblocked = () => done(null);
      setTimeout(() => done(null), 4000);
    } catch {
      done(null);
    }
  });

const readAllRecords = (db: IDBDatabase): Promise<any[]> =>
  new Promise(resolve => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });

const writeAllRecords = (name: string, records: any[]): Promise<boolean> =>
  new Promise(resolve => {
    if (!records.length) { resolve(true); return; }
    try {
      const req = indexedDB.open(name, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        try {
          const tx = db.transaction(IDB_STORE, 'readwrite');
          const store = tx.objectStore(IDB_STORE);
          records.forEach(r => { try { store.put(r); } catch { /* skip bad record */ } });
          tx.oncomplete = () => { db.close(); resolve(true); };
          tx.onerror = () => { db.close(); resolve(false); };
        } catch {
          db.close(); resolve(false);
        }
      };
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });

const migrateIdb = async (legacyName: string, currentName: string) => {
  const legacy = await openExisting(legacyName);
  if (!legacy) return;
  const current = await openExisting(currentName);
  if (current) {
    const existing = await readAllRecords(current);
    current.close();
    // Already has data of its own — never overwrite it.
    if (existing.length) { legacy.close(); return; }
  }
  const records = await readAllRecords(legacy);
  legacy.close();
  if (records.length) await writeAllRecords(currentName, records);
};

/**
 * Runs before the app reads any state. Safe to call on every launch: it copies
 * only when the destination is empty, and it never deletes the source.
 */
export const migrateLegacyStorage = async (namespace: string): Promise<void> => {
  const flag = `moniezi_migrated_to_${namespace}`;
  try { if (localStorage.getItem(flag) === '1') return; } catch { return; }

  const pairs: KeyPair[] = [
    { legacy: 'moniezi_core_data_v1',   current: `moniezi_core_data_v1_${namespace}` },
    { legacy: 'moniezi_license_v1',     current: `moniezi_license_v1_${namespace}` },
    { legacy: 'moniezi_device_id_v1',   current: `moniezi_device_id_v1_${namespace}` },
    { legacy: 'moniezi_home_kpi_period', current: `moniezi_home_kpi_period_${namespace}` },
    { legacy: 'moniezi_theme',          current: `moniezi_theme_${namespace}` },
    { legacy: 'moniezi_sample_tried_v1', current: `moniezi_sample_tried_v1_${namespace}` },
  ];

  for (const { legacy, current } of pairs) {
    try {
      if (localStorage.getItem(current) !== null) continue; // destination already in use
      const value = localStorage.getItem(legacy);
      if (value !== null) localStorage.setItem(current, value);
    } catch { /* quota or privacy mode — skip this key */ }
  }

  try {
    await migrateIdb(LEGACY_IDB_APP, `${LEGACY_IDB_APP}-${namespace}`);
    await migrateIdb(LEGACY_IDB_RECEIPTS, `${LEGACY_IDB_RECEIPTS}-${namespace}`);
  } catch { /* leave the legacy copies untouched */ }

  try { localStorage.setItem(flag, '1'); } catch { /* ignore */ }
};
