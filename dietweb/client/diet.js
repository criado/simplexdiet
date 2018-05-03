import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import {getFoodInfo, getNutInfo, solveDiet, getSolNuts} from './functions.js'

import { Foods, IngredientPreferences, NutrientPreferences } from "../imports/collections.js"

import { withTracker } from 'meteor/react-meteor-data';

import { Async } from 'react-select';

import DietTable from './diet-table.js'

let nutcodes = [["208","kcal"],["204","g"],["606","g"],["203","g"],["205","g"],["269","g"],["291","g"],["601","mg"],["301","mg"],["312","mg"],["303","mg"],["304","mg"],["315","mg"],["305","mg"],["306","mg"],["307","mg"],["317","µg"],["309","mg"],["421","mg"],["320","µg"],["404","mg"],["405","mg"],["406","mg"],["410","mg"],["415","mg"],["417","µg"],["418","µg"],["401","mg"],["328","µg"],["323","mg"],["430","µg"],["619","g"],["618","g"]];

class App extends React.Component {
  constructor(props) {
    super(props);
    // nutcodes = nutcodes.sort((a,b)=>parseInt(a[0])-parseInt(b[0]))
    this.state={dietVec: [],
      feasible: true,
      price:0,
      ingPref: props.ingPref,
      foods:[],
      nutcodes,
      nutrients:[],
      nutInfo: {},
      nutTots:[],
      nutPref: props.nutPref
    }
  }
  componentDidMount() {
    const thisComp = this;
    getNutInfo(this.state.nutcodes).then(res=>{
      // console.log("getNuts",res);
      thisComp.setState({
        nutrients: res.nutList,
        nutInfo: res.nutInfo
      })
    })
    if (!this.props.prefLoading)
      this.calculateDiet()
  }
  componentDidUpdate(prevProps) {
    if ((prevProps.ingPref !== this.props.ingPref || prevProps.nutPref !== this.props.nutPref ) && !this.props.prefLoading )
      this.calculateDiet()
  }
  calculateDiet() {
    const thisComp = this;
    // this.updatePrefs()

    const parseLimit = (lim) => {
      if (typeof lim === "number" && !isNaN(lim)) return lim
      else return null
    }

    this.setState({ingPref: thisComp.props.ingPref,nutPref:thisComp.props.nutPref})

    let ingPref = this.props.ingPref
    let ingPrefCustom = {};
    let ingPrefCutomIds = [];
    let ingPrefUSDA = {};
    for (key in ingPref) {
      if (ingPref[key].custom) {
        ingPrefCustom[key] = ingPref[key]
        ingPrefCutomIds.push(key)
      }
      else ingPrefUSDA[key] = ingPref[key]
    }
    let foodNutsCustom = this.props.foodNutsCustom
    let foodInfoCustom = this.props.foodInfoCustom
    let nutPref = this.props.nutPref
    let nutcodes = this.state.nutcodes

    let nutFoods = {};
    for (let key in nutPref) {
      let obj = {}
      for (let key2 in nutPref) {
        if (key2!==key) obj[key2]=0
        else obj[key2] = 1
      }
      obj["price"]=1e6;
      nutFoods[key] = obj
    }
    for (let key in nutPref) {
      let obj = {}
      for (let key2 in nutPref) {
        if (key2!==key) obj[key2]=0
        else obj[key2] = -1
      }
      obj["price"]=1e6;
      nutFoods["anti-"+key] = obj
    }
    console.log(foodNutsCustom)
    getFoodInfo(ingPrefUSDA,nutcodes).then(res=>{
      console.log("getFoods",res);
      let foodNuts = {...res.foodNuts, ...foodNutsCustom};
      let foodInfo = {...res.foodInfo, ...foodInfoCustom};
      let solution = solveDiet(foodNuts,nutFoods,ingPref,nutPref, "price");
      console.log("solution",solution)
      let {foundNuts, nutTots} = getSolNuts(solution,nutFoods,ingPref,nutcodes,foodNuts)
      console.log(nutTots)
      let dietVec = [];
      for (let key in solution) {
        if (key !== "feasible" && key !== "bounded" && key!=="result" && (key in foodInfo) ) {
          // console.log(ingPref);
          dietVec.push({
            "name":foodInfo[key].name,
            "id":foodInfo[key].id,
            "amount":solution[key],
            "nutAmounts":foundNuts[key]
          })
        }
      }

      for (let key in solution) {
        if (key !== "feasible" && key !== "bounded" && key!=="result" && !(key in foodInfo) ) {
          // console.log(ingPref);
          dietVec.push({
            "name":key,
            "id":key,
            "amount":solution[key],
            "nutAmounts":foundNuts[key]
          })
        }
      }

      thisComp.setState({
        dietVec:dietVec,
        feasible:solution.feasible,
        nutTots,
        price:solution.result})
      // console.log(solution);
    })
  }
  changeLims(foodId,newLim) {
    const thisComp = this;
    console.log(newLim)
    let newIngPref = thisComp.state.ingPref;
    newIngPref[foodId] = { ...thisComp.state.ingPref[foodId], ...newLim}
    this.setState({
      ingPref: newIngPref
    },()=>{
      thisComp.updatePrefs()
    })
  }
  changeNutLims(nutId,newLim) {
    const thisComp = this;
    console.log(newLim)
    let newNutPref = thisComp.state.nutPref;
    newNutPref[nutId] = { ...thisComp.state.nutPref[nutId], ...newLim}
    this.setState({
      nutPref: newNutPref
    },()=>{
      thisComp.updatePrefs()
    })
  }
  updatePrefs() {
    const thisComp = this;
    IngredientPreferences.update({
      _id:Meteor.userId()
    },
    {
      _id:Meteor.userId(),
      ingPref:thisComp.state.ingPref
    },
    {upsert:true})
    NutrientPreferences.update({
      _id:Meteor.userId()
    },
    {
      _id:Meteor.userId(),
      nutPref:thisComp.state.nutPref
    },
    {upsert:true})
  }
  addIng(food) {
    let foodId = food.value[0]
    let custom = food.value[1]
    console.log("adding",foodId,food)
    let newIngPref = this.state.ingPref;
    newIngPref[foodId] = {"price": 0.0,"custom":custom}
    this.setState({ingPref: newIngPref})
    this.updatePrefs()
  }
  removeIng(food) {
    console.log("removing",food)
    let newIngPref = this.state.ingPref;
    delete newIngPref[food]
    this.setState({ingPref: newIngPref})
    this.updatePrefs()
  }
  renderDiet() {
    if (this.state.feasible) {
      return <DietTable
          diet={this.state.dietVec}
          ings={this.state.ingPref}
          nutList={this.state.nutrients}
          nutInfo={this.state.nutInfo}
          nutPref={this.state.nutPref}
          nutTots={this.state.nutTots}
          changeLims={this.changeLims.bind(this)}
          changeNutLims={this.changeNutLims.bind(this)}
          removeIng={this.removeIng.bind(this)}/>
    } else {
      return (<div className="alert alert-danger" role="alert">
        <strong>Oh snap!</strong> No feasible primal solution!
      </div>)
    }
  }
  render() {
    let thisComp = this;
    return (<div className="container food-matrix">
    <div className="row">
      {/* <button type="button" id="calculate-diet-button" className="btn btn-primary toolbar-button" onClick={this.updatePrefs.bind(this)}>Calculate diet</button> */}
      {/* <button type="button" id="calculate-diet-button" className="btn btn-primary toolbar-button" onClick={this.updatePrefs.bind(this)}>Update preferences</button> */}
      <a href="/new-food"><button type="button" id="new-food" className="btn btn-primary toolbar-button">New food</button></a>
        <br/>
    </div>
    <div className="row">
      {this.renderDiet()}
    </div>
    <div className="row">
      <Async
        name="form-field-name"
        loadOptions={getFoodOptions}
        onChange={this.addIng.bind(this)}
      />
    </div>
    <hr/>
    </div>)
  }
}

