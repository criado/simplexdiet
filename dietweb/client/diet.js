import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import {getFoodInfo, getNutInfo, solveDiet, getSolNuts} from './functions.js'

import { IngredientPreferences, NutrientPreferences } from "../imports/collections.js"

import { withTracker } from 'meteor/react-meteor-data';

class App extends React.Component {
  constructor(props) {
    super(props);

    let nutcodes = [["208","kcal"],["204","g"],["606","g"],["205","g"],["269","g"],["291","g"],["203","g"],["301","mg"],["303","mg"],["304","mg"],["305","mg"],["306","mg"],["307","mg"],["309","mg"],["312","mg"],["315","mg"],["317","µg"],["401","mg"],["404","mg"],["405","mg"],["406","mg"],["410","mg"],["415","mg"],["417","µg"],["421","mg"],["418","µg"],["320","µg"],["323","mg"],["328","µg"],["430","µg"],["619","g"],["618","g"]];
    nutcodes = nutcodes.sort((a,b)=>parseInt(a[0])-parseInt(b[0]))
    this.state={dietVec: [],
      feasible: true,
      price:0,
      ingPref: props.ingPref,
      foods:[],
      nutcodes,
      nutrients:[],
      nutInfo: {},
      nutPref: props.nutPref
    }
  }
  componentDidMount() {
    if (!this.props.prefLoading)
      this.CalculateDiet()
  }
  componentDidUpdate(prevProps) {
    if (prevProps.prefLoading && !this.props.prefLoading )
      this.CalculateDiet()
  }
  CalculateDiet() {
    const thisComp = this;
    this.updatePrefs()
    
    const parseLimit = (lim) => {
      if (typeof lim === "number" && !isNaN(lim)) return lim
      else return null
    }

    this.setState({ingPref: thisComp.props.ingPref,nutPref:thisComp.props.nutPref})
    
    let ingPref = this.props.ingPref
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

    getFoodInfo(ingPref,nutcodes).then(res=>{
      // console.log("getFoods",res);
      let foodNuts = res.foodNuts;
      let foodInfo = res.foodInfo;
      let solution = solveDiet(foodNuts,nutFoods,ingPref,nutPref, "price");
      let {foundNuts, nutTots} = getSolNuts(solution,nutFoods,ingPref,nutcodes,foodNuts)
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
        price:solution.result})
      // console.log(solution);
    })
    getNutInfo(nutcodes).then(res=>{
      // console.log("getNuts",res);
      thisComp.setState({
        nutrients: res.nutNames.map(x=>({"name":x[1]})),
        nutInfo: res.nutInfo
      })
    })
  }
  changeLims(foodId,newLim) {
    const thisComp = this;
    console.log(newLim)
    let newIngPref = thisComp.state.ingPref;
    newIngPref[foodId] = { ...thisComp.state.ingPref[foodId], ...newLim}
    this.setState({
      ingPref: newIngPref
    })
  }
  renderDiet() {
    if (this.state.feasible) {
      return <DietTable 
          diet={this.state.dietVec} 
          ings={this.state.ingPref} 
          nutList={this.state.nutrients} 
          nutInfo={this.state.nutInfo} 
          changeLims={this.changeLims.bind(this)}/>
    } else {
      // return (<div className="alert alert-danger" role="alert">
      //   <strong>Oh snap!</strong> No feasible primal solution!
      // </div>)
    }
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
  render() {
    let thisComp = this;
    return (<div className="container">
    <div className="row">
      <button type="button" id="calculate-diet-button" className="btn btn-primary toolbar-button" onClick={this.CalculateDiet.bind(this)}>Calculate diet</button>
      {/* <button type="button" id="calculate-diet-button" className="btn btn-primary toolbar-button" onClick={this.updatePrefs.bind(this)}>Update preferences</button> */}
        <br/>
    </div>
    <div className="row">
      {this.renderDiet()}
    </div>
    <hr/>
    </div>)
  }
}

App.propTypes = {
  ingPref: PropTypes.object.isRequired,
  nutPref: PropTypes.object.isRequired,
};

