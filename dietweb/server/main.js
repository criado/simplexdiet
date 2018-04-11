import { Meteor } from 'meteor/meteor';

import { Mongo } from 'meteor/mongo';

import { Foods, IngredientPreferences, NutrientPreferences } from '../imports/collections.js';

import csv from 'fast-csv';

// import {addfood} from './addfood.js'

// let serverroot2 = "assets/app/"

let serverroot = process.env['METEOR_SHELL_DIR'] + '/../../../private/';
var parse = require('csv-parse/lib/sync');
var path = require( 'path' );
var fs = require('fs');

var exec = Npm.require("child_process").exec;
var Future = Npm.require("fibers/future");

// Meteor.publish('foods', ()=>{
//   return Foods.find({}, {
//     fields: {fields: {_id:1, name:1, nutrients:0}}
//   });
// });

Meteor.publish("ingPrefs", () =>{
  return IngredientPreferences.find();
})

Meteor.publish("nutPrefs", () =>{
  return NutrientPreferences.find();
})

Meteor.methods({
    getFoodNamesData() {
      return Foods.find({}, {
          fields: {_id:1, name:1}
        }).fetch();
    },

    });
