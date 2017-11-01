import React from 'react';
import * as firebase from "firebase"
import Section from "./ASection"

class FirebaseLog extends React.PureComponent {
  constructor(props){
    super(props)
    this.state = {
      totalCategories: null,
      totalCommands: null,
      lastCrawlingTime: null,
      logs: [],
      logMaxLength: 80,
      mainBranch: "tmp",
      logsBranch: "logMsgs",
      crawlingInfoBranch: "crawlingInfo",
      completePercent: 0,
    }
  }

  componentDidMount(){
    const {mainBranch, logsBranch, crawlingInfoBranch} = this.state

    const app = firebase.initializeApp({
      apiKey: "AIzaSyDXbD71Y_uA8ldm1h9S2-6AOgl73UOid1U",
      authDomain: "glass-turbine-148103.firebaseapp.com",
      databaseURL: "https://glass-turbine-148103.firebaseio.com",
    }, "firebaseLog");

    this.fbApp = app

    const db = app.database()
    const logsRef = db.ref(`${mainBranch}/${logsBranch}`)
    logsRef.on("child_added", snapshot => {
      const logMsgKey = snapshot.key
      const logMsg = snapshot.val()
      // console.log(logMsgKey, logMsg)
      const {logs, logMaxLength} = this.state
      const overThreshold = logs.length > logMaxLength
      const slicePos = overThreshold ? Math.floor(logMaxLength/2) : 0
      const nextLogs = logs.slice(slicePos)
      nextLogs.push({key: logMsgKey, msg: logMsg})
      this.setState({logs: nextLogs})
    })

    const crawlingInfoRef = db.ref(`${mainBranch}/${crawlingInfoBranch}`)
    // crawlingInfoRef.once("value",  snapshot => {
    //   const crawlingInfo = snapshot.val()
    //   console.log(crawlingInfo)
    //   this.setState(crawlingInfo)
    // })

    // On child_changed is deep into current ref to watch
    // crawlingInfoRef.on("child_changed", snapshot => {
    crawlingInfoRef.on("value", snapshot => {
      const crawlingInfo = snapshot.val()
      // console.log(crawlingInfo)
      this.initCompletePercent()
      this.setState(crawlingInfo)
    })
  }

  componentDidUpdate(){
    if(this.state.done === true) {
      this.completePercenInterval && clearInterval(this.completePercenInterval)
      this.completePercenInterval = null
      // this.setState({completePercent: 1})
    }
  }

  componentWillUnmount(){
    console.log("Delete current app")
    if(this.fbApp) this.fbApp.delete().then(() => console.log("Firebase app deleted"))
    // if(this.scrollDiv) this.scrollDiv.removeEventListener("DOMNodeInserted")
    if(this.completePercenInterval) clearInterval(this.completePercenInterval)
  }

  scrollToBottom = node => {
    if(!node) return
    // this.scrollDiv = node
    const logContainer = node.parentNode
    node.addEventListener("DOMNodeInserted", () => {
      const {height} = node.getBoundingClientRect()
      // console.log("See log, srolling...", node, height)
      logContainer.scrollTo(0, height)
    })
  }

  initCompletePercent = () => {
    if(this.completePercenInterval) return
    if(this.state.done !== false) return

    const interval = 500
    this.setState({completePercent: 0}, () => {
      this.completePercenInterval = setInterval(() => {
        const {completePercent: lastPercent, lastCrawlingTime} = this.state
        const completePercent = lastPercent + interval/lastCrawlingTime
        console.log(completePercent)
        this.setState({completePercent})
      }, interval)
    })
  }

  render(){
    const {totalCategories, totalCommands, lastCrawlingTime, logs, completePercent} = this.state
    const crawlingTimeSec = Math.floor(lastCrawlingTime / 1000).toFixed(2)
    const percent = completePercent * 100

    return (
      <div className={"fSm"}>
        <div>Categories found: {totalCategories || "-"}</div>
        <div>Commands found: {totalCommands || "-" }</div>
        <div>Last crawling time: {lastCrawlingTime && crawlingTimeSec || "-" }s</div>
        <div>
          <div className={"loadingState"} style={{width: `${percent}%`}}> {percent.toFixed(2)}%</div>
        </div>
        <Section>
          <div className={"logContainer group"}>
            <div ref={this.scrollToBottom}>
              {!logs.length && "No log found"}
              {logs.map(log => (<div key={log.key}>{log.msg}</div>))}
            </div>
          </div>
        </Section>
      </div>
    )
  }
}


export default FirebaseLog