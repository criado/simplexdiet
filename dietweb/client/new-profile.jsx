
import React from 'react';
import { getNutInfo } from './functions.js'

import { Foods } from "../imports/collections.js"

import { Async } from 'react-select';

import Slider, { Range } from 'rc-slider';

import {getFoodInfo} from './functions.js'
import { nutcodes, nutInfo } from '../imports/nut-info.js'

import NumberField, {PriceField} from './components/number-field'

import 'rc-slider/assets/index.css';

export default class CustomProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // foodOldName:"",
            // foodId: "",
            // nutcodes,
            // nutrients: nutcodes.map(n=>({"id":n,"name":nutInfo[n].long_name,"unit":nutInfo[n].unit})),
            // nutInfo: nutInfo,
            // foodNuts: nutcodes.reduce((ns,n)=>{
            //     ns[n]=0
            //     return ns
            // },{}),
            // foodName:"",
            // foodPrice:0,
            // // custom: true,
            // user: ""
            age:null,
            sex:"female",
            reproduction_phase:"none",
            height:null,
            weight:null,
            exercise:"",
            weight_goal:"",
            diet_type:"",
            macro_ratios:[50,85],
            macro_ratios_defaults: "standard"
        }
        this.defaultRatios = {
            "standard": [0,0],
            "keto": [0,0],
            "highcarb": [0,0],
        }
    }
    handleChange(variable, event) {
        let value;
        if (variable==="macro_ratios") {
            value = event
            let change = {}
            change[variable] = value
            change["macro_ratios_defaults"]="custom";
            this.setState(change);
        } else if (variable==="macro_ratios_defaults") {
            value = event.target.value
            let change = {}
            change[variable] = value
            change["macro_ratios"]=this.defaultRatios[value]
            this.setState(change);
        } else {
            value = event.target.value
            let change = {}
            change[variable] = value
            this.setState(change);
        }
    }
    render() {
        let inputFieldClass="col-6";
        let sliderHandleStyle={width:"24px", height:"24px", marginLeft:"-14px", marginTop:"-9px"}
        return ( <div className="container new-food">
        <div className="row" style={{textAlign:"center"}}>
            <h3>New profile: {this.state.foodOldName} </h3>
        </div>
        <div className="row justify-content-md-center">
        <div className="col-md-7 profile-form">
            <div className="form-group row">
                <label htmlFor="age" className="col-3 col-form-label">Age</label>
                <div className={inputFieldClass}>
                    <input className="form-control" type="number" placeholder="23" value={this.state.age} id="age"/>
                </div>
            </div>
            <div className="form-group row">            
                    <label className="col-3 col-form-label" htmlFor="sex">Sex</label>
                    <div className={inputFieldClass}>
                    <select value={this.state.sex} onChange={this.handleChange.bind(this,"sex")} className="custom-select" id="sex">
                        {/* <option selected>Choose...</option> */}
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                    </select>
                    </div>
            </div>
            {this.state.sex==="female"? 
                <div className="form-group row">            
                    <label className="col-3 col-form-label" htmlFor="reproduction_phase"></label>
                    <div className={inputFieldClass}>
                    <select value={this.state.reproduction_phase} onChange={this.handleChange.bind(this,"reproduction_phase")} className="custom-select mb-2 mr-sm-2 mb-sm-0" style={{width: "100%"}} id="reproduction_phase">
                        {/* <option selected>Choose...</option> */}
                        <option value="none">Not pregnant nor lactating</option>
                        <option value="pregnant">Pregnant</option>
                        <option value="lactating">Lactating</option>
                    </select>
                    </div>
                </div> : ""
            }
            <div className="form-group row">
                <label htmlFor="height" className="col-3 col-form-label">Height</label>
                <div className={inputFieldClass}>
                    <input className="form-control" type="number" placeholder="180" value={this.state.height} id="height"/>
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="weight" className="col-3 col-form-label">Weight</label>
                <div className={inputFieldClass}>
                    <input className="form-control" type="number" placeholder="70" value={this.state.weight} id="weight"/>
                </div>
            </div>
            <div className="form-group row">
                <label className="col-3 col-form-label" htmlFor="exercise">Exercise</label>
                <div className={inputFieldClass}>
                <select value={this.state.exercise} onChange={this.handleChange.bind(this,"exercise")} className="custom-select mb-2 mr-sm-2 mb-sm-0" id="exercise">
                    <option selected value="1">Rarely</option>
                    <option value="2">3 times per week</option>
                    <option value="3">4 times per week</option>
                    <option value="4">5 times per week</option>
                    <option value="5">Everyday</option>
                </select>
                </div>
            </div>
            <div className="form-group row">
                <label className="col-3 col-form-label" htmlFor="weight-goal">Weight goal</label>
                <div className={inputFieldClass}>
                <select value={this.state.weight_goal} onChange={this.handleChange.bind(this,"weight_goal")} className="custom-select mb-2 mr-sm-2 mb-sm-0" id="weight-goal">
                    <option selected value="maintain">Maintain weight</option>
                    <option value="lose-steady">Lose weight steadily</option>
                    <option value="lose-quick">Lose weight quickly</option>
                    <option value="gain-steady">Gain weight steadily</option>
                    <option value="gain-quick">Gain weight quickly</option>
                </select>
                </div>
            </div>
            <div className="form-group row">
                <label className="col-3 col-form-label" htmlFor="diet-type">Diet</label>
                <div className={inputFieldClass}>
                <select value={this.state.diet_type} onChange={this.handleChange.bind(this,"diet_type")} className="custom-select mb-2 mr-sm-2 mb-sm-0" id="diet-type">
                    <option selected value="anything">Anything</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                </select>
                </div>
            </div>
            <div className="form-group row">
                <label className="col-3 col-form-label" htmlFor="macro-ratios">Macro ratio</label>
                <div className={inputFieldClass}>
                <select value={this.state.macro_ratios_defaults} onChange={this.handleChange.bind(this,"macro_ratios_defaults")} className="custom-select mb-2 mr-sm-2 mb-sm-0" id="macro-ratios-list">
                    <option selected value="standard">Standard</option>
                    <option value="keto">Keto</option>
                    <option value="highcarb">High carb</option>
                    <option value="custom">Custom</option>
                </select>
                </div>
                {/* <b>0&#37;</b> <input id="ex2" type="text" className="span2" value="" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="[30,60]"/> <b>100&#37;</b> */}
                <div className="col-9" style={{height:"52px", paddingTop: "20px"}}>
                    <Range value={this.state.macro_ratios} count={1} onChange={this.handleChange.bind(this,"macro_ratios")} className="macro-slider" handleStyle={[sliderHandleStyle,sliderHandleStyle]} id="macro-ratios" />
                </div>
                {/* <div className="col-3"></div> */}
            </div>
        </div>
        </div>

        {/* <div className="row">
        <Async
            name="form-field-name"
            // value={this.state.selectIngValue}
            loadOptions={getFoodOptions}
            onBlurResetsInput={false} 
            filterOptions={(options, filter, currentValues) => {
            // Do no filtering, just return all options
            return options
            }}
            cache={false}
            filterOption={() => true}
            onChange={this.chooseFood.bind(this)}

        />
        </div> */}
        {/* <div className="row" style={{marginTop:"10px"}}>
            <div className="col-md-1" style={{padding:"0px"}}>
                <b>Food name</b>

            </div>
            <div className="col-md-6">
                <input type="text" value={this.state.foodName} style={{width:"500px", marginLeft:"10px"}}
                    onChange={e=>thisComp.setState({foodName: e.target.value})}
                />
            </div>
            <div className={Meteor.user() && this.state.user === Meteor.user().username ? "col-md-5 ml-auto": "col-md-2 ml-auto"}>                
                {Meteor.user() && this.state.foodId!=="" && this.state.user === Meteor.user().username ? <span className="food-edit-button">
                    <button type="button" id="remove-food" className="btn btn-danger toolbar-button"
                        onClick={this.removeFood.bind(this)}>
                        Remove Food
                    </button>
                </span>  : ""}
                <span className="food-edit-button">
                    <button type="button" id="save-food-as" className="btn btn-primary toolbar-button"
                        onClick={this.saveFoodAs.bind(this)}>
                        Save Food As
                    </button>
                </span>
                {Meteor.user() && this.state.user === Meteor.user().username ? <span className="food-edit-button">
                    <button type="button" id="save-food" className="btn btn-primary toolbar-button"
                        onClick={this.saveFood.bind(this)}>
                        Save Food
                    </button>
                </span> : ""}
            </div>
        </div> */}
        {/* <div className="row" style={{marginBottom:"10px"}}>
        <div className="col-md-1" style={{padding:"0px"}}>
                <b>Price</b>
            </div>
            <div className="col-md-11">
                <input type="number" value={this.state.foodPrice} style={{width:"80px", marginLeft:"10px"}}
                    onChange={e=>thisComp.setState({foodPrice: e.target.value})}
                />
            </div>
        </div> */}
        {/* <div className="row">
            <div className="col-md-6">
            <table className="table table-hover">
            <thead>
                <tr>
                    <th>Nutrient</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {this.state.nutrients ? this.state.nutrients.filter((n,i)=>i<16).map((n,i)=>(
                    <tr key={i}><td>{n.name}</td>
                    <td>
                        <NumberField thisComp={thisComp} style={{width:"80px"}} className="ing-limits"
                            setValue={(value, onValueSet)=>{if (typeof onValueSet !== "undefined") onValueSet() }}
                            onPressedEnter={()=>{
                                if (Meteor.user() && this.state.user === Meteor.user().username)
                                    this.saveFood()
                                else 
                                    this.saveFoodAs()
                            }}
                            onChange={e=>thisComp.handleNutChange.call(thisComp,n.id,e.target.value)}
                            index={n.id}
                            name="foodNuts"
                        />
                        &nbsp;
                        {n.unit}</td>
                    </tr>
                )) : ""}
            </tbody>
            </table>
            </div>
            <div className="col-md-6">
            <table className="table table-hover">
            <thead>
                <tr>
                    <th>Nutrient</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {this.state.nutrients ? this.state.nutrients.filter((n,i)=>i>=16).map((n,i)=>(
                    <tr key={i}><td>{n.name}</td>
                    <td>
                        <input value={thisComp.state.foodNuts[n.id]} step="10" style={{width:"80px"}} type="number"
                            onChange={e=>thisComp.handleNutChange.call(thisComp,n.id,e.target.value)}
                        />
                        &nbsp;
                        {n.unit}</td>
                    </tr>
                )) : ""}
            </tbody>
            </table>
            </div>
        </div> */}
    </div>)
    }
}


const getFoodOptions = (input, callback) => {
    console.log(input)
    Meteor.call("getFoodNamesData",input,(err,res)=>{
      if (err) console.log(err)
      let foodsCustom = res;
      // console.log("foodnames",foods)
      callback(null,
        {options:
          foodsCustom.map(x=>({value: {id:x._id,name:x.name,price:x.price,nutrients:x.nutrients,price:x.price, user: x.user}, label: x.name+" ("+x.user+")"})),
          cache:false
        })
    })
  
  };