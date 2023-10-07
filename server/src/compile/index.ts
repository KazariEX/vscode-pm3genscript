import { text2ast } from "../ast";
import macroCompiler from "./macro";
import commandCompiler from "./command";

export function compile(content: string, uri?: string): CompileResult
{
    const {
        ast,
        lexErrors,
        parseErrors,
        astErrors
    } = text2ast(content, {
        isReferenced: false,
        uri
    });

    if (lexErrors.length + parseErrors.length + astErrors.length === 0) {
        const res: CompileResult = {
            blocks: [],
            defines: {},
            dynamic: {
                collection: {},
                offset: ast.dynamic.offset
            },
            freeSpaceByte: ast.freeSpaceByte
        };

        if (ast.displayDefineList === true) {
            for (const [key, value] of ast.defines.entries()) {
                res.defines[key] = value;
            }
        }

        res.blocks.push(...ast.blocks.map((item, i) => {
            const block: CompileBlock = {
                dynamicName: item.dynamicName,
                offset: item.offset,
                length: 0,
                data: []
            };

            //编译宏指令


            //编译脚本块指令
            block.data = item.commands.map((command, j) => {
                const data: any = [];

                if (command.type === "macro") {
                    data.push(macroCompiler(command));
                } else {
                    data.push(...commandCompiler(command, i, j, res));
                }
                return data.flat(1);
            });

            block.length = block.data.flat(2).length;
            return block;
        }));

        return res;
    }
    else throw new Error("请检查语法错误。");
}