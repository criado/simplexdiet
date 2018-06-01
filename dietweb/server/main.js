import { Meteor } from 'meteor/meteor';

import { Mongo } from 'meteor/mongo';

import { Foods, IngredientPreferences, NutrientPreferences } from '../imports/collections.js';

Foods.rawCollection().createIndex({name: 1, user: 1}, {unique: true});

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

      // let future=new Future();
      // let regex = RegExp("/.*" + keyword + ".*/i");
      // customFoods =
      return Foods.find({name:{$regex: keyword , $options: "-i"}}, {
        fields: {_id:1, name:1, nutrients:1,price:1, user: 1},
        limit:100
      }).fetch();

      // console.log("https://api.nal.usda.gov/ndb/search/?format=json&q="+encodeURI(keyword)+"&sort=n&max=100&offset=0&api_key=HDnNFBlfLWMeNNVU8zIavWrL8VKGIt7GkWgORQaC");

      // let USDAFoods = fetch("https://api.nal.usda.gov/ndb/search/?format=json&q="+encodeURI(keyword)+"&sort=n&max=100&offset=0&api_key=HDnNFBlfLWMeNNVU8zIavWrL8VKGIt7GkWgORQaC")
      // USDAFoods
      // .then(res=>res.json())
      // // .catch(err=>console.error(err))
      // .then(body=> {
      //   if (!!body.errors) {
      //     future.return({customFoods})
      //   console.log(body.errors.error)
      //   }
      //   else future.return({USDA:body.list.item.map(f=>({id:f.ndbno,name:f.name})),customFoods})
      // })
      // .catch(err=>console.error(err))

      // future.return({customFoods})

      // let val = future.wait();
      // return val
    },

});

// //CODE TO INSERT CSV FROM USDA TO DATABASE

// Meteor.startup(() => {
// //
// //   // import { Foods, FoodFiles } from '../imports/collections.js';
// //
// // });

// // code to run on server at startup

// // FoodFiles.onAfterUpload = (file) => {addfood(file.name)};

// //TODO: make all methods use the better csv parsing libraries...
// // Files are a bit messy :P

// let FoodFileData = fs.readFileSync(serverroot+"foods/food_database.csv").toString()
// let FoodNameFile = fs.readFileSync(serverroot+"foods/FOOD_DES.txt").toString()

// let foods = parse(FoodFileData, {columns: ['NDB_No', 'Shrt_Desc', '203', '204', '205', '207', '208', '209', '210', '211', '212', '213', '214', '221', '255', '257', '262', '263', '268', '269', '287', '291', '301', '303', '304', '305', '306', '307', '309', '312', '313', '315', '317', '318', '319', '320', '321', '322', '323', '324', '325', '326', '328', '334', '337', '338', '341', '342', '343', '344', '345', '346', '347', '401', '404', '405', '406', '410', '415', '417', '418',
// '421', '428', '429', '430', '431', '432', '435', '454', '501', '502', '503', '504', '505', '506', '507', '508', '509', '510', '511', '512', '513', '514', '515', '516', '517', '518', '521', '573', '578', '601', '605', '606', '607', '608', '609', '610', '611', '612', '613', '614', '615', '617', '618', '619', '620', '621', '624', '625', '626', '627', '628', '629', '630', '631', '636', '638', '639', '641', '645', '646', '652', '653', '654', '662', '663', '664', '665', '666', '669', '670', '671', '672', '673', '674', '675', '676', '685', '687', '689', '693', '695', '696', '697', '851', '852', '853', '855', '856', '857', '858', '859'], trim: true})


// let foodnames = parse(FoodNameFile, {columns: ['id','name'], trim: true, escape: '\\'})

// //

// // let nutcodes=["208","204","606","601","205","269","291","203","301","303","304","305","306","307","309","312","315","317","401","404","405","406","410","415","417","421","418","320","323","328","430","851","618"];

// // let nutnames=["Energy","Totallipid(fat)","Fattyacids,totalsaturated","Cholesterol","Carbohydrate,bydifference","Sugars,total","Fiber,totaldietary","Protein","Calcium,Ca","Iron,Fe","Magnesium,Mg","Phosphorus,P","Potassium,K","Sodium,Na","Zinc,Zn","Copper,Cu","Manganese,Mn","Selenium,Se","VitaminC,totalascorbicacid","Thiamin","Riboflavin","Niacin","Pantothenicacid","VitaminB-6","Folate,total","Choline,total","VitaminB-12","VitaminA,RAE","VitaminE(alpha-tocopherol)","VitaminD(D2+D3)","VitaminK(phylloquinone)","18:3undifferentiated","18:2undifferentiated"];

// // let nutunits=["kcal","g","g","mg","g","g","g","g","mg","mg","mg","mg","mg","mg","mg","mg","mg","µg","mg","mg","mg","mg","mg","mg","µg","mg","µg","µg","mg","µg","µg","g","g",];

// import { nutcodes, nutInfo } from '../imports/nut-info.js'

// // let foodids = Foods.find({}).fetch().map(x=>x._id)

// for (var i = 1; i < foods.length; i++) {
//   let code,name,nuts={};
//   for (prop in foods[i]) {
//     if (prop === "NDB_No") {
//       code=foods[i][prop]
//       for (let j = 1; j < foodnames.length; j++) {
//         if (foodnames[j].id===code)
//           {
//             name = foodnames[j].name
//             break;
//           }
//       }
//     }  else if (foods[i][prop].length > 0) {
//       // let index = nutcodes.indexOf(prop);
//       nuts[prop] = parseFloat(foods[i][prop])
//     }
//   }
//   // console.log({code,name,nuts})
//   Foods.insert({
//       _id:code,
//       name,
//       user: "USDA",
//       price: 0,
//       nutrients: nuts
//     })
// }

// });
