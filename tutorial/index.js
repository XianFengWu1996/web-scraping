const puppeteer = require('puppeteer');
const fs = require('fs/promises');
const cron = require('node-cron');

async function start() {
  const browser = await puppeteer.launch(); // launch the browser
  const page = await browser.newPage(); // open a new page
  await page.goto('https://learnwebcode.github.io/practice-requests/');
  //   await page.screenshot({ path: 'amazing.png' }); // taking screenshots
  const names = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.info strong')).map(
      (x) => x.textContent
    );
  });

  await fs.writeFile('name.txt', names.join('\r\n'));

  // grab
  await page.click('#clickme');
  const clickedData = await page.$eval('#data', (el) => el.textContent);

  const photos = await page.$$eval('img', (imgs) => {
    return imgs.map((x) => x.src);
  });

  await page.type('#ourfield', 'blue');
  await Promise.all([page.click('#ourform button'), page.waitForNavigation()]);
  const info = await page.$eval('#message', (el) => el.textContent);

  console.log(info);

  for (const photo of photos) {
    const imagePage = await page.goto(photo);
    await fs.writeFile(photo.split('/').pop(), await imagePage.buffer());
  }

  await browser.close();
}

cron.schedule('*/5 * * * * *', start);
