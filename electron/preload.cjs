const { ipcRenderer, contextBridge } = require('electron');

// Si estamos en un submarco (iframe), inyectamos la intercepción de window.close
if (window.self !== window.top) {
  const scriptContent = `
    (function() {
      const originalClose = window.close;
      window.close = function() {
        window.dispatchEvent(new CustomEvent('iframe-window-close-triggered', {
          detail: { tabId: window.name, url: window.location.href }
        }));
        if (originalClose) {
          try {
            originalClose();
          } catch(e) {
            try { originalClose.apply(window, arguments); } catch(err) {}
          }
        }
      };
    })();
  `;

  const injectScript = () => {
    const script = document.createElement('script');
    script.textContent = scriptContent;
    if (document.head || document.documentElement) {
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    }
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', injectScript);
  } else {
    injectScript();
  }

  // Escuchamos el evento personalizado y lo enviamos al proceso principal de Electron
  window.addEventListener('iframe-window-close-triggered', (event) => {
    if (event.detail) {
      const { tabId, url } = event.detail;
      ipcRenderer.send('iframe-close-request', { tabId, url });
    }
  });
}

// Si estamos en el marco principal (App React), exponemos la API segura
if (window.self === window.top) {
  contextBridge.exposeInMainWorld('electronAPI', {
    onIframeClose: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('iframe-close-tab', listener);
      return () => {
        ipcRenderer.removeListener('iframe-close-tab', listener);
      };
    },
    onWebviewNewWindow: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('webview-new-window', listener);
      return () => {
        ipcRenderer.removeListener('webview-new-window', listener);
      };
    },
    onWebviewNewWindowCyb: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('webview-new-window-cyb', listener);
      return () => {
        ipcRenderer.removeListener('webview-new-window-cyb', listener);
      };
    },
    showMsnNotification: (data) => {
      ipcRenderer.send('show-msn-notification', data);
    },
    storageGetAll: () => ipcRenderer.invoke('storage-get-all'),
    storageSetItem: (key, value) => ipcRenderer.invoke('storage-set-item', key, value),
    storageRemoveItem: (key) => ipcRenderer.invoke('storage-remove-item', key),
    storageSaveAll: (allData) => ipcRenderer.invoke('storage-save-all', allData)
  });
}
