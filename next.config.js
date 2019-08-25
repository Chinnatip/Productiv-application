const webpack = require('webpack')
const withPlugins = require('next-compose-plugins')
const withCSS = require('@zeit/next-css')
const optimizedImages = require('next-optimized-images')
const withOffline = moduleExists('next-offline') ? require('next-offline') : {}

// fix: prevents error when .css files are required by node
if (typeof require !== 'undefined') {
  require.extensions['.css'] = file => {}
}

const nextConfig = {
  target: 'serverless',
  workboxOpts: {
    swDest: 'static/service-worker.js',
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'https-calls',
          networkTimeoutSeconds: 15,
          expiration: {
            maxEntries: 150,
            maxAgeSeconds: 30 * 24 * 60 * 60
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  },
  webpack: config => {
    config.node = {
      fs: 'empty'
    }
    config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            limit: 1000,
            name() {
              return `[name].[ext]`
            }
          }
        }
      ]
    })
    return config
  }
}

module.exports = withPlugins(
  [
    [
      withCSS,
      {
        cssLoaderOptions: {
          url: false
        }
      }
    ],
    optimizedImages
  ],
  moduleExists('next-offline') ? withOffline(nextConfig) : nextConfig
)

function moduleExists(name) {
  try {
    return require.resolve(name)
  } catch (error) {
    return false
  }
}
