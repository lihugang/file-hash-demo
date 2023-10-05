import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('api', {
    makeClientDirectory(id: string) {
        ipcRenderer.invoke('make-client-directory', id);
    },
    saveFile(client_id: string, name: string, file: Uint8Array): Promise<{
        hash: string[];
        hasKept: boolean;
        id: string;
    }> {
        return ipcRenderer.invoke('save-file', client_id, name, file);
    },
    whenFileReceived(): Promise<{
        name: string;
        file: Uint8Array;
    }> {
        return ipcRenderer.invoke('when-file-received');
    },
    sendFile(name: string, file: Uint8Array) {
        return ipcRenderer.invoke('send-file', name, file);
    },
    deleteFile(client_id: string, id: string, name: string) {
        return ipcRenderer.invoke('delete-file', client_id, id, name);
    },
    openFile(client_id: string, id: string, name: string) {
        return ipcRenderer.invoke('open-file', client_id, id, name);
    },
});