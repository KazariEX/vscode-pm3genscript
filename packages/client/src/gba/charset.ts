import * as fs from "node:fs";
import * as path from "node:path";
import * as YAML from "yaml";

export const charset = {
    en: readCharset(path.join(__dirname, "../../../../data/charset/character_en.yaml")),
    zh: readCharset(path.join(__dirname, "../../../../data/charset/character_zh.yaml")),
    braille: readCharset(path.join(__dirname, "../../../../data/charset/braille.yaml"))
};

export function readCharset(filename: string) {
    return YAML.parse(fs.readFileSync(filename, "utf8"));
}

export function getChar(code: number, charsets: any[]): string {
    for (const charset of charsets) {
        if (code in charset) {
            return charset[code];
        }
    }
    return null;
}