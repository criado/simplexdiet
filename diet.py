import csv
import cvxopt as cv
import numpy as np

class NutrientRequirements:
    def __init__(self, line):
        self.name, self.unit, self.pattern= line[0:3]
        self.lower = float(line[3]) if line[3]!="None" else 0.0
        self.upper = float(line[4]) if line[4]!="None" else None

class Food:
    def __init__(self, line, profile):
        if line==[]: return

        self.usda_id = line[0]
        self.cost    = float(line[1])
        self.lower   = float(line[2]) if line[2]!="None" else 0.0
        self.upper   = float(line[3]) if line[3]!="None" else 100.0 #hardcoded upper limit

        with open('./foods/'+self.usda_id+'.csv', encoding='latin1') as file_food:
            csvlines= [l for l in csv.reader(file_food)]
            self.name=csvlines[0][0]

            self.nutrients= {n.name: float(l[2]) for n in profile
                             for l in csvlines if len(l)>=3 and n.pattern==l[0] and n.unit==l[1]}

            for nutrient in profile:
                if nutrient.name not in self.nutrients:
                    print("warning:", nutrient.name, "missing in", self.usda_id)

    @staticmethod
    def dummyFoods(profile):
        res=[]
        for n in profile:
            f= Food([],profile)
            f.usda_id= n.name; f.cost = 10000/n.lower if n.lower!=0.0 else 10000
            f.lower  = 0.0;    f.upper= 10000000.0
            f.name= n.name;
            f.nutrients= {n2.name: 1.0 if n2.name==n.name else 0.0 for n2 in profile}
            res.append(f)
            f= Food([],profile)
            f.usda_id= "anti-"+n.name; f.cost = 10000/n.lower if n.lower!=0.0 else 10000
            f.lower  = 0.0;    f.upper= 10000000.0
            f.name= "anti-"+n.name
            f.nutrients= {n2.name: -1.0 if n2.name==n.name else 0.0 for n2 in profile}
            res.append(f)
        return res
# profile is an array of NutrientRequirements
# foods is an array of Food
# Returns the primal solution, dual solution and a handy array of names of equations
c,G,h=(0,0,0)
def optimizeDiet(profile, foods):
    global c,G,h
    # We will minimize c'x subject to Gx<=h. Read the docs of cv.solvers.lp

    foods+=Food.dummyFoods(profile)

    c= np.array([f.cost for f in foods])
    equations= ([n.name + "<=" + str(n.upper) for n in profile if n.upper is not None] +
                [n.name + ">=" + str(n.lower) for n in profile if n.lower is not None] +
                [f.name + " (" + f.usda_id + ") <=" + str(f.upper) for f in foods] +
                [f.name + " (" + f.usda_id + ") >=" + str(f.lower) for f in foods])
    h= np.array([ n.upper for n in profile if n.upper is not None] +
                [-n.lower for n in profile if n.lower is not None] +
                [ f.upper for f in foods] +
                [-f.lower for f in foods])
    G= np.array([[ f.nutrients[n.name] for f in foods] for n in profile if n.upper is not None] +
                [[-f.nutrients[n.name] for f in foods] for n in profile if n.lower is not None])
    G= np.concatenate((G, np.eye(len(foods)), -np.eye(len(foods))))

    x= cv.solvers.lp(cv.matrix(c), cv.matrix(G), cv.matrix(h), solver= "glpk")
    return (x['primal objective'], x['x'], x['z'], equations)

def prettyPrint(price, x, z, eq, profile, foods):
    len0=11; len1=16; len2=4

    foods2=[foods[i] for i in range(len(foods)) if x[i]>1e-5]
    x2= [x[i] for i in range(len(x)) if x[i]>1e-5]

    for i in range(len(foods2)-1, -1, -1):
        print(("%5.1f g"%(x2[i]*100)).rjust(len0+(i-1)*4),end='')
        print((foods2[i].name).rjust(len1+8)+"│"+(" "*(len2-1)+"│")*(len(foods2)-i-1))

    print("─"*(len0+len1+1)+("─"*(len2-1)+"┼")*len(foods2))

    totals=[]
    for n in profile:
        totals.append(sum(f.nutrients[n.name]*x2[i] for i,f in enumerate(foods2)))
        print(("%6.1f %s"%(totals[-1], n.unit)).ljust(len0), end='')
        print(n.name.rjust(len1), end=':')
        for i, f in enumerate(foods2):
            s=("%3.0f"% (f.nutrients[n.name]*x2[i]*100/totals[-1]))
            print("   " if s=="  0" else s, end='│')
        print("")

    print("")
    print("Weights of nutrients (in euros) and dual costs")

    eye_nutrients=np.eye(len(profile))
    A= np.array([ eye_nutrients[i] for i in range(len(profile)) if profile[i].upper is not None]+
                [-eye_nutrients[i] for i in range(len(profile)) if profile[i].lower is not None]+
                [np.zeros(len(profile)) for f in foods] +
                [np.zeros(len(profile)) for f in foods])
    z= np.array(z)
    weights= list(np.dot(A.transpose(), -z)[:,0])
    duals= sorted([(profile[i].name, weights[i], weights[i]*totals[i]) for i in range(len(profile)) if weights[i]!=0.0], key= lambda x: -x[2])

    for (a,b,c) in duals:
        print(a.ljust(len1),("%6.5f"%b).rjust(8), ("%6.5f"%c).rjust(8))

    #duals=sorted([(eq[i],z[i]*h[i], z[i]) for i in range(len(eq)) if z[i]*h[i]!=0],key=lambda x: x[1])

    print("")
    print("Primal costs")
    primals=sorted([(foods2[i].cost*x2[i], x2[i], foods2[i].name) for i in range(len(foods2))])
    for (a,b,c) in primals:
        print(c.ljust(45), "%6.5f"%a)

price, x, z, eq=(0,0,0,0)
def main():
    global price, x, z, eq
    with open('paco_profile.csv', 'r') as file_profile:
        profile= [NutrientRequirements(line)
                  for line in csv.reader(file_profile, skipinitialspace=True)]

    with open('paco_preferences.csv', 'r') as file_preferences:
        foods= [Food(line, profile)
                for line in csv.reader(file_preferences, skipinitialspace=True)]

    price, x, z, eq= optimizeDiet(profile, foods)
    print("price", price)
    try:
        prettyPrint(price,x,z,eq, profile, foods)
       # for i, food in enumerate(foods):
       #     if (x[i] > 1e-5):
       #         print("%.2f" % x[i], food.name )
    except:
        print('no solution found')

if __name__=="__main__":
    main()
