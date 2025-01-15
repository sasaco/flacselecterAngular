import {app, Menu, BrowserWindow, ipcMain, shell, screen} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';

let win: BrowserWindow | null = null;
const args = process.argv.slice(1);
let serve: boolean = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  // const electronScreen = screen;
  const size = { width: 1024, height: 848 };//electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve),
      contextIsolation: false,
    }
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  require('electron-reloader')(module, {
    ignore: ['print.pdf']
  });

  const template = [
    {
      label: "メニュー",
      submenu: [
        { label: "Print", click: () => print_to_pdf() },
        { label: "Debug", click: () => { win!.webContents.openDevTools(); } }
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
    win = null;
  });
  
  return win;
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
ipcMain.on('read-csv-file', (event: any) => {

  const csvpath: string = path.join(__dirname, 'dist/assets/data.csv');
  const csvstr:string = fs.readFileSync(csvpath, 'utf-8');
  event.returnValue = csvstr;
  
});


function print_to_pdf() :void {

  win!.webContents.printToPDF({
    landscape: true,
    printBackground: true,
    pageRanges: '1', // 1ページ目だけを印刷
    margins: { top: 0, bottom: 0, left: 0, right: 0 } // 印刷可能領域に合わせる
  }).then(data => {
    const pdfPath = path.join(__dirname, 'print.pdf')
    fs.writeFile(pdfPath, data, (error) => {
      if (error) throw error
      console.log('Write PDF successfully.')

      shell.openExternal(`file://${pdfPath}`).then(() => {
      });
      // Create a new window to display the PDF
      // const pdfWindow = new BrowserWindow({
      //   webPreferences: {
      //     plugins: true
      //   }
      // });
      // pdfWindow.loadURL(`file://${pdfPath}`); 
           
    })
  }).catch(error => {
    throw error
  })
}
