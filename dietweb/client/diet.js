import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import {getFoodInfo, getNutInfo, solveDiet, getSolNuts} from './functions.js'

import { Foods, Diets, NutrientPreferences } from "../imports/collections.js"

import { withTracker } from 'meteor/react-meteor-data';

import { Async } from 'react-select';
import 'react-select/dist/react-select.css';

import PopoutSelect from './cool-select.jsx'

import DietTable from './diet-table.js'

import { nutInfo } from '../imports/nut-info.js'

let MAX_DIETRUNS_SAVED = 15;

function swapInArray(arr, id1,id2) {
  let result;
  if (id2 > id1) {
    result = [...arr.slice(0,id1),
                    arr[id2],
                    ...arr.slice(id1,id2),
                    ...arr.slice(id2+1)
                ]
  } else if (id2 < id1) {
    result = [...arr.slice(0,id2),
                ...arr.slice(id2+1,id1),
                arr[id2],
                ...arr.slice(id1)
                ]
  } else {
    result = arr
  }
  return result
}

let dietRunToAppState = (dietRun,nutInfo) => ({
  ingPref: dietRun.ingPref.reduce((xs,x)=>{xs[x.id]={min:x.min,max:x.max,price:x.price}; return xs},{}),
  nutPref: dietRun.nutPref.nutPref.reduce((xs,x)=>{xs[x.id]={min:x.min,max:x.max}; return xs},{}),
  nutCodes: dietRun.nutPref.nutPref.map(n=>n.id), //specify the order
  ingCodes: dietRun.ingPref.map(n=>n.id), //specify the order
  nutrients: dietRun.nutPref.nutPref.map(n=>n.id).map(n=>({"id":n,"name":nutInfo[n].long_name,"unit":nutInfo[n].unit})), //like nutcodes but with extra info
  dietVec: dietRun.sol || Object.keys(dietRun.ingPref).map(fid=>newEmptyFood(fid,fid,dietRun.nutPref.nutPref.map(n=>n.id))), //like with ingcodes, but with solution, and extra info
  nutTots: dietRun.nutTots || dietRun.nutPref.nutPref.map(x=>0),
})

const newEmptyFood = (id,name,nutCodes) => ({
  id,
  name,
  amount: 0,
  nutAmounts: nutCodes.map(x=>0)
})

/*
we store ingPref, nutPref lists in database, and then we split them into ingPref, nutPref objects, and nutCodes, ingCodes lists, which
store the info and the order separately.
*/

