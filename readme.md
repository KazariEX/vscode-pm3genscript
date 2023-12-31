# VSCode Pokemon 3rd Generation Script

宝可梦第三世代脚本的 VSCode 扩展，提供了语法高亮、代码补全、悬停提示、签名帮助等静态语言功能；支持较为完备的词法、语法分析与检测，以便及早发现脚本中的错误；同时能够直接编译脚本并写入 ROM，目前尚未完善。

代码提示大部分来自 XSE 的帮助文档，以及悠然聚聚的《XSE 脚本指令全解》等，在此向各位作者表示诚挚的感谢。

参考文档：[语言特性](docs/feature.md)、[项目配置](docs/configuration.md)

# 使用方式

## 1. 直接写入 ROM

新建一个文件，选择指定的语言模式并编写脚本；在文本编辑框区域打开右键菜单，调用「编译」或「写入」功能。

当文件未保存时，使用「写入」功能将打开一个文件对话框，选择指定的 ROM 后，即可将编译后的结果写入文件。

## 2. 从配置文件出发

创建一个名为 ``.pm3genrc.json`` 的文件，并在其中指定 ROM 的相对路径 / 绝对路径：

```json
{
  "rom": "emerald.gba"
}
```

之后，将脚本以 ``.pts`` 为后缀保存在配置文件所在的目录下，再使用「写入」功能。这时，扩展将自动从配置文件中寻找 ROM 并写入编译结果。如果没有找到 ROM，仍提供一个文件对话框供选择。

## 3. 反编译

在资源管理器中右键点击 GBA 格式的 ROM 文件，即可调用「反编译」功能。在弹出的对话框中输入偏移地址后，扩展将在新的文本文档中显示反编译结果。

# 正在实现的

功能：
- 与 Advance Map 对接

编译器宏：
- clean

# 已知的问题

- ``#include`` 存在循环包含的隐患。