import {ChainLink, ISerializableMarkovChain, MarkovChain} from "../MarkovChain";

export class Bot {
    markovChain: MarkovChain;
    maxDepth = 10;

    constructor(markovChain: ISerializableMarkovChain | MarkovChain) {
        if (!(markovChain instanceof MarkovChain))
            markovChain = MarkovChain.fromJSON(markovChain);

        this.markovChain = markovChain;
        if (!this.markovChain.endKeys.has('.'))
            this.markovChain.endKeys.add('.');
    }

    private getValueFromLink(link: ChainLink): string {
        link.shuffle();
        const rand = Math.random() * link.maxCount | 0;

        for (let word of link.content.sort((a, b) => a.probability - b.probability)) {
            const weight = word.probability * link.totalCount;
            if (weight >= rand)
                return word.value
        }

        throw new Error('Something terrible happened');
    }

    createSentence(key?: string, sentence: string = '', depth = 0): string {
        if (typeof key === 'undefined')
            key = Array.from(this.markovChain.startKeys)[Math.random() * this.markovChain.startKeys.size | 0];

        if (!sentence)
            sentence += key;

        const nextLink = this.markovChain.chain[key];

        if (typeof nextLink === 'undefined') {
            //how to handle this gracefully?
            return sentence += '.';
        }
        const nextValue = this.getValueFromLink(nextLink);

        if (nextValue.match(/[.!?]/) || depth > this.maxDepth)
            return sentence += ' ' + nextValue;

        const nextKey = key.split(' ')[1] + ' ' + nextValue;
        return this.createSentence(nextKey, sentence + ' ' + nextValue, depth++);
    }
}