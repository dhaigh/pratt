import { Lexer } from './lexer.js';
const lexer = new Lexer('6÷2×1+2');

const POWERS = {
    '×': 3,
    '÷': 2,
    '+': 1,
    '-': 1,
};

class Symbol {
    parser;
    token;

    constructor(parser, token) {
        this.parser = parser;
        this.token = token;
    }

    nud() {
        throw new Error('Undefined');
    }

    led(left) {
        throw new Error('Missing operator');
    }

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
}

class Infix extends Symbol {
    first;
    second;

    led(left) {
        this.first = left;
        this.second = this.parser.parse(this.lbp);
        return this;
    }
}

export class Parser {
    tokens = [];
    index = 0;

    constructor(tokens) {
        this.tokens = tokens.map(tok => {
            if (tok.type === 'number') {
                return new Literal(this, tok);
            } else {
                return new Infix(this, tok);
            }
        });
    }

    parse(rbp = 0) {
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
const p = (parser.parse());

const print = exp => {
    if (exp instanceof Literal) {
        return exp.token.value;
    }

    const { first, second } = exp;
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
