import { compile } from "../src/compile";

const result = compile(`
#dynamic 0xA00000

#org @1
if1 0x1 @2
setvar 0x616 0x1
end

#org @2
setvar 0x616 0x2
end
`);