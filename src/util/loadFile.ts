import fs from 'fs';

export const loadFile = (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (error, data) => {
            if (error)
                reject(error);

            resolve(data.toString('utf8'));
        });
    });
};