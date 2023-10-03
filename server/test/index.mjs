import { ptsLexer } from "../out/lexer.js";
import { ptsParser } from "../out/parser.js";
import { toAST } from "../out/ast.js";

const input = `
#raw word 0x42 0x40 dword 0x1G0a00 lll@llll
`;

const lexResult = ptsLexer.tokenize(input);

ptsParser.input = lexResult.tokens;
const parseResult = ptsParser.all();

const astResult = toAST(parseResult);