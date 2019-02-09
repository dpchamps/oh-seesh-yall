import {Lexer} from "./lexer";
import {loadFile} from "./util/loadFile";
import {TokenType} from "./lexer/token/TokenType";
import {Token} from "./lexer/token/Token";
import {Parser} from "./parser";
import {Interpreter} from "./interpreter";
import fs from 'fs';
import {MarkovChain} from "./interpreter/MarkovChain";
import {writeFile} from "./util/writeFile";
import readline from 'readline';

const readInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

(async () => {
    const amirFile = await loadFile('data/chains/Amir.json');
    const jakeFile = await loadFile('data/chains/Jake.json');
    const amir = JSON.parse(amirFile);
    const jake = JSON.parse(jakeFile);

    let currentSpeaker = amir;
    const getPrompt = (prompt: string = '>'): Promise<string> => {
        return new Promise((res, rej) => {
            try {
                readInterface.question(prompt, answer => {
                    res(answer)
                })
            } catch (error) {
                rej(error);
            }
        });
    };

    const getStartKey = (input: string) => {
        let startKeyIndex = currentSpeaker.startKeys.findIndex((s: string) => input.match(s) !== null);
        if (startKeyIndex === -1) {
            startKeyIndex = Math.random() * currentSpeaker.startKeys.length | 0;
        }
        return currentSpeaker.startKeys[startKeyIndex];
    };

    const outputResponse = (input: string) => {
        let key = getStartKey(input);
        let chain = currentSpeaker.chains[key];

        let output = key;
        let canContinue = true;
        while (canContinue) {
            let nextWord = '';
            if (chain.length === 1) {
                nextWord = chain[0].value;
            } else {
                nextWord = (chain[chain.length * Math.random() | 0]).value;
            }
            key = key.split(' ')[1];
            key += nextWord.match(/[,.!?]/) === null ? ' ' + nextWord : nextWord + ' ';

            output += ' ' + nextWord;
            chain = currentSpeaker.chains[key];

            if (typeof chain === 'undefined') {
                key = getStartKey(key+nextWord);
                chain = currentSpeaker.chains[key];
            }
            if (output.length > 50) {
                canContinue = nextWord.match(/[.?]/) === null;
                if(canContinue)
                    output += ' ' + key;
            }

        }
        return output;
    };

    // const loop = async () => {
    //     const message = await getPrompt();
    //     if (message === 'exit')
    //         return;
    //
    //     outputResponse(message);
    //     await loop();
    // };
    //
    // await loop();
    let lastOutput = '';
    for (let i = 0; i < 50; i++) {
        lastOutput = outputResponse(lastOutput);
        console.log(`${currentSpeaker.identifier} : ${lastOutput}`);
        currentSpeaker = i % 2 === 0 ? jake : amir;
    }

})();
