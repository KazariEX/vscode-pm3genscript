import * as fs from "node:fs";
import { Buffer } from "node:buffer";
import * as lodash from "lodash";
import { commands } from "@pm3genscript/shared";
import { getHexStringByNumber, getLengthByParamType, getValueByByteArray } from "../utils";
import { charset, getChar } from "./charset";
import { Pointer } from "./pointer";
import type { GBA } from ".";

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
    string
}

//需要反编译的指针集合
const pointers = {
    call: {
        0: DecompileBlockType.script
    },
    goto: {
        0: DecompileBlockType.script
    },
    if1: {
        1: DecompileBlockType.script
    },
    if2: {
        1: DecompileBlockType.script
    },
    applymovement: {
        1: DecompileBlockType.raw_move
    },
    applymovementpos: {
        1: DecompileBlockType.raw_move
    },
    trainerbattle: {
        3: DecompileBlockType.string,
        4: DecompileBlockType.string
    },
    preparemsg: {
        0: DecompileBlockType.string
    },
    braille: {
        0: DecompileBlockType.braille
    },
    bufferstring: {
        1: DecompileBlockType.string
    },
    pokemart: {
        0: DecompileBlockType.raw_mart
    },
    pokemart2: {
        0: DecompileBlockType.raw_mart
    },
    pokemart3: {
        0: DecompileBlockType.raw_mart
    },
    preparemsg2: {
        0: DecompileBlockType.string
    },
    virtualgoto: {
        0: DecompileBlockType.script
    },
    virtualcall: {
        0: DecompileBlockType.script
    },
    virtualgotoif: {
        1: DecompileBlockType.script
    },
    virtualcallif: {
        1: DecompileBlockType.script
    },
    virtualmsgbox: {
        0: DecompileBlockType.string
    },
    virtualbuffer: {
        1: DecompileBlockType.string
    },
    braille2: {
        0: DecompileBlockType.braille
    },
    preparemsg3: {
        0: DecompileBlockType.string
    },
    pokenavcall: {
        0: DecompileBlockType.string
    },
    msgbox: {
        0: DecompileBlockType.string
    }
};

export class Decompiler {
    constructor(
        private gba: GBA
    ) {}

    //执行反编译
    async all(pointer: Pointer): Promise<DecompileResult> {
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
                        const pointer = new Pointer(command.params[index]);

                        //该脚本块尚未反编译
                        if (!(Number.isNaN(pointer.value) || (pointer.value in res.blocks))) {
                            let b;
                            switch (template[index]) {
                                case DecompileBlockType.script:
                                    b = await this.script(pointer);
                                    await chain(b);
                                    break;
                                case DecompileBlockType.braille:
                                    b = await this.braille(pointer);
                                    break;
                                case DecompileBlockType.raw_mart:
                                    b = await this.raw_mart(pointer);
                                    break;
                                case DecompileBlockType.raw_move:
                                    b = await this.raw_move(pointer);
                                    break;
                                case DecompileBlockType.string:
                                    b = await this.text(pointer);
                                    break;
                            }
                            res.blocks[pointer.value] = b;
                        }
                    }
                }
            }
        };

        //起始脚本块
        const block = await this.script(pointer);
        res.blocks[pointer.value] = block;
        await chain(block);

        //合成纯文本
        res.plaintext = Object.keys(res.blocks).map((offset) => {
            return res.blocks[offset]?.plaintext;
        }).join("\n\n");

        return res;
    }

    //脚本块：指令
    async script(pointer: Pointer): Promise<DecompileScriptBlock> {
        const data = await this.readData(pointer);
        const res: DecompileScriptBlock = {
            pointer,
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
                    if (!(p.when?.(command.params) ?? true)) return;

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
        res.plaintext = `#org ${pointer}\n${res.commands.map((command) => {
            let line = command.cmd;
            if (command.params.length > 0) {
                line += " " + command.params.map((param) => getHexStringByNumber(param)).join(" ");
            }
            return line;
        }).join("\n")}`;

        return res;
    }

    //脚本块：盲文
    async braille(pointer: Pointer): Promise<DecompileBrailleBlock> {
        const data = await this.readData(pointer);
        const res: DecompileBrailleBlock = {
            pointer,
            type: DecompileBlockType.braille,
            raw: [],
            braille: ""
        };

        for (let i = 0; i < data.length;) {
            const byte = data[i];
            if (byte in charset.braille) {
                res.braille += charset.braille[byte];
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
        res.plaintext = `#org ${pointer}\n#braille "${res.braille}"`;

        return res;
    }

    //脚本块：商店数据
    async raw_mart(pointer: Pointer): Promise<DecompileBlock> {
        const data = await this.readData(pointer);
        const res: DecompileBlock = {
            pointer,
            type: DecompileBlockType.string,
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
        res.plaintext = `#org ${pointer}\n${lodash.chunk(res.raw, 2).map((byte) => {
            return `#raw word ${getHexStringByNumber(byte[1] * 0x100 + byte[0])}`;
        }).join("\n")}`;

        return res;
    }

    //脚本块：移动数据
    async raw_move(pointer: Pointer): Promise<DecompileBlock> {
        const data = await this.readData(pointer);
        const res: DecompileBlock = {
            pointer,
            type: DecompileBlockType.string,
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
        res.plaintext = `#org ${pointer}\n${res.raw.map((byte) => {
            return `#raw ${getHexStringByNumber(byte)}`;
        }).join("\n")}`;

        return res;
    }

    //脚本块：文本
    async text(pointer: Pointer): Promise<DecompileTextBlock> {
        const data = await this.readData(pointer);
        const res: DecompileTextBlock = {
            pointer,
            type: DecompileBlockType.string,
            raw: [],
            text: ""
        };

        $: for (let i = 0; i < data.length;) {
            const [b1, b2, b3] = data.subarray(i, i + 3);

            if (b1 === 0xFF) {
                res.raw.push(...data.subarray(0, i + 1));
                break;
            }

            for (let j = 3; j > 0; j--) {
                const code = {
                    3: () => b1 * 0x10000 + b2 * 0x100 + b3,
                    2: () => b1 * 0x100 + b2,
                    1: () => b1
                }[j]();
                const char = getChar(code, this.gba.charsets);
                if (char !== null) {
                    res.text += char;
                    i += j;
                    continue $;
                }
            }
            res.text += " ";
            i++;
        }

        //生成纯文本
        res.plaintext = `#org ${pointer}\n= "${res.text}"`;

        return res;
    }

    //读取数据
    private readData(pointer: Pointer): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const stat = fs.statSync(this.gba.filename);
            if (stat.size < pointer.value) {
                resolve(Buffer.alloc(0));
            }

            const rs = fs.createReadStream(this.gba.filename, {
                start: pointer.value
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
const compound = (() => {
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

    return function(list: DecompileCommand[]) {
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