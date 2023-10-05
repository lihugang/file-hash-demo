import { ipcMain, app, shell } from 'electron';
import crypto from 'crypto';
import fs from 'fs';
import { join } from 'path';
const storagePath = join(app.getPath('documents'), 'file-hash-demo');

const fileList: Map<string, Map<string, {
    hash: string[];
    ref: number;
    parent: string;
}>> = new Map();

ipcMain.handle('make-client-directory', (_e, id: string) => {
    fileList.set(id, new Map());
    try {
        fs.mkdirSync(storagePath);
    } catch { }
    try {
        fs.mkdirSync(join(storagePath, id));
    } catch { }
    try {
        fs.mkdirSync(join(storagePath, id, '.file-hash-demo'));
    } catch { }
    return '';
});

ipcMain.handle('save-file', (_e, client_id: string, name: string, file: Uint8Array) => {
    const size_32k = 32 * 1024;
    const hash = new Array<string>();
    for (let i = 0; i * size_32k < file.length; i++) {
        hash[i] = crypto.createHash('sha512').update(
            Buffer.from(file.slice(i * size_32k, (i + 1) * size_32k)).toString('binary'), 'binary'
        ).digest('base64url');
    }
    let same_id: string | null = null;
    fileList.get(client_id)!.forEach((fileKept, id) => {
        if (fileKept.parent !== id) return;
        let same = true;
        if (fileKept.hash.length === hash.length) {
            for (let i = 0; i < hash.length; ++i) {
                if (hash[i] !== fileKept.hash[i]) {
                    same = false;
                    break;
                }
            }
        } else same = false;
        if (same) {
            fileKept.ref++;
            fileList.get(client_id)!.set(id, fileKept);
            same_id = id;
        }
    });
    const id = crypto.randomUUID();
    if (same_id) {
        fs.mkdirSync(join(storagePath, client_id, id));
        fs.linkSync(join(storagePath, client_id, '.file-hash-demo', same_id), join(storagePath, client_id, id, name));
        fs.chmodSync(join(storagePath, client_id, id), 444);
        fileList.get(client_id)!.set(id, {
            hash: hash,
            ref: 1,
            parent: same_id
        });
        return {
            hash: hash,
            hasKept: true,
            id: id
        }
    }
    fileList.get(client_id)!.set(id, {
        hash: hash,
        ref: 1,
        parent: id
    });
    let fd: number;
    fs.chmodSync(join(storagePath, client_id, '.file-hash-demo'), 644);
    fs.writeFileSync(join(storagePath, client_id, '.file-hash-demo', id), file);
    fd = fs.openSync(join(storagePath, client_id, '.file-hash-demo', id), 'r');
    fs.fchmodSync(fd, 444);
    fs.closeSync(fd);
    fs.chmodSync(join(storagePath, client_id, '.file-hash-demo'), 444);
    fs.mkdirSync(join(storagePath, client_id, id));
    fs.linkSync(join(storagePath, client_id, '.file-hash-demo', id), join(storagePath, client_id, id, name));
    fd = fs.openSync(join(storagePath, client_id, id, name), 'r');
    fs.fchmodSync(fd, 444);
    fs.closeSync(fd);
    fs.chmodSync(join(storagePath, client_id, id), 444);
    return {
        hash: hash,
        hasKept: false,
        id: id
    }
});

setInterval(() => {
    fileList.forEach((files, client_id) => {
        fs.chmodSync(join(storagePath, client_id, '.file-hash-demo'), 644);
        files.forEach((file, uuid) => {
            if (file.ref <= 0) {
                fs.unlinkSync(join(storagePath, client_id, '.file-hash-demo', uuid));
            }
        });
        fs.chmodSync(join(storagePath, client_id, '.file-hash-demo'), 444);
    });
}, 10000);

const whenFileReceived: Array<(data: { name: string, file: Uint8Array }) => void> = [];
ipcMain.handle('when-file-received', (_e) => {
    const promise = new Promise<{
        name: string;
        file: Uint8Array
    }>((resolve) => {
        whenFileReceived.push(resolve);
    });
    return promise;
});
ipcMain.handle('send-file', (_e, name: string, file: Uint8Array) => {
    whenFileReceived.forEach(callback => callback({ name, file }));
    whenFileReceived.length = 0;
    return '';
});
ipcMain.handle('delete-file', (_e, client_id: string, id: string, name: string) => {
    const file_id = fileList.get(client_id)!.get(id)?.parent;
    if (file_id !== id)
        fileList.get(client_id)!.delete(id);
    const file_info = fileList.get(client_id)!.get(file_id ?? '');
    if (file_id && file_info) {
        file_info.ref--;
        fileList.get(client_id)!.set(file_id, file_info);
        fs.chmodSync(join(storagePath, client_id, id), 644);
        const fd = fs.openSync(join(storagePath, client_id, id, name), 'r');
        fs.fchmodSync(fd, 644);
        fs.closeSync(fd);
        fs.unlinkSync(join(storagePath, client_id, id, name));
        fs.rmdirSync(join(storagePath, client_id, id));
    }
});
ipcMain.handle('open-file', (_e, client_id: string, id: string, name: string) => {
    shell.showItemInFolder(join(storagePath, client_id, id, name));
});