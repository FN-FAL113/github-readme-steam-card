const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

class PuppeteerChromium {

    constructor(){}

    async launchBrowser() {
        // use "await chromium.puppeteer.launch" (requires puppeteer as dev package) in windows or mac when running locally
        this.browser = await puppeteer.launch({
            executablePath: await chromium.executablePath,
            args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
            headless: true,
            ignoreHTTPSErrors: true
        });
    }

    async newPage(){
       this.page = await this.browser.newPage();
    }

    async setPageContent(svg){
        await this.page.setContent(svg)
    }

    async setPageViewPort(width = 400, height = 150){
        await this.page.setViewport({ width: width, height: height, deviceScaleFactor: 2 })
    }

    async waitForTimeout(timeout){
        // time out for the page to load assets before taking a screenshot
        await this.page.waitForTimeout(timeout)
    }

    async screenshot(){
        this.image = await this.page.screenshot({ encoding: "base64", omitBackground: true, type: 'png'})
    }

    async closeBrowser(){
        await this.browser.close()
    }

    getImage(){
       return this.image
    }
    
}

module.exports = PuppeteerChromium