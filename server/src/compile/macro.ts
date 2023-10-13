import { getByteDataByBraille, getByteDataByLiteral, getByteDataByString } from "./utils";

const handlers: {
    [K in keyof any]: (command: ASTCommand, ast: AST) => number[][]
} = {
    braille(command)
    {
        try {
            const str = (command.params[0].value as string);
            const data = getByteDataByBraille(str);
            data.push(0xFF);
            return [data];
        }
        catch (char) {
            throw new Error(`字符 "${char}" 不在盲文表内，位于行 ${command.location.startLine}。`);
        }
    },
    raw(command, ast)
    {
        return command.params.map((param) => {
            return getByteDataByLiteral(param as ASTLiteralParam, {
                autobank: ast.autobank
            });
        });
    },
    reserve(command)
    {
        return [new Array(command.params[0].value as number).fill(0x01)];
    },
    ["="](command, ast)
    {
        try {
            const str = (command.params[0].value as string);
            const data = getByteDataByString(str, ast.extra.gba.charsets);
            data.push(0xFF);
            return [data];
        }
        catch (char) {
            throw new Error(`字符 "${char}" 不在字符表内，位于行 ${command.location.startLine}。`);
        }
    }
};

export default function(command: ASTCommand, ast: AST)
{
    return handlers[command.cmd]?.(command, ast);
}