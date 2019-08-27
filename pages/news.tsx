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
import { spawn } from 'child_process'

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
    currentNewLink: string
    contentTitle: string
    contentImage: string
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
      currentNewLink: '',
      currentText: null,
      contentTitle: '',
      contentImage: '',
      sharedID: '',
      voiceLanguage: 'Thai Female',
      voicePitch: 0.9,
      voiceRate: 1,
      shareModal: false,
      settingModal: false,
      loader: false,
      userSession: null
    }
    this.fetchNews = this.fetchNews.bind(this)
    this.onChange = this.onChange.bind(this)
    this.updateNewLink = this.updateNewLink.bind(this)
    this.newsUpload = this.newsUpload.bind(this)
    this.loginSession = this.loginSession.bind(this)
    this.logoutSession = this.logoutSession.bind(this)
    this.languageChange = this.languageChange.bind(this)
  }

  async componentDidMount() {
    if (localStorage.getItem('userSession') !== null) {
      this.setState({
        userSession: JSON.parse(localStorage.getItem('userSession'))
      })
    }
  }
  onChange = e => {
    this.setState({ currentText: e.target.value })
  }
  updateNewLink = e => {
    this.setState({ currentNewLink: e.target.value })
  }

  fetchNews = async () => {
    const { currentNewLink } = this.state
    if (currentNewLink !== '') {
      if (currentNewLink.search('thairath.co.th') > -1) {
        const parseNewsKey = currentNewLink.split('thairath.co.th/')[1]
        const usedKey = parseNewsKey.split('/').join('^')
        this.setState({
          loader: true
        })
        message.info(
          `fetch news from thairath.co.th, this process take around 6-10 second`,
          6
        )
        const response = await axios.get(`/api/reader/thairath/${usedKey}`)
        const {
          statusText,
          data: {
            body: { title, description, coverImage }
          }
        } = response
        // console.log('get res', response)
        if (statusText === 'OK') {
          message.success('fetched news !')
          this.setState({
            currentText: `${title} ${description}`,
            contentTitle: title,
            contentImage: coverImage,
            loader: false
          })
        }
      }
    } else {
      message.warning('please add new links before click button')
    }
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
      loader,
      contentTitle,
      contentImage,
      currentNewLink,
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
        {loader && (
          <div
            style={{
              position: 'absolute',
              top: '75%',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)'
            }}
          >
            <img
              src="/static/assets/loader.gif"
              alt=""
              style={{ width: '100px' }}
            />
          </div>
        )}
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

          {currentText === null ? (
            <>
              <div style={{ width: '540px', display: 'flex' }}>
                <Input
                  size="large"
                  value={currentNewLink}
                  placeholder="แปะลิงค์เพื่อเตรียมอ่านข่าว"
                  onChange={this.updateNewLink}
                  style={{
                    height: '52px',
                    marginRight: '20px'
                  }}
                />
                <Button
                  size="large"
                  className="_button"
                  onClick={this.fetchNews}
                >
                  โหลดข่าวนี้
                </Button>
              </div>
              <p>{currentText}</p>
            </>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  maxWidth: '720px',
                  marginTop: '18px',
                  marginBottom: '10px',
                  paddingBottom: '15px'
                }}
              >
                <img
                  src={contentImage}
                  alt=""
                  style={{ height: '84px', marginRight: '20px' }}
                />
                <div style={{ textAlign: 'left' }}>
                  <h4
                    style={{
                      fontSize: '17px',
                      margin: '0',
                      marginBottom: '8px'
                    }}
                  >
                    {contentTitle}
                  </h4>
                  <h6 style={{ fontSize: '14px', margin: '0', opacity: 0.7 }}>
                    {currentText.substring(0, 120)}...
                  </h6>
                </div>
              </div>
              <TextArea
                className="_text-area"
                value={currentText}
                rows={5}
                style={{
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
                    window.responsiveVoice.speak(
                      currentText,
                      language,
                      voiceConfig
                    )
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
                <span style={{ width: '14px', display: 'inline-block' }} />
                <Button
                  size="large"
                  className="_button-grey"
                  onClick={() => this.setState({ currentText: null })}
                >
                  ล้างข่าวนี้
                </Button>
              </div>
            </>
          )}
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
