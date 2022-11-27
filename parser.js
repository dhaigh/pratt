import { Lexer } from './lexer.js';
const lexer = new Lexer('6÷2(1+2)');
console.log(lexer.tokenize());
