import * as fs from "fs";
import * as lodash from "lodash";
import * as path from "path";
import * as YAML from "yaml";
import { commands } from "../data";
import { getLengthByParamType, getValueByByteArray, numberToHexString, removeMemoryBank } from "../utils";

//字符表
const character_zh_table = YAML.parse(fs.readFileSync(path.join(__dirname, "../../../data/table/character_zh.yaml"), "utf8"));
const braille_table = YAML.parse(fs.readFileSync(path.join(__dirname, "../../../data/table/braille.yaml"), "utf8"));

//字节映射指令名
const commands_invert = Object.keys(commands).reduce((acc, key) => {
    const template = commands[key];
    if ("value" in template) {
        acc[template.value] = key;
    }
    return acc;
}, {});

//脚本块类型
export enum DecompileBlockType {
    script,
    braille,
    raw_mart,
    raw_move,
    text
}

//需要反编译的指针集合
const pointers = {
    "call": {
        0: DecompileBlockType.script
    },
    "goto": {
        0: DecompileBlockType.script
    },
    "if1": {
        1: DecompileBlockType.script
    },
    "if2": {
        1: DecompileBlockType.script
    },
    "applymovement": {
        1: DecompileBlockType.raw_move
    },
    "applymovementpos": {
        1: DecompileBlockType.raw_move
    },
    "trainerbattle": {
        3: DecompileBlockType.text,
        4: DecompileBlockType.text
    },
    "preparemsg": {
        0: DecompileBlockType.text
    },
    "braille": {
        0: DecompileBlockType.braille
    },
    "bufferstring": {
        1: DecompileBlockType.text
    },
    "pokemart": {
        0: DecompileBlockType.raw_mart
    },
    "pokemart2": {
        0: DecompileBlockType.raw_mart
    },
    "pokemart3": {
        0: DecompileBlockType.raw_mart
    },
    "preparemsg2": {
        0: DecompileBlockType.text
    },
    "virtualgoto": {
        0: DecompileBlockType.script
    },
    "virtualcall": {
        0: DecompileBlockType.script
    },
    "virtualgotoif": {
        1: DecompileBlockType.script
    },
    "virtualcallif": {
        1: DecompileBlockType.script
    },
    "virtualmsgbox": {
        0: DecompileBlockType.text
    },
    "virtualbuffer": {
        1: DecompileBlockType.text
    },
    "braille2": {
        0: DecompileBlockType.braille
    },
    "preparemsg3": {
        0: DecompileBlockType.text
    },
    "pokenavcall": {
        0: DecompileBlockType.text
    },
    "msgbox": {
        0: DecompileBlockType.text
    }
};

export default class Decompiler {
    filename: string;

    constructor(filename: string)
    {
        this.filename = filename;
    }

    //执行反编译
    async exec(offset: number): Promise<DecompileResult>
    {
        const res: DecompileResult = {
            blocks: {}
        };

        //连锁反编译
        const chain = async (block: DecompileScriptBlock) => {
            for (const command of block.commands) {
                //该指令拥有需要反编译成脚本块的指针参数
                if (command.cmd in pointers) {
                    const template = pointers[command.cmd];

                    for (const index in template) {
                        const offset = command.params[index];
                        //该脚本块尚未反编译
                        if (!(offset in res.blocks)) {
                            let b;
                            switch (template[index]) {
                                case DecompileBlockType.script:
                                    b = await this.script(offset);
                                    await chain(b);
                                    break;
                                case DecompileBlockType.braille:
                                    b = await this.braille(offset);
                                    break;
                                case DecompileBlockType.raw_mart:
                                    b = await this.raw_mart(offset);
                                    break;
                                case DecompileBlockType.raw_move:
                                    b = await this.raw_move(offset);
                                    break;
                                case DecompileBlockType.text:
                                    b = await this.text(offset);
                                    break;
                            }
                            res.blocks[offset] = b;
                        }
                    }
                }
            }
        };

        //起始脚本块
        const block = await this.script(offset);
        res.blocks[offset] = block;
        await chain(block);

        //合成纯文本
        res.plaintext = Object.keys(res.blocks).map((offset) => {
            return res.blocks[offset]?.plaintext;
        }).join("\n\n");

        return res;
    }

