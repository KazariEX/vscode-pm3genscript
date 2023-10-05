import { CstNode } from "chevrotain";
import { ASTVisitor } from "./visitor";
import { validateDynamicOffset } from "./validate";
import macro from "./validate/macro";
import command from "./validate/command";

export function toAST(cstNode: CstNode)
{
    const errors: PTSError[] = [];
    const astVisitor = new ASTVisitor();
    const base = astVisitor.visit(cstNode, errors);

    //宏提升与全排序
    const sorted = ([...base.macros, ...base.commands] as PTSSyntax[])
    .filter((item) => !item.error)
    .sort((a, b) => {
        if ((a.template.hoisting) === (b.template.hoisting)) {
            return (a.location.startOffset - b.location.startOffset);
        }
        else {
            return a.template.hoisting ? -1 : 1;
        }
    });

    const ast: AST = {
        defines: new Map(),
        definelist: false,
        dynamic: {
            collection: {
                macro: [],
                command: []
            },
            offset: NaN
        },
        freespace: 0xFF,
        blocks: [],
        state: {
            at: null,
            break: false
        }
    };

    //顺序解析剩余脚本
    for (const item of sorted) {
        if (ast.state.break === true) break;
        if (item.type === "macro") {
            macro(item, ast, errors);
        }
        else {
            command(item, ast, errors);
        }
    }

    //动态偏移校验
    validateDynamicOffset(ast, errors);

    return {
        ast,
        errors
    };
}