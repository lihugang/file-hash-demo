<template>
    客户端ID: {{ client_id }}
    <hr />
    <table>
        <tbody>
            <tr>
                <td>文件名称</td>
                <td>接收时间</td>
                <td>是否重复</td>
                <td>操作</td>
            </tr>
            <template v-for="item in fileList">
                <tr>
                    <td>
                        {{ item.name }}
                    </td>
                    <td>
                        {{ new Date(item.time).toLocaleString('zh-CN') }}
                    </td>
                    <td>
                        {{ item.hasKept ? '是' : '否' }}
                    </td>
                    <td>
                        <button @click="openFile(item.id, item.name)">打开文件</button>
                        <button @click="unlinkFile(item.id, item.name)">删除文件</button>
                    </td>
                </tr>
            </template>
        </tbody>
    </table>
    <button @click="sendFile">选择文件并发送</button>
</template>
<script lang="ts" setup>
import { reactive } from 'vue';
const client_id = Math.random().toString(36).slice(5, 11);
window.api.makeClientDirectory(client_id);
const fileList = reactive<{
    hasKept: boolean;
    name: string;
    time: number;
    id: string;
}[]>([]);
(window as any).fl = fileList;
const openFile = (id: string, name: string) => {
    window.api.openFile(client_id, id, name);
}
const unlinkFile = (id: string, name: string) => {
    window.api.deleteFile(client_id, id, name);
    for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].id === id) {
            fileList.splice(i, 1);
            break;
        }
    }
}
((async () => {
    while (1) {
        const file = await window.api.whenFileReceived();
        const info = await window.api.saveFile(client_id, file.name, file.file);
        console.log(file, info);
        fileList.push({
            hasKept: info.hasKept,
            time: new Date().getTime(),
            name: file.name,
            id: info.id,
        });
    }
})());

const sendFile = () => {
    const element = document.createElement('input');
    element.type = 'file';
    element.onchange = () => {
        if (!element.files || element.files.length == 0) return;
        const filename = element.files[0].name;
        const reader = new FileReader();
        reader.readAsArrayBuffer(element.files[0]);
        reader.onload = () => {
            const result = new Uint8Array(reader.result as unknown as ArrayBuffer);
            window.api.sendFile(filename, result);
        }
    }
    element.click();
}
</script>