import { compile } from "../src/compile";

const result = compile(`
#dynamic 0xA05000

#org @1
if 0x1 goto @2

#org @2
end
`);