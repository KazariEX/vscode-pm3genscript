import { createToken, Lexer } from "chevrotain";

//宏模式
const macro = createToken({ name: "macro", pattern: /(#[a-z]+|=)/, push_mode: "macro" });

//RAW模式
const raw = createToken({ name: "raw", pattern: /#(raw|binary|put)/, push_mode: "raw" });
const raw_type = createToken({ name: "raw-type", pattern: /[^\s\r\n]+/ });

//指令
const command = createToken({ name: "command", pattern: /\b[a-z][a-z0-9_]*\b/ });
const if0 = createToken({ name: "if0", pattern: /\bif\b/ });

//定义符号
const symbol = createToken({ name: "symbol", pattern: /\b[A-Z_][A-Z0-9_]*\b/ });

//动态偏移
const dynamic = createToken({ name: "dynamic", pattern: /@\w+\b/ });

//数字
const number = createToken({ name: "number", pattern: /\b(0x[0-9A-Fa-f]+)|([0-9]+)\b/ });

//字符串
const string = createToken({ name: "string", pattern: /"[^\\"]*(\\.[^"\\]*)*"/ });

//注释
const comment = createToken({ name: "comment", pattern: /(\/\/.*)|(\/\*[^/]*\*\/)\n?/, group: Lexer.SKIPPED });

//换行
const pop_endline = createToken({ name: "pop-endline", pattern: /\s*(\r\n|\r|\n)/, line_breaks: true, pop_mode: true });

//空格
const whitespace = createToken({ name: "whitespace", pattern: /\s+/, group: Lexer.SKIPPED });

export const tokenTypes = {
    macro,
    raw,
    raw_type,
    if0,
    command,
    symbol,
    dynamic,
    number,
    string,
    comment,
    pop_endline,
    whitespace
};

export const ptsLexer = new Lexer({
    modes: {
        main: [raw, macro, if0, command, symbol, dynamic, number, string, comment, whitespace],
        macro: [command, symbol, dynamic, number, string, comment, pop_endline, whitespace],
        raw: [symbol, number, raw_type, comment, pop_endline, whitespace]
    },
    defaultMode: "main"
}, {
    errorMessageProvider: {
        buildUnexpectedCharactersMessage()
        {
            return `无法解析的字符（串）。`;
        }
    } as any
});

//类型判断
export const is: {
    [K in keyof any]: (str: string) => boolean
} = {
    byte: (str) => is.number(str) && Number(str) <= 0xFF,
    word: (str) => is.number(str) && Number(str) <= 0xFFFF,
    dword: (str) => is.number(str) && Number(str) <= 0xFFFFFFFF,
    pointer: (str) => is.dword(str),
    command: (str) => (command.PATTERN as RegExp).test(str),
    symbol: (str) => (symbol.PATTERN as RegExp).test(str),
    dynamic: (str) => (dynamic.PATTERN as RegExp).test(str),
    number: (str) => (number.PATTERN as RegExp).test(str),
    string: (str) => (string.PATTERN as RegExp).test(str)
};