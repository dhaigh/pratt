const OPERATORS = [
    '+',
    '-',

    '×',
    '*',

    '÷',
    '/',

    '(',
    ')',
];

export type Operator = typeof OPERATORS[number];

const isOperator = (c: string): c is Operator => OPERATORS.includes(c);

const isNumber = (c: string) => /^[0-9]$/.test(c);

export interface Token {
    type: string;
    value: string;
}

export class Lexer {
    index = 0;
    tokens: Token[] = [];

    constructor(private readonly source: string) {}

    tokenize() {
        while (!this.endOfString) {
            if (isOperator(this.char)) {
                this.consumeOperator();
            } else if (isNumber(this.char)) {
                this.consumeNumber();
            } else if (this.char === ' ') {
                this.index += 1;
            } else {
                throw new Error(`Unknown character '${this.char}'`);
            }
        }

        return this.tokens;
    }

    consumeOperator() {
        this.tokens.push({ value: this.char, type: 'operator' });
        this.index += 1;
    }

    consumeNumber() {
        const start = this.index;

        while (isNumber(this.char)) {
            this.index += 1;
        }

        this.tokens.push({
            value: this.source.slice(start, this.index),
            type: 'number',
        });
    }

    get char() {
        return this.source[this.index];
    }

    get endOfString() {
        return this.index === this.source.length;
    }
}

