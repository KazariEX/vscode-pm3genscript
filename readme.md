# Vscode Pokemon 3rd Generation Script

宝可梦第三世代脚本的 VSCode 扩展，基于 XSE 代码。提供了语法高亮、代码补全、悬停提示、签名帮助等语言层面的功能；同时能够直接编译脚本并写入 ROM，目前尚未完善。

代码提示大部分来自 XSE 的帮助文档，在此向原作者表示诚挚的感谢。

# 进度

功能：
- [x] 编译
- [x] 写入

编译器宏：
- [x] alias
- [ ] autobank
- [ ] braille
- [x] break
- [ ] clean
- [x] define
- [x] definelist
- [x] dynamic
- [ ] erase
- [ ] eraserange
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
- [ ] =

# 已知的问题

- #include 宏存在循环包含。