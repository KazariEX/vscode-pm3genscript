# 项目配置

本扩展以 ``.pm3genrc.json`` 作为配置文件，请将它放在改版工程文件夹的根目录下。

## 属性

### rom

类型：``string``

指定 ROM 文件的相对路径 / 绝对路径。

### compilerOptions.removeAllIgnore

类型：``string[]``

不带 ``0x`` 前缀的十六进制地址数组，指示编译器宏 ``#removeall`` 不去清除当其为主要脚本块附加的地址时指向的数据。

这个配置项可以用于在 ROM 中写入一些通用的移动指令、文本等数据，而能够在调试脚本时安心地使用 ``#removeall``。

注意，当使用 ``#remove``、``#removemove``、``#removemart`` 或 ``#removestring`` 直接清除填入的地址时，它将不会生效。