import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Buffer } from "node:buffer";
import Decompiler from "./decompiler";
import { filterObjectKeys, getConfiguration } from "../utils";
import { Pointer } from "./pointer";

export class GBA {
    filename: string;
    conf: GBAConfiguration;

    private constructor(filename: string, conf: GBAConfiguration = {})
    {
        this.filename = filename;
        this.conf = conf;
    }

    //打开ROM，返回GBA实例
    static async open(relatedUri: vscode.Uri): Promise<GBA>
    {
        //默认为当前活跃文本编辑器的URI
        relatedUri ??= vscode.window.activeTextEditor.document.uri;

        //获取配置文件
        const { conf, dir } = getConfiguration(relatedUri.fsPath);

        let filename = "";
        if (relatedUri?.scheme === "file") {
            const { fsPath } = relatedUri;
            if (path.extname(fsPath) === "gba") {
                filename = fsPath;
            }
            else if (conf.rom) {
                filename = path.isAbsolute(conf.rom) ? conf.rom : path.join(dir, conf.rom);
            }
        }

        if (!fs.existsSync(filename)) {
            const uris = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                openLabel: `打开 ROM`,
                filters: {
                    "GameBoy Advance ROM": ["gba"]
                }
            });
            if (!uris) {
                throw "未选择文件。";
            }
            filename = uris[0].fsPath;
        }
        return new GBA(filename, conf);
    }

    //寻找空位
    findFreeSpace(pointer: Pointer, length: number, freeSpaceByte: number = 0xFF): Promise<Pointer>
    {
        const { filename } = this;

        return new Promise((resolve, reject) => {
            //开始查找
            find(pointer.value);

            function find(startOffset: number)
            {
                const rs = fs.createReadStream(filename, {
                    start: startOffset,
                    end: startOffset + Math.max(0x1000, length * 2) - 1
                });

                let data: Buffer;
                let totalLength = 0;
                const chunks: Buffer[] = [];

                rs.on("error", (err) => {
                    reject(err);
                });

                rs.on("data", (chunk: Buffer) => {
                    chunks.push(chunk);
                    totalLength += chunk.length;
                });

                rs.on("end", () => {
                    rs.close();

                    data = Buffer.concat(chunks, totalLength);
                    if (data.length === 0) reject("空位不足！");

                    let start = 0;
                    let count = 0;

                    for (let i = 0; i < data.length; i++) {
                        if (data[i] === freeSpaceByte) {
                            count++;
                            if (count === length) break;
                        }
                        else {
                            start = i + 1;
                            count = 0;
                        }
                    }

                    if (count >= length && start + count <= data.length) {
                        const finding = new Pointer(startOffset + start);
                        resolve(finding);
                    }
                    else {
                        find(startOffset + start);
                    }
                });
            }
        });
    }

    //写入编译结果
    async write(res: CompileResult)
    {
        //空位限定
        if (![0x00, 0xFF].includes(res.freeSpaceByte)) {
            res.freeSpaceByte = 0xFF;
        }

        //反编译需要删除的偏移地址
        for (const [type, offset] of res.removes) {
            const pointer = new Pointer(offset);
            const decompiler = new Decompiler(this.filename);
            const gekka = await decompiler[type](pointer);

            //连锁偏移忽略
            const blocks = (type === "all") ? filterObjectKeys(gekka.blocks, (key: number, index: number) => {
                return !(index > 0 && (this.conf.compilerOptions?.removeAllIgnore?.some?.((item) => {
                    return Pointer.equal(`0x${item}`, key);
                }) ?? false));
            }) : { [offset]: gekka };

            //删除指定数据
            for (const key in blocks) {
                const block = blocks[key];
                const data = new Array(block.raw.length).fill(res.freeSpaceByte);
                await this.writeSingly(block.pointer, data);
            }
        }

        //建立动态偏移到静态偏移的映射
        const dynamicMap: {
            [name: string]: Pointer
        } = {};

        //找到所有空位
        const startPointer = new Pointer(res.dynamic.offset);
        for (const block of res.blocks) {
            if (block.dynamicName) {
                const pointer = await this.findFreeSpace(startPointer, block.length, res.freeSpaceByte);
                block.offset = pointer.value;
                dynamicMap[block.dynamicName] = pointer;
                startPointer.value = block.offset + block.length;
            }
        }

        //补全动态偏移参数
        for (const name in res.dynamic.collection) {
            const pointer = dynamicMap[name];
            const data = pointer.toByteArray(res.autobank);

            res.dynamic.collection[name].forEach(([i, j, k]) => {
                res.blocks[i].data[j][k] = data;
            });
        }

        //写入全部数据
        for (const block of res.blocks) {
            await this.writeSingly(new Pointer(block.offset), block.data.flat(2));
        }
    }

    //写入单组数据
    private writeSingly(pointer: Pointer, content: number[])
    {
        return new Promise((resolve, reject) => {
            const ws = fs.createWriteStream(this.filename, {
                start: pointer.value,
                flags: "r+"
            });

            ws.on("error", (err) => {
                reject(err);
            });

            ws.write(Uint8Array.from(content), (err) => {
                ws.close();
                if (err) {
                    reject(err);
                }
                else {
                    resolve(pointer);
                }
            });
        });
    }

    //反编译
    async decompile(pointer: Pointer): Promise<DecompileResult>
    {
        const decompiler = new Decompiler(this.filename);
        return await decompiler.all(pointer);
    }
}