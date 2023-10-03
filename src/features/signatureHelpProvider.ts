import { CancellationToken, Position, ProviderResult, SignatureHelp, SignatureInformation, SignatureHelpContext, SignatureHelpProvider, TextDocument, MarkdownString } from "vscode";
import { all } from "../data";

export default class pm3genSignatureHelpProvider implements SignatureHelpProvider {
    provideSignatureHelp(document: TextDocument, position: Position, token: CancellationToken, context: SignatureHelpContext): ProviderResult<SignatureHelp> | null {
        //整行文本
        const text = document.lineAt(position.line).text;

        //光标位置
        const char = position.character;

        //单词尾位
        let c = 0;

        //高亮参数序号
        let p = -1;

        const match = text.match(/((?:\*\/|^)\s*([#0-9a-z]+))(\s+.*)/);
        const fullKey = match?.[2];

        let key = fullKey;
        if (key.startsWith("#")) {
            key = key.substring(1);
        }
        else if (all[key]?.hash === true) {
            return null;
        }

        if (key in all) {
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

        const signatureInfo = new SignatureInformation(fullKey + " " + all[key].params.map((item) => {
            return `[${item.name}]`;
        }).join(" "), new MarkdownString(all[key].description.zh?.trim()));

        signatureInfo.parameters.push(...all[key].params.map((item) => {
            return {
                label: item.name,
                documentation: item.description
            };
        }));

        const res = new SignatureHelp();
        res.activeSignature = 0;
        res.activeParameter = p;
        res.signatures.push(signatureInfo);

        return res;
    }
}