
import React from 'react';
import { getNutInfo } from './functions.js'

import { Foods } from "../imports/collections.js"

import { Async } from 'react-select';

import Slider, { Range } from 'rc-slider';

import {getFoodInfo} from './functions.js'
import { nutcodes, nutInfo } from '../imports/nut-info.js'

import NumberField, {PriceField} from './components/number-field'

import 'rc-slider/assets/index.css';

import { bigNutCodes, bigNutInfo, nutClassesList } from '../imports/nut-info.js'

import { defaultNutPref, ageRanges } from '../imports/simplex_diet_micros_defaults.js'

// import TreeMenu, { TreeNode } from 'react-tree-menu'

// var TreeMenu = require('react-tree-menu').TreeMenu,
//     TreeNode = require('react-tree-menu').TreeNode;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare, faCoffee, faSquareFull, faMinusSquare, faChevronDown, faChevronRight, faLemon, faDog, faCat, faRobot } from '@fortawesome/free-solid-svg-icons'


import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import CheckboxTree from 'react-checkbox-tree';

// const nodes = [{
//     value: 'mars',
//     label: 'Mars',
//     icon: <span>hi</span>,
//     children: [
//         { value: 'phobos', label: 'Phobos' },
//         { value: 'deimos', label: 'Deimos' ,
//             children: [
//             { value: 'qaa', label: 'dogog' },
//             { value: 'assd', label: 'gato' },
//         ]},
//     ],
// }];

// console.log(bigNutCodes.map((c,i)=>({value:bigNutInfo[c]["long_name"], icon:<span>{bigNutInfo[c]["long_name"]}</span>,label:""})))

function calculate_cals(weight, height, age, sex, exercise, weight_goal) {
    if (!weight || !height || !age) return null;
    let cals = 10*weight + 6.25*height - 4.92*age;
    if (sex=="male") cals +=5;
    else if (sex=="female") cals -= 161;

    let exercise_multiplier = [1.2,1.375,1.55,1.725,1.9];
    cals *= exercise_multiplier[parseInt(exercise)-1];

    switch (weight_goal) {
        case "gain-steady":
            cals *= 1.15;
            break;
        case "gain-quick":
            cals *= 1.25;
            break;
        case "lose-steady":
            cals *= 0.85;
            break;
        case "lose-quick":
            cals *= 0.75;
            break;
        case "maintain":
            break;
    }

    cals = Math.max(cals,weight*2.20462*8) //8 calories per pound of weight, minimum

    return cals;
}

