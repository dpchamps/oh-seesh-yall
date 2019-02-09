import path from 'path';
import launchPuppeteer from './launchPuppeteer';
import {writeFile} from "../util/writeFile";
import {stripSpecialChars} from "../util/stripSpecialChars";
import {Page, ElementHandle} from 'puppeteer';
import {URLSearchParams, URL} from "url";

interface IScript {
    title: string;
    content: string;
}

const queries = new URLSearchParams([
    ['search', 'a'],
    ['from-date', ''],
    ['to-date', ''],
    ['do-search', '1']
]);

const scriptArchiveUrl = new URL(`http://scripts.jakeandamir.com/index.php?${queries.toString()}`);

//Load the J/A Script archive, search for a single letter 'a'
// and save return an array of scripts
const scrape = async (page: Page) => {

    console.log('Loading page...');

    await page.goto(scriptArchiveUrl.toString(), {
        waitUntil: "networkidle0"
    });

    console.log('page load complete, finding scripts...');

    const scriptContainers = await page.$$('.episode-item');
    return await Promise.all(scriptContainers.map(async (scriptContainer: ElementHandle): Promise<IScript> => {
        const title = await scriptContainer.$eval('.header-inner-title', x => x.textContent || '');
        const content = await scriptContainer.$eval('.episode-script-inner', x => x.textContent || '');

        return {title, content};
    }));
};

(async () => {
    const {page, closeConnection} = await launchPuppeteer();
    const scripts = await scrape(page);

    await closeConnection();
    console.log(`Scraped ${scripts.length} scripts. Saving...`);
    scripts.forEach(async script => {
        const filename = stripSpecialChars(script.title);
        const extension = '.txt';
        const savePath = path.join(
            __dirname,
            '../../data/full-scripts',
            filename + extension
        );

        try {
            await writeFile(savePath, script.content.trim());
        } catch (e) {
            console.error(e)
        }
    });
})();

