import * as lsp from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { DiagnosticSeverity, TextDocumentSyncKind } from "vscode-languageserver";
import { check } from "./check";
import { compile } from "./compile";

//创建连接
const connection = lsp.createConnection();
const documents = new lsp.TextDocuments(TextDocument);

//初始化时
connection.onInitialize(() => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full
        }
    };
});

//初始化完成时
connection.onInitialized(() => {
    connection.client.register(lsp.DidChangeConfigurationNotification.type, void(0));
});

//配置项变更时
connection.onDidChangeConfiguration(() => {
    documents.all().forEach(validateTextDocument);
});

//内容变更时
documents.onDidChangeContent((change) => {
    validateTextDocument(change.document);
});

//建立连接
documents.listen(connection);
connection.listen();

//编译
connection.onRequest("compile", ({
    content,
    uri
} = {}) => {
    try {
        return compile(content, uri);
    } catch (err) {
        return {
            error: err.message
        };
    }
});

//语法检验与报错
async function validateTextDocument(textDocument: TextDocument)
{
    const level = (await getConfiguration(textDocument.uri))?.diagnosticLevel || "info";

    const { errors } = check(textDocument);
    connection.sendDiagnostics({
        uri: textDocument.uri,
        diagnostics: errors.filter((e) => {
            switch (level) {
                case "warn": return e.severity !== DiagnosticSeverity.Information;
                case "error": return e.severity !== DiagnosticSeverity.Information && e.severity !== DiagnosticSeverity.Warning;
            }
            return true;
        })
    });
}

//获取配置项
async function getConfiguration(uri: string)
{
    return await connection.workspace.getConfiguration({
        scopeUri: uri,
        section: "pm3genscript"
    });
}