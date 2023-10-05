interface Window {
    api: {
        makeClientDirectory(id: string);
        saveFile(client_id: string, name: string, file: Uint8Array): Promise<{
            hash: string[];
            hasKept: boolean;
            id: string;
        }>;
        whenFileReceived(): Promise<{
            name: string;
            file: Uint8Array;
        }>;
        sendFile(name: string, file: Uint8Array);
        deleteFile(client_id: string, id: string, name: string);
        openFile(client_id: string, id: string, name: string);
    }
}