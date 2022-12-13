export type TreePattern = Sequence | Union | Recipe | Token;

export type AST = {
    type: string,
    code: string,
    start: number,
    end: number,
    children: AST[],
}

export class Sequence {
    constructor(
        public name: string,
        public child: TreePattern,
        public optional: boolean = false
    ) {}

    parse({code, at = 0}: {code: string, at?: number}): AST | null {
        const children: AST[] = [];

        let subtree = this.child.parse({code, at});
        while (subtree) {
            children.push(subtree);
            subtree = this.child.parse({code, at: subtree.end});
        }

        return children.length > 0 ? {
            type: this.name,
            code: code.substring(at, children[children.length - 1].end),
            start: at,
            end: children[children.length - 1].end,
            children
        } : null;
    }
}

export class Union {
    constructor(
        public name: string,
        public options: TreePattern[],
        public optional: boolean = false
    ) {}

    parse({code, at = 0}: {code: string, at?: number}): AST | null {
        for (const option of this.options) {
            const parsed = option.parse({code, at});
            if (parsed) {
                return {
                    type: this.name,
                    code: code.substring(at, parsed.end),
                    start: at,
                    end: parsed.end,
                    children: [parsed],
                }
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
    ) {}

    parse({code, at = 0}: {code: string, at?: number}): AST | null {
        const children: AST[] = [];

        for (const option of this.children) {
            const parsed = option.parse({
                code,
                at: children.length > 0 ? children[children.length - 1].end : at
            });
            if (parsed) {
                children.push(parsed);
            } else if (!option.optional) {
                return null;
            }
        }

        return {
            type: this.name,
            code: code.substring(at, children[children.length - 1].end),
            start: at,
            end: children[children.length - 1].end,
            children,
        };
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
    ) {}

    parse({code, at = 0}: {code: string, at?: number}): AST | null {
        const matched = this.pattern.exec(code.substring(at));
        return (matched && matched.index === 0) ? {
            type: this.name,
            code: matched[0],
            start: at,
            end: at + matched[0].length,
            children: [],
        } : null;
    }
}
