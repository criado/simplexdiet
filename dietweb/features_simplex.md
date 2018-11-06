+ Al escribir en los campos creo que seria más intuitivo para el usuario que se redondease solo cuando el texto dejase de estar en el foco (el cursor en él) o cuando se presionase intro

+ Añadir a la tabla otros nutrientes que están en la usda pero no por defecto. (Para más adelante quizás añadir también que puedas añadir nuevas características de la comida (como nutrientes que no están en la usda o tiempo de cocinado etc)). Quizá tener dos o tres perfiles de nutrientes por defecto (como el que tenemos ahora o uno que sea solo macronutrientes etc)


# Bugs

+ El orden del perfil por defecto es incorrecto.

+ Cuando se añade un ingrediente sigue apareciendo el nombre de éste en la barra de búsqueda, si pones el cursor ahí sigue apareciendo y no se borra hasta que escribes el primer caracter (de hecho si borras ese caracter sigue apareciendo). De hecho si escribes algo y no seleccionas nada y luego pones el foco en otro sitio de la página o en otra pestaña/ventana, lo que has escrito se borra

+ Que guardar por primera vez la dieta con tu nombre sea el botón de fork diet es un poco antiintuitivo. Que el texto del botón cambie dependiendo de si para el usuario significa que forkeas una dieta o de si lo que estás haciendo en realidad es guardarla

+ A Hussein no le salía que le faltase vitamina D. También, no se le añadía el sweet potato

+ No dejar añadir alimentos repetidos

+ borrar tus dietas o cambiarles el nombre

+ cuando se cambia el orden no se cambia el estado de "has_changed", x lo q no se puede guardar el reordering sin hacer otro cambio a la dieta

+ En custom foods (btw, no sale como una url aparte cuando clicas en el botón), poner "Food name" en vez de name

+ con Paula no sé qué pasó que de repente desapareció un ingrediente de la tabla y luego lo añadimos de nuevo y salió dos veces.

+ Añadir comida calcular, eliminar calcular. Bug, simplexdiet hace como que aún está la comida. Recalcular, todo va bien

+ (not really a bug) En el ordenador de Paula había que redimensionar la pantalla en el simplex diet porque tenía menos resolución y no se ajustaba el ancho a la pantalla

+ Antes de loguearme, con la dieta de prueba me salía el Oh snap! No feasible primal solution! ni idea de por qué

---
# Necesario

+ Que la búsqueda de alimentos te dé aquellos que contengan todas las palabras que buscas, no que tengan el substring que buscas https://stackoverflow.com/a/42554482/2145714

