import React from 'react';
import { getNutInfo } from './functions.js'

import { Foods } from "../imports/collections.js"

import { Async } from 'react-select';

import {getFoodInfo} from './functions.js'
import { nutcodes, nutInfo } from './nut-info.js'

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
            foodPrice:0,
            custom: true,
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
        Foods.insert({
            name: foodName,
            user: Meteor.user().username,
            price: parseFloat(thisComp.state.foodPrice),
            nutrients: thisComp.state.foodNuts
        },(err,_id)=> {
          if (!err) thisComp.setState({foodOldName:foodName, foodId:_id, user: Meteor.user().username})
        })
    }
    saveFood() {
        const thisComp = this;
        let foodName = this.state.foodName;
        Foods.upsert({_id: thisComp.state.foodId},
            {$set: {
              name: thisComp.state.foodName,
              user: Meteor.user().username,
              price: parseFloat(thisComp.state.foodPrice),
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
        let custom = food.custom
        console.log("loading",foodId,food)
        this.setState({foodOldName:foodFullName})
        // newIngPref[foodId] = {"price": 0.0,"custom":custom}
        // this.setState({ingPref: newIngPref})
        // this.updatePrefs()
        if (custom) {
            let price = food.price;
            let nutrients = food.nutrients;
            // console.log(nutrients);
            this.setState({foodNuts:nutrients, foodId, foodPrice:price,foodName,custom: true, user:food.user})
        } else {
            let price = 0;
            let ingPref = {};
            ingPref[foodId] = {};
            getFoodInfo(ingPref,thisComp.state.nutcodes).then(res=>{
              // console.log(res.foodNuts);
              thisComp.setState({foodNuts:res.foodNuts[foodId], foodId, foodPrice:0,foodName,custom: false, user:food.user})
            })
        }
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
                loadOptions={getFoodOptions}
                onChange={this.chooseFood.bind(this)}
            />
            </div>
            <div className="row">
            <table className="table table-hover table-dark">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th><input type="text" value={this.state.foodName} style={{width:"300px"}}
                            onChange={e=>thisComp.setState({foodName: e.target.value})}
                        /></th>
                        {Meteor.user() && this.state.user === Meteor.user().username ? <th className="food-edit-button">
                            <button type="button" id="save-food" className="btn btn-primary toolbar-button"
                                onClick={this.saveFood.bind(this)}>
                                Save Food
                            </button>
                        </th> : ""}
                        <th className="food-edit-button">
                            <button type="button" id="save-food-as" className="btn btn-primary toolbar-button"
                                onClick={this.saveFoodAs.bind(this)}>
                                Save Food As
                            </button>
                        </th>
                        {Meteor.user() && this.state.foodId!=="" && this.state.user === Meteor.user().username ? <th className="food-edit-button">
                            <button type="button" id="remove-food" className="btn btn-danger toolbar-button"
                                onClick={this.removeFood.bind(this)}>
                                Remove Food
                            </button>
                        </th>  : ""}
                    </tr>
                    <tr>
                        <th>Price</th>
                        <th><input type="number" value={this.state.foodPrice} style={{width:"80px"}}
                            onChange={e=>thisComp.setState({foodPrice: e.target.value})}
                        /></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            </div>
            <div className="row">
                <div className="col-md-6">
                <table className="table table-hover table-dark">
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
                <div className="col-md-6">
                <table className="table table-hover table-dark">
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


const getFoodOptions = (input, callback) => {
    console.log(input)
    Meteor.call("getFoodNamesData",input,(err,res)=>{
      if (err) console.log(err)
      let foodsUSDA = res.USDA ? res.USDA : [];
      let foodsCustom = res.customFoods;
      // console.log("foodnames",foods)
      callback(null,
        {options:
          foodsUSDA.map(x=>({value: {id:x.id,name:x.name,custom:false}, label: x.name+" (USDA)", user: "USDA"}))
            .concat(foodsCustom.map(x=>({value: {id:x._id,name:x.name,custom:true,price:x.price,nutrients:x.nutrients, user: x.user}, label: x.name+" (USDA)"})))
        })
    })

  };
