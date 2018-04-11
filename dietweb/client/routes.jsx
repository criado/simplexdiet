import React from 'react';
import {mount} from 'react-mounter';
import Diet from './diet.js';

import {MainLayout} from './MainLayout.js';

FlowRouter.route('/', {
  action() {
    mount(MainLayout, {
        content: (<Diet />),
        active: "home",
    })
  }
})

// FlowRouter.route('/profile', {
//   action() {
//     mount(MainLayout, {
//         content: (<Profile />),
//         active: "profile",
//     })
//   }
// })
//
// FlowRouter.route('/pref', {
//   action() {
//     mount(MainLayout, {
//         content: (<Preferences />),
//         active: "pref"
//     })
//   }
// })
