import fs from 'fs';

export const loadFile = (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (error, data) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(data.toString('utf8'));
        });
    });
};

export const loadFilesInDirectory = (path: string): Promise<Array<string>> => {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (error, files) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(files);
        })
    })
};