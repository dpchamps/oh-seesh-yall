const puppeteer = require('puppeteer');

export default async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    return {
        page,
        async closeConnection(){
            await browser.close();
        }
    }
};