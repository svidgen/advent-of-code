import { readFileSync } from 'fs';
import MonkeyScript from './monkeyscript-lang';

const ast = MonkeyScript.parse({
	code: readFileSync(0, 'utf-8').trim()
});

console.dir(ast, { depth: null });
