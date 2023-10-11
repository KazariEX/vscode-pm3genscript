import * as vscode from "vscode";
import { commands, macros } from "../data";
import { capitalize } from "../utils";

export default class PM3GenSignatureHelpProvider implements vscode.SignatureHelpProvider
{
    public static register(context: vscode.ExtensionContext, languageId: string): vscode.Disposable
    {
        const provider = new PM3GenSignatureHelpProvider(context);
        const providerRegistration = vscode.languages.registerSignatureHelpProvider(languageId, provider, " ");
        return providerRegistration;
    }

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    provideSignatureHelp(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.SignatureHelpContext): vscode.ProviderResult<vscode.SignatureHelp>
    {
        //光标位置
        let char = position.character;

        //整行文本
        let text = document.lineAt(position.line).text;

        //单词尾位
        let c = 0;

        //高亮参数序号
        let p = -1;

        //去除注释
        text = text.replaceAll(/(\/\/.*)|(\/\*[^/]*\*\/)/g, (comment) => {
            return " ".repeat(comment.length);
        });

        //找到光标前最后一条指令
        let match;
        const words = text.slice(0, char).matchAll(/(#?)(\b[a-z][0-9a-z]*|=)/g);
        if (!words) {
            return null;
        }
        for (const word of words) {
            match = word;
        }

        //判断指令是否存在
        const prefix = match[1];
        let word = match[2];
        let all;
        if ((prefix === "#" && (word in macros)) || word === "=") {
            all = macros;
        }
        else if (word in commands) {
            all = commands;
        }
        else {
            return null;
        }

        //从该指令处开始
        const start = match.index + match[0].length;
        text = text.slice(start);
        char -= start;

        let sub: RegExpMatchArray;
        let params = text;
        const re = /^((\s+)[^\s]*)(\s+.*)?$/;
        while (c < char && (sub = params.match(re))) {
            c += sub[1].length;
            p += sub[2].length > 0 ? 1 : 0;
            params = sub[3];
        }

        //重定向
        const { redirect } = all[word];
        if (redirect) {
            word = redirect;
        }

        const signatureInfo = new vscode.SignatureInformation(prefix + word + " " + all[word].params.map((item) => {
            return `[${item.name}]`;
        }).join(" "), new vscode.MarkdownString(all[word].description.zh?.trim()));

        signatureInfo.parameters.push(...all[word].params.map((item) => {
            let type = "";
            if (typeof item.type === "string") {
                type = capitalize(item.type);
            }
            else {
                type = item.type.map((i) => capitalize(i)).join(" | ");
            }

            return {
                label: item.name,
                documentation: item.description ? `${type} - ${item.description}` : `类型：${type}`
            };
        }));

        const res = new vscode.SignatureHelp();
        res.activeSignature = 0;
        res.activeParameter = p;
        res.signatures.push(signatureInfo);

        return res;
    }
}