const getFoodOptions = (input, callback) => {
  console.log(input)
  Meteor.call("getFoodNamesData",input,(err,res)=>{
    if (err) console.log(err)
    let foodsUSDA = res.USDA ? res.USDA : [];
    let foodsCustom = res.customFoods;
    // console.log("foodnames",foods)
    callback(null,
      {options:
        foodsUSDA.map(x=>({value: [x.id,false], label: x.name}))
          .concat(foodsCustom.map(x=>({value: [x._id,true], label: x.name})))
      })
  })

};

App.propTypes = {
  ingPref: PropTypes.object.isRequired,
  nutPref: PropTypes.object.isRequired,
};

export default withTracker(props => {

  const handle1 = Meteor.subscribe('ingPrefs');
  const handle2 = Meteor.subscribe('nutPrefs');
  const handle3 = Meteor.subscribe('foods');

  let ingPrefObj = IngredientPreferences.findOne({_id:Meteor.userId()});
  let defaultIngPref = {"11463":{"price":0.155},"11675":{"max":4,"price":0.08},"12036":{"price":0.59},"12166":{"price":0.8},"12220":{"price":0.783},"19165":{"price":1.129},"20445":{"max":1.6,"price":0.045},"45006968":{"price":0.0001},"01211":{"max":5,"price":0.04},"08120":{"max":0.9,"price":0.075},"08084":{"price":0.275},"01129":{"min":0.5,"max":1.2,"price":0.6},"04053":{"price":0.411},"09040":{"max":3,"price":0.1},"04589":{"max":0.01,"price":0.038},"09037":{"price":0.56}}

  let nutPrefObj = NutrientPreferences.findOne({_id:Meteor.userId()});
  let defaultNutPref = {"203":{"min":70,"max":96},"204":{"min":66.66666666666667,"max":78},"205":{"min":325,"max":380.25},"208":{"min":2000,"max":2340},"269":{"max":150},"291":{"min":23,"max":46},"301":{"min":1000,"max":2500},"303":{"min":14.4,"max":45},"304":{"min":400},"305":{"min":700,"max":4000},"306":{"min":4700},"307":{"min":1500,"max":2300},"309":{"min":16.5,"max":40},"312":{"min":0.9,"max":10},"315":{"min":2.3,"max":11},"317":{"min":55,"max":400},"320":{"min":900,"max":1350},"323":{"min":15,"max":1000},"328":{"min":5,"max":100},"401":{"min":90,"max":2000},"404":{"min":1.2},"405":{"min":1.3},"406":{"min":16,"max":35},"410":{"min":5},"415":{"min":1.3,"max":100},"417":{"min":400,"max":1000},"418":{"min":2.4},"421":{"min":550,"max":3500},"430":{"min":120},"606":{"max":25},"618":{"min":16.83,"max":17.17},"619":{"min":1.584,"max":1.616}}

  let loading = !handle1.ready() || !handle2.ready() || !handle3.ready()
  let resultsExist = !loading && !!ingPrefObj && !!nutPrefObj

  let ingPref = resultsExist? ingPrefObj.ingPref: defaultIngPref;
  let nutPref = resultsExist? nutPrefObj.nutPref: defaultNutPref;

  for (var i = 0; i < nutcodes.length; i++) {
    if (!(nutcodes[i][0] in nutPref)) {
      nutPref[nutcodes[i][0]] = {}
    }
  }

  let ingPrefCustom = {};
  let ingPrefCutomIds = [];
  let ingPrefUSDA = {};
  for (key in ingPref) {
    if (ingPref[key].custom) {
      ingPrefCustom[key] = ingPref[key]
      ingPrefCutomIds.push(key)
    }
    else ingPrefUSDA[key] = ingPref[key]
  }

  let foodInfoCustom
  if (resultsExist)
    foodInfoCustom = Foods.find({_id: {$in: ingPrefCutomIds}}).fetch().map(x=>({...x,id:x._id}));
    console.log("foodInfoCustom",ingPrefCutomIds, foodInfoCustom)

    let foodsFound = !loading && !!foodInfoCustom
    let foodNutsCustom
    if (foodsFound) {
      foodNutsCustom = foodInfoCustom
      .reduce((fs,f,i)=>{
        let nutrients = f.nutrients;
        nutrients["price"] = f.price;
        nutrients[f.id] = 1;
        fs[f.id]=nutrients;
        return fs;
      },{});

      foodInfoCustom = foodInfoCustom
      .reduce((fs,f,i)=>{
        fs[f.id]=f;
        return fs;
      },{});
    }


  console.log("foodNutsCustom",foodNutsCustom)
  console.log(resultsExist,ingPrefObj)

  return {
    currentUser:Meteor.user(),
    prefLoading: loading,
    ingPref,
    nutPref,
    foodNutsCustom,
    foodInfoCustom
  };
})(App);



// const concat = (x,y) =>
// x.concat(y)
// const flatMap = (f,xs) =>
// xs.map(f).reduce(concat, [])

// return this.state.dietVec.map((x,i)=>{
//   return (<li key={i} className="list-group-item">{x.name}: {parseFloat(x.amount)*100} g</li>)
// })
