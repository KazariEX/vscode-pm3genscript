import { CstParser } from "chevrotain";
import { tokenTypes } from "./lexer";

class PTSParser extends CstParser {
    constructor()
    {
        super(tokenTypes, { recoveryEnabled: true });
        this.performSelfAnalysis();
    }

    all = this.RULE("All", () => {
        this.MANY(() => this.OR([
            { ALT: () => this.SUBRULE(this.macro) },
            { ALT: () => this.SUBRULE(this.raw) },
            { ALT: () => this.SUBRULE(this.command) },
            { ALT: () => this.SUBRULE(this.if0) }
        ]));
    });

    //编译器宏
    macro = this.RULE("Macro", () => {
        this.CONSUME(tokenTypes.macro);
        this.MANY(() => {
            this.SUBRULE(this.macro_param);
        });
        this.OPTION(() => this.CONSUME(tokenTypes.pop_endline));
    });

    //RAW模式
    raw = this.RULE("Raw", () => {
        this.CONSUME(tokenTypes.raw);
        this.MANY(() => this.OR([
            { ALT: () => this.CONSUME(tokenTypes.symbol) },
            { ALT: () => this.CONSUME(tokenTypes.number) },
            { ALT: () => this.CONSUME(tokenTypes.raw_type) }
        ]));
        this.OPTION(() => this.CONSUME(tokenTypes.pop_endline));
    });

    //指令
    command = this.RULE("Command", () => {
        this.CONSUME(tokenTypes.command);
        this.MANY(() => {
            this.SUBRULE(this.param);
        });
    });

    //[if]语法糖
    if0 = this.RULE("If0", () => {
        this.CONSUME(tokenTypes.if0);
        this.SUBRULE1(this.param);
        this.CONSUME(tokenTypes.command);
        this.MANY(() => {
            this.SUBRULE2(this.param);
        });
    });

    //宏参数
    macro_param = this.RULE("MacroParam", () => {
        this.OR([
            { ALT: () => this.CONSUME(tokenTypes.command) },
            { ALT: () => this.CONSUME(tokenTypes.symbol) },
            { ALT: () => this.CONSUME(tokenTypes.dynamic) },
            { ALT: () => this.CONSUME(tokenTypes.number) },
            { ALT: () => this.CONSUME(tokenTypes.string) }
        ]);
    });

    //参数
    param = this.RULE("Param", () => {
        this.OR([
            { ALT: () => this.CONSUME(tokenTypes.symbol) },
            { ALT: () => this.CONSUME(tokenTypes.dynamic) },
            { ALT: () => this.CONSUME(tokenTypes.number) },
            { ALT: () => this.CONSUME(tokenTypes.string) }
        ]);
    });
}

export const ptsParser = new PTSParser();
export const BasePTSVisitor = ptsParser.getBaseCstVisitorConstructorWithDefaults();