// services/persistentStorage.ts

declare global {
  interface Window {
    electronAPI?: {
      storageGetAll?: () => Promise<Record<string, string>>;
      storageSetItem?: (key: string, value: string) => Promise<boolean>;
      storageRemoveItem?: (key: string) => Promise<boolean>;
      storageSaveAll?: (allData: Record<string, string>) => Promise<boolean>;
      [key: string]: any;
    };
  }
}

let isHydrated = false;
let hydrationPromise: Promise<void> | null = null;

export async function initPersistentStorage(): Promise<void> {
  if (isHydrated) return;
  if (hydrationPromise) return hydrationPromise;

  hydrationPromise = (async () => {
    try {
      if (window.electronAPI?.storageGetAll) {
        const fileData = await window.electronAPI.storageGetAll();
        if (fileData && typeof fileData === 'object') {
          const fileKeys = Object.keys(fileData);
          if (fileKeys.length > 0) {
            // Hydrate localStorage with values stored in %APPDATA%/PortalMedicoData/portal_permanent_store.json
            for (const key of fileKeys) {
              if (fileData[key] !== undefined && fileData[key] !== null) {
                try {
                  window.localStorage.setItem(key, fileData[key]);
                } catch (e) {
                  console.warn(`Error hydrating key "${key}" to localStorage:`, e);
                }
              }
            }
          } else {
            // First run with persistent storage: backup existing localStorage to %APPDATA%
            saveAllToDisk();
          }
        }
      }
    } catch (err) {
      console.error('Error during persistent storage hydration:', err);
    } finally {
      isHydrated = true;
      patchLocalStorage();
      setupAutoSave();
    }
  })();

  return hydrationPromise;
}

export function saveAllToDisk(): void {
  if (!window.electronAPI?.storageSaveAll) return;
  try {
    const allData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        allData[key] = localStorage.getItem(key) || '';
      }
    }
    window.electronAPI.storageSaveAll(allData).catch(e => console.error('storageSaveAll error:', e));
  } catch (err) {
    console.error('Error dumping localStorage to disk:', err);
  }
}

function patchLocalStorage(): void {
  if ((window.localStorage as any).__isPatchedByPersistentStorage) return;

  const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
  const originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage);
  const originalClear = window.localStorage.clear.bind(window.localStorage);

  window.localStorage.setItem = function (key: string, value: string) {
    originalSetItem(key, value);
    if (window.electronAPI?.storageSetItem) {
      window.electronAPI.storageSetItem(key, value).catch(err => {
        console.warn(`Failed to persist key "${key}" to disk:`, err);
      });
    }
  };

  window.localStorage.removeItem = function (key: string) {
    originalRemoveItem(key);
    if (window.electronAPI?.storageRemoveItem) {
      window.electronAPI.storageRemoveItem(key).catch(err => {
        console.warn(`Failed to remove key "${key}" from disk:`, err);
      });
    }
  };

  window.localStorage.clear = function () {
    originalClear();
    if (window.electronAPI?.storageSaveAll) {
      window.electronAPI.storageSaveAll({}).catch(err => {
        console.warn('Failed to clear persistent disk storage:', err);
      });
    }
  };

  (window.localStorage as any).__isPatchedByPersistentStorage = true;
}

function setupAutoSave(): void {
  window.addEventListener('beforeunload', () => {
    saveAllToDisk();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveAllToDisk();
    }
  });
}

// Trigger initial sync automatically
initPersistentStorage();
