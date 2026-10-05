import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Copy, 
  Check, 
  Clipboard, 
  FileText, 
  Sparkles,
  Stethoscope,
  Search,
  UserCheck,
  Activity,
  Pill,
  ShieldAlert,
  Trash2
} from 'lucide-react';
import { User } from '../types';
import CopyButton from './CopyButton';
import SmartAntecedentesTextarea from './SmartAntecedentesTextarea';
import SmartFarmacosTextarea from './SmartFarmacosTextarea';

interface SapuMenuProps {
  onBackToMenu: () => void;
  loggedInUser: User;
}

export interface DrugItem {
  id: string;
  name: string;
  dosis: string;
  presentacion: string;
  defaultCantidad?: number;
  defaultHoras?: number;
  defaultDias?: number;
}

export interface Pathology {
  id: string;
  name: string;
  category: string;
  anamnesis: string;
  exam: string;
  actuacion: string;
  farmacos?: DrugItem[];
}

export const PATHOLOGIES: Pathology[] = [
  {
    id: 'normal',
    name: 'Examen Físico Normal / Control General',
    category: 'General',
    anamnesis: 'Paciente consulta por evaluación general o control preventivo. Refiere sentirse en buenas condiciones de salud, sin sintomatología aguda, dolor, fiebre ni dificultades respiratorias recientes. Hábitos y apetito conservados, diuresis y deposiciones normales.',
    exam: 'Buen estado general, lúcido, orientado en tiempo, espacio y persona, cooperador. Hidratado y perfundido, llene capilar < 2 seg. Faringe normal sin exudado. Otoscopia normal bilateral. Pulmonar: Simétrico, expansibilidad conservada, murmullo pulmonar presente bidireccional sin ruidos agregados. Cardiovascular: Ruidos cardiacos rítmicos y regulares, sin soplos. Abdomen: Blando, depresible, indoloro a la palpación, ruidos hidroaéreos normales. Extremidades: Simétricas, sin edema, pulsos distales presentes. Sin focalidad neurológica.',
    actuacion: '- Mantener hábitos saludables, alimentación equilibrada, buena hidratación y actividad física regular.\n- Signos de alarma: Consultar en caso de aparición de síntomas nuevos como dolor agudo, fiebre persistente, dificultad para respirar o compromiso de conciencia.',
    farmacos: []
  },
  {
    id: 'rinofaringitis',
    name: 'Rinofaringitis aguda',
    category: 'Respiratorio',
    anamnesis: 'Cuadro caracterizado por coriza mucosa, congestión nasal, odinofagia leve y tos escasa inicialmente seca, luego productiva. Refiere sensación febril no medida. Sin dificultad respiratoria, sin ruidos audibles a distancia. Alimentación tolerada, diuresis conservada.',
    exam: 'Buen estado general, hidratado, activo, perfundido. Mucosa oral húmeda, faringe congestiva sin exudado. Otoscopia normal bilateral. Fosas nasales con coriza anterior. Pulmonar: Simétrico, expansibilidad conservada, murmullo pulmonar presente bidireccional sin ruidos agregados. Sin signos de dificultad respiratoria (sin aleteo nasal, sin tirajes).',
    actuacion: '- Reposo relativo.\n- Abundante hidratación oral.\n- Aseos nasales frecuentes con suero fisiológico.\n- Signos de alarma: Dificultad para respirar, labios o uñas morados, quejido al respirar, rechazo alimentario o fiebre alta que no baja.',
    farmacos: [
      { id: 'ibup_400', name: 'IBUPROFENO', dosis: '400 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 5 },
      { id: 'parac_500', name: 'PARACETAMOL', dosis: '500 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 5 },
      { id: 'clorf_4', name: 'CLORFENAMINA', dosis: '4 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 3 },
      { id: 'lorat_10', name: 'LORATADINA', dosis: '10 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 24, defaultDias: 5 }
    ]
  },
  {
    id: 'gastroenteritis',
    name: 'Gastroenteritis aguda',
    category: 'Digestivo',
    anamnesis: 'Cuadro caracterizado por deposiciones líquidas de consistencia disminuida en las últimas 24 horas, asociadas a episodios de vómitos alimentarios. Refiere dolor abdominal tipo cólico difuso, sensación febril y sed moderada. Tolerancia oral parcial/nula en las últimas horas. No refiere sangre ni pus en deposiciones.',
    exam: 'Lúcido, hidratado/deshidratación leve, perfundido, llene capilar < 2 seg. Mucosas húmedas/semihúmedas, ojos normales/ligeramente hundidos. Abdomen blando, deprimible, doloroso a la palpación difusa, ruidos hidroaéreos aumentados. Sin signos de irritación peritoneal (Blumberg negativo). Diuresis presente.',
    actuacion: '- Hidratación oral fraccionada y frecuente (sales de rehidratación oral).\n- Régimen blando y liviano según tolerancia.\n- Signos de alarma: Boca muy seca, llanto sin lágrimas, ojos hundidos, decaimiento extremo, no orinar en más de 6 horas, vómitos que impiden hidratarse, o deposiciones con sangre.',
    farmacos: [
      { id: 'sro', name: 'SALES DE REHIDRATACIÓN ORAL', dosis: '1 SOBRE', presentacion: 'SOBRES', defaultCantidad: 1, defaultHoras: 8, defaultDias: 3 },
      { id: 'viadil_comp', name: 'VIADIL (PARGEVERINA)', dosis: '10 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 3 },
      { id: 'domper_comp', name: 'DOMPERIDONA', dosis: '10 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 3 },
      { id: 'perenterol', name: 'PERENTEROL', dosis: '250 MG', presentacion: 'CÁPSULAS', defaultCantidad: 1, defaultHoras: 12, defaultDias: 5 }
    ]
  },
  {
    id: 'alergia',
    name: 'Alergia, no especificada',
    category: 'Dermatológico / Alergias',
    anamnesis: 'Paciente consulta por cuadro agudo de prurito generalizado asociado a la aparición de lesiones eritemato-papulares (habones) diseminadas en tronco y extremidades tras la exposición a presunto alérgeno (alimentario/medicamento/contacto). Niega disnea, disfonía, estridor, dolor abdominal, náuseas ni compromiso hemodinámico.',
    exam: 'Buen estado general, hemodinámicamente estable. Piel: Habones eritematosos, sobreelevados, pruriginosos en tronco y extremidades. Mucosa oral indemne, sin edema de úvula ni lengua. Respiratorio: Murmullo pulmonar conservado, sin sibilancias ni estridor laríngeo. Cardiovascular: Ruidos cardiacos rítmicos, regulares, pulsos conservados.',
    actuacion: '- Evitar contacto con el presunto alérgeno causante.\n- Mantener la piel fresca.\n- Signos de alarma INMEDIATOS: Dificultad para respirar o tragar, sensación de garganta cerrada, ronquera súbita, hinchazón de labios, lengua o cara, mareos intensos o desmayo.',
    farmacos: [
      { id: 'lorat_10_al', name: 'LORATADINA', dosis: '10 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 24, defaultDias: 5 },
      { id: 'cetir_10', name: 'CETIRIZINA', dosis: '10 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 24, defaultDias: 5 },
      { id: 'deslorat_5', name: 'DESLORATADINA', dosis: '5 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 24, defaultDias: 5 }
    ]
  },
  {
    id: 'asma',
    name: 'Crisis asmática',
    category: 'Respiratorio',
    anamnesis: 'Paciente con antecedente de asma bronquial/SBO recurrente, consulta por cuadro caracterizado por disnea de inicio progresivo, tos espasmódica, sibilancias audibles y opresión torácica. Refiere desencadenante (infección respiratoria alta/exposición a alérgeno). Uso de inhalador de rescate (salbutamol) con respuesta parcial/nula.',
    exam: 'Lúcido, cooperador, disneico, taquipneico. Uso de musculatura accesoria (tiraje intercostal/subcostal leve a moderado). Pulmonar: Expansión torácica conservada, murmullo pulmonar disminuido globalmente, espiración prolongada, sibilancias bilaterales difusas audibles en ambas fases.',
    actuacion: '- Mantener reposo en posición sentada o semisentada.\n- Usar inhalador de rescate (salbutamol) según indicación.\n- Signos de alarma INMEDIATOS: Dificultad para hablar por falta de aire, hundimiento marcado del pecho, labios o uñas azulados, agitación extrema o falta de respuesta al inhalador de rescate.',
    farmacos: [
      { id: 'salbut_inh', name: 'SALBUTAMOL', dosis: '100 MCG', presentacion: 'INHALADOR', defaultCantidad: 2, defaultHoras: 6, defaultDias: 5 },
      { id: 'predn_20', name: 'PREDNISONA', dosis: '20 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 24, defaultDias: 5 }
    ]
  },
  {
    id: 'otitis',
    name: 'Otitis media aguda (OMA)',
    category: 'Otorrinolaringología',
    anamnesis: 'Paciente consulta por otalgia aguda de inicio súbito, de carácter pulsátil, unilateral (derecho/izquierdo). Se asocia a sensación de hipoacusia, irritabilidad/llanto en lactantes y fiebre. Sin otorrea previa.',
    exam: 'Faringe levemente congestiva. Otoscopia: Conducto auditivo externo permeable, membrana timpánica eritematosa, abombada, con pérdida del triángulo luminoso y disminución de la movilidad. Sin perforación ni otorrea.',
    actuacion: '- Mantener reposo.\n- Evitar entrada de agua al oído afectado.\n- Aplicar compresas tibias externas para aliviar el dolor.\n- Signos de alarma: Salida de líquido/sangre/pus por el oído, enrojecimiento doloroso detrás de la oreja, cefalea intensa, vómitos persistentes o fiebre alta sostenida.',
    farmacos: [
      { id: 'amox_500', name: 'AMOXICILINA', dosis: '500 MG', presentacion: 'CÁPSULAS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 7 },
      { id: 'amox_clav', name: 'AMOXICILINA / ÁCIDO CLAVULÁNICO', dosis: '875/125 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 12, defaultDias: 7 },
      { id: 'ibup_400_ot', name: 'IBUPROFENO', dosis: '400 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 5 },
      { id: 'parac_500_ot', name: 'PARACETAMOL', dosis: '500 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 5 }
    ]
  },
  {
    id: 'faringoamigdalitis',
    name: 'Faringoamigdalitis aguda',
    category: 'Otorrinolaringología',
    anamnesis: 'Consulta por odinofagia intensa de inicio agudo, disfagia, sensación febril y cefalea. Refiere compromiso del estado general y adenopatías cervicales dolorosas. Sin tos ni coriza asociada.',
    exam: 'Faringe intensamente congestiva, amígdalas hipertróficas con presencia de placas de exudado pultáceo bilateral. Adenopatías submandibulares y cervicales anteriores palpables, dolorosas a la palpación. Sin trismus ni desviación de úvula.',
    actuacion: '- Abundante hidratación con líquidos templados o fríos.\n- Reposo.\n- Signos de alarma: Dificultad para respirar, incapacidad para tragar saliva (babeo), trismus (dificultad para abrir la boca), úvula desviada o fiebre que persiste tras 48 horas de tratamiento.',
    farmacos: [
      { id: 'amox_500_fa', name: 'AMOXICILINA', dosis: '500 MG', presentacion: 'CÁPSULAS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 7 },
      { id: 'azitro_500', name: 'AZITROMICINA', dosis: '500 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 24, defaultDias: 3 },
      { id: 'ibup_400_fa', name: 'IBUPROFENO', dosis: '400 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 5 }
    ]
  },
  {
    id: 'itu',
    name: 'Infección del tracto urinario (ITU)',
    category: 'Nefrourología',
    anamnesis: 'Paciente consulta por cuadro de disuria dolorosa, poliaquiuria, tenesmo vesical y dolor hipogástrico. Refiere orinas turbias, de mal olor y hematuria macroscópica terminal. Niega fiebre, escalofríos ni dolor lumbar.',
    exam: 'Buen estado general, afebril. Abdomen blando, deprimible, doloroso a la palpación profunda en hipogastrio. Puño percusión lumbar (PPL) negativa bilateral. Puntos ureterales negativos.',
    actuacion: '- Abundante consumo de agua.\n- No aguantar deseos de orinar.\n- Signos de alarma: Fiebre alta con dolor lumbar o en costado, escalofríos intensos, vómitos repetidos que impiden tomar medicamentos, o sangrado abundante en la orina.',
    farmacos: [
      { id: 'nitro_100', name: 'NITROFURANTOÍNA', dosis: '100 MG', presentacion: 'CÁPSULAS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 7 },
      { id: 'cipro_500', name: 'CIPROFLOXACINO', dosis: '500 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 12, defaultDias: 5 },
      { id: 'cefad_500', name: 'CEFADROXILO', dosis: '500 MG', presentacion: 'CÁPSULAS', defaultCantidad: 1, defaultHoras: 12, defaultDias: 7 }
    ]
  },
  {
    id: 'neumonia',
    name: 'Neumonía adquirida en la comunidad (NAC)',
    category: 'Respiratorio',
    anamnesis: 'Paciente consulta por tos productiva con expectoración mucopurulenta/herrumbrosa, dolor torácico de tipo pleurítico unilateral que aumenta con la inspiración profunda, fiebre alta persistente con calofríos y disnea de esfuerzo.',
    exam: 'Estado general regular, febril, taquipneico. Pulmonar: Expansión torácica disminuida en hemitórax afectado, matidez a la percusión localizada, aumento de las vibraciones vocales, murmullo pulmonar disminuido con presencia de crépitos localizados y soplo tubario en zona afectada.',
    actuacion: '- Reposo absoluto en casa.\n- Abundante hidratación oral.\n- Control médico programado.\n- Signos de alarma INMEDIATOS: Respiración muy rápida, ahogo al mínimo esfuerzo, hundimiento del pecho al respirar, coloración azulada en labios o uñas, o somnolencia marcada.',
    farmacos: [
      { id: 'amox_clav_nac', name: 'AMOXICILINA / ÁCIDO CLAVULÁNICO', dosis: '875/125 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 12, defaultDias: 7 },
      { id: 'amox_1g', name: 'AMOXICILINA', dosis: '1 G', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 7 },
      { id: 'azitro_500_nac', name: 'AZITROMICINA', dosis: '500 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 24, defaultDias: 5 }
    ]
  },
  {
    id: 'hipertensiva',
    name: 'Crisis hipertensiva',
    category: 'Cardiovascular',
    anamnesis: 'Paciente con antecedente de hipertensión arterial, consulta por cefalea holocraneana de moderada intensidad, tinitus, fotopsias y mareos de inicio agudo. Niega dolor torácico, disnea, déficit neurológico focal o alterations visuales mayores.',
    exam: 'Lúcido, orientado, vigil. Presión Arterial: X/Y mmHg. Cardiovascular: Ruidos cardiacos rítmicos, regulares, sin soplos. Examen neurológico sumario normal, sin focalidad ni signos de meningismo.',
    actuacion: '- Reposo absoluto en ambiente tranquilo y sin estímulos luminosos o ruidosos.\n- Signos de alarma INMEDIATOS: Dolor torácico opresivo irradiado al brazo/cuello, falta de aire súbita, cefalea extremadamente intensa de inicio brusco, dificultad para hablar o sonreír, debilidad en un lado del cuerpo o visión borrosa.',
    farmacos: [
      { id: 'capto_25', name: 'CAPTOPRIL', dosis: '25 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 12, defaultDias: 1 },
      { id: 'enal_10', name: 'ENALAPRIL', dosis: '10 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 12, defaultDias: 7 },
      { id: 'amlo_5', name: 'AMLODIPINO', dosis: '5 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 24, defaultDias: 7 }
    ]
  },
  {
    id: 'lumbago',
    name: 'Lumbago agudo / Lumbalgia',
    category: 'Musculoesquelético',
    anamnesis: 'Consulta por dolor lumbar bajo de inicio brusco tras esfuerzo físico/giro forzado. Dolor limita la deambulación y bipedestación, irradia a glúteos pero no sobrepasa la rodilla. Alivia parcialmente en decúbito.',
    exam: 'Marcha antálgica. Columna lumbar con pérdida de la lordosis fisiológica por contractura de musculatura paravertebral bilateral. Puntos de Valleix negativos. Laségue y Bragard negativos bilateral. Reflejos osteotendíneos y sensibilidad conservada.',
    actuacion: '- Evitar el reposo absoluto en cama; mantener movimiento suave tolerado.\n- Aplicar calor local en zona lumbar.\n- Signos de alarma INMEDIATOS: Pérdida de fuerza o adormecimiento en piernas, pérdida de sensibilidad perianal, pérdida del control de orina o deposiciones, o fiebre alta asociada al dolor lumbar.',
    farmacos: [
      { id: 'keto_100', name: 'KETOPROFENO', dosis: '100 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 12, defaultDias: 5 },
      { id: 'ciclo_5', name: 'CICLOBENZAPRINA', dosis: '5 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 12, defaultDias: 5 },
      { id: 'cele_200', name: 'CELECOXIB', dosis: '200 MG', presentacion: 'CÁPSULAS', defaultCantidad: 1, defaultHoras: 24, defaultDias: 5 }
    ]
  },
  {
    id: 'quemadura',
    name: 'Quemadura menor',
    category: 'Traumatología / Procedimientos',
    anamnesis: 'Paciente refiere accidente doméstico (contacto con líquido caliente/fuego/objeto caliente), sufriendo quemadura en extremidad/zona. Presenta dolor local urente intenso y aparición progresiva de eritema/ampollas.',
    exam: 'Lesión eritematosa en zona afectada, dolorosa a la palpación (1° grado) / Presencia de flictenas (ampollas) con lecho rosado, húmedo y doloroso al tacto (2° grado superficial). Extensión estimada: X% de superficie corporal total.',
    actuacion: '- Enfriar la zona con agua corriente templada o fría durante 10-15 minutos.\n- Cubrir con gasa limpia y estéril sin apretar.\n- No romper las ampollas.\n- Signos de alarma: Dolor intenso que no cede, enrojecimiento o hinchazón que se extiende alrededor de la quemadura, salida de pus, mal olor o fiebre.',
    farmacos: [
      { id: 'parac_500_qu', name: 'PARACETAMOL', dosis: '500 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 3 },
      { id: 'ibup_400_qu', name: 'IBUPROFENO', dosis: '400 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 5 }
    ]
  },
  {
    id: 'esguince',
    name: 'Esguince de tobillo',
    category: 'Musculoesquelético',
    anamnesis: 'Paciente refiere mecanismo de inversión forzada del tobillo derecho/izquierdo durante deambulación/actividad física. Presenta dolor agudo localizado, aumento de volumen local y dificultad para el apoyo del pie.',
    exam: 'Marcha claudicante. Tobillo con aumento de volumen local y equimosis perimaleolar externa. Dolor exquisito a la palpación de ligamento talofibular anterior. Sin dolor en maléolos óseos, base del 5° metatarsiano ni hueso navicular (Criterios de Ottawa negativos).',
    actuacion: '- Reposo de la extremidad lesionada.\n- Aplicar hielo local (cubierto con un paño) por 15 minutos, varias veces al día.\n- Mantener el pie elevado.\n- Usar vendaje de soporte suave.\n- Signos de alarma: Dedos fríos, pálidos o morados, pérdida de sensibilidad en el pie, dolor que aumenta progresivamente, o incapacidad total de apoyar el pie tras 48 horas.',
    farmacos: [
      { id: 'ibup_400_esg', name: 'IBUPROFENO', dosis: '400 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 5 },
      { id: 'keto_100_esg', name: 'KETOPROFENO', dosis: '100 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 12, defaultDias: 5 }
    ]
  },
  {
    id: 'colico_renal',
    name: 'Cólico renal / Urolitiasis',
    category: 'Nefrourología',
    anamnesis: 'Paciente consulta por dolor lumbar agudo de gran intensidad (EVA 9-10/10), de tipo cólico, de inicio súbito, irradiado a flanco e ingle homologa. Se acompaña de náuseas, vómitos, agitación psicomotora y disuria. Sin fiebre.',
    exam: 'Paciente inquieto, no encuentra posición de alivio. Afebril. Puño percusión lumbar (PPL) francamente positiva en hemitórax/lado afectado. Abdomen blando, deprimible, doloroso a la palpación en flanco. Puntos ureterales superiores y medios positivos.',
    actuacion: '- Abundante hidratación oral si tolera la vía oral.\n- Calor local en región lumbar.\n- Signos de alarma INMEDIATOS: Fiebre alta con escalofríos (sospecha de pielonefritis obstructiva o sepsis urinaria), anuria o imposibilidad de orinar, o dolor que no cede con analgésicos.',
    farmacos: [
      { id: 'keto_100_col', name: 'KETOPROFENO', dosis: '100 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 12, defaultDias: 5 },
      { id: 'viadil_col', name: 'VIADIL (PARGEVERINA)', dosis: '10 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 3 },
      { id: 'tams_04', name: 'TAMSULOSINA', dosis: '0.4 MG', presentacion: 'CÁPSULAS', defaultCantidad: 1, defaultHoras: 24, defaultDias: 7 }
    ]
  },
  {
    id: 'contusion',
    name: 'Contusión / Traumatismo leve',
    category: 'Traumatología',
    anamnesis: 'Paciente consulta por contusión directa en zona (extremidad/tronco) secundaria a caída de su propia altura/golpe directo. Presenta dolor local de moderada intensidad y aumento de volumen local. Niega pérdida de conciencia, deambula.',
    exam: 'Aumento de volumen localizado, equimosis superficial. Dolor a la palpación de partes blandas. Movilidad articular conservada activa y pasiva, pulsos distales presentes y llenado capilar normal. Sin deformidades óseas evidentes.',
    actuacion: '- Aplicar compresas frías o hielo (cubierto) durante 15 minutos, 3-4 veces al día por 48 horas.\n- Mantener la zona reposada y en lo posible elevada.\n- Signos de alarma: Aumento progresivo del dolor o volumen, adormecimiento o frialdad distal, o imposibilidad de mover la extremidad.',
    farmacos: [
      { id: 'parac_500_con', name: 'PARACETAMOL', dosis: '500 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 3 },
      { id: 'ibup_400_con', name: 'IBUPROFENO', dosis: '400 MG', presentacion: 'COMPRIMIDOS', defaultCantidad: 1, defaultHoras: 8, defaultDias: 5 }
    ]
  }
];

export const SapuMenu: React.FC<SapuMenuProps> = () => {
  // Campos de Identificación
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState<'Masculino' | 'Femenino' | ''>('');
  const [tiempoValor, setTiempoValor] = useState('');
  const [tiempoUnidad, setTiempoUnidad] = useState('días');
  const [motivoConsulta, setMotivoConsulta] = useState('');

  // Campos de Antecedentes, Fármacos, Alergias y Cirugías (Casillas marcables)
  const [antecedentesChecked, setAntecedentesChecked] = useState(false);
  const [antecedentesText, setAntecedentesText] = useState('');
  const [farmacosChecked, setFarmacosChecked] = useState(false);
  const [farmacosText, setFarmacosText] = useState('');
  const [alergiasChecked, setAlergiasChecked] = useState(false);
  const [alergiasText, setAlergiasText] = useState('');
  const [cirugiasChecked, setCirugiasChecked] = useState(false);
  const [cirugiasText, setCirugiasText] = useState('');

  // Campos de la Ficha Clínica
  const [diagnosticosText, setDiagnosticosText] = useState('');
  const [anamnesisText, setAnamnesisText] = useState('');
  const [exploracionText, setExploracionText] = useState('');
  const [actuacionText, setActuacionText] = useState('');
  const [prescripcionText, setPrescripcionText] = useState('');
  const [isUppercase, setIsUppercase] = useState<boolean>(false);

  // Estado de la Barra de Búsqueda de Cuadros Frecuentes
  const [searchQuery, setSearchQuery] = useState('');

  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Manejo de Edad (Máximo 3 dígitos)
  const handleEdadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
    setEdad(val);
  };

  // Manejo de Tiempo de Evolución (Máximo 2 dígitos)
  const handleTiempoValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setTiempoValor(val);
  };

  // Coincidencias de texto para la Única Barra de Búsqueda
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const norm = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return PATHOLOGIES.filter(p => 
      p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(norm) ||
      p.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(norm)
    );
  }, [searchQuery]);

  // Generación dinámica de la Anamnesis según el formato requerido
  const generateAnamnesisText = useCallback((customMotivo?: string) => {
    const antecVal = antecedentesChecked ? (antecedentesText.trim() || 'Sí (especificar)') : 'Niega.';
    const farmVal = farmacosChecked ? (farmacosText.trim() || 'Sí (especificar)') : 'Niega.';
    const alergVal = alergiasChecked ? (alergiasText.trim() || 'Sí (especificar)') : 'Niega.';
    const cirugVal = cirugiasChecked ? (cirugiasText.trim() || 'Sí (especificar)') : 'Niega.';

    const sexoFormatted = sexo === 'Masculino' ? 'masculino' : sexo === 'Femenino' ? 'femenino' : '%masculino/femenino%';
    const edadFormatted = edad ? `${edad} años` : '%edad%';
    const tiempoFormatted = tiempoValor ? `${tiempoValor} ${tiempoUnidad}` : '%tiempo de evolución%';
    
    // Motivo de consulta trascrito SIEMPRE en minúscula
    const rawMotivo = customMotivo || motivoConsulta;
    const motivoFormatted = rawMotivo.trim() ? rawMotivo.trim().toLowerCase() : '%motivo de consulta%';

    const introPatient = `Paciente ${sexoFormatted} de ${edadFormatted} consulta por cuadro de ${motivoFormatted} de ${tiempoFormatted} de evolución.`;

    return `Antecedentes: ${antecVal}
Fármacos: ${farmVal}
Alergias: ${alergVal}
Cirugías: ${cirugVal}

${introPatient}`;
  }, [antecedentesChecked, antecedentesText, farmacosChecked, farmacosText, alergiasChecked, alergiasText, cirugiasChecked, cirugiasText, sexo, edad, tiempoValor, tiempoUnidad, motivoConsulta]);

  // Diagnósticos seleccionados (Multiselección)
  const [selectedPathologies, setSelectedPathologies] = useState<Pathology[]>([]);
  
  // Estado para la configuración activa de fármacos seleccionados
  // Mapa de drug.id -> { drug: DrugItem, cantidad: number, horas: number, dias: number }
  const [activeDrugs, setActiveDrugs] = useState<Record<string, { drug: DrugItem; cantidad: number; horas: number; dias: number }>>({});
  
  const [isManualEdit, setIsManualEdit] = useState<boolean>(false);

  // Formatear la cadena de fármacos activa en MAYÚSCULAS según el patrón requerido
  const formatDrugString = useCallback((d: { drug: DrugItem; cantidad: number; horas: number; dias: number }) => {
    const pSingular = d.drug.presentacion.replace(/S$/, '');
    const pText = d.cantidad > 1 ? d.drug.presentacion : pSingular;
    return `${d.drug.name} | ${d.drug.dosis} | ${d.drug.presentacion} | ${d.cantidad} ${pText} CADA ${d.horas} HORAS POR ${d.dias} DÍAS`;
  }, []);

  // Recalcular el texto completo de Prescripción cuando cambia activeDrugs
  useEffect(() => {
    const formattedLines = Object.values(activeDrugs).map(formatDrugString);
    setPrescripcionText(formattedLines.join('\n'));
  }, [activeDrugs, formatDrugString]);

  // Conmutar fármaco seleccionado
  const toggleSelectDrugItem = (drug: DrugItem) => {
    setActiveDrugs(prev => {
      const next = { ...prev };
      if (next[drug.id]) {
        delete next[drug.id];
      } else {
        next[drug.id] = {
          drug,
          cantidad: drug.defaultCantidad ?? 1,
          horas: drug.defaultHoras ?? 8,
          dias: drug.defaultDias ?? 5
        };
      }
      return next;
    });
  };

  // Modificar valores numéricos (# dosis, # horas, # días)
  const updateDrugParam = (drugId: string, param: 'cantidad' | 'horas' | 'dias', val: number) => {
    setActiveDrugs(prev => {
      if (!prev[drugId]) return prev;
      return {
        ...prev,
        [drugId]: {
          ...prev[drugId],
          [param]: Math.max(1, val)
        }
      };
    });
  };

  // Función para agregar/quitar cuadros desde la barra de búsqueda
  const toggleSelectPathology = (pathology: Pathology) => {
    const exists = selectedPathologies.some(p => p.id === pathology.id);
    let updated: Pathology[];

    if (exists) {
      updated = selectedPathologies.filter(p => p.id !== pathology.id);
    } else {
      updated = [...selectedPathologies, pathology];

      // Si exploración está vacía, cargar el examen físico del primero
      if (!exploracionText.trim()) {
        setExploracionText(pathology.exam);
      }
    }

    setSelectedPathologies(updated);
    setSearchQuery('');
    setIsManualEdit(false);
  };

  const removePathology = (id: string) => {
    const updated = selectedPathologies.filter(p => p.id !== id);
    setSelectedPathologies(updated);
    setIsManualEdit(false);
  };

  // Reconstruir Actuación automáticamente cuando cambian los diagnósticos o la prescripción
  useEffect(() => {
    const generalIndications: string[] = [];
    const alarmSigns: string[] = [];

    // Si hay prescripción, formatearla o agregarla al inicio
    if (prescripcionText.trim()) {
      const prescLines = prescripcionText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.startsWith('-') ? line : `- ${line}`);
      generalIndications.push(...prescLines);
    }

    // Procesar indicaciones de cada patología seleccionada
    selectedPathologies.forEach(p => {
      const lines = p.actuacion.split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.toLowerCase().includes('signos de alarma')) {
          // Extraer únicamente la parte del detalle sin el prefijo "signos de alarma"
          let detail = trimmed.replace(/^-\s*/, '');
          detail = detail.replace(/^signos de alarma\s*(inmediatos)?\s*:?\s*/i, '').trim();
          // Quitar prefijos adicionales repetidos si existieran
          detail = detail.replace(/^signos de alarma\s*:?\s*/i, '').trim();
          if (detail && !alarmSigns.includes(detail)) {
            alarmSigns.push(detail);
          }
        } else {
          // Indicación general
          const bullet = trimmed.startsWith('-') ? trimmed : `- ${trimmed}`;
          if (!generalIndications.includes(bullet)) {
            generalIndications.push(bullet);
          }
        }
      });
    });

    let result = generalIndications.join('\n');

    if (alarmSigns.length > 0) {
      const combinedAlarm = `- Signos de alarma: ${alarmSigns.join(' ')}`;
      result = result ? `${result}\n${combinedAlarm}` : combinedAlarm;
    }

    setActuacionText(result);
  }, [selectedPathologies, prescripcionText]);

  // Sincronización al modificar campos del formulario
  useEffect(() => {
    if (!isManualEdit) {
      setAnamnesisText(generateAnamnesisText());
    }
  }, [generateAnamnesisText, isManualEdit]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopySection = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(label);
    setTimeout(() => setCopiedStatus(null), 2000);
  };

  // Función para resetear todo el formulario
  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de borrar todos los datos ingresados?')) {
      setEdad('');
      setSexo('');
      setTiempoValor('');
      setTiempoUnidad('días');
      setMotivoConsulta('');
      setAntecedentesChecked(false);
      setAntecedentesText('');
      setFarmacosChecked(false);
      setFarmacosText('');
      setAlergiasChecked(false);
      setAlergiasText('');
      setCirugiasChecked(false);
      setCirugiasText('');
      setDiagnosticosText('');
      setAnamnesisText('');
      setExploracionText('');
      setActuacionText('');
      setPrescripcionText('');
      setSelectedPathologies([]);
      setActiveDrugs({});
      setSearchQuery('');
      setIsManualEdit(false);
    }
  };

  return (
    <div className="w-full font-sans text-slate-800" ref={containerRef}>
      
      {/* REJILLA PRINCIPAL: IZQUIERDA (IDENTIFICACIÓN, ANTECEDENTES Y DIAGNÓSTICOS) - COLS 8/12 | DERECHA (ANAMNESIS, EXPLORACIÓN Y ACTUACIÓN) - COLS 4/12 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        
        {/* COLUMNA IZQUIERDA: IDENTIFICACIÓN, ANTECEDENTES, FÁRMACOS, ALERGIAS, CIRUGÍAS Y DIAGNÓSTICOS - COLS 8/12 (SCROLLEABLE) */}
        <div className="lg:col-span-8 flex flex-col space-y-3 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto pr-1.5 custom-scrollbar pb-6">

          {/* BLOQUE 1: IDENTIFICACIÓN (CON EDAD Y SEXO IGUAL A INGRESO ECICEP) */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm">
            <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
              <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-sky-600" />
                <span>Identificación</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. EDAD (Estilo FormField de Ingreso ECICEP) */}
                <div>
                  <label htmlFor="edad" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Edad
                  </label>
                  <input
                    id="edad"
                    name="edad"
                    type="text"
                    value={edad}
                    onChange={handleEdadChange}
                    maxLength={3}
                    placeholder="Edad en años..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150 ease-in-out text-slate-800 placeholder-slate-400 placeholder:opacity-50 leading-normal font-sans text-sm !h-[42px]"
                  />
                </div>

                {/* 2. SEXO (Estilo radio group de Ingreso ECICEP) */}
                <div className="mb-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexo:</label>
                  <div className="flex items-center space-x-6 h-[42px]">
                    <label className="flex items-center text-sm cursor-pointer select-none text-slate-800 font-medium">
                      <input
                        type="radio"
                        name="sexo"
                        value="Masculino"
                        checked={sexo === 'Masculino'}
                        onChange={() => setSexo('Masculino')}
                        className="mr-2 text-sky-600 focus:ring-sky-500 h-4 w-4 border-slate-300 cursor-pointer"
                      />
                      <span>Masculino</span>
                    </label>

                    <label className="flex items-center text-sm cursor-pointer select-none text-slate-800 font-medium">
                      <input
                        type="radio"
                        name="sexo"
                        value="Femenino"
                        checked={sexo === 'Femenino'}
                        onChange={() => setSexo('Femenino')}
                        className="mr-2 text-sky-600 focus:ring-sky-500 h-4 w-4 border-slate-300 cursor-pointer"
                      />
                      <span>Femenino</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 3. EVOLUCIÓN */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Evolución</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tiempoValor}
                    onChange={handleTiempoValorChange}
                    maxLength={2}
                    placeholder="00"
                    className="w-20 h-[42px] px-3 text-center bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none text-slate-800 font-sans text-sm font-semibold shrink-0"
                  />
                  <select
                    value={tiempoUnidad}
                    onChange={(e) => setTiempoUnidad(e.target.value)}
                    className="flex-1 h-[42px] px-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none text-slate-800 font-sans text-sm font-medium"
                  >
                    <option value="horas">horas</option>
                    <option value="días">días</option>
                    <option value="semanas">semanas</option>
                    <option value="meses">meses</option>
                    <option value="años">años</option>
                  </select>
                </div>
              </div>

              {/* 4. MOTIVO DE CONSULTA */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Motivo de consulta</label>
                <input
                  type="text"
                  value={motivoConsulta}
                  onChange={(e) => {
                    setMotivoConsulta(e.target.value);
                    setIsManualEdit(false);
                  }}
                  placeholder="Ej. odinofagia, cefalea..."
                  className="w-full h-[42px] px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none text-slate-800 font-sans text-sm placeholder-slate-400 placeholder:opacity-50"
                />
              </div>
            </section>
          </div>

          {/* BLOQUE 2: ANTECEDENTES, FÁRMACOS, ALERGIAS Y CIRUGÍAS */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm">
            <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
              <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-600" />
                <span>Antecedentes, Fármacos & Alertas</span>
              </h3>

              <div className="flex flex-col gap-2.5 justify-between">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <label className={`h-[42px] px-3.5 bg-white border rounded-lg shadow-sm flex items-center gap-2 cursor-pointer select-none transition-all ${
                    antecedentesChecked ? 'border-sky-500 bg-sky-50/70 text-sky-900 font-semibold' : 'border-slate-300 text-slate-700 font-medium hover:border-sky-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={antecedentesChecked}
                      onChange={(e) => setAntecedentesChecked(e.target.checked)}
                      className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer shrink-0"
                    />
                    <span className="text-sm truncate">Antecedentes</span>
                  </label>

                  <label className={`h-[42px] px-3.5 bg-white border rounded-lg shadow-sm flex items-center gap-2 cursor-pointer select-none transition-all ${
                    farmacosChecked ? 'border-sky-500 bg-sky-50/70 text-sky-900 font-semibold' : 'border-slate-300 text-slate-700 font-medium hover:border-sky-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={farmacosChecked}
                      onChange={(e) => setFarmacosChecked(e.target.checked)}
                      className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer shrink-0"
                    />
                    <span className="text-sm truncate">Fármacos</span>
                  </label>

                  <label className={`h-[42px] px-3.5 bg-white border rounded-lg shadow-sm flex items-center gap-2 cursor-pointer select-none transition-all ${
                    alergiasChecked ? 'border-sky-500 bg-sky-50/70 text-sky-900 font-semibold' : 'border-slate-300 text-slate-700 font-medium hover:border-sky-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={alergiasChecked}
                      onChange={(e) => setAlergiasChecked(e.target.checked)}
                      className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer shrink-0"
                    />
                    <span className="text-sm truncate">Alergias</span>
                  </label>

                  <label className={`h-[42px] px-3.5 bg-white border rounded-lg shadow-sm flex items-center gap-2 cursor-pointer select-none transition-all ${
                    cirugiasChecked ? 'border-sky-500 bg-sky-50/70 text-sky-900 font-semibold' : 'border-slate-300 text-slate-700 font-medium hover:border-sky-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={cirugiasChecked}
                      onChange={(e) => setCirugiasChecked(e.target.checked)}
                      className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer shrink-0"
                    />
                    <span className="text-sm truncate">Cirugías</span>
                  </label>
                </div>
              </div>

              {/* INPUTS ESPECÍFICOS CUANDO SE MARCA 'SÍ' */}
              {antecedentesChecked && (
                <div className="animate-fadeIn mt-1">
                  <SmartAntecedentesTextarea
                    label="Detalle de Antecedentes"
                    id="sapu_antecedentes"
                    value={antecedentesText}
                    onChange={setAntecedentesText}
                    rows={2}
                    placeholder="Escribe @ para buscar (HTA, DM2, Asma)..."
                  />
                </div>
              )}

              {farmacosChecked && (
                <div className="animate-fadeIn mt-1">
                  <SmartFarmacosTextarea
                    label="Detalle de Fármacos"
                    id="sapu_farmacos"
                    value={farmacosText}
                    onChange={setFarmacosText}
                    rows={2}
                    placeholder="Escribe @ para buscar en arsenal APS..."
                  />
                </div>
              )}

              {alergiasChecked && (
                <div className="animate-fadeIn mt-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Detalle de Alergias</label>
                  <input
                    type="text"
                    value={alergiasText}
                    onChange={(e) => setAlergiasText(e.target.value)}
                    placeholder="Especifica alergias (ej. Penicilina, AINEs)..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none text-slate-800 font-sans text-sm h-[42px]"
                  />
                </div>
              )}

              {cirugiasChecked && (
                <div className="animate-fadeIn mt-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Detalle de Cirugías</label>
                  <input
                    type="text"
                    value={cirugiasText}
                    onChange={(e) => setCirugiasText(e.target.value)}
                    placeholder="Especifica cirugías previas y fecha aprox..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none text-slate-800 font-sans text-sm h-[42px]"
                  />
                </div>
              )}

            </section>
          </div>

          {/* BLOQUE 3: DIAGNÓSTICOS (DOBLE FRAME) */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm">
            <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 relative flex flex-col gap-3">
              <div className="flex justify-between items-center mb-0.5 pb-2 border-b border-sky-200">
                <h3 className="text-lg font-semibold text-sky-700 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-600" />
                  <span>Diagnósticos (Cuadros Frecuentes SAPU)</span>
                </h3>
                {selectedPathologies.length > 0 && (
                  <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2.5 py-1 rounded-full border border-sky-300">
                    {selectedPathologies.length} seleccionado(s)
                  </span>
                )}
              </div>

              {/* LISTADO DE DIAGNÓSTICOS SELECCIONADOS */}
              {selectedPathologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {selectedPathologies.map(p => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-900 border border-sky-300 px-2.5 py-1.5 rounded-md text-xs font-bold shadow-xs"
                    >
                      <span>{p.name}</span>
                      <button
                        type="button"
                        onClick={() => removePathology(p.id)}
                        className="hover:bg-sky-200 text-sky-700 hover:text-sky-900 rounded p-0.5 font-black text-xs leading-none"
                        title="Quitar diagnóstico"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* BARRA DE BÚSQUEDA DE CUADROS FRECUENTES */}
              <div className="relative">
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar y seleccionar uno o más diagnósticos (ej. esguince, rinofaringitis, NAC, itu)..."
                    className="w-full pl-10 pr-4 py-2.5 h-[42px] bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none text-slate-800 font-sans text-sm placeholder-slate-400"
                  />
                </div>

                {/* LISTA DE COINCIDENCIAS AL BUSCAR */}
                {searchQuery.trim().length > 0 && (
                  <div className="mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto custom-scrollbar divide-y divide-slate-100 z-10 relative">
                    {searchResults.map((p) => {
                      const isSelected = selectedPathologies.some(item => item.id === p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleSelectPathology(p)}
                          className={`px-3.5 py-2.5 cursor-pointer flex justify-between items-center transition-colors text-xs ${
                            isSelected ? 'bg-sky-50 text-sky-900 font-bold' : 'hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-sm">{p.name}</span>
                            <span className="ml-2 text-xs text-slate-400 font-medium">({p.category})</span>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded border transition-colors ${
                            isSelected 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                              : 'bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-600 hover:text-white'
                          }`}>
                            {isSelected ? '✓ Seleccionado' : '+ Agregar'}
                          </span>
                        </div>
                      );
                    })}
                    {searchResults.length === 0 && (
                      <div className="p-3.5 text-center text-sm text-slate-400">
                        No se encontraron cuadros coincidentes con "{searchQuery}".
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* BLOQUE PRESCRIPCIÓN (DOBLE FRAME) */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm">
            <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-3">
              <h3 className="text-lg font-semibold border-b border-sky-200 pb-2 text-sky-700 flex items-center gap-2">
                <Pill className="w-5 h-5 text-violet-600" />
                <span>Prescripción</span>
              </h3>

              {/* SUGERENCIAS DE FÁRMACOS SEGÚN DIAGNÓSTICOS SELECCIONADOS */}
              {selectedPathologies.some(p => p.farmacos && p.farmacos.length > 0) && (
                <div className="space-y-2 bg-violet-50/50 p-3 rounded-lg border border-violet-100">
                  <span className="text-xs font-bold text-violet-900 block">
                    Fármacos sugeridos (selecciona y ajusta dosis):
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {selectedPathologies.flatMap(p => p.farmacos || []).map((drug) => {
                      const activeConfig = activeDrugs[drug.id];
                      const isChecked = !!activeConfig;
                      return (
                        <div
                          key={drug.id}
                          className={`p-2 rounded-lg border transition-all ${
                            isChecked 
                              ? 'bg-violet-100/80 border-violet-300 text-violet-950 shadow-xs' 
                              : 'bg-white border-slate-200 hover:border-violet-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-xs">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectDrugItem(drug)}
                                className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 cursor-pointer shrink-0"
                              />
                              <span className="uppercase tracking-wide">
                                {drug.name} | {drug.dosis} | {drug.presentacion}
                              </span>
                            </label>
                          </div>

                          {/* CONTROLES NUMÉRICOS SI ESTÁ SELECCIONADO */}
                          {isChecked && (
                            <div className="mt-1.5 pt-1.5 border-t border-violet-200/60 flex flex-wrap items-center gap-2 text-xs text-slate-800 animate-fadeIn">
                              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-violet-200">
                                <span className="font-bold text-violet-900">Cant:</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={activeConfig.cantidad}
                                  onChange={e => updateDrugParam(drug.id, 'cantidad', parseInt(e.target.value) || 1)}
                                  className="w-10 text-center font-bold bg-slate-50 border border-slate-300 rounded text-xs outline-none focus:border-violet-500 h-7"
                                />
                              </div>

                              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-violet-200">
                                <span className="font-bold text-violet-900">Cada:</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={activeConfig.horas}
                                  onChange={e => updateDrugParam(drug.id, 'horas', parseInt(e.target.value) || 1)}
                                  className="w-10 text-center font-bold bg-slate-50 border border-slate-300 rounded text-xs outline-none focus:border-violet-500 h-7"
                                />
                                <span className="text-xs text-slate-500 font-bold">hrs</span>
                              </div>

                              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-violet-200">
                                <span className="font-bold text-violet-900">Por:</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={activeConfig.dias}
                                  onChange={e => updateDrugParam(drug.id, 'dias', parseInt(e.target.value) || 1)}
                                  className="w-10 text-center font-bold bg-slate-50 border border-slate-300 rounded text-xs outline-none focus:border-violet-500 h-7"
                                />
                                <span className="text-xs text-slate-500 font-bold">días</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>

        </div>

        {/* COLUMNA DERECHA: FIJA CON RESUMEN Y BOTÓN BORRAR TODO EN BLOQUE APARTE DEBAJO */}
        <div className="lg:col-span-4 lg:sticky lg:top-4 flex flex-col gap-2.5 lg:h-[calc(100vh-140px)]">
          {/* Bloque Resumen Ficha Clínica */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden w-full">
            <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden w-full">
              <div className="border-b border-sky-200/80 pb-1 mb-2 w-full flex-shrink-0">
                <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Resumen Ficha Clínica (Editable)</h3>
              </div>
              <div className="mb-2 flex items-center gap-1.5 flex-shrink-0">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={isUppercase}
                    onChange={e => setIsUppercase(e.target.checked)}
                    className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer"
                  />
                  <span>MAYÚSCULAS</span>
                </label>
              </div>
              <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden">
                {/* Bloque Anamnesis */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                    <label htmlFor="anamnesisText" className="block text-[11px] font-semibold text-slate-800 cursor-pointer">Anamnesis</label>
                    <CopyButton textToCopy={isUppercase ? anamnesisText.toUpperCase() : anamnesisText} />
                  </div>
                  <textarea
                    id="anamnesisText"
                    name="anamnesisText"
                    value={isUppercase ? anamnesisText.toUpperCase() : anamnesisText}
                    onChange={e => {
                      setIsManualEdit(true);
                      setAnamnesisText(e.target.value);
                    }}
                    placeholder="Anamnesis del paciente..."
                    className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                  />
                </div>
                {/* Bloque Exploración */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                    <label htmlFor="exploracionText" className="block text-[11px] font-semibold text-slate-800 cursor-pointer">Exploración</label>
                    <CopyButton textToCopy={isUppercase ? exploracionText.toUpperCase() : exploracionText} />
                  </div>
                  <textarea
                    id="exploracionText"
                    name="exploracionText"
                    value={isUppercase ? exploracionText.toUpperCase() : exploracionText}
                    onChange={e => setExploracionText(e.target.value)}
                    placeholder="Examen físico general y segmentario..."
                    className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                  />
                </div>
                {/* Bloque Actuación */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                    <label htmlFor="actuacionText" className="block text-[11px] font-semibold text-slate-800 cursor-pointer">Actuación</label>
                    <CopyButton textToCopy={isUppercase ? actuacionText.toUpperCase() : actuacionText} />
                  </div>
                  <textarea
                    id="actuacionText"
                    name="actuacionText"
                    value={isUppercase ? actuacionText.toUpperCase() : actuacionText}
                    onChange={e => setActuacionText(e.target.value)}
                    placeholder="- Indicación 1.&#10;- Indicación 2.&#10;- Signos de alarma: ..."
                    className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bloque Aparte para el Botón de Borrar Todo EN MAYÚSCULAS, ROJO CON LETRAS BLANCAS E ÍCONO DE BASURERO */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm flex-shrink-0">
            <button
              type="button"
              onClick={handleClearAll}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.99]"
            >
              <Trash2 className="w-4 h-4 text-white" />
              <span>BORRAR TODO</span>
            </button>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SapuMenu;
