import { getByteDataByBraille, getByteDataByLiteral, getByteDataByString } from ".";

const handlers: {
    [K in keyof any]: (command: ASTCommand) => any
} = {
    braille(command)
    {
        try {
            return getByteDataByBraille(command.params[0].value as string);
        }
        catch (err) {
            throw new Error(`不在盲文表内的字符，位于行 ${command.location.startLine}。`);
        }
    },
    raw(command)
    {
        return command.params.map((param) => {
            return getByteDataByLiteral(param as ASTLiteralParam);
        });
    },
    ["="](command)
    {
        return getByteDataByString(command.params[0].value as string);
    }
};

export default function(command: ASTCommand)
{
    return handlers[command.cmd]?.(command);
};