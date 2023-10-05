import { app, BrowserWindow } from 'electron';
import path from 'path';

export default function createWindow() {

    const window = new BrowserWindow({
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'index2.js')
        },
        show: true
    });

    if (app.isPackaged) {
        window.loadFile(path.join(__dirname, '../dist/index.html'));
    } else {
        const url = `http://localhost:33106/`;
        window.loadURL(url);
    }

    if (process.env.X_DEBUG) window.webContents.openDevTools();

    return window;
};