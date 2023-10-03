import { CancellationToken, Hover, HoverProvider, Position, ProviderResult, TextDocument } from "vscode";
import { all } from "../data";

export default class pm3genHoverProvider implements HoverProvider {
    provideHover(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover> {
        let word = document.getText(document.getWordRangeAtPosition(position));

        const contents = [];
        if (word in all) {
            const { redirect } = all[word];

            //重定向
            if (redirect) {
                word = redirect;
            }

            //数据对象
            const entity = all[word];

            //标题
            let prefix = "",
                suffix = "";
            if (entity.value !== void(0)) {
                prefix = `0x${entity.value.toString(16).toUpperCase().padStart(2, "0")} - `;
            }
            else if (entity.hash === true) {
                word = "#" + word;
                const { alias } = entity;
                if (alias?.length > 0) {
                    suffix = ` (alias:${alias.map((item) => ` #${item}`).join(",")})`;
                }
            }
            contents.push(`${prefix}**${word}**${suffix}`);

            //功能
            contents.push(entity.description.en, entity.description.zh);

            //参数
            if (entity.hash === true) {
                const syntax = `
                \n语法：
                \n${word} ${entity.params?.map((item) => {
                    return `[${item.name}]`;
                }).join(" ")}`;

                const example = `
                \n用例：
                \n${entity.example.value}
                \n${entity.example.description}`;

                contents.push(syntax, example);
            }
            else {
                let str = `所需字节：${entity.bytes}`;
                if (entity.params?.length > 0) {
                    str += `
                    \n参数：
                    \n${entity.params?.map((item) => {
                        return `?? ${item.description}`;
                    }).join("\n\n")}`;
                }
                else {
                    str += "无参数要求。"
                }
                contents.push(str);
            }
        }

        return {
            contents
        };
    }
}