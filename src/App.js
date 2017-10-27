import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as firebase from 'firebase';


const subCateElm = (cate, goToSubCate) => (cate ? <div onClick={goToSubCate(cate)}>{cate.title} ({cate.count})</div> : <div/>)
const lastCateElm = (lastCate) => (<b>{subCateElm(lastCate, ()=>{})}</b>)
const showPathCommandCates = commandPath => {
  const rightPath = Object.keys(commandPath).sort((aKey, bKey) => commandPath[aKey] > commandPath[bKey])
  return (
    <div>Category {rightPath.join("/")}</div>
  )
}

class App extends Component {

  constructor(props){
    super(props)
    const setState = this.setState.bind(this)
    this.setState = (args) => {
      setState(args, () => {
        this.push(this.state)
      })
    }

    this.state = {
      level: -1,
      lastCate: null,
      currCates: [],
      pathCommandCates: []
    }
  }

  stateHistory = []

  push = state => {
    const currLength = this.stateHistory.length

    if(currLength > 5){
      this.stateHistory.splice(0,1)
    }

    this.stateHistory.push(state)
  }

  componentDidMount(){
    const app = firebase.initializeApp({
      apiKey: "AIzaSyDXbD71Y_uA8ldm1h9S2-6AOgl73UOid1U",
      authDomain: "glass-turbine-148103.firebaseapp.com",
      databaseURL: "https://glass-turbine-148103.firebaseio.com",
    });

    const db = app.database()
    const nodeRcRef = db.ref("nodeRemoteCentral")
    const waitFetchData = new Promise(resolve => nodeRcRef.once("value", snapshot => resolve(snapshot.val())))
    waitFetchData.then(({categories, commands}) => {
      const categoriesArr = Object.values(categories)
      const commandsArr = Object.values(commands)
      this.setState({currCates: categoriesArr, categories: categoriesArr, commands: commandsArr})
    })
  }

  nextPathCates = cate => {
    const {pathCommandCates: curr} = this.state
    const remain = curr.filter(_cate => _cate.level < cate.level)
    return [...remain, cate]
  }

  goToSubCate = (cate) => () => {
    const {level, sub = []} = cate
    const pathCommandCates = this.nextPathCates(cate)
    this.setState({level, currCates: sub, lastCate: cate, pathCommandCates})
  }

  showHistory = () => {
    console.log(this.stateHistory)
  }

  goBack = () => {
    this.stateHistory.pop()
    const lastState = this.stateHistory.pop()
    this.setState(lastState)
  }


  filter = () => {
    const firebaseKey = str => str.replace(/[.#$/[\]]/, "")
    const {pathCommandCates, commands} = this.state

    if(pathCommandCates.length === 0)
      return []

    const commandHasPath = value => typeof value !== "undefined"
    return commands.filter(command => pathCommandCates.reduce((carry, cate) => carry && commandHasPath(command.path[firebaseKey(cate.title)]), true))
  }


  render() {
    const {categories} = this.state

    if(!categories)
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Fetching data. Please wait</h1>
          </header>
        </div>
      );

    const {level, currCates, lastCate} = this.state
    const matchCommands = this.filter()

    return (
      <div>
        <div>
          <button onClick={this.goBack}>Go back</button>
        </div>
        <div className={"mTop"}>
          <div className={"header"}>Categories</div>
          <hr/>
          <div>
            <div>{lastCateElm(lastCate)}</div>
            <div className={level > -1 ? "sub" : ""}>
              {currCates.length > 0 && currCates.map((cate, index) => (
                <div key={index}>{subCateElm(cate, this.goToSubCate)}
                  {level > -1 && cate.sub && cate.sub.map((cate, index) => (
                    <div className={"sub"} key={index}>{subCateElm(cate, this.goToSubCate)}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={"mTop"}>
          <div className={"header"}>Commands</div>
          <hr/>
          <div>Match {matchCommands.length} commands</div>
          <div>
            {matchCommands.map((command, index) => (
              <div className={"group fSm"} key={index}>
                <div>{command.title}</div>
                <pre className={"command"}>{command.command}</pre>
                <div>Notes: {command.notes}</div>
                {showPathCommandCates(command.path)}
              </div>
            ))}
          </div>
        </div>
        <div onClick={this.showHistory}>Show</div>
      </div>
    )
  }
}

export default App;
