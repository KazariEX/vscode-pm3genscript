import { DiagnosticSeverity } from "vscode-languageserver";
import { getLiteralValue } from ".";

const macro: {
    [K in keyof any]: (item: PTSSyntax, ast: AST, errors: PTSError[]) => void
} = {
    break(item, ast, errors)
    {
        ast.state.break = true;
    },
    define(item, ast, errors)
    {
        const [p1, p2] = item.params;
        ast.defines.set(p1.value, Number(p2.value));
    },
    definelist(item, ast, errors)
    {
        ast.definelist = true;
    },
    dynamic(item, ast, errors)
    {
        const [p1] = item.params;
        ast.dynamic.offset = getLiteralValue(p1, ast, errors);
    },
    freespace(item, ast, errors)
    {
        const [p1] = item.params;
        ast.freespace = getLiteralValue(p1, ast, errors);
    },
    org(item, ast, errors)
    {
        const [p1] = item.params;
        const script: ASTBlock = {
            commands: [],
            location: item.location
        };

        if (p1.style === "dynamic") {
            ast.dynamic.collection.macro.push(p1);
            script.dynamicName = p1.value;
        }
        else {
            script.offset = getLiteralValue(p1, ast, errors);
        }

        ast.blocks.push(script);
        ast.state.at = script;
    },
    undefine(item, ast, errors)
    {
        const [p1] = item.params;
        ast.defines.delete(p1.value);
    },
    undefineall(item, ast, errors)
    {
        ast.defines.clear();
    }
};

export default function(item: PTSSyntax, ast: AST, errors: PTSError[])
{
    return macro[item.cmd]?.(item, ast, errors);
};