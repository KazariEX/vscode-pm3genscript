# 项目配置

本扩展支持多种格式的配置文件：

- **YAML** - 使用 ``.pm3genrc.yaml`` 或 ``.pm3genrc.yml`` 定义配置结构。
- **JSON** - 使用 ``.pm3genrc.json`` 定义配置结构。

在脚本文件 ( ``*.pts`` ) 中对 ROM 进行操作时，扩展将从脚本文件所在的目录依次往上寻找配置文件，因此请将它放在改版工程文件夹的根目录下。当同一目录下存在多个配置文件时，将按照以上的描述顺序选择第一个文件。

## 属性

### rom

类型：``string``

指定 ROM 文件的路径。

### charset.language

类型：``string``

指定标准字符集的语言模式，取值为 ``en`` 或 ``zh``（默认值）。

### charset.path

类型：``string``

指定自定义字符集的路径。

请导入 YAML 格式的字符集，并使用形如 ``0xABCD: "乆"`` 的键值对构建字节数据到字符的映射。

### compilerOptions.removeAllIgnore

类型：``(number | string)[]``

偏移地址数组，指示编译器宏 ``#removeall`` 不去清除当其为主要脚本块附加的地址时指向的数据。

这个配置项可以用于在 ROM 中写入一些通用的移动指令、文本等数据，而能够在调试脚本时安心地使用 ``#removeall``。

注意，当使用 ``#remove``、``#removemove``、``#removemart`` 或 ``#removestring`` 直接清除填入的地址时，这个配置项将不会生效。