import React from 'react';
import {mount} from 'react-mounter';
import Diet from './diet.js';
import CustomFood from './custom-food.js';
import CustomProfile from './new-profile.jsx';

import {MainLayout} from './MainLayout.js';

// import 'bootstrap/dist/css/bootstrap.min.css';


FlowRouter.route('/', {
  action() {
    mount(MainLayout, {
        content: (<Diet />),
        active: "home",
    })
  }
})

FlowRouter.route('/new-food', {
  action() {
    mount(MainLayout, {
        content: (<CustomFood />),
        active: "test",
    })
  }
})

FlowRouter.route('/new-profile', {
  action() {
    mount(MainLayout, {
        content: (<CustomProfile />),
        active: "test",
    })
  }
})
//
// FlowRouter.route('/pref', {
//   action() {
//     mount(MainLayout, {
//         content: (<Preferences />),
//         active: "pref"
//     })
//   }
// })
