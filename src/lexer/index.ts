import {TokenType} from './token/TokenType';
import * as LexerSymbols from './token/LexerSymbol';
import {LexerSymbol} from './token/LexerSymbol';
import {Token} from "./token/Token";
import {preload} from "./preload";

export class Lexer {
    buffer: string;

    private currentChar: string | null = null;
    private index: number = 0;

    constructor(stringBuffer: string) {
        this.buffer = preload(stringBuffer);
        this.currentChar = this.buffer[this.index];
    }

    public getNextToken(): Token {
        this.skipWhiteSpace();

        if (this.is(LexerSymbols.SCREEN_DIRECTION_START)) {
            this.removeScreenDirection();
        }

        if (this.is(LexerSymbols.CHAR))
            return new Token(TokenType.Word, this.getWord());

        if (this.is(LexerSymbols.SPEAKER_OFFSCREEN))
            return new Token(TokenType.OffScreenSpeaker, this.consume());

        if (this.is(LexerSymbols.SPEAKER_ONSCREEN))
            return new Token(TokenType.OnScreenSpeaker, this.consume());

        if (this.is(LexerSymbols.ASIDE_START))
            return new Token(TokenType.AsideStart, this.consume());

        if (this.is(LexerSymbols.ASIDE_END))
            return new Token(TokenType.AsideEnd, this.consume());

        if (this.is(LexerSymbols.PUNCTUATION)) {
            const nextPunctuation = this.getPunctuation();
            if (nextPunctuation.length === 1 && nextPunctuation.match(LexerSymbols.PUNCTUATION_END)) {
                return new Token(TokenType.EndPunctuation, nextPunctuation);
            }
            return new Token(TokenType.GeneralPunctuation, nextPunctuation);
        }

        if (this.is(LexerSymbols.NEWLINE))
            return new Token(TokenType.NEWLINE, this.consume());

        if (this.currentChar === null)
            return new Token(TokenType.EOF, null);


        return new Token(TokenType.NON_SPEECH_CHARACTER, this.consume());
    }


    private is(matcher: LexerSymbol): boolean {
        if (this.currentChar === null)
            return false;

        return this.currentChar.match(matcher) !== null;
    }

    public toss() {
        this.advance();
    }

    private advance() {
        this.index += 1;
        this.currentChar = this.buffer[this.index] || null;
    }

    private retreat() {
        this.index -= 1;

        if (this.index < 0)
            throw new RangeError(`The Lexer is trying to retreat past the beginning of the buffer`);

        this.currentChar = this.buffer[this.index] || null;
    }

    private skipWhiteSpace() {
        while (this.is(LexerSymbols.WHITESPACE))
            this.advance();
    }

    private removeScreenDirection() {
        let open = 1;

        this.advance();
        while (open > 0 && this.currentChar !== null) {
            this.advance();
            if (this.is(LexerSymbols.SCREEN_DIRECTION_START)) {
                open++;
            } else if (this.is(LexerSymbols.SCREEN_DIRECTION_END)) {
                open--;
            }
        }
        this.advance();
        this.skipWhiteSpace();
    }

    private getWord(): string {
        let potentialWord = '';

        while (
            this.is(LexerSymbols.CHAR)
            || this.is(LexerSymbols.SCREEN_DIRECTION_START)
            && this.currentChar !== null) {
            if (this.is(LexerSymbols.SCREEN_DIRECTION_START)) {
                this.removeScreenDirection();
            } else {
                potentialWord += this.currentChar;
                this.advance();
            }
        }

        return potentialWord;
    }

    /**
     * Groups punctuations.
     * TODO: This could potentially be made "smarter" by attempting to group common punctuations.
     *
     * e.g. '.''.''.' -> '...' type: ellipses or '?''!''?' -> '?!?' shock
     */
    private getPunctuation(): string {
        let nextPunctuation = '';

        while (
            this.is(LexerSymbols.PUNCTUATION_END)
            || this.is(LexerSymbols.PUNCTUATION_FLOW)
            ) {
            nextPunctuation += this.currentChar;
            this.advance();
        }

        return nextPunctuation;
    }

    private consume(): string | null {
        const char = this.currentChar;
        this.advance();

        return char;
    }
}