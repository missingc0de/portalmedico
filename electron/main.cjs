const { app, BrowserWindow, Menu, globalShortcut, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');
const { autoUpdater } = require('electron-updater');

// Permitir reproducción de sonidos sin necesidad de gesto previo del usuario
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let mainWindow;
let aboutWindow;
let isQuittingForUpdate = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegrationInSubFrames: true,
    },
    icon: path.join(__dirname, 'portalmedico_icon.png')
  });

  // --- Auto Updater & Menu Logic ---
  const template = [
    {
      label: 'Archivo',
      submenu: [
        { role: 'quit', label: 'Salir' }
      ]
    },
    {
      label: 'Vista',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'forceReload', label: 'Forzar Recarga' },
        { role: 'toggleDevTools', label: 'Herramientas de Desarrollador' },
        { type: 'separator' },
        {
          label: 'Restaurar Zoom',
          accelerator: 'CommandOrControl+0',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.setZoomLevel(0);
            }
          }
        },
        {
          label: 'Acercar Zoom',
          accelerator: 'CommandOrControl+=',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              const zoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(zoom + 0.5);
            }
          }
        },
        {
          label: 'Alejar Zoom',
          accelerator: 'CommandOrControl+-',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              const zoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(zoom - 0.5);
            }
          }
        },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla Completa' }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de / Buscar actualizaciones...',
          click: () => {
            createAboutWindow();
            if (process.versions.electron && process.versions.electron.startsWith('22.')) {
              console.log('Running legacy Windows 7 build (Electron 22). Auto-updater disabled.');
            } else {
              autoUpdater.checkForUpdatesAndNotify();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Contactar a Soporte',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('mailto:portalmedico.aps@gmail.com');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  // ----------------------------------

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
    protocol: 'file:',
    slashes: true
  });

  if (process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(startUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('avislatam.com') || url.includes('sscoquimbo')) {
      mainWindow.webContents.executeJavaScript(`
        if (window.__openAvisTab) {
          window.__openAvisTab(${JSON.stringify(url)});
        } else {
          window.open(${JSON.stringify(url)}, '_blank');
        }
      `).catch(err => console.error(err));
      return { action: 'deny' };
    }
    if (url.includes('cybserviciosmedicos.cl')) {
      mainWindow.webContents.executeJavaScript(`
        if (window.__openCybTab) {
          window.__openCybTab(${JSON.stringify(url)});
        } else {
          window.open(${JSON.stringify(url)}, '_blank');
        }
      `).catch(err => console.error(err));
      return { action: 'deny' };
    }
    if (url.startsWith('http')) {
      const { shell } = require('electron');
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  ipcMain.on('iframe-close-request', (event, data) => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('iframe-close-tab', data);
    }
  });

  let activeNotifications = [];

  ipcMain.on('show-msn-notification', (event, data) => {
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { workArea } = primaryDisplay;

    const width = 320;
    const height = 80;
    const margin = 10;
    const paddingBottom = 10;

    activeNotifications = activeNotifications.filter(win => !win.isDestroyed());
    const activeHeightOffset = activeNotifications.length * (height + margin);

    const x = workArea.x + workArea.width - width - margin;
    const y = workArea.y + workArea.height - height - margin - activeHeightOffset - paddingBottom;

    let notifWindow = new BrowserWindow({
      width: width,
      height: height,
      x: x,
      y: y,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      focusable: false,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    notifWindow.loadFile(path.join(__dirname, 'msn_notification.html'));

    notifWindow.once('ready-to-show', () => {
      notifWindow.showInactive();
      notifWindow.webContents.send('notification-data', data);
    });

    activeNotifications.push(notifWindow);
  });

  ipcMain.on('close-msn-notification', (event) => {
    const senderWindow = BrowserWindow.fromWebContents(event.sender);
    if (senderWindow && !senderWindow.isDestroyed()) {
      senderWindow.close();
    }
  });

  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    const defaultPath = path.join(app.getPath('desktop'), item.getFilename());
    item.setSavePath(defaultPath);
    item.once('done', (event, state) => {
      if (state === 'completed') {
        const { shell } = require('electron');
        shell.openPath(defaultPath);
      }
    });
  });

  // Permitir iframes eliminando X-Frame-Options y CSP restrictivos de forma completamente insensible a mayúsculas/minúsculas
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };

    // Remover protecciones anti-iframe
    for (const key of Object.keys(responseHeaders)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'x-frame-options' || lowerKey === 'content-security-policy') {
        delete responseHeaders[key];
      }
    }

    callback({
      cancel: false,
      responseHeaders: responseHeaders
    });
  });



  let forceClose = false;
  mainWindow.on('close', function (e) {
    if (forceClose || isQuittingForUpdate) return;

    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'warning',
      buttons: ['Sí, cerrar aplicación', 'Cancelar'],
      title: 'Confirmar cierre',
      message: '¿Está seguro que desea salir?',
      detail: 'Cualquier cambio no guardado se perderá.',
      cancelId: 1
    });

    if (choice === 1) {
      e.preventDefault();
    } else {
      e.preventDefault();
      // Ejecutar lógica de cierre en el navegador
      mainWindow.webContents.executeJavaScript(`
        try {
          sessionStorage.clear();
          window.dispatchEvent(new Event('beforeunload'));
        } catch(e) {}
      `);

      // Dar 1.5 segundos para que los procesos de Firebase y cierre finalicen
      setTimeout(() => {
        forceClose = true;
        mainWindow.close();
      }, 1500);
    }
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Configuración de autoupdater
  autoUpdater.autoDownload = true; // Forzar descarga automática
  autoUpdater.autoInstallOnAppQuit = true;
  try {
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'missingc0de',
      repo: 'portalmedico'
    });
  } catch (e) {
    console.warn('Set feed URL error:', e);
  }

  autoUpdater.on('checking-for-update', () => {
    if (aboutWindow) aboutWindow.webContents.send('update-message', 'Buscando actualizaciones...');
  });
  autoUpdater.on('update-available', (info) => {
    if (aboutWindow) aboutWindow.webContents.send('update-message', '¡Actualización encontrada! Descargando obligatoriamente...');
  });
  autoUpdater.on('update-not-available', (info) => {
    if (aboutWindow) aboutWindow.webContents.send('update-message', 'Tienes la última versión.');
  });
  autoUpdater.on('error', (err) => {
    console.error('AutoUpdater error:', err);
    if (aboutWindow) {
      if (!app.isPackaged) {
        aboutWindow.webContents.send('update-message', 'Modo desarrollo: servidor de actualizaciones no activo en local.');
      } else {
        aboutWindow.webContents.send('update-message', 'Error buscando actualizaciones. Revisa tu conexión.');
      }
    }
  });
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = 'Descargando: ' + Math.round(progressObj.percent) + '%';
    if (aboutWindow) aboutWindow.webContents.send('update-message', log_message);
  });
  autoUpdater.on('update-downloaded', (info) => {
    if (aboutWindow) aboutWindow.webContents.send('update-message', 'Actualización descargada. Instalando ahora...');

    // Forzar instalación bloqueando la app
    const dialogOpts = {
      type: 'info',
      buttons: ['Reiniciar e Instalar Ahora'],
      title: 'Actualización Obligatoria Lista',
      message: 'Hay una nueva versión obligatoria del Portal Médico.',
      detail: 'La aplicación ha descargado la versión más reciente y debe reiniciarse para aplicarla inmediatamente. Por favor, asegúrese de guardar su trabajo si es posible antes de que se cierre sola o presione el botón.',
      noLink: true
    };

    dialog.showMessageBox(mainWindow, dialogOpts).then((returnValue) => {
      isQuittingForUpdate = true;
      autoUpdater.quitAndInstall(true, true); // Fuerzo cierre e instalación
    });
  });

  mainWindow.webContents.once('did-finish-load', () => {
    if (process.versions.electron && process.versions.electron.startsWith('22.')) {
      console.log('Legacy Windows 7 build detected. Skipping startup auto-update check.');
    } else if (app.isPackaged) {
      autoUpdater.checkForUpdatesAndNotify().catch(e => console.error('Check update failed:', e));
    }
  });

}

