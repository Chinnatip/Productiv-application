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
          <link href="/static/style/antd-input.css" rel="stylesheet" />
        </Head>
      </Container>
    )
  }
}

export default MyApp
