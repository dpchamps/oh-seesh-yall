import {Token} from "../lexer/token/Token";
import {TokenType} from "../lexer/token/TokenType";


export class Speaker {
    name: string;
    dialog: Array<DialogLine> = [];
    asides: Array<DialogLine> = [];


    constructor(name: string) {
        this.name = name;
    }

    addToCurrentDialog(token: Token) {
        if (this.dialog.length === 0) {
            throw new TypeError(`Can't add a word to a line that's non existent`);
        }

        this.dialog[this.dialog.length - 1].addWord(token);
    }

    addToCurrentAside(token: Token) {
        if (this.asides.length === 0)
            throw new TypeError(`Invalid addition to aside: no aside currently exists`);

        this.asides[this.asides.length - 1].addWord(token);
    }

    removeLastWord() {
        if (this.dialog.length)
            this.dialog[this.dialog.length - 1].sentence.pop();
    }

    getNextDialog(isOffscreen: boolean = this.getCurrentScreenPosition()) {
        this.dialog.push(new DialogLine(isOffscreen));
    }

    getNextAside() {
        let isOffscreen = true;
        if (this.dialog[this.dialog.length - 1]) {
            isOffscreen = this.dialog[this.dialog.length - 1].isOffScreen;
        }
        this.asides.push(new DialogLine(isOffscreen));
    }

    getCurrentScreenPosition(): boolean {
        if (this.dialog.length === 0)
            throw new TypeError(`Current dialog for speaker ${this.name} doesn't exist.`);
        return this.dialog[this.dialog.length - 1].isOffScreen;
    }
}

class DialogLine {
    sentence: Array<Token> = [];
    isOffScreen: boolean;

    constructor(offScreen: boolean) {
        this.isOffScreen = offScreen;
    }

    addWord(token: Token) {
        if (!token.is(TokenType.Word)
            && !token.is(TokenType.GeneralPunctuation)
            && !token.is(TokenType.EndPunctuation)) {
            throw new TypeError(`Adding a word to a speaker dialog requires a word or punctuation token, got ${JSON.stringify(token.toJSON())} instead`);
        }

        this.sentence.push(token);
    }

    toString() {
        return this.sentence.join(' ');
    }
}