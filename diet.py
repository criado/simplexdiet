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
        self.usda_id = line[0]
        self.cost    = float(line[1])
        self.lower   = float(line[2]) if line[2]!="None" else 0.0
        self.upper   = float(line[3]) if line[3]!="None" else 100.0 #hardcoded upper limit

        with open('./foods/'+self.usda_id+'.csv', encoding='latin1') as file_food:
            csvlines= [l for l in csv.reader(file_food)]

            self.nutrients= {n.name: float(l[2]) for n in profile
                             for l in csvlines if len(l)>=3 and n.pattern==l[0] and n.unit==l[1]}

            for n in profile:
                if n.name not in self.nutrients:
                    print("warning:", n.name, "missing in", self.usda_id)
# profile is an array of NutrientRequirements
# foods is an array of Food
# Returns the primal solution, dual solution and a handy array of names of equations
def optimizeDiet(profile, foods):
    # We will minimize c'x subject to Gx<=h. Read the docs of cv.solvers.lp

    c= np.array([f.cost for f in foods])
    equations= ([n.name + "<=" + str(n.upper) for n in profile if n.upper is not None] +
                [n.name + ">=" + str(n.lower) for n in profile if n.lower is not None] +
                ["food number " + f.usda_id + "<=" + str(f.upper) for f in foods] +
                ["food number " + f.usda_id + ">=" + str(f.lower) for f in foods])
    h= np.array([ n.upper for n in profile if n.upper is not None] +
                [-n.lower for n in profile if n.lower is not None] +
                [ f.upper for f in foods] +
                [-f.lower for f in foods])
    G= np.array([[ f.nutrients[n.name] for f in foods] for n in profile if n.upper is not None] +
                [[-f.nutrients[n.name] for f in foods] for n in profile if n.lower is not None])
    G= np.concatenate((G, np.eye(len(foods)), -np.eye(len(foods))))

    x= cv.solvers.lp(cv.matrix(c), cv.matrix(G), cv.matrix(h), solver= "glpk")
    return (x['primal objective'], x['x'], x['z'], equations)

def main():
    with open('paco_profile.csv', 'r') as file_profile:
        profile= [NutrientRequirements(line)
                  for line in csv.reader(file_profile, skipinitialspace=True)]

    with open('paco_preferences.csv', 'r') as file_preferences:
        foods= [Food(line, profile)
                for line in csv.reader(file_preferences, skipinitialspace=True)]

    price, x, z, eq= optimizeDiet(profile, foods)
    try:
        for i, food in enumerate(foods):
            print(food.usda_id, x[i])
    except:
        print('no solution found')

if __name__=="__main__":
    main()
