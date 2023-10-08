import * as fs from "fs";
import * as path from "path";

//字符串首字母大写
export function capitalizeFirstLetter(str: string): string
{
    if (str?.length > 0) {
        return str[0].toUpperCase() + str.slice(1);
    }
    else {
        return str;
    }
}

//数组转十六进制字符串
export function arrayToHexString(arr: Array<number>): string
{
    return arr.map((value) => {
        return value.toString(16).toUpperCase().padStart(2, "0");
    }).join(" ");
}

//数字转十六进制字符串
export function numberToHexString(value: Number): string
{
    return `0x${value.toString(16).toUpperCase()}`;
}

//指针转十六进制数组
export function getByteDataByPointer(offset: number): number[]
{
    const res = [];

    if (offset < 0x2000000) offset += 0x8000000;
    for (let i = 0; i < 4; i++, offset >>= 8) {
        res.push(offset % 0x100);
    }

    return res;
}

//获取项目配置
export function getConfiguration(uri: string)
{
    const filename = ".pm3genrc.json";

    let dir = path.dirname(uri);
    let target = path.join(dir, filename);

    while (!fs.existsSync(target)) {
        const parentDir = path.join(dir, "../");
        if (parentDir === dir) {
            throw "找不到配置文件。";
        }
        dir = parentDir;
        target = path.join(dir, filename);
    }

    const file = fs.readFileSync(target);
    return {
        conf: JSON.parse(file.toString()),
        dir
    };
}