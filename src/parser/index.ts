import {TokenType} from "../lexer/token/TokenType";
import {Lexer} from "../lexer";
import {Token} from "../lexer/token/Token";
import {Speaker} from "./Speaker";

/**
 * The parser class takes a buffer and lexes it into an key:value object of speaker name to {@link Speaker}.
 */
export class Parser {
    lexer: Lexer;
    tokens: Array<Token> = [new Token(TokenType.SOF, null)];
    isAside: boolean = false;
    currentSpeaker: Speaker | null = null;

    speakers: { [key: string]: Speaker } = {};


    constructor(str: string) {
        this.lexer = new Lexer(str);
    }

    lastToken() {
        return this.tokens[this.tokens.length - 1];
    }

    parse() {
        while (!this.lastToken().is(TokenType.EOF)) {
            try {
                let nextToken = this.lexer.getNextToken();

                switch (nextToken.type) {
                    case TokenType.Word:
                        this.parseWord(nextToken);
                        break;
                    case TokenType.EndPunctuation:
                    case TokenType.GeneralPunctuation:
                        this.parsePunctuation(nextToken);
                        break;
                    case TokenType.OnScreenSpeaker:
                    case TokenType.OffScreenSpeaker:
                        this.parseSpeaker(nextToken);
                        break;
                    case TokenType.AsideStart:
                    case TokenType.AsideEnd:
                        if (nextToken.type === TokenType.AsideStart
                            && this.currentSpeaker === null) {
                            while (nextToken.type !== TokenType.AsideEnd) {
                                nextToken = this.lexer.getNextToken();
                            }
                            continue;
                        } else {
                            this.parseAside(nextToken);
                        }
                        break;
                    case TokenType.NEWLINE:
                        this.parseNewLine(nextToken);
                        break;
                    case TokenType.EOF:
                        break;
                    case TokenType.NON_SPEECH_CHARACTER:
                        continue;
                }

                this.tokens.push(nextToken);
            } catch (e) {

                console.log(`The parser encountered a error while grabbing the next token: ${e}`);
                //toss the token
                this.lexer.toss();
            }
        }
    }

    parseWord(token: Token) {
        //For now, if there's no current speaker toss the token
        if (this.currentSpeaker !== null) {
            if (this.isAside)
                try {
                    this.currentSpeaker.addToCurrentAside(token);
                } catch (e) {
                    //eh
                }
            else
                this.currentSpeaker.addToCurrentDialog(token);
        }

    }

    parsePunctuation(token: Token) {
        if (this.currentSpeaker !== null) {
            this.parseWord(token);
            if (token.is(TokenType.EndPunctuation)) {
                this.currentSpeaker.getNextDialog();
            }
        }
    }

    parseAside(token: Token) {
        if (this.currentSpeaker !== null) {
            if (token.is(TokenType.AsideStart)) {
                this.currentSpeaker.getNextAside();
                this.isAside = true;
            } else {
                this.isAside = false;
            }
        }
    }

    parseSpeaker(token: Token) {

        if (this.currentSpeaker !== null) {
            return;
        }

        const speakerName = this.lastToken().value.toUpperCase();

        if (!this.speakers[speakerName]) {
            this.speakers[speakerName] = new Speaker(speakerName);
        }

        this.currentSpeaker = this.speakers[speakerName];

        if (token.is(TokenType.OnScreenSpeaker)) {
            this.currentSpeaker.getNextDialog(false)
        } else {
            this.currentSpeaker.getNextDialog(true)
        }
    }

    parseNewLine(token: Token) {
        this.currentSpeaker = null;
    }
}