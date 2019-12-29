import { Meteor } from 'meteor/meteor';

// import { Foods } from '../imports/collections.js';

import csv from 'fast-csv';

// let serverroot2 = "assets/app/"

let serverroot = process.env['METEOR_SHELL_DIR'] + '/../../../private/';
var parse = require('csv-parse/lib/sync');
var path = require( 'path' );

export function addfood(file) {
  console.log("hi", file);
  let name, code, food, readingNutrients, firstSpace, nutrients = []
  food = {}
  var filePath = path.join( serverroot+"foods/", file );
  // console.log(file);
  name = file.slice(0,-4).replace(/_/g," ");
  code = file.slice(0,-4);
  readingNutrients = false
  nutrients = []
  firstSpace = false
  console.log("hi", filePath);
  csv.fromPath(filePath).on("data", Meteor.bindEnvironment(function(data){
    // console.log(data[0]);
    // console.log(data[0]);
    if (data.length === 1 && data[0].slice(0,8) === "Nutrient") {
        name = data[0].slice(19)
        name = name.split(", ")
        // code = name[0]
        name = name.slice(1).join(", ")
    }
    else if (data[0] === 'Nutrient' && data[1] === 'Unit' && data[2] === '1Value per 100 g') {
      readingNutrients = true;
    }
    else if (readingNutrients && data.length >=3) {
      let nutrient = {name:data[0], unit:data[1], value:data[2]}
      // console.log(nutrient);
      nutrients.push(nutrient)
    }
    if (!firstSpace && data.length === 0) {firstSpace = true}
    if (firstSpace && data.length > 0) {firstSpace = false}
    if ((firstSpace && data.length === 0)) {
      firstSpace = false;
      readingNutrients = false;

    }
  })).on("end", Meteor.bindEnvironment(function(){
    console.log(code);
    console.log("name", name);
    Meteor.bindEnvironment(Foods.insert({
      _id:code,
      name,
      nutrients
    }))
    return true;
  }));
  return true;
}
