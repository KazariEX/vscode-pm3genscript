import { ptsLexer } from "./lexer";
import { ptsParser } from "./parser";
import { toAST } from "./ast";

export function compile(content: string)
{
    const lexResult = ptsLexer.tokenize(content);
    ptsParser.input = lexResult.tokens;
    const parseResult = ptsParser.all();
    const astResult = toAST(parseResult);

    return astResult;
}