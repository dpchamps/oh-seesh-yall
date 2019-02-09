import {loadFile} from "./loadFile";
import {Parser} from "../parser";
import {MarkovChain} from "../interpreter/MarkovChain";
import {Interpreter} from "../interpreter";
import {writeFile} from "./writeFile";
import * as fs from "fs";

(async () => {
    const scriptFiles = fs.readdirSync('data/full-scripts/');
    let chains: { [key: string]: MarkovChain } = {};
    for (let file of scriptFiles) {
        const script = await loadFile(`data/full-scripts/${file}`);
        const parser = new Parser(script);
        try {
            parser.parse();
        } catch (e) {
            console.log(e);
            process.exit(1);
        }

        for (let speaker of Object.values(parser.speakers)) {
            if (!chains[speaker.name])
                chains[speaker.name] = new MarkovChain(speaker.name);

            Interpreter.generateMarkovChain(speaker, chains[speaker.name]);
        }
    }

    for (let [filename, chain] of Object.entries(chains)) {
        console.log('writing', filename, Object.keys(chain.chain).length);
        await writeFile(`data/chains/${filename}.json`, JSON.stringify(chain.toJSON(), null, 1));
    }
})();