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
import '../static/css/index.css'
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
  }

  async componentDidMount() {
    // const res = await axios.get('/api/dailynews')
    const search = location.search
    const searchParams = new URLSearchParams(search)
    if (searchParams.has('newsid')) {
      const newsID = searchParams.get('newsid')
      fetch(
        `https://thai-news-reader.s3-ap-southeast-1.amazonaws.com/json/${newsID}.json`
      )
        .then(response => response.json())
        .then(news => {
          message.success('Place text at input box')
          console.log('get news', news.message)
          const {
            message: { text, voiceLanguage, voicePitch, voiceRate }
          } = news
          this.setState({
            currentText: text,
            voiceLanguage: voiceLanguage,
            voicePitch: voicePitch,
            voiceRate: voiceRate
          })
        })
        .catch(error => {
          console.error(error)
        })
    } else {
      this.setState({
        currentText:
          'กรุณาแปะเนื้อหาข่าวที่นี่ จากนั้น กดปุ่มเพื่อเริ่มอ่านข่าว ...'
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

  render() {
    const {
      currentText,
      userSession,
      voiceLanguage,
      voicePitch,
      voiceRate
    } = this.state
    const language = voiceLanguage
    const voiceConfig = {
      pitch: voicePitch,
      rate: voiceRate
    }
    return (
      <div
        className="App"
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        {userSession !== null && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              color: 'white',
              display: 'flex'
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div>{userSession.name}</div>
              <Button onClick={this.logoutSession}>ออกจากระบบ</Button>
            </div>
            <img
              src={userSession.picture}
              alt=""
              style={{
                height: '32px',
                borderRadius: '20px',
                marginLeft: '12px'
              }}
            />
          </div>
        )}
        <img className="img-code" src="/static/assets/ic_code.png" alt="" />
        <img className="img-travel" src="/static/assets/ic_travel.png" alt="" />
        <header className="App-header">
          <div style={{ marginBottom: '28px', display: 'flex' }}>
            <img
              src="/static/assets/news_icon_720.png"
              className="App-logo"
              alt="logo"
              style={{ maxHeight: '96px' }}
            />
            <div
              style={{
                textAlign: 'left',
                paddingLeft: '20px',
                marginLeft: '20px',
                borderLeft: '1px solid #ffffff54'
              }}
            >
              <h1
                style={{
                  margin: '0',
                  fontSize: '40px',
                  fontFamily: 'Roboto',
                  color: '#ff7363'
                }}
              >
                NewsReader
              </h1>
              <h4
                style={{
                  margin: '0',
                  fontSize: '28px',
                  fontFamily: 'Roboto',
                  color: '#e2908a'
                }}
              >
                อ่านทำไม ? ฟังสิ !
              </h4>
            </div>
          </div>
          {userSession == null && (
            <Fragment>
              <FacebookLogin
                appId="2642223592507853"
                autoLoad
                fields="name,email,picture"
                callback={this.loginSession}
                render={renderProps => (
                  <Button
                    size="large"
                    className="_button-facebook"
                    onClick={renderProps.onClick}
                  >
                    <img
                      src="/static/assets/facebook_icon.png"
                      alt="click to read"
                      style={{
                        verticalAlign: 'initial',
                        height: '15px',
                        marginRight: '7px'
                      }}
                    />
                    LOGIN WITH FACEBOOK
                  </Button>
                )}
              />
              <br />
            </Fragment>
          )}
          <TextArea
            className="_text-area"
            value={currentText}
            rows={14}
            style={{
              minHeight: '390px',
              maxWidth: '720px',
              borderRadius: '5px',
              background: '#272727',
              color: '#dedede',
              fontSize: '16px',
              letterSpacing: '0.5px',
              border: '1px solid grey',
              boxShadow: '0 9px 20px #252222',
              padding: '12px'
            }}
            onChange={this.onChange}
          />
          <br />
          <div>
            <Button
              size="large"
              className="_button"
              onClick={() => {
                window.responsiveVoice.speak(currentText, language, voiceConfig)
              }}
            >
              <img
                src="/static/assets/news_icon_white.png"
                alt="click to read"
                style={{
                  height: '15px',
                  marginRight: '7px'
                }}
              />
              อ่านข่าวนี้
            </Button>
            <span style={{ width: '14px', display: 'inline-block' }} />
            <Button
              size="large"
              className="_button-red"
              onClick={() => this.newsUpload()}
            >
              <img
                src="/static/assets/share_icon.png"
                alt="click to read"
                style={{
                  height: '15px',
                  marginRight: '7px'
                }}
              />
              แชร์ข่าวนี้
            </Button>
            <span style={{ width: '14px', display: 'inline-block' }} />
            <Button
              size="large"
              className="_button-grey"
              onClick={() => this.setState({ settingModal: true })}
            >
              ตั้งค่า
            </Button>
          </div>
        </header>
        <Modal
          title="settings"
          visible={this.state.settingModal}
          onCancel={() => this.setState({ settingModal: false })}
          footer={null}
        >
          <h4>
            <span>เสียงอ่านภาษา</span>
            <Select
              defaultValue={voiceLanguage}
              style={{ width: 120 }}
              onChange={this.languageChange}
            >
              <Option value="Thai Female">ภาษาไทย</Option>
              <Option value="UK English Female">ภาษาอังกฤษ</Option>
            </Select>
          </h4>
          <h4>
            <span>ระดับเสียง</span>
            <Slider
              defaultValue={voicePitch}
              step={0.1}
              min={0}
              max={3}
              onChange={this.pitchChange}
            />
          </h4>
          <h4>
            <span>ความเร็วในการอ่าน</span>
            <Slider
              defaultValue={voiceRate}
              step={0.1}
              min={0}
              max={2}
              onChange={this.speedChange}
            />
          </h4>
        </Modal>
        <Modal
          title="share this news"
          visible={this.state.shareModal}
          onCancel={() => this.setState({ shareModal: false })}
          footer={null}
        >
          <h1>{this.state.sharedID}</h1>
          <h4>copy and share this link</h4>
        </Modal>
      </div>
    )
  }
}

export default Home
