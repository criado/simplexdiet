import React from 'react';
import { getNutInfo } from './functions.js'

import { Foods } from "../imports/collections.js"

import { Async } from 'react-select';

import {getFoodInfo} from './functions.js'
import { nutcodes, nutInfo } from '../imports/nut-info.js'

import NumberField, {PriceField} from './components/number-field'

export default class CustomFood extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            foodOldName:"",
            foodId: "",
            nutcodes,
            nutrients: nutcodes.map(n=>({"id":n,"name":nutInfo[n].long_name,"unit":nutInfo[n].unit})),
            nutInfo: nutInfo,
            foodNuts: nutcodes.reduce((ns,n)=>{
                ns[n]=0
                return ns
            },{}),
            foodName:"",
            foodPrice:["0"],
            // custom: true,
            user: ""
        }
    }
    handleNutChange(code,value) {
        let newFoodNuts = this.state.foodNuts;
        newFoodNuts[code]=parseFloat(value)
        this.setState({foodNuts:newFoodNuts})
    }

    saveFoodAs() {
        const thisComp = this;
        let foodName = this.state.foodName;
        if (foodName === "") alert("Name field is empty")
        Foods.insert({
            name: foodName,
            user: Meteor.user().username,
            price: parseFloat(thisComp.state.foodPrice[0]),
            nutrients: thisComp.state.foodNuts
        },(err,_id)=> {
          if (!err) thisComp.setState({foodOldName:foodName, foodId:_id, user: Meteor.user().username})
          else {
              if (err.error === 409) {
                  console.log(err)
                  alert("You already have a food with that name")
              }
          }
        })
    }

    saveFood() {
        const thisComp = this;
        let foodName = this.state.foodName;
        Foods.upsert({_id: thisComp.state.foodId},
            {$set: {
              name: thisComp.state.foodName,
              user: Meteor.user().username,
              price: parseFloat(thisComp.state.foodPrice[0]),
              nutrients: thisComp.state.foodNuts
          }},(err,num)=> {
            if (!err) thisComp.setState({foodOldName:foodName})
          })
    }
    removeFood() {
        Foods.remove({_id: this.state.foodId})
    }
    chooseFood(food) {
        let foodFullName = food.label;
        food = food.value;
        let foodName = food.name;
        const thisComp = this;
        let foodId = food.id;
        console.log("loading",foodId,food)
        this.setState({foodOldName:foodFullName})
        // newIngPref[foodId] = {"price": 0.0,"custom":custom}
        // this.setState({ingPref: newIngPref})
        // this.updatePrefs()
        let price = food.price;
        let nutrients = food.nutrients;
        // console.log(nutrients);
        this.setState({foodNuts:nutrients, foodId, foodPrice:[price],foodName, user:food.user})
      }

    render() {
        const thisComp = this;
        // console.log(Meteor.user());
        return ( <div className="container new-food">
            <div className="row" style={{textAlign:"center"}}>
                <h3>Custom food: {this.state.foodOldName} </h3>
            </div>
            <div className="row">
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
            </div>
            <div className="row" style={{marginTop:"10px"}}>
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
            </div>
            <div className="row" style={{marginBottom:"10px"}}>
            <div className="col-md-1" style={{padding:"0px"}}>
                    <b>Price</b>
                </div>
                <div className="col-md-11">
                    <PriceField thisComp={thisComp} style={{width:"80px", marginLeft:"10px"}} className="food-price"
                      onChange={e=>thisComp.setState({foodPrice: [e.target.value]})}
                      setValue={(value, onValueSet)=>{thisComp.setState({foodPrice: [value]},onValueSet)}}
                      onPressedEnter={()=>{
                          if (Meteor.user() && this.state.user === Meteor.user().username)
                              this.saveFood()
                          else
                              this.saveFoodAs()
                      }}
                      index={0}
                      name={"foodPrice"}
                      />
                </div>
            </div>
            <div className="row">
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
            </div>
        </div>)
    }
}


// const getFoodOptions = (input, callback) => {
//     console.log(input)
//     Meteor.call("getFoodNamesData",input,(err,res)=>{
//       if (err) console.log(err)
//       let foodsUSDA = res.USDA ? res.USDA : [];
//       let foodsCustom = res.customFoods;
//       // console.log("foodnames",foods)
//       callback(null,
//         {options:
//           foodsUSDA.map(x=>({value: {id:x.id,name:x.name,custom:false}, label: x.name+" (USDA)", user: "USDA"}))
//             .concat(foodsCustom.map(x=>({value: {id:x._id,name:x.name,custom:true,price:x.price,nutrients:x.nutrients, user: x.user}, label: x.name+" (USDA)"})))
//         })
//     })

//   };

// const getFoodOptions = (input, callback) => {
//     console.log(input)
//     Meteor.call("getFoodNamesData",input,(err,res)=>{
//       if (err) console.log(err)
//       let foodsCustom = res;
//       // console.log("foodnames",foods)
//       callback(foodsCustom.map(x=>({value: {id:x._id,name:x.name,nutrients:x.nutrients,price:x.price, user: x.user}, label: x.name+" ("+x.user+")"})))
//     })

//   };

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

//   const getFoodOptions = (input, callback) => {
//     console.log(input)
//     Meteor.call("getFoodNamesData",input,(err,res)=>{
//       if (err) console.log(err)
//       let foodsCustom = res;
//       // console.log("foodnames",foods)
//       callback(null,
//         {options:
//           foodsCustom.map(x=>({value: {id:x._id,name:x.name,nutrients:x.nutrients,price:x.price, user: x.user}, label: x.name+" ("+x.user+")"}))
//         })
//     })

//   };
