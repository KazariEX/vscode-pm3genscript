import { createToken, CustomPatternMatcherFunc, Lexer } from "chevrotain";

//宏模式
const macro = createToken({ name: "macro", pattern: /(#[a-z]+|=)/, push_mode: "macro" });

//RAW模式
const raw = createToken({ name: "raw", pattern: /#(raw|binary|put)/, push_mode: "raw" });
const raw_type = createToken({ name: "raw-type", pattern: /[^\s\r\n]+/ });

//指令
const command = createToken({ name: "command", pattern: /\b[a-z][a-z0-9_]*\b/ });

//定义符号
const symbol = createToken({ name: "symbol", pattern: /\b[A-Z_][A-Z0-9_]*\b/ });

//动态偏移
const dynamic = createToken({ name: "dynamic", pattern: /@\w+\b/ });

//字面量
const literal = createToken({ name: "literal", pattern: /\b(0x[0-9A-Fa-f]+)|([0-9]+)\b/ });

//字符串
const string = createToken({
    name: "string",
    pattern: (text, offset) => {
        const start = offset;
        if (text[start] !== "\"") {
            return null;
        }

        let end = text.length;
        let escape = false;
        for (let i = start + 1; i < text.length; i++) {
            if (escape) {
                escape = false;
            }
            else if (text[i] === "\\") {
                escape = true;
            }
            else if (text[i] === "\"") {
                end = i + 1;
                break;
            }
        }

        if (text[end - 1] === "\"" && escape === false) {
            return [text.slice(start, end)];
        }
        else return null;
    },
    start_chars_hint: ["\""], line_breaks: false
});

//换行
const pop_endline = createToken({ name: "endline", pattern: /\r\n|\r|\n/, line_breaks: true, pop_mode: true });

//空格
const whitespace = createToken({
    name: "whitespace",
    pattern: /\s+/,
    group: Lexer.SKIPPED
});

export const tokenTypes = {
    macro,
    raw,
    raw_type,
    command,
    symbol,
    dynamic,
    literal,
    string,
    pop_endline,
    whitespace
};

export const ptsLexer = new Lexer({
    modes: {
        main: [raw, macro, command, symbol, dynamic, literal, string, whitespace],
        macro: [command, symbol, dynamic, literal, string, pop_endline, whitespace],
        raw: [symbol, literal, raw_type, pop_endline, whitespace]
    },
    defaultMode: "main"
});

//类型判断
export const is: {
    [K in keyof any]: (str: string) => boolean
} = {
    byte(str)
    {
        return is.literal(str) && Number(str) <= 0xFF;
    },
    word(str)
    {
        return is.literal(str) && Number(str) <= 0xFFFF;
    },
    dword(str)
    {
        return is.literal(str) && Number(str) <= 0xFFFFFFFF;
    },
    pointer(str)
    {
        return is.dword(str);
    },
    symbol(str)
    {
        return (symbol.PATTERN as RegExp).test(str);
    },
    dynamic(str)
    {
        return (dynamic.PATTERN as RegExp).test(str);
    },
    literal(str)
    {
        return (literal.PATTERN as RegExp).test(str);
    },
    string(str)
    {
        return (string.PATTERN as any)(str, 0);
    }
};