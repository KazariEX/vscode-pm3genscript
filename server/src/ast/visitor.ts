import { IToken, CstNode, CstNodeLocation } from "chevrotain";
import { DiagnosticSeverity } from "vscode-languageserver";
import { BasePTSVisitor } from "../parser";
import { typelint, validate, validateDynamicOffset } from "./utils";
import macroHandler from "./macro";
import commandHandler from "./command";
import { macros, commands, rawTypes } from "../data";

export class ASTVisitor extends BasePTSVisitor {
    constructor()
    {
        super();
        this.validateVisitor();
    }

    //全量处理
    All(ctx, { ast, errors }: ASTVisitorParams)
    {
        const mode = (visitor: string) => ctx[visitor]?.map((item) => this.visit(item, { ast, errors })) || [];
        const syntaxes: PTSSyntax[] = [];

        /* ------------------------------------------------------------ */
        syntaxes.push(...mode("Macro"));

        //宏提升
        for (let i = 0; i < syntaxes.length; i++) {
            const item = syntaxes[i];
            if (item.error) {
                syntaxes.splice(i--, 1);
            }
            else if (item.template.hoisting) {
                macroHandler(item, ast, errors);
                syntaxes.splice(i--, 1);
            }
        }

        syntaxes.push(...mode("Raw"), ...mode("Command"), ...mode("If0"));
        /* ------------------------------------------------------------ */

        //全排序
        const sorted = syntaxes
        .filter((item) => !item.error)
        .sort((a, b) => a.location.startOffset - b.location.startOffset);

        //顺序解析剩余脚本
        for (const item of sorted) {
            if (ast.state.break === true) break;
            if (item.type === "macro") {
                macroHandler(item, ast, errors);
            }
            else {
                commandHandler(item, ast, errors);
            }
        }

        //动态偏移校验
        validateDynamicOffset(ast, errors);
    }

    //编译器宏
    Macro(ctx, { errors }: ASTVisitorParams): PTSSyntax
    {
        const token = ctx.macro[0];
        const result: PTSSyntax = {
            cmd: token.image,
            type: "macro",
            template: null,
            location: getLocationFromToken(token),
            params: [],
            error: false
        };

        if (result.cmd.startsWith("#")) {
            result.cmd = result.cmd.substring(1);
        }

        if (result.cmd in macros) {
            //重定向
            const { redirect } = macros[result.cmd];
            if (redirect in macros) {
                result.cmd = redirect;
            }

            //语法模板
            result.template = macros[result.cmd];

            //所需参数
            const needs = result.template.params;
            const count = needs?.length || 0;

            //实际参数
            ctx.MacroParam?.forEach((item: CstNode, i: number) => {
                const p = this.visit(item, { type: needs?.[i]?.type });
                result.params.push(p);
            });

            //参数数量检测
            result.error ||= !checkParamsCount(result, count, errors);

            //参数类型校验
            result.error ||= !validate(result, errors);
        }
        else {
            result.error = true;
            errors.push({
                message: `未知的宏。`,
                location: result.location,
                serverity: DiagnosticSeverity.Error
            });
        }

        return result;
    }

    //RAW模式
    Raw(ctx, { errors }: ASTVisitorParams): PTSSyntax
    {
        const token = ctx.raw[0];
        const result: PTSSyntax = {
            cmd: "raw",
            type: "macro",
            template: macros["raw"],
            location: getLocationFromToken(token),
            params: [],
            error: false
        };

        //对所有参数进行排序
        const sorted = (() => {
            const arr = [];
            ["literal", "symbol", "raw-type"].forEach((prop) => {
                if (prop in ctx) {
                    arr.push(...ctx[prop]);
                }
            });
            return arr.sort((a, b) => {
                return a.startOffset - b.startOffset;
            });
        })();

        //数据类型检查
        let lastType = "";

        for (let i = 0; i < sorted.length; i++) {
            const item = sorted[i];
            const tokenType = item.tokenType.name;

            if (tokenType === "raw-type") {
                result.error ||= !checkLastRawType(lastType, sorted[i - 1], errors);

                if (rawTypes.includes(item.image)) {
                    lastType = item.image;
                }
                else {
                    result.error = true;
                    errors.push({
                        message: `无效的数据类型。`,
                        location: getLocationFromToken(item),
                        serverity: DiagnosticSeverity.Error
                    });
                }
            }
            else {
                let type = "byte";
                if (lastType !== "") {
                    type = transformRawType(lastType);
                    lastType = "";
                }
                result.params.push({
                    style: item.tokenType.name,
                    type,
                    value: item.image,
                    location: getLocationFromToken(item)
                });
            }
        }
        //最后一个数据类型的检查
        result.error ||= !checkLastRawType(lastType, sorted.at(-1), errors);

        //参数类型校验
        result.error ||= !result.params.reduce((res, p) => {
            return typelint(p, [(p.type as string), "symbol"], errors) && res;
        }, true);

        return result;
    }

