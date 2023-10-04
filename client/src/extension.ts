import * as path from "path";
import * as vscode from "vscode";
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from "vscode-languageclient/node";
import pm3genHoverProvider from "./features/hoverProvider";
import pm3genSignatureHelpProvider from "./features/signatureHelpProvider";
import { macros, commands } from "./data";

//语言ID
const languageId = "pm3genscript";

//客户端
let client: LanguageClient;

export function activate(context: vscode.ExtensionContext)
{
    //连接语言服务器
    const serverModule = context.asAbsolutePath(path.join("server", "out", "server.js"));

    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: { execArgv: ["--nolazy", "--inspect=6009"] }
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: "file", language: languageId }]
    };

    client = new LanguageClient(
        "PM3GenScript Language Server",
        serverOptions,
        clientOptions
    );

    client.start();

    //命令：编译
    const command1 = vscode.commands.registerCommand(`${languageId}.compile`, async () => {
        const { document } = vscode.window.activeTextEditor;

        if (document.languageId !== languageId) {
            vscode.window.showErrorMessage("请在正确的文件下进行编译！");
            return;
        }

        const content = document.getText();
        const gekka: any = await client.sendRequest("compile", {
            content
        });

        if (gekka.errors.length > 0) {
            const channel = vscode.window.createOutputChannel("compile", languageId);
            channel.appendLine("!23");
            channel.show();
        }
        else {
            vscode.window.showErrorMessage("编译失败，请检查脚本！");
        }
    });

    //编译器宏补全
    const provider1 = vscode.languages.registerCompletionItemProvider(languageId, {
        provideCompletionItems: (document, position) => {
            const result = [];
            for (const key in macros) {
                if (key === "=") continue;
                result.push({
                    label: "#" + key,
                    detail: "#" + key,
                    insertText: key
                });
            }
            return result;
        }
    }, "#");

    //指令补全
    const provider2 = vscode.languages.registerCompletionItemProvider(languageId, {
        provideCompletionItems: (document, position) => {
            const result = [];
            for (const key in commands) {
                result.push({
                    label: key,
                    detail: key,
                    insertText: key
                });
            }
            return result;
        }
    });

    //悬停提示
    const provider3 = vscode.languages.registerHoverProvider(languageId, new pm3genHoverProvider());

    //签名帮助
    const provider4 = vscode.languages.registerSignatureHelpProvider(languageId, new pm3genSignatureHelpProvider(), " ");

    //写入上下文
    context.subscriptions.push(command1, provider1, provider2, provider3, provider4);
}

export function deactivate()
{
    if (client) {
        return client.stop();
    }
}