export class Pointer {
    #offset: number;

    constructor(offset: number | string) {
        this.assign(offset);
    }

    get value() {
        return this.#offset;
    }

    set value(v) {
        this.assign(v);
    }

    get invalid() {
        return Number.isNaN(this.#offset);
    }

    private assign(offset: number | string) {
        if (typeof offset === "string") {
            offset = Number(offset);
        }

        if (!Number.isNaN(offset) && offset >= 0) {
            if (offset >= 0x8000000) {
                offset -= 0x8000000;
            }
            this.#offset = offset;
        }
        else {
            this.#offset = Number.NaN;
        }
    }

    toByteArray(autobank: boolean): number[] {
        autobank ??= true;
        let offset = this.#offset;
        if (autobank) offset += 0x8000000;

        const res = [];
        for (let i = 0; i < 4; i++, offset >>= 8) {
            res.push(offset % 0x100);
        }
        return res;
    }

    toString() {
        return `0x${this.#offset.toString(16).toUpperCase()}`;
    }

    static equal(a: number | string, b: number | string): boolean {
        return new Pointer(a).value === new Pointer(b).value;
    }
}