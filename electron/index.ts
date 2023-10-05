import { app } from 'electron';

import './ipc/index';
import createWindow from './windows/create';

app.whenReady().then(() => {
    createWindow();
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

const lock = app.requestSingleInstanceLock();
if (!lock) {
    app.quit();
}

process.on('uncaughtException', (err) => {
    console.error(err);
});
process.on('unhandledRejection', (err) => {
    console.error(err);
});