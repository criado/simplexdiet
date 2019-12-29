import pandas as pd
import numpy as np
d=pd.read_csv("foods/food_database.csv")

# Calories          0.00128  2.91873
# Niacin            0.12776  2.04416
# Calcium           0.00190  1.89970
# Cholesterol       0.00130  0.39032
# Sodium            0.00000  0.00000
# A-Linoleic Acid  -0.01021 -0.01650
# Manganese        -0.02020 -0.22219
# Linoleic Acid    -0.06441 -1.10591

codes = ["208","406","301","601","307","619","315","618"]

d["dualcost"]=d["208"]*0.00128+d["406"]*0.12776+d["301"]*0.00190+d["601"]*0.00130+d["307"]*0.00000+d["619"]*(-0.01021)+d["315"]*(-0.02020)+d["618"]*(-0.06441)

pd.set_option('display.max_rows', len(d))
print(d.dropna(subset=['dualcost']).sort_values("dualcost",ascending=False)[["Shrt_Desc", "dualcost"]][:100])
pd.reset_option('display.max_rows')

[d.loc[8734][x]/np.mean(d[x]) for x in codes]

d.loc[8734]["307"]/np.mean(d["307"])

d[d["Shrt_Desc"].str.contains("CAVIAR")]
