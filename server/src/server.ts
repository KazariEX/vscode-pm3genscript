import * as lsp from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { DiagnosticSeverity, TextDocumentSyncKind } from "vscode-languageserver";
import { check } from "./check";

const connection = lsp.createConnection();
const documents = new lsp.TextDocuments(TextDocument);

connection.onInitialize(() => {
	return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Full
		}
	};
});

connection.onInitialized(() => {
	connection.client.register(lsp.DidChangeConfigurationNotification.type, void(0));
});

connection.onDidChangeConfiguration(() => {
	documents.all().forEach(validateTextDocument);
});

documents.onDidChangeContent((change) => {
	validateTextDocument(change.document);
});

documents.listen(connection);

connection.listen();

async function validateTextDocument(textDocument: TextDocument)
{
	const level = (await getSetting(textDocument.uri))?.diagnosticLevel || "info";
	const errors = check(textDocument).filter((e) => {
		if (level === "warn") {
			return e.severity !== DiagnosticSeverity.Information;
		} else if (level === "error") {
			return e.severity !== DiagnosticSeverity.Information && e.severity !== DiagnosticSeverity.Warning;
		}
		return true;
	});
	connection.sendDiagnostics({
		uri: textDocument.uri,
		diagnostics: errors
	});
}

async function getSetting(uri: string)
{
	return await connection.workspace.getConfiguration({
		scopeUri: uri,
		section: "pm3genscript"
	})
}