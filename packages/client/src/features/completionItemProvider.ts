import * as vscode from "vscode";
import { commands, macros } from "@pm3genscript/shared";

export default class PM3GenCompletionItemProvider implements vscode.CompletionItemProvider {
    public static register(context: vscode.ExtensionContext, languageId: string): vscode.Disposable {
        const provider = new PM3GenCompletionItemProvider(context);
        const providerRegistration = vscode.languages.registerCompletionItemProvider(languageId, provider);
        return providerRegistration;
    }

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
        const result = [];
        for (const key in commands) {
            result.push({
                label: key,
                detail: key,
                insertText: key
            });
        }
        for (const key in macros) {
            if (key === "=") continue;
            result.push({
                label: "#" + key,
                detail: "#" + key,
                insertText: "#" + key
            });
        }
        return result;
    }
}