import React, { Component, Fragment } from 'react'
import moment from 'moment'
// import Link from 'next/link'
import Head from '../components/head'
import Nav from '../components/nav'
import { Button, Input, Modal, message, Select, Slider } from 'antd'
import { number } from 'prop-types'
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
import axios from 'axios'
import '../static/css/App.css'
// import logo from '../static/assets/ic_code.png'
// import facebookLogo from '../static/assets/facebook_icon.png'
// import whiteLogo from '../static/assets/news_icon_white.png'
// import shareLogo from '../static/assets/share_icon.png'
// import imgCode from '../static/assets/ic_code.png'
// import imgTravel from '../static/assets/ic_travel.png'

import 'antd/es/slider/style/index.css'
import 'antd/es/select/style/index.css'
import 'antd/es/button/style/index.css'
import 'antd/es/message/style/index.css'
import 'antd/es/input/style/index.css'
import 'antd/es/modal/style/index.css'

// Antd text area
const { TextArea } = Input
const { Option } = Select
const POST_NEWS_URL =
  'https://79a8q3agzf.execute-api.ap-southeast-1.amazonaws.com/dev/contents/json-send'

// Prepare windows
interface Window {
  responsiveVoice?: any
}
declare var window: Window

interface NewResponse {
  title: string
  datetime: string
  provider: string
  description: string[]
  image: string[]
}

// Method parse text to read
// const textToRead = (content: NewResponse) => {
//   return content.title + ' ' + content.description.map(text => text)
// }
const textSplitter = (content: NewResponse) => {
  let result = []
  const { description } = content
  description.map(text => {
    text.split(' ').map(t => result.push(t))
  })
  return result
}

// React Component
class Home extends React.Component<
  {},
  {
    newLists: any
    textSeq: string[]
    currentReader: number
    currentText: string
    sharedID: string
    voiceLanguage: string
    voicePitch: number
    voiceRate: number
    shareModal: boolean
    settingModal: boolean
    loader: boolean
    userSession: any
  }
> {
  constructor(props) {
    super(props)
    this.state = {
      currentReader: 0,
      newLists: [],
      textSeq: [],
      currentText: '. . .',
      sharedID: '',
      voiceLanguage: 'Thai Female',
      voicePitch: 0.9,
      voiceRate: 1,
      shareModal: false,
      settingModal: false,
      loader: false,
      userSession: null
    }
    this.onChange = this.onChange.bind(this)
    this.newsUpload = this.newsUpload.bind(this)
    this.loginSession = this.loginSession.bind(this)
    this.logoutSession = this.logoutSession.bind(this)
    this.languageChange = this.languageChange.bind(this)
    this.changeContent = this.changeContent.bind(this)
    this.changeCurrentReader = this.changeCurrentReader.bind(this)
    this.reader = this.reader.bind(this)
  }

  async componentDidMount() {
    const res = await axios.get('/api/dailynews')
    if (res.data.length > 0) {
      this.setState({
        newLists: res.data,
        textSeq: textSplitter(res.data[0])
      })
    }

    //
    if (localStorage.getItem('userSession') !== null) {
      this.setState({
        userSession: JSON.parse(localStorage.getItem('userSession'))
      })
    }
  }

  onChange = e => {
    this.setState({ currentText: e.target.value })
  }
  newsUpload = async () => {
    const { voiceLanguage, voicePitch, voiceRate, currentText } = this.state
    // const text = this.state.currentText
    message.info('Backup text to server ... ')
    const response = await axios.post(POST_NEWS_URL, {
      bucket: 'thai-news-reader',
      text: currentText,
      voiceLanguage,
      voicePitch,
      voiceRate
    })
    const {
      data: { newsid, status }
    } = response
    if (status) {
      this.setState({
        sharedID: `https://thai-news-reader.netlify.com?newsid=${newsid}`,
        shareModal: true
      })
    }
  }
  loginSession = response => {
    if (response.status !== 'unknown') {
      const {
        email,
        id,
        name,
        picture: {
          data: { url }
        }
      } = response
      const userBody = {
        email,
        id,
        name,
        picture: url
      }
      localStorage.setItem('userSession', JSON.stringify(userBody))
      this.setState({
        userSession: userBody
      })
    }
  }
  logoutSession = () => {
    localStorage.removeItem('userSession')
    this.setState({
      userSession: null
    })
  }

  languageChange = e => {
    this.setState({
      voiceLanguage: e
    })
  }

  pitchChange = e => {
    this.setState({
      voicePitch: e
    })
  }

  speedChange = e => {
    this.setState({
      voiceRate: e
    })
  }

  changeContent = index => {
    const { newLists } = this.state
    this.setState({ textSeq: textSplitter(newLists[index]) })
  }
  changeCurrentReader = index => {
    this.setState({ currentReader: index })
  }
  reader = () => {
    const { textSeq } = this.state
    const language = 'Thai Female'
    textSeq.map((text, index) => {
      const { responsiveVoice } = window
      responsiveVoice.speak(text, language, {
        pitch: 0.8,
        rate: 1,
        onEnd: function() {
          this.changeCurrentReader(index + 1)
          console.log('Voice ended')
        }
      })
    })
  }

  render() {
    const { newLists, textSeq, currentReader } = this.state
    return (
      <div>
        <Head title="Home" />
        <Nav />

        <div className="container">
          <img
            src="/static/assets/ic_code.png"
            className="App-logo"
            alt="logo"
            style={{ maxHeight: '96px' }}
          />
          <ul className="content">
            {newLists.map(
              (
                { title, description, image, provider, datetime }: NewResponse,
                index
              ) => {
                return (
                  <li key={index} onClick={() => this.changeContent(index)}>
                    <div className="image-frame">
                      <img src={image[0]} alt={`${provider}-${title}`} />
                    </div>
                    <div className="content-text">
                      <h3>
                        [{provider.toUpperCase()}] {title}
                      </h3>
                      <h5>{description[0].substring(0, 160)}...</h5>
                      <h5 className="date">
                        วันที่ {moment(datetime).format('DD MMM YYYY - HH:mm')}
                      </h5>
                    </div>
                  </li>
                )
              }
            )}
          </ul>

          <div className="reader">
            {textSeq.map((text, index) => (
              <span
                style={{
                  fontWeight: currentReader === index ? 500 : 300,
                  color: currentReader === index ? 'red' : 'black'
                }}
              >
                {text}{' '}
              </span>
            ))}
          </div>
          <div>
            <button onClick={() => this.reader()}>PLAY</button>
          </div>
        </div>

        <style jsx>{`
          .container {
            display: flex;
          }
          ul.content {
            max-width: 540px;
          }
          .content li {
            display: flex;
            align-items: center;
            padding: 10px 16px;
            border: 1px solid #d2d2d2;
            margin-bottom: 7px;
            cursor: pointer;
            transition: 0.5s;
          }
          .content li:hover {
            background: #f1f1f1;
          }
          .content li .image-frame {
            min-width: 148px;
            height: 90px;
            overflow: hidden;
            position: relative;
            margin-right: 26px;
          }
          .content li .image-frame img {
            height: 100%;
          }
          .content li .content-text {
            flex-grow: 1;
          }
          .content li .content-text h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 300;
            margin-bottom: 6px;
          }
          .content li .content-text h5 {
            margin: 0;
            font-size: 12px;
            font-weight: 200;
            color: grey;
          }
          .content li .content-text h5.date {
            color: #0683e6;
            margin-top: 6px;
          }
          .reader {
            flex-grow: 1;
          }
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
