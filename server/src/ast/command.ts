import { getCurrentBlock, getLiteralValue } from "./utils";
import { commands } from "../data";

export default function(item: PTSSyntax, ast: AST, errors: PTSError[])
{
    const block = getCurrentBlock(item, ast, errors);
    if (block === null) return;

    ({
        msgbox,
        giveitem,
        giveitem2,
        giveitem3,
        wildbattle,
        wildbattle2,
        registernav
    }[item.cmd] || $)();

    function $()
    {
        block.commands.push({
            cmd: item.cmd,
            type: item.type,
            value: item.template.value,
            location: item.location,
            params: item.params.map((param) => {
                return paramHandler(param, ast, errors);
            })
        });
    }

    function msgbox()
    {
        const cmd1 = "loadpointer";
        const cmd2 = "callstd";

        block.commands.push({
            cmd: cmd1,
            type: item.type,
            value: commands[cmd1].value,
            location: item.location,
            params: [
                {
                    style: "literal",
                    type: "byte",
                    value: 0x00,
                    location: null
                },
                paramHandler(item.params[0], ast, errors)
            ]
        });

        block.commands.push({
            cmd: cmd2,
            type: item.type,
            value: commands[cmd2].value,
            location: item.location,
            params: [
                paramHandler(item.params[1], ast, errors)
            ]
        });
    }

    function giveitem()
    {
        const cmd1 = "copyvarifnotzero";
        const cmd2 = "copyvarifnotzero";
        const cmd3 = "callstd";

        block.commands.push({
            cmd: cmd1,
            type: item.type,
            value: commands[cmd1].value,
            location: item.location,
            params: [
                {
                    style: "literal",
                    type: "word",
                    value: 0x8000,
                    location: null
                },
                paramHandler(item.params[0], ast, errors)
            ]
        });

        block.commands.push({
            cmd: cmd2,
            type: item.type,
            value: commands[cmd2].value,
            location: item.location,
            params: [
                {
                    style: "literal",
                    type: "word",
                    value: 0x8001,
                    location: null
                },
                paramHandler(item.params[1], ast, errors)
            ]
        });

        block.commands.push({
            cmd: cmd3,
            type: item.type,
            value: commands[cmd3].value,
            location: item.location,
            params: [
                paramHandler(item.params[2], ast, errors)
            ]
        });
    }

    function giveitem2()
    {
        const cmd1 = "copyvarifnotzero";
        const cmd2 = "copyvarifnotzero";
        const cmd3 = "copyvarifnotzero";
        const cmd4 = "callstd";

        block.commands.push({
            cmd: cmd1,
            type: item.type,
            value: commands[cmd1].value,
            location: item.location,
            params: [
                {
                    style: "literal",
                    type: "word",
                    value: 0x8000,
                    location: null
                },
                paramHandler(item.params[0], ast, errors)
            ]
        });

        block.commands.push({
            cmd: cmd2,
            type: item.type,
            value: commands[cmd2].value,
            location: item.location,
            params: [
                {
                    style: "literal",
                    type: "word",
                    value: 0x8001,
                    location: null
                },
                paramHandler(item.params[1], ast, errors)
            ]
        });

        block.commands.push({
            cmd: cmd3,
            type: item.type,
            value: commands[cmd2].value,
            location: item.location,
            params: [
                {
                    style: "literal",
                    type: "word",
                    value: 0x8002,
                    location: null
                },
                paramHandler(item.params[2], ast, errors)
            ]
        });

        block.commands.push({
            cmd: cmd4,
            type: item.type,
            value: commands[cmd4].value,
            location: item.location,
            params: [
                {
                    style: "literal",
                    type: "byte",
                    value: 0x9,
                    location: null
                }
            ]
        });
    }

    function giveitem3()
    {
        const cmd1 = "copyvarifnotzero";
        const cmd2 = "callstd";

        block.commands.push({
            cmd: cmd1,
            type: item.type,
            value: commands[cmd1].value,
            location: item.location,
            params: [
                {
                    style: "literal",
                    type: "word",
                    value: 0x8000,
                    location: null
                },
                paramHandler(item.params[0], ast, errors)
            ]
        });

        block.commands.push({
            cmd: cmd2,
            type: item.type,
            value: commands[cmd2].value,
            location: item.location,
            params: [
                {
                    style: "literal",
                    type: "byte",
                    value: 0x7,
                    location: null
                }
            ]
        });
    }

    function wildbattle()
    {
        const cmd1 = "setwildbattle";
        const cmd2 = "dowildbattle";

        block.commands.push({
            cmd: cmd1,
            type: item.type,
            value: commands[cmd1].value,
            location: item.location,
            params: item.params.map((param) => {
                return paramHandler(param, ast, errors);
            })
        });

        block.commands.push({
            cmd: cmd2,
            type: item.type,
            value: commands[cmd2].value,
            location: item.location,
            params: []
        });
    }

    function wildbattle2()
    {
        const cmd1 = "setwildbattle";
        const cmd2 = "special";
        const cmd3 = "waitstate";

        block.commands.push({
            cmd: cmd1,
            type: item.type,
            value: commands[cmd1].value,
            location: item.location,
            params: [
                paramHandler(item.params[0], ast, errors),
                paramHandler(item.params[1], ast, errors),
                paramHandler(item.params[2], ast, errors)
            ]
        });

        const p = paramHandler(item.params[3], ast, errors);
        block.commands.push({
            cmd: cmd2,
            type: item.type,
            value: commands[cmd2].value,
            location: item.location,
            params: [{
                style: "literal",
                type: "word",
                value: (p.value as number) + 0x137,
                location: p.location
            }]
        });

        block.commands.push({
            cmd: cmd3,
            type: item.type,
            value: commands[cmd3].value,
            location: item.location,
            params: []
        });
    }

    function registernav()
    {
        const cmd1 = "copyvarifnotzero";
        const cmd2 = "callstd";

        block.commands.push({
            cmd: cmd1,
            type: item.type,
            value: commands[cmd1].value,
            location: item.location,
            params: [
                {
                    style: "literal",
                    type: "word",
                    value: 0x8000,
                    location: null
                },
                paramHandler(item.params[0], ast, errors)
            ]
        });

        block.commands.push({
            cmd: cmd2,
            type: item.type,
            value: commands[cmd2].value,
            location: item.location,
            params: [
                {
                    style: "literal",
                    type: "byte",
                    value: 0x8,
                    location: null
                }
            ]
        });
    }
};

function paramHandler(param: PTSParam, ast: AST, errors: PTSError[]): ASTDynamicParam | ASTLiteralParam
{
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
}