import { FoodCategory } from '../types';

export const composicionAlimentosData: FoodCategory[] = [
    {
        title: "2.1 Leche y Derivados",
        headers: [
            "Nutriente / Factor Dietético",
            "Leche materna¹", "Leche de Burra¹", "Leche de cabra con vit D¹", "Leche fluida entera¹", "Leche fluida semidescremada¹",
            "Leche entera con sabor¹", "Leche semidescremada con sabor¹", "Leche semidescremada con sabor choco¹", "Leche semidescremada con sabor frutilla¹",
            "Leche semidescremada sin lactosa¹", "Leche descremada (A)²", "Leche descremada (B)²", "Leche en polvo 26% MG³", "Leche en polvo 26% MG con Vit D³",
            "Leche en polvo 18% MG extra calcio³", "Leche en polvo 12% MG³", "Leche en polvo descremada³", "Leche en polvo descremada extra calcio³", "Leche en polvo purita cereal³",
            "Leche condensada descremada³", "Leche evaporada descremada³", "Quesillo¹", "Quesillo 0% MG", "Quesillo sin sal²",
            "Queso cabeza³", "Queso chanco¹", "Queso cheddar¹", "Queso cheso¹", "Queso crema¹",
            "Queso fresco³", "Queso fresco light³", "Queso gouda (A)¹", "Queso gouda (B)¹",
            "Queso mantecoso³", "Queso mozzarella³", "Queso parmesano¹", "Queso parmesano-pategras³",
            "Queso reggianito³", "Queso suizo¹", "Queso untable³", "Ricota¹",
            "Yogurt natural¹", "Yogurt con sabor²", "Yogurt light¹", "Yogurt sin lactosa³",
            "Yogurt con frutas²", "Yogurt con frutas bajo en grasa¹", "Yogurt con frutas sin lactosa³", "Tofu (A)¹", "Tofu (B)¹"
        ],
        data: [
            ["Energía (kcal)", 70, 41, 69, 64, 58, 80, 42, 78, 52, 44, 32, 42, 499, 496, 454, 406, 358, 343, 454, 331, 134, 103, 85, 's/i', 164, 356, 404, 360, 218, 223, 177, 193, 356, 341, 394, 199, 476, 420, 394, 339, 393, 303, 174, 61, 101, 56, 63, 114, 136, 95, 78, 95],
            ["Humedad (g)", 87.5, 90.4, 87, 87.7, 88.1, 80, 90.2, 82.2, 's/i', 's/i', 89.9, 's/i', 3.2, 2.5, 5.4, 's/i', 4, 's/i', 3.8, 27.2, 74, 79, 's/i', 's/i', 45.5, 42.8, 37, 52.8, 61.6, 61.7, 's/i', 65.5, 41.5, 42.7, 33.1, 66.7, 40.3, 23.7, 37.9, 35.9, 37.6, 50, 71.7, 87.9, 77.1, 85.5, 86, 73.8, 73.8, 85, 82.9, 76.4],
            ["Cenizas (g)", 0.2, 0.4, 0.8, 0.7, 0.6, 0.8, 0.8, 0.8, 's/i', 's/i', 's/i', 's/i', 6.2, 6.1, 's/i', 's/i', 5.8, 's/i', 6.4, 1.8, 1.6, 's/i', 's/i', 's/i', 2.9, 3.3, 3.7, 1.3, 3.5, 2.7, 's/i', 1.6, 3.9, 3, 2.9, 2.4, 4.7, 3.8, 3.9, 4.8, 3.8, 1.7, 1, 0.7, 0.9, 1.2, 3, 0.8, 1, 0.5, 1, 0.5],
            ["Proteínas (g)", 1, 1.6, 3.6, 3.3, 3.2, 2.4, 2.8, 3, 's/i', 's/i', 3.4, 3.4, 26.6, 25.3, 26.1, 's/i', 26.1, 's/i', 19.4, 7.3, 6.6, 12.5, 13, 's/i', 21, 22.8, 24.5, 25, 3.5, 16.9, 12.6, 13.8, 24.9, 24.8, 29, 24.7, 13.5, 47.1, 28.4, 25.7, 21.1, 27, 24.4, 13, 3.5, 4.4, 4.2, 5.7, 3, 4.1, 4.9, 3, 9, 10.4],
            ["H de C disp. (g)", 4.9, 6.7, 4.5, 4.7, 5.1, 10.5, 11.5, 9.6, 's/i', 's/i', 4.7, 5, 38.7, 38.4, 42.7, 's/i', 52.2, 's/i', 51.2, 54.4, 10, 3.7, 4.4, 1.5, 0.1, 0.1, 0.5, 3.8, 's/i', 1.6, 4.8, 3.2, 2.2, 's/i', 8, 1.3, 5.5, 's/i', 13.9, 2.3, 5.9, 1.5, 3.3, 1, 4.7, 14.9, 7.7, 9.1, 16.2, 18.2, 18.1, 's/i', 0.6, 0.4],
            ["Azúcares totales (g)", 6.9, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 6, 's/i', 's/i', 5.2, 's/i', 's/i', 's/i', 's/i', 's/i', 52.8, 's/i', 36.8, 0, 0, 0, 's/i', 0, 0, 0, 's/i', 's/i', 0, 's/i', 0, 0, 's/i', 0, 0, 's/i', 's/i', 0, 's/i', 0, 0, 0, 0.3, 's/i', 7.7, 's/i', 2, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Fibra dietética total (g)", 0, 0, 0, 0, 's/i', 0, 0.7, 's/i', 's/i', 's/i', 0, 's/i', 's/i', 0, 's/i', 's/i', 0, 's/i', 1.7, 8.7, 's/i', 0, 0, 's/i', 0, 0, 0, 0, 's/i', 0, 's/i', 's/i', 's/i', 's/i', 0, 's/i', 's/i', 's/i', 's/i', 's/i', 0, 0, 0, 's/i', 's/i', 0.2, 's/i', 0.2, 0.3, 0, 0, 0.9, 's/i'],
            ["Lípidos totales (g)", 4.4, 0.9, 4.1, 3.7, 2.8, 2.9, 1.3, 1.9, 1.8, 1.3, 0.1, 0.6, 26.3, 25.8, 17.9, 's/i', 0.7, 's/i', 19.1, 7.6, 4.3, 4.5, 's/i', 's/i', 29.3, 28, 28.3, 24.4, 10.3, 17.3, 12.1, 13, 27.4, 24.7, 29.3, 15.1, 29.5, 27.8, 31.2, 20.8, 31, 24.4, 16, 8.3, 4.7, 3.3, 2.7, 0.2, 1.73, 0.9, 0.6, 4.2, 2.4],
            ["Ac grasos sat (g)", 2.31, 's/i', 2.67, 2.28, 1.09, 1.84, 's/i', 1.16, 1.1, 0.83, 0.01, 0.28, 16.19, 16.74, 11.46, 's/i', 0.44, 's/i', 8.3, 4.39, 2.34, 1.29, 's/i', 's/i', 43.64, 18.44, 18.27, 20.1, 7.82, 11.37, 's/i', 's/i', 17.64, 15.55, 18.93, 9.46, 's/i', 15.37, 19.97, 13, 18.23, 16, 8.9, 's/i', 2.1, 1.73, 's/i', 0.12, 0.1, 1.28, 0.93, 0.06, 0.79, 's/i'],
            ["Ac grasos monoinsat (g)", 1.66, 's/i', 1.11, 1.06, 0.96, 0.67, 's/i', 0.46, 0.52, 0.35, 0.01, 0.03, 7.62, 7.92, 5.12, 's/i', 0.19, 's/i', 8.3, 2.43, 1.23, 1.29, 's/i', 's/i', 6.81, 8.32, 9.25, 8.91, 3.94, 's/i', 's/i', 's/i', 7.64, 5.55, 8.02, 's/i', 's/i', 7.18, 9.76, 5.51, 8.05, 7.59, 3.63, 's/i', 0.86, 's/i', 's/i', 0.08, 's/i', 0.56, 0.39, 0.1, 1.13, 's/i'],
            ["Ac grasos poliinsat (g)", 0.5, 's/i', 0.15, 0.14, 0.12, 0.15, 's/i', 0.09, 0.05, 0.03, 0.01, 0.03, 1.44, 0.67, 0.63, 's/i', 0.07, 's/i', 2.9, 0.14, 0.25, 0.14, 's/i', 's/i', 0.71, 0.44, 1.42, 1.48, 's/i', 0.17, 0.3, 's/i', 0.66, 0.5, 0.66, 0.9, 's/i', 's/i', 0.5, 's/i', 1.08, 1.6, 's/i', 's/i', 0.09, 's/i', 's/i', 0.01, 's/i', 0.16, 0.04, 0.01, 1.65, 's/i'],
            ["Ac grasos trans (g)", 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0.1, 0.1, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0.3, 's/i', 's/i', 's/i', 0.006, 's/i', 's/i', 0.9, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0.5, 0.9, 0.4, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0, 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Colesterol (mg)", 13, 10, 10.2, 14, 13.5, 6.1, 's/i', 5.4, 6, 5, 0, 5, 80, 97, 34, 's/i', 18, 's/i', 53.8, 26, 19, 14.9, 's/i', 's/i', 70, 89, 101, 107, 58.3, 61, 39, 's/i', 110, 105, 83.2, 44.9, 's/i', 86, 110, 271, 93, 44.7, 51, 13.5, 's/i', 2, 's/i', 5, 6, 2.8, 0, 's/i']
        ]
    },
    {
        title: "2.2 Huevos",
        headers: [
            "Nutriente / Factor Dietético",
            "Huevo entero¹", "Clara de huevo¹", "Yema de huevo¹", "Huevo de codorniz¹"
        ],
        data: [
            ["Energía (kcal)", 143, 52, 322, 158],
            ["Humedad (g)", 76.2, 87.6, 52.3, 74.4],
            ["Cenizas (g)", 1.1, 0.6, 1.7, 1.1],
            ["Proteínas (g)", 12.6, 10.9, 15.9, 13.1],
            ["H de C disp. (g)", 1.7, 0.7, 3.6, 0.4],
            ["Azúcares totales (g)", 0.4, 0.7, 0.6, 0.4],
            ["Fibra dietética total (g)", 0, 0, 0, 0],
            ["Lípidos totales (g)", 9.5, 0.2, 26.5, 11.1],
            ["Ac grasos sat (g)", 3.13, 0, 8.95, 3.56],
            ["Ac grasos monoinsat (g)", 3.66, 0, 11.74, 4.32],
            ["Ac grasos poliinsat (g)", 1.91, 0, 4.2, 1.32],
            ["Ac grasos trans (g)", 's/i', 's/i', 's/i', 's/i'],
            ["Colesterol (mg)", 372, 0, 1085, 844],
            ["Vitamina A (ug EAR)", 160, 0, 381, 156],
            ["Vit C (mg)", 0, 0, 0, 0],
            ["Vit D (ug)", 2, 0, 5.4, 1.4],
            ["Vit E (mg ET)", 1.1, 0, 2.6, 1.1],
            ["Vit K (ug)", 0.3, 0, 0.7, 0.3],
            ["Vit B₁ (mg)", 0, 's/i', 0.2, 0.1],
            ["Vit B₂ (mg)", 0.5, 0.4, 0.6, 0.8],
            ["Niacina (mg EN)", 0.1, 0.1, 0, 0.2],
            ["Vit B₆ (mg)", 0.2, 0, 0.4, 0.2],
            ["Ac pantoténico (mg)", 1.5, 0.2, 3, 1.8],
            ["Vit B₁₂ (ug)", 0.9, 0.1, 2, 1.6],
            ["Folatos (ug EFA)", 47, 1, 146, 66],
            ["Sodio (mg)", 142, 166, 48, 141],
            ["Potasio (mg)", 138, 163, 109, 132],
            ["Calcio (mg)", 56, 7, 129, 64],
            ["Fósforo (mg)", 198, 15, 390, 226],
            ["Magnesio (mg)", 12, 11, 5, 13],
            ["Hierro (mg)", 1.8, 0.1, 2.7, 3.7],
            ["Zinc (mg)", 1.3, 0, 2.3, 1.5],
            ["Cobre (mg)", 0.1, 0, 0.1, 0.1],
            ["Selenio (ug)", 30.7, 6, 56, 32]
        ]
    },
    {
        title: "2.3 Carnes y Vísceras",
        headers: [
            "Nutriente / Factor Dietético", "Pollo cocido¹", "Pollo pierna²", "Pollo pechuga²", "Pollo pechuga deshuesado³", "Pato cocido¹", "Pavo pierna²", "Pavo roslizado¹", "Carne de cerdo¹", "Cazuela de cerdo¹", "Lomito de cerdo¹", "Pierna de cerdo marinada³", "Chuleta de cerdo centro marinada³", "Chuleta de cerdo vetado marinada³", "Costillar de cerdo³", "Costillar de cerdo marinado³", "Filete de cerdo³", "Pulpa de cerdo²", "Cazuela de cordero¹", "Chuleta de cordero¹", "Pulpa de cordero¹", "Conejo³", "Conejo¹", "Conejo horneado¹", "Filete¹", "Guachalomo¹", "Lomo centro marinado³", "Lomo liso³", "Lomo vetado²", "Asiento picana¹", "Plateada³", "Pollo ganso¹", "Posta negra²", "Posta rosada²", "Cazuela de vacuno¹", "Carne vacuno¹ MG", "Carne vacuno 5% MG¹", "Carne vacuno 10% MG¹", "Guatita¹", "Molleja o cuore de pollo cocido¹", "Corazón de vacuno cocido¹", "Riñon de vacuno cocido¹", "Criadillas de vacuno²", "Arrollado de huaso³", "Proteína de soya (carne vegana)³", "Charqui de vacuno³", "Choricillo cocido¹", "Chorizo³", "Hígado de cordero cocido¹", "Hígado de vacuno cocido¹,³", "Hígado de vacuno cocido¹,³", "Lengua de vacuno¹", "Lengua de vacuno cocida¹", "Ubre³", "Jamón de cerdo ahumado¹", "Jamón cerdo extra magro³", "Jamón crudo¹", "Jamón pavo²", "Jamón de pavo ahumado¹", "Jamón pavo acaramelado³", "Jamón picado¹", "Longaniza¹", "Mortadela¹", "Nugget de pollo¹", "Paté³", "Paté¹", "Pechuga pavo ahumado¹", "Pechuga pavo cocida¹", "Pechuga de pavo cocida¹,³", "Pechuga de pavo cocida³,¹", "Pepperoni¹", "Pernil³", "Prieta¹", "Prieta¹", "Queso cabeza¹", "Queso cabeza³", "Salame¹", "Salame¹,³", "Seso cocido¹", "Tocino¹", "Turin³", "Vienesa¹", "Vienesa de Pavo¹", "Vienesa de Pollo³"
        ],
        data: [
            ["Energía (kcal)", 178, 199, 130, 114, 201, 123, 189, 293, 264, 90, 164, 284, 312, 210, 209, 129, 132, 152, 201, 144, 109, 136, 197, 124, 126, 116, 145, 137, 123, 134, 116, 130, 127, 145, 138, 174, 176, 96, 146, 165, 144, 96, 403, 350, 382, 212, 405, 220, 167, 191, 244, 284, 162, 180, 113, 212, 124, 118, 83, 263, 397, 346, 311, 429, 462, 89, 93, 126, 101, 504, 206, 253, 379, 359, 426, 426, 151, 517, 261, 299, 250, 235, 226],
            ["Humedad (g)", 66.2, 69.2, 73.2, 72.3, 64.2, 73.7, 63.5, 53.4, 56.1, 79.7, 71.1, 59.3, 56.1, 64.9, 66, 72.8, 71.9, 70.6, 63.6, 69.6, 73.2, 72.8, 69.8, 72.7, 71.8, 70.4, 70, 70.8, 72, 72.4, 73.2, 70.7, 70.8, 70.1, 70.7, 64.8, 69, 81.4, 86, 64.9, 68.8, 84, 38.4, 's/i', 7.3, 64.9, 43, 56.7, 66.8, 58.8, 55.8, 57.8, 74, 65.3, 73.4, 44, 72.6, 73.5, 77.7, 57.6, 45, 51.1, 52.3, 56.3, 42.3, 37, 77.4, 76.9, 70.9, 74.9, 28.6, 63.6, 61.3, 47.3, 45.8, 66, 's/i', 60, 74.9, 21.6, 52.6, 's/i', 63.1, 's/i'],
            ["Cenizas (g)", 0.8, 0.9, 0.7, 1.7, 1.1, 1, 1, 0.9, 0.7, 1.6, 1.3, 1, 0.9, 1.9, 1.1, 0.9, 0.9, 1, 0.7, 0.7, 1.2, 0.7, 1, 1.1, 1, 1.2, 0.8, 1.2, 0.9, 1, 0.6, 0.8, 0.6, 0.8, 1, 1, 0.9, 1, 0.6, 0.7, 0.7, 1, 1.1, 's/i', 's/i', 7.3, 2.9, 1.7, 1.2, 3.7, 2.1, 2.4, 1.1, 1.1, 1.2, 3.7, 2.1, 2.8, 7.3, 2.9, 3, 2.9, 1.9, 's/i', 4, 3.7, 2.9, 1.3, 42.3, 3.1, 2.8, 2.7, 2.1, 2.1, 4.7, 1.2, 2.1, 2.3, 1.9, 2.6, 's/i', 3.3, 1.5, 4.3, 3.4, 's/i', 1.8, 's/i'],
            ["Proteínas (g)", 27.3, 22.4, 22.3, 22.2, 23.3, 22, 28.6, 25.1, 20.6, 18.3, 16.6, 13.7, 14.1, 18.5, 17.2, 19.2, 19.2, 20.6, 18.8, 20.4, 19.4, 20.1, 29.1, 21.2, 23.2, 20.4, 23, 21.8, 21.4, 20.3, 22.2, 23.6, 21.2, 22.5, 23.6, 21.6, 20, 14.6, 27, 26.9, 25.6, 13.1, 27.4, 15, 28, 15.2, 13.7, 30.6, 24.5, 29.1, 20.1, 19.3, 1.2, 18.5, 20.1, 20.6, 19.6, 16.2, 17.9, 16.3, 14, 14.3, 16.4, 10.7, 11.5, 13.4, 14.4, 16.4, 21.2, 19.2, 13.9, 6.1, 14.6, 15.6, 15.6, 's/i', 14.5, 12.6, 11.7, 29.1, 18.8, 14.2, 12.1, 1.6, 3.5],
            ["H de C disp. (g)", 0, 1.8, 1.7, 1.5, 0, 1.2, 0.1, 0, 4.4, 0.3, 0.1, 0.1, 0.2, 0.1, 0.1, 0.2, 1.8, 0.2, 5.3, 's/i', 's/i', 's/i', 's/i', 0, 0, 0.3, 0.8, 1.3, 2.4, 0.9, 1.1, 1.8, 4.3, 's/i', 's/i', 0, 0, 0.6, 27.1, 0.1, 1, 0.6, 0.2, 0.2, 0, 0.4, 5, 2.5, 0.9, 5.1, 's/i', 's/i', 0, 's/i', 1.3, 's/i', 2.9, 3, 0.4, 1.8, 2.1, 0.6, 3.1, 17.5, 11.9, 4.7, 1.2, 2.7, 1.4, 2.2, 1.2, 0.9, 6.1, 1.3, 6.9, 0, 0.1, 1.9, 1.6, 0.8, 3.5, 0.5, 's/i', 1],
            ["Azúcares totales (g)", 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 5, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 1.2, 1.1, 's/i', 's/i', 's/i', 's/i', 4.7, 's/i', 's/i', 's/i', 1, 0, 's/i', 's/i', 's/i', 's/i', 0.5, 's/i', 's/i', 0.8, 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Fibra dietética total (g)", 0, 0, 0, 's/i', 0, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 3, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 20.7, 's/i', 's/i', 's/i', 14.4, 's/i', 0.9, 's/i', 1.3, 's/i', 's/i', 's/i', 's/i', 's/i', 34.5, 's/i', 's/i', 's/i', 's/i', 0, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Lípidos totales (g)", 6.7, 11.5, 3.8, 1.9, 11.2, 3.3, 7.4, 18.2, 18.2, 1, 10.1, 25, 28.1, 15.5, 15.5, 4.4, 4.9, 11.6, 11.6, 4.8, 3.3, 5.6, 8.1, 3.9, 3.8, 3.7, 5.6, 4.9, 3.1, 2.5, 2.5, 3.1, 2.8, 5.8, 3.1, 5.6, 10, 4, 3.7, 2.9, 3.4, 1.2, 32.4, 8, 8, 16.6, 36.7, 8.8, 4.6, 6.3, 4.6, 22.3, 12.3, 's/i', 3.42, 10.8, 10.79, 3.6, 1.1, 7.18, 36.9, 31.3, 25.4, 17.7, 13.9, 1.9, 1.3, 2.5, 2.5, 46.2, 13, 21.4, 34.5, 33.9, 's/i', 's/i', 10.5, 22.5, 44.4, 24.6, 21.3, 14.1, 14.7],
            ["Ac grasos sat (g)", 1.84, 3.57, 1.16, 's/i', 2.95, 1.03, 2.16, 7.51, 7.7, 1.01, 3.04, 10.1, 12.46, 5.22, 5.08, 1.99, 1.86, 4.37, 6.67, 2.76, 's/i', 1.83, 2.45, 2.09, 4.08, 1.38, 3.01, 2.23, 1.59, 2.96, 1.34, 1.66, 1.5, 2.11, 1.1, 2.79, 3.93, 2.03, 1.04, 2.36, 1.09, 's/i', 11.04, 's/i', 3.29, 5.29, 11.87, 3.41, 2.06, 2.95, 1.6, 's/i', 's/i', 's/i', 1.08, 's/i', 10.79, 1.2, 0.27, 2.54, 11.82, 11.21, 5.31, 20.83, 14.45, 0.58, 0.74, 0.98, 's/i', 17.71, 4.76, 8.19, 13.9, 8.81, 's/i', 's/i', 6.87, 2.82, 16.9, 10.71, 6.91, 3.84, 8.6],
            ["Ac grasos monoinsat (g)", 2.89, 4.46, 1.61, 's/i', 4.95, 1.33, 2.69, 9.49, 9.03, 1.28, 4.92, 11.23, 12.34, 6.64, 6.17, 2.23, 2.18, 2.87, 4.27, 1.81, 's/i', 1.8, 3.17, 1.58, 1.58, 0.73, 2.04, 2.04, 0.99, 2.29, 1.04, 1.25, 1.19, 2.41, 1.3, 2.55, 4.18, 1.07, 2.3, 2.3, 1.34, 's/i', 12.53, 's/i', 3.63, 6.31, 14.35, 1.84, 1.42, 1.12, 6.88, 10.08, 's/i', 's/i', 3.42, 's/i', 's/i', 1.34, 0.23, 0.54, 14.53, 12.34, 3.12, 's/i', 3.4, 25.61, 0.72, 0.79, 1.14, 's/i', 20.77, 6.05, 8.64, 15.9, 12.72, 's/i', 's/i', 10.65, 1.88, 21.9, 12.2, 8.76, 5.16, 6.8],
            ["Ac grasos poliinsat (g)", 1.54, 2.51, 0.83, 's/i', 3.36, 's/i', 2.12, 2.89, 1.47, 0.29, 1.24, 2.55, 2.84, 1.56, 2.5, 0.92, 0.58, 0.18, 6.58, 0.12, 's/i', 1.08, 1.56, 0.16, 0.16, 0.73, 0.24, 0.21, 0.1, 0.13, 0.12, 's/i', 's/i', 0.24, 0.3, 0.31, 0.25, 0.05, 0.05, 's/i', 's/i', 's/i', 1.01, 's/i', 0.92, 2.52, 8.57, 1.11, 1.13, 1.12, 1.69, 's/i', 's/i', 's/i', 4.9, 's/i', 's/i', 0.95, 0, 2.47, 4.76, 4.03, 's/i', 's/i', 3.4, 0.84, 0.59, 0.67, 0.84, 's/i', 4.46, 1.62, 3.59, 3.46, 7.08, 's/i', 's/i', 1.04, 1.63, 4.3, 1.99, 5.83, 4.66, 3.5],
            ["Ac grasos trans (g)", 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0, 0, 0, 0, 0, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Colesterol (mg)", 82, 93, 93, 's/i', 89, 75.7, 109, 93.1, 's/i', 32.1, 29.5, 54, 51.5, 's/i', 55.1, 's/i', 's/i', 's/i', 's/i', 's/i', 64, 57, 82, 's/i', 's/i', 42.4, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 68, 68, 95, 56.9, 242, 350, 373, 's/i', 80, 0, 238, 45, 103, 501, 563, 395, 646, 132, 's/i', 59, 51.1, 93, 67, 64, 41.4, 70, 80, 76, 56, 's/i', 56, 1500, 43, 44, 42, 42, 275, 20, 200, 20, 66, 's/i', 's/i', 71, 316, 0, 's/i', 53.4, 's/i', 96]
        ]
    },
    {
        title: "2.4 Pescados y Mariscos",
        headers: [
            "Nutriente / Factor Dietético", "Almeja¹", "Almeja conserva en agua²", "Caracol de mar³", "Cholga en agua³", "Cholga conserva en aceite³", "Chorito en conserva en agua³", "Chorito¹", "Erizo¹", "Jibia¹", "Loco¹", "Macha en conserva en agua³", "Navajuela¹", "Ostra¹", "Piure¹", "Camarón¹", "Camarón congelado²", "Centolla¹", "Centollón¹", "Jaiva¹", "Atún conserva en agua¹", "Atún conserva en aceite¹", "Cojinova²", "Congrio colorado¹", "Congrio dorado³", "Congrio negro³", "Corvina¹", "Jurel¹", "Jurel²", "Jurel en conserva en agua²", "Jurel en conserva en aceite¹", "Lenguado¹", "Lenguado¹", "Merluza o pescada¹", "Mero¹", "Pejegallo¹", "Pejerrey¹", "Reineta³", "Roncador²", "Salmón coho fresco¹", "Salmón¹", "Salmón filete sin piel¹", "Sardina conserva en aceite¹", "Sardina española¹", "Sierra²", "Trucha congelada³", "Trucha de cultivo³", "Trucha de filete³", "Trucha fresca de mar¹", "Kanikama (carne de pescado procesada)³", "Ovas (masago)³", "Paté de trucha ahumada³"
        ],
        data: [
            ["Energía (kcal)", 74, 121, 106, 74, 132, 100, 72, 86, 123, 181, 113, 118, 80, 81, 57, 85, 110, 87, 71, 115, 120, 131, 198, 187, 77, 73, 71, 97, 122, 105, 155, 280, 85, 70, 89, 239, 103, 105, 88, 290, 148, 165, 309, 169, 156, 189, 131, 198, 104, 113, 33, 288],
            ["Humedad (g)", 81.8, 71.3, 73.8, 81.1, 70.8, 76.8, 82.6, 80.6, 73.7, 54.6, 71.2, 71.3, 78.5, 82.1, 84.6, 78.5, 72.6, 79.3, 82.6, 72, 's/i', 71.3, 59.9, 68.2, 80, 81.4, 81.4, 74.9, 73, 75.9, 66.9, 54.3, 78, 84.6, 78.9, 65.1, 76.1, 75.4, 78.2, 59.6, 71.2, 69.1, 50.6, 68.4, 66.6, 66.2, 73.1, 66.1, 78.1, 70.6, 72.3, 55.1],
            ["Cenizas (g)", 1.4, 2, 1.5, 2.1, 's/i', 2.2, 1.3, 1.3, 1.9, 1.4, 1.2, 2, 1.9, 1.2, 2.4, 1.2, 2, 1.3, 1.4, 2, 's/i', 's/i', 2.2, 1.1, 1.2, 1.1, 1.1, 1.4, 1.4, 1.3, 2.5, 2, 1.1, 1.3, 1.5, 0.9, 1.2, 1.1, 1.1, 1, 1.2, 1, 2.6, 1.5, 1.1, 1.3, 1.1, 1.3, 1.3, 1.4, 1.4, 1.8],
            ["Proteínas (g)", 12.8, 20, 16, 14.2, 21.3, 16, 10, 11.9, 14.4, 35, 21.7, 21.3, 14.2, 9.5, 8.8, 20.1, 20.7, 21.2, 14.5, 18.3, 's/i', 23.6, 29.1, 17.2, 18.5, 16.1, 15.8, 20.4, 21.9, 21.3, 23.5, 23, 15.9, 12.4, 18.6, 16.2, 21.8, 16.4, 19.3, 19.1, 21.6, 20.6, 21.2, 17.1, 22.1, 19.5, 19.6, 17.9, 16.7, 7.3, 5.6, 3.4],
            ["H de C disp. (g)", 2.8, 2.8, 5.5, 2.5, 's/i', 1.9, 4, 3.7, 4.9, 9.8, 5.5, 2.8, 5, 5, 3.3, 0, 0, 0, 0, 3.8, 's/i', 0, 0, 0.6, 1.1, 0.6, 's/i', 's/i', 0.1, 0, 's/i', 0.3, 0.7, 1.4, 0, 's/i', 1.3, 0.3, 's/i', 2.9, 's/i', 0.3, 0, 0.3, 0.6, 2.3, 6.3, 1.1, 0.5, 1.1, 0, 19.4, 2.6, 16.2],
            ["Azúcares totales (g)", 's/i', 0, 0, 0, 's/i', 0, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0, 0, 's/i', 0, 0, 0, 0, 0, 's/i', 's/i', 0, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0, 0, 0, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 2.4, 0.9],
            ["Fibra dietética total (g)", 0, 's/i', 's/i', 0, 's/i', 's/i', 's/i', 's/i', 0, 's/i', 0, 0, 0, 0, 0, 0, 0, 0, 's/i', 0, 's/i', 's/i', 0, 's/i', 's/i', 's/i', 's/i', 0.2, 0, 's/i', 0, 0, 's/i', 's/i', 's/i', 0, 's/i', 0, 0, 's/i', 's/i', 0, 's/i', 's/i', 0, 's/i', 0, 's/i', 0, 's/i', 's/i', 0, 's/i'],
            ["Lípidos totales (g)", 1, 3.3, 2.2, 0.8, 4.4, 's/i', 1.8, 2, 2.28, 0.2, 0.5, 2.4, 0.4, 2.3, 0.9, 0.15, 1.2, 0.28, 's/i', 2.9, 0.5, 's/i', 9.2, 12.9, 0.2, 's/i', 's/i', 0.5, 's/i', 0.6, 6.25, 24, 1.9, 1.9, 1.1, 20.5, 2.9, 2.7, 1.1, 23.6, 6.9, 9, 24.6, 10.2, 4.7, 11.9, 5.6, 13.6, 3.6, 1.3, 1.1, 23.3],
            ["Ac grasos sat (g)", 0.09, 1.46, 's/i', 's/i', 's/i', 0.42, 's/i', 0.43, 's/i', 's/i', 's/i', 0.21, 's/i', 0.92, 0.15, 0.1, 0.28, 0.24, 's/i', 's/i', 0.5, 's/i', 1.53, 's/i', 's/i', 's/i', 's/i', 's/i', 1.28, 0.36, 1.48, 's/i', 's/i', 0.44, 0.18, 's/i', 's/i', 's/i', 's/i', 's/i', 3.31, 1.26, 2.08, 's/i', 's/i', 3.05, 's/i', 1.61, 2.53, 1.01, 0.25, 's/i', 3.4],
            ["Ac grasos monoinsat (g)", 0.08, 0.82, 's/i', 's/i', 's/i', 0.51, 's/i', 0.61, 1.29, 's/i', 0.18, 's/i', 0.11, 's/i', 0.29, 0.09, 's/i', 0.32, 's/i', 's/i', 0.3, 0.14, 2.85, 's/i', 's/i', 's/i', 's/i', 's/i', 0.86, 0.76, 2.19, 's/i', 0.23, 0.54, 0.22, 's/i', 's/i', 's/i', 's/i', 's/i', 10.09, 2.13, 4.02, 's/i', 's/i', 5.05, 's/i', 1.83, 3.06, 0.73, 0.25, 's/i', 7.3],
            ["Ac grasos poliinsat (g)", 0.38, 0.91, 's/i', 's/i', 's/i', 's/i', 's/i', 0.61, 's/i', 's/i', 0.08, 's/i', 0.15, 's/i', 0.29, 's/i', 's/i', 0.64, 's/i', 's/i', 0.1, 0.13, 2.95, 's/i', 's/i', 's/i', 's/i', 's/i', 1.64, 0.95, 2.31, 's/i', 0.33, 0.97, 0.36, 's/i', 's/i', 's/i', 's/i', 's/i', 6.53, 1.99, 's/i', 's/i', 's/i', 's/i', 's/i', 2.1, 's/i', 0.72, 0.42, 's/i', 10.14],
            ["Ac grasos trans (g)", 's/i', 0.1, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0.1, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0, 's/i'],
            ["Colesterol (mg)", 34, 34, 's/i', 's/i', 's/i', 95, 28, 266.2, 's/i', 's/i', 's/i', 50, 's/i', 61.3, 161, 's/i', 's/i', 's/i', 97, 86, 's/i', 18, 's/i', 's/i', 34.6, 's/i', 's/i', 39, 53, 73, 73, 48.2, 45, 139, 141, 's/i', 's/i', 's/i', 's/i', 59.4, 45, 59.1, 's/i', 's/i', 's/i', 51, 73, 's/i', 30, 's/i', 10.1, 33]
        ]
    },
    {
        title: "2.5 Leguminosas y Oleaginosas",
        headers: ["Nutriente / Factor Dietético", "Arveja seca¹", "Arveja harina¹", "Arvejas¹", "Arvejas conserva¹", "Garbanzo cocido¹", "Garbanzo¹", "Garbanzo harina¹", "Haba¹", "Haba seca cocida¹", "Lenteja cocida¹", "Lenteja harina¹", "Poroto cocido¹", "Poroto¹", "Poroto de soya cocido¹", "Poroto harina-grasa¹", "Porotos negros¹"],
        data: [
            ["Energía (kcal)", 345, 333, 81, 89, 163, 378, 387, 72, 341, 116, 352, 139, 333, 141, 147, 341],
            ["Humedad (g)", 9.6, 9.6, 78.9, 81.7, 60.2, 's/i', 10.2, 81, 11, 69.6, 7.6, 64.2, 11.3, 68.6, 67.5, 11, 11],
            ["Cenizas (g)", 3, 3, 0.9, 's/i', 1.2, 's/i', 2.8, 1.1, 2.8, 0.8, 4.8, 1.7, 4.2, 1.6, 1.7, 3.6],
            ["Proteínas (g)", 22.9, 23.6, 5.4, 5.4, 8.9, 's/i', 22.4, 5.6, 26.1, 9, 32.9, 9.7, 25.1, 13, 13, 21.6],
            ["H de C disp. (g)", 36.4, 56.6, 8.7, 9.3, 20.4, 50.8, 47, 7.5, 57.7, 18.2, 44.9, 10.1, 25.1, 6.9, 13, 46.9],
            ["Azúcares totales (g)", 's/i', 's/i', 5.7, 3.4, 's/i', 10.7, 10.8, 's/i', 's/i', 1.8, 4, 's/i', 's/i', 's/i', 's/i', 2.1],
            ["Fibra dietética total (g)", 25.5, 's/i', 5.7, 3.4, 7.6, 12.2, 10.8, 4.2, 7.9, 7.9, 10.7, 15.5, 15.5, 4.2, 2.8, 15.1],
            ["Lípidos totales (g)", 1.2, 1.2, 0.4, 0.4, 2.6, 's/i', 6.7, 's/i', 1.1, 0.4, 1.1, 0.9, 1.2, 6.8, 0.4, 1.4],
            ["Ac grasos sat (g)", 0.18, 's/i', 0.07, 0.06, 0.27, 0.6, 0.69, 0.02, 0.14, 0.05, 0.15, 0.09, 0.22, 0.74, 0.09, 0.37],
            ["Ac grasos monoinsat (g)", 0.24, 's/i', 0.04, 0.03, 0.58, 1.38, 2.36, 0.02, 0.25, 0.06, 0.19, 0.03, 0.07, 1.21, 0.09, 0.11],
            ["Ac grasos poliinsat (g)", 0.5, 's/i', 0.19, 0.16, 1.25, 2.73, 2.96, 0.31, 0.63, 0.18, 0.53, 0.15, 0.36, 3, 0.1, 0.61],
            ["Ac grasos trans (g)", 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Colesterol (mg)", 0, 0, 0, 0, 0, 0, 0, 0, 's/i', 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    {
        title: "2.6 Semillas, Almendras y Nueces",
        headers: [
            "Nutriente / Factor Dietético", "Almendras¹", "Avellana¹", "Castaña de caju tostada¹", "Macadamia¹", "Maní¹", "Maní japonés³", "Maní tostado salado¹", "Nueces²", "Nueces¹", "Pistacho¹", "Castaña cruda pelada³", "Piñon¹", "Piñon deshidratado³", "Chia¹", "Semilla amapola¹", "Semilla tostada de sésamo¹", "Semilla maravilla pelada³", "Semilla zapallo¹", "Semillas de linaza¹"
        ],
        data: [
            ["Energía (kcal)", 579, 628, 574, 718, 567, 437, 587, 551, 606, 560, 369, 180, 673, 486, 525, 565, 619, 559, 418],
            ["Humedad (g)", 4.4, 5.3, 1.7, 1.4, 6.5, 2.4, 1.8, 's/i', 4.4, 4.4, 9.6, 53.1, 2.3, 5.8, 6, 3.3, 1, 5.2, 5.1],
            ["Cenizas (g)", 3, 2.3, 3, 's/i', 2.3, 2.9, 2.9, 's/i', 3.4, 2.6, 's/i', 1.1, 2.5, 3.6, 6.4, 6.1, 4.4, 4.8, 5.1],
            ["Proteínas (g)", 21.2, 15, 15.3, 7.9, 25.8, 17.7, 24.3, 17.5, 24.3, 20.2, 4.5, 's/i', 13.7, 16.5, 18.6, 18, 20.4, 30.2, 23.9],
            ["H de C disp. (g)", 9, 7.3, 29.7, 5.2, 7.6, 44.2, 12.9, 3.1, 8.2, 16.6, 79.4, 's/i', 9.4, 7.7, 12, 11.7, 's/i', 1.4, 's/i'],
            ["Azúcares totales (g)", 4.3, 4.3, 5, 4.6, 4.7, 13.5, 4.9, 's/i', 's/i', 7.7, 's/i', 's/i', 3.9, 's/i', 3, 's/i', 1.4, 's/i', 's/i'],
            ["Fibra dietética total (g)", 12.5, 9.7, 3, 8.6, 8.5, 12.5, 9.2, 52.1, 56.6, 10.6, 's/i', 's/i', 68.4, 34.4, 19.8, 14.1, 11.5, 6, 's/i'],
            ["Lípidos totales (g)", 49.9, 60.8, 46.4, 75.8, 49.2, 21.1, 49.7, 's/i', 56.6, 45.3, 1.9, 1.1, 's/i', 30.7, 41.6, 48, 50, 49.2, 22.2],
            ["Ac grasos sat (g)", 3.8, 4.46, 9.16, 12.06, 6.28, 2.5, 7.72, 's/i', 3.63, 5.91, 0.74, 's/i', 4.9, 3.33, 5.9, 8.72, 5.95, 8.66, 's/i'],
            ["Ac grasos monoinsat (g)", 31.55, 45.65, 27.64, 58.93, 24.43, 16.04, 26.18, 's/i', 37.5, 23.26, 1.35, 's/i', 18.73, 2.31, 5.98, 18.13, 10.84, 16.24, 's/i'],
            ["Ac grasos poliinsat (g)", 12.33, 7.92, 7.84, 1.5, 15.56, 1.95, 's/i', 's/i', 's/i', 14.38, 's/i', 's/i', 34.07, 23.67, 28.57, 21.04, 37.91, 20.98, 's/i'],
            ["Ac grasos trans (g)", 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Colesterol (mg)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    {
        title: "2.7 Cereales y Derivados",
        headers: [
            "Nutriente / Factor Dietético", "Crutones¹", "Pan blanco sin sal³", "Pan de centeno²", "Pan de miel³", "Pan especial³", "Pan hallulla³", "Pan integral³", "Pan marraqueta³", "Pan molde¹", "Pan molde¹", "Pan pita blanco³", "Pan rallado seco³", "Pan salvado de trigo³", "Tortilla para tacos²", "Arroz blanco¹", "Arroz blanco cocido¹", "Arroz integral¹", "Arroz integral cocido¹", "Cabritas¹", "Choclo cocido¹", "Choclo congelado³", "Choclo¹", "Mote trigo¹", "Mote trigo¹", "Quinoa¹", "Quinoa¹", "Salvado de pella³", "Salvado de trigo¹", "Avena¹", "Cereal de maiz¹", "Cereal de maíz¹", "Granola¹", "Burgo³", "Cuscús cocido³", "Cuscús seco¹", "Fideos¹", "Fideos cocidos¹", "Fideos de arroz cocido³", "Galleta champaña³", "Galleta cereal avena manzana³", "Galleta cereal berries³", "Galleta cereal cacao³", "Galleta cereal clásica³", "Galleta cereal fibra cacao³", "Galleta chips de chocolate³", "Galleta de arroz chocolate³", "Galleta de arroz³", "Galleta de arroz³", "Galleta de arroz sésamo³", "Galleta de arroz sin sal³", "Galleta de arroz quilla³", "Galleta mini cocaditas²", "Galleta mini limón³", "Galleta mini mantequilla³", "Galleta mini vino³", "Galleta soda³", "Galleta vainilla³", "Galleta vino³", "Galletas cracker¹", "Galletas de agua¹", "Galletas de arroz²", "Harina de centeno³", "Harina de trigo¹", "Harina de yuca³", "Harina de trigo tostada³", "Chuchoca³", "Chuao³", "Maicena³", "Sémola¹", "Sémola²", "Tapioca¹"
        ],
        data: [
            ["Energía (kcal)", 407, 267, 239, 256, 212, 363, 252, 272, 269, 244, 275, 396, 243, 260, 370, 130, 367, 112, 397, 96, 81, 86, 's/i', 354, 368, 351, 120, 246, 216, 389, 358, 427, 442, 364, 112, 370, 352, 149, 108, 409, 428, 430, 427, 430, 427, 481, 463, 363, 373, 371, 363, 356, 469, 483, 29, 467, 476, 409, 428, 453, 405, 386, 344, 383, 349, 364, 333, 380, 361, 351, 381, 360, 342, 358],
            ["Humedad (g)", 5.5, 26.7, 37.3, 29.9, 38.9, 22.8, 39, 33.6, 35.6, 35.5, 37.1, 8.5, 37.8, 35.8, 10.5, 68.4, 11.8, 73, 3.3, 73.4, 77, 76.1, 's/i', 66, 13.3, 10.4, 71.6, 6.6, 9.9, 8.2, 8.7, 3.8, 3.2, 9.3, 72.6, 8.6, 8.21, 61.8, 6.8, 's/i', 3.5, 3.7, 2.8, 4.4, 3.7, 4.1, 3.6, 's/i', 's/i', 4.9, 5, 4.1, 2.6, 2.1, 2.9, 1.1, 1.4, 1.1, 1.5, 3.8, 1.6, 2.6, 's/i', 's/i', 10.3, 11.9, 11.8, 11.7, 10.9, 7.5, 8.3, 12.7, 's/i', 11],
            ["Cenizas (g)", 2.5, 1.9, 2.5, 1.7, 2.2, 2, 2.5, 2.4, 2, 1.8, 1.9, 1.9, 2.2, 2.1, 0.5, 0.4, 0.7, 0.4, 1.7, 0.7, 0.4, 0.6, 's/i', 's/i', 2.4, 1.5, 0.8, 2.9, 2.3, 1.7, 0.4, 4, 1.5, 1.2, 0.3, 0.6, 1.62, 0.4, 0.2, 's/i', 1.4, 1.3, 1.5, 1.6, 1.8, 1.1, 3.6, 's/i', 's/i', 2.9, 1.1, 2.6, 1, 2.1, 1.1, 1.4, 1.1, 's/i', 1.5, 's/i', 1.2, 's/i', 's/i', 's/i', 1.2, 0.5, 0.1, 1.7, 1.5, 3.2, 0.1, 0.6, 's/i', 0.1],
            ["Proteínas (g)", 11.9, 8.2, 8.5, 12, 10.2, 9.1, 9.5, 10.8, 9.7, 8.1, 9.1, 9.5, 8.8, 8.7, 6.8, 2.7, 7.5, 2.3, 12.9, 3.4, 2.6, 3.3, 3.5, 10.5, 14.1, 12.2, 18.5, 11.3, 21.7, 16.7, 13.9, 13, 11.4, 10.4, 3.8, 12.8, 13.9, 6, 1.8, 5.5, 8.6, 8.5, 8.3, 7.5, 8.9, 5.4, 7.1, 9.7, 5.2, 2.9, 4.1, 11, 5.8, 5.4, 1.3, 6.5, 9.6, 's/i', 8, 's/i', 7.4, 's/i', 8.4, 7, 10.3, 8.3, 9.1, 13.4, 6.9, 6.3, 4.3, 12.7, 's/i', 11],
            ["H de C disp. (g)", 68.1, 47.7, 43.8, 48.6, 36.4, 53.6, 36.7, 49.7, 48.8, 49.9, 53.5, 67.8, 43.4, 45.7, 79.9, 27.9, 79, 21.7, 63.3, 19.2, 16.5, 16.5, 's/i', 73.6, 57.2, 59.9, 's/i', 50.8, 's/i', 59.7, 73.9, 69, 51.4, 78.9, 21.8, 72.4, 6.2, 29.2, 23, 81.7, 61.1, 57.9, 54.5, 62.8, 54.8, 64.3, 66, 82.7, 82.7, 74.2, 80.1, 72.2, 71, 65.5, 67.4, 66.5, 69.5, 73, 69.7, 60.3, 72.3, 71.1, 77, 71.6, 77.6, 62.7, 82, 69.5, 78.9, 90.4, 68.9, 69, 's/i'],
            ["Azúcares totales (g)", 's/i', 's/i', 3.8, 6.4, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 1.2, 3.7, 's/i', 0.1, 0.1, 0.4, 0.3, 1.1, 's/i', 's/i', 3.1, 's/i', 's/i', 's/i', 's/i', 1.8, 1.5, 0.4, 's/i', 9.5, 's/i', 20.2, 's/i', 's/i', 2.4, 's/i', 0.8, 1, 49, 's/i', 57.9, 's/i', 54.3, 's/i', 's/i', 's/i', 's/i', 's/i', 1.2, 1.2, 7.5, 1.6, 's/i', 2.2, 's/i', 's/i', 's/i', 9, 's/i', 's/i', 's/i', 's/i', 's/i', 1.1, 0.3, 's/i', 's/i', 's/i', 0.1, 's/i', 's/i', 4, 3.4],
            ["Fibra dietética total (g)", 5.1, 2.3, 5.8, 4, 8.4, 's/i', 6, 2.7, 1.9, 3.3, 2.2, 3.4, 4, 's/i', 2.8, 0.4, 3.6, 1.8, 14.5, 2.4, 2.4, 's/i', 's/i', 2, 7, 5.9, 2.6, 15.6, 7, 6.1, 10.6, 3.7, 11.5, 1.1, 0.2, 6, 2.9, 's/i', 's/i', 's/i', 5.1, 's/i', 6.9, 7.7, 5.7, 5.2, 2.7, 's/i', 's/i', 5.7, 1.6, 7.5, 1.6, 's/i', 's/i', 's/i', 's/i', 's/i', 2.2, 's/i', 2.5, 's/i', 5.5, 2.7, 8, 0.9, 1.9, 0.6, 2.1, 1.1, 2, 's/i', 0.9],
            ["Lípidos totales (g)", 6.6, 3.6, 3, 2.5, 1.6, 's/i', 1.4, 3.4, 3.2, 1.4, 1.2, 5.3, 3.6, 5.9, 0.6, 0.3, 3.2, 0.8, 's/i', 2.4, 's/i', 2, 's/i', 2, 0.7, 4.1, 's/i', 7, 4.3, 6.1, 1.1, 0.1, 2.4, 's/i', 's/i', 0.2, 0.6, 1.7, 0.2, 2.2, 4.94, 4.92, 4.97, 16.9, 11.2, 18.9, 4.97, 0.3, 1.3, 1.9, 1.3, 2.6, 18, 22.2, 18.7, 20, 14.7, 10.4, 15.8, 14.9, 5.7, 2.5, 9.4, 's/i', 1, 1.9, 1.1, 0.8, 0.15, 's/i', 0.1]
        ]
    },
    {
        title: "2.8 Papas",
        headers: [
            "Nutriente / Factor Dietético", "Camote¹", "Papa cocida¹", "Papa cruda²", "Papa entera rojiza¹"
        ],
        data: [
            ["Energía (kcal)", 131, 89, 80, 79],
            ["Humedad (g)", 66.1, 76.7, 78.7, 78.6],
            ["Cenizas (g)", 1.0, 1.0, 0.9, 1.0],
            ["Proteínas (g)", 1.4, 2.3, 1.8, 2.1],
            ["H de C disp. (g)", 30.3, 17.8, 16.5, 16.8],
            ["Azúcares totales (g)", 's/i', 1.4, 's/i', 0.6],
            ["Fibra dietética total (g)", 's/i', 0.2, 0.2, 0.1],
            ["Lípidos totales (g)", 0.4, 's/i', 0.2, 0.1],
            ["Ac grasos sat (g)", 's/i', 0.03, 's/i', 0.03],
            ["Ac grasos monoinsat (g)", 's/i', 0.00, 's/i', 0.00],
            ["Ac grasos poliinsat (g)", 's/i', 0.08, 's/i', 's/i'],
            ["Ac grasos trans (g)", 's/i', 's/i', 's/i', 's/i'],
            ["Colesterol (mg)", 0.0, 0.0, 0.0, 0.0],
            ["Vitamina A (ug EAR)", 's/i', 1.0, 's/i', 0.0],
            ["Vit C (mg)", 12.0, 12.6, 27.8, 's/i'],
            ["Vit D (ug)", 0.0, 0.0, 0.0, 0.0],
            ["Vit E (mg ET)", 0.1, 0.1, 0.1, 0.0],
            ["Vit K (ug)", 's/i', 2.8, 's/i', 1.8],
            ["Vit B₁ (mg)", 's/i', 0.1, 's/i', 0.1],
            ["Vit B₂ (mg)", 's/i', 0.0, 's/i', 0.0],
            ["Niacina (mg EN)", 1.5, 1.6, 1.4, 1.0],
            ["Vit B₆ (mg)", 's/i', 0.2, 's/i', 0.3],
            ["Ac pantoténico (mg)", 's/i', 0.2, 's/i', 0.3],
            ["Vit B₁₂ (ug)", 's/i', 0.0, 's/i', 0.0],
            ["Folatos (ug EFA)", 's/i', 27.0, 's/i', 14.0],
            ["Sodio (mg)", 12.0, 7.0, 7.0, 5.0],
            ["Potasio (mg)", 542.0, 413.0, 413.0, 417.0],
            ["Calcio (mg)", 21.0, 9.0, 11.0, 13.0],
            ["Fósforo (mg)", 71.0, 72.0, 51.0, 55.0],
            ["Magnesio (mg)", 's/i', 28.0, 's/i', 23.0],
            ["Hierro (mg)", 5.0, 0.7, 1.1, 0.3],
            ["Zinc (mg)", 's/i', 0.3, 's/i', 0.3],
            ["Cobre (mg)", 's/i', 0.2, 's/i', 0.1],
            ["Selenio (ug)", 's/i', 's/i', 's/i', 's/i']
        ]
    },
    {
        title: "2.9 Grasas y Aceites",
        headers: [
            "Nutriente / Factor Dietético", "Aceite de canola¹", "Aceite de girasol¹", "Aceite de maravilla¹", "Aceite de maiz¹", "Aceite de maravilla¹", "Aceite de oliva¹", "Aceite de oliva extra virgen¹", "Aceite de palma¹", "Aceite de soja¹", "Aceite de soja¹", "Aceite soya orgánico¹", "Crema animal¹", "Crema chantilly¹", "Crema de leche light¹", "Grasa animal²", "Manteca vegetal²", "Mantequilla¹", "Margarina¹", "Margarina¹", "Margarina²", "Margarina reducida en grasa¹", "Margarina reducida en grasa¹", "Mayonesa¹", "Mayonesa casera¹"
        ],
        data: [
            ["Energía (kcal)", 884, 892, 897, 884, 898, 887, 864, 884, 897, 884, 897, 181, 345, 194, 887, 887, 717, 749, 717, 700, 424, 192, 717, 671],
            ["Humedad (g)", 0, 0, 0, 0, 0, 0, 0.2, 0, 0, 0, 0.1, 71, 0, 0, 0, 0, 15.9, 15.3, 16.5, 18.8, 42.4, 's/i', 15.3, 18.3],
            ["Cenizas (g)", 0, 0, 0, 0, 0, 0, 0.3, 0.2, 0, 0, 0, 0.9, 0.5, 0.6, 0.5, 0, 2.1, 1.3, 1.9, 's/i', 's/i', 's/i', 's/i', 2.2],
            ["Proteínas (g)", 0, 0, 0, 0, 0.2, 0.1, 0.2, 0, 0, 0, 0, 7, 2.1, 2.7, 0.5, 0, 0.9, 0.3, 0.2, 0.6, 0.2, 's/i', 1.1, 1.2],
            ["H de C disp. (g)", 0, 0.5, 's/i', 0, 0.2, 0, 0, 0, 0.3, 0, 0.3, 7, 2.6, 4.6, 0, 0, 0.1, 0.1, 0.7, 0.2, 0.2, 's/i', 2.7, 1.8],
            ["Azúcares totales (g)", 0, 's/i', 's/i', 0, 's/i', 's/i', 's/i', 0, 0, 's/i', 0, 0, 0, 0, 0, 0, 's/i', 's/i', 0, 's/i', 's/i', 's/i', 's/i', 0.2],
            ["Fibra dietética total (g)", 0, 0, 's/i', 0, 0, 's/i', 's/i', 's/i', 0, 0, 's/i', 0, 0, 0, 0, 0, 0, 0, 0, 's/i', 's/i', 's/i', 0, 's/i'],
            ["Lípidos totales (g)", 100, 99.8, 99.7, 100, 99.8, 100, 97.5, 100, 100, 99.4, 99.4, 14.1, 37.6, 18.2, 99.5, 99.7, 81.1, 83.1, 80.7, 77.4, 47.5, 11.3, 79.7, 70.6],
            ["Ac grasos sat (g)", 7.76, 13.5, 10.3, 10.76, 11, 13.81, 14.12, 49.3, 14.7, 14.9, 14.69, 8.71, 23, 11.8, 99.5, 21.3, 51.37, 49.99, 15.19, 25.39, 8.76, 5.8, 11.8, 8.08],
            ["Ac grasos monoinsat (g)", 61.15, 6.33, 26.1, 19.5, 28.07, 19.7, 72.96, 73.5, 19.7, 43, 57.04, 4.1, 13.7, 5.4, 's/i', 56.63, 21.22, 27.21, 32.58, 23.3, 19.42, 31.8, 22.7, 20.38],
            ["Ac grasos poliinsat (g)", 26.4, 1.71, 59.9, 65.7, 43.5, 65.3, 10.52, 6.59, 57.8, 37.9, 11.1, 0.5, 1.37, 1.04, 11.14, 20.64, 4.04, 1.14, 24.3, 1.14, 20.24, 's/i', 41.6, 37.41],
            ["Ac grasos trans (g)", 0, 's/i', 's/i', 0, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 2.6, 's/i', 0.4, 's/i', 0.2, 0, 0],
            ["Colesterol (mg)", 0, 0, 0, 0, 0, 0, 's/i', 0, 0, 's/i', 's/i', 35, 137, 35.5, 95, 's/i', 215, 187.1, 's/i', 85.9, 1, 120, 59, 221]
        ]
    },
    {
        title: "2.11 Frutas",
        headers: ["Nutriente / Factor Dietético", "Aceitunas negras¹", "Aceitunas verdes¹", "Arándanos¹", "Arándanos rojo¹", "Caqui¹", "Cerezas¹", "Chirimoya¹", "Ciruelas¹", "Ciruelas desecadas¹", "Clementinas¹", "Damasco¹", "Damascos secos¹", "Duranzo¹", "Duranos en conserva²", "Frambuesa¹", "Frutilla¹", "Granada¹", "Grosella roja y blanca¹", "Guayaba¹", "Guindas¹", "Guindas acidas rojas³", "Higos frescos¹", "Higos secos¹", "Huesillo¹", "Kiwi¹", "Limón fruta³", "Mandarina¹", "Mango¹", "Manzana¹", "Manzana fuji¹", "Manzana golden¹", "Manzana roja¹", "Manzana sin cáscara¹", "Manzana verde¹", "Melón¹", "Membrillo¹", "Mora¹", "Naranja¹", "Níspero¹", "Palta¹", "Palta Hass¹", "Papaya¹", "Pasas¹", "Pepino dulce¹"],
        data: [
            ["Energía (kcal)", 232, 263, 57, 46, 70, 50, 75, 46, 240, 47, 48, 244, 39, 45, 52.5, 32, 83, 56, 68, 63, 50, 74, 249, 239, 61, 29, 43, 60, 52, 63, 57, 59, 48, 58, 34, 57, 43, 47, 47, 160, 160, 43, 299, 25],
            ["Humedad (g)", 's/i', 's/i', 84.2, 87.3, 80.3, 86.1, 79.4, 87.2, 30.9, 86.6, 86.4, 24.9, 88.9, 's/i', 85.8, 91, 77.9, 84, 80.8, 82.3, 86.1, 79.3, 30.1, 31.8, 83.1, 89, 88.2, 85.3, 85.6, 84.2, 85.8, 85.3, 86.7, 85.5, 90.2, 83.8, 88.2, 86.8, 88.7, 73.2, 's/i', 88.1, 15.4, 92.4],
            ["Cenizas (g)", 's/i', 's/i', 0.2, 0.1, 0.5, 0.4, 0.7, 0.4, 2.6, 0.4, 0.5, 0.4, 0.4, 's/i', 0.5, 0.4, 0.5, 0.7, 1.2, 0.8, 0.4, 0.7, 1.3, 1.8, 0.6, 0.5, 0.4, 0.8, 0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.7, 0.4, 1.4, 0.4, 0.5, 1.6, 's/i', 0.4, 1.9, 0.3],
            ["Proteínas (g)", 1.3, 1.2, 0.7, 0.4, 0.6, 1.0, 1.6, 0.7, 2.2, 0.8, 1.4, 0.9, 0.9, 0.6, 1.2, 0.5, 1.7, 1.4, 2.6, 1.1, 1, 0.8, 3.3, 3.6, 1.1, 1.1, 0.8, 0.8, 0.3, 0.3, 0.2, 0.3, 0.3, 0.2, 0.8, 0.4, 1.4, 0.9, 0.4, 1.8, 's/i', 0.6, 3.1, 0.6],
            ["H de C disp. (g)", 2.4, 2.8, 12.1, 8.1, 16.8, 10.6, 14.7, 10.9, 59.5, 9.1, 9.1, 58.1, 8, 10.0, 5.4, 4.5, 13.7, 7.4, 8.9, 13.9, 10.6, 16.3, 54.1, 53.1, 11.7, 6.5, 11.5, 12.4, 11.4, 13.1, 11.2, 11.8, 11.5, 10.8, 7.3, 13.4, 4.3, 9.3, 8.9, 6.7, 's/i', 7.8, 73.5, 5.3],
            ["Azúcares totales (g)", 1.4, 1.4, 10, 4.3, 's/i', 1.5, 12.9, 's/i', 50.3, 9.2, 's/i', 50.1, 8.4, 's/i', 's/i', 's/i', 4, 's/i', 8.9, 12.8, 's/i', 's/i', 27.9, 41.7, 9, 2.8, 1.8, 1.6, 2.4, 11.7, 10, 10.5, 10.1, 9.6, 6.9, 7.3, 's/i', 9.3, 's/i', 0.7, 's/i', 5.9, 70.6, 's/i'],
            ["Fibra dietética total (g)", 4.4, 4.4, 2.4, 3.6, 1.8, 1.6, 3, 1.4, 7.1, 1.7, 's/i', 's/i', 's/i', 4.4, 's/i', 2, 's/i', 4.3, 's/i', 's/i', 8.5, 's/i', 9.6, 's/i', 3.0, 1.8, 0.3, 0.4, 0.2, 2.4, 2.3, 2.3, 1.3, 2.2, 0.9, 1.9, 5.3, 2.4, 3.2, 6.7, 's/i', 1.7, 3.7, 's/i'],
            ["Lípidos totales (g)", 24.9, 28.1, 0.3, 0.1, 0.2, 0.3, 0.7, 0.3, 's/i', 's/i', 0.4, 's/i', 0.1, 0.3, 0.7, 0.3, 0.2, 0.2, 's/i', 0.5, 0.1, 0.3, 0.3, 0.3, 0.5, 0.04, 0.1, 0.09, 0.2, 0.2, 0.2, 0.2, 0.1, 0.2, 0.1, 0.1, 's/i', 0.1, 0.2, 14.2, 's/i', 0.6, 's/i', 's/i'],
            ["Ac grasos sat (g)", 2.49, 3.61, 0.03, 0.01, 0.01, 0.07, 0.23, 0.07, 's/i', 's/i', 0.03, 's/i', 0.02, 's/i', 0.02, 0.03, 's/i', 0.02, 's/i', 's/i', 0.07, 0.06, 0.14, 0.08, 0.03, 0.04, 0.04, 0.1, 0.01, 's/i', 's/i', 's/i', 's/i', 's/i', 0.05, 0.01, 's/i', 0.01, 0.02, 2.13, 2.64, 0.08, 0.06, 's/i'],
            ["Ac grasos monoinsat (g)", 17.68, 20.1, 0.05, 0.02, 0.02, 0.08, 's/i', 0.13, 's/i', 's/i', 0.17, 's/i', 0.07, 's/i', 0.06, 0.04, 's/i', 0.03, 's/i', 's/i', 0.08, 0.07, 0.16, 0.28, 0.03, 0.03, 0.07, 0.07, 0.05, 's/i', 's/i', 's/i', 's/i', 's/i', 0.01, 's/i', 's/i', 0.04, 's/i', 9.8, 10.7, 0.07, 's/i', 's/i'],
            ["Ac grasos poliinsat (g)", 1.54, 2.06, 0.06, 0.06, 0.1, 0.09, 's/i', 0.04, 's/i', 's/i', 's/i', 's/i', 0.09, 's/i', 0.44, 0.16, 's/i', 0.09, 's/i', 's/i', 0.07, 0.14, 's/i', 's/i', 0.05, 0.02, 0.03, 0.03, 0.09, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0.03, 's/i', 1.82, 2.04, 0.06, 0.04, 's/i'],
            ["Ac grasos trans (g)", 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Colesterol (mg)", 0, 0, 0, 0, 0, 0, 0, 0, 's/i', 's/i', 0, 's/i', 0, 's/i', 0, 0, 0, 0, 0, 0, 0, 0, 's/i', 's/i', 0, 0, 0, 0, 0, 's/i', 's/i', 's/i', 's/i', 's/i', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    {
        title: "2.12 Azúcares y Miel",
        headers: ["Nutriente / Factor Dietético", "Azúcar¹", "Azúcar³", "Azúcar flor¹", "Azúcar light con estevia³", "Azúcar light con sucralosa³", "Miel de abeja³", "Miel de abeja³", "Miel de palma³"],
        data: [
            ["Energía (kcal)", 387, 399, 399, 400, 400, 334, 318, 294],
            ["Humedad (g)", 0, 0.1, 0.2, 0.1, 0.1, 16.5, 20.6, 25.9],
            ["Cenizas (g)", 0, 0.1, 0.2, 0.1, 0.1, 0.1, 0.3, 0.5],
            ["Proteínas (g)", 0, 0, 0, 0, 0, 0.6, 0.3, 0],
            ["H de C disp. (g)", 100, 99.6, 99.8, 99.9, 99.9, 82.7, 78.8, 63.6],
            ["Azúcares totales (g)", 99.8, 's/i', 's/i', 's/i', 's/i', 82.7, 78.8, 63.6],
            ["Fibra dietética total (g)", 0, 0.1, 0, 's/i', 's/i', 0, 0, 0],
            ["Lípidos totales (g)", 0, 's/i', 0, 's/i', 's/i', 0.1, 's/i', 0],
            ["Ac grasos sat (g)", 0, 's/i', 0, 's/i', 's/i', 0.06, 's/i', 0],
            ["Ac grasos monoinsat (g)", 0, 's/i', 0, 's/i', 's/i', 0, 's/i', 0],
            ["Ac grasos poliinsat (g)", 0, 's/i', 0, 's/i', 's/i', 0, 's/i', 's/i'],
            ["Ac grasos trans (g)", 's/i', 's/i', 's/i', 's/i', 's/i', 0, 's/i', 's/i'],
            ["Colesterol (mg)", 0, 0, 0, 's/i', 's/i', 0, 0, 0]
        ]
    },
    {
        title: "2.13 Alimentos Dulces",
        headers: ["Nutriente / Factor Dietético", "Alfajor³", "Barra cereal³", "Barra sabor chocolate con relleno sabor frutilla³", "Berlín¹", "Bizcocho simple³", "Cacao en polvo con azúcar¹", "Chancaca²", "Chocolate de leche con almendras³", "Chocolate amargo 60-69% cacao³", "Chocolate amargo 70-85% cacao³", "Chocolate de leche¹", "Cacao en polvo sin azúcar¹", "Fruta confitada³", "Jalea polvo³", "Jalea reconstituida³", "Jaleo reconstituida³", "Jalea polvo sin azúcar⁴", "Manjar³", "Mermelada damasco³", "Mermelada de membrillo³", "Mermelada sin azúcar adicionada²", "Dulce de membrillo¹", "Mousse vainilla³", "Muffins arándano¹", "Oblea bañada con cobertura sabor chocolate³", "Cono de barquillo azucarado¹", "Pie de limón³", "Strudel de manzana³", "Marshmallow³", "Sustancia simple (Marshmallow)³", "Sustancia (Marshmallow) con chocolate¹"],
        data: [
            ["Energía (kcal)", 407, 354, 437, 307, 381, 228, 367, 559, 579, 598, 548, 393, 322, 381, 62, 28, 318, 290, 232, 199, 50, 237, 149, 333, 503, 403, 268, 274, 338, 349, 464],
            ["Humedad (g)", 10.9, 8.2, 's/i', 35.6, 25.2, 3.8, 0.9, 's/i', 1.8, 1.4, 's/i', 1.7, 16.7, 1, 84.4, 92.7, 's/i', 36.5, 36.5, 60.4, 's/i', 28, 66.8, 26.4, 's/i', 1.1, 41.3, 43.5, 15.4, 13.1, 6.1],
            ["Cenizas (g)", 1.5, 1.6, 's/i', 0.9, 1.5, 5.8, 's/i', 's/i', 1.9, 1.4, 's/i', 8.5, 0.3, 0.7, 0.2, 0.2, 's/i', 1.5, 0.3, 0, 's/i', 0.2, 's/i', 1.9, 's/i', 3, 0.9, 0.8, 0.1, 0.2, 1.2],
            ["Proteínas (g)", 5.6, 11.6, 5, 6.2, 4.2, 19.6, 0.6, 11, 6.1, 7.8, 8.3, 8, 6.8, 8.6, 1.2, 0.5, 6.2, 6.2, 0.4, 0.2, 0.7, 0.2, 6.2, 4.9, 4, 7.9, 4.5, 3.3, 0.3, 2.1, 4.2],
            ["H de C disp. (g)", 69, 59.9, 69.2, 47.4, 51.7, 23.9, 91, 46.9, 44.4, 35, 60, 80.5, 81.3, 90.5, 14.2, 6.1, 62, 47.4, 28.6, 41.8, 17, 58.7, 18.2, 64.8, 68, 82.5, 46, 39, 80.2, 84.1, 89.8],
            ["Azúcares totales (g)", 's/i', 's/i', 66, 's/i', 24.2, 18, 31, 44, 36.4, 24, 52.3, 's/i', 80.7, 86, 13.5, 5.4, 9, 46.8, 's/i', 's/i', 17, 's/i', 's/i', 's/i', 's/i', 's/i', 23.2, 22.8, 's/i', 80.2, 69.9],
            ["Fibra dietética total (g)", 1.4, 11, 's/i', 's/i', 17.4, 32, 's/i', 14, 30.3, 40.6, 10.5, 23.3, 1.6, 0, 0, 0, 9, 8.4, 's/i', 's/i', 's/i', 's/i', 's/i', 1, 's/i', 1.7, 1.2, 2.2, 's/i', 's/i', 0.5],
            ["Lípidos totales (g)", 13.2, 6.5, 22, 10.3, 17.4, 3.07, 's/i', 36.2, 30.3, 40.6, 30.5, 4, 0.01, 0, 0, 0, 0, 8.4, 's/i', 's/i', 0.2, 's/i', 5.7, 10.1, 23.9, 3.8, 8.7, 11.2, 's/i', 0, 18.4],
            ["Ac grasos sat (g)", 9.48, 's/i', 15.4, 's/i', 's/i', 's/i', 's/i', 15.9, 22.03, 24.5, 19, 's/i', 0.01, 0, 0, 0, 's/i', 5.09, 's/i', 's/i', 's/i', 's/i', 's/i', 1.59, 18, 0.85, 1.62, 2.04, 's/i', 0, 's/i'],
            ["Ac grasos monoinsat (g)", 2.84, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 16.9, 11.52, 12.8, 11.6, 's/i', 0, 0, 0, 0, 's/i', 2.3, 's/i', 's/i', 's/i', 's/i', 's/i', 2.57, 4.49, 1.47, 1.69, 3.52, 's/i', 0, 's/i'],
            ["Ac grasos poliinsat (g)", 0.76, 's/i', 0.65, 's/i', 's/i', 's/i', 's/i', 2.4, 1.52, 1.3, 's/i', 's/i', 0.02, 0, 0, 0, 's/i', 0.17, 's/i', 's/i', 's/i', 's/i', 's/i', 5.48, 1.4, 1.43, 3.65, 5.32, 's/i', 0, 's/i'],
            ["Ac grasos trans (g)", 7.3, 's/i', 0.3, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0.3, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Colesterol (mg)", 0, 's/i', 5.1, 's/i', 's/i', 0, 's/i', 17, 6, 3, 22, 's/i', 0, 0, 0, 0, 0, 27.7, 's/i', 's/i', 's/i', 's/i', 's/i', 5, 4, 0, 45.4, 's/i', 's/i', 's/i', 's/i']
        ]
    },
    {
        title: "2.14 Postres de Leche",
        headers: ["Nutriente / Factor Dietético", "Arroz con leche¹", "Flan de leche sabor vainilla³", "Flan vainilla reconstituido³", "Flan polvo³", "Leche asada con salsa de caramelo³", "Sémola con leche salsa caramelo³"],
        data: [
            ["Energía (kcal)", 85, 115, 84, 390, 144, 142],
            ["Humedad (g)", 's/i', 's/i', 83.8, 0.6, 's/i', 's/i'],
            ["Cenizas (g)", 's/i', 0.8, 0.6, 2.6, 's/i', 's/i'],
            ["Proteínas (g)", 5, 2.6, 2.4, 9, 5.6, 5.7],
            ["H de C disp. (g)", 14.5, 24, 16.4, 87.4, 24.4, 28],
            ["Azúcares totales (g)", 's/i', 's/i', 's/i', 97.4, 's/i', 22.2],
            ["Fibra dietética total (g)", 's/i', 's/i', 's/i', 0, 's/i', 's/i'],
            ["Lípidos totales (g)", 1.4, 0.9, 3.8, 0, 3.6, 2.2],
            ["Ac grasos sat (g)", 's/i', 0.6, 's/i', 's/i', 2.9, 's/i'],
            ["Ac grasos monoinsat (g)", 's/i', 0.12, 's/i', 's/i', 's/i', 's/i'],
            ["Ac grasos poliinsat (g)", 's/i', 0.01, 's/i', 's/i', 0.17, 's/i'],
            ["Ac grasos trans (g)", 's/i', 0.1, 's/i', 's/i', 's/i', 's/i'],
            ["Colesterol (mg)", 's/i', 's/i', 's/i', 's/i', 10.5, 's/i']
        ]
    },
    {
        title: "2.15 Jugos y Néctares",
        headers: ["Nutriente / Factor Dietético", "Bebida de soya sabor manzana³", "Jugo de limón³", "Jugo de maqui³", "Jugo de mandarina³", "Jugo de naranja³", "Jugo de pomelo³", "Néctar damasco³", "Néctar damasco light⁴", "Néctar durazno¹", "Néctar durazno light³", "Néctar manzana³", "Néctar naranja³", "Néctar naranja light³", "Néctar uva light³"],
        data: [
            ["Energía (kcal)", 66, 22, 43, 45, 45, 39, 42, 10, 42, 15, 41, 41, 20, 9],
            ["Humedad (g)", 's/i', 92.3, 88.9, 92.7, 88.3, 90, 93.4, 's/i', 93.1, 95.6, 93.3, 93.3, 96.6, 98.3],
            ["Cenizas (g)", 's/i', 0.2, 0.5, 0.4, 0.7, 0.2, 0.2, 's/i', 0, 0.2, 's/i', 0, 0, 0],
            ["Proteínas (g)", 1.2, 0.2, 0.5, 0.4, 0.8, 0.5, 0.3, 0.1, 0.3, 0.2, 0, 0.4, 0.3, 's/i'],
            ["H de C disp. (g)", 14, 6.6, 9.9, 11.2, 10.2, 9.1, 10.3, 1.9, 10.4, 3.3, 10.2, 9.8, 4.8, 1.9],
            ["Azúcares totales (g)", 12, 2.5, 's/i', 's/i', 8.4, 8.2, 1.3, 's/i', 8.9, 's/i', 8.6, 9, 3.1, 1.7],
            ["Fibra dietética total (g)", 1.2, 0.2, 's/i', 0.2, 's/i', 0.1, 0.1, 's/i', 0.1, 's/i', 's/i', 's/i', 's/i', 0],
            ["Lípidos totales (g)", 0.6, 0.2, 0.2, 's/i', 0.2, 0.1, 0.1, 0, 's/i', 0, 0, 0, 0, 0],
            ["Ac grasos sat (g)", 0, 0.04, 0.02, 's/i', 0.02, 0.01, 0.01, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Ac grasos monoinsat (g)", 0.2, 0.01, 0.04, 's/i', 0.04, 0.01, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Ac grasos poliinsat (g)", 0.1, 0.02, 's/i', 's/i', 0.04, 0.02, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Ac grasos trans (g)", 0, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Colesterol (mg)", 0, 0, 0, 's/i', 0, 0, 0, 's/i', 's/i', 's/i', 0, 's/i', 's/i', 's/i']
        ]
    },
    {
        title: "2.16 Refrescos en Polvo",
        headers: ["Nutriente / Factor Dietético", "Refresco polvo bajo en calorías⁴", "Refresco polvo light durazno³", "Refresco polvo light naranja³", "Refresco polvo light piña³"],
        data: [
            ["Energía (kcal)", 366, 155, 225, 125],
            ["Humedad (g)", 's/i', 5.5, 3.6, 's/i'],
            ["Cenizas (g)", 's/i', 3.4, 2.5, 's/i'],
            ["Proteínas (g)", 0, 0, 1.7, 1.5],
            ["H de C disp. (g)", 81, 12, 54.8, 29.8],
            ["Azúcares totales (g)", 80, 's/i', 23.3, 29.9],
            ["Fibra dietética total (g)", 's/i', 52, 's/i', 0],
            ["Lípidos totales (g)", 's/i', 0, 0, 0],
            ["Ac grasos sat (g)", 's/i', 's/i', 's/i', 's/i'],
            ["Ac grasos monoinsat (g)", 's/i', 's/i', 's/i', 's/i'],
            ["Ac grasos poliinsat (g)", 's/i', 's/i', 's/i', 's/i'],
            ["Ac grasos trans (g)", 's/i', 's/i', 's/i', 's/i'],
            ["Colesterol (mg)", 's/i', 's/i', 's/i', 's/i']
        ]
    },
    {
        title: "2.17 Bebidas",
        headers: ["Nutriente / Factor Dietético", "Agua tónica¹", "Bebida cola light¹", "Bebida cola tradicional¹", "Bebida energética¹", "Bebida gaseosa sabor limón¹", "Bebida gaseosa sabor naranja¹", "Bebida gaseosa sabor piña¹", "Bebida gaseosa sabor pera libre de azúcar³", "Bebida isotónica³", "Bebida isotónica sabor lima limón³"],
        data: [
            ["Energía (kcal)", 34, 0, 42, 43, 41, 45, 40, 1, 32, 24],
            ["Humedad (g)", 91.1, 99.6, 89.4, 89.2, 89.5, 87.5, 89.8, 99.9, 91.9, 's/i'],
            ["Cenizas (g)", 0.1, 0, 0.1, 0.1, 0.1, 0.1, 0, 0, 0.2, 's/i'],
            ["Proteínas (g)", 0, 0.1, 0, 0, 0, 0, 0.1, 0, 0.2, 's/i'],
            ["H de C disp. (g)", 8.8, 0, 10.4, 10.2, 10.4, 12.3, 10.1, 0.2, 7.8, 6],
            ["Azúcares totales (g)", 8.8, 0, 10.4, 10.2, 10.4, 's/i', 's/i', 0, 6.9, 's/i'],
            ["Fibra dietética total (g)", 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 's/i'],
            ["Lípidos totales (g)", 's/i', 's/i', 's/i', 's/i', 's/i', 0, 0, 's/i', 0, 's/i'],
            ["Ac grasos sat (g)", 's/i', 's/i', 0, 's/i', 's/i', 0, 0, 's/i', 0.01, 's/i'],
            ["Ac grasos monoinsat (g)", 0, 0, 0, 0, 0, 0, 0, 's/i', 0.01, 0],
            ["Ac grasos poliinsat (g)", 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0.03, 0],
            ["Ac grasos trans (g)", 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Colesterol (mg)", 0, 0, 0, 0, 0, 0, 0, 's/i', 0, 's/i']
        ]
    },
    {
        title: "2.18 Bebidas Alcoholicas",
        headers: ["Nutriente / Factor Dietético", "Cerveza¹", "Champaña¹", "Licor de café³", "Licor de menta³", "Martini¹", "Pisco³", "Pisco sour³", "Ron³", "Vodka¹", "Whisky¹", "Vino blanco³", "Vino tinto³", "Vino tinto³"],
        data: [
            ["Energía (kcal)", 51, 77, 325, 351, 223, 210, 185, 231, 230, 240, 81, 82, 84],
            ["Humedad (g)", 92, 's/i', 31, 28.3, 's/i', 's/i', 88.9, 66.6, 66.6, 63.9, 86.9, 86.5, 97.3],
            ["Cenizas (g)", 0.2, 's/i', 0.1, 0, 's/i', 's/i', 0, 0, 0, 0, 0.2, 0.3, 0.4],
            ["Proteínas (g)", 0.5, 0.2, 0.1, 0.1, 's/i', 0, 0, 0, 0, 's/i', 0.1, 0.1, 0.1],
            ["H de C disp. (g)", 3.4, 's/i', 52.5, 71.4, 's/i', 's/i', 14.3, 33.4, 33.4, 36.1, 3.3, 0.6, 1.6],
            ["Azúcares totales (g)", 's/i', 's/i', 38.3, 41.6, 's/i', 's/i', 's/i', 0, 0, 0.1, 1, 0.6, 's/i'],
            ["Fibra dietética total (g)", 0, 's/i', 0, 0, 's/i', 0, 0.1, 0, 0, 's/i', 0, 0, 's/i'],
            ["Lípidos totales (g)", 0, 's/i', 0, 0, 's/i', 's/i', 's/i', 's/i', 0, 's/i', 0, 0, 's/i'],
            ["Ac grasos sat (g)", 0, 's/i', 0.11, 0.01, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0, 0, 's/i'],
            ["Ac grasos monoinsat (g)", 0, 's/i', 0.02, 0, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0, 0, 's/i'],
            ["Ac grasos poliinsat (g)", 0, 's/i', 0.11, 0.11, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0, 0, 's/i'],
            ["Ac grasos trans (g)", 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0, 0, 's/i'],
            ["Colesterol (mg)", 0, 0, 0, 0, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0, 0, 's/i']
        ]
    },
    {
        title: "2.19 Productos Salados",
        headers: ["Nutriente / Factor Dietético", "Hojuelas papas fritas²", "Hojuelas papas fritas sabor crema y cebolla³", "Suflé sabor queso²"],
        data: [
            ["Energía (kcal)", 500, 485, 510],
            ["Humedad (g)", 1.2, 2.5, 1.6],
            ["Cenizas (g)", 's/i', 's/i', 's/i'],
            ["Proteínas (g)", 5.7, 6.1, 6.2],
            ["H de C disp. (g)", 59.7, 57.8, 64.5],
            ["Azúcares totales (g)", 0.6, 4.3, 1.2],
            ["Fibra dietética total (g)", 3.6, 4.5, 's/i'],
            ["Lípidos totales (g)", 26.5, 25.5, 25.2],
            ["Ac grasos sat (g)", 2.22, 1.68, 3.18],
            ["Ac grasos monoinsat (g)", 16.29, 16.2, 11.83],
            ["Ac grasos poliinsat (g)", 6.71, 1.45, 1.18],
            ["Ac grasos trans (g)", 0, 0.4, 0],
            ["Colesterol (mg)", 0, 0.07, 0]
        ]
    },
    {
        title: "2.20 Salsas",
        headers: ["Nutriente / Factor Dietético", "Pesto¹", "Salsa barbecue³", "Salsa blanca casera¹", "Salsa de tomates¹", "Salsa de tomates²", "Salsa de tomates con concha³", "Salsa tártara³", "Salsa teriyaki³", "Salsa verde³"],
        data: [
            ["Energía (kcal)", 418, 172, 105, 36, 47, 42, 211, 89, 38],
            ["Humedad (g)", 39.1, 54.7, 29.7, 91.1, 's/i', 95.1, 67, 72.7, 89.1],
            ["Cenizas (g)", 7.5, 3.1, 1.6, 1.5, 's/i', 2.2, 7, 10.4, 1.1],
            ["Proteínas (g)", 9.8, 0.8, 3.8, 1.2, 1.7, 3.6, 2, 5.9, 1.1],
            ["H de C disp. (g)", 8.3, 39.9, 7.3, 3.8, 's/i', 8.2, 12.8, 15.8, 4.5],
            ["Azúcares totales (g)", 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 2.8, 14.1, 3.3],
            ["Fibra dietética total (g)", 1.6, 0.1, 0.1, 0.3, 0.2, 0.2, 1.6, 0.6, 1.9],
            ["Lípidos totales (g)", 37.6, 0.6, 8.7, 0.3, 0.2, 0.2, 16.7, 0, 1.9],
            ["Ac grasos sat (g)", 7.07, 0.08, 2.18, 0.04, 's/i', 0.03, 3.33, 0, 0],
            ["Ac grasos monoinsat (g)", 22.16, 0.08, 2.67, 0.12, 's/i', 0.03, 3.61, 0, 0],
            ["Ac grasos poliinsat (g)", 6.89, 0.1, 1.29, 0.12, 's/i', 0.04, 9.84, 0, 0],
            ["Ac grasos trans (g)", 's/i', 0, 0, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Colesterol (mg)", 's/i', 0, 8.6, 0, 's/i', 0, 7, 0, 's/i']
        ]
    },
    {
        title: "2.21 Especias",
        headers: ["Nutriente / Factor Dietético", "Ajo en polvo¹", "Albahaca fresca¹", "Albahaca seca¹", "Azafrán¹", "Canela¹", "Cardamomo³", "Cebolla en polvo³", "Clavo de olor³", "Cúrcuma³", "Curry en polvo³", "Eneldo fresco¹", "Eneldo seco³", "Estragón seco¹", "Hierbabuena¹", "Jengibre¹", "Laurel³", "Locoto deshidratado³", "Locoto fresco³", "Menta verde¹", "Menta verde seca¹", "Merkén³", "Nuez moscada¹", "Orégano seco¹", "Paprika¹", "Pimentón deshidratado³", "Perejil fresco¹", "Perejil seco³", "Pimienta blanca³", "Pimienta negra¹", "Pimienta roja¹", "Romero fresco¹", "Romero seco³", "Sal de mar³", "Sal de mesa³", "Semilla de amapola¹", "Semilla de comino³", "Semilla de hinojo³", "Semilla de mostaza³", "Tomillo fresco¹", "Tomillo seco¹"],
        data: [
            ["Energía (kcal)", 331, 23, 233, 310, 247, 311, 341, 274, 312, 325, 43, 253, 295, 70, 335, 313, 323, 23, 44, 285, 156, 525, 265, 282, 249, 36, 251, 296, 251, 318, 131, 331, 0, 0, 525, 375, 345, 508, 101, 276],
            ["Humedad (g)", 6.5, 92.1, 10.4, 11.9, 10.6, 8.3, 5.4, 9.9, 12.9, 8.8, 85.6, 7.3, 7.7, 78.7, 9.9, 5.6, 4.2, 90, 86.6, 11.3, 11.7, 6.2, 9.9, 11.2, 14, 87.71, 5.9, 11.4, 12.5, 8.1, 67.8, 9.3, 's/i', 0.2, 6, 8.1, 8.8, 6.3, 65.1, 7.8],
            ["Cenizas (g)", 3.5, 1.5, 14.9, 5.5, 3.6, 5.8, 4, 6, 9.7, 6.1, 2.5, 11.8, 12.8, 1.8, 5.2, 8.6, 9.5, 0.2, 2, 1, 21.7, 2.3, 7.9, 7.7, 4.3, 2.2, 11.4, 1.6, 4.5, 6, 2.4, 6.5, 95, 99.8, 6.4, 7, 8.4, 4.3, 2.2, 11.1],
            ["Proteínas (g)", 16.6, 3.2, 23, 11.4, 4, 10.8, 10.4, 6, 9.7, 14.3, 0.7, 20, 22.8, 3.8, 9.9, 7.6, 9.6, 1.5, 3.3, 19.9, 10.2, 5.8, 9, 14.1, 10.3, 2.97, 11, 10.4, 10.4, 10.3, 3.3, 4.9, 0, 0, 18, 17.8, 15.8, 26.1, 2.2, 9.1],
            ["H de C disp. (g)", 63.7, 1.1, 18.5, 61.5, 40.5, 40.5, 63.9, 31.6, 44.4, 2.6, 4.9, 42.2, 42.8, 6.9, 57.5, 48.7, 74.9, 3.7, 1.6, 22.7, 52.3, 3, 23.6, 19.1, 52.3, 0.85, 7.3, 25.6, 41.1, 29.4, 14.1, 42.6, 0, 0, 8.6, 33.7, 12.5, 15.9, 10.5, 26.9],
            ["Azúcares totales (g)", 2.4, 0.3, 's/i', 's/i', 2.2, 's/i', 's/i', 's/i', 's/i', 's/i', 2.1, 's/i', 's/i', 0, 14.1, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 30.6, 4.1, 's/i', 's/i', 3.3, 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 0, 0, 3, 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Fibra dietética total (g)", 9, 1.6, 37.7, 's/i', 53.1, 21.6, 15.3, 13, 33.7, 33.2, 2.3, 15.6, 7.4, 8, 4.2, 2.8, 's/i', 0.2, 6.8, 29.8, 32.3, 28, 42.5, 34.9, 20.4, 3.3, 26.7, 26.2, 25.3, 27.2, 5.3, 15.3, 's/i', 's/i', 19.5, 's/i', 39.8, 36.2, 1.7, 7.4],
            ["Lípidos totales (g)", 0.7, 0.6, 4.1, 5.9, 1.2, 6.7, 1, 13, 3.3, 14, 0.6, 4.4, 1.88, 0.7, 7.2, 5.4, 2.8, 0.2, 0.7, 6.8, 0.4, 36.3, 4.1, 12.9, 's/i', 0.179, 5.5, 2.1, 3.3, 17.1, 5.9, 5.5, 's/i', 0, 28.57, 22.3, 16.9, 36.2, 1.7, 7.4],
            ["Ac grasos sat (g)", 0.25, 's/i', 0.04, 2.16, 1.09, 0.68, 0.22, 3.95, 1.84, 1.65, 0.05, 0.23, 1.88, 0.25, 2.8, 1.62, 1.28, 's/i', 0.19, 1.58, 's/i', 23.54, 1.55, 2.14, 's/i', 0.042, 1.48, 1.79, 1.59, 2.96, 1.84, 7.37, 's/i', 0, 4.45, 1.54, 0.48, 1.99, 0.47, 2.73],
            ["Ac grasos monoinsat (g)", 0.12, 0.09, 1.24, 0.43, 0.25, 0.87, 0.2, 1.39, 0.45, 5.76, 0.8, 's/i', 0.47, 0.03, 0.91, 2.29, 0.29, 's/i', 0.03, 3.26, 's/i', 0.72, 0.2, 1.7, 's/i', 0.026, 0.76, 0.79, 0.74, 2.75, 1.16, 1.01, 's/i', 0, 5.98, 14.04, 1.69, 22.52, 0.08, 1.12],
            ["Ac grasos poliinsat (g)", 0.18, 0.39, 0.5, 2.07, 0.07, 0.73, 0.31, 0.34, 0.4, 5.96, 0.1, 's/i', 0.47, 0.51, 0.91, 1.28, 's/i', 's/i', 0.18, 1.51, 's/i', 0.22, 1.37, 7.77, 's/i', 0.124, 3.12, 0.62, 1, 8.37, 0.9, 2.34, 's/i', 0, 28.57, 3.28, 's/i', 10.03, 0.13, 1.15],
            ["Ac grasos trans (g)", 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i', 's/i'],
            ["Colesterol (mg)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 's/i', 's/i', 's/i', 's/i', 0, 0, 0, 's/i', 0, 0, 's/i', 's/i', 's/i', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    }
];
