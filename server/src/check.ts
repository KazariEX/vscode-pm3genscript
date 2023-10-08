import * as lsp from "vscode-languageserver";
import { EOF } from "chevrotain";
import { TextDocument } from "vscode-languageserver-textdocument";
import { text2ast } from "./ast";

export function check(content: TextDocument): lsp.Diagnostic[]
{
    const errors: lsp.Diagnostic[] = [];
    const text = content.getText();
    const uri = content.uri;

    const {
        lexErrors,
        parseErrors,
        astErrors
    } = text2ast(text, {
        isReferenced: false,
        uri
    });

    if (lexErrors.length > 0) {
        errors.push(...lexErrors.map((e) => ({
            message: e.message,
            severity: lsp.DiagnosticSeverity.Error,
            range: {
                start: {
                    line: e.line - 1,
                    character: e.column - 1
                },
                end: content.positionAt(content.offsetAt({
                    line: e.line - 1,
                    character: e.column - 1
                }) + e.length)
            }
        })));
    }

    if (parseErrors.length > 0) {
        errors.push(...parseErrors.map((e) => ({
            message: e.message,
            serverity: lsp.DiagnosticSeverity.Error,
            range: e.token.tokenType === EOF ? {
                start: content.positionAt(text.length),
                end: content.positionAt(text.length)
            } : {
                start: {
                    line: e.token.startLine - 1,
                    character: e.token.startColumn - 1
                },
                end: {
                    line: e.token.endLine - 1,
                    character: e.token.endColumn
                }
            }
        })));
    }

    if (astErrors.length > 0) {
        errors.push(...astErrors.map((e) => ({
            message: e.message,
            severity: e.serverity,
            range: e.location ? {
                start: {
                    line: e.location.startLine - 1,
                    character: e.location.startColumn - 1
                },
                end: {
                    line: e.location.endLine - 1,
                    character: e.location.endColumn
                }
            } : {
                start: {
                    line: 0,
                    character: 0
                },
                end: {
                    line: 0,
                    character: 0
                }
            }
        })));
    }

    return errors;
}