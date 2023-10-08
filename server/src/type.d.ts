import { CstNodeLocation } from "chevrotain";
import { DiagnosticSeverity } from "vscode-languageserver";
import { WordData } from "./data";

declare global {
    interface ASTVisitorParams {
        ast?: AST,
        errors?: PTSError[],
        type?: string | string[]
    }

    interface AST {
        aliases: Map<string, string>,
        defines: Map<string, number>,
        autobank: boolean,
        displayDefineList: boolean,
        dynamic: {
            collection: {
                macro: PTSParam[],
                command: PTSParam[]
            },
            offset: number
        }
        freeSpaceByte: number,
        blocks: ASTBlock[],
        state: {
            at: ASTBlock,
            break: boolean
        },
        extra: ASTExtra
    }

    interface ASTBlock extends WithLocation {
        dynamicName?: string,
        offset?: number,
        commands?: ASTCommand[],
        data?: number[]
    }

    interface ASTCommand extends WithLocation {
        cmd: string,
        type: string,
        value?: number,
        params: Array<ASTDynamicParam | ASTLiteralParam | ASTStringParam>
    }

    interface ASTParam<Style, Value> extends WithLocation {
        style: Style,
        type: string,
        value: Value
    }

    interface ASTExtra {
        isReferenced: boolean,
        uri: string
    }

    type ASTDynamicParam = ASTParam<"dynamic", string>;
    type ASTLiteralParam = ASTParam<"literal", number>;
    type ASTStringParam = ASTParam<"string", string>;

    interface CompileOptions {
        uri?: string
    }

    interface CompileResult {
        autobank: boolean,
        blocks: CompileBlock[],
        defines: {
            [x: string]: number
        },
        dynamic: {
            collection: {
                [x: string]: number[][]
            },
            offset: number
        },
        freeSpaceByte: number
    }

    interface CompileBlock {
        dynamicName?: string,
        offset?: number,
        length: number,
        data: number[]
    }

    interface PTSParam extends WithLocation {
        style: ParamType,
        type: string | string[],
        value: string
    }

    interface PTSSyntax extends WithLocation {
        cmd: string,
        type: "macro" | "command",
        template: WordData[any]
        params: PTSParam[],
        error: boolean
    }

    interface PTSError extends WithLocation {
        message: string,
        serverity: DiagnosticSeverity
    }

    interface WithLocation {
        location: CstNodeLocation
    }

    type ParamType = "dynamic" | "literal" | "string" | "symbol";
}