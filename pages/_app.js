import React from 'react'
import App, { Container } from 'next/app'
import Head from 'next/head'

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    return { pageProps }
  }
  render() {
    const { Component, pageProps } = this.props
    return (
      <Container>
        <Component {...pageProps} />
        <Head>
          <script src="https://code.responsivevoice.org/responsivevoice.js?key=FNXkSrIO" />
          <link rel="manifest" href="/static/manifest.json" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#000000" />
          <title>NewsReader | อ่านทำไม? ฟังสิ!</title>
        </Head>
      </Container>
    )
  }
}

export default MyApp
