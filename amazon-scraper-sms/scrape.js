// Package
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config({ path: path.resolve(`${__dirname}`, '../.env') });
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const url =
  'https://www.amazon.com/Apple-MacBook-14-inch-8%E2%80%91core-14%E2%80%91core/dp/B09JQL8KP9/ref=sr_1_3?crid=TQ7F3DD54YXH&keywords=macbook&qid=1674182970&sprefix=macbook%2Caps%2C101&sr=8-3&ufe=app_do%3Aamzn1.fos.4dd97f68-284f-40f5-a6f1-1e5b3de13370&th=1';

const product = { name: '', price: '', link: '' };

const handle = setInterval(scrape, 20000); // run the function every 20 seconds

async function scrape() {
  // fetch the data

  const { data } = await axios.get(url);

  // load up the html
  const $ = cheerio.load(data);
  const item = $('div#dp-container');
  // extract the data that we need
  product.name = $(item).find('h1 span#productTitle').text();
  product.link = url;
  const price = $(item)
    .find('span .a-price-whole')
    .first()
    .text()
    .replace(/[,.]/g, '');
  product.price = parseInt(price);

  if (product.price < 2000) {
    client.messages
      .create({
        body: `The price of ${product.name} went below $${product.price}. Purchase it at ${product.link}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.VERIFY_PHONE_NUMBER,
      })
      .then((msg) => {
        console.log('the message has been successfully sent');
        // reset the interval
        clearInterval(handle);
      })
      .catch((e) => {
        // handle the error
        console.log(e);
      });
  }
}

scrape();
