export interface PautaAlimentariaInfo {
  id: string;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  alimentosFavorecer: string[];
  alimentosEvitar: string[];
  recomendacionesGenerales: string[];
}

export const PAUTAS_ALIMENTARIAS: PautaAlimentariaInfo[] = [
  {
    id: 'erc',
    nombre: 'Enfermedad Renal Crónica (ERC)',
    subtitulo: 'Cuidado renal y control de solutos (Sodio, Potasio y Fósforo)',
    descripcion: 'Pauta para proteger la función renal residual, prevenir la acumulación de toxinas urémicas y controlar electrolitos (fósforo, potasio y sodio).',
    alimentosFavorecer: [
      'Proteínas magras en porción controlada: clara de huevo, pechuga de pollo, pavo o pescado fresco.',
      'Verduras bajas o moderadas en potasio: zapallo italiano, zanahoria, pepino, lechuga, porotos verdes.',
      'Técnica de remojo prolongado (12-24h) y doble cocción en abundante agua (desechando el caldo) para reducir potasio.',
      'Frutas bajas en potasio: manzana, pera, piña, arándanos, sandía en porción moderada.',
      'Carbohidratos energéticos sin fósforo añadido: arroz blanco, fideos, maicena, pan blanco sin sal.',
      'Aceites vegetales crudos: aceite de oliva virgen o canola en crudo como aporte calórico.',
      'Agua e infusiones claras según la indicación médica de balance de líquidos.'
    ],
    alimentosEvitar: [
      'Sal de mesa y alimentos altos en sodio (embutidos, cecinas, caldos en cubo, conservas, snacks).',
      'Sustitutos de sal (BioSal, sales dietéticas) por contener cloruro de potasio altamente peligroso.',
      'Frutas y vegetales muy ricos en potasio: plátano, naranja, kiwi, melón, palta, tomate y espinacas.',
      'Lácteos enteros, quesos maduros y yogurt en grandes cantidades (alto contenido de fósforo).',
      'Bebidas gaseosas oscuras (tipo cola) y ultraprocesados con aditivos de fósforo inorgánico.',
      'Frutos secos, semillas, legumbres sin técnica de doble cocción, cacao y chocolates.',
      'Vísceras e interiores (hígado, riñón, panas, sesos).'
    ],
    recomendacionesGenerales: [
      'Aplicar siempre técnica de doble cocción: pelar, picar, remojar 12-24 hrs, cambiar agua y hervir dos veces desechando el caldo.',
      'No consumir sustitutos de sal light/diet ya que reemplazan el sodio por potasio.',
      'Controlar estrictamente el volumen de líquidos diario si presenta edema o restricción hídrica.',
      'Monitorear periódicamente niveles de Creatinina, RAC, Potasio, Fósforo y Calcio en su CESFAM.'
    ]
  },
  {
    id: 'alergia_urticaria',
    nombre: 'Alergia Alimentaria y Urticaria Aguda',
    subtitulo: 'Dieta hipoalergénica y baja en histamina / liberadores de histamina',
    descripcion: 'Pauta de exclusión transitoria para estabilizar la reactividad cutánea e inmunológica durante cuadros de urticaria aguda o alergia en estudio.',
    alimentosFavorecer: [
      'Carnes muy frescas preparadas al momento: pechuga de pollo o pavo cocinadas inmediatamente (no recalentadas).',
      'Cereales naturales bien tolerados: arroz blanco, avena tradicional, papas al vapor o cocidas.',
      'Verduras frescas de bajo potencial alergénico: zapallo italiano, zanahoria, lechuga hidropónica, pepino, zapallo camote.',
      'Frutas seguras de baja reactividad: manzana cocida o pelada, pera pelada.',
      'Aceite de oliva virgen extra en pequeña cantidad.',
      'Agua pura filtrada e infusiones suaves naturales (manzanilla, tilo) sin hierbas compuestas.',
      'Pan batido / marraqueta tradicional simple recién horneada (sin aditivos de bollería).'
    ],
    alimentosEvitar: [
      'Pescados, mariscos y conservas enlatadas (atún, sardinas, mariscos en lata ricos en histamina).',
      'Embutidos, cecinas, fiambres, salchichas, salame y carnes curadas o ahumadas.',
      'Quesos madurados, queso azul, quesos fermentados y leches no frescas.',
      'Frutos secos (maní, nueces, almendras, castañas) y semillas.',
      'Frutas ricas en histamina: frutillas, frambuesas, piña, kiwi, cítricos (naranja, limón), plátano muy maduro.',
      'Vegetales liberadores de histamina: tomate, espinaca, berenjena, palta y chucrut.',
      'Chocolates, cacao, café, bebidas cola, té negro y alcohol.',
      'Colorantes artificiales (tartrazina E102, amarillo crepúsculo) y conservantes (sulfitos, benzoatos).',
      'Condimentos fuertes, ají, mostaza, salsa de soya, vinagre y alimentos fermentados.'
    ],
    recomendacionesGenerales: [
      'Consumir alimentos siempre recién preparados; evitar sobras refrigeradas por varios días que acumulan histamina.',
      'Evitar medicamentos tipo AINEs (aspirina, ibuprofeno, ketoprofeno, naproxeno) salvo indicación médica expresa.',
      'Mantener un registro de alimentos si nota exacerbación de ronchas o picazón.',
      'Acudir de inmediato a urgencias ante signos de alarma: dificultad para respirar, hinchazón de labios, lengua o párpados (angioedema).'
    ]
  },
  {
    id: 'colelitiasis',
    nombre: 'Colelitiasis y Cólico Biliar (Baja en Grasas)',
    subtitulo: 'Régimen hepatobiliar no colecistoquinético',
    descripcion: 'Pauta diseñada para prevenir la contracción brusca de la vesícula biliar y reducir el riesgo de cólico biliar agudo.',
    alimentosFavorecer: [
      'Carnes muy magras sin grasa visible: pechuga de pollo sin piel, pavo, posta rosada cocidas al vapor, plancha u horno.',
      'Pescados blancos magros al agua o vapor (merluza, reineta, corvina).',
      'Claras de huevo (la proteína de la clara no estimula la vesícula; evitar la yema).',
      'Lácteos 100% descremados: leche descremada, quesillo fresco desgrasado, yogurt 0% grasa.',
      'Cereales refinados suaves: arroz blanco, fideos, sémola, maicena, papas cocidas al agua.',
      'Verduras cocidas no meteorizantes: zanahoria, zapallo, zapallo italiano sin cáscara ni semillas.',
      'Frutas cocidas, compotas o asadas: manzana, pera, durazno al agua sin azúcar.',
      'Pan batido / marraqueta sin miga tostado; galletas de agua sin manteca.',
      'Líquidos abundantes: agua pura e infusiones claras de hierbas (manzanilla, boldo liviano).'
    ],
    alimentosEvitar: [
      'Frituras de cualquier tipo, rebozados, empanizados y salteados con abundante aceite.',
      'Carnes grasas, cerdo, cordero, interiores, costillares, embutidos, longanizas, vienesas, paté.',
      'Yema de huevo y mayonesa comercial o casera.',
      'Grasas visibles: manteca, mantequilla, margarina, crema de leche, nata.',
      'Quesos maduros, amarillos, chanco, gauda, queso crema o mantecoso.',
      'Palta, aceitunas, frutos secos (nueces, maní, almendras) y semillas grasas.',
      'Chocolates, tortas, pasteles de crema, donas y bollería industrial.',
      'Verduras meteorizantes o irritantes: coliflor, repollo, brócoli, cebolla cruda, ajo, legumbres con piel.',
      'Condimentos picantes, ají, pimienta, alcohol y café en exceso.'
    ],
    recomendacionesGenerales: [
      'Fraccionar la alimentación en 4 a 5 comidas diarias de volúmenes reducidos.',
      'Emplear cocciones simples: al agua, al vapor, a la plancha sin aceite o al horno.',
      'Evitar acostarse inmediatamente tras comer; esperar al menos 1 hora y media.',
      'Consultar a urgencias ante: dolor continuo en hipocondrio derecho irradiado a la espalda, fiebre o coloración amarilla de ojos (ictericia).'
    ]
  },
  {
    id: 'aplv',
    nombre: 'Alergia a la Proteína de Leche de Vaca (APLV)',
    subtitulo: 'Régimen estricto de exclusión láctea y derivados bovinos',
    descripcion: 'Pauta para pacientes con APLV o madres en período de lactancia materna exclusiva, eliminando toda proteína láctea y reactividad cruzada.',
    alimentosFavorecer: [
      'Carnes frescas naturales no procesadas: pollo, pavo, cerdo magro, pescado fresco, vacuno (si se comprobó tolerancia).',
      'Huevos frescos (si no hay alergia concomitante).',
      'Legumbres naturales bien lavadas y cocidas (lentejas, garbanzos, porotos).',
      'Cereales naturales y tubérculos: arroz, maíz, avena, papas, camote, quínoa.',
      'Todas las frutas y verduras frescas en su estado natural.',
      'Bebidas vegetales fortificadas con calcio (arroz, avena, soya - según edad y criterio pediátrico).',
      'Aceites vegetales 100% puros (oliva, maravilla, girasol) sin aditivos lácteos.',
      'Panadería certificada sin leche ni suero (ej. marraqueta tradicional de panadería confiable sin manteca animal con suero).'
    ],
    alimentosEvitar: [
      'Leche de vaca en todas sus variantes: entera, descremada, condensada, en polvo, evaporada.',
      '¡ATENCIÓN! Productos "SIN LACTOSA": NO SON APTOS (la lactosa es azúcar, pero la alergia es a la PROTEÍNA).',
      'Derivados lácteos: yogurt, mantequilla, crema de leche, quesos de todo tipo, quesillo, ricota, manjar, helados.',
      'Ingredientes lácteos ocultos en etiquetas: suero lácteo (whey), caseína, caseinatos, lactoalbúmina, lactoglobulina.',
      'Leches de otros mamíferos (cabra, oveja, búfala) por alto riesgo de reacción cruzada mayor al 90%.',
      'Procesados con trazas: galletas, queques, masas de hojaldre, pasteles, caldos en cubo y embutidos con ligantes lácteos.',
      'Margarinas comunes (la gran mayoría contiene suero de leche en sus ingredientes).'
    ],
    recomendacionesGenerales: [
      'Leer siempre el etiquetado y advertencias: "Contiene leche o derivados" o "Puede contener trazas de leche".',
      'Evitar contaminación cruzada en el hogar: usar esponjas, tablas, sartenes y tostadoras limpias o exclusivas.',
      'En caso de sospecha de reacción accidental (vómitos bruscos, heces con mucosidad/sangre, eccema severo o anafilaxia): consultar de inmediato.',
      'Asegurar suplementación de Calcio y Vitamina D según indicación del médico o nutricionista.'
    ]
  },
  {
    id: 'celiaquia',
    nombre: 'Celiaquía (Libre de Gluten / Sin TACC)',
    subtitulo: 'Exclusión permanente y total de Trigo, Avena, Cebada y Centeno',
    descripcion: 'Tratamiento médico nutricional de por vida para permitir la regeneración de las vellosidades intestinales y prevenir complicaciones.',
    alimentosFavorecer: [
      'Alimentos naturales sin procesar: carnes frescas de vacuno, pollo, pavo, cerdo y pescados frescos sin marinar.',
      'Huevos frescos de gallina.',
      'Frutas y verduras frescas en su estado natural.',
      'Legumbres secas empacadas y seleccionadas manualmente.',
      'Cereales naturalmente libres de gluten: arroz, maíz (choclo, polenta), quínoa, amaranto, trigo sarraceno (alforfón).',
      'Harinas y féculas permitidas: harina de arroz, almidón de maíz (maicena), fécula de mandioca (tapioca), harina de quínoa.',
      'Frutos secos con cáscara o naturales no tostados en líneas industriales mixtas.',
      'Aceites vegetales puros, sal y azúcar pura.',
      'Productos procesados y envasados con logo oficial "LIBRE DE GLUTEN" / "SIN TACC" (espiga tachada).'
    ],
    alimentosEvitar: [
      'Trigo, Avena*, Cebada y Centeno (TACC) y cualquiera de sus variedades (espelta, kamut, triticale).',
      'Harina de trigo en todas sus formas, sémola, cuscús, salvado de trigo, germen de trigo.',
      'Panes convencionales, galletas, fideos, queques, masas para pizza, empanadas y pasteles tradicionales.',
      'Cervezas tradicionales (elaboradas con cebada o malta) y whisky o bebidas malteadas no certificadas.',
      'Alimentos rebozados, apanados o espesados con harina de trigo (salsas blancas, cremas en sobre).',
      'Salsa de soya tradicional (la gran mayoría se elabora con fermentación de trigo).',
      'Cecinas, patés, embutidos y quesos procesados que no certifiquen condición libre de gluten.',
      'Medicamentos o suplementos que contengan almidón de trigo como excipiente.'
    ],
    recomendacionesGenerales: [
      'La dieta libre de gluten debe ser ESTRICTA y PERMANENTE de por vida; pequeñas trazas invisibles reactivan la inflamación intestinal.',
      'Cuidado extremo con contaminación cruzada en el hogar: tostadora exclusiva, cucharas de madera separadas, limpiar hornos y mesones.',
      'Consultar periódicamente las listas oficiales de alimentos certificados (Fundación Convivir / Coacel / MINSAL Chile).',
      'Al comer fuera de casa, consultar expresamente por la manipulación libre de gluten y evitar freidoras compartidas.'
    ]
  },
  {
    id: 'diabetes',
    nombre: 'Diabetes Mellitus y Resistencia a la Insulina',
    subtitulo: 'Control de índice glicémico y carbohidratos de absorción lenta',
    descripcion: 'Pauta para estabilizar los niveles de glucosa en sangre, mejorar la sensibilidad insulínica y prevenir complicaciones vasculares.',
    alimentosFavorecer: [
      'Verduras de hoja verde y bajo impacto glicémico: espinaca, acelga, lechuga, repollo, apio, pepino, zapallo italiano, brócoli.',
      'Legumbres ricas en fibra soluble (lentejas, garbanzos, porotos) que enlentecen la absorción de carbohidratos.',
      'Cereales integrales en porciones medidas: avena tradicional en hojuelas, quínoa, arroz integral, pan 100% integral.',
      'Proteínas magras: pescados (jurel, salmón, reineta), pollo, pavo sin piel, huevos enteros.',
      'Grasas cardiosaludables en porciones controladas: palta, aceite de oliva virgen, nueces y almendras naturales.',
      'Frutas enteras con cáscara comestible (manzana verde, pera, ciruela, frutos rojos, cítricos en gajos enteros).',
      'Agua pura, infusiones sin azúcar y endulzantes no calóricos aprobados (estevia pura, sucralosa) en moderación.'
    ],
    alimentosEvitar: [
      'Azúcar de mesa, panela, chancaca, miel, jarabes y productos de pastelería.',
      'Bebidas gaseosas azucaradas, néctares, jugos envasados y jugos naturales exprimidos (concentran fructosa libre).',
      'Golosinas, chocolates dulces, helados comunes, galletas y bollería refinada.',
      'Harinas blancas refinadas en exceso (pan blanco, marraqueta grande, fideos comunes en gran volumen).',
      'Productos ultraprocesados con sellos "Alto en Azúcares" y "Alto en Calorías".',
      'Alcohol en todas sus formas (riesgo de descontrol metabólico e hipoglicemias tardías).'
    ],
    recomendacionesGenerales: [
      'Distribuir las comidas en horarios regulares para evitar variaciones bruscas de glicemia.',
      'Consumir la fruta siempre entera y con cáscara, nunca en jugo exprimido.',
      'Aplicar el método del plato: 1/2 plato de verduras crudas o cocidas, 1/4 de proteínas magras y 1/4 de carbohidratos integrales.',
      'Realizar actividad física regular según indicación médica para optimizar la captación periférica de glucosa.'
    ]
  },
  {
    id: 'hipertension',
    nombre: 'Hipertensión Arterial (Dieta Hiposódica / DASH)',
    subtitulo: 'Reducción de sodio y aporte óptimo de Potasio, Magnesio y Calcio',
    descripcion: 'Pauta de alimentación para optimizar las cifras de presión arterial, proteger el endotelio vascular y reducir el riesgo cardiovascular.',
    alimentosFavorecer: [
      'Abundantes verduras y hortalizas frescas crudas y cocidas diariamente.',
      'Frutas frescas de temporada consumidas enteras.',
      'Condimentos y hierbas naturales para realzar sabor: orégano, albahaca, romero, tomillo, ajo, limón, comino, laurel, ciboulette, paprika.',
      'Lácteos descremados sin sal añadida (leche descremada, quesillo bajo en sodio).',
      'Pescados de mar ricos en omega-3 (jurel, atún, salmón, sardina) preparados al horno o vapor.',
      'Carnes blancas magras (pollo, pavo) cocinadas sin sal agregada.',
      'Legumbres y granos enteros sin sazonadores procesados.',
      'Agua de la llave o aguas minerales bajas en sodio (menos de 20 mg/L).'
    ],
    alimentosEvitar: [
      'Sal de mesa añadida al cocinar o en el plato (retirar el salero de la mesa).',
      'Caldos concentrados en cubos o polvos saborizantes, sopas instantáneas de sobre.',
      'Cecinas, embutidos y carnes curadas (jamón serrano, salame, vienesas, mortadela, paté).',
      'Quesos madurados salados, mantecosos, parmesano y quesos fundidos en láminas.',
      'Alimentos en conserva, salmuera o encurtidos (aceitunas, pepinillos en vinagre salado, mariscos enlatados).',
      'Snacks envasados salados (papas fritas, ramitas, maní salado, galletas saladas).',
      'Salsas comerciales de alto contenido de sodio: salsa de soya, kétchup, mostaza regular, salsa inglesa.',
      'Medicamentos efervescentes que contienen bicarbonato de sodio en su composición.'
    ],
    recomendacionesGenerales: [
      'Meta diaria de sal: menos de 5 gramos al día (1 cucharadita de café rasa distribuida en todo el día).',
      'Leer etiquetas nutricionales: preferir alimentos con menos de 140 mg de sodio por porción.',
      'Reemplazar totalmente el salero de la mesa por hierbas aromáticas y especias.',
      'Limitar o suspender el consumo de alcohol y bebidas energéticas.'
    ]
  },
  {
    id: 'dislipidemia',
    nombre: 'Dislipidemia y Protección Cardiovascular',
    subtitulo: 'Dieta cardioprotectora baja en grasas saturadas y azúcares simples',
    descripcion: 'Pauta orientada a reducir el colesterol LDL, disminuir triglicéridos y aumentar el colesterol protector HDL.',
    alimentosFavorecer: [
      'Fibra soluble atrapadora de colesterol: avena integral en hojuelas, legumbres (porotos, lentejas), salvado de avena.',
      'Pescados ricos en ácidos grasos Omega-3 consumidos 2 veces por semana (jurel, salmón, caballa, sardinas).',
      'Aceite de oliva extra virgen consumido en crudo sobre ensaladas.',
      'Frutos secos naturales sin sal ni azúcar (nueces, almendras: 1 puñado de 30g al día).',
      'Palta en porciones controladas (1/4 a 1/2 diaria por su aporte de ácido oleico).',
      'Verduras variadas crudas y cocidas en almuerzos y cenas.',
      'Frutas frescas con piel comestible bien lavada (manzanas, peras, frutos rojos).',
      'Semillas de chía o linaza molidas adicionadas a las preparaciones.'
    ],
    alimentosEvitar: [
      'Grasas saturadas y grasas trans: manteca, margarinas hidrogenadas, grasa animal visible, piel del pollo.',
      'Vísceras y menudencias: hígado, riñones, sesos, interiores (altos en colesterol directo).',
      'Carnes rojas grasas, costillares, embutidos y cecinas grasas.',
      'Lácteos enteros, crema de leche, mantequilla, quesos mantecosos y maduros.',
      'Frituras y alimentos ultraprocesados fritos.',
      'Azúcares refinados, pastelería y harinas refinadas (principal factor elevador de triglicéridos).',
      'Bebidas alcohólicas (su consumo eleva inmediatamente los triglicéridos en sangre).'
    ],
    recomendacionesGenerales: [
      'Si predominan Triglicéridos Altos: erradicar azúcares simples, harinas blancas refinadas y alcohol.',
      'Si predomina Colesterol LDL Alto: erradicar grasas saturadas, embutidos, piel de aves y frituras.',
      'Mantener actividad física aeróbica al menos 30 minutos al día para estimular el colesterol HDL.'
    ]
  },
  {
    id: 'gota_hiperuricemia',
    nombre: 'Hiperuricemia y Gota (Baja en Purinas)',
    subtitulo: 'Reducción de ácido úrico y prevención de tofos y nefrolitiasis',
    descripcion: 'Pauta para prevenir ataques agudos de artritis gotosa y favorecer la excreción renal de ácido úrico.',
    alimentosFavorecer: [
      'Abundante hidratación con agua pura: al menos 2 a 2.5 litros al día para facilitar la excreción urinaria de uratos.',
      'Lácteos descremados (leche descremada, yogurt 0% grasa): tienen efecto uricosúrico demostrado.',
      'Cereales refinados: arroz blanco, fideos, avena, pan tradicional.',
      'Huevos frescos de gallina (bajo contenido en purinas).',
      'Frutas ricas en vitamina C y antioxidantes: cerezas, frutillas, arándanos, cítricos, manzana.',
      'Verduras variadas (las purinas vegetales no incrementan el riesgo de ataques de gota).',
      'Café moderado (se asocia a menor riesgo de hiperuricemia).'
    ],
    alimentosEvitar: [
      'Vísceras y menudencias: hígado, riñón, mollejas, sesos, corazón, caldos concentrados de carne.',
      'Carnes rojas en exceso (vacuno, cordero, cerdo) y carnes de caza.',
      'Mariscos (machas, choritos, almejas, camarones, locos) y pescados azules pequeños (anchoas, sardinas).',
      'Bebidas alcohólicas, con especial énfasis en la CERVEZA (incluso sin alcohol, por su contenido de guanosina) y licores destilados.',
      'Bebidas azucaradas con jarabe de maíz de alta fructosa (gaseosas y jugos comerciales).',
      'Ayunos prolongados y dietas hiperproteicas extremas (pueden precipitar ataques agudos).'
    ],
    recomendacionesGenerales: [
      'Mantener ingesta abundante de agua a lo largo del día para alcalinizar y diluir la orina.',
      'Erradicar el consumo de cerveza y gaseosas azucaradas, principales detonantes de crisis de gota.',
      'No iniciar ni suspender medicamentos hipouricemiantes durante una crisis aguda sin supervisión médica.'
    ]
  },
  {
    id: 'erge_gastritis',
    nombre: 'Reflujo Gastroesofágico (ERGE) y Gastritis',
    subtitulo: 'Régimen gástrico no irritante y protector esofagogástrico',
    descripcion: 'Pauta destinada a reducir la acidez gástrica, prevenir el reflujo hacia el esófago y aliviar el ardor o pirosis.',
    alimentosFavorecer: [
      'Carnes magras blandas: pechuga de pollo cocida o a la plancha, pavo, pescado blanco al vapor.',
      'Cereales suaves: arroz blanco, fideos finos, sémola, avena cocida, papas al vapor.',
      'Pan blanco tostado (el tostado facilita la digestión y reduce la fermentación gástrica).',
      'Verduras cocidas suaves sin cáscara ni pepas: zapallo italiano, zanahoria, zapallo camote.',
      'Frutas no ácidas maduras o cocidas: manzana cocida, compota de pera, plátano maduro.',
      'Lácteos descremados si son bien tolerados (leche descremada, quesillo fresco).',
      'Líquidos a temperatura tibia: agua pura fuera de las comidas, manzanilla o tilo livianos.'
    ],
    alimentosEvitar: [
      'Café (con o sin cafeína), té negro cargado, mate y bebidas energéticas.',
      'Chocolate, cacao y productos mentolados / menta / hierbabuena (relajan directamente el esfínter esofágico inferior).',
      'Cítricos (limón, naranja, pomelo, kiwi) y frutas muy ácidas.',
      'Tomate, salsas de tomate, kétchup y concentrados de tomate.',
      'Cebolla cruda, ajo, pimentón, ají, pimienta y condimentos picantes.',
      'Bebidas gaseosas y carbonatadas (aumentan la presión gástrica e inducen eructos con ácido).',
      'Frituras, comidas muy grasas y embutidos (retrasan el vaciamiento gástrico).',
      'Bebidas alcohólicas y tabaco (irritan directamente la mucosa y debilitan el esfínter).'
    ],
    recomendacionesGenerales: [
      'No acostarse hasta transcurridas al menos 2 a 3 horas después de cenar.',
      'Elevar la cabecera de la cama 15 a 20 cm (usando tacos en las patas delanteras, no solo almohadas).',
      'Comer porciones moderadas, masticando despacio y evitando beber grandes volúmenes de líquido durante la comida.',
      'Evitar el uso de ropa o cinturones ajustados a nivel abdominal.'
    ]
  },
  {
    id: 'constipacion',
    nombre: 'Constipación y Tránsito Lento (Rica en Fibra)',
    subtitulo: 'Aporte óptimo de fibra dietética, mucílagos e hidratación efectiva',
    descripcion: 'Pauta para aumentar el volumen fecal, mejorar la consistencia de las deposiciones y regularizar el hábito intestinal.',
    alimentosFavorecer: [
      'Abundante ingesta de líquidos: mínimo 2 a 2.5 litros de agua al día (la fibra requiere agua para ablandar las heces).',
      'Frutas laxantes con piel y pulpa: kiwi, ciruela fresca o ciruelas pasas hidratadas, naranja con hollejo, pera con piel.',
      'Verduras de hoja verde y hortalizas: espinaca, acelga, brócoli, lechuga, alcachofa, zapallo.',
      'Legumbres con hollejo: lentejas, garbanzos, porotos consumidos 2 a 3 veces por semana.',
      'Cereales integrales verdaderos: salvado de trigo, avena entera, pan de harina integral, quínoa.',
      'Semillas ricas en mucílagos: semillas de chía o linaza dejadas en remojo en agua la noche anterior.',
      'Aceite de oliva virgen extra en crudo (lubricante natural del bolo fecal).'
    ],
    alimentosEvitar: [
      'Arroz blanco en exceso y fideos blancos sin acompañamiento de vegetales.',
      'Plátano verde o poco maduro, manzana rallada oxidada, membrillo y caqui (efecto astringente).',
      'Harinas muy refinadas, pan blanco masudo, galletas de agua, masas de repostería.',
      'Té negro concentrado y bebidas astringentes.',
      'Quesos duros y maduros consumidos en exceso.',
      'Alimentos ultraprocesados y comida rápida pobres en fibra y micronutrientes.'
    ],
    recomendacionesGenerales: [
      'Consumir semillas de chía o linaza activadas: remojar 1 cucharada sopera en medio vaso de agua durante la noche y beberlo en la mañana.',
      'Establecer un horario regular para ir al baño respetando el reflejo gastrocólico sin postergar.',
      'Adoptar postura adecuada al defecar: usar un banquito bajo los pies para simular posición de cuclillas.',
      'Realizar caminatas diarias de al menos 30 minutos para estimular los movimientos peristálticos.'
    ]
  },
  {
    id: 'higado_graso',
    nombre: 'Esteatosis Hepática (Hígado Graso No Alcohólico)',
    subtitulo: 'Reducción de fructosa libre, lípidos hepáticos y resistencia insulínica',
    descripcion: 'Pauta para reducir el acúmulo de grasa intrahepática, disminuir la inflamación y prevenir progresión fibrótica.',
    alimentosFavorecer: [
      'Verduras crucíferas y de hoja verde: brócoli, coliflor, repollo, espinacas, rúcula.',
      'Pescados ricos en omega-3 (jurel, salmón, sardina) por su efecto antiinflamatorio hepático.',
      'Aceite de oliva extra virgen en crudo.',
      'Frutos secos (especialmente nueces en cantidad moderada: 4-5 unidades al día).',
      'Legumbres y granos enteros integrales en porciones medidas.',
      'Café de grano (2 a 3 tazas al día han demostrado efecto hepatoprotector y antifibrótico).',
      'Agua pura abundante e infusiones sin azúcar.'
    ],
    alimentosEvitar: [
      'Fructosa refinada y jarabe de maíz de alta fructosa (en gaseosas, jugos envasados, néctares y golosinas).',
      'Bebidas alcohólicas en todas sus formas (es fundamental la abstinencia alcohólica estricta).',
      'Grasas trans y saturadas: embutidos, manteca, comida chatarra frita.',
      'Pasteles, galletas, bollería y harinas refinadas.',
      'Bebidas energéticas y azucaradas.'
    ],
    recomendacionesGenerales: [
      'La reducción gradual del 5% al 10% del peso corporal revierte significativamente la esteatosis hepática.',
      'Evitar absolutamente el consumo de alcohol y productos endulzados con jarabe de fructosa.',
      'Realizar ejercicio físico regular combinando entrenamiento aeróbico con ejercicios de fuerza muscular.'
    ]
  }
];

export const getPautaById = (id: string): PautaAlimentariaInfo | undefined => {
  return PAUTAS_ALIMENTARIAS.find(p => p.id === id);
};

