const { app, BrowserWindow, session, Menu, protocol } = require('electron');
const path = require('path');

// Permite que fetch() funcione com arquivos locais (JSONs da Harpa e Bíblia)
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
]);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 850,
    minHeight: 600,
    title: 'Bíblia do Instrumentista',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#080b12',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Permite carregar os JSONs locais sem bloqueio de CORS
      allowRunningInsecureContent: false
    }
  });

  // Conceder permissão automática para o microfone (Afinador)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Menu nativo superior elegante
  const templateMenu = [
    {
      label: 'Arquivo',
      submenu: [
        { label: 'Recarregar', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
        { type: 'separator' },
        { label: 'Sair', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Exibir',
      submenu: [
        { label: 'Alternar Tela Cheia', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { label: 'Aumentar Zoom', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Diminuir Zoom', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { label: 'Zoom Padrão', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre a Bíblia do Instrumentista',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Bíblia do Instrumentista',
              message: 'Bíblia do Instrumentista v1.0.0',
              detail: 'Aplicativo completo de Afinação, Harpa Cristã Cifrada e Bíblia Sagrada ACF.\nTotalmente offline e feito para ministros de louvor e músicos cristãos.',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(templateMenu);
  Menu.setApplicationMenu(menu);

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
