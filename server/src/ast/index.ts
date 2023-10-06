import { CstNode } from "chevrotain";
import { ASTVisitor } from "./visitor";
import { ptsLexer } from "../lexer";
import { ptsParser } from "../parser";

export function text2ast(text: string, uri?: string)
{
    const lexResult = ptsLexer.tokenize(text);
    ptsParser.input = lexResult.tokens;
    const parseResult = ptsParser.all();
    const astResult = cst2ast(parseResult, { uri });

    return {
        ast: astResult.ast,
        lexErrors: lexResult.errors,
        parseErrors: ptsParser.errors,
        astErrors: astResult.errors
    };
}

function cst2ast(cstNode: CstNode, { uri }) {
    const ast: AST = {
        aliases: new Map(),
        defines: new Map(),
        displayDefineList: null,
        dynamic: {
            collection: {
                macro: [],
                command: []
            },
            offset: null
        },
        freeSpaceByte: null,
        blocks: [],
        state: {
            at: null,
            break: false
        },
        uri
    };

    const errors: PTSError[] = [];
    const astVisitor = new ASTVisitor();
    astVisitor.visit(cstNode, { ast, errors });

    return {
        ast,
        errors
    };
}