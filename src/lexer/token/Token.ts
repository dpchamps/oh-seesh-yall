import {TokenType} from "./TokenType";

export class Token {
    type: TokenType;
    value: any;

    constructor(type: TokenType, value: any) {
        this.type = type;
        this.value = value;
    }

    is(type: TokenType) {
        return this.type === type;
    }

    equals(a: any) {
        return this.value === a;
    }

    toString() {
        return `${this.value}`;
    }

    toJSON() {
        return {
            type: this.type,
            value: this.value
        }
    }
}