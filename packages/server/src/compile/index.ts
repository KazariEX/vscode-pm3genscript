import { text2ast } from "../ast";
import macroCompiler from "./macro";
import commandCompiler from "./command";
import { invertKeyValues } from "./utils";

export function compile(content: string, { gba, uri }: ASTExtra): CompileResult {
    const {
        ast,
        lexErrors,
        parseErrors,
        astErrors
    } = text2ast(content, {
        isReferenced: false,
        gba,
        uri
    });

    if (lexErrors.length + parseErrors.length + astErrors.length === 0) {
        const res: CompileResult = {
            autobank: ast.autobank,
            blocks: [],
            defines: {},
            dynamic: {
                collection: {},
                offset: ast.dynamic.offset
            },
            freeSpaceByte: ast.freeSpaceByte,
            removes: ast.removes
        };

        //反转字符集
        gba.charsets = gba.charsets.map((charset) => {
            return invertKeyValues(charset);
        });

        //显示定义列表
        if (ast.displayDefineList === true) {
            for (const [key, value] of ast.defines.entries()) {
                res.defines[key] = value;
            }
        }

        //按块编译
        res.blocks.push(...ast.blocks.map((item, i) => {
            const block: CompileBlock = {
                dynamicName: item.dynamicName,
                offset: item.offset,
                length: 0,
                data: []
            };

            //脚本块指令
            if (item.commands?.length > 0) {
                block.data.push(...item.commands.map((command, j) => {
                    const data: any = [];

                    if (command.type === "macro") {
                        data.push(macroCompiler(command, ast));
                    }
                    else {
                        data.push(...commandCompiler(command, i, j, res));
                    }
                    return data.flat(1);
                }));
            }

            block.length = block.data.flat(2).length;
            return block;
        }));

        return res;
    }
    else throw new Error("请检查语法错误。");
}