+ Si algún ingrediente no tiene información sobre un nutriente de tu profile estaría bien poner una interrogación o un "-" en la parte de la tabla correspondiente (quizá con un mouse hover text diciendo que eso quiere decir que no tenemos datos de eso

+ Poder guardar varias dietas y profiles, ponerles nombres, que haya un par de profiles por defecto. Tener un historial de las últimas 10 ejecuciones o así de la simplex diet y que puedas ir para atrás y para adelante

+ Poner 4 cifras significativas everywhere (sin poner los .0 y los 0's a la izquierda).

+ Creo que también estaria bien que aparte de cómo se pueden manejar los precios ahora mismo que se le pueda dar a un sitio y que aparezca una columna con todos los precios para editar

+ Habrá que ver alguna manera para añadir otros nutrientes a los campos posibles de crear nueva comida

+ Documentación

    - Cuando hagamos la documentación, decir que el magnesio, que no tiene límite superior, sí que tiene un límite superior con respecto al ingerido por fármacos

+ Buscador de ingredientes por densidad de un nutriente.

---
# Estaría guay hacerlo

+ Agrupar los ingredientes por comidas. Que te diga el peso total y las calorías de cada comida. ¿Poder splitear un ingrediente para ponerlo en varias comidas? (y que cuando indiques la cantidad de una de esas dos (o más) partes te ajuste otra para que la suma total sea la buena?).

+ Poder comparar una ejecución y la anterior fácilmente e incluso poder comparar dos ejecuciones del historial de los mismos ingredientes con distintos parametros.

+ Poder poner restricciones sobre el porcentaje calórico de carbs grasas y proteínas? Es una restricción lineal... En general poder poner restricciones lineales (se podría empezar por poner simplemente algunas en el código como la de los ácidos grasos omega 3 y 6 y las cosas de energía

+ Que otros puedan buscar tus dietas. (enlace público con el que puedas compartir tu dieta?) 

+ Poder crear recetas

+ Traducir la base de datos con google translate

---
# Poco prioritario

+ Poder editar a mano los valores de los ingredientes que han salido de la dieta y que te diga la deficiencias o excesos nutricionales?

+ Valores duales

---

En add nutrient faltan las cosas que no están en las cosas estándares que usamos.


"203"	"g"	"Protein"
"204"	"g"	"Total lipid (fat)"
"205"	"g"	"Carbohydrate, by difference"
"207"	"g"	"Ash"
"208"	"kcal"	"Energy"
"209"	"g"	"Starch"
"210"	"g"	"Sucrose"
"211"	"g"	"Glucose (dextrose)"
"212"	"g"	"Fructose"
"213"	"g"	"Lactose"
"214"	"g"	"Maltose"
"221"	"g"	"Alcohol, ethyl"
"255"	"g"	"Water"
"257"	"g"	"Adjusted Protein"
"262"	"mg"	"Caffeine"
"263"	"mg"	"Theobromine"
"268"	"kJ"	"Energy"
"269"	"g"	"Sugars, total"
"287"	"g"	"Galactose"
"291"	"g"	"Fiber, total dietary"
"301"	"mg"	"Calcium, Ca"
"303"	"mg"	"Iron, Fe"
"304"	"mg"	"Magnesium, Mg"
"305"	"mg"	"Phosphorus, P"
"306"	"mg"	"Potassium, K"
"307"	"mg"	"Sodium, Na"
"309"	"mg"	"Zinc, Zn"
"312"	"mg"	"Copper, Cu"
"313"	"microg"	"Fluoride, F"
"315"	"mg"	"Manganese, Mn"
"317"	"microg"	"Selenium, Se"
"318"	"IU"	"Vitamin A, IU"
"319"	"microg"	"Retinol"
"320"	"microg"	"Vitamin A, RAE"
"321"	"microg"	"Carotene, beta"
"322"	"microg"	"Carotene, alpha"
"323"	"mg"	"Vitamin E (alpha-tocopherol)"
"324"	"IU"	"Vitamin D"
"325"	"microg"	"Vitamin D2 (ergocalciferol)"
"326"	"microg"	"Vitamin D3 (cholecalciferol)"
"328"	"microg"	"Vitamin D (D2 + D3)"
"334"	"microg"	"Cryptoxanthin, beta"
"337"	"microg"	"Lycopene"
"338"	"microg"	"Lutein + zeaxanthin"
"341"	"mg"	"Tocopherol, beta"
"342"	"mg"	"Tocopherol, gamma"
"343"	"mg"	"Tocopherol, delta"
"344"	"mg"	"Tocotrienol, alpha"
"345"	"mg"	"Tocotrienol, beta"
"346"	"mg"	"Tocotrienol, gamma"
"347"	"mg"	"Tocotrienol, delta"
"401"	"mg"	"Vitamin C, total ascorbic acid"
"404"	"mg"	"Thiamin"
"405"	"mg"	"Riboflavin"
"406"	"mg"	"Niacin"
"410"	"mg"	"Pantothenic acid"
"415"	"mg"	"Vitamin B-6"
"417"	"microg"	"Folate, total"
"418"	"microg"	"Vitamin B-12"
"421"	"mg"	"Choline, total"
"428"	"microg"	"Menaquinone-4"
"429"	"microg"	"Dihydrophylloquinone"
"430"	"microg"	"Vitamin K (phylloquinone)"
"431"	"microg"	"Folic acid"
"432"	"microg"	"Folate, food"
"435"	"microg"	"Folate, DFE"
"454"	"mg"	"Betaine"
"501"	"g"	"Tryptophan"
"502"	"g"	"Threonine"
"503"	"g"	"Isoleucine"
"504"	"g"	"Leucine"
"505"	"g"	"Lysine"
"506"	"g"	"Methionine"
"507"	"g"	"Cystine"
"508"	"g"	"Phenylalanine"
"509"	"g"	"Tyrosine"
"510"	"g"	"Valine"
"511"	"g"	"Arginine"
"512"	"g"	"Histidine"
"513"	"g"	"Alanine"
"514"	"g"	"Aspartic acid"
"515"	"g"	"Glutamic acid"
"516"	"g"	"Glycine"
"517"	"g"	"Proline"
"518"	"g"	"Serine"
"521"	"g"	"Hydroxyproline"
"573"	"mg"	"Vitamin E, added"
"578"	"microg"	"Vitamin B-12, added"
"601"	"mg"	"Cholesterol"
"605"	"g"	"Fatty acids, total trans"
"606"	"g"	"Fatty acids, total saturated"
"607"	"g"	"4:0"
"608"	"g"	"6:0"
"609"	"g"	"8:0"
"610"	"g"	"10:0"
"611"	"g"	"12:0"
"612"	"g"	"14:0"
"613"	"g"	"16:0"
"614"	"g"	"18:0"
"615"	"g"	"20:0"
"617"	"g"	"18:1 undifferentiated"
"618"	"g"	"18:2 undifferentiated"
"619"	"g"	"18:3 undifferentiated"
"620"	"g"	"20:4 undifferentiated"
"621"	"g"	"22:6 n-3 (DHA)"
"624"	"g"	"22:0"
"625"	"g"	"14:1"
"626"	"g"	"16:1 undifferentiated"
"627"	"g"	"18:4"
"628"	"g"	"20:1"
"629"	"g"	"20:5 n-3 (EPA)"
"630"	"g"	"22:1 undifferentiated"
"631"	"g"	"22:5 n-3 (DPA)"
"636"	"mg"	"Phytosterols"
"638"	"mg"	"Stigmasterol"
"639"	"mg"	"Campesterol"
"641"	"mg"	"Beta-sitosterol"
"645"	"g"	"Fatty acids, total monounsaturated"
"646"	"g"	"Fatty acids, total polyunsaturated"
"652"	"g"	"15:0"
"653"	"g"	"17:0"
"654"	"g"	"24:0"
"662"	"g"	"16:1 t"
"663"	"g"	"18:1 t"
"664"	"g"	"22:1 t"
"665"	"g"	"18:2 t not further defined"
"666"	"g"	"18:2 i"
"669"	"g"	"18:2 t,t"
"670"	"g"	"18:2 CLAs"
"671"	"g"	"24:1 c"
"672"	"g"	"20:2 n-6 c,c"
"673"	"g"	"16:1 c"
"674"	"g"	"18:1 c"
"675"	"g"	"18:2 n-6 c,c"
"676"	"g"	"22:1 c"
"685"	"g"	"18:3 n-6 c,c,c"
"687"	"g"	"17:1"
"689"	"g"	"20:3 undifferentiated"
"693"	"g"	"Fatty acids, total trans-monoenoic"
"695"	"g"	"Fatty acids, total trans-polyenoic"
"696"	"g"	"13:0"
"697"	"g"	"15:1"
"851"	"g"	"18:3 n-3 c,c,c (ALA)"
"852"	"g"	"20:3 n-3"
"853"	"g"	"20:3 n-6"
"855"	"g"	"20:4 n-6"
"856"	"g"	"18:3i"
"857"	"g"	"21:5"
"858"	"g"	"22:4"
"859"	"g"	"18:1-11 t (18:1t n-7)"


