declare global {
    interface CompileResult {
        blocks: CompileBlock[],
        definelist: boolean,
        dynamic: {
            collection: {
                [T in keyof any]: number[][]
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