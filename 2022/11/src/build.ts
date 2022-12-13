import { readFileSync } from 'fs';
import MonkeyScript from './monkeyscript-lang';

const ast = MonkeyScript.parse(
	readFileSync(0, 'utf-8').trim()
);

console.log(ast);