    //脚本块：指令
    async script(offset: number): Promise<DecompileScriptBlock>
    {
        const data = await this.readData(offset);
        const res: DecompileScriptBlock = {
            offset,
            type: DecompileBlockType.script,
            raw: [],
            commands: []
        };

        for (let i = 0; i < data.length;) {
            const start = data[i++];
            if (start in commands_invert) {
                res.raw.push(start);

                const cmd = commands_invert[start];
                const template = commands[cmd];
                const command = {
                    cmd,
                    template,
                    params: []
                };

                template.params?.forEach((p) => {
                    const len = getLengthByParamType(p.type as string);
                    const arr = data.subarray(i, i + len);
                    const value = getValueByByteArray(arr);
                    command.params.push(value);
                    res.raw.push(...arr);
                    i += len;
                });
                res.commands.push(command);

                if (template.ending) break;
            }
            else break;
        }

        //合成复合指令
        compound(res.commands);

        //生成纯文本
        res.plaintext = `#org ${
            numberToHexString(removeMemoryBank(offset))
        }\n${res.commands.map((command) => {
            let line = command.cmd;
            if (command.params.length > 0) {
                line += " " + command.params.map((param) => numberToHexString(param)).join(" ");
            }
            return line;
        }).join("\n")}`;

        return res;
    }

    //脚本块：盲文
    async braille(offset: number): Promise<DecompileBrailleBlock>
    {
        const data = await this.readData(offset);
        const res: DecompileBrailleBlock = {
            offset,
            type: DecompileBlockType.braille,
            raw: [],
            braille: ""
        };

        for (let i = 0; i < data.length;) {
            const byte = data[i];
            if (byte in braille_table) {
                res.braille += braille_table[byte];
                res.raw.push(byte);
            }
            else {
                if (byte === 0xFF) {
                    res.raw.push(byte);
                }
                break;
            }
        }

        //生成纯文本
        res.plaintext = `#org ${
            numberToHexString(removeMemoryBank(offset))
        }\n#braille "${res.braille}"`;

        return res;
    }

