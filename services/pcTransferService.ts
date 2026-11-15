// services/pcTransferService.ts
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  getDocs 
} from 'firebase/firestore';

export interface PcTransferFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 Data URL
}

export interface PcTransferItem {
  id: string;
  senderUsername: string;
  senderFullName: string;
  targetUsername: string;
  text: string;
  files: PcTransferFile[];
  timestamp: number;
  read?: boolean;
  autoDownloaded?: boolean;
  downloadedAt?: number;
}

const DB_NAME = 'PortalMedico_LocalTransfers';
const DB_VERSION = 2;
const STORE_NAME = 'received_transfers';
const CONFIG_STORE = 'transfer_config';

// ==========================================
// 1. IndexedDB Helper for Receiving PC
// ==========================================
function openLocalDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported in this environment'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('targetUsername', 'targetUsername', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains(CONFIG_STORE)) {
        db.createObjectStore(CONFIG_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveTransferToLocalDb(item: PcTransferItem): Promise<void> {
  try {
    const db = await openLocalDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error saving transfer to local IndexedDB:', err);
    // Fallback: save metadata in localStorage if IndexedDB fails
    try {
      const key = `local_transfers_${item.targetUsername}`;
      const existing: PcTransferItem[] = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = existing.filter(x => x.id !== item.id);
      filtered.unshift(item);
      localStorage.setItem(key, JSON.stringify(filtered.slice(0, 30)));
    } catch (e) {
      console.warn('LocalStorage fallback failed:', e);
    }
  }
}

export async function getAllLocalTransfers(username: string): Promise<PcTransferItem[]> {
  try {
    const db = await openLocalDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results: PcTransferItem[] = req.result || [];
        const userItems = results
          .filter(item => item.targetUsername === username)
          .sort((a, b) => b.timestamp - a.timestamp);
        resolve(userItems);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error reading from IndexedDB, trying fallback:', err);
    try {
      const key = `local_transfers_${username}`;
      const existing: PcTransferItem[] = JSON.parse(localStorage.getItem(key) || '[]');
      return existing.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }
}

export async function deleteLocalTransfer(id: string, username: string): Promise<void> {
  try {
    const db = await openLocalDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error deleting from IndexedDB:', err);
  }
  try {
    const key = `local_transfers_${username}`;
    const existing: PcTransferItem[] = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = existing.filter(x => x.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (e) {
    console.warn('LocalStorage delete fallback error:', e);
  }
}

export async function clearAllLocalTransfers(username: string): Promise<void> {
  try {
    const all = await getAllLocalTransfers(username);
    const db = await openLocalDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const item of all) {
        store.delete(item.id);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Error clearing IndexedDB:', err);
  }
  try {
    localStorage.removeItem(`local_transfers_${username}`);
  } catch (e) {
    console.warn('LocalStorage clear error:', e);
  }
}

export async function markLocalTransferAsRead(id: string, username: string): Promise<void> {
  try {
    const db = await openLocalDb();
    const item: PcTransferItem | undefined = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (item) {
      item.read = true;
      await saveTransferToLocalDb(item);
    }
  } catch (e) {
    console.warn('Error marking transfer as read:', e);
  }
}

// ==========================================
// 2. Client-side File Processing & Compression
// ==========================================
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's an image and larger than 1.2MB, optimize client-side for rapid transfer
    if (file.type.startsWith('image/') && file.size > 1.2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            resolve(compressed);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }
  });
}

// ==========================================
// 3. Send to Cloud (from Phone App)
// ==========================================
export async function sendToPcCloud(
  sender: { username: string; fullName: string },
  text: string,
  files: File[],
  onProgress?: (status: string) => void,
  targetUsername?: string
): Promise<void> {
  if (!text.trim() && files.length === 0) {
    throw new Error('Debe adjuntar al menos un archivo, foto o texto para enviar.');
  }

  const recipient = (targetUsername && targetUsername.trim()) ? targetUsername.trim() : sender.username;

  onProgress?.('Preparando archivos...');

  const processedFiles: PcTransferFile[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(`Procesando archivo ${i + 1} de ${files.length}...`);
    const dataUrl = await fileToDataUrl(file);
    processedFiles.push({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${i}`,
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      data: dataUrl
    });
  }

  onProgress?.('Subiendo a la nube...');

  // If there are multiple files or large data, send each file in its own document
  // so each document stays well below Firestore's 1 MB limit
  if (processedFiles.length > 1) {
    for (let i = 0; i < processedFiles.length; i++) {
      onProgress?.(`Enviando archivo ${i + 1} de ${processedFiles.length}...`);
      await addDoc(collection(db, 'pc_transfers'), {
        targetUsername: recipient,
        senderUsername: sender.username,
        senderFullName: sender.fullName,
        text: i === 0 ? text.trim() : '', // attach text to first doc
        files: [processedFiles[i]],
        timestamp: Date.now() + i, // slight timestamp stagger for ordering
        status: 'pending'
      });
    }
  } else {
    await addDoc(collection(db, 'pc_transfers'), {
      targetUsername: recipient,
      senderUsername: sender.username,
      senderFullName: sender.fullName,
      text: text.trim(),
      files: processedFiles,
      timestamp: Date.now(),
      status: 'pending'
    });
  }

  onProgress?.('¡Enviado con éxito!');
}

// ==========================================
// 4. File Saving & Auto-Download to Downloads Folder
// ==========================================
export const DEFAULT_RECIBIDOS_FOLDER_NAME = 'Recibidos desde PORTAL MÉDICO';

let cachedDirHandle: any = null;

export async function getStoredBrowserDirHandle(): Promise<any> {
  if (cachedDirHandle) return cachedDirHandle;
  try {
    const db = await openLocalDb();
    return new Promise((resolve) => {
      const tx = db.transaction(CONFIG_STORE, 'readonly');
      const store = tx.objectStore(CONFIG_STORE);
      const req = store.get('browser_downloads_dir');
      req.onsuccess = () => {
        cachedDirHandle = req.result || null;
        resolve(cachedDirHandle);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setBrowserDownloadFolder(): Promise<boolean> {
  if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) {
    return false;
  }
  try {
    const handle = await (window as any).showDirectoryPicker({
      id: 'portalmedico_recibidos',
      mode: 'readwrite',
      startIn: 'downloads'
    });
    cachedDirHandle = handle;
    const db = await openLocalDb();
    const tx = db.transaction(CONFIG_STORE, 'readwrite');
    tx.objectStore(CONFIG_STORE).put(handle, 'browser_downloads_dir');
    return true;
  } catch (err) {
    console.warn('User cancelled or directory picker error:', err);
    return false;
  }
}

export function hasNativeFolderAccess(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).electronAPI?.saveReceivedFile ||
    (window as any).pywebview?.api?.save_received_file ||
    cachedDirHandle
  );
}

/**
 * Saves a file directly to "Descargas/Recibidos desde PORTAL MÉDICO".
 * If the folder does not exist, it creates it automatically.
 * Supports:
 * 1. Electron Native IPC (Direct folder creation & write)
 * 2. PyWebView Python Native API (Direct folder creation & write)
 * 3. File System Access API (Browser direct folder creation & write)
 * 4. Standard Browser Download Fallback
 */
export async function saveFileToRecibidosFolder(
  filename: string,
  dataUrl?: string,
  isText = false,
  textContent = ''
): Promise<{ success: boolean; path?: string }> {
  const cleanFilename = (filename || 'archivo').replace(/[<>:"/\\|?*]/g, '_');

  // 1. Electron Native Save (creates folder and writes file silently)
  if (typeof window !== 'undefined' && (window as any).electronAPI?.saveReceivedFile) {
    try {
      const res = await (window as any).electronAPI.saveReceivedFile({
        filename: cleanFilename,
        dataBase64: dataUrl || '',
        isText,
        textContent
      });
      if (res && res.success) {
        return res;
      }
    } catch (e) {
      console.warn('electronAPI.saveReceivedFile failed, trying next method:', e);
    }
  }

  // 2. PyWebView Python Native Save (creates folder and writes file silently)
  if (typeof window !== 'undefined' && (window as any).pywebview?.api?.save_received_file) {
    try {
      const res = await (window as any).pywebview.api.save_received_file(
        cleanFilename,
        dataUrl || '',
        isText,
        textContent
      );
      if (res && res.success) {
        return res;
      }
    } catch (e) {
      console.warn('pywebview.api.save_received_file failed, trying next method:', e);
    }
  }

  // 3. File System Access API (In Chrome/Edge with folder permission)
  try {
    const dirHandle = await getStoredBrowserDirHandle();
    if (dirHandle) {
      let targetSubDir = dirHandle;
      if (dirHandle.name !== DEFAULT_RECIBIDOS_FOLDER_NAME) {
        // Automatically create "Recibidos desde PORTAL MÉDICO" folder inside selected Downloads folder
        targetSubDir = await dirHandle.getDirectoryHandle(DEFAULT_RECIBIDOS_FOLDER_NAME, { create: true });
      }
      const fileHandle = await targetSubDir.getFileHandle(cleanFilename, { create: true });
      const writable = await fileHandle.createWritable();
      if (isText) {
        await writable.write(textContent);
      } else if (dataUrl) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        await writable.write(blob);
      }
      await writable.close();
      return { success: true, path: `${DEFAULT_RECIBIDOS_FOLDER_NAME}/${cleanFilename}` };
    }
  } catch (fsErr) {
    console.warn('FileSystemAccess write failed, falling back to browser download:', fsErr);
  }

  // 4. Web Browser Fallback (saves to browser default Downloads directory)
  if (typeof window !== 'undefined') {
    try {
      if (isText) {
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = cleanFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 3000);
      } else if (dataUrl) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = cleanFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      return { success: true };
    } catch (err) {
      console.error('Error in browser download fallback:', err);
      return { success: false };
    }
  }

  return { success: false };
}

/**
 * Performs automatic download for all files and text content in a transfer.
 * Formats text into a .txt file with exact date and time.
 */
export async function autoDownloadPcTransfer(item: PcTransferItem): Promise<void> {
  const dateObj = new Date(item.timestamp || Date.now());
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  const ss = String(dateObj.getSeconds()).padStart(2, '0');
  const dateStr = `${dd}/${mm}/${yyyy}`;
  const timeStr = `${hh}:${min}:${ss}`;
  const timeStampTag = `${yyyy}${mm}${dd}_${hh}${min}${ss}`;

  // If text is received, save automatically as a .txt file
  if (item.text && item.text.trim()) {
    const txtFilename = `Texto_${timeStampTag}.txt`;
    const txtContent = `=====================================================
PORTAL MÉDICO - TEXTO RECIBIDO DESDE DISPOSITIVO MÓVIL
=====================================================
Fecha de recepción: ${dateStr}
Hora de recepción:  ${timeStr} hrs
Remitente:          ${item.senderFullName || item.senderUsername} (@${item.senderUsername})
=====================================================

MENSAJE / TEXTO:
-----------------------------------------------------
${item.text}

=====================================================
Guardado automáticamente en:
Descargas / ${DEFAULT_RECIBIDOS_FOLDER_NAME}
=====================================================
`;
    await saveFileToRecibidosFolder(txtFilename, undefined, true, txtContent);
  }

  // If files/photos are attached, save each one automatically
  if (item.files && item.files.length > 0) {
    for (let i = 0; i < item.files.length; i++) {
      const file = item.files[i];
      const safeName = file.name || `archivo_${timeStampTag}_${i + 1}`;
      await saveFileToRecibidosFolder(safeName, file.data, false);
    }
  }
}

// ==========================================
// 5. Cloud Listener & Auto-Consumer (on PC)
// ==========================================
/**
 * Listens to pending transfers in Firestore for this username,
 * automatically downloads them to "Descargas/Recibidos desde PORTAL MÉDICO",
 * saves them into the local PC storage (IndexedDB),
 * and immediately DELETES them from the cloud to free space.
 */
export function listenAndConsumePcTransfers(
  username: string,
  onReceived?: (transfer: PcTransferItem) => void
): () => void {
  if (!username) return () => {};

  const colRef = collection(db, 'pc_transfers');
  const q = query(colRef, where('targetUsername', '==', username));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    for (const change of snapshot.docChanges()) {
      if (change.type === 'added') {
        const docSnap = change.doc;
        const data = docSnap.data();

        const item: PcTransferItem = {
          id: docSnap.id,
          senderUsername: data.senderUsername || username,
          senderFullName: data.senderFullName || 'Teléfono Móvil',
          targetUsername: data.targetUsername || username,
          text: data.text || '',
          files: data.files || [],
          timestamp: data.timestamp || Date.now(),
          read: false,
          autoDownloaded: false
        };

        // 1. Perform automatic download to "Descargas/Recibidos desde PORTAL MÉDICO"
        try {
          await autoDownloadPcTransfer(item);
          item.autoDownloaded = true;
          item.downloadedAt = Date.now();
        } catch (downloadErr) {
          console.error('Error during auto-download of transfer:', downloadErr);
        }

        // 2. Save to local PC storage (IndexedDB)
        await saveTransferToLocalDb(item);

        // 3. Notify callback and dispatch window event
        if (onReceived) {
          onReceived(item);
        }
        window.dispatchEvent(new CustomEvent('pc-transfer-received', { detail: item }));

        // 4. Immediately delete from cloud to free cloud storage
        try {
          await deleteDoc(doc(db, 'pc_transfers', docSnap.id));
        } catch (err) {
          console.warn('Error deleting transfer from cloud:', err);
        }
      }
    }
  }, (error) => {
    console.error('Error in pc_transfers snapshot listener:', error);
  });

  return unsubscribe;
}