class App extends React.Component {
  constructor(props) {
    super(props);
    // nutCodes = nutCodes.sort((a,b)=>parseInt(a[0])-parseInt(b[0]))
    let lastDietRun = props.diet.runs[props.diet.runs.length-1];
    this.state={dietVec: [],
      feasible: true,
      dietId: props.diet._id,
      name: props.diet.name,
      price:props.diet.price,
      nutInfo,
      dietRuns: props.diet.runs,
      ...dietRunToAppState(lastDietRun,nutInfo), //adding ingPrefs, nutPrefs, etc as state variables
      requires_recalculate: false,
      requires_save: false,
      first_time: true, // It is true because we want to compute the diet in the beginning
      solution: {}
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    let lastDietRun = this.props.diet.runs[this.props.diet.runs.length-1];
    //If this is the first time, and we have retrieved a diet without a calculated solution... (this shouldn't really happen except when testing)

    if (this.state.first_time && !this.props.loading){
      this.setState({
        dietId: this.props.diet._id,
        name: this.props.diet.name,
        price:this.props.diet.price,
        dietRuns: this.props.diet.runs,
        ...dietRunToAppState(lastDietRun,nutInfo),
        first_time: false
      }, () => {
        console.log("CALCULATE DIET")
        if (!lastDietRun.sol || !lastDietRun.nutTots)
          this.calculateDiet()
      })
    } else if (this.state.requires_save && prevState !== this.state) {
        //we ONLY
        this.setState({
          requires_save:false,
        })
        this.updatePrefs()
    }


  }

  calculateDiet(calculate_solution=true) {
    const thisComp = this;
    const nutFoodPrice = 1e6;

    const parseLimit = (lim) => {
      if (typeof lim === "number" && !isNaN(lim)) return lim
      else return null
    }

    let ingPref = this.state.ingPref;

    let foodNutsCustom = this.props.foodNutsCustom
    let foodInfoCustom = this.props.foodInfoCustom
    let nutPref = this.state.nutPref
    let nutCodes = this.state.nutCodes

    let nutFoods = {};
    for (let key in nutPref) {
      let obj = {}
      for (let key2 in nutPref) {
        if (key2!==key) obj[key2]=0
        else obj[key2] = 1
      }
      obj["price"]=1e9;
      nutFoods[key] = obj
    }
    for (let key in nutPref) {
      let obj = {}
      for (let key2 in nutPref) {
        if (key2!==key) obj[key2]=0
        else obj[key2] = -1
      }
      obj["price"]=nutFoodPrice;
      nutFoods["anti-"+key] = obj
    }
    for (let key in ingPref) {
      foodNutsCustom[key].price=ingPref[key].price;
    }
    console.log(foodNutsCustom)
    let foodNuts = foodNutsCustom;
    let foodInfo = foodInfoCustom;

    // foodNuts = Object.keys(foodNuts).reduce((xs,x)=>{
    //   xs["$"+x]=foodNuts[x]
    //   return xs
    // },{})

    // ingPref = Object.keys(ingPref).reduce((xs,x)=>{
    //   xs["$"+x]=ingPref[x]
    //   return xs
    // },{})


    let solution;
    if (calculate_solution)
      solution= solveDiet(foodNuts,nutFoods,ingPref,nutPref, "price");
    else
      solution = this.state.solution
    console.log("solution",solution)

    let {foundNuts, nutTots} = getSolNuts(solution,nutFoods,ingPref,nutCodes,foodNuts)
    console.log(nutTots)

    let dietVec = [];

    //Adding the normal foods
    for (let key of this.state.ingCodes) {
      if ((key in solution) && (key in foodInfo)) {
        // console.log(ingPref);
        dietVec.push({
          "name":foodInfo[key].name,
          "id":foodInfo[key].id,
          "amount":solution[key],
          "nutAmounts":foundNuts[key]
        })
      }
    }

    let price = solution.result;

    //adding the nuts and anti-nuts
    for (let key in solution) {
      if (key !== "feasible" && key !== "bounded" && key!=="result" && !(key in foodInfo) ) {
        price -= solution[key]*nutFoodPrice;
        // console.log(ingPref);
        dietVec.push({
          "name":key,
          "nutFood":true,
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
      price,
      solution
    })
      // console.log(solution);
    // })
  }

  updatePrefs() {
    //Update diet history
    //and here is where we save to database too :)

    let username = Meteor.user() ? Meteor.user().username : "";

    let runs = this.state.dietRuns;
    let oldNutPrefObj = runs[runs.length-1].nutPref;

    let ingPref = this.state.ingCodes.map(f=>({id:f, ...this.state.ingPref[f]}))
    let nutPref = this.state.nutCodes.map(f=>({id:f, ...this.state.nutPref[f]}));
    let nutPrefObj = {name:oldNutPrefObj.name, user:oldNutPrefObj.user, nutPref: nutPref, extraConstraints: oldNutPrefObj.extraConstraints}

    if (runs.length === MAX_DIETRUNS_SAVED) {
      runs.splice(0, 1)
    }
    runs.push({ingPref, nutPref:nutPrefObj, sol:this.state.dietVec})

    // console.log(this.props.diet._id)
    this.setState({dietRuns: runs}, ()=>{
      Diets.update({_id:this.state.dietId},
      { "$set": { name: this.state.name,
      user:username,
      price: this.state.price,
      runs:this.state.dietRuns } },
      {upsert:true})
    })
  }

  forkDiet() {
    //Basically, "save as"

    let username = Meteor.user() ? Meteor.user().username : "";

    // let runs = this.state.dietRuns;

    // let ingPref = this.state.ingCodes.map(f=>({id:f, ...this.state.ingPref[f]}))
    // let nutPref = this.state.nutCodes.map(f=>({id:f, ...this.state.nutPref[f]}));

    // if (runs.length === MAX_DIETRUNS_SAVED) {
    //   runs.splice(0, 1)
    // }
    // runs.push({ingPref, nutPref, sol:this.state.dietVec})

    console.log(this.props.diet._id)

    Diets.insert({ name: this.state.name,
      user:username,
      price: this.state.price,
      runs:this.state.dietRuns
      },(err,id)=>{
        if (err) console.log(err)
        else this.setState({dietId:id})
    })
  }

  //FUNDAMENTAL CHANGES TO STATE (things that require recalculation of diet)

  changeLims(foodId,newLim,callback) {
    console.log(newLim)

    let ingPref = this.state.ingPref;
    ingPref[foodId] = { ...this.state.ingPref[foodId], ...newLim}

    this.setState({
      ingPref,
      requires_recalculate: true,
    },callback)
  }

  changePrice(foodId,newPrice,callback) {
    console.log(newPrice)
    let ingPref = this.state.ingPref;
    ingPref[foodId].price = newPrice;

    this.setState({
      ingPref,
      requires_recalculate: true,
    },callback)
  }

  changeNutLims(nutId,newLim,callback) {
    let nutPref = this.state.nutPref;
    nutPref[nutId] = { ...this.state.nutPref[nutId], ...newLim};

    this.setState({
      nutPref,
      requires_recalculate: true
    },callback)
  }

  //Things that change ingCodes or nutCodes//
  //Adding

  addIng(food) {
    food = food.value;
    let foodId = food.id
    // let custom = food.custom
    if (this.state.ingCodes.includes(foodId)) {
      return
    }
    console.log("adding",foodId,food)
    let ingPref = this.state.ingPref;
    ingPref[foodId] = {"price": food.price}

    let ingCodes = this.state.ingCodes;
    ingCodes.push(foodId)

    let vec = this.state.dietVec;
    let idx = vec.findIndex(x=>x.nutFood)
    vec.splice(idx, 0, newEmptyFood(foodId,food.name,this.state.nutCodes))

    this.setState({
      ingPref,
      ingCodes,
      requires_recalculate:true,
      dietVec: vec,
      selectIngValue:null,
    },()=>{
      this.updatePrefs() //this is a special case: a requires_recalculate which calls updatePrefs, so that we retrieve the nutrients from database for new food
    })
  }

  addNut(nut) {
    let nutId = nut.value;
    // let custom = food.custom
    console.log("adding",nutId)
    let nutPref = this.state.nutPref;
    nutPref[nutId] = {}

    let nutCodes = this.state.nutCodes;
    nutCodes.push(nutId)
    let nutrients = nutCodes.map(n=>({"id":n,"name":nutInfo[n].long_name,"unit":nutInfo[n].unit}));

    this.setState({
      nutPref,
      nutCodes,
      nutrients,
      requires_recalculate:true,
    },()=> {
      this.calculateDiet(false)
    })
  }

  //Removing

  removeIng(foodId) {
    console.log("removing food",foodId)
    let ingPref = this.state.ingPref;
    let ingCodes = this.state.ingCodes;
    delete ingPref[foodId]
    let index = ingCodes.indexOf(foodId);
    if (index > -1) {
      ingCodes.splice(index, 1);
    }
    this.setState({
      ingPref,
      ingCodes,
      dietVec: this.state.dietVec.filter(f=>f.id!==foodId),
      requires_recalculate:true
    })
  }

  removeNut(nutId) {
    console.log("removing nut", nutId)
    let nutPref = this.state.nutPref;
    let nutCodes = this.state.nutCodes.slice();
    delete nutPref[nutId]
    let index = nutCodes.indexOf(nutId);
    if (index > -1) {
      nutCodes.splice(index, 1);
    }

    let nutrients = nutCodes.map(n=>({"id":n,"name":nutInfo[n].long_name,"unit":nutInfo[n].unit}));

    this.setState({
      nutPref,
      nutCodes,
      nutrients,
      dietVec: this.state.dietVec.map(ing=>{
        ing.nutAmounts = ing.nutAmounts.filter((n,i)=>this.state.nutCodes[i]!==nutId)
        return ing
      }),
      requires_recalculate:true
    })
  }

  //Change order

  changeIngOrder(id1,id2) {
    //id2 is moved to be before id1
    console.log(id2,id1)
      this.setState({
        ingCodes: swapInArray(this.state.ingCodes,id1,id2),
        dietVec: swapInArray(this.state.dietVec,id1,id2),
        requires_save: true
      })
  }

  changeNutOrder(id1,id2) {
    //id2 is moved to be before id1
    id1 = parseInt(id1)
    id2 = parseInt(id2)

    // console.log("swapping",id1,id2)

    let nutCodes = swapInArray(this.state.nutCodes,id1,id2);
    let nutrients = nutCodes.map(n=>({"id":n,"name":nutInfo[n].long_name,"unit":nutInfo[n].unit}));
    let nutTots = swapInArray(this.state.nutTots,id1,id2);


    this.setState({
      nutCodes,
      nutrients,
      nutTots,
      dietVec: this.state.dietVec.map(x=>({...x, nutAmounts:swapInArray(x.nutAmounts,id1,id2)})),
      requires_save: true
    })
  }

  loadDiet(diet) {
    diet = diet.value
    let lastDietRun = diet.runs[diet.runs.length-1];

    this.setState({
      name:diet.name,
      price:diet.price,
      dietRuns: diet.runs,
      ...dietRunToAppState(lastDietRun,nutInfo),
    },()=>{
      if (!lastDietRun.sol || !lastDietRun.nutTots)
          this.calculateDiet()
    })
  }

  loadNutPref(nutPref) {
    nutPref = nutPref.value.nutPref
    this.setState({nutPref})
  }

  calculateDietIfNeeded() {
    if (this.state.requires_recalculate){
      this.calculateDiet()
      this.setState({requires_recalculate: false})
      this.updatePrefs()
   }
  }

  handleForkDiet() {
    let dietName = prompt("Please enter diet name", this.state.name);
    this.setState({name:dietName},()=>{
      this.forkDiet()
    })
  }

  renderDiet() {
    if (this.state.dietVec.length === 0) {
      if (!this.props.loading && !Meteor.user()) {
        return (<div className="alert alert-warning" role="alert">
          <strong>Hi!</strong> Login to create a diet!
        </div>)
      }
      if (!this.props.loading) {
        return (<div className="alert alert-info" role="alert">
          <strong>Heads up!</strong> Please add an ingredient to start creating your diet!
        </div>)
      } else {
        return ""
      }
    }
    else {
      let caloriesSpan = "";
      if (this.state.feasible && this.state.dietVec.length !== 0 && !this.props.loading) {
        let thisComp = this;
        let carbs_energy = this.state.nutTots[this.state.nutCodes.indexOf("205")]*4,
            fat_energy = this.state.nutTots[this.state.nutCodes.indexOf("204")]*9,
            protein_energy = this.state.nutTots[this.state.nutCodes.indexOf("203")]*4
        let total_energy = carbs_energy + fat_energy + protein_energy // Note this is not the same as this.state.nutTots["kcals"] because of the error due to the factors 4, 9, and 4 to approximate the energy
        carbs_energy = carbs_energy*100/total_energy
        fat_energy = fat_energy*100/total_energy
        protein_energy = protein_energy*100/total_energy
        caloriesSpan = <div><span><b>{"Price: £"+this.state.price.toFixed(2)}</b></span> <br/> <span> {"Carbs: " + carbs_energy.toFixed(2) + "%, Fat: " + fat_energy.toFixed(2) + " %, Protein: " + protein_energy.toFixed(2) + "%"} </span>&nbsp; </div>
      }

      let DietSelector = <Async
            name="load-diet"
            loadOptions={getDietOptions}
            onChange={this.loadDiet.bind(this)}
            defaultOptions
            cacheOptions
            placeholder={"Diet: "+this.state.name}
            styles={{
              control: styles => ({ ...styles, backgroundColor: "#f2f6f7", borderRadius: 0, height: "26px", minHeight: "26px", borderWidth: 0}),
              placeholder: styles => ({ ...styles, color:"black" }),
            }}
          />

      let dietObject = <DietTable
        diet={this.state.dietVec}
        ings={this.state.ingPref}
        nutList={this.state.nutrients}
        nutInfo={this.state.nutInfo}
        nutPref={this.state.nutPref}
        nutTots={this.state.nutTots}
        changeLims={this.changeLims.bind(this)}
        changePrice={this.changePrice.bind(this)}
        changeNutLims={this.changeNutLims.bind(this)}
        changeIngOrder={this.changeIngOrder.bind(this)}
        changeNutOrder={this.changeNutOrder.bind(this)}
        calculateDietIfNeeded={this.calculateDietIfNeeded.bind(this)}
        removeIng={this.removeIng.bind(this)}
        removeNut={this.removeNut.bind(this)}
        dietStats={caloriesSpan}
        DietSelector={DietSelector}/>
      if (this.state.feasible) {
        return dietObject
      } else { //no feasible and vector isn't []
        return (<div>
          <div className="alert alert-danger" role="alert">
            <strong>Oh snap!</strong> No feasible primal solution!
          </div>
          {dietObject}
        </div>)
      }
    }
  }
  // renderInput = props => {
  //   delete props.value;
  //   return (
  //     <div className="Select-input" style={{ display: "inline-block" }}>
  //       <input {...props} />
  //     </div>
  //   );
  // };
  render() {
    return (<div className="container food-matrix">
    <div className="row toolbar">

      {/* <span>{"NutPref: "}</span>       */}
      <div className="col-md-3">
        <button type="button" id="fork-diet-button" className="btn toolbar-button btn-primary" style={{"marginRight":"10px"}} onClick={this.handleForkDiet.bind(this)}>Fork diet</button>
        <button type="button" id="calculate-diet-button" style={{"marginRight":"10px"}} className="btn toolbar-button btn-primary" disabled={!this.state.requires_recalculate} onClick={this.calculateDietIfNeeded.bind(this)}>Calculate diet</button>
        <a href="/new-food" className="toolbar-button"><button type="button" id="new-food" style={{"marginRight":"10px"}} className="btn btn-primary">Custom food</button></a>
      </div>
      <div className="3col-md-3 ml-auto" style={{float:"right"}}>
        <Async
          name="load-pref"
          className="load-pref"
          loadOptions={getNutPrefOptions}
          value={this.state.selectNutPrefValue}
          onChange={this.loadNutPref.bind(this)}
          // style={{display:'inline-block',
          // width: "200px",
          // marginRight: "10px"}}
          // styles={{
          //   control: styles => ({ ...styles, backgroundColor: "#f7f7f7", height: "35px", minHeight: "35px"}),
          //   container: (base) => ({
          //         ...base,
          //         display:'inline-block',
          //         width: "200px",
          //         marginRight: "10px"
          //     }),
          //   // placeholder: styles => ({ ...styles, color:"black" }),
          // }}
          placeholder="Nutrient prefs..."
          defaultOptions
          cacheOptions
        />
        &nbsp;
        <Async
          name="add-new-nut"
          className="add-new-nut"
          loadOptions={getNutOptions}
          onChange={this.addNut.bind(this)}
          placeholder="Add nutrient..."
          // style={{display:'inline-block',width: "150px"}}
          // styles={{
          //     control: styles => ({ ...styles, backgroundColor: "#f7f7f7", height: "35px", minHeight: "35px"}),
          //     container: (base) => ({
          //           ...base,
          //           display:'inline-block',
          //           width: "150px",
          //       }),
          //     // placeholder: styles => ({ ...styles, color:"black" }),
          //   }}
          defaultOptions
          cacheOptions
        />
      </div>
      {/* TODO: Need button for saving nutPref.. */}
      {/* <button type="button" id="calculate-diet-button" className="btn btn-primary toolbar-button" onClick={this.updatePrefs.bind(this)}>Update preferences</button> */}
        {/* <br/> */}
    </div>
    <br/>
    {/* <div className="row">

    </div> */}
    <div className="row">
      {this.renderDiet()}
    </div>
    <div className="row">
      <Async
        name="add-new-ing"
        loadOptions={getFoodOptions}
        onBlurResetsInput={false}
        filterOptions={(options, filter, currentValues) => {
          // Do no filtering, just return all options
          return options.filter(x=>!this.state.ingCodes.includes(x.value.id));
        }}
        cache={false}
        filterOption={() => true}
        onChange={this.addIng.bind(this)}
      />
    </div>
    <hr/>
    </div>)
  }
}

//FOR react-select VERSION 2

// //function to populate the food selector, to add new foods
// const getFoodOptions = (input, callback) => {
//   console.log(input)
//   Meteor.call("getFoodNamesData",input,(err,res)=>{
//     if (err) console.log(err)
//     let foodsCustom = res;
//     // console.log("foodnames",foods)
//     callback(foodsCustom.map(x=>({value: {id:x._id,name:x.name,price:x.price}, label: x.name+" ("+x.user+")"})))
//   })

// };

// //function to populate the nutrient selector, to add new nutrients
// const getNutOptions = (input, callback) => {

//   callback(Object.keys(nutInfo).map(id=>({value: id, label: nutInfo[id].long_name})).filter(n=>n.label.toUpperCase().includes(input.toUpperCase())))

// };

// const getDietOptions = (input, callback) => {
//   console.log(input)
//   Meteor.call("getDiets",input,(err,res)=>{
//     if (err) console.log(err)
//     let diets = res;
//     console.log("results",diets)
//     callback(diets.map(x=>({value: {id:x._id,name:x.name,price:x.price,runs:x.runs}, label: x.name})))
//   })

// };

// const getNutPrefOptions = (input, callback) => {
//   console.log(input)
//   Meteor.call("getNutPrefs",input,(err,res)=>{
//     if (err) console.log(err)
//     let nutPrefs = res;
//     // console.log("foodnames",foods)
//     callback(nutPrefs.map(x=>({value: {id:x._id,name:x.name,nutPref}, label: x.name})))
//   })

// };

//function to populate the food selector, to add new foods
const getFoodOptions = (input, callback) => {
  console.log(input)
  Meteor.call("getFoodNamesData",input,(err,res)=>{
    if (err) console.log(err)
    let foodsCustom = res;
    // console.log("foodnames",foods)
    callback(null,
      {options:
        foodsCustom.map(x=>({value: {id:x._id,name:x.name,price:x.price}, label: x.name+" ("+x.user+")"})),
        cache:false
      })
  })

};

//function to populate the nutrient selector, to add new nutrients
const getNutOptions = (input, callback) => {

  callback(null,
    {options:
      Object.keys(nutInfo).map(id=>({value: id, label: nutInfo[id].long_name})).filter(n=>n.label.toUpperCase().includes(input.toUpperCase()))
    })
};

const getDietOptions = (input, callback) => {
  console.log(input)
  Meteor.call("getDiets",input,(err,res)=>{
    if (err) console.log(err)
    let diets = res;
    console.log("results",diets)
    callback(null,
      {options:
        diets.map(x=>({value: {id:x._id,name:x.name,price:x.price,runs:x.runs}, label: x.name}))
      })
  })

};

const getNutPrefOptions = (input, callback) => {
  console.log(input)
  Meteor.call("getNutPrefs",input,(err,res)=>{
    if (err) console.log(err)
    let nutPrefs = res;
    // console.log("foodnames",foods)
    callback(null,
      {options:
        nutPrefs.map(x=>({value: {id:x._id,name:x.name,nutPref}, label: x.name}))
      })
  })

};


App.propTypes = {
  diet: PropTypes.object.isRequired,
  nutPrefs: PropTypes.array.isRequired,
};

// THIS IS WHERE THE APP COMPONENT GETS THE DATA FROM SERVER,
//whenever data in server changes, component is udpated a la React

export default withTracker(props => {

  const handle1 = Meteor.subscribe('diets');
  // const handle1 = Meteor.subscribe('ingPrefs');
  const handle2 = Meteor.subscribe('nutPrefs');
  const handle3 = Meteor.subscribe('foods');

  let username = Meteor.user() ? Meteor.user().username : ""

  let dietObj = Diets.findOne({user:username});
  // let ingPrefObj = IngredientPreferences.findOne({_id:Meteor.userId()});
  // console.log("ingPrefObj", ingPrefObj, !!ingPrefObj)
  // let defaultIngPref = {}
  // let defaultNutPref = {}
  let nutPrefsServer = NutrientPreferences.findOne({user:username});
  let defaultIngPrefObj = [{"id":"11463","price":0.155},{"id":"11675","max":4,"price":0.08},{"id":"12036","price":0.59},{"id":"12166","price":0.8},{"id":"12220","price":0.783},{"id":"19165","price":1.129},{"id":"20445","max":1.6,"price":0.045},{"id":"01211","max":5,"price":0.04},{"id":"08120","max":0.9,"price":0.075},{"id":"08084","price":0.275},{"id":"01129","min":0.5,"max":1.2,"price":0.6},{"id":"04053","price":0.411},{"id":"09040","max":3,"price":0.1},{"id":"04589","max":0.01,"price":0.038},{"id":"09037","price":0.56}]
  // defaultIngPrefObj = []

  let defaultNutPrefObj = [{"id":"203","min":70,"max":94},{"id":"204","min":66.66666666666667,"max":78},{"id":"205","min":325,"max":380.25},{"id":"208","min":2000,"max":2340},{"id":"269","max":150},{"id":"291","min":23,"max":46},{"id":"601"},{"id":"301","min":1000,"max":2500},{"id":"303","min":14.4,"max":45},{"id":"304","min":400},{"id":"305","min":700,"max":4000},{"id":"306","min":4700},{"id":"307","min":1500,"max":2300},{"id":"309","min":16.5,"max":40},{"id":"312","min":0.9,"max":10},{"id":"315","min":2.3,"max":11},{"id":"317","min":55,"max":400},{"id":"320","min":900,"max":1350},{"id":"323","min":15,"max":1000},{"id":"328","min":5,"max":100},{"id":"401","min":90,"max":2000},{"id":"404","min":1.2},{"id":"405","min":1.3},{"id":"406","min":16,"max":35},{"id":"410","min":5},{"id":"415","min":1.3,"max":100},{"id":"417","min":400,"max":1000},{"id":"418","min":2.4},{"id":"421","min":550,"max":3500},{"id":"430","min":120},{"id":"606","max":25},{"id":"618","min":16.83,"max":17.17},{"id":"619","min":1.584,"max":1.616}]
  let defaultNutPrefs = [{"name":"Default", user:username, nutPref: defaultNutPrefObj, extraConstraints:[] }]

  let defaultDietObj = {"_id":"Default", "name":"Default", user:username, price: 0, runs: [{ingPref: defaultIngPrefObj, nutPref: defaultNutPrefs[0], sol:null}]}
  // console.log("nutPrefObj", nutPrefObj, !!nutPrefObj)

  let loading = !handle1.ready() || !handle2.ready() || !handle3.ready()

  //If we get them from database, use them, otherwise use the default ones
  let diet = (handle1.ready() && !!dietObj) ? dietObj : defaultDietObj;
  console.log(diet)
  let nutPrefs = (!loading && !!nutPrefsServer) ? nutPrefsServer : defaultNutPrefs;

  // console.log("diet",diet)

  let lastDietRun = diet.runs[diet.runs.length-1];

  //PROCESSING FOOD DATA

  let foodInfoCustom
  if (!loading)
    foodInfoCustom = Foods.find({_id: {$in: lastDietRun.ingPref.map(f=>f.id)}}).fetch().map(x=>({...x,id:x._id}));
    // console.log("foodInfoCustom",ingPrefCutomIds, foodInfoCustom)

    console.log(lastDietRun.nutPref);
    let nutCodes = lastDietRun.nutPref.nutPref.map(n=>n.id)
    let foodsFound = !loading && !!foodInfoCustom
    let foodNutsCustom
    if (foodsFound) {
      console.log("foods found!", foodInfoCustom);
      foodNutsCustom = foodInfoCustom
      .reduce((fs,f,i)=>{
        let nutrients = f.nutrients;
        for (var i = 0; i < nutCodes.length; i++) {
          if (!(nutCodes[i] in nutrients)) {
            nutrients[nutCodes[i]] = 0
          }
        }
        nutrients["price"] = lastDietRun.ingPref.filter(x=>x.id===f.id)[0].price ? lastDietRun.ingPref.filter(x=>x.id===f.id)[0].price : f.price;
        if (nutrients["price"] === 0 ) nutrients["price"] = 0.0001
        // console.log("f.price", f.price)
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
  // console.log(lastDietRun.ingPref.map(f=>f.id), "foodInfoCustom",foodInfoCustom)
  // console.log(resultsExist,ingPrefObj)

  return {
    loading,
    diet,
    nutPrefs,
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
