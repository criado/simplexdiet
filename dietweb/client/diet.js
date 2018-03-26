import React from 'react';
import ReactDOM from 'react-dom';


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state={dietVec: [],
      feasible: true,
      ingredients: [],
      foods:[],
      mins:[],
      maxs:[],
      nutrients: []}
  }
  componentDidMount() {
    let thisComp = this;
    Meteor.call('getFoodNamesData', (err,res)=>{
      console.log(res);
      thisComp.setState({foods: res.map(x=>({value:x.name,label:x.name, code:x._id}))})
    })
    Meteor.call('getProfile', (err, res) => {
      thisComp.setState({nutrients: res, mins: res.map(x=>x.min), maxs: res.map(x=>x.max)})
      console.log(res);
      Meteor.call('getPreferences', (err, res) => {
        console.log(res);
        thisComp.setState({ingredients: res, mins: res.map(x=>x.min), maxs: res.map(x=>x.max)})
        thisComp.CalculateDiet()
      });
    })
  }
  CalculateDiet() {
    let thisComp = this;
    Meteor.call('calculate_diet', (err, res) => {
      if (err) {
        console.log(err);
        if (err.error === 666) thisComp.setState({feasible: false});
      } else {
        console.log(res);
        res = res.filter(x=>x.name.length>0)
        ings = thisComp.state.ingredients;
        nuts = thisComp.state.nutrients.map(x=>x.longName);
        console.log(ings);
        nutTotals = []
        for (var i = 0; i < nuts.length; i++) {
          nutTotals[i]=0
        }
        for (var i = 0; i < res.length; i++) {
          res[i].nutAmounts = []
          for (var j = 0; j < nuts.length; j++) {
            nut = nuts[j]
            // console.log(i,nut);
            // console.log(ings[i].food);
            nutObj = ings[i].food.nutrients.filter(x=>x.name===nut)[0]
            res[i].nutAmounts[j] = res[i].amount * nutObj.value;
            nutTotals[j] += res[i].nutAmounts[j]
            // console.log(nutTotals[j]);
            }
          }
        }
        for (var i = 0; i < res.length; i++) {
          for (var j = 0; j < nuts.length; j++) {
            res[i].nutAmounts[j] = res[i].nutAmounts[j]/nutTotals[j];
            }
          }
      thisComp.setState({dietVec: res, feasiable: true})
    })

  }
  renderDiet() {
    if (this.state.feasible) {
      return <DietTable diet={this.state.dietVec} ings={this.state.ingredients} nuts={this.state.nutrients}/>
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
        <ul className="list-group">
          {this.renderDiet()}
        </ul>
    </div>
    <hr/>
    </div>)
  }
}

class DietTable extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
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
            <td>{x.name.slice(0,7)}: {(parseFloat(x.amount)*100).toFixed(0) } g </td>
            {x.nutAmounts.map((n,j)=>(
              <td key={j}>{(parseFloat(n)*100).toFixed(0) }</td>
            ))}
          </tr>)
      })}
      </tbody>
      </table>)
  }
}

// return this.state.dietVec.map((x,i)=>{
//   return (<li key={i} className="list-group-item">{x.name}: {parseFloat(x.amount)*100} g</li>)
// })
