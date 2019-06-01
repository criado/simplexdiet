import React from 'react';
import ReactDOM from 'react-dom';

import NumberField, {PriceField} from './components/number-field'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6

import {beautifyNumber} from './functions'

export default class DietTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mins: props.diet.filter(x=>(x.id in props.ings)).map(x=>(props.ings[x.id].min*100).toFixed(0)),
      maxs: props.diet.filter(x=>(x.id in props.ings)).map(x=>(props.ings[x.id].max*100).toFixed(0)),
      prices: props.diet.filter(x=>(x.id in props.ings)).map(x=>(props.ings[x.id].price)),
      nutmins: props.nutList.map(x=>
        typeof props.nutPref[x.id] !== "undefined" && typeof props.nutPref[x.id].min !== "undefined" ? props.nutPref[x.id].min.toFixed(0) : ""),
      nutmaxs: props.nutList.map(x=>
        typeof props.nutPref[x.id] !== "undefined" && typeof props.nutPref[x.id].max !== "undefined" ? props.nutPref[x.id].max.toFixed(0) : ""),
      editingPrice: -1
    }
    this.tableBodyEl = React.createRef();
    this.tableHeadEl = React.createRef();
  }
  componentDidMount(props) {
    const thisComp = this;
    const tableBodyEl = this.tableBodyEl.current;
    $(tableBodyEl).sortable({items: ".ings"}, {
      stop: function( event, ui ) {
        let id2 = parseInt(ui.item.attr("diet-array-pos"))
        let id1 = ui.item.next(".ings").length > 0 ? parseInt(ui.item.next().attr("diet-array-pos")) : parseInt(ui.item.prev().attr("diet-array-pos")) + 1
        // console.log(ui.item.next(".ings"), parseInt(ui.item.next(".ings")), id1)
        thisComp.props.changeIngOrder(id1,id2)
        $(tableBodyEl).sortable("cancel")
      }
    });
    const tableHeadEl = this.tableHeadEl.current;
    // let nutNameWidth = $(tableHeadEl).children(".nutName").first().width();
    let nutNameWidth = "41px"
    // console.log($(tableHeadEl).children(".nutName").first())
    // console.log(nutNameWidth);
    $(tableHeadEl).sortable({
      helper: (e,el) => {return el.clone().show().width(nutNameWidth)}
      ,forcePlaceholderSize:true, 
      forceHelperSize:true}, {
      start: function(event,ui) {
        // ui.placeholder.width(nutNameWidth)
        // ui.item.css({"display":"visible"})
        // ui.item.css({"width":"0px"})
      },
      stop: function( event, ui ) {
        let id2 = parseInt(ui.item.attr("nut-array-pos"))
        let id1 = ui.item.next() ? parseInt(ui.item.next().attr("nut-array-pos")) : parseInt(ui.item.prev().attr("nut-array-pos")) + 1
        console.log(ui.item)
        thisComp.props.changeNutOrder(id1,id2)
        $(tableHeadEl).sortable("cancel")
      }
    })
  }
  componentDidUpdate(prevProps){
    const thisComp = this;
    if (prevProps !== this.props) {
      this.setState({
        mins: thisComp.props.diet.filter(x=>(x.id in thisComp.props.ings)).map(x=>(beautifyNumber(thisComp.props.ings[x.id].min*100))),
        maxs: thisComp.props.diet.filter(x=>(x.id in thisComp.props.ings)).map(x=>(beautifyNumber(thisComp.props.ings[x.id].max*100))),
        prices: thisComp.props.diet.filter(x=>(x.id in thisComp.props.ings)).map(x=>(thisComp.props.ings[x.id].price)),
        nutmins: thisComp.props.nutList.map(x=>
          typeof thisComp.props.nutPref[x.id] !== "undefined" && typeof thisComp.props.nutPref[x.id].min !== "undefined" ? beautifyNumber(thisComp.props.nutPref[x.id].min) : ""),
        nutmaxs: thisComp.props.nutList.map(x=>
          typeof thisComp.props.nutPref[x.id] !== "undefined" && typeof thisComp.props.nutPref[x.id].max !== "undefined" ? beautifyNumber(thisComp.props.nutPref[x.id].max) : "")
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
    return (<table className="table table-hover">
    {/* HEAD OF TABLE */}
    <thead>
      <tr ref={this.tableHeadEl}>
      <th style={{width: "350px", padding: "1px"}} scope="col">{this.props.DietSelector}</th>
        {this.props.nutList.map((x,i)=>{
          return <th key={i} nut-array-pos={i} title={x.name} scope="col" valign="middle" style={{width:"41px", padding: "1px", textAlign: "center"}} className="nutName">{thisComp.props.nutInfo[x.id].short_name}</th>
        })}
      </tr>
      <tr>
      <td scope="col" style={{width: "350px", padding: "1px"}}> {this.props.dietStats} </td>
      {/* NUTRIENTS */}
        {this.props.nutList.map((x,i)=>{
          return <td key={i} nut-array-pos={i} title={x.name} scope="col" style={{fontSize:"10px", padding:"1px 2px", textAlign: "center"}}>
          <a className="remove-nut" style={{marginRight:"10px",color:"red"}} onClick={()=>thisComp.props.removeNut(x.id)}>
                  <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
          </a>
          <NumberField thisComp={thisComp} style={{width:"30px", textAlign: "right"}} className="nut-limits" 
            setValue={(value, onValueSet)=>{thisComp.props.changeNutLims(x.id,{"min":value},onValueSet)}}
            onPressedEnter={thisComp.props.calculateDietIfNeeded}
            index={i}
            name="nutmins"
            />

            <div style={{textAlign: "right", display: "inline-block", width:"100%", padding: "2px"}}>
              <span style={{width:"35px"}}>{typeof thisComp.props.nutTots[i] !== "undefined" ? thisComp.props.nutTots[i].toFixed(0).toString(): ""}<span style={{fontSize:"8px"}}>{x.unit}</span></span>
            </div>

            <br/>
              <NumberField thisComp={thisComp} style={{width:"30px", textAlign: "right"}} className="nut-limits" 
                setValue={(value, onValueSet)=>{thisComp.props.changeNutLims(x.id,{"max":value},onValueSet)}}
                onPressedEnter={thisComp.props.calculateDietIfNeeded}
                index={i}
                name="nutmaxs"
                />
            {/* <span title={x.name}>{x.name.split(",").slice(0,2).join(",").slice(0,17)}</span> */}

        </td>
        })}
      </tr>
    </thead>
    {/* BODY OF TABLE */}
      <tbody ref={this.tableBodyEl}>
      {this.props.diet.map((x,i)=>{
        if (x.id in thisComp.props.ings)
        {
          return (<tr key={i} className="ings" diet-array-pos={i} style={{"height":"45px"}}>
              <td style={{"width":"350px"}}>
                <a className="remove-ing" style={{marginRight:"10px",color:"red"}} onClick={()=>thisComp.props.removeIng(x.id)}>
                  <span className="glyphicon glyphicon-remove" aria-hidden="true">x</span>
                </a>

                <NumberField thisComp={thisComp} style={{width:"45px",marginRight:"10px"}} className="ing-limits" 
                    setValue={(value, onValueSet)=>{thisComp.props.changeLims(x.id,{"min":value/100},onValueSet)}}
                    onPressedEnter={thisComp.props.calculateDietIfNeeded}
                    index={i}
                    name="mins"
                    />

                <span style={{marginRight:"15px",display:"inline-block",width:"33px",overflow:"hidden",textAlign:"right"}}>
                  {(parseFloat(x.amount)*100).toFixed(0)}g
                </span>

                  <NumberField thisComp={thisComp} style={{width:"45px",marginRight:"10px"}} className="ing-limits"
                    setValue={(value, onValueSet)=>{thisComp.props.changeLims(x.id,{"max":value/100},onValueSet)}}
                    onPressedEnter={thisComp.props.calculateDietIfNeeded}
                    index={i}
                    name="maxs"
                    />

                <span title={x.name} onClick={()=>{this.editFoodPrice(i)}} style={{cursor: "pointer"}}>{x.name.split(",").slice(0,2).join(",").slice(0,17)}</span>
                {/* <span className="glyphicon glyphicon-gbp" aria-hidden="true" onClick={()=>{this.editFoodPrice(i)}} style={{cursor: "pointer", float:"right"}}></span> */}
                <ReactCSSTransitionGroup
                  transitionName="price-appear">
                    {thisComp.state.editingPrice === i ? 
                      <PriceField thisComp={thisComp} style={{width:"45px", left: "10px", marginRight: "-65px", position:"relative"}} className="food-price" 
                      setValue={(value, onValueSet)=>{thisComp.props.changePrice(x.id,value,onValueSet)}}
                      onPressedEnter={thisComp.props.calculateDietIfNeeded}
                      index={i}
                      name="prices"
                      /> : ""}
                </ReactCSSTransitionGroup>
              </td>
              {/* NUTRIENT ROW */}
              {x.nutAmounts.map((n,j)=>(
                <td title={this.props.nutList[j].protein} style={{backgroundColor:"rgba("+(255*n/100).toFixed(0)+",0,0,"+n/100+")", width:"41px"}} key={j}>
                  {n.toFixed(0)==="0" ? "" : n.toFixed(0) }
                </td>
              ))}
            </tr>)
        //NUTFOODS
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
        //ANTI-NUTFOODS
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

// class NumberField extends React.Component {
//   constructor() {
//     super();
//   }
//   render() {
//     const { style, className, thisComp } = this.props;
//     const {name,index}=this.props;
//     console.log(thisComp)
//     return <input className={className} value={thisComp.state[name][index]} step="10" style={style} type="number"
//       onKeyPress={e=>{
//           if (e.key == 'Enter') {
//             this.props.setValue(e.target.value,this.props.onPressedEnter)
//           }
//         }}
//         onChange={e=>{
//           let variable = thisComp.state[name];
//           // console.log(e.target.value,name,thisComp,[...variable.slice(0,index), e.target.value, ...variable.slice(index)],index)
//           let stateChange = {}
//           stateChange[name]=[...variable.slice(0,index), e.target.value, ...variable.slice(index)];
//           thisComp.setState(stateChange);
//         }}
//         onBlur={e=>{
//           this.props.setValue(e.target.value)
//         }}
//         />
//   }
// }

// const MaxField = (props) => {
//  return (
//   <NumberField thisComp={thisComp} style={{width:"45px",marginRight:"10px"}} className="ing-limits" 
//   setValue={(value, onValueSet)=>{
//     let oldLim = e.target.value;
//     let newLim = 
//     // thisComp.props.changeLims(x.id,{"max":parseFloat(newLim)/100})
//     this.onSetValue(newLim)
//   }}
//   onPressedEnter={thisComp.props.calculateDietIfNeeded}
//   index={i}
//   name="maxs"
//   />
//  )
// }


{/* <NumberField thisComp={thisComp} style={{width:"45px", left: "10px", marginRight: "-65px", position:"relative"}} className="food-price" 
  setValue={(value, onValueSet)=>{
    let newPrice = Math.min(value,1e6);
    thisComp.props.changePrice(x.id,parseFloat(newPrice),onValueSet) 
  }}
  onPressedEnter={thisComp.props.calculateDietIfNeeded}
  index={i}
  name="prices"
  /> */}