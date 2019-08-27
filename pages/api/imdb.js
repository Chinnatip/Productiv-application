const puppeteer = require('puppeteer')

// scrapper_setup
const IMDB_URL = movie_id => `https://www.imdb.com/title/${movie_id}/`

export default async function handle(req, res) {
  const MOVIE_ID = req.query.mid
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  //
  await page.goto(IMDB_URL(MOVIE_ID), { waitUntil: 'networkidle0' })
  //
  let data = await page.evaluate(() => {
    let title = document.querySelector('div[class="title_wrapper"] > h1')
      .innerText
    let rating = document.querySelector('span[itemprop="ratingValue"]')
      .innerText
    let ratingCount = document.querySelector('span[itemprop="ratingCount"]')
      .innerText
    return {
      title,
      rating,
      ratingCount
    }
  })
  //
  await browser.close()
  res.json(data)
}
