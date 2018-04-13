Meteor.methods({
    getFoodNamesData() {
      return Foods.find({}, {
          fields: {_id:1, name:1}
        }).fetch();
    },
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
      let prefFileName_command = "preferences_"+Meteor.userId()+".csv";
      let profFileName = serverroot+"profile_"+Meteor.userId()+".csv";
      let profFileName_command = "profile_"+Meteor.userId()+".csv";
      let dietFileName = "diet_"+Meteor.userId()+".txt";
      let command = "python3 "+serverroot+"main.py "+profFileName_command+" "+prefFileName_command+"> "+serverroot+dietFileName;
      // fs.unlink(serverroot+dietFileName);
      if (!fs.existsSync(serverroot+dietFileName)) {

        console.log(command);
        exec(command,function(error,stdout,stderr){
          // console.log("hi");
          console.log(stderr);
          if(error){
            console.log(error);
            throw new Meteor.Error(500,command+" failed");
          } else {
            // console.log(serverroot+dietFileName);
            let res = fs.readFileSync(serverroot+dietFileName).toString().split('\n');
            console.log(res);
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
        console.log("HIIII");
        var future=new Future();
        let prefFileName = "preferences_"+Meteor.userId()+".csv";
        if (!fs.existsSync(serverroot+prefFileName)) {
            throw new Meteor.Error(500,"preferences files not found");
            return
        } else {
          let res = fs.readFileSync(serverroot+prefFileName).toString().split('\n')
          .map(x=>x.split(","))
          .filter(x=>(x.length === 4))
          .map(x=>({code:x[0].trim(), price:parseFloat(x[1].trim()), min:x[2].trim(), max:x[3].trim(), food:{}}))
          for (var i = 0; i < res.length; i++) {
            let code = res[i].code;
            if (res[i].code[0] === "\"") {
              code = code.slice(1,-1);
            }
            //TODO: USE FOODS ABOVE
            food = Foods.findOne({_id:code})
            //
            // if (food.nuts) food.nutrients = food.nuts;
            // let name = fs.readFileSync(serverroot+"foods/"+fileName+".csv").toString().split('\n')[3]
            // if (name.substring(0,9) === "\"Nutrient" || name.substring(0,8) === "Nutrient") {
            //   name = name.slice(27,-1);
            // }
            // console.log("name", name);
            res[i].food = food;
          }
          // console.log(res);//
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

// });

// Meteor.startup(() => {
// //
// //   // import { Foods, FoodFiles } from '../imports/collections.js';
// //
// // });
//
// // code to run on server at startup
//
// // FoodFiles.onAfterUpload = (file) => {addfood(file.name)};
//
// //TODO: make all methods use the better csv parsing libraries...
// // Files are a bit messy :P
//
// fs.readdir( serverroot+"foods/", Meteor.bindEnvironment(function( err, files ) {
//         if( err ) {
//             console.error( "Could not list the directory.", err );
//             process.exit( 1 );
//         }
//         console.log("HELLO");
//         files.forEach( Meteor.bindEnvironment(function( file, idx ) {
//           // console.log(file);
//           let name, code, food, readingNutrients, firstSpace, nutrients = []
//           food = {}
//           var filePath = path.join( serverroot+"foods/", file );
//           name = file.slice(0,-4).replace(/_/g," ");
//           code = file.slice(0,-4);
//           // console.log(filePath);
//           readingNutrients = false
//           nutrients = []
//           firstSpace = false
//           csv.fromPath(filePath).on("data", Meteor.bindEnvironment(function(data){
//             // console.log(data[0]);
//             // if (code==="19165") console.log(name);/
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
//             else if (firstSpace && data.length === 0 || data[0] === "Other") {
//               //
//               //
//               firstSpace = false;
//               readingNutrients = false;
//               console.log(code,name);
//               let res = Foods.find({_id:code}).fetch();
//               if (res.length > 0) {
//                 console.log(name, " food found");
//                 if (res[0].name !== name || res[0].nutrients !== nutrients) {
//                   Foods.update({_id:code}, {name:name, nutrients:nutrients})
//                 }
//               } else {
//                 console.log(name, " food added");
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
//
// });
// ///////////
// // Meteor.publish('foods', function () {
// //   return Rooms.find({}, {
// //     fields: { nutrients: 0 }
// //   });
// // });
// //
// // FoodFiles.on('afterUpload', function (fileRef) {
// //   /* `this` context is the Images (FilesCollection) instance */
// //   console.log(fileRef);
// //   if (Meteor.isServer) {
// //     Meteor.bindEnvironment(addfood(fileRef[0]._id+".csv"))
// //   }
// // });
//
// //CODE TO INSERT CSV FROM USDA TO DATABASE
//
// // let FoodFileData = fs.readFileSync(serverroot+"foods/food_database.csv").toString()
// //
// // let foods = parse(FoodFileData, {columns: ['NDB_No', 'Shrt_Desc', '203', '204', '205', '207', '208', '209', '210', '211', '212', '213', '214', '221', '255', '257', '262', '263', '268', '269', '287', '291', '301', '303', '304', '305', '306', '307', '309', '312', '313', '315', '317', '318', '319', '320', '321', '322', '323', '324', '325', '326', '328', '334', '337', '338', '341', '342', '343', '344', '345', '346', '347', '401', '404', '405', '406', '410', '415', '417', '418',
// // '421', '428', '429', '430', '431', '432', '435', '454', '501', '502', '503', '504', '505', '506', '507', '508', '509', '510', '511', '512', '513', '514', '515', '516', '517', '518', '521', '573', '578', '601', '605', '606', '607', '608', '609', '610', '611', '612', '613', '614', '615', '617', '618', '619', '620', '621', '624', '625', '626', '627', '628', '629', '630', '631', '636', '638', '639', '641', '645', '646', '652', '653', '654', '662', '663', '664', '665', '666', '669', '670', '671', '672', '673', '674', '675', '676', '685', '687', '689', '693', '695', '696', '697', '851', '852', '853', '855', '856', '857', '858', '859'], trim: true})
// //
// // let nutcodes=["208","204","606","601","205","269","291","203","301","303","304","305","306","307","309","312","315","317","401","404","405","406","410","415","417","421","418","320","323","328","430","851","618"];
// //
// // let nutnames=["Energy","Totallipid(fat)","Fattyacids,totalsaturated","Cholesterol","Carbohydrate,bydifference","Sugars,total","Fiber,totaldietary","Protein","Calcium,Ca","Iron,Fe","Magnesium,Mg","Phosphorus,P","Potassium,K","Sodium,Na","Zinc,Zn","Copper,Cu","Manganese,Mn","Selenium,Se","VitaminC,totalascorbicacid","Thiamin","Riboflavin","Niacin","Pantothenicacid","VitaminB-6","Folate,total","Choline,total","VitaminB-12","VitaminA,RAE","VitaminE(alpha-tocopherol)","VitaminD(D2+D3)","VitaminK(phylloquinone)","18:3undifferentiated","18:2undifferentiated"];
// //
// // let nutunits=["kcal","g","g","mg","g","g","g","g","mg","mg","mg","mg","mg","mg","mg","mg","mg","µg","mg","mg","mg","mg","mg","mg","µg","mg","µg","µg","mg","µg","µg","g","g",];
// //
// // let foodids = Foods.find({}).fetch().map(x=>x._id)
// //
// // for (var i = 1; i < foods.length; i++) {
// //   let code,name,nuts=[];
// //   for (prop in foods[i]) {
// //     if (prop == "NDB_No") {
// //       code=foods[i][prop]
// //     } else if (prop == "Shrt_Desc") {
// //       name=foods[i][prop]
// //     } else if (nutcodes.indexOf(prop)>=0){
// //       let index = nutcodes.indexOf(prop);
// //       let nut = {name: nutnames[index],unit:nutunits[index],code:prop,value:foods[i][prop]}
// //       nuts.push(nut)
// //     }
// //   }
// //   // console.log({code,name,nuts})
// //   if (foodids.indexOf(code) == -1) {
// //     Foods.insert({
// //       _id:code,
// //       name,
// //       nuts
// //     })
// //   }
// // }
//
// // });
//
// // https://stackoverflow.com/questions/47631795/meteor-server-response-slow-when-importing-collection/47637432#47637432
//
// // TODO: make food files from food entries in database, to use them in diet.py
// //
// //   for (prop in foods[i]) {
// //     if (prop == "NDB_No") {
// //       code=foods[i][prop]
// //     } else if (prop == "Shrt_Desc") {
// //       name=foods[i][prop]
// //     } else if (nutcodes.indexOf(prop)>=0){
// //       let index = nutcodes.indexOf(prop);
// //       let nut = {name: nutnames[index],unit:nutunits[index],code:prop,value:foods[i][prop]}
// //       nuts.push(nut)
// //     }
