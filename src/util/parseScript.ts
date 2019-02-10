import {Parser} from "../parser";
import {loadFile, loadFilesInDirectory} from "./loadFile";
import {writeFile} from "./writeFile";
import {Speaker} from "../parser/Speaker";

export const parseScript = async (filename: string) => {
    const file = await loadFile(filename);
    const parser = new Parser(file);
    parser.parse();

    return parser.speakers;
};

export const saveSpeakers = async (speakers: { [key: string]: Speaker }) => {
    for (let [speakerName, speaker] of Object.entries(speakers)) {
        let preExistingSpeakerFile;

        try {
            preExistingSpeakerFile = await loadFile(`data/speakers/${speakerName}.txt`);
            preExistingSpeakerFile = JSON.parse(preExistingSpeakerFile);
            speaker.dialog = [...speaker.dialog, ...preExistingSpeakerFile.dialog];
            speaker.asides = [...speaker.asides, ...preExistingSpeakerFile.asides];
        } catch (e) {
            //ignore, file doesn't exist
        }

        console.log(`\tWriting data/speakers/${speakerName}.txt`);
        await writeFile(`data/speakers/${speakerName}.txt`, JSON.stringify(speaker, null, 0));
    }
};

export const batchParseScripts = async () => {
    const files = await loadFilesInDirectory('data/full-scripts');
    for (let fileName  of files) {
        console.log(`Parsing ${fileName}`);
        const speakers = await parseScript(`data/full-scripts/${fileName}`);
        await saveSpeakers(speakers);
    }
};