    //脚本块：商店数据
    async raw_mart(offset: number): Promise<DecompileBlock>
    {
        const data = await this.readData(offset);
        const res: DecompileBlock = {
            offset,
            type: DecompileBlockType.text,
            raw: []
        };

        for (let i = 0; i < data.length; i += 2) {
            const [b1, b2] = data.subarray(i, i + 2);

            if (b1 === 0xFF) break;
            else {
                res.raw.push(b1, b2);
                if (b1 + b2 === 0x00) break;
            }
        }

        //生成纯文本
        res.plaintext = `#org ${
            numberToHexString(removeMemoryBank(offset))
        }\n${lodash.chunk(res.raw, 2).map((byte) => {
            return `#raw word ${numberToHexString(byte[1] * 0x100 + byte[0])}`;
        }).join("\n")}`;

        return res;
    }

    //脚本块：移动数据
    async raw_move(offset: number): Promise<DecompileBlock>
    {
        const data = await this.readData(offset);
        const res: DecompileBlock = {
            offset,
            type: DecompileBlockType.text,
            raw: []
        };

        for (let i = 0; i < data.length; i++) {
            const byte = data[i];

            if (byte === 0xFF) break;
            else {
                res.raw.push(byte);
                if (byte === 0xFE) break;
            }
        }

        //生成纯文本
        res.plaintext = `#org ${
            numberToHexString(removeMemoryBank(offset))
        }\n${res.raw.map((byte) => {
            return `#raw ${numberToHexString(byte)}`;
        }).join("\n")}`;

        return res;
    }

    //脚本块：文本
    async text(offset: number): Promise<DecompileTextBlock>
    {
        const data = await this.readData(offset);
        const res: DecompileTextBlock = {
            offset,
            type: DecompileBlockType.text,
            raw: [],
            text: ""
        };

        for (let i = 0; i < data.length;) {
            const [b1, b2, b3] = data.subarray(i, i + 3);

            if (b1 === 0xFF) {
                res.raw.push(...data.subarray(0, i));
                break;
            }

            const bytes3 = b1 * 0x10000 + b2 * 0x100 + b3;
            if (bytes3 in character_zh_table) {
                res.text += character_zh_table[bytes3];
                i += 3;
                continue;
            }

            const bytes2 = b1 * 0x100 + b2;
            if (bytes2 in character_zh_table) {
                res.text += character_zh_table[bytes2];
                i += 2;
                continue;
            }

            if (b1 in character_zh_table) {
                res.text += character_zh_table[b1];
            }
            else {
                res.text += " ";
            }
            i++;
        }


        //生成纯文本
        res.plaintext = `#org ${
            numberToHexString(removeMemoryBank(offset))
        }\n= "${res.text}"`;

        return res;
    }

    //读取数据
    private readData(offset: number): Promise<Buffer>
    {
        offset = removeMemoryBank(offset);
        return new Promise((resolve, reject) => {
            const rs = fs.createReadStream(this.filename, {
                start: offset
            });

            rs.on("error", (err) => {
                reject(err);
            });

            rs.on("data", (data: Buffer) => {
                resolve(data);
                rs.close();
            });
        });
    }
}

//指令合成
const compound = (function()
{
    const slot0 = Symbol(0);
    const slot1 = Symbol(1);
    const slot2 = Symbol(2);
    const slot3 = Symbol(3);
    const table = [
        {
            cmd: "msgbox",
            pattern: [
                {
                    cmd: "loadpointer",
                    params: [0x00, slot0]
                },
                {
                    cmd: "callstd",
                    params: [slot1]
                }
            ]
        },
        {
            cmd: "giveitem",
            pattern: [
                {
                    cmd: "copyvarifnotzero",
                    params: [0x8000, slot0]
                },
                {
                    cmd: "copyvarifnotzero",
                    params: [0x8001, slot1]
                },
                {
                    cmd: "callstd",
                    params: [slot2]
                }
            ]
        },
        {
            cmd: "giveitem2",
            pattern: [
                {
                    cmd: "copyvarifnotzero",
                    params: [0x8000, slot0]
                },
                {
                    cmd: "copyvarifnotzero",
                    params: [0x8001, slot1]
                },
                {
                    cmd: "copyvarifnotzero",
                    params: [0x8002, slot2]
                },
                {
                    cmd: "callstd",
                    params: [0x09]
                }
            ]
        },
        {
            cmd: "giveitem3",
            pattern: [
                {
                    cmd: "copyvarifnotzero",
                    params: [0x8000, slot0]
                },
                {
                    cmd: "callstd",
                    params: [0x07]
                }
            ]
        },
        {
            cmd: "wilebattle",
            pattern: [
                {
                    cmd: "setwildbattle",
                    params: [slot0, slot1, slot2]
                },
                {
                    cmd: "dowildbattle"
                }
            ]
        },
        {
            cmd: "wildbattle2",
            pattern: [
                {
                    cmd: "setwildbattle",
                    params: [slot0, slot1, slot2]
                },
                {
                    cmd: "special",
                    params: [{
                        slot: slot3,
                        exec: (p: number) => p - 0x137
                    }]
                },
                {
                    cmd: "waitstate"
                }
            ]
        },
        {
            cmd: "registernav",
            pattern: [
                {
                    cmd: "copyvarifnotzero",
                    params: [0x8000, slot0]
                },
                {
                    cmd: "callstd",
                    params: [0x08]
                }
            ]
        }
    ];

    return function(list: DecompileCommand[])
    {
        table.forEach((item) => {
            for (let i = 0; i < list.length; i++) {
                let j = 0;
                let success = false;
                while (item.pattern[j].cmd === list[i]?.cmd) {
                    const { params } = item.pattern[j];
                    const every = params ? [...params].every((param, index) => {
                        const a = typeof param === "number";
                        const b = list[i].params[index] === param;
                        return !a || b;
                    }) : true;
                    if (every === true) {
                        i++;
                        j++;
                        if (j === item.pattern.length) {
                            success = true;
                            break;
                        }
                    }
                    else break;
                }
                i -= j;

                if (success) {
                    const res: DecompileCommand = {
                        cmd: item.cmd,
                        template: commands[item.cmd],
                        params: []
                    };
                    for (let k = i; k < i + j; k++) {
                        const { params } = item.pattern[k - i];
                        for (let l = 0; l < params.length; l++) {
                            switch (typeof params[l]) {
                                case "symbol": {
                                    const order = (params[l] as symbol).description;
                                    res.params[order] = list[k].params[l];
                                    break;
                                }
                                case "object": {
                                    const { slot, exec } = params[l] as any;
                                    const order = slot.description;
                                    res.params[order] = exec(list[k].params[l]);
                                    break;
                                }
                            }
                        }
                    }
                    list.splice(i, j, res);
                }
            }
        });
    };
})();