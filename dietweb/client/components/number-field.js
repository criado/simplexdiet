import React from 'react';
import {beautifyNumber} from '../functions';

export default class NumberField extends React.Component {
  constructor(props) {
    super(props);

    // processOnSetValue may process the number in some way before sending it
    // over to setValue
    const {index, thisComp, name} = props;
    this.state = {value: thisComp.state[name][index]};
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleKeyPress(e) {
    if (e.key == 'Enter')
      this.handleBlur(e);
  }
  handleBlur(e) {
    const {index, thisComp, name, processOnSetValue} = this.props;

    let value = processOnSetValue(e.target.value);
    if(value != value) {
      // value is NaN, which means "no limit"
      this.setState({value: ''});
    }

    let stateArray = thisComp.state[name];
    let stateChange = {};
    stateChange[name] = [...stateArray.slice(0, index),
                         value,
                         ...stateArray.slice(index+1)];
    thisComp.setState(stateChange);
  }

  handleChange(e) {
    this.setState({value: e.target.value});
  }

  render () {
    const {className, style} = this.props;
    return (
      <input className={className} style={style}
             value={this.state.value}
             type="text" onKeyPress={this.handleKeyPress}
             onChange={this.handleChange} onBlur={this.handleBlur}
      />);
  }
};

NumberField.defaultProps = {
  processOnSetValue(x) { return parseFloat(x); }
}

export let PriceField = (props) => {
  return <NumberField processOnSetValue={n=>Math.min(parseFloat(n), 1e6)} {...props}/>
}
