export type WordData = {
    [K in keyof any]: {
        alias?: string[],
        bytes?: number,
        description?: {
            [key in "en" | "zh"]?: string
        },
        example?: {
            value: string,
            description?: string
        },
        hoisting?: Boolean,
        redirect?: string,
        params?: Array<{
            name: string,
            enum?: any[],
            type?: string | string[],
            description?: string,
            can?: {
                dynamic?: boolean,
                symbol?: boolean
            }
        }>,
        value?: number,
    }
};

const rawTypes = ["byte", "b", "char", "word", "i", "int", "integer", "dword", "l", "long", "pointer", "p", "ptr"];

const macros: WordData = {
    "alias": {
        description: {
            zh: `设置在编译脚本时使用的替换符号。`
        },
        hoisting: true,
        params: [
            {
                name: "symbol",
                type: "command"
            },
            {
                name: "alias",
                type: "command"
            }
        ],
        example: {
            value: "#alias givepokemon gimmepoke",
            description: "在这个例子中，我们设置了一个叫做 gimmepoke 的别名。当编译器运行时，任何出现的 gimmepoke 都将被替换为 givepokemon。"
        }
    },
    "autobank": {
        description: {
            en: `Turns on or off autobanking. When turned on, the extra 0x08/0x09 bank is automatically added to any pointer if the pointer doesn't have a bank already. By default autobanking is enabled. Anyway, #org is not affected by this directive.`
        },
        hoisting: true,
        params: [
            {
                name: "on | off",
                enum: ["on", "off"]
            }
        ],
        example: {
            value: "#autobank on",
            description: "Autobanking was turned on, which means all its effects take place."
        }
    },
    "binary": {
        redirect: "raw"
    },
    "braille": {
        description: {
            zh: `使用盲文表转换文本并插入 ROM。请注意，盲文字母仅包含大写字母。`
        },
        params: [
            {
                name: "text",
                type: "string"
            }
        ],
        example: {
            value: "#braille \"ABC\"",
            description: `字符串 "ABC" 将在被转换为盲文后写入 ROM。`
        },
    },
    "break": {
        alias: ["stop"],
        description: {
            zh: `当编译器到达该指令时，它将停止处理脚本的剩余部分。在调试脚本时很有用。`
        },
        example: {
            value: "#break"
        }
    },
    "clean": {
        description: {
            zh: `
            \n清除上次编译的脚本，只要它是动态的。
            \n相当于 #removeall。`
        },
        hoisting: true,
        example: {
            value: "#clean"
        }
    },
    "const": {
        redirect: "define"
    },
    "constlist": {
        redirect: "definelist"
    },
    "deconst": {
        redirect: "undefine"
    },
    "deconstall": {
        redirect: "undefineall"
    },
    "define": {
        alias: ["const"],
        description: {
            zh: `
            \n允许我们在编译脚本时定义可以替换数字的符号。
            \n必须使用大写字母或下划线作为符号名称，替换的数字可以是从字节到双字的任何大小。`
        },
        hoisting: true,
        params: [
            {
                name: "symbol",
                type: "symbol"
            },
            {
                name: "value",
                type: ["byte", "word", "dword"],
                can: {
                    symbol: false
                }
            }
        ],
        example: {
            value: "#define LASTRESULT 0x800D",
            description: "在这个例子中，我们定义了一个叫做 LASTRESULT 的符号，它的值为 0x800D。"
        }
    },
    "definelist": {
        alias: ["constlist"],
        description: {
            zh: `如果启用了编译器日志，则会显示编译期间使用 #define 定义的完整列表。`
        },
        hoisting: true,
        example: {
            value: "#definelist"
        }
    },
    "dynamic": {
        description: {
            zh: `设置动态偏移量的起始基准，编译器将从这里开始查找可用空间。`
        },
        hoisting: true,
        params: [
            {
                name: "offset",
                type: "pointer",
                can: {
                    dynamic: false
                }
            }
        ],
        example: {
            value: "#dynamic 0x720000",
            description: "在这个例子中，编译器将从 0x720000 开始向下查找可用空间。"
        }
    },
    "erase": {
        description: {
            zh: `从指定的偏移量开始，使用可用空间字节值覆盖一定数量的字节。`
        },
        hoisting: true,
        params: [
            {
                name: "offset",
                type: "pointer",
                can: {
                    dynamic: false
                }
            },
            {
                name: "length",
                type: "literal"
            }
        ],
        example: {
            value: "#erase 0x720000 0x64",
            description: "从 0x720000 开始的 100(0x64) 个字节将被可用空间字节值覆盖。"
        }
    },
    "eraserange": {
        description: {
            zh: `使用可用空间字节值覆盖指定范围的字节。`
        },
        hoisting: true,
        params: [
            {
                name: "start-offset",
                type: "pointer",
                can: {
                    dynamic: false
                }
            },
            {
                name: "end-offset",
                type: "pointer",
                can: {
                    dynamic: false
                }
            }
        ],
        example: {
            value: "#eraserange 0x720000 0x7201F4",
            description: "从 0x720000 到 0x7201F4 的 500(0x1F4) 个字节将被可用空间字节值覆盖。"
        }
    },
    "freespace": {
        description: {
            zh: `设置可用空间字节值。默认值为 0xFF。`
        },
        hoisting: true,
        params: [
            {
                name: "0x00 | 0xFF",
                type: "byte"
            }
        ],
        example: {
            value: "#freespace 0x00"
        }
    },
    "include": {
        description: {
            zh: `在编译过程中包含一个头文件。`
        },
        hoisting: true,
        params: [
            {
                name: "file",
                type: "string"
            }
        ],
        example: {
            value: `#include "stdpoke.ptc"`,
            description: "脚本将在编译时包含文件 stdpoke.ptc 中所有的 #define 定义。"
        }
    },
    "org": {
        alias: ["seek"],
        description: {
            zh: `
            \n告诉编译器从哪里开始在ROM中编写脚本，可以使用静态或动态偏移：
            \n在第一种情况下，指定的位置和编译器使用的偏移量一致；
            \n在后一种情况下，编译器将自动计算偏移量，并根据可用空间进行分配。
            \n最明显的区别是，静态偏移填入一个实数，而动态偏移使用以 "@" 开头的标签。`
        },
        params: [
            {
                name: "offset",
                type: "pointer"
            }
        ],
        example: {
            value: `
            \n#org 0x800000
            \n#org @main`,
            description: "在第一个例子中，我们选择从 0x800000 开始书写脚本；在第二个例子中，我们使用了一个名为 main 的动态标签来获取合适的偏移量。"
        }
    },
    "put": {
        redirect: "raw"
    },
    "raw": {
        alias: ["binary", "put"],
        description: {
            zh: `
            \n在 ROM 中直接插入原始数据。
            \n要确定使用的数据类型，在后面的任何值前添加类型的名称即可。
            \n如果没有指定类型，插入的值将被视为字节。
            \n可能的数据类型包括：
            \n- **byte** (also **b** or **char**)
            \n- **word** (also **i**, **int** or **integer**)
            \n- **dword** (also **l** or **long**)
            \n- **pointer** (also **p** or **ptr**)`
        },
        params: [
            {
                name: "data-type",
                enum: rawTypes
            },
            {
                name: "value",
                type: ["byte", "word", "dword", "pointer"]
            }
        ],
        example: {
            value: "#raw 0xA 0x32 word 0x43BC dword 0xDA740D1 pointer 0x810000",
            description: "这个例子将输出两个字节、一个字、一个双字和一个指针。指针将被自动写为小端序，但双字不受影响。"
        }
    },
    "seek": {
        redirect: "org"
    },
    "stop": {
        redirect: "break"
    },
    "remove": {
        description: {
            zh: `删除已编译脚本的主要部分（如果有效），并使用可用空间字节值填充。`
        },
        hoisting: true,
        params: [
            {
                name: "offset",
                type: "pointer",
                can: {
                    dynamic: false
                }
            }
        ],
        example: {
            value: "#remove 0x16582F",
            description: "0x16582F 处脚本的主要部分将被删除。"
        }
    },
    "removeall": {
        description: {
            zh: `删除已编译的脚本（如果有效），以及它的所有额外数据，如字符串、移动指令、商店数据或盲文等；并使用可用空间字节值填充。`
        },
        hoisting: true,
        params: [
            {
                name: "offset",
                type: "pointer",
                can: {
                    dynamic: false
                }
            }
        ],
        example: {
            value: "#remove 0x16A6E0",
            description: "0x16A6E0 处的脚本将被完全删除。"
        }
    },
    "removemart": {
        description: {
            zh: `删除在指定偏移量处找到的商店数据。`
        },
        hoisting: true,
        params: [
            {
                name: "offset",
                type: "pointer",
                can: {
                    dynamic: false
                }
            }
        ],
        example: {
            value: "#removemart 0x1FC260",
            description: "0x1FC260 处的商店数据将被删除。"
        }
    },
    "removemove": {
        description: {
            zh: `删除在指定偏移量处找到的移动指令。`
        },
        hoisting: true,
        params: [
            {
                name: "offset",
                type: "pointer",
                can: {
                    dynamic: false
                }
            }
        ],
        example: {
            value: "#removemove 0x1E80DF",
            description: "0x1E80DF 处的移动指令将被删除。"
        }
    },
    "reserve": {
        description: {
            zh: `在脚本中使用 nop1 填充以保留指定长度的字节。`
        },
        params: [
            {
                name: "length",
                type: "literal"
            }
        ],
        example: {
            value: `
            \n#org @1
            \n...
            \n#reserve 0xA
            \n...
            \nend`,
            description: "10(0xA) 字节将被保留在脚本中供以后使用。"
        }
    },
    "unalias": {
        description: {
            zh: `从别名列表中删除指定的别名。`
        },
        hoisting: true,
        params: [
            {
                name: "alias",
                type: "command"
            }
        ],
        example: {
            value: "#unalias gimmepoke",
            description: "别名 gimmepoke 将不再能够使用。"
        }
    },
    "unaliasall": {
        description: {
            zh: `删除所有别名。`
        },
        hoisting: true,
        example: {
            value: "#unaliasall"
        },
    },
    "undefine": {
        alias: ["deconst"],
        description: {
            zh: `从定义列表中删除指定的符号。`
        },
        hoisting: true,
        params: [
            {
                name: "symbol",
                type: "symbol"
            }
        ],
        example: {
            value: "#undefine MSG_NORMAL",
            description: "符号 MSG_NORMAL 将不再能够使用。"
        }
    },
    "undefineall": {
        alias: ["deconstall"],
        description: {
            zh: `删除所有定义的符号。`
        },
        hoisting: true,
        example: {
            value: "#undefineall"
        }
    },
    "=": {
        description: {
            zh: `
            \n原始文本插入器。
            \n使用这个指令，可以将任何文本写入 ROM，文本会被 ROM 自动转换为正确的十六进制数据。`
        },
        params: [
            {
                name: "text",
                type: "string"
            }
        ],
        example: {
            value: "= \"Hello world!\"",
            description: "在将所有字符按照字符对照表转换完成后，字符串将被写入 ROM。"
        }
    }
};

