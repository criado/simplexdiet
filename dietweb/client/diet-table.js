import React from 'react';
import ReactDOM from 'react-dom';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6


export default class DietTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mins: [],
      maxs: [],
      prices: [],
      nutmins: [],
      nutmaxs: [],
      editingPrice: -1
    }
  }
  componentDidUpdate(prevProps){
    const thisComp = this;
    if (prevProps !== this.props) {
      this.setState({
        mins: thisComp.props.diet.filter(x=>(x.id in thisComp.props.ings)).map(x=>(thisComp.props.ings[x.id].min*100).toFixed(0)),
        maxs: thisComp.props.diet.filter(x=>(x.id in thisComp.props.ings)).map(x=>(thisComp.props.ings[x.id].max*100).toFixed(0)),
        prices: thisComp.props.diet.filter(x=>(x.id in thisComp.props.ings)).map(x=>(thisComp.props.ings[x.id].price)),
        nutmins: thisComp.props.nutList.map(x=>
          typeof thisComp.props.nutPref[x.id] !== "undefined" && typeof thisComp.props.nutPref[x.id].min !== "undefined" ? thisComp.props.nutPref[x.id].min.toFixed(0) : ""),
        nutmaxs: thisComp.props.nutList.map(x=>
          typeof thisComp.props.nutPref[x.id] !== "undefined" && typeof thisComp.props.nutPref[x.id].max !== "undefined" ? thisComp.props.nutPref[x.id].max.toFixed(0) : "")
      })
    }
  }
  // handleLimChange(type,i,val) {
  //   const thisComp = this;
  //   let lims = this.state[type];
  //   lims[i]=val;
  //   console.log(val)
  //   this.setState({type:lims})
  // }
  editFoodPrice(index) {
    if (this.state.editingPrice === index)
      this.setState({editingPrice:-1})
    else 
      this.setState({editingPrice:index})      
  }
  render() {
    const thisComp = this;
    return (<table className="table table-hover table-dark">
    <thead>
      <tr>
      <th scope="col">Food</th>
        {this.props.nutList.map((x,i)=>{
          return <th key={i} title={x.name} scope="col" className="nutName">{thisComp.props.nutInfo[x.id].short_name}</th>
        })}
      </tr>
      <tr>
      <td scope="col"> </td>
        {this.props.nutList.map((x,i)=>{
          return <td key={i} title={x.name} scope="col" style={{fontSize:"10px",maxWidth:"40px",padding:"5px"}}>
          <input className="nut-limits" value={thisComp.state.nutmins[i]} step="10" style={{maxWidth:"30px"}} type="number"
                onKeyPress={e=>{
                    if (e.key == 'Enter') thisComp.props.calculateDietIfNeeded()
                }}
                onChange={e=>{
                  let nutmins = thisComp.state.nutmins;
                  thisComp.setState({nutmins: [...nutmins.slice(0,i), e.target.value, ...nutmins.slice(i)]});
                  thisComp.props.changeNutLims(x.id,{"min":parseFloat(e.target.value)})
                }}
            />
            <br/>
            <span style={{maxWidth:"30px"}}>{typeof thisComp.props.nutTots[i] !== "undefined" ? thisComp.props.nutTots[i].toFixed(0).toString(): ""}<span style={{fontSize:"8px"}}>{x.unit}</span></span>
            <br/>
            <input className="nut-limits" value={thisComp.state.nutmaxs[i]} step="10" style={{maxWidth:"30px"}} type="number"
                onKeyPress={e=>{
                    if (e.key == 'Enter') thisComp.props.calculateDietIfNeeded()
                }}
                onChange={e=>{
                  let nutmaxs = thisComp.state.nutmaxs;
                  thisComp.setState({nutmaxs: [...nutmaxs.slice(0,i), e.target.value, ...nutmaxs.slice(i)]});
                  thisComp.props.changeNutLims(x.id,{"max":parseFloat(e.target.value)})
                }}
                />
            {/* <span title={x.name}>{x.name.split(",").slice(0,2).join(",").slice(0,17)}</span> */}
        </td>
        })}
      </tr>
    </thead>
      <tbody>
      {this.props.diet.sort((a,b)=>{
        if (a.id in thisComp.props.ings && b.id in thisComp.props.ings) return b.amount-a.amount
        else if (a.id in thisComp.props.ings && !(b.id in thisComp.props.ings)) return -1
        else if (b.id in thisComp.props.ings && !(a.id in thisComp.props.ings)) return 1
        else return b.amount-a.amount
      }).map((x,i)=>{
        if (x.id in thisComp.props.ings)
        {
          return (<tr key={i}>
              <td style={{"minWidth":"30px"}}>
                <a className="remove-ing" style={{marginRight:"10px",color:"red"}} onClick={()=>thisComp.props.removeIng(x.id)}>
                  <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </a>

                <input value={thisComp.state.mins[i]} step="10" style={{width:"45px",marginRight:"10px"}} type="number"
                  onKeyPress={e=>{
                      if (e.key == 'Enter') {
                        console.log("asdf2")
                        thisComp.props.calculateDietIfNeeded()
                      }
                    }}
                    onChange={e=>{
                      let mins = thisComp.state.mins;
                      thisComp.setState({mins: [...mins.slice(0,i), e.target.value, ...mins.slice(i)]});
                      thisComp.props.changeLims(x.id,{"min":parseFloat(e.target.value)/100})
                    }}
                />

                <span style={{marginRight:"15px",display:"inline-block",width:"30px",overflow:"hidden",textAlign:"right"}}>
                  {(parseFloat(x.amount)*100).toFixed(0)}g
                </span>

                <input value={thisComp.state.maxs[i]} step="10" style={{width:"45px",marginRight:"10px"}} type="number"
                  onKeyPress={e=>{
                      if (e.key == 'Enter') thisComp.props.calculateDietIfNeeded()
                    }}
                    onChange={e=>{
                      let maxs = thisComp.state.maxs;
                      thisComp.setState({maxs: [...maxs.slice(0,i), e.target.value, ...maxs.slice(i)]});
                      thisComp.props.changeLims(x.id,{"max":parseFloat(e.target.value)/100})
                    }}
                  />

                <span title={x.name} onClick={()=>{this.editFoodPrice(i)}} style={{cursor: "pointer"}}>{x.name.split(",").slice(0,2).join(",").slice(0,17)}</span>
                {/* <span className="glyphicon glyphicon-gbp" aria-hidden="true" onClick={()=>{this.editFoodPrice(i)}} style={{cursor: "pointer", float:"right"}}></span> */}
                <ReactCSSTransitionGroup
                  transitionName="price-appear">
                    {thisComp.state.editingPrice === i ? 
                      <input className="food-price" value={thisComp.state.prices[i]} step="10" style={{width:"45px", left: "10px", marginRight: "-65px", position:"relative"}} type="number"
                      onKeyPress={e=>{
                          if (e.key == 'Enter') thisComp.props.calculateDietIfNeeded()
                        }}
                        onChange={e=>{
                          let prices = thisComp.state.prices;
                          thisComp.setState({prices: [...prices.slice(0,i), e.target.value, ...prices.slice(i)]});
                          thisComp.props.changePrice(x.id,parseFloat(e.target.value))
                        }}
                        /> : ""}
                </ReactCSSTransitionGroup>
              </td>
              {x.nutAmounts.map((n,j)=>(
                <td title={thisComp.props.nutList[j].name} style={{backgroundColor:"rgba("+(255*n/100).toFixed(0)+",0,0,"+n/100+")"}} key={j}>
                  {n.toFixed(0)==="0" ? "" : n.toFixed(0) }
                </td>
              ))}
            </tr>)
        } else if (x.id in thisComp.props.nutInfo){
         return ( <tr key={i}>
              <td style={{"minWidth":"200px"}}>
              <span style={{marginLeft:"65px",marginRight:"60px",display:"inline-block",width:"50px",overflow:"hidden",textAlign:"right"}}>
                {(parseFloat(x.amount)).toFixed(1).toString() + thisComp.props.nutInfo[x.id].unit}
              </span>
              <span title={thisComp.props.nutInfo[x.id].long_name}>{"Lacking "+thisComp.props.nutInfo[x.id].long_name.slice(0,10)}</span>
              </td>
              {x.nutAmounts.map((n,j)=>(
                <td title={thisComp.props.nutList[j].name} style={{backgroundColor:"rgba("+(255*n/100).toFixed(0)+",0,0,"+n/100+")"}} key={j}>
                {n.toFixed(0)==="0" ? "" : n.toFixed(0) }
                </td>
              ))}
          </tr>)
        } else if (x.id.slice(5) in thisComp.props.nutInfo){
          return ( <tr key={i}>
               <td style={{"minWidth":"200px"}}>
               <span style={{marginLeft:"65px",marginRight:"60px",display:"inline-block",width:"50px",overflow:"hidden",textAlign:"right"}}>
                 {(parseFloat(x.amount)).toFixed(1).toString() + thisComp.props.nutInfo[x.id.slice(5)].unit}
               </span>
               <span title={thisComp.props.nutInfo[x.id.slice(5)].long_name}>{"Excess "+thisComp.props.nutInfo[x.id.slice(5)].long_name.slice(0,10)}</span>
               </td>
               {x.nutAmounts.map((n,j)=>(
                 <td title={thisComp.props.nutList[j].name} style={{backgroundColor:"rgba("+(255*-1*n/100).toFixed(0)+",0,0,"+-1*n/100+")"}} key={j}>
                 {(-1*n).toFixed(0) ==="0" ? "" : (-1*n).toFixed(0) }</td>
               ))}

           </tr>)
         }
      })}
      </tbody>
      </table>)
  }
}