function createAboutWindow() {
  if (aboutWindow) {
    aboutWindow.focus();
    return;
  }

  aboutWindow = new BrowserWindow({
    width: 400,
    height: 450,
    title: 'Acerca de PORTAL MÉDICO',
    resizable: false,
    minimizable: false,
    maximizable: false,
    parent: mainWindow,
    modal: true,
    icon: path.join(__dirname, 'portalmedico_icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  aboutWindow.setMenu(null);
  aboutWindow.loadFile(path.join(__dirname, 'about.html'));

  aboutWindow.webContents.once('did-finish-load', () => {
    aboutWindow.webContents.send('app-version', app.getVersion());
    if (process.versions.electron && process.versions.electron.startsWith('22.')) {
      aboutWindow.webContents.send('update-message', 'Versión heredada (Win 7/8). Actualizaciones automáticas desactivadas.');
    }
  });

  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
}

app.on('web-contents-created', (event, contents) => {
  if (contents.getType() === 'webview') {
    contents.setWindowOpenHandler(({ url }) => {
      const currentUrl = contents.getURL();
      const isAvisSource = currentUrl.includes('avislatam.com') || currentUrl.includes('sscoquimbo');
      const isAvisTarget = url.includes('avislatam.com') || url.includes('sscoquimbo');

      const isCybSource = currentUrl.includes('cybserviciosmedicos.cl');
      const isCybTarget = url.includes('cybserviciosmedicos.cl');

      if (isAvisSource || isAvisTarget) {
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('webview-new-window', { url });
        }
        return { action: 'deny' };
      }

      if (isCybSource || isCybTarget) {
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('webview-new-window-cyb', { url });
        }
        return { action: 'deny' };
      }

      return { action: 'allow' };
    });
  }
});

app.whenReady().then(createWindow);

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true);
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
