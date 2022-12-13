import { AST } from './parser';

/**
 * The output.
 */

const output = (ast: AST): string => {
    switch (ast.type) {
        case 'GAME':
            return null;
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
