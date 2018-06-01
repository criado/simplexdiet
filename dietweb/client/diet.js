import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import {getFoodInfo, getNutInfo, solveDiet, getSolNuts} from './functions.js'

import { Foods, IngredientPreferences, NutrientPreferences } from "../imports/collections.js"

import { withTracker } from 'meteor/react-meteor-data';

import { Async } from 'react-select';

import DietTable from './diet-table.js'

import { nutcodes, nutInfo } from '../imports/nut-info.js'

const newEmptyFood = (id,name) => ({
  id,
  name,
  amount: 0,
  nutAmounts: nutcodes.map(x=>0)
})

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
      nutrients: nutcodes.map(n=>({"id":n,"name":nutInfo[n].long_name,"unit":nutInfo[n].unit})),
      nutInfo: nutInfo,
      nutTots:nutcodes.map(x=>0),
      dietVec: [],
      nutPref: props.nutPref,
      has_changed: false,
      first_time: true // It is true because we want to compute the diet in the beginning
    }
  }
  componentDidUpdate(prevProps) {
    console.log("NUTPREF", this.props.nutPref)
    console.log("foodNutsCustom", this.props.foodNutsCustom)
    //if ((prevProps.ingPref !== this.props.ingPref || prevProps.nutPref !== this.props.nutPref ) && !this.props.prefLoading ){
    if (this.state.first_time && !this.props.prefLoading){
      this.setState({dietVec: Object.keys(this.props.ingPref).map(fid=>newEmptyFood(fid,fid)), ingPref: this.props.ingPref,nutPref:this.props.nutPref, first_time: false}, () => {
        this.calculateDiet()
      })
    }
  }
  calculateDiet() {
    const thisComp = this;

    const parseLimit = (lim) => {
      if (typeof lim === "number" && !isNaN(lim)) return lim
      else return null
    }

    // this.setState({ingPref: thisComp.props.ingPref,nutPref:thisComp.props.nutPref})

    let ingPref = this.state.ingPref

    let foodNutsCustom = this.props.foodNutsCustom
    let foodInfoCustom = this.props.foodInfoCustom
    let nutPref = this.state.nutPref
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
    // getFoodInfo(ingPrefUSDA,nutcodes).then(res=>{
    //   console.log("getFoods",res);
    // let foodNuts = {...res.foodNuts, ...foodNutsCustom};
    let foodNuts = foodNutsCustom;
    // console.log("foodNuts", foodNuts)
    // let foodInfo = {...res.foodInfo, ...foodInfoCustom};
    let foodInfo = foodInfoCustom;
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
    // })
  }

  changeLims(foodId,newLim) {
    const thisComp = this;
    console.log(newLim)
    let newIngPref = thisComp.state.ingPref;
    newIngPref[foodId] = { ...thisComp.state.ingPref[foodId], ...newLim}
    this.setState({
      ingPref: newIngPref,
      has_changed: true,
    })
  }

  changePrice(foodId,newPrice) {
    const thisComp = this;
    let newIngPref = thisComp.state.ingPref;
    newIngPref[foodId].price = newPrice;
    this.setState({
      ingPref: newIngPref,
      has_changed: true,
    })
  }

  changeNutLims(nutId,newLim) {
    const thisComp = this;
    console.log(newLim)
    let newNutPref = thisComp.state.nutPref;
    newNutPref[nutId] = { ...thisComp.state.nutPref[nutId], ...newLim}
    this.setState({
      nutPref: newNutPref,
      has_changed: true
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
    {upsert:true},()=>{
      NutrientPreferences.update({
        _id:Meteor.userId()
      },
      {
        _id:Meteor.userId(),
        nutPref:thisComp.state.nutPref
      },
      {upsert:true})
    })
}
  addIng(food) {
    food = food.value;
    let foodId = food.id
    let custom = food.custom
    console.log("adding",foodId,food)
    let newIngPref = this.state.ingPref;
    newIngPref[foodId] = {"price": food.price,"custom":custom}
    this.setState({
      ingPref: newIngPref,
      has_changed:true
    },()=>{
      this.updatePrefs()
      let vec = this.state.dietVec;
      vec.push(newEmptyFood(foodId,food.name))
      this.setState({dietVec: vec})
    })
  }
  removeIng(foodId) {
    console.log("removing",foodId)
    let newIngPref = this.state.ingPref;
    delete newIngPref[foodId]
    this.setState({ingPref: newIngPref, has_changed:true},()=>{
      this.updatePrefs()
      this.setState({dietVec: this.state.dietVec.filter(f=>f.id!==foodId)})
    })
  }
  renderDiet() {
    console.log("this.state.ingPref !== {}", this.state.ingPref !== {})
    if (this.state.dietVec.length === 0) {
      if (!this.props.prefLoading && !Meteor.user()) {
        return (<div className="alert alert-warning" role="alert">
          <strong>Hi!</strong> Login to create a diet!
        </div>)
      }
      if (!this.props.prefLoading) {
        return (<div className="alert alert-info" role="alert">
          <strong>Heads up!</strong> Please add an ingredient to start creating your diet!
        </div>)
      } else {
        return ""
      }
    }
    else if (this.state.feasible) {
      return <DietTable
          diet={this.state.dietVec}
          ings={this.state.ingPref}
          nutList={this.state.nutrients}
          nutInfo={this.state.nutInfo}
          nutPref={this.state.nutPref}
          nutTots={this.state.nutTots}
          changeLims={this.changeLims.bind(this)}
          changePrice={this.changePrice.bind(this)}
          changeNutLims={this.changeNutLims.bind(this)}
          calculateDietIfNeeded={()=>{
              this.updatePrefs()
              this.calculateDietIfNeeded()
          }}
          removeIng={this.removeIng.bind(this)}/>
    } else { //no feasible and vector isn't []
      return (<div>
        <div className="alert alert-danger" role="alert">
          <strong>Oh snap!</strong> No feasible primal solution!
        </div>
        <DietTable
          diet={this.state.dietVec}
          ings={this.state.ingPref}
          nutList={this.state.nutrients}
          nutInfo={this.state.nutInfo}
          nutPref={this.state.nutPref}
          nutTots={this.state.nutTots}
          changeLims={this.changeLims.bind(this)}
          changePrice={this.changePrice.bind(this)}
          changeNutLims={this.changeNutLims.bind(this)}
          calculateDietIfNeeded={()=>{
              this.updatePrefs()
              this.calculateDietIfNeeded()
          }}
          removeIng={this.removeIng.bind(this)}/>
      </div>)
    }
  }
  calculateDietIfNeeded() {
    if (this.state.has_changed){
       this.calculateDiet()
       this.setState({has_changed: false})
    }
  }
  render() {
    let caloriesSpan = "";
    if (this.state.feasible && this.state.dietVec.length !== 0) {
      let thisComp = this;
      let carbs_energy = this.state.nutTots[4]*4, fat_energy = this.state.nutTots[1]*9, protein_energy = this.state.nutTots[3]*4
      let total_energy = carbs_energy + fat_energy + protein_energy // Note this is not the same as this.state.nutTots["kcals"] because of the error due to the factors 4, 9, and 4 to approximate the energy
      carbs_energy = carbs_energy*100/total_energy
      fat_energy = fat_energy*100/total_energy
      protein_energy = protein_energy*100/total_energy
      caloriesSpan = <span> {"Carbs: " + carbs_energy.toFixed(2) + "%, Fat: " + fat_energy.toFixed(2) + " %, Protein: " + protein_energy.toFixed(2) + "%"} </span>
    }
    return (<div className="container food-matrix">
    <div className="row">
      {caloriesSpan}
      <button type="button" id="calculate-diet-button" className="btn btn-primary toolbar-button" onClick={()=> {
        this.updatePrefs()
        this.calculateDietIfNeeded()
      }}>Calculate diet</button>
      {/* <button type="button" id="calculate-diet-button" className="btn btn-primary toolbar-button" onClick={this.updatePrefs.bind(this)}>Update preferences</button> */}
      <a href="/new-food"><button type="button" id="new-food" style={{"margin-right":"10px"}} className="btn btn-primary toolbar-button">New food</button></a>
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
    let foodsCustom = res;
    // console.log("foodnames",foods)
    callback(null,
      {options:
        foodsCustom.map(x=>({value: {id:x._id,name:x.name,custom:true,price:x.price}, label: x.name+" ("+x.user+")"}))
      })
  })

};

