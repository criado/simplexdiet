import React from 'react';
import {beautifyNumber, isNaN} from '../functions';


/**
 * NumberField: component used for the upper and lower limits of nutrients and
 * of foods. Every time its value changes, it validates that the result is a
 * float, and then sets the underlying variables to reflect the value.
 */
export default class NumberField extends React.Component {
  constructor(props) {
    super(props);

    // processOnSetValue may process the number in some way before sending it
    // over to setValue
    const {index, thisComp, name} = props;
    this.state = {value: thisComp.state[name][index]};
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleKeyPress(e) {
    if (e.key == 'Enter') {
      this.handleChange(e);
      this.props.onPressedEnter();
    }
  }
  handleChange(e) {
    const {setValue, processOnSetValue} = this.props;

    let value = processOnSetValue(e.target.value);
    this.setState({value: (isNaN(value) ? '' : value)});
    setValue(value);
  }

  render () {
    const {className, style} = this.props;
    return (
      <input className={className} style={style}
             value={this.state.value}
             onKeyPress={this.handleKeyPress}
             type="text" onChange={this.handleChange}
      />);
  }
};

NumberField.defaultProps = {
  processOnSetValue(x) { return parseFloat(x); }
};

/**
 * PriceField: a NumberField that is limited above by 1e6. The prices of food
 * items need to be below 1e9 per unit for the "excess nutrient" variables to
 * work as intended.
 */
export let PriceField = (props) => {
  return <NumberField processOnSetValue={n=>Math.min(parseFloat(n), 1e6)} {...props}/>
};
