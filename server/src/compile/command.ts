import { getByteDataByLiteral } from "./utils";

export default function(command: ASTCommand, i: number, j: number, res: CompileResult)
{
    const { collection } = res.dynamic;

    return [command.value, command.params.map((param, k) => {
        if (param.style === "dynamic") {
            //记录动态偏移参数位置
            if (!Reflect.has(collection, param.value)) {
                collection[param.value] = [];
            }
            collection[param.value].push([i, j, k + 1]);
            return [ 0, 0, 0, 0 ];
        }
        else {
            return getByteDataByLiteral(param as ASTLiteralParam, {
                autobank: res.autobank
            });
        }
    })];
}