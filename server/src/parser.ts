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
            { ALT: () => this.SUBRULE(this.command) },
            { ALT: () => this.SUBRULE(this.raw) }
        ]));
    });

    //编译器宏
    macro = this.RULE("Macro", () => {
        this.CONSUME(tokenTypes.macro);
        this.MANY(() => this.SUBRULE(this.param));
        this.OPTION(() => this.CONSUME(tokenTypes.pop_endline));
    });

    //RAW模式
    raw = this.RULE("Raw", () => {
        this.CONSUME(tokenTypes.raw);
        this.MANY(() => this.OR([
            { ALT: () => this.CONSUME(tokenTypes.symbol) },
            { ALT: () => this.CONSUME(tokenTypes.literal) },
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

    //参数
    param = this.RULE("Param", () => {
        this.OR([
            { ALT: () => this.CONSUME(tokenTypes.symbol) },
            { ALT: () => this.CONSUME(tokenTypes.dynamic) },
            { ALT: () => this.CONSUME(tokenTypes.literal) },
            { ALT: () => this.CONSUME(tokenTypes.string) }
        ]);
    });
}

export const ptsParser = new PTSParser();
export const BasePTSVisitor = ptsParser.getBaseCstVisitorConstructorWithDefaults();