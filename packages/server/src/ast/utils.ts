import { DiagnosticSeverity } from "vscode-languageserver/node";
import { is } from "../lexer";

//根据模板对参数进行类型校验
export function checkParamType(param: PTSParam, template: any, errors: PTSError[]): boolean {
    if (template === void 0) return true;

    const types = [];
    if (template.enum?.length > 0) {
        return enumLint(param, template.enum, errors);
    }
    else {
        //变量统一为数组
        if (typeof template.type === "string") {
            types.push(template.type);
        }
        else {
            types.push(...template.type);
        }

        //对指针的动态偏移
        if (template.can?.dynamic !== false && types.includes("pointer")) {
            types.push("dynamic");
        }

        //对字面量的定义符号
        if (template.can?.symbol !== false && !types.includes("string") && !types.includes("command")) {
            types.push("symbol");
        }

        return typeLint(param, types, errors);
    }
}

//枚举测试与报错
export function enumLint<T>(param: PTSParam, enums: T[], errors: PTSError[]): boolean {
    const result = enums.includes(param.value as T);

    return result || (errors.push({
        message: "参数不在枚举范围内。",
        location: param.location,
        serverity: DiagnosticSeverity.Error
    }) && false);
}

//类型测试与报错
export function typeLint(param: PTSParam, types: string[], errors: PTSError[]): boolean {
    let result = false;

    types.forEach((type) => {
        result ||= is[type](param.value);
    });

    return result || (errors.push({
        message: "错误的参数类型。",
        location: param.location,
        serverity: DiagnosticSeverity.Error
    }) && false);
}

//获取参数的最终值
export function getLiteralValue(param: PTSParam, ast: AST, errors: PTSError[]): any {
    let res: any;
    switch (param.style) {
        case "dynamic": {
            ast.dynamic.collection.command.push(param);
            res = param.value;
            break;
        }
        case "number": {
            res = Number(param.value);
            break;
        }
        case "string": {
            res = (param.value as string).slice(1, -1);
            break;
        }
        case "symbol": {
            res = ast.defines.get(param.value);
            if (res === void 0) {
                errors.push({
                    message: "未定义的符号。",
                    location: param.location,
                    serverity: DiagnosticSeverity.Error
                });
                return null;
            }
            break;
        }
    }
    return res;
}

//获取当前脚本块
export function getCurrentBlock(item: PTSSyntax, ast: AST, errors: PTSError[]): ASTBlock {
    return ast.state.at || (errors.push({
        message: "指令不在任何脚本块内。",
        location: item.location,
        serverity: DiagnosticSeverity.Error
    }), null);
}

//动态偏移校验
export function validateDynamicOffset(ast: AST, errors: PTSError[]) {
    const { collection } = ast.dynamic;

    if (ast.dynamic.offset === null) {
        [...collection.macro, ...collection.command].forEach((item) => {
            errors.push({
                message: "缺少动态偏移起始地址的定义。",
                location: item.location,
                serverity: DiagnosticSeverity.Error
            });
        });
    }

    const names = new Set<string>();
    collection.macro.forEach((item) => {
        if (names.has(item.value)) {
            errors.push({
                message: `重复的动态偏移名。`,
                location: item.location,
                serverity: DiagnosticSeverity.Error
            });
        }
        else {
            names.add(item.value);
        }
    });

    collection.command.forEach((item) => {
        if (!names.has(item.value)) {
            errors.push({
                message: "未知的动态偏移名。",
                location: item.location,
                serverity: DiagnosticSeverity.Error
            });
        }
    });
}