export default class CustomProfile extends React.Component {
    constructor(props) {
        super(props);
        this.constraintsEl = React.createRef();
        this.defaultRatios = {
            "standard": [40,80],
            "keto": [10,80],
            "highcarb": [70,85],
        }
        this.state = {
            checked: [],
            expanded: [],
            mins: bigNutCodes.map(n=>null),
            maxs: bigNutCodes.map(n=>null),
            calories:null,
            profName: "",
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
            reproduction_phase:"no_reprod",
            height:null,
            weight:null,
            exercise:"1",
            weight_goal:"maintain",
            diet_type:"anything",
            macro_ratios:this.defaultRatios["standard"],
            macro_ratios_defaults: "standard",
        }

    }
    componentDidUpdate(prevProps, prevState) {
        let { weight, height, age, sex, exercise, weight_goal, reproduction_phase } = this.state;
        // let new_cals = this.state.calories;
        if (weight != prevState["weight"] || height != prevState["height"] || age != prevState["age"] || exercise != prevState["exercise"] || sex != prevState["sex"] || weight_goal != prevState["weight_goal"] || reproduction_phase != prevState["reproduction_phase"]){
            // console.log("hi");
            let new_cals = calculate_cals(weight, height, age, sex, exercise, weight_goal);
            this.setState({calories:new_cals})
            if (sex==="male") reproduction_phase = "no_reprod";
            let age_range = 0;
            for (let range of ageRanges) {
                if (range > age) break;
                age_range = range;
            }
            let nutPref = defaultNutPref.nutPref[sex][reproduction_phase][age_range];
            let calories = new_cals;
            console.log("cal_max",calories,calories*1.05);
            nutPref["208"] = {"min": calories*0.95, "max": calories*1.05};
            const {macro_ratios} = this.state;
            // let carbs = calories*macro_ratios[0]/100/4 //carbohydrates (in grams, thus the /4 )
            // let fats = calories*(macro_ratios[1] - macro_ratios[0])/100/9 //lipds (in grams)
            // let prots = calories*(100-macro_ratios[1])/100/4 //prots (in grams)
            let epsilon = 1e-4;
            let perc_carbs = macro_ratios[0]/100
            let perc_fats = (macro_ratios[1] - macro_ratios[0])/100
            let perc_prots = (100-macro_ratios[1])/100
            let extraConstraints = [
              {"coeffs":{"205":4*(perc_carbs-1), "204":9*perc_carbs, "203":4*perc_carbs },"rel":"max","const":epsilon},
              {"coeffs":{"205":4*(perc_carbs-1), "204":9*perc_carbs, "203":4*perc_carbs },"rel":"min","const":-epsilon},
              {"coeffs":{"205":4*perc_fats, "204":9*(perc_fats-1), "203":4*perc_fats },"rel":"max","const":epsilon},
              {"coeffs":{"205":4*perc_fats, "204":9*(perc_fats-1), "203":4*perc_fats },"rel":"min","const":-epsilon},
              {"coeffs":{"205":4*perc_prots, "204":9*perc_prots, "203":4*(perc_prots-1) },"rel":"max","const":epsilon},
              {"coeffs":{"205":4*perc_prots, "204":9*perc_prots, "203":4*(perc_prots-1) },"rel":"min","const":-epsilon},
            ]
            //
            nutPref["291"] = {"min": 38};//fibre
            // prof["205"] = {"min": carbs*0.95, "max": carbs*1.05};
            // prof["204"] = {"min": fats*0.95, "max": fats*1.05};
            // prof["203"] = {"min": prots*0.95, "max": prots*1.05};
            this.setState({mins:bigNutCodes.map(c=>((c in nutPref && "min" in nutPref[c]) ? nutPref[c]["min"]: null))})
            this.setState({maxs:bigNutCodes.map(c=>((c in nutPref && "max" in nutPref[c]) ? nutPref[c]["max"]: null))})
            this.setState({ checked: Object.keys(nutPref).concat(["205","204","203"]) })
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

    saveProfile() {

    }

    render() {
        let inputFieldClass="col-6";
        let sliderHandleStyle={width:"24px", height:"24px", marginLeft:"-14px", marginTop:"-9px"}
        return ( <div className="container new-food">
        <div className="row my-3">
          <div className="col-md-4">
            <h3><span>New profile:</span> <input className="form-control" type="text" value={this.state.profName} style={{display:"inline-block", width:"70%", marginLeft:"2em"}}
                placeholder="Profile name"
                onChange={e=>this.setState({profName: e.target.value})}
                />
            </h3>
          </div>
          <div className="col-md-4" style={{textAlign:"right"}}>
            <button type="button" className="btn toolbar-button btn-primary" onClick={this.saveProfile.bind(this)}>Save profile</button>
          </div>
        </div>

        <div className="row">
        <div className="col-md-8 offset-md-2 profile-form">
            <div className="form-group row">
              <label htmlFor="age" className="col-3 col-form-label">Age</label>
              <div className={inputFieldClass}>
                  <input className="form-control" onChange={this.handleChange.bind(this,"age")} type="number" placeholder="23" value={this.state.age} id="age"/>
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
                        <option value="no_reprod">Not pregnant nor lactating</option>
                        <option value="pregnant">Pregnant</option>
                        <option value="lactating">Lactating</option>
                    </select>
                    </div>
                </div> : ""
            }
            <div className="form-group row">
                <label htmlFor="height" className="col-3 col-form-label">Height <small>(cm)</small></label>
                <div className={inputFieldClass}>
                    <input className="form-control" type="number" onChange={this.handleChange.bind(this,"height")} placeholder="180" value={this.state.height} id="height"/>
                </div>
            </div>
            <div className="form-group row">
                <label htmlFor="weight" className="col-3 col-form-label">Weight <small>(kg)</small></label>
                <div className={inputFieldClass}>
                    <input className="form-control" type="number" onChange={this.handleChange.bind(this,"weight")} placeholder="70" value={this.state.weight} id="weight"/>
                </div>
            </div>
            <div className="form-group row">
                <label className="col-3 col-form-label" htmlFor="exercise">Exercise</label>
                <div className={inputFieldClass}>
                <select value={this.state.exercise} onChange={this.handleChange.bind(this,"exercise")} className="custom-select mb-2 mr-sm-2 mb-sm-0" id="exercise">
                <option selected value="1">Little to no exercise</option>
                    <option value="2">1-3 hrs/wk strenuous cardio</option>
                    <option value="3">3-5 hrs/wk strenuous cardio</option>
                    <option value="4">5-6 hrs/wk strenuous cardio</option>
                    <option value="5">7-21 hrs/wk strenuous cardio</option>
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
                <div className="col-9" style={{}}>
                    <div className="row">
                        <div className="col-4 text-md-center" style={{}}>

                            <b>Carbohydrates</b>
                            <div>{this.state.macro_ratios[0]}%</div>

                        </div>
                        <div className="col-4 text-md-center" style={{}}>

                            <b>Fats</b>
                            <div>{this.state.macro_ratios[1] - this.state.macro_ratios[0]}%</div>

                        </div>
                        <div className="col-4 text-md-center" style={{}}>

                            <b>Proteins</b>
                            <div>{100-this.state.macro_ratios[1]}%</div>

                        </div>
                    </div>
                </div>
                {/* <div className="col-3"></div> */}
            </div>
            <div className="form-group row">
                <span className="col-3 col-form-label">Daily calories:</span>
                <div className={inputFieldClass}>
                    <span>{parseInt(this.state.calories) || ""}{parseInt(this.state.calories) ? " kcal" : ""}</span>
                </div>
            </div>

            <div className="form-group row">
                <div className="col-9" style={{}}>
                        <CheckboxTree
                        // icons={{
                        //     check: <span className="rct-icon rct-icon-check" />,
                        //     uncheck: <span className="rct-icon rct-icon-uncheck" />,
                        //     halfCheck: <span className="rct-icon rct-icon-half-check" />,
                        //     expandClose: <span className="rct-icon rct-icon-expand-close" />,
                        //     expandOpen: <span className="rct-icon rct-icon-expand-open" />,
                        //     expandAll: <span className="rct-icon rct-icon-expand-all" />,
                        //     collapseAll: <span className="rct-icon rct-icon-collapse-all" />,
                        //     parentClose: <span className="rct-icon rct-icon-parent-close" />,
                        //     parentOpen: <span className="rct-icon rct-icon-parent-open" />,
                        //     leaf: <span className="rct-icon rct-icon-leaf" />,
                        // }}
                        icons={{
                            check: <FontAwesomeIcon className="rct-icon rct-icon-check" icon={faCheckSquare} />,
                            uncheck: <FontAwesomeIcon icon={faSquareFull} />,
                            halfCheck: <FontAwesomeIcon className="rct-icon rct-icon-half-check" icon={faMinusSquare} />,
                            expandOpen: <FontAwesomeIcon icon={faChevronDown} />,
                            expandClose: <FontAwesomeIcon icon={faChevronRight} />,
                            // expandAll: null,
                            // collapseAll: null,
                            // parentClose: null,
                            // parentOpen: null,
                            // leaf: null
                        }}
                            nodes={nutClassesList.map(nut_class=>({value:nut_class,label:nut_class,children: bigNutCodes.map((x,i)=>([i,x]))
                                .filter(c=>c[1] in bigNutInfo[nut_class])
                                .map(c=>[c[0],c[1],bigNutInfo[nut_class][c[1]]])
                                .map(n=>({value:n[0+1], icon:constraintField(this,n[1+1]["long_name"],n[1+1]["unit"],n[0]),label:""}))
                                }))}
                            checked={this.state.checked}
                            expanded={this.state.expanded}
                            onCheck={checked => this.setState({ checked })}
                            onExpand={expanded => this.setState({ expanded })}
                        />
                    </div>
            </div>

        </div>
        </div>
        <div className="row">
          <div className="col-md-6">
          </div>
          <div className="col-md-6 mb-3" style={{textAlign:"right"}}>
            <button type="button" className="btn toolbar-button btn-primary" onClick={this.saveProfile.bind(this)}>Save profile</button>
          </div>
        </div>

    </div>)
    }
}

// constraintField(this,c["long_name"],c["unit"],i)

let constraintField = (thisComp,name,units,i) => {
    return (
    <div key={i} className="constraintField">
        <span title={name}>{name}</span>
    <small className="units-span">{units}</small>
    {/* <div className="ing-field-container"> */}
    <NumberField thisComp={thisComp} style={{width:"20px",marginLeft:"10px",marginRight:"10px", display:"inherit"}} className="ing-limits"
        setValue={(value, onValueSet)=>{thisComp.props.changeLims(i,{"max":value/100},onValueSet)}}
        onPressedEnter={thisComp.props.calculateDietIfNeeded}
        index={i}
        name="maxs"
        />
    <NumberField thisComp={thisComp} style={{width:"20px",marginLeft:"10px",marginRight:"10px", display:"inherit"}} className="ing-limits"
        setValue={(value, onValueSet)=>{thisComp.props.changeLims(i,{"min":value/100},onValueSet)}}
        onPressedEnter={thisComp.props.calculateDietIfNeeded}
        index={i}
        name="mins"
        />
    {/* </div> */}
    </div>
    )
}
