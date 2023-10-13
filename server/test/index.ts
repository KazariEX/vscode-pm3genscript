import { text2ast } from "../src/ast";

const result = text2ast(`
#dynamic 0xA05000

#org @1
if
`, {});