type ParamType = "byte" | "word" | "dword" | "pointer" | "number" | "string" | "symbol" | "command";

export interface MacroData {
    readonly [key: string]: {
        alias?: string[];
        description?: {
            [key in "en" | "zh"]?: string
        };
        example?: {
            value: string;
            description?: string;
        };
        hoisting?: boolean;
        redirect?: string;
        params?: Array<{
            name: string;
            enum?: any[];
            type?: ParamType | ParamType[];
            can?: {
                dynamic?: boolean;
                symbol?: boolean;
            };
        }>;
    };
}

export interface CommandData {
    readonly [key: string]: {
        bytes?: number;
        description?: {
            [key in "en" | "zh"]?: string
        };
        ending?: boolean;
        redirect?: string;
        params?: Array<{
            name: string;
            type?: ParamType;
            description?: string;
            when?: (params: any[]) => boolean;
        }>;
        value?: number;
    };
}

export const rawTypes = ["byte", "b", "char", "word", "i", "int", "integer", "dword", "l", "long", "pointer", "p", "ptr"];

export const macros: MacroData = {
    alias: {
        description: {
            zh: `设置在编译脚本时使用的替换符号。`
        },
        hoisting: true,
        params: [
            {
                name: "command",
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
    autobank: {
        description: {
            en: `
            \n打开或关闭 autobank 功能，默认为打开。
            \n打开时，如果指针还没有存储体，则会自动将额外的 0x08 / 0x09 存储体添加到任何指针。
            \n无论如何，#org 不受该指令的影响。`
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
            description: "autobank 功能被打开了，这意味着它的所有影响都发生了。"
        }
    },
    binary: {
        redirect: "raw"
    },
    braille: {
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
        }
    },
    break: {
        alias: ["stop"],
        description: {
            zh: `当编译器到达该指令时，它将停止处理脚本的剩余部分。在调试脚本时很有用。`
        },
        example: {
            value: "#break"
        }
    },
    clean: {
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
    const: {
        redirect: "define"
    },
    constlist: {
        redirect: "definelist"
    },
    deconst: {
        redirect: "undefine"
    },
    deconstall: {
        redirect: "undefineall"
    },
    define: {
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
    definelist: {
        alias: ["constlist"],
        description: {
            zh: `如果启用了编译器日志，则会显示编译期间使用 #define 定义的完整列表。`
        },
        hoisting: true,
        example: {
            value: "#definelist"
        }
    },
    dynamic: {
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
    erase: {
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
                type: "number"
            }
        ],
        example: {
            value: "#erase 0x720000 0x64",
            description: "从 0x720000 开始的 100(0x64) 个字节将被可用空间字节值覆盖。"
        }
    },
    eraserange: {
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
    freespace: {
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
    include: {
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
    org: {
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
    put: {
        redirect: "raw"
    },
    raw: {
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
            description: "这个例子将输出两个字节、一个字、一个双字和一个指针。指针将受到 autobank 系统的影响，但双字不会。"
        }
    },
    seek: {
        redirect: "org"
    },
    stop: {
        redirect: "break"
    },
    remove: {
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
    removeall: {
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
    removemart: {
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
    removemove: {
        description: {
            zh: `删除在指定偏移量处找到的移动数据。`
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
            description: "0x1E80DF 处的移动数据将被删除。"
        }
    },
    removestring: {
        description: {
            zh: `删除在指定偏移量处找到的文本数据。`
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
            value: "#removestring 0x1D73A6",
            description: "0x1D73A6 处的文本数据将被删除。"
        }
    },
    reserve: {
        description: {
            zh: `在脚本中使用 nop1 填充以保留指定长度的字节。`
        },
        params: [
            {
                name: "length",
                type: "number"
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
    unalias: {
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
    unaliasall: {
        description: {
            zh: `删除所有别名。`
        },
        hoisting: true,
        example: {
            value: "#unaliasall"
        }
    },
    undefine: {
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
    undefineall: {
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

export const commands: CommandData = {
    if: {
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
                description: "Command Type"
            },
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to go to"
            }
        ]
    },
    nop: {
        value: 0x00,
        description: {
            en: `Does absolutely nothing.`,
            zh: `什么都不做。`
        },
        bytes: 1
    },
    nop1: {
        value: 0x01,
        description: {
            en: `Does absolutely nothing.`,
            zh: `什么都不做。`
        },
        bytes: 1
    },
    end: {
        value: 0x02,
        description: {
            en: `Ends the execution of the script.`,
            zh: `结束脚本的执行。`
        },
        bytes: 1,
        ending: true
    },
    return: {
        value: 0x03,
        description: {
            en: `Pops back to the last calling command used.`,
            zh: `
            \n返回上次执行 call 指令的位置继续执行脚本。
            \n如果找不到上次执行的 call 指令，则相当于 end。`
        },
        bytes: 1,
        ending: true
    },
    call: {
        value: 0x04,
        description: {
            en: `Continues script execution from another point. Can be returned to.`,
            zh: `
            \n跳转到另一个地址执行脚本。可以被 return 命令返回。
            \n当一段脚本里 call 指令的执行超过 20 次后，再次执行则相当于 goto。`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to continue from"
            }
        ]
    },
    goto: {
        value: 0x05,
        description: {
            en: `Continues script execution from another point.`,
            zh: `跳转到另一个地址执行脚本。不能被 return 命令返回。`
        },
        bytes: 5,
        ending: true,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to continue from"
            }
        ]
    },
    if1: {
        value: 0x06,
        description: {
            en: `If the last comparison returned a certain value, jumps to another script.`,
            zh: `
            \n如果最后一次比较的结果符合条件，则使用 goto 跳转到另一个地址执行脚本。
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
                name: "offset",
                type: "pointer",
                description: "Pointer to go to"
            }
        ]
    },
    if2: {
        value: 0x07,
        description: {
            en: `Calling version of the if command.`,
            zh: `
            \n如果最后一次比较的结果符合条件，则使用 call 跳转到另一个地址执行脚本。
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
                name: "offset",
                type: "pointer",
                description: "Pointer to go to"
            }
        ]
    },
    gotostd: {
        value: 0x08,
        description: {
            en: `Jumps to a built-in function.`,
            zh: `使用 goto 跳转到内置脚本函数。`
        },
        bytes: 2,
        ending: true,
        params: [
            {
                name: "function",
                type: "byte",
                description: "Function # to jump to"
            }
        ]
    },
    callstd: {
        value: 0x09,
        description: {
            en: `Calls a built-in function.`,
            zh: `使用 call 跳转到内置脚本函数。`
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
    gotostdif: {
        value: 0x0A,
        description: {
            en: `Jumps to a built-in function, conditional version.`,
            zh: `如果最后一次比较的结果符合条件，则使用 goto 跳转到内置脚本函数。`
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
        ]
    },
    callstdif: {
        value: 0x0B,
        description: {
            en: `Calls a built-in function, conditional version.`,
            zh: `如果最后一次比较的结果符合条件，则使用 call 跳转到内置脚本函数。`
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
    jumpram: {
        value: 0x0C,
        description: {
            en: `Jumps to a default RAM location, executing the script stored there.`,
            zh: `
            \n读取默认 RAM 地址记录的脚本地址并执行。
            \n绿宝石为 0x020375C0，火红为 0x020370A4。`
        },
        bytes: 1
    },
    killscript: {
        value: 0x0D,
        description: {
            en: `Kills the script and resets the script RAM.`,
            zh: `停止脚本的执行，并清除脚本 RAM 的记录。`
        },
        bytes: 1,
        ending: true
    },
    setbyte: {
        value: 0x0E,
        description: {
            en: `Sets a predefined address to the specified byte value.`,
            zh: `向预设的 RAM 地址写入指定的字节值。`
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
    loadpointer: {
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
                name: "offset",
                type: "pointer",
                description: "Pointer to load into memory"
            }
        ]
    },
    setbyte2: {
        value: 0x10,
        description: {
            en: `Sets a memory bank to the specified byte value.`,
            zh: `向指定脚本缓存库写入指定的字节值。`
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
    writebytetooffset: {
        value: 0x11,
        description: {
            en: `Sets the byte at the spedified offset to a certain value.`,
            zh: `向指定 RAM 地址写入指定的字节值。`
        },
        bytes: 6,
        params: [
            {
                name: "value",
                type: "byte",
                description: "Byte value to write"
            },
            {
                name: "offset",
                type: "pointer",
                description: "Location to write it to"
            }
        ]
    },
    loadbytefrompointer: {
        value: 0x12,
        description: {
            en: `Loads the byte found at a pointer into the script RAM so other commands can use it.`,
            zh: `将在指针处找到的字节值加载到脚本缓存库中，以便其他命令可以使用它。`
        },
        bytes: 6,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Memory bank to use"
            },
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to byte to load into memory"
            }
        ]
    },
    setfarbyte: {
        value: 0x13,
        description: {
            en: `Sets the byte into a specified pointer.`,
            zh: `将指定脚本缓存库中的字节值写入指定的 RAM 地址中。`
        },
        bytes: 6,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Memory bank to use"
            },
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to write byte to"
            }
        ]
    },
    copyscriptbanks: {
        value: 0x14,
        description: {
            en: `Copies one script bank to another.`,
            zh: `将源脚本缓存库的数据复制目标脚本缓存库中。`
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
    copybyte: {
        value: 0x15,
        description: {
            en: `Copies a byte value from one place to another.`,
            zh: `将源地址上的字节值复制到目标地址上。`
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
    setvar: {
        value: 0x16,
        description: {
            en: `Sets variable A to any value.`,
            zh: `将变量 A 设置为指定值。`
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
    addvar: {
        value: 0x17,
        description: {
            en: `Adds any value to variable A.`,
            zh: `将指定值添加到变量 A。`
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
    subvar: {
        value: 0x18,
        description: {
            en: `Subtracts any value from variable A.`,
            zh: `从变量 A 中减去指定值。`
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
    copyvar: {
        value: 0x19,
        description: {
            en: `Copies variable B to A.`,
            zh: `将变量 B 的值复制到 A。`
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
    copyvarifnotzero: {
        value: 0x1A,
        description: {
            en: `Sets variable B to A, but only if B is higher than zero.`,
            zh: `将变量 B 的值复制到 A，当且仅当 B 的值大于 0。`
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
    comparebanks: {
        value: 0x1B,
        description: {
            en: `Compares two banks.`,
            zh: `比较两个脚本缓存库的值。`
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
    comparebanktobyte: {
        value: 0x1C,
        description: {
            en: `Compares a variable stored in a buffer to a byte value.`,
            zh: `将 <指定字节值> 与 <指定脚本缓存库的数据的低位字节值> 进行比较。`
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
    comparebanktofarbyte: {
        value: 0x1D,
        description: {
            en: `Compares a bank with a byte at some location.`,
            zh: `将 <指定脚本缓存库的数据的低位字节值> 与 <指定地址上的字节值> 进行比较。`
        },
        bytes: 6,
        params: [
            {
                name: "bank",
                type: "byte",
                description: "Bank #"
            },
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to a byte value to compare variable to"
            }
        ]
    },
    comparefarbytetobank: {
        value: 0x1E,
        description: {
            en: `Compares a byte at some location to a buffered variable. The reverse of comparevartofarbyte.`,
            zh: `将 <指定地址上的字节值> 与 <指定脚本缓存库的数据的低位字节值> 进行比较。与 comparebanktofarbyte 相反。`
        },
        bytes: 6,
        params: [
            {
                name: "offset",
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
    comparefarbytetobyte: {
        value: 0x1F,
        description: {
            en: `Compares a byte at some location to a byte value.`,
            zh: `将 <指定地址上的字节值> 与 <指定字节值> 进行比较。`
        },
        bytes: 6,
        params: [
            {
                name: "offset",
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
    comparefarbytes: {
        value: 0x20,
        description: {
            en: `Compares a byte at some location to a byte at another location.`,
            zh: `比较两个地址上的字节值。`
        },
        bytes: 9,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to a byte value to compare with"
            },
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to a byte value to compare with"
            }
        ]
    },
    compare: {
        value: 0x21,
        description: {
            en: `Compares variable A to a value.`,
            zh: `将变量 A 与指定值进行比较。`
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
    comparevars: {
        value: 0x22,
        description: {
            en: `Compares two variables.`,
            zh: `比较两个变量的值。`
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
    callasm: {
        value: 0x23,
        description: {
            en: `Calls a custom ASM routine.`,
            zh: `调用自定义 ASM 程序。`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Address of custom ASM routine"
            }
        ]
    },
    cmd24: {
        value: 0x24,
        description: {
            en: `This command is currently under investigation, No detailed information is available at this time.`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "???"
            }
        ]
    },
    special: {
        value: 0x25,
        description: {
            en: `Calls a special event.`,
            zh: `调用特殊 ASM 函数。`
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
    special2: {
        value: 0x26,
        description: {
            en: `Like special, but can store a returned value.`,
            zh: `调用特殊 ASM 函数，并将返回值存储到指定变量中。`
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
    waitstate: {
        value: 0x27,
        description: {
            en: `Sets the script to a wait state, useful for some specials and commands.`,
            zh: `将脚本设置为等待状态，等待前面的指令完成。`
        },
        bytes: 1
    },
    pause: {
        value: 0x28,
        description: {
            en: `Pauses script execution for a short amount of time.`,
            zh: `将脚本的执行暂停一段时间。`
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
    setflag: {
        value: 0x29,
        description: {
            en: `Sets a flag for later use.`,
            zh: `设置 flag 为存在状态。`
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
    clearflag: {
        value: 0x2A,
        description: {
            en: `Clears the value of a flag.`,
            zh: `清除 flag 的存在状态。`
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
    checkflag: {
        value: 0x2B,
        description: {
            en: `Checks the value of a flag.`,
            zh: `检查 flag 是否存在，并将结果存储到 LASTRESULT 中。`
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
    cmd2c: {
        value: 0x2C,
        description: {
            en: `This command is currently under investigation, No detailed information is available at this time.`
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
    checkdailyflags: {
        value: 0x2D,
        description: {
            en: `Checks the daily flags to see if any of them have been set already. but only if they were set previously, Then it dears those fags. R / S / E only.`,
            zh: `检查每日 flag。仅限宝石。`
        },
        bytes: 1
    },
    resetvars: {
        value: 0x2E,
        description: {
            en: `Resets the value of variables 0x8000, 0x8001 and 0x8002.`,
            zh: `重置变量 0x8000, 0x8001 和 0x8002 的值。`
        },
        bytes: 1
    },
    sound: {
        value: 0x2F,
        description: {
            en: `Plays a sound.`,
            zh: `播放提示音。`
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
    checksound: {
        value: 0x30,
        description: {
            en: `Checks if a sound, a fanfare or a song is currently being played.`,
            zh: `检查当前是否正在播放提示音或背景音乐。`
        },
        bytes: 1
    },
    fanfare: {
        value: 0x31,
        description: {
            en: `Plays a Sappy song as a fanfare.`,
            zh: `将背景音乐放大。`
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
    waitfanfare: {
        value: 0x32,
        description: {
            en: `Waits for fanfare to finish.`,
            zh: `等待背景音乐放大完成。`
        },
        bytes: 1
    },
    playsong: {
        value: 0x33,
        description: {
            en: `Switches to another Sappy song.`,
            zh: `播放背景音乐。`
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
    playsong2: {
        value: 0x34,
        description: {
            en: `Switches to another Sappy song.`,
            zh: `记录背景音乐。`
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
    fadedefault: {
        value: 0x35,
        description: {
            en: `Gently fades the current music back to the map's default song.`,
            zh: `从当前背景音乐淡出，淡入至地图默认的背景音乐。`
        },
        bytes: 1
    },
    fadesong: {
        value: 0x36,
        description: {
            en: `Gently fades into another Sappy song.`,
            zh: `从地图默认的背景音乐淡出，淡入至指定背景音乐。`
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
    fadeout: {
        value: 0x37,
        description: {
            en: `Fades out the currently playing Sappy song.`,
            zh: `从当前背景音乐淡出。`
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
    fadein: {
        value: 0x38,
        description: {
            en: `Fades the currently playing Sappy song back in.`,
            zh: `重新淡入当前背景音乐。`
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
    warp: {
        value: 0x39,
        description: {
            en: `Warps the player to another map.`,
            zh: `
            \n将玩家传送到指定地点。
            \n出口编号设置为 0xFF 时，设置的 X / Y 坐标才会生效。`
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
    warpmuted: {
        value: 0x3A,
        description: {
            en: `Warps the player to another map. No sound effect.`,
            zh: `将玩家传送到指定地点，但不会播放提示音。`
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
    warpwalk: {
        value: 0x3B,
        description: {
            en: `Warps the player to another map. Walking effect.`,
            zh: `
            \n将玩家传送到指定地点，会先向上走一步。
            \n如果上方有门，会触发开门动画。`
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
    warphole: {
        value: 0x3C,
        description: {
            en: `Warps the player to another map. Hole effect.`,
            zh: `
            \n将玩家传送到指定地点，有从上往下坠落的效果。
            \n坐标等于传送前的坐标，如果传送前后的两张地图宽高不一致，可能会引发 BUG。`
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
    warpteleport: {
        value: 0x3D,
        description: {
            en: `Warps the player to another map. Teleport effect.`,
            zh: `将玩家传送到指定地点，有上下传送并旋转的效果。`
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
    warp3: {
        value: 0x3E,
        description: {
            en: `Warps the player to another map.`,
            zh: `设置待传送地点供以后使用。`
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
    setwarpplace: {
        value: 0x3F,
        description: {
            en: `Sets the place a warp that lead to warp 127 of map 127.127 warps the player.`,
            zh: `设置动态的待传送地点供以后使用。`
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
    warp4: {
        value: 0x40,
        description: {
            en: `Warps the player to another map.`,
            zh: `设置潜水的待传送地点供以后使用。`
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
    warp5: {
        value: 0x41,
        description: {
            en: `Warps the player to another map.`,
            zh: `设置掉落的待传送地点供以后使用。`
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
    getplayerpos: {
        value: 0x42,
        description: {
            en: `Gets current position of the player on the map and stores it on specified variables.`,
            zh: `获取玩家坐标，并将结果存储在指定的变量中。`
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
    countpokemon: {
        value: 0x43,
        description: {
            en: `Counts the number of Pokémon in your party and stores the result in LASTRESULT.`,
            zh: `统计队伍中宝可梦的数量，并将结果存储在 LASTRESULT 中。`
        },
        bytes: 1
    },
    additem: {
        value: 0x44,
        description: {
            en: `Adds the quantity of the specified item.`,
            zh: `
            \n向玩家背包添加一定数量的道具。
            \n如果添加成功，则将 LASTRESULT 设置为 0x1，否则设置为 0x0。`
        },
        bytes: 5,
        params: [
            {
                name: "item",
                type: "word",
                description: "Item # to add"
            },
            {
                name: "quantity",
                type: "word",
                description: "Quantity"
            }
        ]
    },
    removeitem: {
        value: 0x45,
        description: {
            en: `Removes the quantity of the specified item.`,
            zh: `
            \n删除玩家背包里一定数量的道具。
            \n如果删除成功，则将 LASTRESULT 设置为 0x1，否则设置为 0x0。`
        },
        bytes: 5,
        params: [
            {
                name: "item",
                type: "word",
                description: "Item # to remove"
            },
            {
                name: "quantity",
                type: "word",
                description: "Quantity"
            }
        ]
    },
    checkitemroom: {
        value: 0x46,
        description: {
            en: `Checks if the player has enough room in the bag for the specified item.`,
            zh: `
            \n检查玩家的背包是否有足够的空间放置一定数量的道具。
            \n如果有，则将 LASTRESULT 设置为 0x1，否则设置为 0x0。`
        },
        bytes: 5,
        params: [
            {
                name: "item",
                type: "word",
                description: "Item # to check for"
            },
            {
                name: "quantity",
                type: "word",
                description: "Quantity"
            }
        ]
    },
    checkitem: {
        value: 0x47,
        description: {
            en: `Checks if the player is carrying the specified item.`,
            zh: `
            \n检查玩家是否携带一定数量的道具。
            \n如果有，则将 LASTRESULT 设置为 0x1，否则设置为 0x0。`
        },
        bytes: 5,
        params: [
            {
                name: "item",
                type: "word",
                description: "Item # to check for"
            },
            {
                name: "quantity",
                type: "word",
                description: "Quantity"
            }
        ]
    },
    checkitemtype: {
        value: 0x48,
        description: {
            en: `Checks the item type for the specified item and store the result in LASTRESULT.`,
            zh: `检查指定道具的所属类别，并将结果存储在 LASTRESULT 中。`
        },
        bytes: 3,
        params: [
            {
                name: "item",
                type: "word",
                description: "Item # to check for"
            }
        ]
    },
    addpcitem: {
        value: 0x49,
        description: {
            en: `Adds the quantity of the specified item to player's PC.`,
            zh: `
            \n向玩家的电脑中添加一定数量的道具。
            \n如果添加成功，则将 LASTRESULT 设置为 0x1，否则设置为 0x0。`
        },
        bytes: 5,
        params: [
            {
                name: "item",
                type: "word",
                description: "Item # to add"
            },
            {
                name: "quantity",
                type: "word",
                description: "Quantity"
            }
        ]
    },
    checkpcitem: {
        value: 0x4A,
        description: {
            en: `Checks if the player has the specified item on his/her PC.`,
            zh: `
            \n检查玩家的电脑中是否存有一定数量的道具。
            \n如果有，则将 LASTRESULT 设置为 0x1，否则设置为 0x0。`
        },
        bytes: 5,
        params: [
            {
                name: "item",
                type: "word",
                description: "Item # to check for"
            },
            {
                name: "quantity",
                type: "word",
                description: "Quantity"
            }
        ]
    },
    adddecoration: {
        value: 0x4B,
        description: {
            en: `Adds a decoration to player's PC.`,
            zh: `
            \n向玩家的电脑中添加装饰。仅限宝石。
            \n如果添加成功，则将 LASTRESULT 设置为 0x1，否则设置为 0x0。`
        },
        bytes: 3,
        params: [
            {
                name: "decoration",
                type: "word",
                description: "Decoration #"
            }
        ]
    },
    removedecoration: {
        value: 0x4C,
        description: {
            en: `Removes a decoration from player's PC.`,
            zh: `
            \n从玩家的电脑中删除装饰。
            \n如果删除成功，则将 LASTRESULT 设置为 0x1，否则设置为 0x0。`
        },
        bytes: 3,
        params: [
            {
                name: "decoration",
                type: "word",
                description: "Decoration #"
            }
        ]
    },
    testdecoration: {
        value: 0x4D,
        description: {
            en: `Tests a specific decoration to see if there's enough room to store it.`,
            zh: `
            \n检查玩家的电脑是否有足够的空间存放指定的装饰。
            \n如果有，则将 LASTRESULT 设置为 0x1，否则设置为 0x0。`
        },
        bytes: 3,
        params: [
            {
                name: "decoration",
                type: "word",
                description: "Decoration #"
            }
        ]
    },
    checkdecoration: {
        value: 0x4E,
        description: {
            en: `Checks if a specific decoration is present in player's PC.`,
            zh: `
            \n检查玩家的电脑中是否存有指定的装饰。
            \n如果有，则将 LASTRESULT 设置为 0x1，否则设置为 0x0。`
        },
        bytes: 3,
        params: [
            {
                name: "decoration",
                type: "word",
                description: "Decoration #"
            }
        ]
    },
    applymovement: {
        value: 0x4F,
        description: {
            en: `Applies the movement data found at the specified pointer to a sprite.`,
            zh: `读取指定地址上的移动数据，应用于屏幕或当前地图上的人物。`
        },
        bytes: 7,
        params: [
            {
                name: "people",
                type: "word",
                description: "People # to use"
            },
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to the movement data"
            }
        ]
    },
    applymovementpos: {
        value: 0x50,
        description: {
            en: `Applies the movement data found at the specified pointer to a sprite. Then set the specified X/Y coordinates.`,
            zh: `读取指定地址上的移动数据，应用于屏幕或指定地图上的人物。`
        },
        bytes: 7,
        params: [
            {
                name: "people",
                type: "word",
                description: "People # to use"
            },
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to the movement data"
            },
            {
                name: "bank",
                type: "byte",
                description: "Bank #"
            },
            {
                name: "map",
                type: "byte",
                description: "Map #"
            }
        ]
    },
    waitmovement: {
        value: 0x51,
        description: {
            en: `Waits for applymovement to finish.`,
            zh: `等待 applymovement 指令完成。`
        },
        bytes: 3,
        params: [
            {
                name: "people",
                type: "word",
                description: "People # to wait for"
            }
        ]
    },
    waitmovementpos: {
        value: 0x52,
        description: {
            en: `Waits for applymovement to finish. Then set the specified X/Y coordinates.`,
            zh: `等待 applymovementpos 指令完成。`
        },
        bytes: 5,
        params: [
            {
                name: "people",
                type: "word",
                description: "People # to wait for"
            },
            {
                name: "bank",
                type: "byte",
                description: "Bank #"
            },
            {
                name: "map",
                type: "byte",
                description: "Map #"
            }
        ]
    },
    hidesprite: {
        value: 0x53,
        description: {
            en: `Hides a sprite.`,
            zh: `隐藏当前地图内的人物。`
        },
        bytes: 3,
        params: [
            {
                name: "people",
                type: "word",
                description: "People # to hide"
            }
        ]
    },
    hidespritepos: {
        value: 0x54,
        description: {
            en: `Hides a sprite, then set the specified X/Y coordinates.`,
            zh: `隐藏指定地图内的人物。`
        },
        bytes: 5,
        params: [
            {
                name: "people",
                type: "word",
                description: "People # to hide"
            },
            {
                name: "bank",
                type: "byte",
                description: "Bank #"
            },
            {
                name: "map",
                type: "byte",
                description: "Map #"
            }
        ]
    },
    showsprite: {
        value: 0x55,
        description: {
            en: `Shows a previously vanished sprite.`,
            zh: `在当前地图内显示一个隐藏的人物。`
        },
        bytes: 3,
        params: [
            {
                name: "people",
                type: "word",
                description: "People # to show"
            }
        ]
    },
    showspritepos: {
        value: 0x56,
        description: {
            en: `Shows a previously vanished sprite. Then set the specified X/Y coordinates.`,
            zh: `在指定地图内显示一个隐藏的人物。`
        },
        bytes: 5,
        params: [
            {
                name: "people",
                type: "word",
                description: "People # to show"
            },
            {
                name: "bank",
                type: "byte",
                description: "Bank #"
            },
            {
                name: "map",
                type: "byte",
                description: "Map #"
            }
        ]
    },
    movesprite: {
        value: 0x57,
        description: {
            en: `Moves a sprite to the specified location.`,
            zh: `将人物移动到指定位置。`
        },
        bytes: 7,
        params: [
            {
                name: "people",
                type: "word",
                description: "People # to move"
            },
            {
                name: "X",
                type: "word",
                description: "X coordinate to move to"
            },
            {
                name: "Y",
                type: "word",
                description: "Y coordinate to move to"
            }
        ]
    },
    spritevisible: {
        value: 0x58,
        description: {
            en: `Makes the sprite visible at selected bank and map.`,
            zh: `使人物在指定地图上可见。`
        },
        bytes: 5,
        params: [
            {
                name: "people",
                type: "word",
                description: "People #"
            },
            {
                name: "bank",
                type: "byte",
                description: "Bank #"
            },
            {
                name: "map",
                type: "byte",
                description: "Map #"
            }
        ]
    },
    spriteinvisible: {
        value: 0x59,
        description: {
            en: `Makes the sprite invisible at selected bank and map.`,
            zh: `使人物在指定地图上不可见。`
        },
        bytes: 5,
        params: [
            {
                name: "people",
                type: "word",
                description: "People #"
            },
            {
                name: "bank",
                type: "byte",
                description: "Bank #"
            },
            {
                name: "map",
                type: "byte",
                description: "Map #"
            }
        ]
    },
    faceplayer: {
        value: 0x5A,
        description: {
            en: `Turns the caller towards the player.`,
            zh: `使正在对话的人物面向玩家。`
        },
        bytes: 1
    },
    spriteface: {
        value: 0x5B,
        description: {
            en: `Changes a facing of a sprite.`,
            zh: `使人物面向指定方向。`
        },
        bytes: 4,
        params: [
            {
                name: "people",
                type: "word",
                description: "People #"
            },
            {
                name: "facing",
                type: "byte",
                description: "Facing"
            }
        ]
    },
    trainerbattle: {
        value: 0x5C,
        description: {
            en: `Starts a trainer battle. Depending on the kind of battle, last parameters may differ.`,
            zh: `
            \n进入训练师对战。
            \n如果训练师被击败，则将训练师 flag 设置为存在；
            \n当训练师 flag 存在时，指令不生效。`
        },
        bytes: 14,
        params: [
            {
                name: "kind",
                type: "byte",
                description: "Kind of battle"
            },
            {
                name: "trainer",
                type: "word",
                description: "Trainer # to battle"
            },
            {
                name: "reserved",
                type: "word",
                description: "Reserved"
            },
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to the challenge text"
            },
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to the defeat text",
                when: (params) => params[0] !== 0x3
            },
            {
                name: "offset",
                type: "pointer",
                description: "Pointer",
                when: (params) => [0x1, 0x2, 0x4, 0x6, 0x8].includes(params[0])
            },
            {
                name: "offset",
                type: "pointer",
                description: "Pointer",
                when: (params) => [0x6, 0x8].includes(params[0])
            }
        ]
    },
    repeattrainerbattle: {
        value: 0x5D,
        description: {
            en: `Repeats the last trainer battle started.`,
            zh: `重复上一次进入的训练师对战。`
        },
        bytes: 1
    },
    endtrainerbattle: {
        value: 0x5E,
        description: {
            en: `Returns from the trainer battle screen without starting message.`,
            zh: `执行最后一次战斗的训练师的对话脚本。`
        },
        bytes: 1
    },
    endtrainerbattle2: {
        value: 0x5F,
        description: {
            en: `Returns from the trainer battle screen without ending message.`,
            zh: `执行最后一次战斗的训练师的把训练师加入领航员的脚本。`
        },
        bytes: 1
    },
    checktrainerflag: {
        value: 0x60,
        description: {
            en: `Checks if the specified trainer flag is already activated and store the result in LASTRESULT.`,
            zh: `检查指定的训练师 flag 是否存在，并将结果存储在 LASTRESULT 中。`
        },
        bytes: 3,
        params: [
            {
                name: "trainer",
                type: "word",
                description: "Trainer # to check"
            }
        ]
    },
    cleartrainerflag: {
        value: 0x61,
        description: {
            en: `Deactivates the specified trainer flag.`,
            zh: `清除指定训练师 flag 的存在状态。`
        },
        bytes: 3,
        params: [
            {
                name: "trainer",
                type: "word",
                description: "Trainer # to disable"
            }
        ]
    },
    settrainerflag: {
        value: 0x62,
        description: {
            en: `Activates the specified trainer flag.`,
            zh: `设置指定的训练师 flag 为存在状态。`
        },
        bytes: 3,
        params: [
            {
                name: "trainer",
                type: "word",
                description: "Trainer # to enable"
            }
        ]
    },
    movesprite2: {
        value: 0x63,
        description: {
            en: `Moves a sprite to the specified location. Permanent change.`,
            zh: `将人物移动到指定位置。永久性更改。`
        },
        bytes: 7,
        params: [
            {
                name: "people",
                type: "word",
                description: "People # to move"
            },
            {
                name: "X",
                type: "word",
                description: "X coordinate to move to"
            },
            {
                name: "Y",
                type: "word",
                description: "Y coordinate to move to"
            }
        ]
    },
    moveoffscreen: {
        value: 0x64,
        description: {
            en: `Changes the location of the specified sprite to a value which is exactly one tile above the top left corner of the screen.`,
            zh: `将人物移动到人物原始的位置。`
        },
        bytes: 3,
        params: [
            {
                name: "people",
                type: "word",
                description: "People # to move"
            }
        ]
    },
    spritebehave: {
        value: 0x65,
        description: {
            en: `Changes the behaviour of a sprite.`,
            zh: `更改人物的移动类型。`
        },
        bytes: 4,
        params: [
            {
                name: "people",
                type: "word",
                description: "People # to move"
            },
            {
                name: "behaviour",
                type: "byte",
                description: "Behaviour #"
            }
        ]
    },
    waitmsg: {
        value: 0x66,
        description: {
            en: `Waits for preparemsg to finish.`,
            zh: `等待 preparemsg 指令完成。`
        },
        bytes: 1
    },
    preparemsg: {
        value: 0x67,
        description: {
            en: `Prepares a pointer dialogue text for being displayed.`,
            zh: `显示一个普通对话框，对话框的文字可以来自文本地址或者脚本缓存库。`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to text"
            }
        ]
    },
    closeonkeypress: {
        value: 0x68,
        description: {
            en: `Holds a msgbox open and closes it on keypress.`,
            zh: `当玩家按下按键时，关闭显示的对话框。`
        },
        bytes: 1
    },
    lockall: {
        value: 0x69,
        description: {
            en: `Locks down movement for all the people on the screen.`,
            zh: `锁定屏幕上所有人物的移动。`
        },
        bytes: 1
    },
    lock: {
        value: 0x6A,
        description: {
            en: `Locks down movement for the caller.`,
            zh: `锁定正在对话的人物的移动。`
        },
        bytes: 1
    },
    releaseall: {
        value: 0x6B,
        description: {
            en: `Resumes normal movement for all the people on the screen. Closes any previously opened msgboxes as well.`,
            zh: `恢复屏幕上所有人物的正常移动。关闭之前打开的所有对话框。`
        },
        bytes: 1
    },
    release: {
        value: 0x6C,
        description: {
            en: `Resumes normal movement for the caller. Closes any previously opened msgboxes as well.`,
            zh: `恢复正在对话的人物的正常移动。关闭之前打开的所有对话框。`
        },
        bytes: 1
    },
    waitkeypress: {
        value: 0x6D,
        description: {
            en: `Waits until a key is pressed.`,
            zh: `等待任意按键的按下。`
        },
        bytes: 1
    },
    yesnobox: {
        value: 0x6E,
        description: {
            en: `Displays a Yes / No box at specified coordinates.`,
            zh: `
            在指定位置显示 "是 / 否" 判断框。
            \n如果选择 "是"，则将 LASTRESULT 设置为 0x1，否则设置为 0x0。`
        },
        bytes: 3,
        params: [
            {
                name: "left",
                type: "byte",
                description: "Left position"
            },
            {
                name: "top",
                type: "byte",
                description: "Top position"
            }
        ]
    },
    multichoice: {
        value: 0x6F,
        description: {
            en: `Puts up a list of choices for the player to make.`,
            zh: `在指定位置显示多选框，并将选择结果存储到 LASTRESULT 中。`
        },
        bytes: 5,
        params: [
            {
                name: "left",
                type: "byte",
                description: "Left position"
            },
            {
                name: "top",
                type: "byte",
                description: "Top position"
            },
            {
                name: "list",
                type: "byte",
                description: "Choice list # to use"
            },
            {
                name: "cancancel",
                type: "byte",
                description: "Determines if the B button can be used to cancel"
            }
        ]
    },
    multichoice2: {
        value: 0x70,
        description: {
            en: `Puts up a list of choices for the player to make. A default choice can be set.`,
            zh: `在指定位置显示多选框，并将选择结果存储到 LASTRESULT 中。可以设置默认选项。`
        },
        bytes: 6,
        params: [
            {
                name: "left",
                type: "byte",
                description: "Left position"
            },
            {
                name: "top",
                type: "byte",
                description: "Top position"
            },
            {
                name: "list",
                type: "byte",
                description: "Choice list # to use"
            },
            {
                name: "default",
                type: "byte",
                description: "Default selected choice"
            },
            {
                name: "cancancel",
                type: "byte",
                description: "Determines if the B button can be used to cancel"
            }
        ]
    },
    multichoice3: {
        value: 0x71,
        description: {
            en: `Puts up a list of choices for the player to make. The number of choices per row can be set.`,
            zh: `在指定位置显示多选框，并将选择结果存储到 LASTRESULT 中。可以设置每行的选项数。`
        },
        bytes: 6,
        params: [
            {
                name: "left",
                type: "byte",
                description: "Left position"
            },
            {
                name: "top",
                type: "byte",
                description: "Top position"
            },
            {
                name: "list",
                type: "byte",
                description: "Choice list # to use"
            },
            {
                name: "number",
                type: "byte",
                description: "Number of choices pre row"
            },
            {
                name: "cancancel",
                type: "byte",
                description: "Determines if the B button can be used to cancel"
            }
        ]
    },
    showbox: {
        value: 0x72,
        description: {
            en: `Displays a box with the given dimensions.`,
            zh: `显示具有给定尺寸的框。`
        },
        bytes: 5,
        params: [
            {
                name: "left",
                type: "byte",
                description: "Left position"
            },
            {
                name: "top",
                type: "byte",
                description: "Top position"
            },
            {
                name: "width",
                type: "byte",
                description: "Width"
            },
            {
                name: "height",
                type: "byte",
                description: "Height"
            }
        ]
    },
    hidebox: {
        value: 0x73,
        description: {
            en: `Hides a displayed box. Ruby / Sapphire only.`,
            zh: `隐藏显示的框。仅限红蓝宝石。`
        },
        bytes: 5,
        params: [
            {
                name: "left",
                type: "byte",
                description: "Left position"
            },
            {
                name: "top",
                type: "byte",
                description: "Top position"
            },
            {
                name: "width",
                type: "byte",
                description: "Width"
            },
            {
                name: "height",
                type: "byte",
                description: "Height"
            }
        ]
    },
    clearbox: {
        value: 0x74,
        description: {
            en: `Clears a part of a custom box.`,
            zh: `清除自定义框的一部分。`
        },
        bytes: 5,
        params: [
            {
                name: "left",
                type: "byte",
                description: "Left position"
            },
            {
                name: "top",
                type: "byte",
                description: "Top position"
            },
            {
                name: "width",
                type: "byte",
                description: "Width"
            },
            {
                name: "height",
                type: "byte",
                description: "Height"
            }
        ]
    },
    showpokepic: {
        value: 0x75,
        description: {
            en: `Displays a Pokémon in a picture box.`,
            zh: `显示宝可梦图片框。`
        },
        bytes: 5,
        params: [
            {
                name: "pokemon",
                type: "word",
                description: "Pokémon # to display"
            },
            {
                name: "left",
                type: "byte",
                description: "Left position"
            },
            {
                name: "top",
                type: "byte",
                description: "Top position"
            }
        ]
    },
    hidepokepic: {
        value: 0x76,
        description: {
            en: `Hides a Pokémon picture box previously showed.`,
            zh: `隐藏上次显示的宝可梦图片框。`
        },
        bytes: 1
    },
    showcontestwinner: {
        value: 0x77,
        description: {
            en: `Shows the picture of the winner of set contest.`,
            zh: `显示华丽大赛获胜者的照片。仅限宝石。`
        },
        bytes: 2,
        params: [
            {
                name: "contest",
                type: "byte",
                description: "Contest #"
            }
        ]
    },
    braille: {
        value: 0x78,
        description: {
            en: `Displays a braille box.`,
            zh: `显示盲文对话框。`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to braille data"
            }
        ]
    },
    givepokemon: {
        value: 0x79,
        description: {
            en: `Gives the player a Pokémon.`,
            zh: `
            \n给予玩家一只拥有指定等级和携带道具的宝可梦。
            \n如果玩家队伍有空间存放宝可梦，则将 LASTRESULT 设置为 0x0；
            \n如果玩家队伍没有空间而电脑有空间，则将 LASTRESULT 设置为 0x1；
            \n如果玩家队伍和电脑都没有空间，则将 LASTRESULT 设置为 0x2。`
        },
        bytes: 15,
        params: [
            {
                name: "pokemon",
                type: "word",
                description: "Pokémon # to give"
            },
            {
                name: "level",
                type: "byte",
                description: "Level of the Pokémon"
            },
            {
                name: "item",
                type: "word",
                description: "Item # to be held"
            },
            {
                name: "filler",
                type: "dword",
                description: "Filler"
            },
            {
                name: "filler",
                type: "dword",
                description: "Filler"
            },
            {
                name: "filler",
                type: "byte",
                description: "Filler"
            }
        ]
    },
    giveegg: {
        value: 0x7A,
        description: {
            en: `Gives the player an egg of the specified Pokémon.`,
            zh: `
            \n给予玩家一只宝可梦蛋。
            \n如果玩家队伍有空间存放宝可梦蛋，则将 LASTRESULT 设置为 0x0；
            \n如果玩家队伍没有空间而电脑有空间，则将 LASTRESULT 设置为 0x1；
            \n如果玩家队伍和电脑都没有空间，则将 LASTRESULT 设置为 0x2。`
        },
        bytes: 3,
        params: [
            {
                name: "pokemon",
                type: "word",
                description: "Pokémon # to give"
            }
        ]
    },
    setpkmnpp: {
        value: 0x7B,
        description: {
            en: `Sets a new amount of PP for the specified Pokémon in player's party.`,
            zh: `修改玩家队伍中宝可梦的指定技能插槽的技能。`
        },
        bytes: 5,
        params: [
            {
                name: "pokemon",
                type: "byte",
                description: "Pokémon #"
            },
            {
                name: "attack",
                type: "byte",
                description: "Attack slot"
            },
            {
                name: "amount",
                type: "word",
                description: "PP amount"
            }
        ]
    },
    checkattack: {
        value: 0x7C,
        description: {
            en: `Checks if at least one Pokémon in the party has a particular attack.`,
            zh: `检查队伍中是否至少有一只宝可梦拥有指定的技能，并将结果存储到 LASTRESULT 中。`
        },
        bytes: 3,
        params: [
            {
                name: "attack",
                type: "word",
                description: "Attack # to check"
            }
        ]
    },
    bufferpokemon: {
        value: 0x7D,
        description: {
            en: `Stores a Pokémon name within a specified buffer.`,
            zh: `将宝可梦的种族名字存储在指定的文本缓冲区中。`
        },
        bytes: 4,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            },
            {
                name: "pokemon",
                type: "word",
                description: "Pokémon # to store"
            }
        ]
    },
    bufferfirstpokemon: {
        value: 0x7E,
        description: {
            en: `Stores the first Pokémon name in player's party within a specified buffer.`,
            zh: `将玩家队伍中第一只宝可梦的种族名字存储在指定的文本缓冲区中。`
        },
        bytes: 2,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            }
        ]
    },
    bufferpartypokemon: {
        value: 0x7F,
        description: {
            en: `Stores the selected Pokémon name in player's party within a specified buffer.`,
            zh: `将玩家队伍中选定的宝可梦的昵称存储在指定的文本缓冲区中。`
        },
        bytes: 4,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            },
            {
                name: "pokemon",
                type: "word",
                description: "Pokémon # to store"
            }
        ]
    },
    bufferitem: {
        value: 0x80,
        description: {
            en: `Stores an item name within a specified buffer.`,
            zh: `将道具的名称存储在指定的文本缓冲区中。`
        },
        bytes: 4,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            },
            {
                name: "item",
                type: "word",
                description: "Item # to store"
            }
        ]
    },
    bufferdecoration: {
        value: 0x81,
        description: {
            en: `Stores a decoration name within a specified buffer.`,
            zh: `将装饰的名称存储在指定的文本缓冲区中。`
        },
        bytes: 4,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            },
            {
                name: "decoration",
                type: "word",
                description: "Decoration # to store"
            }
        ]
    },
    bufferattack: {
        value: 0x82,
        description: {
            en: `Stores an attack name within a specified buffer.`,
            zh: `将技能的名称存储在指定的文本缓冲区中。`
        },
        bytes: 4,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            },
            {
                name: "attack",
                type: "word",
                description: "Attack # to store"
            }
        ]
    },
    buffernumber: {
        value: 0x83,
        description: {
            en: `Variable version on buffernumber.`,
            zh: `将数值转换为文本并存储在指定的文本缓冲区中。`
        },
        bytes: 4,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            },
            {
                name: "variable",
                type: "word",
                description: "Variable to store"
            }
        ]
    },
    bufferstd: {
        value: 0x84,
        description: {
            en: `Stores a standard string within a specified buffer.`,
            zh: `将内置文本库中的文本存储在指定的文本缓冲区中。`
        },
        bytes: 4,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            },
            {
                name: "string",
                type: "word",
                description: "Standard string # to store"
            }
        ]
    },
    bufferstring: {
        value: 0x85,
        description: {
            en: `Stores a string within a specified buffer.`,
            zh: `将字符串存储在指定的文本缓冲区中。`
        },
        bytes: 6,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            },
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to the string to store"
            }
        ]
    },
    pokemart: {
        value: 0x86,
        description: {
            en: `Opens the Pokémart shop system with the item/price list found at the selected pointer.`,
            zh: `打开交易系统，里面包含在指定的指针处找到的道具价格表。`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to the item list"
            }
        ]
    },
    pokemart2: {
        value: 0x87,
        description: {
            en: `Opens the Pokémart shop system with the item/price list found at the selected pointer.`,
            zh: `打开交易系统，里面包含在指定的指针处找到的装饰品价格表。`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to the item list"
            }
        ]
    },
    pokemart3: {
        value: 0x88,
        description: {
            en: `Opens the Pokémart shop system with the item/price list found at the selected pointer.`,
            zh: `打开商店系统，里面包含在指定的指针处找到的装饰品价格表。`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to the item list"
            }
        ]
    },
    pokecasino: {
        value: 0x89,
        description: {
            en: `Opens the Casino system.`,
            zh: `打开老虎机系统。`
        },
        bytes: 5,
        params: [
            {
                name: "variable",
                type: "word",
                description: "Variable #"
            }
        ]
    },
    cmd8a: {
        value: 0x8A,
        description: {
            en: `Apparently does absolutely nothing.`,
            zh: `种树果。`
        },
        bytes: 4,
        params: [
            {
                name: "tree",
                type: "byte",
                description: "Tree"
            },
            {
                name: "berry",
                type: "byte",
                description: "Berry #"
            },
            {
                name: "stage",
                type: "byte",
                description: "Stage"
            }
        ]
    },
    choosecontestpkmn: {
        value: 0x8B,
        description: {
            en: `Opens up a menu for choosing a contest Pokémon.`,
            zh: `选择精灵参加华丽大赛，并将所选精灵在队伍中的编号存储到变量 0x8004 中。`
        },
        bytes: 1
    },
    startcontest: {
        value: 0x8C,
        description: {
            en: `Starts a Pokémon contest.`,
            zh: `开始华丽大赛。`
        },
        bytes: 1
    },
    showcontestresults: {
        value: 0x8D,
        description: {
            en: `Shows Pokémon contest results.`,
            zh: `显示华丽大赛的结果。`
        },
        bytes: 1
    },
    contestlinktransfer: {
        value: 0x8E,
        description: {
            en: `Establishes a connection using the wireless adapter. Emerald only.`,
            zh: `使用无线适配器建立连接。仅限绿宝石。`
        },
        bytes: 1
    },
    random: {
        value: 0x8F,
        description: {
            en: `Generates a random number storing it into LASTRESULT.`,
            zh: `在从 0 到指定值的范围内生成一个随机数，并将结果存储在 LASTRESULT 中。`
        },
        bytes: 3,
        params: [
            {
                name: "max",
                type: "word",
                description: "Max value"
            }
        ]
    },
    givemoney: {
        value: 0x90,
        description: {
            en: `Gives the player some money.`,
            zh: `给予玩家一定量的钱。`
        },
        bytes: 6,
        params: [
            {
                name: "quantity",
                type: "dword",
                description: "Money quantity to give"
            },
            {
                name: "???",
                type: "byte",
                description: "Command execution check"
            }
        ]
    },
    paymoney: {
        value: 0x91,
        description: {
            en: `Takes some money from the player.`,
            zh: `扣除玩家一定量的钱。`
        },
        bytes: 6,
        params: [
            {
                name: "quantity",
                type: "dword",
                description: "Money quantity to pay"
            },
            {
                name: "???",
                type: "byte",
                description: "Command execution check"
            }
        ]
    },
    checkmoney: {
        value: 0x92,
        description: {
            en: `Checks if the player has a specified amount of money.`,
            zh: `检查玩家是否有足够的钱，并将结果存储到 LASTRESULT 中。`
        },
        bytes: 6,
        params: [
            {
                name: "quantity",
                type: "dword",
                description: "Money quantity to check"
            },
            {
                name: "???",
                type: "byte",
                description: "Command execution check"
            }
        ]
    },
    showmoney: {
        value: 0x93,
        description: {
            en: `Shows the money counter on set coordinates.`,
            zh: `在指定位置显示金钱计数器。`
        },
        bytes: 4,
        params: [
            {
                name: "left",
                type: "byte",
                description: "Left position"
            },
            {
                name: "top",
                type: "byte",
                description: "Top position"
            },
            {
                name: "???",
                type: "byte",
                description: "Command execution check"
            }
        ]
    },
    hidemoney: {
        value: 0x94,
        description: {
            en: `Hides the money counter.`,
            zh: `隐藏金钱计数器。`
        },
        bytes: 3,
        params: [
            {
                name: "left",
                type: "byte",
                description: "Left position"
            },
            {
                name: "top",
                type: "byte",
                description: "Top position"
            }
        ]
    },
    updatemoney: {
        value: 0x95,
        description: {
            en: `Updates the amount of money displayed in the money counter.`,
            zh: `更新金钱计数器中显示的金额。`
        },
        bytes: 4,
        params: [
            {
                name: "left",
                type: "byte",
                description: "Left position"
            },
            {
                name: "top",
                type: "byte",
                description: "Top position"
            },
            {
                name: "???",
                type: "byte",
                description: "Command execution check"
            }
        ]
    },
    cmd96: {
        value: 0x96,
        description: {
            en: `Apparently does absolutely nothing.`,
            zh: `什么都不做。`
        },
        bytes: 3,
        params: [
            {
                name: "???",
                type: "word",
                description: "???"
            }
        ]
    },
    fadescreen: {
        value: 0x97,
        description: {
            en: `Fades the screen in or out.`,
            zh: `执行屏幕渐变效果。`
        },
        bytes: 2,
        params: [
            {
                name: "effect",
                type: "byte",
                description: "Fade effect"
            }
        ]
    },
    fadescreendelay: {
        value: 0x98,
        description: {
            en: `Fades the screen in or out, after some delay.`,
            zh: `执行屏幕渐变效果，并设置渐变速度。`
        },
        bytes: 3,
        params: [
            {
                name: "effect",
                type: "byte",
                description: "Fade effect"
            },
            {
                name: "delay",
                type: "byte",
                description: "Delay"
            }
        ]
    },
    darken: {
        value: 0x99,
        description: {
            en: `Calls flash animation that darkens the area. Must be called from a level script.`,
            zh: `设置视野范围半径，但必须通过打开背包等手段刷新界面才会生效。`
        },
        bytes: 3,
        params: [
            {
                name: "size",
                type: "word",
                description: "Flash size"
            }
        ]
    },
    lighten: {
        value: 0x9A,
        description: {
            en: `Calls flash animation that lightens the area.`,
            zh: `设置闪光技能的视野范围半径，并带有视野范围缩放的动画。`
        },
        bytes: 2,
        params: [
            {
                name: "size",
                type: "byte",
                description: "Flash size"
            }
        ]
    },
    preparemsg2: {
        value: 0x9B,
        description: {
            en: `This command is currently under investigation. No detailed information is available at this time.`,
            zh: `显示一个普通对话框，并带有自动滚动效果。`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to text"
            }
        ]
    },
    doanimation: {
        value: 0x9C,
        description: {
            en: `Executes the specified move animation.`,
            zh: `运行 ROM 里内置的动画。`
        },
        bytes: 3,
        params: [
            {
                name: "animation",
                type: "word",
                description: "Animation #"
            }
        ]
    },
    setanimation: {
        value: 0x9D,
        description: {
            en: `Sets the move animation.`,
            zh: `设置运行 ROM 里内置动画所需的参数。`
        },
        bytes: 4,
        params: [
            {
                name: "animation",
                type: "byte",
                description: "Animation #"
            },
            {
                name: "variable",
                type: "word",
                description: "Variable to use"
            }
        ]
    },
    checkanimation: {
        value: 0x9E,
        description: {
            en: `Checks whether an animation is currently being played or not. If so, it'll pause until the animation is done.`,
            zh: `检查当前是否正在播放动画。如果是，脚本的执行将暂停，直到动画结束。`
        },
        bytes: 3,
        params: [
            {
                name: "animation",
                type: "word",
                description: "Animation #"
            }
        ]
    },
    sethealingplace: {
        value: 0x9F,
        description: {
            en: `Sets the place where the player goes once he/she is out of usable Pokémon.`,
            zh: `设置当玩家没有可用的宝可梦时的复活点。`
        },
        bytes: 3,
        params: [
            {
                name: "flightspot",
                type: "word",
                description: "Flightspot #"
            }
        ]
    },
    checkgender: {
        value: 0xA0,
        description: {
            en: `Checks if the player is a boy or a girl and stores it in LASTRESULT.`,
            zh: `检查玩家的性别，并将结果存储在 LASTRESULT 中。`
        },
        bytes: 1
    },
    cry: {
        value: 0xA1,
        description: {
            en: `Plays back the cry of a Pokémon.`,
            zh: `播放宝可梦的叫声。`
        },
        bytes: 5,
        params: [
            {
                name: "pokemon",
                type: "word",
                description: "Pokémon #"
            },
            {
                name: "effect",
                type: "word",
                description: "Effect #"
            }
        ]
    },
    setmaptile: {
        value: 0xA2,
        description: {
            en: `Sets a tile on the map. You must somehow refresh that part.`,
            zh: `设置指定坐标上的地图块以及运动许可。需要使用 special 刷新地图块。`
        },
        bytes: 9,
        params: [
            {
                name: "X",
                type: "word",
                description: "X coordinate"
            },
            {
                name: "Y",
                type: "word",
                description: "Y coordinate"
            },
            {
                name: "tile",
                type: "word",
                description: "Tile #"
            },
            {
                name: "attribute",
                type: "word",
                description: "Tile attribute"
            }
        ]
    },
    resetweather: {
        value: 0xA3,
        description: {
            en: `Prepares to fade the weather into the default type.`,
            zh: `准备将天气设置为默认类型。`
        },
        bytes: 1
    },
    setweather: {
        value: 0xA4,
        description: {
            en: `Prepares to fade the weather into the type specified.`,
            zh: `准备将天气设置为指定的类型。`
        },
        bytes: 3,
        params: [
            {
                name: "weather",
                type: "word",
                description: "Weather #"
            }
        ]
    },
    doweather: {
        value: 0xA5,
        description: {
            en: `Triggers the weather change set with setweather/resetweather.`,
            zh: `触发 setweather / resetweather 导致的天气变化。`
        },
        bytes: 1
    },
    cmda6: {
        value: 0xA6,
        description: {
            en: `Apparently does absolutely nothing.`,
            zh: `什么都不做。`
        },
        bytes: 2,
        params: [
            {
                name: "???",
                type: "byte",
                description: "???"
            }
        ]
    },
    setmapfooter: {
        value: 0xA7,
        description: {
            en: `Changes the current map footer loading the new one. The map must be refreshed afterwards in order to work fine.`,
            zh: `在当前地图上加载特殊地图，比如绿宝石的幻岛。`
        },
        bytes: 3,
        params: [
            {
                name: "footer",
                type: "word",
                description: "Footer #"
            }
        ]
    },
    spritelevelup: {
        value: 0xA8,
        description: {
            en: `Makes the specified sprite go up one level at selected bank and map.`,
            zh: `使指定地图上的人物的优先级上升一个级别。`
        },
        bytes: 6,
        params: [
            {
                name: "people",
                type: "word",
                description: "People #"
            },
            {
                name: "bank",
                type: "byte",
                description: "Bank #"
            },
            {
                name: "map",
                type: "byte",
                description: "Map #"
            },
            {
                name: "???",
                type: "byte",
                description: "???"
            }
        ]
    },
    restorespritelevel: {
        value: 0xA9,
        description: {
            en: `Restores the original level, at selected bank and map, for the specified sprite.`,
            zh: `使指定地图上的任务的优先级恢复到原来的级别。`
        },
        bytes: 5,
        params: [
            {
                name: "people",
                type: "word",
                description: "People #"
            },
            {
                name: "bank",
                type: "byte",
                description: "Bank #"
            },
            {
                name: "map",
                type: "byte",
                description: "Map #"
            }
        ]
    },
    createsprite: {
        value: 0xAA,
        description: {
            en: `Creates a virtual sprite in the current map.`,
            zh: `在当前地图中创建虚拟人物。`
        },
        bytes: 9,
        params: [
            {
                name: "sprite",
                type: "byte",
                description: "Sprite # to use"
            },
            {
                name: "people",
                type: "byte",
                description: "Virtual people #"
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
            },
            {
                name: "behaviour",
                type: "byte",
                description: "Behaviour"
            },
            {
                name: "facing",
                type: "byte",
                description: "Facing"
            }
        ]
    },
    spriteface2: {
        value: 0xAB,
        description: {
            en: `Changes a facing of a virtual sprite.`,
            zh: `使虚拟人物面向指定方向。`
        },
        bytes: 3,
        params: [
            {
                name: "people",
                type: "byte",
                description: "Virtual people #"
            },
            {
                name: "facing",
                type: "byte",
                description: "Facing"
            }
        ]
    },
    setdooropened: {
        value: 0xAC,
        description: {
            en: `Prepares a door to be opened.`,
            zh: `准备开门。`
        },
        bytes: 5,
        params: [
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
    setdoorclosed: {
        value: 0xAD,
        description: {
            en: `Prepares a door to be closed.`,
            zh: `准备关门。`
        },
        bytes: 5,
        params: [
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
    doorchange: {
        value: 0xAE,
        description: {
            en: `Changes the state of the selected door.`,
            zh: `触发门的状态的更改。`
        },
        bytes: 1
    },
    setdooropened2: {
        value: 0xAF,
        description: {
            en: `Prepares a door to be opened. No animation.`,
            zh: `准备开门。无动画。`
        },
        bytes: 5,
        params: [
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
    setdoorclosed2: {
        value: 0xB0,
        description: {
            en: `Prepares a door to be closed. No animation.`,
            zh: `准备关门。无动画。`
        },
        bytes: 5,
        params: [
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
    cmdb1: {
        value: 0xB1,
        description: {
            en: `This command is currently under investigation, No detailed information is available at this time.`
        },
        bytes: 7,
        params: [
            {
                name: "???",
                type: "byte",
                description: "???"
            },
            {
                name: "???",
                type: "word",
                description: "???"
            },
            {
                name: "???",
                type: "byte",
                description: "???"
            },
            {
                name: "???",
                type: "word",
                description: "???"
            }
        ]
    },
    cmdb2: {
        value: 0xB2,
        description: {
            en: `This command is currently under investigation, No detailed information is available at this time.`
        },
        bytes: 1
    },
    checkcoins: {
        value: 0xB3,
        description: {
            en: `Checks the actual amount of coins and stores it on a specified variable.`,
            zh: `检查硬币的实际数量，并将结果存储在指定的变量中。`
        },
        bytes: 3,
        params: [
            {
                name: "variable",
                type: "word",
                description: "Variable to use"
            }
        ]
    },
    givecoins: {
        value: 0xB4,
        description: {
            en: `Gives the player a specified quantity of coins.`,
            zh: `给予玩家一定量的硬币。`
        },
        bytes: 3,
        params: [
            {
                name: "quantity",
                type: "word",
                description: "Coin quantity to give"
            }
        ]
    },
    removecoins: {
        value: 0xB5,
        description: {
            en: `Removes a specified quantity of coins.`,
            zh: `扣除玩家一定量的硬币。`
        },
        bytes: 3,
        params: [
            {
                name: "quantity",
                type: "word",
                description: "Coin quantity to remove"
            }
        ]
    },
    setwildbattle: {
        value: 0xB6,
        description: {
            en: `Prepares to start a battle with a pecified Pokémon, level and item.`,
            zh: `准备和指定等级和携带道具的野生宝可梦开始战斗。`
        },
        bytes: 6,
        params: [
            {
                name: "pokemon",
                type: "word",
                description: "Pokémon #"
            },
            {
                name: "level",
                type: "byte",
                description: "Level of the Pokémon"
            },
            {
                name: "item",
                type: "word",
                description: "Item # to be held"
            }
        ]
    },
    dowildbattle: {
        value: 0xB7,
        description: {
            en: `Triggers the battle specified by setwildbattle.`,
            zh: `触发 setwildbattle 设置的战斗。`
        },
        bytes: 1
    },
    setvirtualaddress: {
        value: 0xB8,
        description: {
            en: `Jumps to the specified value - value at 0x020375C4 in RAM, continuing execution from there.`,
            zh: `用指定的地址减去该指令所在的地址，并将结果存储在虚拟脚本地址中。`
        },
        bytes: 6,
        params: [
            {
                name: "value",
                type: "pointer",
                description: "Pointer"
            }
        ]
    },
    virtualgoto: {
        value: 0xB9,
        description: {
            en: `Jumps to a custom function.`,
            zh: `使用 goto 跳转到指定的虚拟脚本地址执行脚本。`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to custom function"
            }
        ]
    },
    virtualcall: {
        value: 0xBA,
        description: {
            en: `Calls a custom function.`,
            zh: `使用 call 跳转到指定的虚拟脚本地址执行脚本。`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to custom function"
            }
        ]
    },
    virtualgotoif: {
        value: 0xBB,
        description: {
            en: `Jumps to a custom function, conditional version.`,
            zh: `使用 if1 跳转到指定的虚拟脚本地址执行脚本。`
        },
        bytes: 6,
        params: [
            {
                name: "condition",
                type: "byte",
                description: "Condition"
            },
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to custom function"
            }
        ]
    },
    virtualcallif: {
        value: 0xBC,
        description: {
            en: `Calls a custom function, conditional version.`,
            zh: `使用 if2 跳转到指定的虚拟脚本地址执行脚本。`
        },
        bytes: 6,
        params: [
            {
                name: "condition",
                type: "byte",
                description: "Condition"
            },
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to custom function"
            }
        ]
    },
    virtualmsgbox: {
        value: 0xBD,
        description: {
            en: `Prepares a pointer to dialogue text for use.`,
            zh: `显示一个普通对话框，文本来自于指定虚拟脚本地址。`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to text"
            }
        ]
    },
    virtualloadpointer: {
        value: 0xBE,
        description: {
            en: `Prepares a pointer to dialogue text for use.`,
            zh: `显示一个盲文对话框，文本来自于指定虚拟脚本地址。`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to text"
            }
        ]
    },
    virtualbuffer: {
        value: 0xBF,
        description: {
            en: `Stores a custom string within a buffer.`,
            zh: `将文本存储在指定的文本缓冲区中，文本来自于指定虚拟脚本地址。`
        },
        bytes: 6,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            },
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to the string to store"
            }
        ]
    },
    showcoins: {
        value: 0xC0,
        description: {
            en: `Shows the coin counter on set coordinates.`,
            zh: `在指定位置显示硬币计数器。`
        },
        bytes: 3,
        params: [
            {
                name: "left",
                type: "byte",
                description: "Left position"
            },
            {
                name: "top",
                type: "byte",
                description: "Top position"
            }
        ]
    },
    hidecoins: {
        value: 0xC1,
        description: {
            en: `Hides the coin counter.`,
            zh: `隐藏硬币计数器。`
        },
        bytes: 3,
        params: [
            {
                name: "left",
                type: "byte",
                description: "Left position"
            },
            {
                name: "top",
                type: "byte",
                description: "Top position"
            }
        ]
    },
    updatecoins: {
        value: 0xC2,
        description: {
            en: `Updates the amount of coins displayed in the coin counter.`,
            zh: `更新硬币计数器中显示的数量。`
        },
        bytes: 3,
        params: [
            {
                name: "left",
                type: "byte",
                description: "Left position"
            },
            {
                name: "top",
                type: "byte",
                description: "Top position"
            }
        ]
    },
    cmdc3: {
        value: 0xC3,
        description: {
            en: `This command is currently under investigation, No detailed information is available at this time.`,
            zh: `设置游戏状态。`
        },
        bytes: 2,
        params: [
            {
                name: "state",
                type: "byte",
                description: "State"
            }
        ]
    },
    warp6: {
        value: 0xC4,
        description: {
            en: `Warps the player to another map.`,
            zh: `设置逃走的待传送地点供以后使用。`
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
    waitcry: {
        value: 0xC5,
        description: {
            en: `Waits for cry to finish.`,
            zh: `等待 cry 指令完成。`
        },
        bytes: 1
    },
    bufferboxname: {
        value: 0xC6,
        description: {
            en: `Stores the name of a PC box within a specified buffer.`,
            zh: `将玩家电脑的盒子名称存储在指定的文本缓冲区中。`
        },
        bytes: 4,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            },
            {
                name: "box",
                type: "word",
                description: "PC box # to store"
            }
        ]
    },
    textcolor: {
        value: 0xC7,
        description: {
            en: `Changes the text color used. FR/LG only.`,
            zh: `更改文本颜色。仅限火叶。`
        },
        bytes: 2,
        params: [
            {
                name: "color",
                type: "byte",
                description: "Color #"
            }
        ]
    },
    cmdc8: {
        value: 0xC8,
        description: {
            en: `This command is currently under investigation, No detailed information is available at this time.`
        },
        bytes: 1
    },
    cmdc9: {
        value: 0xC9,
        description: {
            en: `This command is currently under investigation, No detailed information is available at this time.`
        },
        bytes: 1
    },
    signmsg: {
        value: 0xCA,
        description: {
            en: `Changes the graphics used by msgboxes in order to make them look like signs. FR/LG only.`,
            zh: `将后面显示的对话框变成路牌型。仅限火叶。`
        },
        bytes: 1
    },
    normalmsg: {
        value: 0xCB,
        description: {
            en: `Clears the effect of the msgboxsign command. FR/LG only.`,
            zh: `将后面显示的对话框变成普通型。仅限火叶。`
        },
        bytes: 1
    },
    comparehiddenvar: {
        value: 0xCC,
        description: {
            en: `Compares the value of a chosen hidden variable. FR/LG only.`,
            zh: `将游戏状态值与指定值进行比较。仅限火叶。`
        },
        bytes: 4,
        params: [
            {
                name: "variable",
                type: "byte",
                description: "Variable #"
            },
            {
                name: "value",
                type: "word",
                description: "Value to compare variable to"
            }
        ]
    },
    setobedience: {
        value: 0xCD,
        description: {
            en: `Sets the specified Pokémon in player's party as obedient.`,
            zh: `将玩家队伍中指定的宝可梦设置为听话。`
        },
        bytes: 3,
        params: [
            {
                name: "pokemon",
                type: "word",
                description: "Pokémon #"
            }
        ]
    },
    checkobedience: {
        value: 0xCE,
        description: {
            en: `Checks if the specified Pokemon in player's party is obedient or not. The result stored in LASTRESULT.`,
            zh: `检查玩家队伍中指定的宝可梦是否听话，并将结果存储在 LASTRESULT 中。`
        },
        bytes: 3,
        params: [
            {
                name: "pokemon",
                type: "word",
                description: "Pokémon #"
            }
        ]
    },
    executeram: {
        value: 0xCF,
        description: {
            en: `Calculates the current location of the RAM script area and passes the execution to that offset.`,
            zh: `读取保存在 RAM 里的脚本，如果存在，则跳转到脚本地址执行脚本。`
        },
        bytes: 1
    },
    setworldmapflag: {
        value: 0xD0,
        description: {
            en: `Sets the flag used to allow the player to fly to a specific place. FR/LG only.`,
            zh: `设置地图 flag，使飞行点生效。仅限火叶。`
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
    warpteleport2: {
        value: 0xD1,
        description: {
            en: `Warps the player to another map. Teleport effect.`,
            zh: `将玩家传送到指定地点，有上下传送并旋转的效果。`
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
    setcatchlocation: {
        value: 0xD2,
        description: {
            en: `Changes the catch location for a specified Pokémon in player's party.`,
            zh: `设置玩家队伍中指定宝可梦的捕获地点。`
        },
        bytes: 4,
        params: [
            {
                name: "pokemon",
                type: "byte",
                description: "Pokémon #"
            },
            {
                name: "location",
                type: "byte",
                description: "Catch location #"
            }
        ]
    },
    braille2: {
        value: 0xD3,
        description: {
            en: `This command is currently under investigation, No detailed information is available at this time.`,
            zh: `获取盲文文本的长度，并将结果存储到变量 0x8004 中。仅限火叶。`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to braille data"
            }
        ]
    },
    bufferitems: {
        value: 0xD4,
        description: {
            en: `Stores a plural item name within a specified buffer. FR/LG only.`,
            zh: `将道具名称的复数形式存储在指定的文本缓冲区中。仅限火叶。`
        },
        bytes: 6,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            },
            {
                name: "item",
                type: "word",
                description: "Item # to store"
            },
            {
                name: "quantity",
                type: "word",
                description: "Quantity"
            }
        ]
    },
    cmdd5: {
        value: 0xD5,
        description: {
            en: `This command is currently under investigation, No detailed information is available at this time.`
        },
        bytes: 3,
        params: [
            {
                name: "???",
                type: "word",
                description: "???"
            }
        ]
    },
    cmdd6: {
        value: 0xD6,
        description: {
            en: `This command is currently under investigation, No detailed information is available at this time.`
        },
        bytes: 1
    },
    warp7: {
        value: 0xD7,
        description: {
            en: `This command is currently under investigation, No detailed information is available at this time.`,
            zh: `将玩家传送到指定地点。仅限绿宝石。`
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
    cmdd8: {
        value: 0xD8,
        description: {
            en: `This command is currently under investigation, No detailed information is available at this time.`
        },
        bytes: 1
    },
    cmdd9: {
        value: 0xD9,
        description: {
            en: `This command is currently under investigation, No detailed information is available at this time.`
        },
        bytes: 1
    },
    hidebox2: {
        value: 0xDA,
        description: {
            en: `Hides a displayed box. Emerald only.`,
            zh: `隐藏显示的框。仅限绿宝石。`
        },
        bytes: 1
    },
    preparemsg3: {
        value: 0xDB,
        description: {
            en: `This command is currently under investigation. No detailed information is available at this time.`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to text"
            }
        ]
    },
    fadescreen3: {
        value: 0xDC,
        description: {
            en: `Fades the screen in or out. Emerald only.`,
            zh: `执行屏幕渐变效果。仅限绿宝石。`
        },
        bytes: 2,
        params: [
            {
                name: "???",
                type: "byte",
                description: "???"
            }
        ]
    },
    buffertrainerclass: {
        value: 0xDD,
        description: {
            en: `Stores the name of the selected trainer class within a specified buffer. Emerald only.`,
            zh: `将训练师的类型名称存储在指定的文本缓冲区中。仅限绿宝石。`
        },
        bytes: 4,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            },
            {
                name: "class",
                type: "word",
                description: "Trainer class #"
            }
        ]
    },
    buffertrainername: {
        value: 0xDE,
        description: {
            en: `Stores the name of the selected trainer within a specified buffer. Emerald only.`,
            zh: `将训练师的名称存储在指定的文本缓冲区中。仅限绿宝石。`
        },
        bytes: 4,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            },
            {
                name: "trainer",
                type: "word",
                description: "Trainer #"
            }
        ]
    },
    pokenavcall: {
        value: 0xDF,
        description: {
            en: `Displays a PokéNav call. Emerald only.`,
            zh: `显示宝可梦导航器的对话框，对话框的文字可以来自文本地址或者脚本缓存库。仅限绿宝石。`
        },
        bytes: 5,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to text"
            }
        ]
    },
    warp8: {
        value: 0xE0,
        description: {
            en: `This command is currently under investigation, No detailed information is available at this time.`,
            zh: `将玩家传送到指定地点。仅限绿宝石。`
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
    buffercontesttype: {
        value: 0xE1,
        description: {
            en: `Stores the name of the selected contest type within a specified buffer. Emerald only.`,
            zh: `将华丽大赛类型的名称存储在指定的文本缓冲区中。仅限宝石。`
        },
        bytes: 4,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            },
            {
                name: "type",
                type: "word",
                description: "Contest type"
            }
        ]
    },
    bufferitems2: {
        value: 0xE2,
        description: {
            en: `Stores a plural item name within a specified buffer. FR/LG only.`,
            zh: `将道具名称的复数形式存储在指定的文本缓冲区中。仅限绿宝石。`
        },
        bytes: 6,
        params: [
            {
                name: "buffer",
                type: "byte",
                description: "Buffer #"
            },
            {
                name: "item",
                type: "word",
                description: "Item # to store"
            },
            {
                name: "quantity",
                type: "word",
                description: "Quantity"
            }
        ]
    },
    msgbox: {
        description: {
            en: `Loads a pointer into memory to display a message later on.`,
            zh: `显示指定类型的对话框。`
        },
        bytes: 8,
        params: [
            {
                name: "offset",
                type: "pointer",
                description: "Pointer to load into memory"
            },
            {
                name: "type",
                type: "byte",
                description: "Message type"
            }
        ]
    },
    message: {
        redirect: "msgbox"
    },
    giveitem: {
        description: {
            en: `Gives a specified item and displays an aftermath message of the player receiving the item.`,
            zh: `给予玩家一定量的物品，并显示玩家收到该物品后的信息。`
        },
        bytes: 12,
        params: [
            {
                name: "item",
                type: "word",
                description: "Item # to add"
            },
            {
                name: "quantity",
                type: "word",
                description: "Quantity"
            },
            {
                name: "type",
                type: "byte",
                description: "Message Type"
            }
        ]
    },
    giveitem2: {
        description: {
            en: `Similar to giveitem except it plays a fanfare too.`,
            zh: `类似 giveitem，但是会播放效果音。仅限火叶。`
        },
        bytes: 17,
        params: [
            {
                name: "item",
                type: "word",
                description: "Item # to add"
            },
            {
                name: "quantity",
                type: "word",
                description: "Quantity"
            },
            {
                name: "fanfare",
                type: "word",
                description: "Sappy song # to play"
            }
        ]
    },
    giveitem3: {
        description: {
            en: `Gives the player a specified decoration and displays a related message.`,
            zh: `给予玩家装饰并显示相关信息。仅限宝石。`
        },
        bytes: 7,
        params: [
            {
                name: "decoration",
                type: "word",
                description: "Decoration #"
            }
        ]
    },
    wildbattle: {
        description: {
            en: `Starts a wild Pokémon battle.`,
            zh: `进入野外宝可梦对战。`
        },
        bytes: 7,
        params: [
            {
                name: "pokemon",
                type: "word",
                description: "Pokémon # to battle"
            },
            {
                name: "level",
                type: "byte",
                description: "Level of the Pokémon"
            },
            {
                name: "item",
                type: "word",
                description: "Item # to be held"
            }
        ]
    },
    wildbattle2: {
        description: {
            en: `Starts a wild Pokémon battle using a specific graphic style.`,
            zh: `进入指定类型的野外宝可梦对战。`
        },
        bytes: 10,
        params: [
            {
                name: "pokemon",
                type: "word",
                description: "Pokémon # to battle"
            },
            {
                name: "level",
                type: "byte",
                description: "Level of the Pokémon"
            },
            {
                name: "item",
                type: "word",
                description: "Item # to be held"
            },
            {
                name: "style",
                type: "byte",
                description: "Battle style"
            }
        ]
    },
    registernav: {
        description: {
            en: `Register the specified tranier in the PokéNav. Emerald Only.`,
            zh: `在宝可梦导航器中注册指定的训练师。仅限绿宝石。`
        },
        bytes: 7,
        params: [
            {
                name: "trainer",
                type: "word",
                description: "Trainer #"
            }
        ]
    }
};