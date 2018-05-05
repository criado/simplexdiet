import solver from 'javascript-lp-solver';

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

    let foundNutsAll = [];
    let foodIds = []
    for (let key in solution) {
        if (key !== "feasible" && key !== "bounded" && key!=="result") {
        let netNuts = [];
        for (let i=0; i<nutcodes.length; i++) {
            netNuts.push(extendedFoodNuts[key][nutcodes[i]]*parseSolution(solution[key]))
        }
        foundNutsAll.push(netNuts)
        foodIds.push(key)
        }
    }

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

    foundNutsAll = foundNutsAll
    .map(f=>f.map((n,i)=>100*n/nutTots[i]))
    .reduce((fs,f,i)=>{
        fs[foodIds[i]] = f;
        return fs
    },{})
    return {foundNuts:foundNutsAll,nutTots}
}
