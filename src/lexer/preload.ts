const hyperLink = /http:\/\/.*?(?=\s|$)/g;
const speakerToken = /^(.+?)([:\-])/gm;

/**
 * Clean an incoming string, stripping away unnecessary characters and words
 * @param str
 */
export const preload = (str: string): string => {
    //remove links... could potentially save these in a separate file, and use them for something later...
    str = str.replace(hyperLink, '');
    str = str.replace(/[â*Ã¶œ^~]/g, '');
    str = processSpeaker(str);
    return str.trim();
};

/**
 * Format a
 * @param str
 */
const processSpeaker = (str: string): string => {
    const r = new RegExp(speakerToken);
    let match;
    while (match !== null) {
        match = r.exec(str);
        if (match === null) break;
        const screenPresence = match[2] === ':' ? '^' : '~';
        str = str.replace(match[0], match[1].trim().replace(/\s/g, '_') + screenPresence);
    }

    return str
};