import React from 'react';
// import ReactDOM from 'react-dom';

import {beautifyNumber} from '../functions'

export default NumberField = (props) => {
    const { style, className, thisComp, setValue, onPressedEnter, processOnSetValue, processOnChange} = props;
    //processOnSetValue and processOnChange may process the number in some way before sending it over to setValue, thisComp.state respectively
      const {name,index}=props;
      console.log("I AM BEING RERENDERED")
    const onChangeDefault = e=>{
      let variable = thisComp.state[name];
      // console.log(e.target.value,name,thisComp,[...variable.slice(0,index), e.target.value, ...variable.slice(index)],index)
      let stateChange = {}
      stateChange[name]=[...variable.slice(0,index), processOnChange(e.target.value), ...variable.slice(index+1)];
      thisComp.setState(stateChange);
      
    }
    return <input className={className} value={thisComp.state[name][index]} step="10" style={style} type="number"
        onKeyPress={e=>{
            if (e.key == 'Enter') {
              setValue(processOnSetValue(e.target.value),onPressedEnter)
            //   thisComp.forceUpdate()
            }
          }}
          onChange={props.onChange ? props.onChange : onChangeDefault}
          onBlur={e=>{
            setValue(processOnSetValue(e.target.value))
            // thisComp.forceUpdate()
          }}
          />
  }

  NumberField.defaultProps = {
    processOnSetValue: x=>parseFloat(x),
    processOnChange: x=>x
  };

export let PriceField = (props) => {
    return <NumberField processOnSetValue={n=>Math.min(parseFloat(n),1e6)} {...props}/>
}