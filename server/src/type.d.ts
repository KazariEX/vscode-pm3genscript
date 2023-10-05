import { CstNodeLocation } from "chevrotain";
import { DiagnosticSeverity } from "vscode-languageserver";
import { WordData } from "./data";

declare global {
    interface AST {
        defines: Map<string, number>,
        definelist: boolean,
        dynamic: {
            collection: {
                macro: PTSParam[],
                command: PTSParam[]
            },
            offset: number
        }
        freespace: number,
        blocks: ASTBlock[],
        state: ASTState
    }

    interface ASTState {
        at: ASTBlock,
        break: boolean
    }

    interface ASTBlock extends WithLocation {
        dynamicName?: string,
        offset?: number,
        commands: ASTCommand[]
    }

    interface ASTCommand extends WithLocation {
        cmd: string,
        type: string,
        value?: number,
        params: Array<ASTDynamicParam | ASTLiteralParam>
    }

    interface ASTParam<Style, Value> extends WithLocation {
        style: Style,
        type: string,
        value: Value
    }

    type ASTDynamicParam = ASTParam<"dynamic", string>;
    type ASTLiteralParam = ASTParam<"literal", number>;

    interface ASTMacroHandler {
        (item: PTSSyntax, ast: AST, errors: PTSError[]): void
    }

    interface CompileResult {
        blocks: CompileBlock[],
        dynamics: Map<string, number[][]>
    }

    interface CompileBlock {
        dynamicName?: string,
        offset?: number,
        bytes: number,
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