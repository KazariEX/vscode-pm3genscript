import type * as vscode from "vscode";
import { PM3GenClient } from "./client";

//客户端
let client: PM3GenClient;

//扩展激活时
export function activate(context: vscode.ExtensionContext) {
    client = new PM3GenClient(context);
}

//扩展停用时
export function deactivate() {
    if (client) {
        client.destructor();
    }
}