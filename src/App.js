import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as firebase from 'firebase';


const subCate = (cate, goToSubCate) => (<span onClick={goToSubCate(cate)}>{cate.title} ({cate.count})</span>)

class App extends Component {

  constructor(props){
    super(props)
    this.state = {
      level: 0,
      currCates: []
    }
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
    const {level, sub} = cate
    this.setState({level, currCates: sub})
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

    const {level, currCates} = this.state

    return (
      <div>
        <h1>Categories</h1>
        {currCates.map((cate, index) => (
          <ul key={index}>{subCate(cate, this.goToSubCate)}
            {level > 0 && cate.sub.map((cate, index) => (
              <li key={index}>{subCate(cate, this.goToSubCate)}</li>
            ))}
          </ul>
        ))}
        <div>{commands.length}</div>
      </div>
    )
  }
}

export default App;
