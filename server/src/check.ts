import * as lsp from "vscode-languageserver";
import { EOF } from "chevrotain";
import { TextDocument } from "vscode-languageserver-textdocument";
import { ptsLexer } from "./lexer";
import { ptsParser } from "./parser";
import { toAST } from "./ast";
import { PTSError } from "./type";

export function check(content: TextDocument): lsp.Diagnostic[]
{
    const errors: lsp.Diagnostic[] = [];
    const text = content.getText();

    const lexResult = ptsLexer.tokenize(text);
    if (lexResult.errors.length > 0) {
        errors.push(...lexResult.errors.map((e) => ({
            severity: lsp.DiagnosticSeverity.Error,
            message: e.message,
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

    ptsParser.input = lexResult.tokens;
    const parseResult = ptsParser.all();
    if (ptsParser.errors.length > 0) {
        errors.push(...ptsParser.errors.map((e) => ({
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

    const astResult = toAST(parseResult);
    errors.push(...astResult.errors.map((e) => errorTransformer(e, content.uri)));

    return errors;
}

function errorTransformer(e: PTSError, uri: string): lsp.Diagnostic
{
    return {
        message: e.message,
        severity: e.serverity,
        range: {
            start: {
                line: e.location.startLine - 1,
                character: e.location.startColumn - 1
            },
            end: {
                line: e.location.endLine - 1,
                character: e.location.endColumn
            }
        }
    };
}