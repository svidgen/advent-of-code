export type TreePatternObject = Sequence | Union | Recipe | Token;
export type TreePattern = TreePatternObject | string;

const registry = new Map<string, TreePatternObject>();

export class AST {
	public type: string;
	public code: string;
	public start: number;
	public end: number;
	public children: AST[];

	constructor(
		{ type, code, start, end, children }: {
			type: string,
			code: string,
			start: number,
			end: number,
			children: AST[]
		}
	) {
		this.type = type;
		this.code = code;
		this.start = start;
		this.end = end;
		this.children = children;
	}

	public get(type: string): AST[] {
		return this.children.filter(c => c.type === type);
	}
}

function raise(nodeType: TreePatternObject, message: string): null {
	throw new Error(`${nodeType.name} : ${message}`);
}

export class Sequence {
    constructor(
        public name: string,
        public child: TreePattern,
        public optional: boolean = false
    ) {
		registry.set(name, this);
	}

    parse({code, at = 0, optional = undefined}: {code: string, at?: number, optional?: boolean}): AST | null {
        const children: AST[] = [];

		const child = typeof this.child === 'string' ?
			registry.get(this.child) :
			this.child
		;

		const allowEmpty = typeof optional === 'boolean' ? optional : optional;

        let subtree = child.parse({code, at});
        while (subtree) {
            children.push(subtree);
            subtree = child.parse({code, at: subtree.end});
        }

        return children.length > 0 ? new AST({
            type: this.name,
            code: code.substring(at, children[children.length - 1].end),
            start: at,
            end: children[children.length - 1].end,
            children
        }) : (allowEmpty ? null : raise(
			this, `At least one ${child.name} is required.`
		));
    }
}

export class Union {
    constructor(
        public name: string,
        public options: TreePattern[],
        public optional: boolean = false
    ) {
		registry.set(name, this);
	}

    parse({code, at = 0}: {code: string, at?: number}): AST | null {
        for (const option of this.options) {
			const child = typeof option === 'string' ?
				registry.get(option) :
				option
			;

            const parsed = child.parse({code, at});
            if (parsed) {
                return new AST({
                    type: this.name,
                    code: code.substring(at, parsed.end),
                    start: at,
                    end: parsed.end,
                    children: [parsed],
                });
            }
        }
        return null;
    }
}

export class Recipe {
    constructor(
        public name: string,
        public children: TreePattern[],
        public optional: boolean = false
    ) {
		registry.set(name, this);
	}

    parse({code, at = 0}: {code: string, at?: number}): AST | null {
        const children: AST[] = [];

        for (const option of this.children) {
			const child = typeof option === 'string' ?
				registry.get(option) :
				option
			;

            const parsed = child.parse({
                code,
                at: children.length > 0 ? children[children.length - 1].end : at
            });
            if (parsed) {
                children.push(parsed);
            } else if (!child.optional) {
                return null;
            }
        }

        return new AST({
            type: this.name,
            code: code.substring(at, children[children.length - 1].end),
            start: at,
            end: children[children.length - 1].end,
            children,
        });
    }
}

export class Token {
    /**
     * @param name What to call the token.
     * @param matcher Whether the given character is part of the value token.
     */
    constructor(
        public name: string,
        public pattern: RegExp,
        public optional: boolean = false
    ) {
		registry.set(name, this);
	}

    parse({code, at = 0}: {code: string, at?: number}): AST | null {
        const matched = this.pattern.exec(code.substring(at));
        return (matched && matched.index === 0) ? new AST({
            type: this.name,
            code: matched[0],
            start: at,
            end: at + matched[0].length,
            children: [],
        }) : null;
    }
}
