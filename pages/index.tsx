import React, { Component } from 'react'
import Link from 'next/link'
import Head from '../components/head'
import Nav from '../components/nav'
import { Button, Input } from 'antd'
import 'antd/es/button/style/index.css'
import 'antd/es/input/style/index.css'

const { TextArea } = Input

// Prepare windows
interface Window {
  responsiveVoice?: any
}
declare var window: Window

// React Component
class Home extends React.Component<{}, { currentText: string }> {
  constructor(props) {
    super(props)
    this.state = {
      currentText: ''
    }
    this.onChange = this.onChange.bind(this)
  }

  onChange = e => {
    this.setState({ currentText: e.target.value })
  }

  render() {
    const { currentText } = this.state
    const language = 'Thai Female'
    const voiceConfig = {
      pitch: 0.8,
      rate: 1.1
    }
    return (
      <div>
        <Head title="Home" />
        <Nav />
        <div className="hero">
          <h1 className="title">Welcome to Next!</h1>
          <p className="description">
            To get started, edit <code>pages/index.js</code> and save to reload.
          </p>

          <div className="row">
            <TextArea
              value={currentText}
              rows={20}
              style={{ maxWidth: '720px' }}
              onChange={this.onChange}
            />
            <br />
            <Button
              size="large"
              onClick={() => {
                window.responsiveVoice.speak(currentText, language, voiceConfig)
              }}
            >
              อ่านข่าวนี้
            </Button>
          </div>
        </div>

        <style jsx>{`
          .hero {
            width: 100%;
            color: #333;
          }
          .title {
            margin: 0;
            width: 100%;
            padding-top: 80px;
            line-height: 1.15;
            font-size: 48px;
          }
          .title,
          .description {
            text-align: center;
          }
          .row {
            max-width: 880px;
            margin: 80px auto 40px;
            display: flex;
            flex-direction: row;
            justify-content: space-around;
          }
          .card {
            padding: 18px 18px 24px;
            width: 220px;
            text-align: left;
            text-decoration: none;
            color: #434343;
            border: 1px solid #9b9b9b;
          }
          .card:hover {
            border-color: #067df7;
          }
          .card h3 {
            margin: 0;
            color: #067df7;
            font-size: 18px;
          }
          .card p {
            margin: 0;
            padding: 12px 0 0;
            font-size: 13px;
            color: #333;
          }
        `}</style>
      </div>
    )
  }
}

export default Home
