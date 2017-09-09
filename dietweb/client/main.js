import React from 'react';
import ReactDOM from 'react-dom';

import App from './app.jsx'

Meteor.startup(() => {
  ReactDOM.render(<App/>, document.getElementById('app'));
})
