# 聊天工具的文件管理功能示例

## 工作原理：
发送/接受文件时，将文件分成 32KB 每块，对每块都计算其 SHA512 值，比较待储存的文件各分块的 SHA512 值是否和本地存过的文件相同，若相同，则创造硬链接指向之前存的文件
（不小心多加了点乱七八糟的东西，给每个不同的文件都维护引用了，其实创建硬链接的时候文件系统会自己维护一个引用的...）