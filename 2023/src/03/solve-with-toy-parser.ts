import {
	sequence,
	union,
	recipe,
	token,
} from 'toy-compiler/src/parser';

const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8');

const NUMBER = token('NUMBER', /\d+/);
const FILLER = token('FILLER', /\.+/);
const SYMBOL = token('SYMBOL', /[^\d.]/);
const EOL = token('EOL', /(\n|\r)+/);
const LINE_MEMBER = union('LINE_MEMBER', [NUMBER, SYMBOL]);
const LINE = sequence('LINE', LINE_MEMBER, FILLER);
const SCHEMATIC = sequence('SCHEMATIC', LINE, EOL);

const ast = SCHEMATIC.parse(raw);

console.log({ast});
