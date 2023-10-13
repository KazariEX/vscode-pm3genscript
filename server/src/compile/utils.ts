import * as fs from "fs";
import * as path from "path";
import * as YAML from "yaml";

//盲文字符集
const charset_braille = invertKeyValues(YAML.parse(fs.readFileSync(path.join(__dirname, "../../../data/charset/braille.yaml"), "utf8")));

//从盲文获取字节数组
export function getByteDataByBraille(str: string): number[]
{
    return [...str].map((char) => {
        if (/[a-zA-Z]/.test(char)) {
            return Number(charset_braille[char.toUpperCase()]);
        }
        else {
            throw char;
        }
    });
}

//从字符串获取字节数组
export function getByteDataByString(str: string, charsets: any[]): number[]
{
    const res = [];
    const chars = [...str];

    let special = false;
    let transfer = "";
    for (let i = 0; i < chars.length; i++) {
        let char = chars[i];
        if (special === true) {
            if (char === "]") {
                special = false;
                transfer += char;
                const code = getCharCode(transfer, charsets);
                if (code !== null) {
                    const data = getByteDataByCharCode(code);
                    res.push(...data);
                    transfer = "";
                }
                else {
                    throw transfer;
                }
            }
            else if (char === "[") {
                throw char;
            }
            else {
                transfer += char;
            }
        }
        else {
            if (char === "[") {
                special = true;
                transfer += char;
            }
            else {
                if (char === "\\" && i + 1 < chars.length) {
                    char += chars[i + 1];
                    i++;
                }
                if (char === "\\h") {
                    const n = chars[i + 1] + chars[i + 2];
                    if (/[0-9a-zA-Z]{2}/.test(n)) {
                        res.push(Number.parseInt(`0x${n}`));
                        i += 2;
                    }
                    else {
                        throw char;
                    }
                }
                else {
                    const code = getCharCode(char, charsets);
                    if (code !== null) {
                        const data = getByteDataByCharCode(code);
                        res.push(...data);
                    }
                    else {
                        throw char;
                    }
                }
            }
        }
    }
    if (special === true) {
        throw "[";
    }
    return res;
}

//从字面量获取字节数组
export function getByteDataByLiteral(param: ASTNumberParam, { autobank = true } = {}): number[]
{
    autobank ??= true;

    const res = [];
    const fn = (value: number) => (res.push(value % 0x100), value >> 8);

    let { value } = param;
    switch (param.type) {
        case "pointer":
            if (autobank && value < 0x2000000) value += 0x8000000;
        case "dword":
            value = fn(value);
            value = fn(value);
        case "word":
            value = fn(value);
        case "byte":
            value = fn(value);
    }
    return res;
}

//反转键值对
export function invertKeyValues(obj: object)
{
    return Object.keys(obj).reduce((acc, key) => {
        acc[obj[key]] = key;
        return acc;
    }, {});
}

//从字符编码获取字节数组
function getByteDataByCharCode(code: number): number[]
{
    const res = [];
    do {
        res.unshift(code % 0x100);
        code >>= 8;
    }
    while (code > 0);
    return res;
}

//从字符集获取字符编码
function getCharCode(char: string, charsets: any[]): number
{
    for (const charset of charsets) {
        if (char in charset) {
            return charset[char];
        }
    }
    return null;
}