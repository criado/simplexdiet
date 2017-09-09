import React from 'react';
import ReactDOM from 'react-dom';

import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state={dietVec: [], mins:[], maxs:[], preferences: [], feasible: true}
  }
  componentDidMount() {
    let thisComp = this;
    Meteor.call('getPreferences', (err, res) => {
      thisComp.setState({preferences: res, mins: res.map(x=>x.min), maxs: res.map(x=>x.max)})
      console.log(res);
    })

  }
  CalculatDiet() {
    let thisComp = this;
    Meteor.call('calculate_diet', (err, res) => {
      if (err) {
        console.log(err);
        if (err.error === 666) thisComp.setState({feasible: false});
      } else {
        console.log(res);
        thisComp.setState({dietVec: res})
      }
    })
  }
  updatePreferencesMin(i,val) {
    let newMins = this.state.mins
    let preferences = this.state.preferences;
    newMins[i] = val
    this.setState({preferences: preferences.map((x,i) => {x.min = newMins[i]; return x}), mins: newMins})
  }
  updatePreferencesMax(i,val) {
    let newMaxs = this.state.maxs
    let preferences = this.state.preferences;
    newMaxs[i] = val
    this.setState({preferences: preferences.map((x,i) => {x.max = newMaxs[i]; return x}), maxs: newMaxs})
  }
  writePreferences() {
    let thisComp = this;
    Meteor.call('writePreferences', [thisComp.state.preferences], (err, res) => {
      console.log(res);
    })
  }
  renderDiet() {
    if (this.state.feasible) {
      return this.state.dietVec.map((x,i)=>{
        return (<li key={i} className="list-group-item">{x.name}: {parseFloat(x.amount)*100} g</li>)
      })
    } else {
      return <div className="alert alert-danger" role="alert">
        <strong>Oh snap!</strong> No feasible primal solution!
      </div>
    }
  }
  render() {
    let thisComp = this;
    return (<div className="container">
    <div className="row">
      <h1>Simplex diet</h1>
    </div>
    <div className="row">
      <button type="button" className="btn btn-primary" onClick={this.CalculatDiet.bind(this)}>Calculate diet</button>
        <br/>
        <br/>
      <button type="button" className="btn btn-primary" onClick={this.writePreferences.bind(this)}>Update preferences</button>
        <br/>
        <br/>
    </div>
    <div className="row">
        <ul className="list-group">
          {this.renderDiet()}
        </ul>
    </div>
    <hr/>
    <div className="row">
      <ul className="list-group preferences">
        {this.state.preferences.map((x,i)=>{
          return <li key={i}  className="list-group-item pref-wrapper">
            <span className="preferenceFoodName">
              {x.name.split(",")[0]}
              <span className="preferenceFoodDescription">, {x.name.split(",").slice(1).join(",").trim()}</span>
            </span>
            <br/>
            <PreferenceChooser name={"Min"} pref={this.state.mins[i]} update={(val)=>{
              thisComp.updatePreferencesMin(i,val)}}/>
              <PreferenceChooser name={"Max"} pref={this.state.maxs[i]} update={(val)=>{
                thisComp.updatePreferencesMax(i,val)}}/>
          </li>
        })}
      </ul>
    </div>
    </div>)
  }
}

class PreferenceChooser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isNone:(props.pref === "None")}
  }
  handleCheckbox() {
    this.setState({isNone:this.isNoneCheckbox.checked})
    // console.log(this.isNoneCheckbox.checked);
  }
  render() {
    let slider = null
    if (!this.state.isNone) {
      slider = <Slider value={parseFloat(this.props.pref)} onChange={this.props.update} min={0} max={10} step={0.1}/>
    }
    // console.log(this.state.isNone);
    return (<div className="pref">
    <span className="prefName">{this.props.name}</span>
      <div className="slideThree">
        <input name="isNoneCheckbox" ref={(input) => { this.isNoneCheckbox = input; }} type="checkbox" checked={!this.state.isNone} onChange={()=>{}}/>
        <label htmlFor="isNoneCheckbox" onClick={this.handleCheckbox.bind(this)}></label>
      </div>
      <div>
        {slider}
      </div>
    </div>)
  }
}
