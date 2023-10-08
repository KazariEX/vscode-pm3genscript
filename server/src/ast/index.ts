import { CstNode } from "chevrotain";
import { ASTVisitor } from "./visitor";
import { ptsLexer } from "../lexer";
import { ptsParser } from "../parser";

export function text2ast(text: string, extra: ASTExtra)
{
    const lexResult = ptsLexer.tokenize(text);
    ptsParser.input = lexResult.tokens;
    const parseResult = ptsParser.all();
    const astResult = cst2ast(parseResult, extra);

    return {
        ast: astResult.ast,
        lexErrors: lexResult.errors,
        parseErrors: ptsParser.errors,
        astErrors: astResult.errors
    };
}

function cst2ast(cstNode: CstNode, extra: ASTExtra)
{
    const ast: AST = {
        aliases: new Map(),
        defines: new Map(),
        autobank: null,
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
        extra
    };

    const errors: PTSError[] = [];
    const astVisitor = new ASTVisitor();
    astVisitor.visit(cstNode, { ast, errors });

    return {
        ast,
        errors
    };
}