export default withTracker(props => {

  const handle1 = Meteor.subscribe('ingPrefs');
  const handle2 = Meteor.subscribe('nutPrefs');

  let ingPrefObj = IngredientPreferences.findOne({_id:Meteor.userId()});
  let defaultIngPref = {"11463":{"price":0.155},"11675":{"max":4,"price":0.08},"12036":{"price":0.59},"12166":{"price":0.8},"12220":{"price":0.783},"19165":{"price":1.129},"20445":{"max":1.6,"price":0.045},"45006968":{"price":0.0001},"01211":{"max":5,"price":0.04},"08120":{"max":0.9,"price":0.075},"08084":{"price":0.275},"01129":{"min":0.5,"max":1.2,"price":0.6},"04053":{"price":0.411},"09040":{"max":3,"price":0.1},"04589":{"max":0.01,"price":0.038},"09037":{"price":0.56}}

  let nutPrefObj = NutrientPreferences.findOne({_id:Meteor.userId()});
  let defaultNutPref = {"203":{"min":70,"max":96},"204":{"min":66.66666666666667,"max":78},"205":{"min":325,"max":380.25},"208":{"min":2000,"max":2340},"269":{"max":150},"291":{"min":23,"max":46},"301":{"min":1000,"max":2500},"303":{"min":14.4,"max":45},"304":{"min":400},"305":{"min":700,"max":4000},"306":{"min":4700},"307":{"min":1500,"max":2300},"309":{"min":16.5,"max":40},"312":{"min":0.9,"max":10},"315":{"min":2.3,"max":11},"317":{"min":55,"max":400},"320":{"min":900,"max":1350},"323":{"min":15,"max":1000},"328":{"min":5,"max":100},"401":{"min":90,"max":2000},"404":{"min":1.2},"405":{"min":1.3},"406":{"min":16,"max":35},"410":{"min":5},"415":{"min":1.3,"max":100},"417":{"min":400,"max":1000},"418":{"min":2.4},"421":{"min":550,"max":3500},"430":{"min":120},"606":{"max":25},"618":{"min":16.83,"max":17.17},"619":{"min":1.584,"max":1.616}}

  let loading = !handle1.ready() || !handle2.ready()
  let resultsExist = !loading && !!ingPrefObj && !!nutPrefObj

  console.log(resultsExist,ingPrefObj)

  return {
    currentUser:Meteor.user(),
    prefLoading: loading,
    ingPref: resultsExist? ingPrefObj.ingPref: defaultIngPref,
    nutPref: resultsExist? nutPrefObj.nutPref: defaultNutPref,
  };
})(App);

class DietTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mins: [],
      maxs: []
    }
  }
  componentDidUpdate(prevProps){
    const thisComp = this;
    if (prevProps !== this.props) {
      this.setState({
        mins: thisComp.props.diet.filter(x=>(x.id in thisComp.props.ings)).map(x=>(thisComp.props.ings[x.id].min*100).toFixed(0)),
        maxs: thisComp.props.diet.filter(x=>(x.id in thisComp.props.ings)).map(x=>(thisComp.props.ings[x.id].max*100).toFixed(0))
      })
    }
  }
  handleLimChange(type,i,val) {
    let lims = this.state[type];
    lims[i]=val;
    console.log(val)
    this.setState({type:lims})
  }
  render() {
    const thisComp = this;
    return (<table className="table table-hover table-dark">
    <thead>
      <tr>
        <th scope="col">Food</th>
        {this.props.nutList.map((x,i)=>{
          return <th key={i} title={x.name} scope="col">{x.name.slice(0,3)}</th>
        })}
      </tr>
    </thead>
      <tbody>
      {this.props.diet.map((x,i)=>{
        if (x.id in thisComp.props.ings)
        {
          return (<tr key={i}>
              <td style={{"minWidth":"200px"}}>
                <input value={thisComp.state.mins[i]} step="10" style={{width:"50px",marginRight:"10px"}} type="number"
                  onKeyPress={e=>{
                      if (e.key == 'Enter') thisComp.props.changeLims(x.id,{"min":parseFloat(e.target.value)/100})
                    }}
                  onChange={e=>thisComp.handleLimChange("mins",i,e.target.value)}
                />
                <span style={{marginRight:"15px",display:"inline-block",width:"40px",overflow:"hidden",textAlign:"right"}}>
                  {(parseFloat(x.amount)*100).toFixed(0)}g
                </span>
                <input value={thisComp.state.maxs[i]} step="10" style={{width:"50px",marginRight:"10px"}} type="number"
                  onKeyPress={e=>{
                      if (e.key == 'Enter') thisComp.props.changeLims(x.id,{"max":parseFloat(e.target.value)/100})
                    }}
                    onChange={e=>thisComp.handleLimChange("maxs",i,e.target.value)}
                  />
                <span title={x.name}>{x.name.slice(0,7)}</span>
              </td>
              {x.nutAmounts.map((n,j)=>(
                <td title={thisComp.props.nutList[j].name} key={j}>{n.toFixed(0) }</td>
              ))}
            </tr>)
        } else {
         return ( <tr key={i}>
              <td style={{"minWidth":"200px"}}>
              <span style={{marginLeft:"60px",marginRight:"75px",display:"inline-block",width:"40px",overflow:"hidden",textAlign:"right"}}>
                {(parseFloat(x.amount)*100).toFixed(0)}g
              </span>
              {thisComp.props.nutInfo[x.id].long_name}
              </td>
              {x.nutAmounts.map((n,j)=>(
                <td title={thisComp.props.nutList[j].name} key={j}>{n.toFixed(0) }</td>
              ))}
          </tr>)
        }
      })}
      </tbody>
      </table>)
  }
}


const concat = (x,y) =>
x.concat(y)
const flatMap = (f,xs) =>
xs.map(f).reduce(concat, [])

// return this.state.dietVec.map((x,i)=>{
//   return (<li key={i} className="list-group-item">{x.name}: {parseFloat(x.amount)*100} g</li>)
// })