const commands: WordData = {
    "if": {
        description: {
            zh: `
            \n如果最后一次比较返回了某个值，则跳转到另一个脚本。
            \n这个命令实际上是 if1 / if2 的语法糖，需要配合 goto / call 使用，语法格式为：
            \nif ... goto / call ...`
        },
        bytes: 6,
        params: [
            {
                name: "condition",
                type: "byte",
                description: "Condition"
            },
            {
                name: "goto | call",
                type: "command",
                description: "Command Type",
            },
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to go to"
            }
        ]
    },
    "nop": {
        value: 0x00,
        description: {
            en: `Does absolutely nothing.`,
            zh: `什么都不做。`
        },
        bytes: 1
    },
    "nop1": {
        value: 0x01,
        description: {
            en: `Does absolutely nothing.`,
            zh: `什么都不做。`
        },
        bytes: 1
    },
    "end": {
        value: 0x02,
        description: {
            en: `Ends the execution of the script.`,
            zh: `结束脚本的执行。`
        },
        bytes: 1
    },
    "return": {
        value: 0x03,
        description: {
            en: `Pops back to the last calling command used.`,
            zh: `返回上次使用的 call 命令。`
        },
        bytes: 1
    },
    "call": {
        value: 0x04,
        description: {
            en: `Continues script execution from another point. Can be returned to.`,
            zh: `跳转到另一个偏移执行脚本。可以被 return 命令返回。`
        },
        bytes: 5,
        params: [
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to continue from"
            }
        ]
    },
    "goto": {
        value: 0x05,
        description: {
            en: `Continues script execution from another point.`,
            zh: `跳转到另一个偏移执行脚本。不能被 return 命令返回。`
        },
        bytes: 5,
        params: [
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to continue from"
            }
        ]
    },
    "if1": {
        value: 0x06,
        description: {
            en: `If the last comparison returned a certain value, jumps to another script.`,
            zh: `
            \n如果最后一次比较返回了某个值，则跳转到另一个脚本。
            \n相当于 if ... goto ...`
        },
        bytes: 6,
        params: [
            {
                name: "condition",
                type: "byte",
                description: "Condition"
            },
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to go to"
            }
        ]
    },
    "if2": {
        value: 0x07,
        description: {
            en: `Calling version of the if command.`,
            zh: `
            \nif 命令的 calling 版本。
            \n相当于 if ... call ...`
        },
        bytes: 6,
        params: [
            {
                name: "condition",
                type: "byte",
                description: "Condition"
            },
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to go to"
            }
        ]
    },
    "gotostd": {
        value: 0x08,
        description: {
            en: `Jumps to a built-in function.`,
            zh: `跳转到内置函数。`
        },
        bytes: 2,
        params: [
            {
                name: "function",
                type: "byte",
                description: "Function # to jump to"
            }
        ]
    },
    "callstd": {
        value: 0x09,
        description: {
            en: `Calls a built-in function.`,
            zh: `调用内置函数。`
        },
        bytes: 2,
        params: [
            {
                name: "function",
                type: "byte",
                description: "Function # to call"
            }
        ]
    },
    "gotostdif": {
        value: 0x0A,
        description: {
            en: `Jumps to a built-in function, conditional version.`,
            zh: `跳转到内置函数的条件版本。`
        },
        bytes: 3,
        params: [
            {
                name: "condition",
                type: "byte",
                description: "Condition"
            },
            {
                name: "function",
                type: "byte",
                description: "Function # to jump to"
            }
        ],
    },
    "callstdif": {
        value: 0x0B,
        description: {
            en: `Calls a built-in function, conditional version.`,
            zh: `调用内置函数的条件版本。`
        },
        bytes: 3,
        params: [
            {
                name: "condition",
                type: "byte",
                description: "Condition"
            },
            {
                name: "function",
                type: "byte",
                description: "Function # to call"
            }
        ]
    },
    "jumpram": {
        value: 0x0C,
        description: {
            en: `Jumps to a default RAM location, executing the script stored there.`,
            zh: `跳转到默认的 RAM 位置，执行存储在那里的脚本。`
        },
        bytes: 1
    },
    "killscript": {
        value: 0x0D,
        description: {
            en: `Kills the script and resets the script RAM.`,
            zh: `杀死脚本并重置脚本 RAM。`
        },
        bytes: 1
    },
    "setbyte": {
        value: 0x0E,
        description: {
            en: `Sets a predefined address to the specified byte value.`,
            zh: `将预定义地址设置为指定的字节值。`
        },
        bytes: 2,
        params: [
            {
                name: "value",
                type: "byte",
                description: "Byte value to use"
            }
        ]
    },
    "loadpointer": {
        value: 0x0F,
        description: {
            en: `Loads a pointer into the script RAM so other commands can use it.`,
            zh: `将指针加载到脚本 RAM 中，以便其他命令可以使用它。`
        },
        bytes: 6,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Memory bank to use"
            },
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to load into memory"
            }
        ]
    },
    "setbyte2": {
        value: 0x10,
        description: {
            en: `Sets a memory bank to the specified byte value.`,
            zh: `将一个内存存储体设置为指定的字节值。`
        },
        bytes: 3,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Memory bank to use"
            },
            {
                name: "value",
                type: "byte",
                description: "Byte value to use"
            }
        ]
    },
    "writebytetooffset": {
        value: 0x11,
        description: {
            en: `Sets the byte at the spedified offset to a certain value.`,
            zh: `将指定偏移量处的字节设置为特定值。`
        },
        bytes: 6,
        params: [
            {
                name: "value",
                type: "byte",
                description: "Byte value to write"
            },
            {
                name: "pointer",
                type: "pointer",
                description: "Location to write it to"
            }
        ]
    },
    "loadbytefrompointer": {
        value: 0x12,
        description: {
            en: `Loads the byte found at a pointer into the script RAM so other commands can use it.`,
            zh: `将在指针处找到的字节加载到脚本 RAM 中，以便其他命令可以使用它。`
        },
        bytes: 6,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Memory bank to use"
            },
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to byte to load into memory"
            }
        ]
    },
    "setfarbyte": {
        value: 0x13,
        description: {
            en: `Sets the byte into a specified pointer.`,
            zh: `将内存存储体中的字节写入特定的指针处。`
        },
        bytes: 6,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Memory bank to use"
            },
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to write byte to"
            }
        ]
    },
    "copyscriptbanks": {
        value: 0x14,
        description: {
            en: `Copies one script bank to another.`,
            zh: `将一个脚本存储体复制到另一个中。`
        },
        bytes: 3,
        params: [
            {
                name: "bank #1",
                type: "byte",
                description: "Bank #1 - Destination"
            },
            {
                name: "bank #2",
                type: "byte",
                description: "Bank #2 - Source"
            }
        ]
    },
    "copybyte": {
        value: 0x15,
        description: {
            en: `Copies a byte value from one place to another.`,
            zh: `将字节值从一个位置复制到另一个位置。`
        },
        bytes: 9,
        params: [
            {
                name: "pointer A",
                type: "pointer",
                description: "Destination byte location"
            },
            {
                name: "pointer B",
                type: "pointer",
                description: "Source byte location"
            }
        ]
    },
    "setvar": {
        value: 0x16,
        description: {
            en: `Sets variable A to any value.`,
            zh: "将变量 A 设置为任意值。"
        },
        bytes: 5,
        params: [
            {
                name: "variable A",
                type: "word",
                description: "Variable A"
            },
            {
                name: "value",
                type: "word",
                description: "Value to set A to"
            }
        ]
    },
    "addvar": {
        value: 0x17,
        description: {
            en: `Adds any value to variable A.`,
            zh: `将任意值添加到变量 A。`
        },
        bytes: 5,
        params: [
            {
                name: "variable A",
                type: "word",
                description: "Variable A"
            },
            {
                name: "value",
                type: "word",
                description: "Value to add to A"
            }
        ]
    },
    "subvar": {
        value: 0x18,
        description: {
            en: `Subtracts any value from variable A.`,
            zh: `从变量 A 中减去任意值。`
        },
        bytes: 5,
        params: [
            {
                name: "variable A",
                type: "word",
                description: "Variable A"
            },
            {
                name: "value",
                type: "word",
                description: "Value subtract from A"
            }
        ]
    },
    "copyvar": {
        value: 0x19,
        description: {
            en: `Copies variable B to A.`,
            zh: `将变量 B 复制到 A。`
        },
        bytes: 5,
        params: [
            {
                name: "variable A",
                type: "word",
                description: "Variable A - Destination"
            },
            {
                name: "variable B",
                type: "word",
                description: "Variable B - Source"
            }
        ]
    },
    "copyvarifnotzero": {
        value: 0x1A,
        description: {
            en: `Sets variable B to A, but only if B is higher than zero.`,
            zh: `将变量 B 设置为 A，当且仅当 B 的值大于 0。`
        },
        bytes: 5,
        params: [
            {
                name: "variable A",
                type: "word",
                description: "Variable A - Destination"
            },
            {
                name: "variable B",
                type: "word",
                description: "Variable B - Source"
            }
        ]
    },
    "comparebanks": {
        value: 0x1B,
        description: {
            en: "Compares two banks.",
            zh: "比较两个存储体。"
        },
        bytes: 5,
        params: [
            {
                name: "bank #1",
                type: "word",
                description: "Bank #1"
            },
            {
                name: "bank #2",
                type: "word",
                description: "Bank #2"
            }
        ]
    },
    "comparebanktobyte": {
        value: 0x1C,
        description: {
            en: "Compares a variable stored in a buffer to a byte value.",
            zh: "将存储在缓冲区中的变量与字节值进行比较。"
        },
        bytes: 3,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Bank #"
            },
            {
                name: "value",
                type: "byte",
                description: "Byte value to compare variable to"
            }
        ]
    },
    "comparebanktofarbyte": {
        value: 0x1D,
        description: {
            en: "Compares a bank with a byte at some location.",
            zh: "将存储体与某个位置的字节进行比较。"
        },
        bytes: 6,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Bank #"
            },
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to a byte value to compare variable to"
            }
        ]
    },
    "comparefarbytetobank": {
        value: 0x1E,
        description: {
            en: "Compares a byte at some location to a buffered variable. The reverse of comparevartofarbyte.",
            zh: "将某个位置的字节与缓冲变量进行比较。与 comparebanktofarbyte 相反。"
        },
        bytes: 6,
        params: [
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to a byte value to compare variable to"
            },
            {
                name: "bank",
                type: "byte",
                description: "Bank #"
            }
        ]
    },
    "comparefarbytetobyte": {
        value: 0x1F,
        description: {
            en: "Compares a byte at some location to a byte value.",
            zh: "将某个位置的字节与字节值进行比较。"
        },
        bytes: 6,
        params: [
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to a byte value to compare with"
            },
            {
                name: "value",
                type: "byte",
                description: "Byte value to compare with"
            }
        ]
    },
    "comparefarbytes": {
        value: 0x20,
        description: {
            en: "Compares a byte at some location to a byte at another location.",
            zh: "将某个位置的字节与另一位置的字节进行比较。"
        },
        bytes: 9,
        params: [
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to a byte value to compare with"
            },
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to a byte value to compare with"
            }
        ]
    },
    "compare": {
        value: 0x21,
        description: {
            en: "Compares variable A to a value.",
            zh: "将变量 A 与值进行比较。"
        },
        bytes: 5,
        params: [
            {
                name: "variable A",
                type: "word",
                description: "Variable A"
            },
            {
                name: "value",
                type: "word",
                description: "Value to compare A to"
            }
        ]
    },
    "comparevars": {
        value: 0x22,
        description: {
            en: "Compares two variables.",
            zh: "比较两个变量。"
        },
        bytes: 5,
        params: [
            {
                name: "variable A",
                type: "word",
                description: "Variable A"
            },
            {
                name: "variable B",
                type: "word",
                description: "Variable B"
            }
        ]
    },
    "callasm": {
        value: 0x23,
        description: {
            en: "Calls a custom ASM routine.",
            zh: "调用自定义 ASM 例程。"
        },
        bytes: 5,
        params: [
            {
                name: "pointer",
                type: "pointer",
                description: "Address of custom ASM routine"
            }
        ]
    },
    "cmd24": {
        value: 0x24,
        description: {
            en: "This command is currently under investigation, No detailed information is available at this time."
        },
        bytes: 5,
        params: [
            {
                name: "pointer",
                type: "pointer",
                description: "???"
            }
        ]
    },
    "special": {
        value: 0x25,
        description: {
            en: "Calls a special event.",
            zh: "调用特殊事件。"
        },
        bytes: 3,
        params: [
            {
                name: "event",
                type: "word",
                description: "Event # to call"
            }
        ]
    },
    "special2": {
        value: 0x26,
        description: {
            en: "Like special, but can store a returned value.",
            zh: "类似 special，但是可以存储返回值。"
        },
        bytes: 5,
        params: [
            {
                name: "variable",
                type: "word",
                description: "Variable to store returned value in"
            },
            {
                name: "event",
                type: "word",
                description: "Special event to call"
            }
        ]
    },
    "waitstate": {
        value: 0x27,
        description: {
            en: "Sets the script to a wait state, useful for some specials and commands.",
            zh: "将脚本设置为等待状态，对于某些特殊功能和命令很有用。"
        },
        bytes: 1
    },
    "pause": {
        value: 0x28,
        description: {
            en: "Pauses script execution for a short amount of time.",
            zh: "将脚本的执行暂停一段时间。"
        },
        bytes: 3,
        params: [
            {
                name: "delay",
                type: "word",
                description: "Delay"
            }
        ]
    },
    "setflag": {
        value: 0x29,
        description: {
            en: "Sets a flag for later use.",
            zh: "设置一个标志供以后使用。"
        },
        bytes: 3,
        params: [
            {
                name: "flag",
                type: "word",
                description: "Flag #"
            }
        ]
    },
    "clearflag": {
        value: 0x2A,
        description: {
            en: "Clears the value of a flag.",
            zh: "清除标志的值。"
        },
        bytes: 3,
        params: [
            {
                name: "flag",
                type: "word",
                description: "Flag #"
            }
        ]
    },
    "checkflag": {
        value: 0x2B,
        description: {
            en: "Checks the value of a flag.",
            zh: "检查标志的值。"
        },
        bytes: 3,
        params: [
            {
                name: "flag",
                type: "word",
                description: "Flag #"
            }
        ]
    },
    "cmd2C": {
        value: 0x2C,
        description: {
            en: "This command is currently under investigation, No detailed information is available at this time."
        },
        bytes: 5,
        params: [
            {
                name: "???",
                type: "word",
                description: "???"
            },
            {
                name: "???",
                type: "word",
                description: "???"
            }
        ]
    },
    "checkdailyflags": {
        value: 0x2D,
        description: {
            en: "Checks the daily flags to see if any of them have been set already. but only if they were set previously, Then it dears those fags. R / S / E only."
        },
        bytes: 1
    },
    "resetvars": {
        value: 0x2E,
        description: {
            en: "Resets the value of variables 0x8000, 0x8001 and 0x8002.",
            zh: "重置变量 0x8000，0x8001 和 0x8002 的值。"
        },
        bytes: 1
    },
    "sound": {
        value: 0x2F,
        description: {
            en: "Plays a sound.",
            zh: "播放声音。"
        },
        bytes: 3,
        params: [
            {
                name: "sound",
                type: "word",
                description: "Sound #"
            }
        ]
    },
    "checksound": {
        value: 0x30,
        description: {
            en: "Checks if a sound, a fanfare or a song is currently being played.",
            zh: "检查当前是否正在播放声音、效果音或音乐。"
        },
        bytes: 1
    },
    "fanfare": {
        value: 0x31,
        description: {
            en: "Plays a Sappy song as a fanfare.",
            zh: "播放效果音。"
        },
        bytes: 3,
        params: [
            {
                name: "fanfare",
                type: "word",
                description: "Sappy song # to play"
            }
        ]
    },
    "waitfanfare": {
        value: 0x32,
        description: {
            en: "Waits for fanfare to finish.",
            zh: "等待效果音结束。"
        },
        bytes: 1
    },
    "playsong": {
        value: 0x33,
        description: {
            en: "Switches to another Sappy song.",
            zh: "播放音乐。"
        },
        bytes: 4,
        params: [
            {
                name: "song",
                type: "word",
                description: "Sappy song # to play"
            },
            {
                name: "???",
                type: "byte",
                description: "???"
            }
        ]
    },
    "playsong2": {
        value: 0x34,
        description: {
            en: "Switches to another Sappy song.",
            zh: "播放音乐。"
        },
        bytes: 3,
        params: [
            {
                name: "song",
                type: "word",
                description: "Sappy song # to play"
            }
        ]
    },
    "fadedefault": {
        value: 0x35,
        description: {
            en: "Gently fades the current music back to the map's default song.",
            zh: "从当前正在播放的音乐淡出至地图默认音乐。"
        },
        bytes: 1
    },
    "fadesong": {
        value: 0x36,
        description: {
            en: "Gently fades into another Sappy song.",
            zh: "从地图默认音乐淡入至指定音乐。"
        },
        bytes: 3,
        params: [
            {
                name: "song",
                type: "word",
                description: "Sappy song # to fade to"
            }
        ]
    },
    "fadeout": {
        value: 0x37,
        description: {
            en: "Fades out the currently playing Sappy song.",
            zh: "淡出当前正在播放的音乐。"
        },
        bytes: 2,
        params: [
            {
                name: "speed",
                type: "byte",
                description: "Fading speed"
            }
        ]
    },
    "fadein": {
        value: 0x38,
        description: {
            en: "Fades the currently playing Sappy song back in.",
            zh: "淡入当前正在播放的音乐。"
        },
        bytes: 2,
        params: [
            {
                name: "speed",
                type: "byte",
                description: "Fading speed"
            }
        ]
    },
    "warp": {
        value: 0x39,
        description: {
            en: "Warps the player to another map.",
            zh: "跳转到另一张地图。"
        },
        bytes: 8,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Bank # to warp to"
            },
            {
                name: "map",
                type: "byte",
                description: "Map # to warp to"
            },
            {
                name: "exit",
                type: "byte",
                description: "Exit # to warp to"
            },
            {
                name: "X",
                type: "word",
                description: "X coordinate"
            },
            {
                name: "Y",
                type: "word",
                description: "Y coordinate"
            }
        ]
    },
    "warpmuted": {
        value: 0x3A,
        description: {
            en: "Warps the player to another map. No sound effect.",
            zh: "跳转到另一张地图。无音效。"
        },
        bytes: 8,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Bank # to warp to"
            },
            {
                name: "map",
                type: "byte",
                description: "Map # to warp to"
            },
            {
                name: "exit",
                type: "byte",
                description: "Exit # to warp to"
            },
            {
                name: "X",
                type: "word",
                description: "X coordinate"
            },
            {
                name: "Y",
                type: "word",
                description: "Y coordinate"
            }
        ]
    },
    "warpwalk": {
        value: 0x3B,
        description: {
            en: "Warps the player to another map. Walking effect.",
            zh: "跳转到另一张地图。走路效果。"
        },
        bytes: 8,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Bank # to warp to"
            },
            {
                name: "map",
                type: "byte",
                description: "Map # to warp to"
            },
            {
                name: "exit",
                type: "byte",
                description: "Exit # to warp to"
            },
            {
                name: "X",
                type: "word",
                description: "X coordinate"
            },
            {
                name: "Y",
                type: "word",
                description: "Y coordinate"
            }
        ]
    },
    "warphole": {
        value: 0x3C,
        description: {
            en: "Warps the player to another map. Hole effect.",
            zh: "跳转到另一张地图。洞穴效果。"
        },
        bytes: 3,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Bank # to warp to"
            },
            {
                name: "map",
                type: "byte",
                description: "Map # to warp to"
            }
        ]
    },
    "warpteleport": {
        value: 0x3D,
        description: {
            en: "Warps the player to another map. Teleport effect.",
            zh: "跳转到另一张地图。传送效果。"
        },
        bytes: 8,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Bank # to warp to"
            },
            {
                name: "map",
                type: "byte",
                description: "Map # to warp to"
            },
            {
                name: "exit",
                type: "byte",
                description: "Exit # to warp to"
            },
            {
                name: "X",
                type: "word",
                description: "X coordinate"
            },
            {
                name: "Y",
                type: "word",
                description: "Y coordinate"
            }
        ]
    },
    "warp3": {
        value: 0x3E,
        description: {
            en: "Warps the player to another map.",
            zh: "跳转到另一张地图。"
        },
        bytes: 8,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Bank # to warp to"
            },
            {
                name: "map",
                type: "byte",
                description: "Map # to warp to"
            },
            {
                name: "exit",
                type: "byte",
                description: "Exit # to warp to"
            },
            {
                name: "X",
                type: "word",
                description: "X coordinate"
            },
            {
                name: "Y",
                type: "word",
                description: "Y coordinate"
            }
        ]
    },
    "setwarpplace": {
        value: 0x3F,
        description: {
            en: "Sets the place a warp that lead to warp 127 of map 127.127 warps the player."
        },
        bytes: 8,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Bank # to warp to"
            },
            {
                name: "map",
                type: "byte",
                description: "Map # to warp to"
            },
            {
                name: "exit",
                type: "byte",
                description: "Exit # to warp to"
            },
            {
                name: "X",
                type: "word",
                description: "X coordinate"
            },
            {
                name: "Y",
                type: "word",
                description: "Y coordinate"
            }
        ]
    },
    "warp4": {
        value: 0x40,
        description: {
            en: "Warps the player to another map.",
            zh: "跳转到另一张地图。"
        },
        bytes: 8,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Bank # to warp to"
            },
            {
                name: "map",
                type: "byte",
                description: "Map # to warp to"
            },
            {
                name: "exit",
                type: "byte",
                description: "Exit # to warp to"
            },
            {
                name: "X",
                type: "word",
                description: "X coordinate"
            },
            {
                name: "Y",
                type: "word",
                description: "Y coordinate"
            }
        ]
    },
    "warp5": {
        value: 0x41,
        description: {
            en: "Warps the player to another map.",
            zh: "跳转到另一张地图。"
        },
        bytes: 8,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Bank # to warp to"
            },
            {
                name: "map",
                type: "byte",
                description: "Map # to warp to"
            },
            {
                name: "exit",
                type: "byte",
                description: "Exit # to warp to"
            },
            {
                name: "X",
                type: "word",
                description: "X coordinate"
            },
            {
                name: "Y",
                type: "word",
                description: "Y coordinate"
            }
        ]
    },
    "getplayerpos": {
        value: 0x42,
        description: {
            en: "Gets current position of the player on the map and stores it on specified variables.",
            zh: "跳转到另一张地图。"
        },
        bytes: 8,
        params: [
            {
                name: "variable X",
                type: "word",
                description: "Variable to store X coordinate"
            },
            {
                name: "variable Y",
                type: "word",
                description: "Variable to store Y coordinate"
            }
        ]
    },
    "countpokemon": {
        value: 0x43,
        description: {
            en: "Counts the number of Pokemon in your party and stores the result in LASTRESULT.",
            zh: "统计队伍中宝可梦的数量，并将结果存储在 LASTRESULT 中。"
        },
        bytes: 1
    },
    // 0x44: "additem",
    // 0x45: "removeitem",
    // 0x46: "checkitemroom",
    // 0x47: "checkitem",
    // 0x48: "checkitemtype",
    // 0x49: "addpcitem",
    // 0x4A: "checkpcitem",
    // 0x4B: "adddecoration",
    // 0x4C: "removedecoration",
    // 0x4D: "testdecoration",
    // 0x4E: "checkdecoration",
    // 0x4F: "applymovement",
    // 0x50: "applymovementpos",
    // 0x51: "waitmovement",
    // 0x52: "waitmovementpos",
    // 0x53: "hidesprite",
    // 0x54: "hidespritepos",
    // 0x55: "showsprite",
    // 0x56: "showspritepos",
    // 0x57: "movesprite",
    // 0x58: "spritevisible",
    // 0x59: "spriteinvisible",
    // 0x5A: "faceplayer",
    // 0x5B: "spriteface",
    // 0x5C: "trainerbattle",
    // 0x5D: "repeattrainerbattle",
    // 0x5E: "endtrainerbattle",
    // 0x5F: "endtrainerbattle2",
    // 0x60: "checktrainerflag",
    // 0x61: "cleartrainerflag",
    // 0x62: "settrainerflag",
    // 0x63: "movesprite2",
    // 0x64: "moveoffscreen",
    // 0x65: "spritebehave",
    // 0x66: "waitmsg",
    // 0x67: "preparemsg",
    // 0x68: "closeonkeypress",
    // 0x69: "lockall",
    // 0x6A: "lock",
    // 0x6B: "releaseall",
    // 0x6C: "release",
    // 0x6D: "waitkeypress",
    // 0x6E: "yesnobox",
    // 0x6F: "multichoice",
    // 0x70: "multichoice2",
    // 0x71: "multichoice3",
    // 0x72: "showbox",
    // 0x73: "hidebox",
    // 0x74: "clearbox",
    // 0x75: "showpokepic",
    // 0x76: "hidepokepic",
    // 0x77: "showcontestwinner",
    // 0x78: "braille",
    // 0x79: "givepokemon",
    // 0x7A: "giveegg",
    // 0x7B: "setpkmnpp",
    // 0x7C: "checkattack",
    // 0x7D: "bufferpokemon",
    // 0x7E: "bufferfirstpokemon",
    // 0x7F: "bufferpartypokemon",
    // 0x80: "bufferitem",
    // 0x81: "bufferdecoration",
    // 0x82: "bufferattack",
    // 0x83: "buffernumber",
    // 0x84: "bufferstd",
    // 0x85: "bufferstring",
    // 0x86: "pokemart",
    // 0x87: "pokemart2",
    // 0x88: "pokemart3",
    // 0x89: "pokecasino",
    // 0x8A: "cmd8a",
    // 0x8B: "choosecontestpkmn",
    // 0x8C: "startcontest",
    // 0x8D: "showcontestresults",
    // 0x8E: "contestlinktransfer",
    // 0x8F: "random",
    // 0x90: "givemoney",
    // 0x91: "paymoney",
    // 0x92: "checkmoney",
    // 0x93: "showmoney",
    // 0x94: "hidemoney",
    // 0x95: "updatemoney",
    // 0x96: "cmd96",
    // 0x97: "fadescreen",
    // 0x98: "fadescreendelay",
    // 0x99: "darken",
    // 0x9A: "lighten",
    // 0x9B: "preparemsg2",
    // 0x9C: "doanimation",
    // 0x9D: "setanimation",
    // 0x9E: "checkanimation",
    // 0x9F: "sethealingplace",
    // 0xA0: "checkgender",
    // 0xA1: "cry",
    // 0xA2: "setmaptile",
    // 0xA3: "resetweather",
    // 0xA4: "setweather",
    // 0xA5: "doweather",
    // 0xA6: "cmda6",
    // 0xA7: "setmapfooter",
    // 0xA8: "spritelevelup",
    // 0xA9: "restorespritelevel",
    // 0xAA: "createsprite",
    // 0xAB: "spriteface2",
    // 0xAC: "setdooropened",
    // 0xAD: "setdoorclosed",
    // 0xAE: "doorchange",
    // 0xAF: "setdooropened2",
    // 0xB0: "setdoorclosed2",
    // 0xB1: "cmdb1",
    // 0xB2: "cmdb2",
    // 0xB3: "checkcoins",
    // 0xB4: "givecoins",
    // 0xB5: "removecoins",
    // 0xB6: "setwildbattle",
    // 0xB7: "dowildbattle",
    // 0xB8: "setvirtualaddress",
    "virtualgoto": {
        value: 0xB9,
        description: {
            en: `Jumps to a custom function.`,
            zh: `跳转到自定义函数。`
        },
        bytes: 5,
        params: [
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to custom function"
            }
        ]
    },
    "virtualcall": {
        value: 0xBA,
        description: {
            en: `Calls a custom function.`,
            zh: `调用自定义函数。`
        },
        bytes: 5,
        params: [
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to custom function"
            }
        ]
    },
    "virtualgotoif": {
        value: 0xBB,
        description: {
            en: `Jumps to a custom function, conditional version.`,
            zh: `跳转到自定义函数的条件版本。`
        },
        bytes: 6,
        params: [
            {
                name: "condition",
                type: "byte",
                description: "Condition"
            },
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to custom function"
            }
        ]
    },
    "virtualcallif": {
        value: 0xBC,
        description: {
            en: `Calls a custom function, conditional version.`,
            zh: `调用自定义函数的条件版本。`
        },
        bytes: 6,
        params: [
            {
                name: "condition",
                type: "byte",
                description: "Condition"
            },
            {
                name: "pointer",
                type: "pointer",
                description: "Pointer to custom function"
            }
        ]
    },
    // 0xBD: "virtualmsgbox",
    // 0xBE: "virtualloadpointer",
    // 0xBF: "virtualbuffer",
    // 0xC0: "showcoins",
    // 0xC1: "hidecoins",
    // 0xC2: "updatecoins",
    // 0xC3: "cmdc3",
    // 0xC4: "warp6",
    // 0xC5: "waitcry",
    // 0xC6: "bufferboxname",
    // 0xC7: "textcolor",
    // 0xC8: "cmdc8",
    // 0xC9: "cmdc9",
    // 0xCA: "signmsg",
    // 0xCB: "normalmsg",
    // 0xCC: "comparehiddenvar",
    // 0xCD: "setobedience",
    // 0xCE: "checkobedience",
    // 0xCF: "executeram",
    // 0xD0: "setworldmapflag",
    // 0xD1: "warpteleport2",
    // 0xD2: "setcatchlocation",
    // 0xD3: "braille2",
    // 0xD4: "bufferitems",
    // 0xD5: "cmdd5",
    // 0xD6: "cmdd6",
    // 0xD7: "warp7",
    // 0xD8: "cmdd8",
    // 0xD9: "cmdd9",
    // 0xDA: "hidebox2",
    // 0xDB: "preparemsg3",
    // 0xDC: "fadescreen3",
    // 0xDD: "buffertrainerclass",
    // 0xDE: "buffertrainername",
    // 0xDF: "pokenavcall",
    // 0xE0: "warp8",
    // 0xE1: "buffercontestype",
    // 0xE2: "bufferitems2",
    // "msgbox": "msgbox",
    // "message": "message",
    // "giveitem": "giveitem",
    // "giveitem2": "giveitem2",
    // "giveitem3": "giveitem3",
    // "wildbattle": "wildbattle",
    // "wildbattle2": "wildbattle2",
    // "registernav": "registernav"
}

const all = {
    ...macros,
    ...commands
};

export {
    all,
    macros,
    commands,
    rawTypes
};