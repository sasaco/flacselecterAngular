const { app, Menu, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

let win: Electron.CrossProcessExports.BrowserWindow | null;
let serve: boolean;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

function createWindow() {

  // const electronScreen = screen;
  const size = { width: 1024, height: 848 };//electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  const template = [
    {
      label: "メニュー",
      submenu: [
        { label: "Print", click: () => print_to_pdf() },
        { label: "Debug", click: () => {
          if(win)
            win.webContents.openDevTools()
        }}
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  //win.webContents.openDevTools();


  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    if(win)
      win.destroy();
    win = null;
  });

}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}



// ローカルファイルにアクセスする ///////////////////////////////
ipcMain.on('read-csv-file', function(event) {

  const csvpath: string = path.join(__dirname, 'dist/assets/data.csv');
  const csvstr:string = fs.readFileSync(csvpath, 'utf-8');
  event.returnValue = csvstr;
  
});


function print_to_pdf() :void {

  const pdfPath = path.join(__dirname, 'print.pdf')

  if(!win)
    return;

  win.webContents.printToPDF({});
  // win.webContents.printToPDF({}, (error, data) => {
  //   if (error) throw error
  //   fs.writeFile(pdfPath, data, function (error) {
  //     if (error) {
  //       throw error
  //     }
  //     shell.openExternal('file://' + pdfPath)
  //   })
  // })
}
