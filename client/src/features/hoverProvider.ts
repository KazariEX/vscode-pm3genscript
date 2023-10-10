import * as vscode from "vscode";
import { commands, macros } from "../data";
import { capitalizeFirstLetter } from "../utils";

export default class PM3GenHoverProvider implements vscode.HoverProvider
{
    public static register(context: vscode.ExtensionContext, languageId: string): vscode.Disposable
    {
        const provider = new PM3GenHoverProvider(context);
        const providerRegistration = vscode.languages.registerHoverProvider(languageId, provider);
        return providerRegistration;
    }

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover>
    {
        let word = document.getText(document.getWordRangeAtPosition(position));

        const contents = [];

        if (word in macros) {
            //重定向
            const { redirect } = macros[word];
            if (redirect) {
                word = redirect;
            }

            //数据对象
            const entity = macros[word];

            //标题
            let suffix = "";
            const { alias } = entity;
            if (alias?.length > 0) {
                suffix = ` (alias:${alias.map((item) => ` #${item}`).join(",")})`;
            }
            contents.push(`**#${word}**${suffix}`);

            //功能
            contents.push(entity.description.en, entity.description.zh);

            //参数
            const syntax = `
            \n语法：
            \n#${word} ${entity.params?.map((item) => {
                return `[${item.name}]`;
            }).join(" ")}`;

            const example = `
            \n用例：
            \n${entity.example.value}
            \n${entity.example.description}`;

            contents.push(syntax, example);
        }
        else if (word in commands) {
            //重定向
            const { redirect } = commands[word];
            if (redirect) {
                word = redirect;
            }

            //数据对象
            const entity = commands[word];

            //标题
            let prefix = "";
            if (Reflect.has(entity, "value")) {
                prefix = `0x${entity.value.toString(16).toUpperCase().padStart(2, "0")} - `;
            }
            contents.push(`${prefix}**${word}**`);

            //功能
            contents.push(entity.description.en, entity.description.zh);

            //参数
            let str = `所需字节：${entity.bytes}`;
            if (entity.params?.length > 0) {
                str += `
                \n参数：
                \n${entity.params.map((item) => {
                    return `?? ${capitalizeFirstLetter(item.type as string)} - ${item.description}`;
                }).join("\n\n")}`;
            }
            else {
                str += `
                \n无参数要求。`;
            }
            contents.push(str);
        }

        return {
            contents
        };
    }
}