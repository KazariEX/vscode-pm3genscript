import { ptsLexer } from "../lexer";
import { ptsParser } from "../parser";
import { toAST } from "../ast/visitor";
import macroCompiler from "./macro";
import commandCompiler from "./command";

export function compile(content: string)
{
    const lexResult = ptsLexer.tokenize(content);
    ptsParser.input = lexResult.tokens;
    const parseResult = ptsParser.all();
    const astResult = toAST(parseResult);

    if (lexResult.errors.length + ptsParser.errors.length + astResult.errors.length === 0) {
        const { ast } = astResult;
        const res: CompileResult = {
            blocks: [],
            definelist: ast.definelist,
            dynamic: {
                collection: {},
                offset: ast.dynamic.offset
            },
            freeSpaceByte: ast.freeSpaceByte
        };

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