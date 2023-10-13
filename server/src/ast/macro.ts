import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import { DiagnosticSeverity } from "vscode-languageserver";
import { getCurrentBlock, getLiteralValue } from "./utils";
import { text2ast } from ".";

const handlers: {
    [K in keyof any]: (item: PTSSyntax, options: { ast: AST, errors: PTSError[] }) => void
} = {
    alias(item, { ast })
    {
        const [p1, p2] = item.params;
        ast.aliases.set(p2.value, p1.value);
    },
    autobank(item, { ast })
    {
        const [p1] = item.params;
        ast.autobank = (p1.value === "off") ? false : true;
    },
    braille(item, { ast, errors })
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
    },
    break(item, { ast })
    {
        ast.state.break = true;
    },
    define(item, { ast })
    {
        const [p1, p2] = item.params;
        ast.defines.set(p1.value, Number(p2.value));
    },
    definelist(item, { ast })
    {
        ast.displayDefineList = true;
    },
    dynamic(item, { ast, errors })
    {
        const [p1] = item.params;
        ast.dynamic.offset = getLiteralValue(p1, ast, errors);
    },
    erase(item, { ast, errors })
    {
        const [p1, p2] = item.params;
        const block: ASTBlock = {
            location: item.location
        };

        block.offset = getLiteralValue(p1, ast, errors);
        const length = getLiteralValue(p2, ast, errors);
        if (length > 0) {
            const freeSpaceByte = ast.freeSpaceByte ?? 0xFF;
            block.data = new Array(length).fill(freeSpaceByte);

            ast.blocks.push(block);
        }
    },
    eraserange(item, { ast, errors })
    {
        const [p1, p2] = item.params;
        const block: ASTBlock = {
            location: item.location
        };

        block.offset = getLiteralValue(p1, ast, errors);
        const length = getLiteralValue(p2, ast, errors) - block.offset;
        if (length > 0) {
            const freeSpaceByte = ast.freeSpaceByte ?? 0xFF;
            block.data = new Array(length).fill(freeSpaceByte);

            ast.blocks.push(block);
        }
    },
    freespace(item, { ast, errors })
    {
        const [p1] = item.params;
        ast.freeSpaceByte = getLiteralValue(p1, ast, errors);
    },
    include(item, { ast, errors })
    {
        const [p1] = item.params;
        try {
            let base = ast.extra.uri;
            let target = p1.value.slice(1, -1);

            //相对路径
            if (!path.isAbsolute(target)) {
                if (base.startsWith("file:///")) {
                    base = url.fileURLToPath(base);
                }
                target = path.join(path.dirname(base), target);
            }

            if (base !== target) {
                const file = fs.readFileSync(target);
                const text = file.toString();

                const {
                    ast: subAst,
                    lexErrors,
                    parseErrors,
                    astErrors
                } = text2ast(text, {
                    isReferenced: true,
                    uri: target
                });

                if (lexErrors.length + parseErrors.length + astErrors.length === 0) {
                    //合并提升宏
                    ast.aliases = new Map([...ast.aliases, ...subAst.aliases]);
                    ast.defines = new Map([...ast.defines, ...subAst.defines]);
                    if (subAst.autobank !== null) {
                        ast.autobank = subAst.autobank;
                    }
                    if (subAst.displayDefineList !== null) {
                        ast.displayDefineList = subAst.displayDefineList;
                    }
                    if (subAst.dynamic.offset !== null) {
                        ast.dynamic.offset = subAst.dynamic.offset;
                    }
                    if (subAst.freeSpaceByte !== null) {
                        ast.freeSpaceByte = subAst.freeSpaceByte;
                    }
                }
                else {
                    errors.push({
                        message: "包含的文件存在语法错误。",
                        location: p1.location,
                        serverity: DiagnosticSeverity.Error
                    });
                }
            }
            else {
                errors.push({
                    message: "文件包含自身。",
                    location: p1.location,
                    serverity: DiagnosticSeverity.Error
                });
            }
        }
        catch (err) {
            errors.push({
                message: "找不到文件。",
                location: p1.location,
                serverity: DiagnosticSeverity.Error
            });
        }
    },
    org(item, { ast, errors })
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
    raw(item, { ast, errors })
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
    remove(item, { ast, errors })
    {
        const [p1] = item.params;
        ast.removes.push(["script", getLiteralValue(p1, ast, errors)]);
    },
    removeall(item, { ast, errors })
    {
        const [p1] = item.params;
        ast.removes.push(["all", getLiteralValue(p1, ast, errors)]);
    },
    removemart(item, { ast, errors })
    {
        const [p1] = item.params;
        ast.removes.push(["raw_mart", getLiteralValue(p1, ast, errors)]);
    },
    removemove(item, { ast, errors })
    {
        const [p1] = item.params;
        ast.removes.push(["raw_move", getLiteralValue(p1, ast, errors)]);
    },
    removestring(item, { ast, errors })
    {
        const [p1] = item.params;
        ast.removes.push(["string", getLiteralValue(p1, ast, errors)]);
    },
    reserve(item, { ast, errors })
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
    unalias(item, { ast })
    {
        const [p1] = item.params;
        ast.aliases.delete(p1.value);
    },
    unaliasall(item, { ast })
    {
        ast.aliases.clear();
    },
    undefine(item, { ast })
    {
        const [p1] = item.params;
        ast.defines.delete(p1.value);
    },
    undefineall(item, { ast })
    {
        ast.defines.clear();
    },
    ["="](item, { ast, errors })
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
    return handlers[item.cmd]?.(item, { ast, errors });
}