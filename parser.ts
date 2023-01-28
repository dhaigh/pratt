import { Operator, Token, Lexer } from './lexer';
const lexer = new Lexer('6÷2×1+2');

const POWERS: Record<Operator, number> = {
    '×': 3,
    '÷': 2,
    '+': 1,
    '-': 1,
};

abstract class Symbol {
    constructor(
        protected readonly parser: Parser,
        public readonly token: Token
    ) {}

    abstract nud(): Symbol;
    abstract led(left: Symbol): Symbol;

    get lbp() {
        if (this.token.type !== 'operator') {
            throw new Error('expected operator');
        }

        return POWERS[this.token.value];
    }
}

class Literal extends Symbol {
    nud() {
        return this;
    }

    led(): Symbol {
        throw new Error('unexpected led');
    }
}

class Infix extends Symbol {
    firstSecond?: [Symbol, Symbol];

    nud(): Symbol {
        throw new Error('unexpected nud');
    }

    led(left: Symbol) {
        this.firstSecond = [left, this.parser.parse(this.lbp)];
        return this;
    }
}

export class Parser {
    tokens: Symbol[] = [];
    index = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens.map(tok => {
            if (tok.type === 'number') {
                return new Literal(this, tok);
            } else {
                return new Infix(this, tok);
            }
        });
    }

    parse(rbp = 0): Symbol {
        let tok = this.token;
        this.advance();
        let left = tok.nud();

        while (this.index < this.tokens.length && rbp < this.token.lbp) {
            tok = this.token;
            this.advance();
            left = tok.led(left);
        }

        return left;
    }

    advance() {
        this.index += 1;
    }

    get token() {
        return this.tokens[this.index];
    }
}

const parser = new Parser(lexer.tokenize());
const p = parser.parse();

type SymbolUnion = Literal | Infix;

const print = (exp: SymbolUnion): string => {
    if (exp instanceof Literal) {
        return exp.token.value;
    }

    if (!exp.firstSecond) {
        throw new Error('expected firstSecond');
    }

    const [ first, second ] = exp.firstSecond;

    let a = print(first);
    let b = print(second);

    if (first instanceof Infix) {
        a = '(' + a + ')';
    }

    if (second instanceof Infix) {
        b = '(' + b + ')';
    }

    return `${a}${exp.token.value}${b}`;
};

console.log(print(p));
