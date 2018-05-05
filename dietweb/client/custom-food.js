import React from 'react';
import { getNutInfo } from './functions.js'

import { Foods } from "../imports/collections.js"

import { Async } from 'react-select';

import {getFoodInfo} from './functions.js'

export default class CustomFood extends React.Component {
    constructor(props) {
        super(props);
        let nutcodes = [["208","kcal"],["204","g"],["606","g"],["203","g"],["205","g"],["269","g"],["291","g"],["601","mg"],["301","mg"],["312","mg"],["303","mg"],["304","mg"],["315","mg"],["305","mg"],["306","mg"],["307","mg"],["317","µg"],["309","mg"],["421","mg"],["320","µg"],["404","mg"],["405","mg"],["406","mg"],["410","mg"],["415","mg"],["417","µg"],["418","µg"],["401","mg"],["328","µg"],["323","mg"],["430","µg"],["619","g"],["618","g"]];
        nutcodes = nutcodes.sort((a,b)=>parseInt(a[0])-parseInt(b[0]))
        this.state = {
            foodOldName:"",
            foodId: "",
            nutcodes,
            foodNuts: nutcodes.map(x=>x[0]).reduce((ns,n)=>{
                ns[n]=0
                return ns
            },{}),
            foodName:"",
            foodPrice:0,
            custom: true
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
        }
    handleNutChange(code,value) {
        let newFoodNuts = this.state.foodNuts;
        newFoodNuts[code]=parseFloat(value)
        this.setState({foodNuts:newFoodNuts})
    }
    saveFoodAs() {
        const thisComp = this;
        Foods.insert({
            name: thisComp.state.foodName,
            user: Meteor.userId(),
            price: parseFloat(thisComp.state.foodPrice),
            nutrients: thisComp.state.foodNuts
        })
    }
    saveFood() {
        const thisComp = this;
        let foodName = this.state.foodName;
        Foods.upsert({_id: thisComp.state.foodId},
            {$set: {
              name: thisComp.state.foodName,
              user: Meteor.userId(),
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
        let foodName = food.label;
        food = food.value;
        const thisComp = this;
        let foodId = food.id;
        let custom = food.custom
        console.log("loading",foodId,food)
        this.setState({foodOldName:foodName})
        // newIngPref[foodId] = {"price": 0.0,"custom":custom}
        // this.setState({ingPref: newIngPref})
        // this.updatePrefs()
        if (custom) {
            let price = food.price;
            let nutrients = food.nutrients;
            // console.log(nutrients);
            this.setState({foodNuts:nutrients, foodId, foodPrice:price,foodName,custom: true})
        } else {
            let price = 0;
            let ingPref = {};
            ingPref[foodId] = {};
            getFoodInfo(ingPref,thisComp.state.nutcodes).then(res=>{
              // console.log(res.foodNuts);
              thisComp.setState({foodNuts:res.foodNuts[foodId], foodId, foodPrice:0,foodName,custom: false})
            })
        }
      }
    render() {
        const thisComp = this;
        return ( <div className="container new-food">
            <div className="row" style={{textAlign:"center"}}>
                <h3>Custom food: {this.state.foodOldName}</h3>
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
                        {this.state.custom ? <th className="food-edit-button">
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
                        {this.state.foodId!=="" && this.state.custom ? <th className="food-edit-button">
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
          foodsUSDA.map(x=>({value: {id,custom:false}, label: x.name, user: "USDA"}))
            .concat(foodsCustom.map(x=>({value: {id:x._id,custom:true,price:x.price,nutrients:x.nutrients, user: x.user}, label: x.name})))
        })
    })

  };
