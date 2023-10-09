import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Buffer } from "node:buffer";
import Decompiler from "./decompiler";
import { getByteArrayByPointer, getConfiguration, removeMemoryBank } from "../utils";

export class GBA {
    filename: string;

    constructor(filename?: string)
    {
        this.filename = filename;
    }

    //打开ROM，返回GBA实例
    static async open(relatedUri: vscode.Uri): Promise<GBA>
    {
        //默认为当前活跃文本编辑器的URI
        relatedUri ??= vscode.window.activeTextEditor.document.uri;

        let filename = "";
        if (relatedUri?.scheme === "file") {
            const { fsPath } = relatedUri;
            if (path.extname(fsPath) === "gba") {
                filename = fsPath;
            }
            else {
                const { conf, dir } = getConfiguration(relatedUri.fsPath);
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
        return new GBA(filename);
    }

    //寻找空位
    findFreeSpace(startOffset: number, length: number, freeSpaceByte: number = 0xFF): Promise<number>
    {
        const { filename } = this;

        return new Promise((resolve, reject) => {
            //空位限定
            let freespace = freeSpaceByte;
            if (![0x00, 0xFF].includes(freeSpaceByte)) {
                freespace = 0xFF;
            }

            //开始查找
            find(startOffset);

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
                        if (data[i] === freespace) {
                            count++;
                            if (count === length) break;
                        }
                        else {
                            start = i + 1;
                            count = 0;
                        }
                    }

                    if (count >= length && start + count <= data.length) {
                        resolve(startOffset + start);
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
        //建立动态偏移到静态偏移的映射
        const dynamicMap = {};

        //找到所有空位
        let startOffset = res.dynamic.offset;
        for (const block of res.blocks) {
            if (block.dynamicName) {
                block.offset = await this.findFreeSpace(startOffset, block.length, res.freeSpaceByte);
                dynamicMap[block.dynamicName] = block.offset;
                startOffset = block.offset + block.length;
            }
        }

        //补全动态偏移参数
        for (const name in res.dynamic.collection) {
            const offset = dynamicMap[name];
            const data = getByteArrayByPointer(offset, res.autobank);

            res.dynamic.collection[name].forEach(([i, j, k]) => {
                res.blocks[i].data[j][k] = data;
            });
        }

        //写入全部数据
        for (const block of res.blocks) {
            await this.writeByOffset(block.offset, block.data.flat(2));
        }
    }

    //写入单组数据
    private writeByOffset(offset: number, content: number[])
    {
        offset = removeMemoryBank(offset);
        if (offset >= 0x8000000) offset -= 0x8000000;
        return new Promise((resolve, reject) => {
            const ws = fs.createWriteStream(this.filename, {
                start: offset,
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
                    resolve(offset);
                }
            });
        });
    }

    //反编译
    async decompile(offset: number): Promise<DecompileResult>
    {
        const decompiler = new Decompiler(this.filename);
        return await decompiler.exec(offset);
    }
}