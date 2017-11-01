import React from 'react';
import * as firebase from "firebase"

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
      logsBranch: "logMsgs"
    }
  }

  componentDidMount(){
    const app = firebase.initializeApp({
      apiKey: "AIzaSyDXbD71Y_uA8ldm1h9S2-6AOgl73UOid1U",
      authDomain: "glass-turbine-148103.firebaseapp.com",
      databaseURL: "https://glass-turbine-148103.firebaseio.com",
    }, "firebaseLog");

    this.fbApp = app

    const db = app.database()
    const {mainBranch, logsBranch} = this.state
    const nodeRcRef = db.ref(`${mainBranch}/${logsBranch}`)
    nodeRcRef.on("child_added", snapshot => {
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
  }

  componentWillUnmount(){
    console.log("Delete current app")
    if(this.fbApp) this.fbApp.delete().then(() => console.log("Firebase app deleted"))
  }

  scrollToBottom = node => {
    if(!node) return
    const logContainer = node.parentNode
    node.addEventListener("DOMNodeInserted", () => {
      const {height} = node.getBoundingClientRect()
      console.log("See log, srolling...", node, height)
      logContainer.scrollTo(0, height)
    })
  }

  render(){
    const {totalCategories, totalCommands, lastCrawlingTime, logs} = this.state

    return (
      <div>
        <div>Categories found: {totalCategories || "-"}</div>
        <div>Commands found: {totalCommands || "-" }</div>
        <div>Last crawling time: {lastCrawlingTime || "-" }s</div>
        <div className={"logContainer"}>
          <div className={"group fSm log"} ref={this.scrollToBottom}>
            {!logs.length && "No log found"}
            {logs.map(log => (<div key={log.key}>{log.msg}</div>))}
          </div>
        </div>
      </div>
    )
  }
}


export default FirebaseLog