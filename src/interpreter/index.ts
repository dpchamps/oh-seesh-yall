import {Speaker} from "../parser/Speaker";
import {MarkovChain} from "./MarkovChain";
import {TokenType} from "../lexer/token/TokenType";

export class Interpreter {
    static generateMarkovChain(speaker: Speaker, markovChain?: MarkovChain): MarkovChain {
        if (!markovChain)
            markovChain = new MarkovChain(speaker.name);

        for (let dialogLine of speaker.dialog) {
            if (dialogLine.sentence.length < 3)
                continue;

            for (let i = 0; i < dialogLine.sentence.length - 2; i += 1) {
                const firstWord = dialogLine.sentence[i];
                const secondWord = dialogLine.sentence[i + 1];
                const thirdWord = dialogLine.sentence[i + 2];
                let key = `${firstWord}`;
                if (secondWord.is(TokenType.GeneralPunctuation) || secondWord.is(TokenType.EndPunctuation))
                    key += `${secondWord} `;
                else
                    key += ` ${secondWord}`;
                const value = thirdWord.value.toLowerCase();

                key = key.toLowerCase();
                markovChain.add(key, value);

                if (i === 0)
                    markovChain.startKeys.add(key);
                if (i === dialogLine.sentence.length - 3)
                    markovChain.endKeys.add(value);
            }
        }

        return markovChain;
    }
}