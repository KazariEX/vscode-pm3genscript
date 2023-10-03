import * as vscode from "vscode";
import pm3genHoverProvider from "./features/hoverProvider";
import pm3genSignatureHelpProvider from "./features/signatureHelpProvider";
import { all } from "./data";

const selector = "pm3genscript";

export function activate(context: vscode.ExtensionContext)
{
    //编译器宏补全
    const provider1 = vscode.languages.registerCompletionItemProvider(selector, {
        provideCompletionItems: (document, position) => {
            const result = [];
            for (const key in all) {
                const value = all[key];
                if (value?.hash === true) {
                    result.push({
                        label: "#" + key,
                        detail: "#" + key,
                        insertText: key
                    });
                }
            }
            return result;
        }
    }, "#");

    //指令补全
    const provider2 = vscode.languages.registerCompletionItemProvider(selector, {
        provideCompletionItems: (document, position) => {
            const result = [];
            for (const key in all) {
                const value = all[key];
                if (value?.hash !== true) {
                    result.push({
                        label: key,
                        detail: key,
                        insertText: key
                    });
                }
            }
            return result;
        }
    });

    //悬停提示
    const provider3 = vscode.languages.registerHoverProvider(selector, new pm3genHoverProvider());

    //签名帮助
    const provider4 = vscode.languages.registerSignatureHelpProvider(selector, new pm3genSignatureHelpProvider(), " ");

    context.subscriptions.push(provider1, provider2, provider3, provider4);
}

export function deactivate()
{

}