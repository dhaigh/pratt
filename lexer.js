const OPERATORS = [ '+', '-', '×', '÷', '(', ')' ];
const isOperator = c => OPERATORS.includes(c);
const isNumber = c => /^[0-9]$/.test(c);

export class Lexer {
    source;
    index = 0;
    tokens = [];

    constructor(source) {
        this.source = source;
    }

    tokenize() {
        while (!this.endOfString) {
            if (isOperator(this.char)) {
                this.consumeOperator();
            } else if (isNumber(this.char)) {
                this.consumeNumber();
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
        this.tokens.push({ value: this.char, type: 'number' });
        this.index += 1;
    }

    get char() {
        return this.source[this.index];
    }

    get endOfString() {
        return this.index === this.source.length;
    }
}

