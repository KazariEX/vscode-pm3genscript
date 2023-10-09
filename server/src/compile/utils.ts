import * as fs from "fs";
import * as path from "path";
import * as YAML from "yaml";

const character_zh_table = YAML.parse(fs.readFileSync(path.join(require.main.path, "../../data/table/character_zh.yaml"), "utf8"));
const braille_table = YAML.parse(fs.readFileSync(path.join(require.main.path, "../../data/table/braille.yaml"), "utf8"));

const character_zh_table_invert = invertKeyValues(character_zh_table);
const braille_table_invert = invertKeyValues(braille_table);

//从盲文表获取字节数组
export function getByteDataByBraille(str: string): number[]
{
    return [...str].map((char) => {
        if (/[a-zA-Z]/.test(char)) {
            return Number(braille_table_invert[char.toUpperCase()]);
        }
        else {
            throw char;
        }
    });
}

//从字符串获取字节数组
export function getByteDataByString(str: string): number[]
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
                if (transfer in character_zh_table_invert) {
                    const code = character_zh_table_invert[transfer];
                    const data = getByteDataByCharCode(code);
                    res.push(...data);
                    transfer = "";
                }
                else {
                    throw transfer;
                }
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
                let escape = false;
                if (char === "\\" && i < chars.length) {
                    char += chars[i + 1];
                    escape = true;
                }
                if (char in character_zh_table_invert) {
                    if (escape === true) {
                        escape = false;
                        i++;
                    }
                    const code = character_zh_table_invert[char];
                    const data = getByteDataByCharCode(code);
                    res.push(...data);
                }
                else {
                    throw char;
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
export function getByteDataByLiteral(param: ASTLiteralParam, { autobank = true } = {}): number[]
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
function invertKeyValues(obj: object)
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