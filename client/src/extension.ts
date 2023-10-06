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

//ROM文件
const gba = new GBA();

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

    //输出频道
    const outputChannel = vscode.window.createOutputChannel("PM3GenScript");

    //命令：编译
    const command1 = vscode.commands.registerCommand(`${languageId}.compile`, async () => {
        const res = await sendCompileRequire();

        if (res.error) {
            vscode.window.showErrorMessage(`编译失败：${res.error}`);
        }
        else {
            vscode.window.showInformationMessage(`编译成功！`);
            outputChannel.clear();
            outputChannel.show();

            //定义列表
            const definelist = getDefineListString(res);
            if (definelist !== null) {
                outputChannel.appendLine(definelist);
            }

            //脚本块
            res.blocks.forEach((block) => {
                const title = block.dynamicName ?? numberToHexString(block.offset);
                outputChannel.appendLine(`\n${title} [${block.length}]`);
                outputChannel.appendLine(arrayToHexString(block.data.flat(2)));
            });
        }
    });

    //命令：写入
    const command2 = vscode.commands.registerCommand(`${languageId}.write`, async () => {
        const res = await sendCompileRequire();

        if (res.error) {
            vscode.window.showErrorMessage(`编译失败：${res.error}`);
        }
        else {
            try {
                if (gba.filename === null) {
                    const filename = await openGBAFile();
                    if (!(gba.filename = filename)) {
                        throw `请打开正确的文件！`;
                    }
                }
                await gba.write(res);

                vscode.window.showInformationMessage("写入成功！");
                outputChannel.clear();
                outputChannel.show();

                //定义列表
                const definelist = getDefineListString(res);
                if (definelist !== null) {
                    outputChannel.appendLine(definelist);
                }

                //脚本块
                res.blocks.forEach((block) => {
                    let title = numberToHexString(block.offset);
                    if (block.dynamicName) {
                        title = `${block.dynamicName} => ${title}`;
                    }
                    outputChannel.appendLine(`\n${title} [${block.length}]`);
                    outputChannel.appendLine(arrayToHexString(block.data.flat(2)));
                });
            }
            catch (err) {
                vscode.window.showErrorMessage(`写入失败：${err}`);
            }
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
    context.subscriptions.push(command1, command2, provider1, provider2, provider3, provider4);
}

export function deactivate()
{
    if (client) {
        return client.stop();
    }
}

//打开GBA文件
async function openGBAFile(): Promise<string>
{
    const uris = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        openLabel: `打开 ROM`,
        filters: {
            "GameBoy Advance ROM": ["gba"]
        }
    });
    if (!uris) return null;

    const uri = uris[0];
    return uri.fsPath;
}

//发送编译请求
async function sendCompileRequire(): Promise<CompileResult>
{
    const { document } = vscode.window.activeTextEditor;

    if (document.languageId !== languageId) {
        vscode.window.showErrorMessage("请在正确的文件下进行编译！");
        return;
    }

    const content = document.getText();
    return await client.sendRequest("compile", {
        content
    });
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