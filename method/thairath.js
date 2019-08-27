const puppeteer = require('puppeteer')

export async function fetch(newsKey) {
  const URL = `https://www.thairath.co.th/${newsKey.split('^').join('/')}`
  const browser = await puppeteer.launch()
  try {
    const page = await browser.newPage()
    //
    await page.goto(URL, { waitUntil: 'networkidle0' })
    let bodyHTML = await page.evaluate(() => {
      let title = document.querySelector('h1').innerText
      let cover = document.querySelectorAll(
        'article[id="article-content"] > div > picture > img'
      )[0]
      let description = document.querySelectorAll(
        'article[id="article-content"] > div'
      )[2].innerText
      return {
        title,
        description,
        coverImage: cover.src
      }
    })
    // console.log('evel >>>', bodyHTML)
    return { body: bodyHTML }
  } catch (error) {
    console.log(error)
  } finally {
    await browser.close()
  }
}
