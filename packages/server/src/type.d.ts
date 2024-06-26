import type { CstNodeLocation } from "chevrotain";
import type { DiagnosticSeverity } from "vscode-languageserver";

declare global {
    interface WithLocation {
        location: CstNodeLocation;
    }

    interface ASTVisitorParams {
        ast?: AST;
        errors?: PTSError[];
        type?: string | string[];
    }

    interface AST {
        aliases: Map<string, string>;
        defines: Map<string, number>;
        autobank: boolean;
        displayDefineList: boolean;
        dynamic: {
            collection: {
                macro: PTSParam[];
                command: PTSParam[];
            };
            offset: number;
        };
        freeSpaceByte: number;
        blocks: ASTBlock[];
        state: {
            at: ASTBlock;
            break: boolean;
        };
        removes: [t: string, o: number][];
        extra: ASTExtra;
    }

    interface ASTBlock extends WithLocation {
        dynamicName?: string;
        offset?: number;
        commands?: ASTCommand[];
    }

    interface ASTCommand extends WithLocation {
        cmd: string;
        type: string;
        value?: number;
        params: Array<ASTDynamicParam | ASTNumberParam | ASTStringParam>;
    }

    interface ASTParam<Style, Value> extends WithLocation {
        style: Style;
        type: string;
        value: Value;
    }

    interface ASTExtra {
        isReferenced?: boolean;
        uri?: string;
        gba?: any;
    }

    type ASTDynamicParam = ASTParam<"dynamic", string>;
    type ASTNumberParam = ASTParam<"number", number>;
    type ASTStringParam = ASTParam<"string", string>;

    interface CompileOptions {
        uri?: string;
    }

    interface CompileResult {
        autobank: boolean;
        blocks: CompileBlock[];
        defines: {
            [x: string]: number;
        };
        dynamic: {
            collection: {
                [x: string]: number[][];
            };
            offset: number;
        };
        freeSpaceByte: number;
        removes: [t: string, o: number][];
    }

    interface CompileBlock {
        dynamicName?: string;
        offset?: number;
        length: number;
        data: number[];
    }

    type ParamType = "dynamic" | "number" | "string" | "symbol";
    interface PTSParam extends WithLocation {
        style: ParamType;
        type: string | string[];
        value: any;
    }

    interface PTSSyntax extends WithLocation {
        cmd: string;
        type: "macro" | "command";
        template: any;
        params: PTSParam[];
        error: boolean;
    }

    interface PTSError extends WithLocation {
        message: string;
        serverity: DiagnosticSeverity;
    }
}