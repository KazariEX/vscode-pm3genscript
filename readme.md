# Vscode Pokemon 3rd Generation Script

宝可梦第三世代脚本的 VSCode 扩展，提供了语法高亮、代码补全、悬停提示、签名帮助等语言层面的功能；同时能够直接编译脚本并写入 ROM，目前尚未完善。

代码提示大部分来自 XSE 的帮助文档，在此向原作者表示诚挚的感谢。

# 使用方式

## 1. 直接写入 ROM

新建一个文件，选择指定的语言模式并编写脚本；在文本编辑框区域打开右键菜单，调用「编译」或「写入」功能。

当文件未保存时，使用「写入」功能将打开一个本地文件选择框，选择指定的 ROM 后，即可将编译后的结果写入文件。

## 2. 从配置文件出发

创建一个名为 ``.pm3genrc.json`` 的文件，并在其中指定 ROM 的路径：

```json
{
    "rom": "emerald.gba"
}
```

之后，将脚本以 ``.pts`` 格式保存在配置文件所在的目录下，再使用「写入」功能。这时，扩展将自动从配置文件中寻找 ROM 并写入编译结果。

# 进度

功能：
- [x] 编译
- [ ] 反编译
- [x] 写入

编译器宏：
- [x] alias
- [x] autobank
- [x] braille
- [x] break
- [ ] clean
- [x] define
- [x] definelist
- [x] dynamic
- [x] erase
- [x] eraserange
- [x] freespace
- [x] include
- [x] org
- [x] raw
- [ ] remove
- [ ] removeall
- [ ] removemart
- [ ] removemove
- [x] reserve
- [x] unalias
- [x] unaliasall
- [x] undefine
- [x] undefineall
- [x] =

# 已知的问题

- #include 宏存在循环包含的隐患。