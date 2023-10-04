import { createToken, Lexer } from "chevrotain";

//宏模式
const macro = createToken({ name: "macro", pattern: /#[a-z]+/, push_mode: "macro" });

//RAW模式
const raw = createToken({ name: "raw", pattern: /#(raw|binary|put)/, push_mode: "raw" });
const raw_type = createToken({ name: "raw-type", pattern: /[^\s\r\n]+/ });

//文本模式
const equal = createToken({ name: "equal", pattern: /=/ });
const string = createToken({ name: "string", pattern: {
    exec: (text, offset) => {
        let start = offset;
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

        return [text.slice(start, end)];
    }
}, start_chars_hint: ["\""], line_breaks: false
});

//指令
const command = createToken({ name: "command", pattern: /[a-z][a-z0-9_]*/ });

//定义符号
const symbol = createToken({ name: "symbol", pattern: /[A-Z_][A-Z0-9_]*/ });

//动态偏移
const dynamic = createToken({ name: "dynamic", pattern: /@\w+/ });

//字面量
const literal = createToken({ name: "literal", pattern: /(0x[0-9A-Fa-f]+)|([0-9]+)/ });

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
    equal,
    string,
    pop_endline,
    whitespace
};

export const ptsLexer = new Lexer({
    modes: {
        main: [raw, macro, equal, command, symbol, dynamic, literal, string, whitespace],
        macro: [command, symbol, dynamic, literal, string, pop_endline, whitespace],
        raw: [symbol, literal, raw_type, pop_endline, whitespace]
    },
    defaultMode: "main"
});