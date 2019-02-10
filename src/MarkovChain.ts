export interface IStochasticWord {
    probability: number;
    value: string;
    count: number;
}

export interface ISerializableMarkovChain {
    identifier: string,
    chain: { [key: string]: ISerializableChainLink },
    startKeys: Array<string>,
    endKeys: Array<string>
}

export interface ISerializableChainLink {
    content: Array<IStochasticWord>;
    maxCount: number;
    totalCount: number;
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
            chain: this.chain,
            startKeys: Array.from(this.startKeys),
            endKeys: Array.from(this.endKeys)
        }
    }

    static fromJSON(mChainObject: ISerializableMarkovChain): MarkovChain {
        const mChain = new MarkovChain(mChainObject.identifier);

        mChain.startKeys = new Set(mChainObject.startKeys);
        mChain.endKeys = new Set(mChainObject.endKeys);
        for (let chainEntry of Object.entries(mChainObject.chain)) {
            mChain.chain[chainEntry[0]] = ChainLink.fromJSON(chainEntry[1]);
        }

        return mChain;
    }
}

export class ChainLink {
    totalCount: number = 0;
    maxCount: number = 1;
    content: Array<IStochasticWord> = [];

    constructor(content?: Array<IStochasticWord>) {
        if (content)
            this.content = content;
    }

    insert(value: string) {
        this.totalCount++;
        const index = this.content.findIndex(sWord => sWord.value === value);

        if (index !== -1) {
            this.content[index].count += 1;
            this.maxCount = Math.max(this.maxCount, this.content[index].count)
        } else {
            this.content.push({
                value,
                probability: 1,
                count: 1
            });
        }

        this.calculateProbabilities();
    }

    calculateProbabilities() {
        for (let word of this.content) {
            word.probability = word.count / this.totalCount;
        }
    }

    toJSON() {
        return {
            content: this.content,
            maxCount: this.maxCount,
            totalCount: this.totalCount
        };
    }

    shuffle() {
        for (let i = this.content.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.content[i], this.content[j]] = [this.content[j], this.content[i]];
        }
    }


    static fromJSON(chain: ISerializableChainLink): ChainLink {
        const chainLink = new ChainLink(chain.content);
        chainLink.maxCount = chain.maxCount;
        chainLink.totalCount = chain.totalCount;

        return chainLink;
    }
}