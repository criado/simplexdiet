import React from 'react';
import ReactDOM from 'react-dom';
import solver from 'javascript-lp-solver';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    let nutcodes = [["208","kcal"],["204","g"],["606","g"],["601","mg"],["205","g"],["269","g"],["291","g"],["203","g"],["301","mg"],["303","mg"],["304","mg"],["305","mg"],["306","mg"],["307","mg"],["309","mg"],["312","mg"],["315","mg"],["317","µg"],["401","mg"],["404","mg"],["405","mg"],["406","mg"],["410","mg"],["415","mg"],["417","µg"],["421","mg"],["418","µg"],["320","µg"],["323","mg"],["328","µg"],["430","µg"],["619","g"],["618","g"]];
    nutcodes = nutcodes.sort((a,b)=>parseInt(a[0])-parseInt(b[0]))
    this.state={dietVec: [],
      feasible: true,
      price:0,
      ingPref: {"11463":{"price":0.155},"11675":{"max":4,"price":0.08},"12036":{"price":0.59},"12166":{"price":0.8},"12220":{"price":0.783},"19165":{"price":1.129},"20445":{"max":1.6,"price":0.045},"45006968":{"price":0.0001},"01211":{"max":5,"price":0.04},"08120":{"max":0.9,"price":0.075},"08084":{"price":0.275},"01129":{"min":0.5,"max":1.2,"price":0.6},"04053":{"price":0.411},"09040":{"max":3,"price":0.1},"04589":{"max":0.01,"price":0.038},"09037":{"price":0.56}},
      foods:[],
      nutcodes,
      nutrients:[],
      nutPref: {"203":{"min":70,"max":96},"204":{"min":66.66666666666667,"max":78},"205":{"min":325,"max":380.25},"208":{"min":2000,"max":2340},"269":{"max":150},"291":{"min":23,"max":46},"301":{"min":1000,"max":2500},"303":{"min":14.4,"max":45},"304":{"min":400},"305":{"min":700,"max":4000},"306":{"min":4700},"307":{"min":1500,"max":2300},"309":{"min":16.5,"max":40},"312":{"min":0.9,"max":10},"315":{"min":2.3,"max":11},"317":{"min":55,"max":400},"320":{"min":900,"max":1350},"323":{"min":15,"max":1000},"328":{"min":5,"max":100},"401":{"min":90,"max":2000},"404":{"min":1.2},"405":{"min":1.3},"406":{"min":16,"max":35},"410":{"min":5},"415":{"min":1.3,"max":100},"417":{"min":400,"max":1000},"418":{"min":2.4},"421":{"min":550,"max":3500},"430":{"min":120},"606":{"max":25},"618":{"min":16.83,"max":17.17},"619":{"min":1.584,"max":1.616}}}
  }
  componentDidMount() {
    this.CalculateDiet()
  }
  CalculateDiet() {
    const thisComp = this;
    
    const parseLimit = (lim) => {
      if (typeof lim === "number" && !isNaN(lim)) return lim
      else return null
    }
    let ingPref = this.state.ingPref
    let nutPref = this.state.nutPref
    let nutcodes = this.state.nutcodes
    getFoodInfo(ingPref,nutcodes).then(res=>{
      // console.log("getFoods",res);
      let foodNuts = res.foodNuts;
      let foodInfo = res.foodInfo;
      let solution = solveDiet(foodNuts, ingPref,nutPref, "price");
      let {foundNuts, nutTots} = getSolNuts(solution,ingPref,nutcodes,foodNuts)
      // console.log(foundNuts)
      let dietVec = [];
      for (let key in solution) {
        if (key !== "feasible" && key !== "bounded" && key!=="result") {
          // console.log(ingPref);
          dietVec.push({
            "name":foodInfo[key].name,
            "id":foodInfo[key].id,
            "amount":solution[key],
            "min":parseLimit(ingPref[key].min),
            "max":parseLimit(ingPref[key].max),
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
      thisComp.setState({nutrients: res.nutNames.map(x=>({"name":x[1]}))})
    })
  }
  changeLims(foodId,newLim) {
    const thisComp = this;
    console.log({ ...thisComp.state.ingPref[foodId], ...newLim})
    this.setState({
      ingPref: { ...thisComp.state.ingPref, foodId: { ...thisComp.state.ingPref[foodId], ...newLim}}
    })
  }
  renderDiet() {
    if (this.state.feasible) {
      return <DietTable 
          diet={this.state.dietVec} 
          ings={this.state.ingredients} 
          nuts={this.state.nutrients} 
          changeLims={this.changeLims.bind(this)}/>
    } else {
      return (<div className="alert alert-danger" role="alert">
        <strong>Oh snap!</strong> No feasible primal solution!
      </div>)
    }
  }
  render() {
    let thisComp = this;
    return (<div className="container">
    <div className="row">
      <button type="button" id="calculate-diet-button" className="btn btn-primary toolbar-button" onClick={this.CalculateDiet.bind(this)}>Calculate diet</button>
        <br/>
    </div>
    <div className="row">
      {this.renderDiet()}
    </div>
    <hr/>
    </div>)
  }
}

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
    if (prevProps !== thisComp.props) {
      this.setState({
        mins: thisComp.props.diet.map(x=>x.min*100),
        maxs: thisComp.props.diet.map(x=>x.max*100)
      })
    }
  }
  handleLimChange(type,i,e) {
    let lims = this.state[type];
    lims[i]=e.target.value;
    this.setState({type:lims})
  }
  render() {
    const thisComp = this;
    return (<table className="table table-hover table-dark">
    <thead>
      <tr>
        <th scope="col">Food</th>
        {this.props.nuts.map((x,i)=>{
          return <th key={i} scope="col">{x.name.slice(0,3)}</th>
        })}
      </tr>
    </thead>
      <tbody>
      {this.props.diet.map((x,i)=>{
        return (<tr key={i}>
            <td style={{"minWidth":"200px"}}>
              <input value={thisComp.state.mins[i]} step="10" style={{width:"50px",marginRight:"10px"}} type="number"
                onKeyPress={e=>{
                    if (e.keyCode === 13) thisComp.props.changeLims(x.id,{"min":parseFloat(e.target.value)})
                  }}
                onChange={e=>thisComp.handleLimChange.call(thisComp,"mins",i,e)}
              />
              <span style={{marginRight:"15px",display:"inline-block",width:"40px",overflow:"hidden",textAlign:"right"}}>{(parseFloat(x.amount)*100).toFixed(0)}g</span>
              <input value={thisComp.state.maxs[i]} step="10" style={{width:"50px",marginRight:"10px"}} type="number"
                onKeyPress={e=>{
                    if (e.keyCode === 13) thisComp.props.changeLims(x.id,{"max":parseFloat(e.target.value)})
                  }}
                  onChange={e=>thisComp.handleLimChange.call(thisComp,"max",i,e)}
                />
              {x.name.slice(0,7)}     
            </td>
            {x.nutAmounts.map((n,j)=>(
              <td key={j}>{n.toFixed(0) }</td>
            ))}
          </tr>)
      })}
      </tbody>
      </table>)
  }
}

async function getFoodInfo(ingPref, nutcodes) {
  const makeUrlStr = (foods) => "ndbno="+foods.join("&ndbno=")+"&type=f&format=json&api_key=HDnNFBlfLWMeNNVU8zIavWrL8VKGIt7GkWgORQaC";

  let foodsIds=Object.keys(ingPref);
  // let foodPrices=ingPref.map(f=>f.price);

  const response = await fetch("https://api.nal.usda.gov/ndb/V2/reports?"+makeUrlStr(foodsIds));
  let data = await response.json()
  let foods = data.foods.map(x=>x.food).filter(x=>x);

  let foodNames = foods.reduce((fns,f)=>{
    fns[f.desc.ndbno]=f.desc.name
    return fns
  },{})

  let foodInfo = foods
      .map(f=>{
        let nutObj = f.nutrients.reduce((ns,n)=>{
          if (nutcodes.map(x=>x[0]).indexOf(n.nutrient_id.toString()) !== -1) {
            ns[n.nutrient_id.toString()]=parseFloat(n.value)
            let index = nutcodes.map(x=>x[0]).indexOf(n.nutrient_id.toString());
            if (nutcodes[index][1]!==n.unit) throw Error("Units for nutrient in USDA database doesn't match expected unit")
          }
          return ns
        },{});
        for (let i=0; i<nutcodes.length; i++) {
			    if (!(nutcodes[i][0] in nutObj)) nutObj[nutcodes[i][0]]=0;
        }
        nutObj[f.desc.ndbno]=1;
        nutObj["price"] = ingPref[f.desc.ndbno].price
        return {
          "name":f.desc.name,
          "id":f.desc.ndbno,
          "nutrients":nutObj,
          "price":ingPref[f.desc.ndbno].price
          }
        }
      );
    
    let foodNuts = 
      foodInfo
      .reduce((fs,f,i)=>{
          fs[f.id]=f.nutrients;
          return fs;
        },{});

  foodInfo = foodInfo
    .reduce((fs,f,i)=>{
      fs[f.id]=f;
      return fs;
    },{});
  
  return {foodNuts,foodInfo, foodNames};
}

async function getNutInfo(nutcodes) {
  let nutInfo = await fetch("https://api.nal.usda.gov/ndb/list?format=json&lt=n&max=1000&api_key=HDnNFBlfLWMeNNVU8zIavWrL8VKGIt7GkWgORQaC")
    .then(res=>res.json())
    .then(d=>(d.list.item.reduce((ns,n)=>{
            if (nutcodes.map(x=>x[0]).indexOf(n.id) !== -1) {
              let index = nutcodes.map(x=>x[0]).indexOf(n.id);
              ns[n.id]={"unit": nutcodes[index][1], "long_name":n.name}
            }
          return ns
        },{})))

  let nutNames = [];
  for (let key in nutInfo) {nutNames.push([key,nutInfo[key].long_name])}
  nutNames.sort((a,b)=>parseInt(a[1])-parseInt(b[1]))
  
  return {nutInfo, nutNames}
}

function solveDiet(foodNuts, ingConst,nutConst, objective) {
    let nutFoods = {};
    for (let key in nutConst) {
      let obj = {}
      for (let key2 in nutConst) {
        if (key2!==key) obj[key2]=0
        else obj[key2] = 1
      }
      obj["price"]=1e6;
      nutFoods[key] = obj
    }
    for (let key in nutConst) {
      let obj = {}
      for (let key2 in nutConst) {
        if (key2!==key) obj[key2]=0
        else obj[key2] = -1
      }
      obj["price"]=1e6;
      nutFoods["anti-"+key] = obj
    }
    let ingConstProc = {};
    for (let key in ingConst) {
      let obj = ingConst[key];
      let newObj = {}
      if (typeof obj.max !== "undefined") ingConstProc.max = obj.max
      if (typeof obj.min !== "undefined") ingConstProc.min = obj.min
      if (typeof obj.min !== "undefined" || typeof obj.max !== "undefined") ingConstProc[key] = newObj;
    }
    let model = {
      "optimize": objective,
      "opType": "min",
      "constraints": {...nutConst, ...ingConstProc},
      "variables": {...foodNuts, ...nutFoods}
    }
    // console.log(model)
    return solver.Solve(model)
}

function getSolNuts(solution,ingPref,nutcodes,foodNuts) {
  const parseSolution = sol => {
    if (typeof sol === "undefined") sol = 0;
    return sol
  };
  
  let foundNuts = [];
  let foodIds = []
  for (let key in ingPref) {
    let netNuts = [];
    for (let i=0; i<nutcodes.length; i++) {
      netNuts.push(foodNuts[key][nutcodes[i][0]]*parseSolution(solution[key]))
    }
    foundNuts.push(netNuts)
    foodIds.push(key)
  }
  // console.log("foundNuts",foundNuts)
    let nutTots = []
    for (let i=0; i<nutcodes.length; i++) {
      nutTots.push(foundNuts.map(x=>x[i]).reduce((a,b)=>a+b))
    }

    foundNuts = foundNuts
      .map(f=>f.map((n,i)=>100*n/nutTots[i]))
      .reduce((fs,f,i)=>{
        fs[foodIds[i]] = f;
        return fs
      },{})
  return {foundNuts,nutTots}
}

const concat = (x,y) =>
x.concat(y)
const flatMap = (f,xs) =>
xs.map(f).reduce(concat, [])

// return this.state.dietVec.map((x,i)=>{
//   return (<li key={i} className="list-group-item">{x.name}: {parseFloat(x.amount)*100} g</li>)
// })
