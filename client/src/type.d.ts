declare global {
    interface CompileResult {
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
        error?: string
    }

    interface CompileBlock {
        dynamicName?: string,
        offset?: number,
        length: number,
        data: number[]
    }
}

export {};