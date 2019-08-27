const puppeteer = require('puppeteer')

export async function fetch(movie_id) {
  const URL = `https://www.imdb.com/title/${movie_id}/`
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  //
  await page.goto(URL, { waitUntil: 'networkidle0' })
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
  return data
}
