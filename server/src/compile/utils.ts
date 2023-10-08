import * as fs from "fs";
import * as path from "path";
import * as YAML from "yaml";

// const character_en_table = YAML.parse(fs.readFileSync(path.join(__dirname, "../../data/table/character_en.yaml"), "utf8"));
// const character_zh_table = YAML.parse(fs.readFileSync(path.join(__dirname, "../../data/table/character_zh.yaml"), "utf8"));
const braille_table = YAML.parse(fs.readFileSync(path.join(__dirname, "../../data/table/braille.yaml"), "utf8"));

// const character_en_table_invert = invertKeyValues(character_en_table);
// const character_zh_table_invert = invertKeyValues(character_zh_table);
const braille_table_invert = invertKeyValues(braille_table);

//从盲文表获取字节数组
export function getByteDataByBraille(str: string): number[]
{
    return [...str].map((char) => {
        if (/[a-zA-Z]/.test(char)) {
            return Number(braille_table_invert[char.toUpperCase()]);
        }
        else {
            throw 0;
        }
    });
}

//从字符串获取字节数组
export function getByteDataByString(str: string): number[]
{
    const chars = [...str];

    for (let i = 0; i < chars.length; i++) {

    }
    return [1, 2, 3];
}

//根据类型获取字节数组
export function getByteDataByLiteral(param: ASTLiteralParam, { autobank }): number[]
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