import React from 'react';
import ReactDOM from 'react-dom';


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state={dietVec: [], feasible: true}
  }
  CalculateDiet() {
    let thisComp = this;
    Meteor.call('calculate_diet', (err, res) => {
      if (err) {
        console.log(err);
        if (err.error === 666) thisComp.setState({feasible: false});
      } else {
        console.log(res);
        thisComp.setState({dietVec: res, feasiable: true})
      }
    })
  }
  renderDiet() {
    if (this.state.feasible) {
      return this.state.dietVec.map((x,i)=>{
        return (<li key={i} className="list-group-item">{x.name}: {parseFloat(x.amount)*100} g</li>)
      })
    } else {
      return <div className="alert alert-danger" role="alert">
        <strong>Oh snap!</strong> No feasible primal solution!
      </div>
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
