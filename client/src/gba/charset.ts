import * as fs from "fs";
import * as path from "path";
import * as YAML from "yaml";

export const charset = {
    en: readCharsetFile(path.join(__dirname, "../../../data/charset/character_en.yaml")),
    zh: readCharsetFile(path.join(__dirname, "../../../data/charset/character_zh.yaml")),
    braille: readCharsetFile(path.join(__dirname, "../../../data/charset/braille.yaml"))
};

export function readCharsetFile(filename: string)
{
    return YAML.parse(fs.readFileSync(filename, "utf8"));
}