import { createToken, Lexer } from "chevrotain";

//RAW模式
const raw = createToken({ name: "raw", pattern: /#(raw|binary|put)/, push_mode: "raw" });
const raw_type = createToken({ name: "raw-type", pattern: /[^\s\r\n]+/ });
const raw_end = createToken({ name: "raw-end", pattern: /\r\n|\r|\n/, pop_mode: true });

//文本模式
const equal = createToken({ name: "equal", pattern: /=/, push_mode: "string" });
const string = createToken({ name: "string", pattern: /.+/, pop_mode: true });

//编译器宏
const macro = createToken({ name: "macro", pattern: /#[a-z]+/ });

//指令
const command = createToken({ name: "command", pattern: /[a-z][a-z0-9]*/ });

//定义
const define = createToken({ name: "define", pattern: /\b[A-Z_][A-Z0-9_]*\b/ });

//动态偏移
const dynamic = createToken({ name: "dynamic", pattern: /@\w+/ });

//字面量
const literal = createToken({ name: "literal", pattern: /\b(0x[0-9A-Fa-f]+)|([0-9]+)\b/ });

const whitespace = createToken({
    name: "whitespace",
    pattern: /\s+/,
    group: Lexer.SKIPPED
});

export const tokenTypes = {
    raw,
    raw_type,
    raw_end,
    macro,
    command,
    define,
    dynamic,
    literal,
    equal,
    string,
    whitespace
};

export const ptsLexer = new Lexer({
    modes: {
        main: [raw, macro, command, define, dynamic, literal, equal, whitespace],
        raw: [define, literal, raw_type, raw_end, whitespace],
        string: [string]
    },
    defaultMode: "main"
});