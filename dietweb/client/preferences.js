import React from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'

import Select from 'react-select';
import 'react-select/dist/react-select.css';

import NumericInput from 'react-numeric-input';

import { Foods, FoodFiles } from '../imports/collections.js';

class Preferences extends React.Component {
constructor(props) {
  super(props);
  // let foodList = Foods.find({}).fetch();
  // console.log(foodList);
  this.state={preferences: []}

  // Meteor.subscribe('foods');
}
componentDidMount() {
  let thisComp = this;
  Meteor.call('getPreferences', (err, res) => {
    thisComp.setState({preferences: res, mins: res.map(x=>x.min), maxs: res.map(x=>x.max)})
    console.log(res);
  })
}
// componentDidUpdate(prevProps, prevState) {
//   this.setState({foods:Foods.find({}).fetch()})
// }
componentDidUpdate(prevProps, prevState) {
  console.log(this.props.foods);

}
updatePreferencesMin(idx,val) {
  let preferences = this.state.preferences;
  this.setState({preferences: preferences.map((x,i) => {if (i===idx) {x.min = val;} return x})})
}
updatePreferencesMax(idx,val) {
  let preferences = this.state.preferences;
  this.setState({preferences: preferences.map((x,i) => {if (i===idx) {x.max = val;} return x})})
}
writePreferences() {
  let thisComp = this;
  Meteor.call('writePreferences', [thisComp.state.preferences], (err, res) => {
    console.log(res);
  })
}
removePref(idx) {
  let preferences = this.state.preferences;
  this.setState({preferences: preferences.filter((x,i) => i !== idx)})
}
addPref(food) {
  let preferences = this.state.preferences;
  preferences.push({name:food.value, code:food.code, price: 0, min:"None", max:"None"})
  this.setState({preferences: preferences})
}
render() {
  let thisComp = this;
  return (<div className="container">
  <div className="row">
    <FileUploader />
    <button type="button" className="btn btn-primary toolbar-button" onClick={this.writePreferences.bind(this)}>Update preferences</button>
      <br/>
      <br/>
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
        <a className="remove-pref" onClick={this.removePref.bind(this,i)}><span className="glyphicon glyphicon-trash" aria-hidden="true"></span></a>
          <br/>
            <span>Price: </span><NumericInput className="price-input"
              precision={2}
              value={x.price}
              step={0.1}
              format={num=>num+'£/100g'}
              style={{arrowUp: {
                  borderBottomColor: 'rgba(40, 66, 54, 0.63)'
              },
              arrowDown: {
                  borderTopColor: 'rgba(40, 66, 54, 0.63)'
              }}}/>
          <br/>
          <PreferenceChooser name={"Min"} pref={x.min} update={(val)=>{
            thisComp.updatePreferencesMin(i,val)}}/>
          <PreferenceChooser name={"Max"} pref={x.max} update={(val)=>{
              thisComp.updatePreferencesMax(i,val)}}/>
        </li>
      })}
      <li className="list-group-item pref-wrapper">
        <a className="add-food-icon"><span className="glyphicon glyphicon-plus" aria-hidden="true"></span></a>
        <span className="preferenceFoodName">Add food</span>
        <Select
          name="food"
          options={this.props.foods.filter(x=>thisComp.state.preferences.map(x=>x.code).indexOf(x.code) === -1)}
          onChange={this.addPref.bind(this)}
        />
      </li>
    </ul>
  </div>
  </div>)
}
}

function logChange(val) {
  console.log("Selected: " + JSON.stringify(val));
}

class PreferenceChooser extends React.Component {
constructor(props) {
  super(props);
  this.state = {isNone:(props.pref === "None")}
}
handleCheckbox() {
  this.setState({isNone:this.isNoneCheckbox.checked})
  // console.log(this.isNoneCheckbox.checked);
  this.props.update("None")
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

export default createContainer(() => {
  return {
    foods: Foods.find({}, {fields: {nutrients: 0}}).fetch().map(x=>({value:x.name, label:x.name, code:x._id})),
  };
}, Preferences);

class FileUploader extends React.Component {
  constructor() {
    super();
    this.state = {uploading:false}
  }
  fileUpload(e) {
    let thisComp = this;
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // multiple files were selected
      const upload = FoodFiles.insert({
        file: e.currentTarget.files[0],
        meta: {
            userId: Meteor.userId()
          },
        streams: 'dynamic',
        chunkSize: 'dynamic'
      }, false);

      upload.on('start', function () {
        thisComp.setState({uploading: this});
      });

      upload.on('end', function (error, fileObj) {
        if (error) {
          alert('Error during upload: ' + error);
        } else {
          alert('File "' + fileObj.name + '" successfully uploaded');
        }
        thisComp.setState({uploading: false});
      });

      upload.start();
    }
  }
  render() {
    if (this.state.uploading) {
      thing = <span></span>
    } else {
      thing = <input id="fileInput" type="file" onChange={this.fileUpload.bind(this)}/>
    }
  return <div>
    {thing}
  </div>
  }
}
