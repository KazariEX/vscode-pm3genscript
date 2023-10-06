import * as fs from "fs";
import { getByteDataByPointer } from "../utils";

export class GBA {
    filename;

    constructor(filename: string = null)
    {
        this.filename = filename;
    }

    //寻找空位
    findFreeSpace(startOffset: number, length: number, freeSpaceByte: number = 0xFF): Promise<number>
    {
        return new Promise((resolve, reject) => {
            const filename = this.filename;

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
                    end: startOffset + length * 2 - 1
                });

                console.log(freeSpaceByte);

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
                    data = Buffer.concat(chunks, totalLength);

                    if (data.length === 0) reject("空位不足！");

                    let start = 0; //起始偏移
                    let count = 0; //空位大小

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
                        find(startOffset + length * 2);
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
            const data = getByteDataByPointer(offset);

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
    private async writeByOffset(offset: number, content: number[])
    {
        return new Promise((resolve, reject) => {
            const ws = fs.createWriteStream(this.filename, {
                start: offset,
                flags: "r+"
            });

            ws.on("error", (err) => {
                reject(`文件读取失败！\n${err}`);
            });

            ws.write(Uint8Array.from(content), (err) => {
                if (err) {
                    reject(`写入失败！\n${err}`);
                }
                else {
                    resolve(offset);
                }
            });
        });
    }
}