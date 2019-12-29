import solver from 'javascript-lp-solver';

window.solver = solver;

export function beautifyNumber(number) {
    if (number === null || typeof number === "undefined") {
        return number
    }
    let string = number.toString()
    let splitString = string.split(".")
    let charac = splitString[0]
    if (splitString.length <= 1) return charac
    number = parseFloat(string)
    if (charac.length < 4)
        number = number.toFixed(4-charac.length)
        // if (number-Math.floor(number) === 0) {
        //     number = number.toFixed(0)
        // }
        // else if (10*number-Math.floor(10*number) === 0) {
        //     number = number.toFixed(1)
        // }
    else
        number = Math.round(number)

    // let mantissa = charac.length >= 4 ? "" : splitString[1].slice(0,4-charac.length)
    // console.log(parseFloat(charac + "." + mantissa), charac + "." + mantissa)
    // let a = Number(number)
    // return parseFloat(20)
    return parseFloat(number).toString()
}

export async function getFoodInfo(ingPref, nutcodes) {
    const makeUrlStr = (foods) => "ndbno="+foods.join("&ndbno=")+"&type=f&format=json&api_key=HDnNFBlfLWMeNNVU8zIavWrL8VKGIt7GkWgORQaC";

    let foodsIds=Object.keys(ingPref);
    // let foodPrices=ingPref.map(f=>f.price);
    const response = await fetch("https://api.nal.usda.gov/ndb/V2/reports?"+makeUrlStr(foodsIds));
    let data = await response.json()
    let foods = data.foods.map(x=>x.food).filter(x=>x);

    let foodNames = foods.reduce((fns,f)=>{
      fns[f.desc.ndbno]=f.desc.name
      return fns
    },{})

    let foodInfo = foods
        .map(f=>{
          let nutObj = f.nutrients.reduce((ns,n)=>{
            if (nutcodes.indexOf(n.nutrient_id.toString()) !== -1) {
              ns[n.nutrient_id.toString()]=parseFloat(n.value)
              let index = nutcodes.indexOf(n.nutrient_id.toString());
              // if (nutcodes[index][1]!==n.unit) throw Error("Units for nutrient in USDA database doesn't match expected unit")
            }
            return ns
          },{});
          for (let i=0; i<nutcodes.length; i++) {
                  if (!(nutcodes[i] in nutObj)) nutObj[nutcodes[i]]=0;
          }
          nutObj[f.desc.ndbno]=1;
          nutObj["price"] = ingPref[f.desc.ndbno].price
          return {
            "name":f.desc.name,
            "id":f.desc.ndbno,
            "nutrients":nutObj,
            "price":ingPref[f.desc.ndbno].price
            }
          }
        );

      // console.log("HIIIIIIIIIIIIII", foodInfo)

      let foodNuts =
        foodInfo
        .reduce((fs,f,i)=>{
            fs[f.id]=f.nutrients;
            return fs;
          },{});

    foodInfo = foodInfo
      .reduce((fs,f,i)=>{
        fs[f.id]=f;
        return fs;
      },{});

    return {foodNuts,foodInfo, foodNames};
  }

// export async function getNutInfo(nutcodes) {
// let nutInfo = await fetch("https://api.nal.usda.gov/ndb/list?format=json&lt=n&max=1000&api_key=HDnNFBlfLWMeNNVU8zIavWrL8VKGIt7GkWgORQaC")
//     .then(res=>res.json())
//     .then(d=>(d.list.item.reduce((ns,n)=>{
//             if (nutcodes.indexOf(n.id) !== -1) {
//             let index = nutcodes.indexOf(n.id);
//             ns[n.id]={"unit": nutcodes[index][1], "long_name":n.name,"id":n.id}
//             }
//         return ns
//         },{})))
//
// let nutList = nutcodes.map(n=>({"id":n[0],"name":nutInfo[n[0]].long_name,"unit":nutInfo[n[0]].unit}))
// // console.log("HIIIIIIIIIIIIII", nutList2,nutList);
// // nutList.sort((a,b)=>parseInt(a.id)-parseInt(b.id))
//
// return {nutInfo, nutList}
// }