    //指令
    Command(ctx, { ast, errors }: ASTVisitorParams): PTSSyntax
    {
        const token = ctx.command[0];
        const result: PTSSyntax = {
            cmd: token.image,
            type: "command",
            template: null,
            location: getLocationFromToken(token),
            params: [],
            error: false
        };

        //别名替换
        if (ast.aliases.has(result.cmd)) {
            result.cmd = ast.aliases.get(result.cmd);
        }

        if (result.cmd in commands) {
            //语法模板
            result.template = commands[result.cmd];

            //所需参数
            const needs = commands[result.cmd].params;
            const count = needs?.length || 0;

            //实际参数
            ctx.Param?.forEach((item: CstNode, i: number) => {
                const p = this.visit(item, { type: needs?.[i]?.type });
                result.params.push(p);
            });

            //参数数量检测
            result.error ||= !checkParamsCount(result, count, errors);

            //参数类型校验
            result.error ||= !validate(result, errors);
        }
        else {
            result.error = true;
            errors.push({
                message: `未知的指令。`,
                location: result.location,
                serverity: DiagnosticSeverity.Error
            });
        }

        return result;
    }

    //[if]语法糖
    If0(ctx, { ast, errors }: ASTVisitorParams)
    {
        const cmd = ctx.if0[0];
        const subcmd = ctx.command?.[0];
        if (subcmd !== void(0)) {
            const { image } = subcmd;
            cmd.image = {
                "goto": "if1",
                "call": "if2"
            }[image];
        }
        return this.Command({
            command: [ cmd ],
            Param: ctx.Param
        }, { ast, errors });
    }

    //宏参数
    get MacroParam() { return this.Param; }

    //参数
    Param(ctx, { type }: ASTVisitorParams): PTSParam
    {
        for (const key in ctx) {
            const token = ctx[key][0];
            return {
                style: key as ParamType,
                type,
                value: token.image,
                location: getLocationFromToken(token)
            };
        }
    }
}

//从token中获取位置信息
function getLocationFromToken(token: IToken): CstNodeLocation
{
    const { startColumn, startLine, startOffset, endColumn, endLine, endOffset } = token;
	return { startColumn, startLine, startOffset, endColumn, endLine, endOffset };
}

//检查参数的数量
function checkParamsCount({
    cmd,
    location,
    params
}: PTSSyntax, count: number, errors: PTSError[]): boolean
{
    if (params.length === count) {
        return true;
    }
    else if (params.length < count) {
        errors.push({
            message: `指令 ${cmd} 需要 ${params.length} / ${count} 个参数。`,
            location,
            serverity: DiagnosticSeverity.Error
        });
    }
    else {
        const start = params[count].location;
        const end = params.at(-1).location;

        errors.push({
            message: "额外的参数。",
            location: {
                startOffset: start.startOffset,
                startLine: start.startLine,
                startColumn: start.startColumn,
                endOffset: end.endOffset,
                endLine: end.endLine,
                endColumn: end.endColumn
            },
            serverity: DiagnosticSeverity.Error
        })
    }
    return false;
}

//检查raw的参数类型
function checkLastRawType(type: string, token: IToken, errors: PTSError[]): boolean
{
    if (type !== "") {
        errors.push({
            message: `该数据类型未分配给任何值。`,
            location: getLocationFromToken(token),
            serverity: DiagnosticSeverity.Error
        });
        return false;
    }
    return true;
}

//从别名转换raw的参数类型
function transformRawType(type: string): string
{
    if (["b", "char"].includes(type)) return "byte";
    else if (["i", "int", "integer"].includes(type)) return "word";
    else if (["l", "long"].includes(type)) return "dword";
    else if (["p", "ptr"].includes(type)) return "pointer";
    else return type;
}