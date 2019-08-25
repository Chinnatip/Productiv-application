import { demo_news } from '../../static/content/news'

export default function handle(req, res) {
  res.json(demo_news)
}
