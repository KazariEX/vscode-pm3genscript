import { DiagnosticSeverity } from "vscode-languageserver";
import { CstChildrenDictionary, IToken, CstNode, ICstVisitor, CstNodeLocation } from "chevrotain";
import { BasePTSVisitor } from "./parser";
import { PTSError, PTSParam, PTSSyntax } from "./type";
import { all, rawTypes } from "./data";

class ASTVisitor extends BasePTSVisitor implements ICstVisitor<PTSError[], any> {
    constructor()
    {
        super();
        this.validateVisitor();
    }

    All(ctx: CstChildrenDictionary, errors: PTSError[])
    {
        const mode = (visitor: string) => {
            if (visitor in ctx) {
                return ctx[visitor].map((item) => this.visit(item as CstNode, errors));
            }
            else return [];
        }

        const res = {
            macro: [ ...mode("Macro"), ...mode("Raw") ],
            command: mode("Command"),
            equal: mode("Equal")
        };

        return res;
    }

    //编译器宏
    Macro(ctx, errors: PTSError[]): PTSSyntax
    {
        const token = ctx.macro[0];
        let cmd = token.image.substring(1);
        const location = getLocationFromToken(token);
        const params = [];

        if (cmd in all) {
            //重定向
            const { redirect } = all[cmd];
            if (redirect in all) {
                cmd = redirect;
            }

            const count = all[cmd].params?.length || 0;
            for (let i = 0; i < count; i++) {
                const p = this.visit(ctx.Param?.[i]);
                if (p !== void(0)) {
                    params.push(p);
                }
            }
            checkParamsCount("#" + cmd, location, params, count, errors);
        }

        return {
            cmd,
            type: token.tokenType.name,
            location,
            params
        };
    }

    //指令
    Command(ctx, errors: PTSError[]): PTSSyntax
    {
        const token = ctx.command[0];
        const cmd = token.image;
        const location = getLocationFromToken(token);
        const params = [];

        if (cmd in all) {
            const count = all[cmd].params?.length || 0;
            for (let i = 0; i < count; i++) {
                const p = this.visit(ctx.Param?.[i]);
                if (p !== void(0)) {
                    params.push(p);
                }
            }
            checkParamsCount(cmd, location, params, count, errors);
        }

        return {
            cmd,
            type: token.tokenType.name,
            location,
            params
        };
    }

    //参数
    Param(ctx, errors: PTSError[]): PTSParam
    {
        for (const key of [
            "constant",
            "dynamic",
            "literal",
            "string"
        ]) {
            if (key in ctx) {
                const token = ctx[key][0];
                return {
                    style: key,
                    value: token.image,
                    location: getLocationFromToken(token)
                };
            }
        }
    }

    //RAW模式
    Raw(ctx, errors: PTSError[]): PTSSyntax
    {
        const token = ctx.raw[0];
        const cmd = token.image;
        const location = getLocationFromToken(token);
        const params = [];

        //对所有参数进行排序
        const sorted = propsToSortedArray(ctx, ["define", "literal", "raw-type"]);

        //参数类型检查
        let lastType = "";

        for (let i = 0; i < sorted.length; i++) {
            const item = sorted[i];
            const tokenType = item.tokenType.name;

            if (tokenType === "raw-type") {
                checkLastRawType(lastType, sorted[i - 1], errors);

                if (rawTypes.list.includes(item.image)) {
                    lastType = item.image;
                }
                else {
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
                    type = lastType;
                    lastType = "";
                }
                params.push({
                    style: item.tokenType.name,
                    type,
                    value: item.image,
                    location: getLocationFromToken(item)
                });
            }
        }
        //最后一个参数的检查
        checkLastRawType(lastType, sorted.at(-1), errors);

        return {
            cmd,
            type: token.tokenType.name,
            location,
            params
        }
    }

    //文本模式
    Equal(ctx, errors: PTSError[]): PTSSyntax
    {
        const token = ctx.equal[0];
        const cmd = token.image;
        const location = getLocationFromToken(token);
        const params = [ ctx.string?.[0] ];

        return {
            cmd,
            type: token.tokenType.name,
            location,
            params
        };
    }
}

const astVisitor = new ASTVisitor();

export function toAST(cstNode: CstNode)
{
    const errors: PTSError[] = [];
    const ast = astVisitor.visit(cstNode, errors);
    return {
        ast,
        errors
    };
}

//从token中获取位置信息
function getLocationFromToken(token: IToken): CstNodeLocation
{
    const { startColumn, startLine, startOffset, endColumn, endLine, endOffset } = token;
	return { startColumn, startLine, startOffset, endColumn, endLine, endOffset };
}

//检查参数数量
function checkParamsCount(command: string, location: CstNodeLocation, params: Array<any>, count: number, errors: PTSError[])
{
    if (params.length < count) {
        errors.push({
            message: `指令 ${command} 需要 ${count} 个参数，但只提供了 ${params.length} 个。`,
            location,
            serverity: DiagnosticSeverity.Error
        });
    }
}

//检查raw的参数类型
function checkLastRawType(type: string, token: IToken, errors: PTSError[])
{
    if (type !== "") {
        errors.push({
            message: `该数据类型未分配给任何值。`,
            location: getLocationFromToken(token),
            serverity: DiagnosticSeverity.Error
        });
    }
}

//将对象指定属性值的数组集合并成一个排序数组
function propsToSortedArray(obj: object, props: string[]): IToken[]
{
    const arr = [];
    props.forEach((prop) => {
        if (prop in obj) {
            arr.push(...obj[prop]);
        }
    });

    return arr.sort((a, b) => {
        return a.startOffset - b.startOffset;
    });
}