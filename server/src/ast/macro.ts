import { getCurrentBlock, getLiteralValue } from ".";

const handlers: {
    [K in keyof any]: (item: PTSSyntax, ast: AST, errors: PTSError[]) => void
} = {
    alias(item, ast, errors)
    {
        const [p1, p2] = item.params;
        ast.aliases.set(p2.value, p1.value);
    },
    braille(item, ast, errors)
    {
        const block = getCurrentBlock(item, ast, errors);
        if (block === null) return;

        block.commands.push({
            cmd: item.cmd,
            type: item.type,
            location: item.location,
            params: item.params.map((param) => {
                return {
                    style: "string",
                    type: "string",
                    value: param.value ,
                    location: param.location
                };
            })
        });
    },
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
        ast.freeSpaceByte = getLiteralValue(p1, ast, errors);
    },
    org(item, ast, errors)
    {
        const [p1] = item.params;
        const block: ASTBlock = {
            commands: [],
            location: item.location
        };

        if (p1.style === "dynamic") {
            ast.dynamic.collection.macro.push(p1);
            block.dynamicName = p1.value;
        }
        else {
            block.offset = getLiteralValue(p1, ast, errors);
        }

        ast.blocks.push(block);
        ast.state.at = block;
    },
    raw(item, ast, errors)
    {
        const block = getCurrentBlock(item, ast, errors);
        if (block === null) return;

        block.commands.push({
            cmd: item.cmd,
            type: item.type,
            location: item.location,
            params: item.params.map((param) => {
                return {
                    style: "literal",
                    type: param.type as string,
                    value: getLiteralValue(param, ast, errors),
                    location: param.location
                };
            })
        });
    },
    unalias(item, ast, errors)
    {
        const [p1] = item.params;
        ast.aliases.delete(p1.value);
    },
    unaliasall(item, ast, errors)
    {
        ast.aliases.clear();
    },
    undefine(item, ast, errors)
    {
        const [p1] = item.params;
        ast.defines.delete(p1.value);
    },
    undefineall(item, ast, errors)
    {
        ast.defines.clear();
    },
    ["="](item, ast, errors)
    {
        const block = getCurrentBlock(item, ast, errors);
        if (block === null) return;

        block.commands.push({
            cmd: item.cmd,
            type: item.type,
            location: item.location,
            params: item.params.map((param) => {
                return {
                    style: "string",
                    type: "string",
                    value: param.value,
                    location: param.location
                };
            })
        });
    }
};

export default function(item: PTSSyntax, ast: AST, errors: PTSError[])
{
    return handlers[item.cmd]?.(item, ast, errors);
};