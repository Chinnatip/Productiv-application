import * as IMDB from '../../method/imdb'
import * as THAIRATH from '../../method/thairath'

export default async function handle(req, res) {
  let data = {}
  const { path, id } = req.query
  //
  switch (path) {
    case 'imdb':
      data = await IMDB.fetch(id)
      break
    case 'thairath':
      data = await THAIRATH.fetch(id)
      break
    default:
      data = {}
  }
  res.json(data)
}
