import {
	TreePattern,
	AST,
	Sequence,
	Union,
	Recipe,
	Token
} from './parser';


/**
 * The grammar.
 */
const EOS = new Token("EOS", /\s*[\n|;]+\s*/);
const ASSIGNMENT_OPERATOR = new Token("ASSIGNMENT_OPERATOR", /^=/);
const WHITESPACE = new Token("WHITESPACE", /^\s+/, true);
const NAME = new Token("NAME", /^[a-zA-Z_][a-zA-Z0-9_]*/);
const OPERATOR = new Token("OPERATOR", /^[+*]/);
const DEF_SEPARATOR = new Token("DEF_SEPARATOR", /^:/);
const INTEGER = new Token("INTEGER", /^[0-9]+/);
const FLOAT = new Token("FLOAT", /^[0-9]*\.[0-9]+/);
const NUMBER = new Union("NUMBER", [ INTEGER, FLOAT ]);
const VALUE = new Union("VALUE", [ NAME, NUMBER ]);

const EXPRESSION = new Union(
	"EXPRESSION",
	[ NAME, VALUE, OPERATION ]
);

const OPERATION = new Recipe(
	"OPERATION",
	[ EXPRESSION, WHITESPACE, OPERATOR, WHITESPACE, EXPRESSION ]
);

const ASSIGNMENT = new Recipe(
    "ASSIGNMENT",
    [ NAME, WHITESPACE, ASSIGNMENT_OPERATOR, WHITESPACE, EXPRESSION ]
);

const OP_DEFINITION = new Recipe(
	"OP_DEFINITION",
	[ 
		new Token("OP_KEYWORD", /^operation/i),
		DEF_SEPARATOR,
		WHITESPACE,
		ASSIGNMENT
	]
);

const ITEMS_DEFINITION = new Recipe(
	"ITEMS_DEFINITION",
	[
		new Token("OP_KEYWORD", /^starting items/i),
		DEF_SEPARATOR,
		WHITESPACE,
		VALUE_LIST
	]
);

const VALUE_LIST_ITEM = new Recipe(
	"VALUE_LIST_ITEM",
	[
		LIST_ITEM_SEPARATOR,
		VALUE,
	]
);

const VALUE_LIST = new Sequence("VALUE_LIST", VALUE_LIST_ITEM);

const STATEMENT = new Recipe("STATEMENT", [
    new Union("NOISE", [WHITESPACE, EOS]),
    new Union("STATEMENT_BODY", [
        ASSIGNMENT
    ]),
    EOS
]);

const MONKEY_KW = new Token("MONKEY_KW", /^monkey/i);
const MONKEY_ID = new Union("MONKEY_ID", [ INTEGER ]);
const MONKEY = new Recipe(
	"MONKEY",
	[
		MONKEY_KW, WHITESPACE, MONKEY_ID, DEF_SEPARATOR,
			WHITESPACE, ITEMS_DEFINITION,	
			WHITESPACE, OP_DEFINITION,	
			WHITESPACE, TEST
			WHITESPACE
	]
);

/**
 * The output.
 */

const outputAsyncJS = (ast: AST): string => {
    switch (ast.type) {
        case 'PROGRAM':
            return `(async () => {\n${ast.children
                .map(c => outputAsyncJS(c))
                .filter(o => o).join(";") }})();`
            ;
        case 'STATEMENT':
        case 'STATEMENT_BODY':
            return ast.children
                .map(c => outputAsyncJS(c))
                .filter(o => o).join(";")
            ;
        case 'ASSIGNMENT':
            return ast.children
                .filter(c => c.type !== 'WHITESPACE')
                .map(c => outputAsyncJS(c)).join(" ")
            ;
        case 'ASSIGNMENT_OPERATOR':
            return '=';
        case 'NAME':
            return ast.code;
        case 'VALUE':
            return 'await ' + ast.code;
        case 'EOS':
        case 'WHITESPACE':
        case 'NOISE':
            return '';
        default:
            throw new Error(`Unknown token "${ast.type}":\n${ast.code}`)
    }
};

/**
 * Execution.
 */
const grammar = new Sequence('PROGRAM', STATEMENT);
const syntaxTree = grammar.parse({code: `
    xyz <- 123 ;;;

    ;  abc <- xyz
`});
const js = syntaxTree ? outputAsyncJS(syntaxTree) : '';

console.clear();
console.log({
    syntaxTree,
    js
});
