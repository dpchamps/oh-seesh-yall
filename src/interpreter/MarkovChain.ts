export interface IStochasticWord {
    probability: number;
    value: string;
    count: number;
}

export class MarkovChain {
    identifier: string;
    chain: { [key: string]: ChainLink } = {};
    startKeys: Set<string> = new Set();
    endKeys: Set<string> = new Set();

    constructor(identifier: string) {
        this.identifier = identifier;
    }

    add(key: string, value: string) {
        if (!this.chain[key]) {
            this.chain[key] = new ChainLink();
        }
        const link = this.chain[key];

        link.insert(value);
    }

    toJSON(): any {
        return {
            identifier: this.identifier,
            chains: this.chain,
            startKeys: Array.from(this.startKeys),
            endKeys: Array.from(this.endKeys)
        }
    }
}

class ChainLink {
    totalCount: number = 0;
    content: Array<IStochasticWord> = [];

    constructor(content?: Array<IStochasticWord>) {
        if (content)
            this.content = content;
    }

    insert(value: string) {
        this.totalCount++;
        const count = this.getCount(value) + 1;
        const probability = 1;
        const stochasticWord = {
            probability,
            value,
            count
        };

        if (count > 1) {
            const index = this.content.findIndex(sWord => sWord.value === value);
            this.content[index] = stochasticWord;
        } else {
            this.content.push(stochasticWord);
        }

        this.calculateProbabilities();
    }

    getCount(value: string) {
        return this.content
            .filter(x => x.value === value)
            .reduce((sum, sWord) => sum + sWord.count, 0);
    }

    calculateProbabilities() {
        for (let word of this.content) {
            word.probability = word.count / this.totalCount;
        }
    }

    toJSON() {
        return this.content;
    }
}