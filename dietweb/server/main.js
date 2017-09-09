import { Meteor } from 'meteor/meteor';

let serverroot2 = "assets/app/"

let serverroot = process.env['METEOR_SHELL_DIR'] + '/../../../private/';

Meteor.startup(() => {
  // code to run on server at startup
  var exec = Npm.require("child_process").exec;
  fs = require('fs');
  var Future = Npm.require("fibers/future");


  Meteor.methods({
    calculate_diet() {
      var future=new Future();
      // this.unblock();
      let command = "python3 "+serverroot2+"diet.py > "+serverroot2+"diet.txt"
      if (!fs.existsSync(serverroot2+"diet.txt")) {

        console.log(command);
        exec(command,function(error,stdout,stderr){
          if(error){
            console.log(error);
            throw new Meteor.Error(500,command+" failed");
          } else {
            console.log("hi");
            let res = fs.readFileSync(serverroot2+"diet.txt").toString().split('\n');
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
        let res = fs.readFileSync(serverroot2+"diet.txt").toString().split('\n')
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
      console.log("val",val);
      return val
    },
      getPreferences() {
        var future=new Future();
        if (!fs.existsSync(serverroot+"guille_preferences.csv")) {
            throw new Meteor.Error(500,"preferences files not found");
            return
        } else {
          let res = fs.readFileSync(serverroot+"guille_preferences.csv").toString().split('\n')
          .map(x=>x.split(","))
          .filter(x=>(x.length === 4))
          .map(x=>({code:x[0].trim(), price:parseFloat(x[1].trim()), min:x[2].trim(), max:x[3].trim()}))
          for (var i = 0; i < res.length; i++) {
            let fileName = res[i].code;
            if (res[i].code[0] === "\"") {
              fileName = fileName.slice(1,-1);
            }
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
        console.log("val",val);
        return val
      },
      writePreferences(prefs) {
        console.log(prefs);
        prefs = prefs[0]
        //TODO: fix ['name'], needs to be number
        let string = prefs.map(x=>([x['code'],x['price'],x['min'],x['max']])).map(x=>x.join(", ")).join("\n")
        console.log(string);
        fs.writeFile(serverroot+"guille_preferences.csv", string, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The preferences file was saved!");
        });
        if (fs.existsSync(serverroot2+"diet.txt")) {
          fs.unlink(serverroot2+"diet.txt");
        }
      }
    });
});
