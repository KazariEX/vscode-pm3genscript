import { ptsLexer } from "./lexer";
import { ptsParser } from "./parser";
import { toAST } from "./ast";

export function compile(content: string)
{
    const lexResult = ptsLexer.tokenize(content);
    ptsParser.input = lexResult.tokens;
    const parseResult = ptsParser.all();
    const astResult = toAST(parseResult);

    const res: CompileResult = {
        blocks: [],
        dynamics: new Map()
    };

    if (lexResult.errors.length + ptsParser.errors.length + astResult.errors.length === 0) {
        const { ast } = astResult;
        res.blocks.push(...ast.blocks.map((item) => {
            const block: CompileBlock = {
                dynamicName: item.dynamicName,
                offset: item.offset,
                bytes: 0,
                data: []
            };

            //编译所有指令
            block.data = item.commands.map((command) => {
                return [command.value, command.params.map((param) => {
                    if (param.style === "dynamic") {
                        const data = [0, 0, 0, 0];
                        if (!res.dynamics.has(param.value)) {
                            res.dynamics.set(param.value, []);
                        }
                        res.dynamics.get(param.value).push(data);
                        return data;
                    }
                    else {
                        return getBytedData(param);
                    }
                })];
            }).flat(2)/* 保留一层二级数组，用于控制所有动态偏移 */ as any;

            block.bytes = block.data.flat(1).length;
            return block;
        }));

        return res;
    }
    else throw new Error();
}

//根据类型获取字节数组
function getBytedData(param: ASTLiteralParam): number[]
{
    const res = [];
    const fn = (value: number) => (res.unshift(value % 0x100), value >> 8);

    const { type } = param;
    let { value } = param;

    if (type === "pointer") {
        if (value < 0x2000000) value += 0x8000000;
        for (let i = 0; i < 4; i++, value >>= 8) {
            res.push(value % 0x100);
        }
    }
    else switch (type) {
        case "dword":
            value = fn(value);
            value = fn(value);
        case "word":
            value = fn(value);
        case "byte":
            value = fn(value);
    }

    return res;
}