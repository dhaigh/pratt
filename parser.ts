import { Operator, Token, Lexer } from './lexer';
const lexer = new Lexer('6/2*(1+2)');

const POWERS: Record<Operator, number> = {
    '+': 1,
    '-': 1,
    '×': 2,
    '*': 2,
    '÷': 2,
    '/': 2,
};

abstract class Symbol {
    constructor(
        protected readonly parser: Parser,
        public readonly token: Token
    ) {}

    abstract nud(): Symbol;
    abstract led(left: Symbol): Symbol;

    get lbp() {
        if (this.token.type === 'end') {
            return 0;
        }

        if (this.token.type !== 'operator') {
            throw new Error('expected operator');
        }

        return POWERS[this.token.value];
    }
}

class End extends Symbol {
    nud(): Symbol {
        throw new Error('unexpected end');
    }

    led(): Symbol {
        throw new Error('unexpected end');
    }
}

class Literal extends Symbol {
    nud(): Symbol {
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

    led(left: Symbol): Symbol {
        if (this.parser.symbol instanceof End) {
            return left;
        }

        this.firstSecond = [left, this.parser.parse(this.lbp)];
        return this;
    }
}

class Prefix extends Symbol {
    nud(): Symbol {
        const exp = this.parser.parse(0);
        this.parser.advance(')');
        return exp;
    }

    led(): Symbol {
        throw new Error('unexpected led');
    }
}

export class Parser {
    symbols: Symbol[] = [];
    index = 0;

    constructor(symbols: Token[]) {
        this.symbols = symbols.map(tok => {
            if (tok.type === 'number') {
                return new Literal(this, tok);
            } else if (tok.value === '(') {
                return new Prefix(this, tok);
            } else {
                return new Infix(this, tok);
            }
        });
        this.symbols.push(new End(this, {
            type: 'end',
            value: '<end>'
        }));
    }

    parse(rbp = 0): Symbol {
        // should probs be a literal
        let token = this.symbol;

        this.advance();

        // this.symbol is now an operator

        let left = token.nud(); // LEFT OF THE OPERATOR

        while (rbp < this.symbol.lbp) {
            // remember this.symbol is an operator because of this.advance()
            token = this.symbol;

            this.advance();
            left = token.led(left);
        }

        return left;
    }

    advance(expected?: string) {
        if (expected && this.symbol.token.value !== expected) {
            throw new Error(`expected ${expected}, saw ${this.symbol.token.value}`);
        }
        this.index += 1;
    }

    get symbol(): Symbol  {
        return this.symbols[this.index];
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

const str = print(p);
console.log(str,'=', eval(str));
