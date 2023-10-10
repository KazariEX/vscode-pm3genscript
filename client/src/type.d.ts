import { CommandData } from "./data";
import { DecompileBlockType } from "./gba/decompiler";

declare global {
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
        freeSpaceByte: number,
        removes: [t: string, o: number][],
        error?: string
    }

    interface CompileBlock {
        dynamicName?: string,
        offset?: number,
        length: number,
        data: number[]
    }

    interface DecompileResult {
        blocks: {
            [offset: number]: DecompileBlock
        },
        plaintext?: string
    }

    interface DecompileBlock {
        offset: number,
        type: DecompileBlockType,
        raw: number[],
        plaintext?: string
    }

    interface DecompileScriptBlock extends DecompileBlock {
        commands: DecompileCommand[]
    }

    interface DecompileBrailleBlock extends DecompileBlock {
        braille: string
    }

    interface DecompileTextBlock extends DecompileBlock {
        text: string
    }

    interface DecompileCommand {
        cmd: string,
        template: CommandData[any],
        params: number[]
    }
}

export {};