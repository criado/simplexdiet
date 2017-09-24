import React from 'react';
import ReactDOM from 'react-dom';

import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'


export default class App extends React.Component {
constructor(props) {
  super(props);
  this.state={mins:[], maxs:[], profile: []}
}
componentWillMount() {
  let thisComp = this;
  Meteor.call('getProfile', (err, res) => {
    thisComp.setState({profile: res, mins: res.map(x=>x.min), maxs: res.map(x=>x.max)})
    console.log(res);
  })

}
updateProfileMin(i,val) {
  let newMins = this.state.mins
  let profile = this.state.profile;
  newMins[i] = val
  this.setState({profile: profile.map((x,i) => {x.min = newMins[i]; return x}), mins: newMins})
}
updateProfileMax(i,val) {
  let newMaxs = this.state.maxs
  let profile = this.state.profile;
  newMaxs[i] = val
  this.setState({profile: profile.map((x,i) => {x.max = newMaxs[i]; return x}), maxs: newMaxs})
}
writeProfile() {
  let thisComp = this;
  Meteor.call('writeProfile', [thisComp.state.profile], (err, res) => {
    console.log(res);
  })
}
render() {
  let thisComp = this;
  return (<div className="container">
  <div className="row">
    <button type="button" className="btn btn-primary toolbar-button" onClick={this.writeProfile.bind(this)}>Update profile</button>
      <br/>
      <br/>
  </div>
  <hr/>
  <div className="row">
    <ul className="list-group preferences">
      {this.state.profile.map((x,i)=>{
        return <li key={i}  className="list-group-item pref-wrapper">
          <span className="preferenceFoodName">
            {x.name}
            <span className="preferenceFoodDescription">, {x.longName}</span>
          </span>
          <br/>
          <ProfileChooser name={"Min"} pref={this.state.mins[i]} update={(val)=>{
            thisComp.updateProfileMin(i,val)}}/>
            <ProfileChooser name={"Max"} pref={this.state.maxs[i]} update={(val)=>{
              thisComp.updateProfileMax(i,val)}}/>
        </li>
      })}
    </ul>
  </div>
  </div>)
}
}

class ProfileChooser extends React.Component {
constructor(props) {
  super(props);
  this.state = {isNone:(props.pref === "None"), sliderMax: 10, sliderStep: 0.1}
}
componentWillMount() {
  let newSliderMax;
  if (this.props.pref > 0.99*this.state.sliderMax) {
    newSliderMax = this.props.pref*2
  } else if (this.props.pref < 0.01*this.state.sliderMax) {
    newSliderMax = this.props.pref*2
  }
  this.setState({sliderMax:newSliderMax, sliderStep:newSliderMax/100})
}
// componentDidMount() {
//   let newSliderMax = Math.max(this.props.pref*2,this.state.sliderMax);
//   this.updateState({sliderMax:newSliderMax, sliderStep:newSliderMax/100})
// }
// componentDidUpdate(prevProps, prevState) {
//   if (this.props.pref > 0.99*this.state.sliderMax) {
//     let newSliderMax = this.props.pref*2
//     this.updateState({sliderMax:newSliderMax, sliderStep:newSliderMax/100})
//   } else if (this.props.pref < 0.01*this.state.sliderMax) {
//     let newSliderMax = this.props.pref*2
//     this.updateState({sliderMax:newSliderMax, sliderStep:newSliderMax/100})
//   }
// }
handleCheckbox() {
  this.setState({isNone:this.isNoneCheckbox.checked})
  // console.log(this.isNoneCheckbox.checked);
}
render() {
  let slider = null
  if (!this.state.isNone) {
    slider = <Slider value={parseFloat(this.props.pref)} onChange={this.props.update} min={0} max={this.state.sliderMax} step={this.state.sliderStep}/>
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
