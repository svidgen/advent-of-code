export type TreePatternObject = Sequence | Union | Recipe | Token;
export type TreePattern = TreePatternObject | string;

const registry = new Map<string, TreePatternObject>();
const visits = new Map<string, number>();

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
		// console.log(JSON.stringify(this, null, 2));
		// console.dir(this, { depth: null });
	}

	public get(type: string): AST[] {
		return this.children.filter(c => c.type === type);
	}
}

function codeAt(
	code: string,
	at: number
) {
	let start = at;
	while (start >= 0 && code[start] !== "\n") {
		start--;
	}

	let end = at;
	while (end < code.length && code[end] !== "\n") {
		end++;
	}

	let i = at;
	let lineNumber = 0;
	while (i >= 0) {
		if (code[i] === "\n") lineNumber++;
		i--;
	}

	false && console.log({
		before: code.substring(0, at),
		at,
		after: code.substring(at)
	});

	const lineLabel = `line ${lineNumber}: `;
	const codeline = code.substring(start + 1, end);
	const indicatorIndent = (1 + at - start) + lineLabel.length;
	const indicatorPad = [...new Array(indicatorIndent)].map(i => ' ').join('');
	return `${lineLabel}${codeline}\n${indicatorPad}^`;
}

function raise(
	breadcrumbs: TreePatternObject[],
	nodeType: TreePatternObject,
	code: string,
	at: number,
	message: string
): null {
	const location = codeAt(code, at);
	const trail = breadcrumbs.map(b => b.name).join(':');
	throw new Error(
		`${trail} expected a ${nodeType.name}. ${message}\n${location}`
	);
}

function isRecycle(
	nodeType: TreePatternObject,
	at: number
) {
	const key = `${nodeType.name}:${at}`
	if (!visits.has(key)) {
		visits.set(key, 0);
	}
	visits.set(key, visits.get(key) + 1);
	return visits.get(key) > 32;
}

export class Sequence {
	constructor(
		public name: string,
		public child: TreePattern,
		public delimiter: TreePattern = undefined,
		public optional: boolean = true
	) {
		registry.set(name, this);
	}

	parse({code, at = 0, optional = undefined, breadcrumbs = []}: {code: string, at?: number, optional?: boolean, breadcrumbs?: TreePatternObject[]}): AST | null {
		const allowEmpty = typeof optional === 'boolean' ? optional : this.optional;
		if (isRecycle(this, at)) throw new Error("Recursive token parsing is not allowed!");

		const children: AST[] = [];

		const child = typeof this.child === 'string' ?
			registry.get(this.child) :
			this.child
		;

		const Delimiter = typeof this.delimiter === 'string' ?
			registry.get(this.delimiter) :
			this.delimiter
		;

		let subtree = child.parse({
			code,
			at,
			breadcrumbs: [...breadcrumbs, this],
			optional: allowEmpty
		});

		while (subtree) {
			children.push(subtree);
			let delimiter;
			if (Delimiter) {
				delimiter = Delimiter.parse({
					code,
					at: subtree.end,
					breadcrumbs: [...breadcrumbs, this],
					optional: true
				});
				if (!delimiter) break;
			}
			subtree = child.parse({
				code,
				at: (delimiter || subtree).end,
				breadcrumbs: [...breadcrumbs, this],
				optional: true
			});
		}

		// down the road, this may actually need to return an AST with
		// an empty children collection if allowEmpty is true.
		return children.length > 0 ? new AST({
			type: this.name,
			code: code.substring(at, children[children.length - 1].end),
			start: at,
			end: children[children.length - 1]?.end || at,
			children
		}) : (allowEmpty ? null : raise(
			breadcrumbs, this, code,
			subtree?.end || at,
			`At least one ${child.name} is required.`
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

	parse({code, at = 0, optional = undefined, breadcrumbs = []}: {code: string, at?: number, optional?: boolean, breadcrumbs?: TreePatternObject[]}): AST | null {
		if (isRecycle(this, at)) throw new Error("Recursive token parsing is not allowed!");

		const allowEmpty = typeof optional === 'boolean' ? optional : this.optional;

		for (const option of this.options) {
			const child = typeof option === 'string' ?
				registry.get(option) : option;

			const parsed = child.parse({
				code, at, optional: true,
				breadcrumbs: [...breadcrumbs, this]
			});

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

		if (allowEmpty) {
			return null;
		} else {
			raise(breadcrumbs, this, code, at, `Must be one of ${
				this.options
					.map(o => typeof o === 'string' ? o : o.name)
					.join(', ')
			}.`);
		}
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

	parse({code, at = 0, optional = undefined, breadcrumbs = []}: {code: string, at?: number, optional?: boolean, breadcrumbs?: TreePatternObject[]}): AST | null {
		if (isRecycle(this, at)) throw new Error("Recursive token parsing is not allowed!");

		const children: AST[] = [];
		const allowEmpty = typeof optional === 'boolean' ? optional : this.optional;

		try {
			for (const option of this.children) {
				const child = typeof option === 'string' ?
					registry.get(option) :
					option
				;

				const _at = children.length > 0 ?
					children[children.length - 1].end : at

				const parsed = child.parse({
					code,
					at: _at,
					breadcrumbs: [...breadcrumbs, this],
				});

				if (parsed) {
					children.push(parsed);
				}
			}
		} catch (err) {
			if (allowEmpty) {
				return null;
			} else {
				throw err;
			}
		}

		return new AST({
			type: this.name,
			code: code.substring(at, children[children.length - 1]?.end || at),
			start: at,
			end: children[children.length - 1]?.end || at,
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

	parse({code, at = 0, optional = undefined, breadcrumbs = []}: {code: string, at?: number, optional?: boolean, breadcrumbs?: TreePatternObject[]}): AST | null {
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
