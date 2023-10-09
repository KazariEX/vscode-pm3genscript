import { getByteDataByBraille, getByteDataByLiteral, getByteDataByString } from "./utils";

const handlers: {
    [K in keyof any]: (command: ASTCommand, res: CompileResult) => number[][]
} = {
    braille(command)
    {
        try {
            const str = (command.params[0].value as string).slice(1, -1);
            const data = getByteDataByBraille(str);
            data.push(0xFF);
            return [data];
        }
        catch (char) {
            throw new Error(`字符 "${char}" 不在盲文表内，位于行 ${command.location.startLine}。`);
        }
    },
    raw(command, res)
    {
        return command.params.map((param) => {
            return getByteDataByLiteral(param as ASTLiteralParam, {
                autobank: res.autobank
            });
        });
    },
    reserve(command)
    {
        return [new Array(command.params[0].value as number).fill(0x01)];
    },
    ["="](command)
    {
        try {
            const str = (command.params[0].value as string).slice(1, -1);
            const data = getByteDataByString(str);
            data.push(0xFF);
            return [data];
        }
        catch (char) {
            throw new Error(`字符 "${char}" 不在字符表内，位于行 ${command.location.startLine}。`);
        }
    }
};

export default function(command: ASTCommand, res: CompileResult)
{
    return handlers[command.cmd]?.(command, res);
}