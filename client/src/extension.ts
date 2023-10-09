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
import { arrayToHexString, numberToHexString } from "./utils";
import { GBA } from "./gba";

//语言ID
const languageId = "pm3genscript";

//客户端
let client: LanguageClient;

//扩展激活时
export function activate(context: vscode.ExtensionContext)
{
    const serverModule = context.asAbsolutePath(path.join("server", "out", "server.js"));
    const serverOptions: ServerOptions = {
        run: {
            module: serverModule,
            transport: TransportKind.ipc
        },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: { execArgv: ["--nolazy", "--inspect=6009"] }
        }
    };
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: "file", language: languageId }]
    };

    //连接语言服务器
    client = new LanguageClient("PM3GenScript Language Server", serverOptions, clientOptions);
    client.start();

    //输出频道
    const outputChannel = vscode.window.createOutputChannel("PM3GenScript");

    //命令：编译
    const command1 = vscode.commands.registerCommand(`${languageId}.compile`, async () => {
        try {
            const res = await sendCompileRequire();

            outputChannel.clear();
            outputChannel.show();

            //定义列表
            const definelist = getDefineListString(res);
            if (definelist !== null) {
                outputChannel.appendLine(definelist + "\n");
            }

            //脚本块
            outputChannel.appendLine(res.blocks.map((block) => {
                const title = block.dynamicName ?? numberToHexString(block.offset);
                return `${title} [${block.length}]\n` + arrayToHexString(block.data.flat(2));
            }).join("\n\n"));

            vscode.window.showInformationMessage("编译成功！");
        }
        catch (err) {
            vscode.window.showErrorMessage("编译失败：" + err);
        }
    });

    //命令：写入
    const command2 = vscode.commands.registerCommand(`${languageId}.write`, async (uri: vscode.Uri) => {
        try {
            const res = await sendCompileRequire();

            try {
                const gba = await GBA.open(uri);
                await gba.write(res);

                outputChannel.clear();
                outputChannel.show();

                //定义列表
                const definelist = getDefineListString(res);
                if (definelist !== null) {
                    outputChannel.appendLine(definelist + "\n");
                }

                //脚本块
                outputChannel.appendLine(res.blocks.map((block) => {
                    let title = numberToHexString(block.offset);
                    if (block.dynamicName) {
                        title = `${block.dynamicName} => ${title}`;
                    }
                    return `${title} [${block.length}]\n` + arrayToHexString(block.data.flat(2));
                }).join("\n\n"));

                vscode.window.showInformationMessage("写入成功！");
            }
            catch (err) {
                vscode.window.showErrorMessage("写入失败：" + err);
            }
        }
        catch (err) {
            vscode.window.showErrorMessage("编译失败：" + err);
        }
    });

    //命令：反编译
    const command3 = vscode.commands.registerCommand(`${languageId}.decompile`, async (uri: vscode.Uri) => {
        try {
            const gba = await GBA.open(uri);

            const input = await vscode.window.showInputBox({
                placeHolder: "请输入反编译地址(0x)……"
            });
            const offset = Number(`0x${input}`);

            if (offset) {
                const res = await gba.decompile(offset);

                const td = await vscode.workspace.openTextDocument({
                    content: res.plaintext,
                    language: languageId
                });
                vscode.window.showTextDocument(td);
                vscode.window.showInformationMessage("反编译成功！");
            }
        }
        catch (err) {
            vscode.window.showErrorMessage("反编译失败：" + err);
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
    context.subscriptions.push(command1, command2, command3, provider1, provider2, provider3, provider4);
}

//扩展停用时
export function deactivate()
{
    if (client) {
        return client.stop();
    }
}

//发送编译请求
async function sendCompileRequire(): Promise<CompileResult>
{
    const { document } = vscode.window.activeTextEditor;

    if (document.languageId !== languageId) {
        throw "请在正确的文件下进行编译！";
    }

    const content = document.getText();
    const res: CompileResult = await client.sendRequest("compile", {
        content,
        uri: document.uri.fsPath
    });

    if (res.error) {
        throw res.error;
    }
    else {
        return res;
    }
}

//从编译结果获取定义列表字符串
function getDefineListString(res: CompileResult): string
{
    let str = "";
    for (const key in res.defines) {
        str += `\n${key} = ${numberToHexString(res.defines[key])}`;
    }
    if (str.length === 0) {
        return null;
    }
    return `定义列表：${str}`;
}