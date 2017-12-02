import { Meteor } from 'meteor/meteor';

import { Mongo } from 'meteor/mongo';

import { Foods, FoodFiles } from '../imports/collections.js';

import csv from 'fast-csv';

import {addfood} from './addfood.js'

// let serverroot2 = "assets/app/"

let serverroot = process.env['METEOR_SHELL_DIR'] + '/../../../private/';
var parse = require('csv-parse/lib/sync');
var path = require( 'path' );
var fs = require('fs');


Meteor.startup(() => {
  // code to run on server at startup
  var exec = Npm.require("child_process").exec;
  var Future = Npm.require("fibers/future");

  // FoodFiles.onAfterUpload = (file) => {addfood(file.name)};

//TODO: make all methods use the better csv parsing libraries...
//Files are a bit messy :P

// fs.readdir( serverroot+"foods/", Meteor.bindEnvironment(function( err, files ) {
//         if( err ) {
//             console.error( "Could not list the directory.", err );
//             process.exit( 1 );
//         }
//
//         files.forEach( Meteor.bindEnvironment(function( file, idx ) {
//           let name, code, food, readingNutrients, firstSpace, nutrients = []
//           food = {}
//           var filePath = path.join( serverroot+"foods/", file );
//           console.log(file);
//           name = file.slice(0,-4).replace(/_/g," ");
//           code = file.slice(0,-4);
//           readingNutrients = false
//           nutrients = []
//           firstSpace = false
//           csv.fromPath(filePath).on("data", Meteor.bindEnvironment(function(data){
//             // console.log(data[0]);
//             if (data.length === 1 && data[0].slice(0,8) === "Nutrient") {
//                 name = data[0].slice(19)
//                 name = name.split(", ")
//                 code = name[0]
//                 name = name.slice(1).join(", ")
//             }
//             else if (data[0] === 'Nutrient' && data[1] === 'Unit' && data[2] === '1Value per 100 g') {
//               readingNutrients = true;
//             }
//             else if (readingNutrients && data.length >=3) {
//               let nutrient = {name:data[0], unit:data[1], value:data[2]}
//               nutrients.push(nutrient)
//             }
//             else if (!firstSpace && data.length === 0) {firstSpace = true}
//             else if (firstSpace && data.length > 0) {firstSpace = false}
//             else if (firstSpace && data.length === 0) {
//               firstSpace = false;
//               readingNutrients = false;
//               console.log(code);
//               let res = Foods.find({_id:code}).fetch();
//               if (res.length > 0) {
//                 if (res[0].name !== name || res[0].nutrients !== nutrients) {
//                   Foods.update({_id:code}, {name:name, nutrients:nutrients})
//                 }
//               } else {
//                 Foods.insert({
//                   _id:code,
//                   name,
//                   nutrients
//                 })
//               }
//
//             }
//           })).on("end", function(){ });
//
//           // let parsedFile = parse(fileData, {columns: ["name","unit","longName","min","max"], trim: true})
//         } ));
// } ));

// Meteor.publish('foods', function () {
//   return Rooms.find({}, {
//     fields: { nutrients: 0 }
//   });
// });

// FoodFiles.on('afterUpload', function (fileRef) {
//   /* `this` context is the Images (FilesCollection) instance */
//   console.log(fileRef);
//   if (Meteor.isServer) {
//     Meteor.bindEnvironment(addfood(fileRef[0]._id+".csv"))
//   }
// });

Meteor.methods({
    addfood(file) {
      // var future=new Future();
      // console.log(file[0].name);
      // console.log(file[0]._id);
      // future.return(addfood(file[0]._id+".csv"));

      // return future.wait();
      addfood(file[0]._id+".csv")
      // console.log(food);
      // Foods.insert(food);
    },
    calculate_diet() {
      var future=new Future();
      // this.unblock();
      let prefFileName = serverroot+"preferences_"+Meteor.userId()+".csv";
      let profFileName = serverroot+"profile_"+Meteor.userId()+".csv";
      let dietFileName = "diet_"+Meteor.userId()+".txt";
      let command = "python3 "+serverroot+"diet.py "+profFileName+" "+prefFileName+"> "+serverroot+dietFileName;
      if (!fs.existsSync(serverroot+dietFileName)) {

        console.log(command);
        exec(command,function(error,stdout,stderr){
          if(error){
            console.log(error);
            throw new Meteor.Error(500,command+" failed");
          } else {
            let res = fs.readFileSync(serverroot+dietFileName).toString().split('\n');
            if (res[4] === "LP HAS NO PRIMAL FEASIBLE SOLUTION") {
              future.throw(new Meteor.Error(666,"LP HAS NO PRIMAL FEASIBLE SOLUTION"))
            } else {
              res = res
              .map(x=>x.split(";"))
              .filter(x=>x[0]==="ing_amount")
              .map(x=>({name:x[2], amount:x[1]}))
              future.return(res)
            }
          }
          return
        })
      } else {
        let res = fs.readFileSync(serverroot+dietFileName).toString().split('\n')
        if (res[4] === "LP HAS NO PRIMAL FEASIBLE SOLUTION") {
          future.throw(new Meteor.Error(666,"LP HAS NO PRIMAL FEASIBLE SOLUTION"))
        } else {
          res = res
          .map(x=>x.split(";"))
          .filter(x=>x[0]==="ing_amount")
          .map(x=>({name:x[2], amount:x[1]}))
          future.return(res)
        }
      }
      let val = future.wait();
      // console.log("val",val);
      return val
    },
      getPreferences() {
        var future=new Future();
        let prefFileName = "preferences_"+Meteor.userId()+".csv";
        if (!fs.existsSync(serverroot+prefFileName)) {
            throw new Meteor.Error(500,"preferences files not found");
            return
        } else {
          let res = fs.readFileSync(serverroot+prefFileName).toString().split('\n')
          .map(x=>x.split(","))
          .filter(x=>(x.length === 4))
          .map(x=>({code:x[0].trim(), price:parseFloat(x[1].trim()), min:x[2].trim(), max:x[3].trim()}))
          for (var i = 0; i < res.length; i++) {
            let fileName = res[i].code;
            if (res[i].code[0] === "\"") {
              fileName = fileName.slice(1,-1);
            }
            //TODO: USE FOODS ABOVE
            let name = fs.readFileSync(serverroot+"foods/"+fileName+".csv").toString().split('\n')[3]
            if (name.substring(0,9) === "\"Nutrient" || name.substring(0,8) === "Nutrient") {
              name = name.slice(26,-1);
            }
            // console.log("name", name);
            res[i].name = name;
          }
          future.return(res)
        }
        let val = future.wait();
        // console.log("val",val);
        return val
      },
      writePreferences(prefs) {
        let dietFileName = "diet_"+Meteor.userId()+".txt";
        let prefFileName = "preferences_"+Meteor.userId()+".csv";
        // console.log(prefs);
        prefs = prefs[0]
        let string = prefs.map(x=>([x['code'],x['price'],x['min'],x['max']])).map(x=>x.join(", ")).join("\n")
        // console.log(string);
        fs.writeFile(serverroot+prefFileName, string, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The preferences file was saved!");
        });
        if (fs.existsSync(serverroot+dietFileName)) {
          fs.unlink(serverroot+dietFileName);
        }
      },
      getProfile() {
        let profileFile = serverroot+"profile_"+Meteor.userId()+".csv";
        var future=new Future();
        if (!fs.existsSync(profileFile)) {
            // throw new Meteor.Error(500,"profile files not found");
            // return
            //TODO:female, etc
            let fileData = fs.readFileSync(serverroot+"male_default_profile.csv").toString()
            let res = parse(fileData, {columns: ["name","unit","longName","min","max"], trim: true})
            future.return(res)
        } else {
          let fileData = fs.readFileSync(profileFile).toString()
          let res = parse(fileData, {columns: ["name","unit","longName","min","max"], trim: true})
          future.return(res)
        }
        let val = future.wait();
        // console.log("val",val);
        return val
      },
      writeProfile(prof) {
        let profileFile = serverroot+"profile_"+Meteor.userId()+".csv";
        let dietFileName = "diet_"+Meteor.userId()+".txt";
        // console.log(prof);
        prof = prof[0]
        // console.log(string);
        var ws = fs.createWriteStream(profileFile);
        csv.write(prof, {headers: false}).pipe(ws);
        if (fs.existsSync(serverroot+dietFileName)) {
          fs.unlink(serverroot+dietFileName);
        }
      }
    });
});
