import * as vscode from "vscode";
import { commands, macros } from "../data";
import { capitalizeFirstLetter } from "../utils";

const all = {
    ...commands,
    ...macros
};

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
        const char = position.character;

        //整行文本
        const text = document.lineAt(position.line).text;

        //单词尾位
        let c = 0;

        //高亮参数序号
        let p = -1;

        const match = text.match(/((?:\*\/|^)\s*([#0-9a-z=]+))(\s+.*)/);
        const fullWord = match?.[2];

        let word = fullWord;
        if (word.startsWith("#")) {
            word = word.substring(1);
        }
        else if (word in macros && word !== "=") {
            return null;
        }

        if (word in all) {
            //重定向
            const { redirect } = all[word];
            if (redirect) {
                word = redirect;
            }

            c += match[1].length;
            if (char <= c) {
                return null;
            }
            let sub: RegExpMatchArray;
            let params = match[3] ?? "";
            const re = /^((\s+)\w*)(\s+.*)?$/;
            while (c < char && (sub = params?.match(re))) {
                c += sub[1].length;
                p += sub[2].length > 0 ? 1 : 0;
                params = sub[3];
            }
        }
        else {
            return null;
        }

        const signatureInfo = new vscode.SignatureInformation(fullWord + " " + all[word].params.map((item) => {
            return `[${item.name}]`;
        }).join(" "), new vscode.MarkdownString(all[word].description.zh?.trim()));

        signatureInfo.parameters.push(...all[word].params.map((item) => {
            let type = "";
            if (typeof item.type === "string") {
                type = capitalizeFirstLetter(item.type);
            }
            else {
                type = item.type.map((i) => capitalizeFirstLetter(i)).join(" | ");
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