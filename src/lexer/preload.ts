const hyperLink = /http:\/\/.*?(?=\s|$)/g;

/**
 * Clean an incoming string, stripping away unnecessary characters and words
 * @param str
 */
export const preload = (str: string): string => {
    str = str.replace(hyperLink, '');
    str = str.replace(/â/g, '');
    str = str.replace(/\*/g, '');
    str = str.replace(/Ã/g, '');
    str = str.replace(/¶/g, '');
    str = str.replace(/=/g, '');
    str = str.replace(/œ/g, '');
    return str.trim();
};