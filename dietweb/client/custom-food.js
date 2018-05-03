import React from 'react';
import { getNutInfo } from './functions.js'

import { Foods } from "../imports/collections.js"


export default class CustomFood extends React.Component {
    constructor(props) {        
        super(props);
        let nutcodes = [["208","kcal"],["204","g"],["606","g"],["205","g"],["269","g"],["291","g"],["203","g"],["301","mg"],["303","mg"],["304","mg"],["305","mg"],["306","mg"],["307","mg"],["309","mg"],["312","mg"],["315","mg"],["317","µg"],["401","mg"],["404","mg"],["405","mg"],["406","mg"],["410","mg"],["415","mg"],["417","µg"],["421","mg"],["418","µg"],["320","µg"],["323","mg"],["328","µg"],["430","µg"],["619","g"],["618","g"]];
        nutcodes = nutcodes.sort((a,b)=>parseInt(a[0])-parseInt(b[0]))        
        this.state = {
            nutcodes,
            foodNuts: nutcodes.map(x=>x[0]).reduce((ns,n)=>{
                ns[n]=0
                return ns
            },{}),
            foodName:"",
            foodPrice:0
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
    saveFood() {
        const thisComp = this;
        Foods.insert({
            name: thisComp.state.foodName,
            price: parseFloat(thisComp.state.foodPrice),
            nutrients: thisComp.state.foodNuts
        })
    }
    chooseFood(food) {
        let foodId = food.value[0]
        let custom = food.value[1]
        console.log("loading",foodId)
        // newIngPref[foodId] = {"price": 0.0,"custom":custom}
        // this.setState({ingPref: newIngPref})
        // this.updatePrefs()
        if (custom) {
            let price = food.value[2];
            let nutrients = food.value[3];
            this.setState({foodPrice:price,foodName:})
        }
      }
    render() { 
        const thisComp = this;
        return ( <div className="container new-food">
            <div className="row" style={{textAlign:"center"}}>
                <h3>Custom food</h3>
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
                        <th>
                            <button type="button" id="calculate-diet-button" className="btn btn-primary toolbar-button" 
                                onClick={this.saveFood.bind(this)}>
                                Save Food
                            </button>                            
                        </th>
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
          foodsUSDA.map(x=>({value: [x.id,false], label: x.name}))
            .concat(foodsCustom.map(x=>({value: [x._id,true,x], label: x.name})))
        })
    })
  
  };