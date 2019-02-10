"use strict";

import {ISerializableSpeaker, Speaker} from "../parser/Speaker";
import {MarkovChain} from "../MarkovChain";
import {loadFile, loadFilesInDirectory} from "./loadFile";
import {writeFile} from "./writeFile";

export const buildMarkovChain = (speaker: Speaker, markovChain?: MarkovChain) => {
    if (!markovChain)
        markovChain = new MarkovChain(speaker.name);

    speaker.dialog.forEach(dialogLine => {
        if (dialogLine.sentence.length > 3) {
            for (let i = 0; i < dialogLine.sentence.length - 2; i += 1) {
                const firstWord = dialogLine.sentence[i];
                const secondWord = dialogLine.sentence[i + 1];
                const thirdWord = dialogLine.sentence[i + 2];
                const key = `${firstWord} ${secondWord}`.toLowerCase();
                const value = `${thirdWord}`.toLowerCase();

                markovChain!.add(key, value);
                if (i === 0)
                    markovChain!.startKeys.add(key);
                if (i === dialogLine.sentence.length - 3)
                    markovChain!.endKeys.add(value);
            }
        }
    });

    return markovChain;
};

export const buildChainFromFile = async (filename: string) => {
    try {
        const speakerObject = await loadFile(filename);
        const speaker = Speaker.fromJSON(JSON.parse(speakerObject));

        return buildMarkovChain(speaker);
    } catch (e) {
        throw new Error(`Couldn't load / parse speaker: ${e}`)
    }
};

export const batchBuildChains = async () => {
    const files = await loadFilesInDirectory('data/speakers');
    for (let fileName of files) {
        console.log(`Parsing ${fileName}`);
        const chain = await buildChainFromFile(`data/speakers/${fileName}`);
        console.log(`Writing data/chains/${chain.identifier}.json`);
        await writeFile(`data/chains/${chain.identifier}.json`, JSON.stringify(chain, null, 0));
    }
};