export function solveDiet(foodNuts, nutFoods, ingConst,nutConst, objective) {
    let ingConstProc = {};
    for (let key in ingConst) {
        let obj = ingConst[key];
        let newObj = {};
        if (typeof obj.max !== "undefined") {newObj.max = obj.max;}
        if (typeof obj.min !== "undefined") {newObj.min = obj.min;}
        else {newObj.min = 1e-6;}
        // if (typeof obj.min !== "undefined" || typeof obj.max !== "undefined")
        ingConstProc[key] = newObj;
    }
    let model = {
    "optimize": objective,
    "opType": "min",
    "constraints": {...nutConst, ...ingConstProc},
    "variables": {...foodNuts, ...nutFoods}
    }
    console.log(model)
    return solver.Solve(model)
}

export function getSolNuts(solution,nutFoods,ingPref,nutcodes,foodNuts) {

    let extendedFoodNuts = {...foodNuts, ...nutFoods};

    const parseSolution = sol => {
        if (typeof sol === "undefined") sol = 0;
        return sol
    };

    //NUT AMOUNTS FOR NORMAL FOODS
    let foundNutsNormalFood = [];
    let foodIdsNormaFood = []
    for (let key in solution) {
        if (key !== "feasible" && key !== "bounded" && key!=="result" && (key in ingPref)) {
        let netNuts = [];
        for (let i=0; i<nutcodes.length; i++) {
            netNuts.push(extendedFoodNuts[key][nutcodes[i]]*parseSolution(solution[key]))
        }
        foundNutsNormalFood.push(netNuts)
        foodIdsNormaFood.push(key)
        }
    }

    //NUT AMOUNTS FOR NUTFOODS
    let foundNutsNutFood = [];
    let foodIdsNutFood = []
    for (let key in solution) {
        if (key !== "feasible" && key !== "bounded" && key!=="result" && !(key in ingPref)) {
        let netNuts = [];
        for (let i=0; i<nutcodes.length; i++) {
            netNuts.push(extendedFoodNuts[key][nutcodes[i]]*parseSolution(solution[key]))
        }
        foundNutsNutFood.push(netNuts)
        foodIdsNutFood.push(key)
        }
    }

    //TOTAL NUTRIENTS WITHOUT NUTFOODS
    //exclude nutFoods for nutTot count
    let foundNuts = [];
    for (let key in solution) {
        if (key !== "feasible" && key !== "bounded" && key!=="result" && (key in ingPref)) {
        let netNuts = [];
        for (let i=0; i<nutcodes.length; i++) {
            netNuts.push(extendedFoodNuts[key][nutcodes[i]]*parseSolution(solution[key]))
        }
        foundNuts.push(netNuts)
        }
    }

    // console.log("foundNuts",foundNuts)
    let nutTots = []
    for (let i=0; i<nutcodes.length; i++) {
        nutTots.push(foundNuts.map(x=>x[i]).reduce((a,b)=>a+b))
    }


    //TOTAL NUTRIENTS WITH NUTFOODS
    let foundNutsFake = [];
    for (let key in solution) {
        if (key !== "feasible" && key !== "bounded" && key!=="result") {
        let netNuts = [];
        for (let i=0; i<nutcodes.length; i++) {
            netNuts.push(extendedFoodNuts[key][nutcodes[i]]*parseSolution(solution[key]))
        }
        foundNutsFake.push(netNuts)
        }
    }

    let nutTotsFake = []
    for (let i=0; i<nutcodes.length; i++) {
        nutTotsFake.push(foundNutsFake.map(x=>x[i]).reduce((a,b)=>a+b))
    }


    foundNutsNormalFood = foundNutsNormalFood
    .map(f=>f.map((n,i)=>(nutTots[i] === 0 ? 0: 100*n/nutTots[i])))
    .reduce((fs,f,i)=>{
        fs[foodIdsNormaFood[i]] = f;
        return fs
    },{})

    foundNutsNutFood = foundNutsNutFood
    .map(f=>f.map((n,i)=>(nutTots[i] === 0 ? 0: 100*n/nutTotsFake[i])))
    .reduce((fs,f,i)=>{
        fs[foodIdsNutFood[i]] = f;
        return fs
    },{})

    return {foundNuts:{...foundNutsNormalFood, ...foundNutsNutFood},nutTots}
}
