import { getByteDataByBraille, getByteDataByLiteral, getByteDataByString } from "./utils";

const handlers: {
    [K in keyof any]: (command: ASTCommand, res: CompileResult) => number[][]
} = {
    braille(command)
    {
        const str = (command.params[0].value as string).slice(1, -1);
        const data = getByteDataByBraille(str);
        data.push(0xFF);
        try {
            return [data];
        }
        catch (err) {
            throw new Error(`不在盲文表内的字符，位于行 ${command.location.startLine}。`);
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
        const str = (command.params[0].value as string).slice(1, -1);
        const data = getByteDataByString(str);
        data.push(0x02);
        return [data];
    }
};

export default function(command: ASTCommand, res: CompileResult)
{
    return handlers[command.cmd]?.(command, res);
};