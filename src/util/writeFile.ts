import fs from 'fs';

export const writeFile = async (path: string, data: string | Buffer) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, error => {
            if (error)
                reject(error)

            resolve(true);
        });
    });
};