App.propTypes = {
  ingPref: PropTypes.object.isRequired,
  nutPref: PropTypes.object.isRequired,
};

export default withTracker(props => {

  // const handle1 = Meteor.subscribe('diets');
  const handle1 = Meteor.subscribe('ingPrefs');
  const handle2 = Meteor.subscribe('nutPrefs');
  const handle3 = Meteor.subscribe('foods');

  // let diet = IngredientPreferences.findOne({_id:Meteor.userId()});
  let ingPrefObj = IngredientPreferences.findOne({_id:Meteor.userId()});
  // console.log("ingPrefObj", ingPrefObj, !!ingPrefObj)
  // let defaultIngPref = {"11463":{"price":0.155},"11675":{"max":4,"price":0.08},"12036":{"price":0.59},"12166":{"price":0.8},"12220":{"price":0.783},"19165":{"price":1.129},"20445":{"max":1.6,"price":0.045},"01211":{"max":5,"price":0.04},"08120":{"max":0.9,"price":0.075},"08084":{"price":0.275},"01129":{"min":0.5,"max":1.2,"price":0.6},"04053":{"price":0.411},"09040":{"max":3,"price":0.1},"04589":{"max":0.01,"price":0.038},"09037":{"price":0.56}}
  //////TODO defaultDiet
  // let defaultDiet = {"name":"Default", }
  let defaultIngPref = {}
  let nutPrefObj = NutrientPreferences.findOne({_id:Meteor.userId()});
  // let defaultNutPref = {"203":{"min":70,"max":96},"204":{"min":66.66666666666667,"max":78},"205":{"min":325,"max":380.25},"208":{"min":2000,"max":2340},"269":{"max":150},"291":{"min":23,"max":46},"301":{"min":1000,"max":2500},"303":{"min":14.4,"max":45},"304":{"min":400},"305":{"min":700,"max":4000},"306":{"min":4700},"307":{"min":1500,"max":2300},"309":{"min":16.5,"max":40},"312":{"min":0.9,"max":10},"315":{"min":2.3,"max":11},"317":{"min":55,"max":400},"320":{"min":900,"max":1350},"323":{"min":15,"max":1000},"328":{"min":5,"max":100},"401":{"min":90,"max":2000},"404":{"min":1.2},"405":{"min":1.3},"406":{"min":16,"max":35},"410":{"min":5},"415":{"min":1.3,"max":100},"417":{"min":400,"max":1000},"418":{"min":2.4},"421":{"min":550,"max":3500},"430":{"min":120},"606":{"max":25},"618":{"min":16.83,"max":17.17},"619":{"min":1.584,"max":1.616}}
  // console.log("nutPrefObj", nutPrefObj, !!nutPrefObj)
  let defaultNutPref = {}

  let loading = !handle1.ready() || !handle2.ready() || !handle3.ready()
  let resultsExist = !loading && !!ingPrefObj && !!nutPrefObj

  let ingPref = resultsExist? ingPrefObj.ingPref: defaultIngPref;
  let nutPref = resultsExist? nutPrefObj.nutPref: defaultNutPref;
  // console.log("ingPref", ingPref)
  for (var i = 0; i < nutcodes.length; i++) {
    if (!(nutcodes[i] in nutPref)) {
      nutPref[nutcodes[i]] = {}
    }
  }

  let ingPrefCustom = {};
  let ingPrefCutomIds = [];
  for (key in ingPref) {
    ingPrefCustom[key] = ingPref[key]
    ingPrefCutomIds.push(key)
  }
  // console.log("ingPrefCutomIds", ingPrefCutomIds)

  let foodInfoCustom
  if (!loading)
    foodInfoCustom = Foods.find({_id: {$in: ingPrefCutomIds}}).fetch().map(x=>({...x,id:x._id}));
    // console.log("foodInfoCustom",ingPrefCutomIds, foodInfoCustom)

    let foodsFound = !loading && !!foodInfoCustom
    let foodNutsCustom
    if (foodsFound) {
      foodNutsCustom = foodInfoCustom
      .reduce((fs,f,i)=>{
        let nutrients = f.nutrients;
        for (var i = 0; i < nutcodes.length; i++) {
          if (!(nutcodes[i] in nutrients)) {
            nutrients[nutcodes[i]] = 0
          }
        }
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
