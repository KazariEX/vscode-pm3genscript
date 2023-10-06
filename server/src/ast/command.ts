import { getCurrentBlock, getLiteralValue } from "./utils";

export default function(item: PTSSyntax, ast: AST, errors: PTSError[])
{
    const block = getCurrentBlock(item, ast, errors);
    if (block === null) return;

    block.commands.push({
        cmd: item.cmd,
        type: item.type,
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