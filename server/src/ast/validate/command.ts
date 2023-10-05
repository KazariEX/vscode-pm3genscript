import { DiagnosticSeverity } from "vscode-languageserver";
import { getLiteralValue } from ".";

export default function(item: PTSSyntax, ast: AST, errors: PTSError[])
{
    const block = ast.state.at;
    if (block === null) {
        errors.push({
            message: "指令不在任何脚本块内。",
            location: item.location,
            serverity: DiagnosticSeverity.Error
        });
        return;
    }

    block.commands.push({
        cmd: item.cmd,
        type: "command",
        value: item.template.value,
        location: item.location,
        params: item.params.map((param) => {
            let style, value;
            if (param.style === "dynamic") {
                ast.dynamic.collection.command.push(param);
                style = "dynamic";
                value = param.value;
            }
            else {
                style = "literal",
                value = getLiteralValue(param, ast, errors);
            }
            return {
                style,
                type: param.type as string,
                value,
                location: param.location
            };
        })
    });
};