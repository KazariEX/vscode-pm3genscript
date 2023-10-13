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
                return paramHandler(param);
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
                paramHandler(item.params[0])
            ]
        });

        block.commands.push({
            cmd: cmd2,
            type: item.type,
            value: commands[cmd2].value,
            location: item.location,
            params: [
                paramHandler(item.params[1])
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
                paramHandler(item.params[0])
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
                paramHandler(item.params[1])
            ]
        });

        block.commands.push({
            cmd: cmd3,
            type: item.type,
            value: commands[cmd3].value,
            location: item.location,
            params: [
                paramHandler(item.params[2])
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
                paramHandler(item.params[0])
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
                paramHandler(item.params[1])
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
                paramHandler(item.params[2])
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
                paramHandler(item.params[0])
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
                return paramHandler(param);
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
                paramHandler(item.params[0]),
                paramHandler(item.params[1]),
                paramHandler(item.params[2])
            ]
        });

        const p = paramHandler(item.params[3]);
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
                paramHandler(item.params[0])
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
}

function paramHandler(param: PTSParam): ASTDynamicParam | ASTLiteralParam
{
    return {
        style: param.style === "dynamic" ? "dynamic" : "literal",
        type: param.type as string,
        value: param.value,
        location: param.location
    };
}