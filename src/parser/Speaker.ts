import {Token} from "../lexer/token/Token";
import {TokenType} from "../lexer/token/TokenType";

export interface ISerializableDialogLine {
    sentence: Array<{ type: number; value: any }>;
    isOffScreen: boolean;
}

export interface ISerializableSpeaker {
    name: string;
    dialog: Array<ISerializableDialogLine>,
    asides: Array<ISerializableDialogLine>
}

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

    toJSON() {
        return {
            name: this.name,
            dialog: this.dialog,
            asides: this.asides
        }
    }

    static fromJSON(speakerObject: ISerializableSpeaker): Speaker {
        const speaker = new Speaker(speakerObject.name);
        speaker.asides = speakerObject.asides.map(DialogLine.fromJSON);
        speaker.dialog = speakerObject.dialog.map(DialogLine.fromJSON);

        return speaker;
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

    toJSON() {
        return {
            isOffScreen: this.isOffScreen,
            sentence: this.sentence
        }
    }

    static fromJSON(dialogLineObject: ISerializableDialogLine): DialogLine {
        const dialogLine = new DialogLine(dialogLineObject.isOffScreen);
        dialogLine.sentence = dialogLineObject.sentence.map(tokenObject => new Token(tokenObject.type, tokenObject.value));

        return dialogLine;
    }
}