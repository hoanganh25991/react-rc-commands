import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as firebase from 'firebase';


const subCateElm = (cate, goToSubCate) => (cate ? <div onClick={goToSubCate(cate)}>{cate.title} ({cate.count})</div> : <div/>)
const lastCateElm = (lastCate) => subCateElm(lastCate, ()=>{})

class App extends Component {

  constructor(props){
    super(props)
    const setState = this.setState.bind(this)
    this.setState = (args) => {
      this.push(this.state)
      setState(args)
    }

    this.state = {
      level: 0,
      lastCate: null,
      currCates: []
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


  goToSubCate = (cate) => () => {
    const {level, sub = []} = cate
    this.setState({level, currCates: sub, lastCate: cate})
  }

  showHistory = () => {
    console.log(this.stateHistory)
  }


  render() {
    const {categories, commands} = this.state

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

    return (
      <div>
        <div>
          <h4>Categories</h4>
          <hr/>
          <div>{lastCateElm(lastCate)}</div>
          <div>
            {currCates.length > 0 && currCates.map((cate, index) => (
              <div key={index}>{subCateElm(cate, this.goToSubCate)}
                {level > 0 && cate.sub.map((cate, index) => (
                  <div key={index}>{subCateElm(cate, this.goToSubCate)}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div>{commands.length}</div>
        </div>
        <div onClick={this.showHistory}>Show</div>
      </div>
    )
  }
}

export default App;
