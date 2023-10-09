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

//指针转字节数组
export function getByteArrayByPointer(offset: number, autobank?: boolean): number[]
{
    autobank ??= true;
    if (autobank && offset < 0x2000000) offset += 0x8000000;

    const res = [];
    for (let i = 0; i < 4; i++, offset >>= 8) {
        res.push(offset % 0x100);
    }
    return res;
}

//获取参数类型对应的字节长度
export function getLengthByParamType(type: string): number
{
    switch (type) {
        case "byte": return 1;
        case "word": return 2;
        case "dword": return 4;
        case "pointer": return 4;
        default: return 0;
    }
}

//字节数组转数字
export function getValueByByteArray(arr: Buffer)
{
    return arr.reduce((res, byte, i) => {
        return res + byte * Math.pow(0x100, i);
    }, 0);
}

//去除偏移存储体
export function removeMemoryBank(offset: number)
{
    return offset >= 0x8000000 ? offset - 0x8000000 : offset;
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