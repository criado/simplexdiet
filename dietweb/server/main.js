import { Meteor } from 'meteor/meteor';

import { Mongo } from 'meteor/mongo';

import { Foods, IngredientPreferences, NutrientPreferences } from '../imports/collections.js';

// import csv from 'fast-csv';

import fetch from 'node-fetch';

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

Meteor.publish("foods", () =>{
  return Foods.find();
})


Meteor.methods({
    getFoodNamesData(keyword) {
      console.log(keyword);

      let future=new Future();
      // let regex = RegExp("/.*" + keyword + ".*/i");

      let customFoods = Foods.find({name:{$regex: keyword , $options: "-i"}}, {
        fields: {_id:1, name:1, nutrients:1,price:1, user: 1},
        limit:100
      }).fetch();

      console.log("https://api.nal.usda.gov/ndb/search/?format=json&q="+encodeURI(keyword)+"&sort=n&max=100&offset=0&api_key=HDnNFBlfLWMeNNVU8zIavWrL8VKGIt7GkWgORQaC");

      let USDAFoods = fetch("https://api.nal.usda.gov/ndb/search/?format=json&q="+encodeURI(keyword)+"&sort=n&max=100&offset=0&api_key=HDnNFBlfLWMeNNVU8zIavWrL8VKGIt7GkWgORQaC")
      USDAFoods
      .then(res=>res.json())
      // .catch(err=>console.error(err))
      .then(body=> {
        if (!!body.errors) {
          future.return({customFoods})
        console.log(body.errors.error)
        }
        else future.return({USDA:body.list.item.map(f=>({id:f.ndbno,name:f.name})),customFoods})
      })
      .catch(err=>console.error(err))


      let val = future.wait();
      return val
    },

});
