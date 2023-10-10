import * as path from "path";
import * as vscode from "vscode";
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from "vscode-languageclient/node";
import PM3GenCompletionItemProvider from "./features/completionItemProvider";
import PM3GenHoverProvider from "./features/hoverProvider";
import PM3GenSignatureHelpProvider from "./features/signatureHelpProvider";
import { arrayToHexString, numberToHexString } from "./utils";
import { GBA } from "./gba";

export class PM3GenClient
{
    readonly languageId = "pm3genscript";
    readonly context: vscode.ExtensionContext;
    readonly client: LanguageClient;
    readonly outputChannel: vscode.OutputChannel;

    constructor(context: vscode.ExtensionContext)
    {
        this.context = context;

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
            documentSelector: [{ scheme: "file", language: this.languageId }]
        };

        //连接语言服务器
        this.client = new LanguageClient("PM3GenScript Language Server", serverOptions, clientOptions);
        this.client.start();

        //输出频道
        this.outputChannel = vscode.window.createOutputChannel("PM3GenScript");

        //注册命令
        for (const key in this.commands) {
            const command = vscode.commands.registerCommand(`${this.languageId}.${key}`, this.commands[key]);
            context.subscriptions.push(command);
        }

        //注册Provider
        for (const item of this.providers) {
            const provider = item.register(context, this.languageId);
            context.subscriptions.push(provider);
        }
    }

    destructor()
    {
        this.client.stop();
    }

    readonly commands = {
        //编译
        compile: async () => {
            try {
                const res = await this.sendCompileRequire();

                this.outputChannel.clear();
                this.outputChannel.show();

                //定义列表
                const definelist = getDefineListString(res);
                if (definelist !== null) {
                    this.outputChannel.appendLine(definelist + "\n");
                }

                //脚本块
                this.outputChannel.appendLine(res.blocks.map((block) => {
                    const title = block.dynamicName ?? numberToHexString(block.offset);
                    return `${title} [${block.length}]\n` + arrayToHexString(block.data.flat(2));
                }).join("\n\n"));

                vscode.window.showInformationMessage("编译成功！");
            }
            catch (err) {
                vscode.window.showErrorMessage("编译失败：" + err);
            }
        },
        //写入
        write: async (uri: vscode.Uri) => {
            try {
                const res = await this.sendCompileRequire();

                try {
                    const gba = await GBA.open(uri);
                    await gba.write(res);

                    this.outputChannel.clear();
                    this.outputChannel.show();

                    //定义列表
                    const definelist = getDefineListString(res);
                    if (definelist !== null) {
                        this.outputChannel.appendLine(definelist + "\n");
                    }

                    //脚本块
                    this.outputChannel.appendLine(res.blocks.map((block) => {
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
        },
        //反编译
        decompile: async (uri: vscode.Uri) => {
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
                        language: this.languageId
                    });
                    vscode.window.showTextDocument(td);
                    vscode.window.showInformationMessage("反编译成功！");
                }
            }
            catch (err) {
                vscode.window.showErrorMessage("反编译失败：" + err);
            }
        }
    };

    readonly providers = [
        PM3GenCompletionItemProvider,
        PM3GenHoverProvider,
        PM3GenSignatureHelpProvider
    ];

    //发送编译请求
    async sendCompileRequire(): Promise<CompileResult>
    {
        const { document } = vscode.window.activeTextEditor;

        if (document.languageId !== this.languageId) {
            throw "请在正确的文件下进行编译！";
        }

        const content = document.getText();
        const res: CompileResult = await this.client.sendRequest("compile", {
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