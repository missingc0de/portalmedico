import React, { useState, useMemo } from 'react';
import { 
  Phone, 
  Copy, 
  Check, 
  Search, 
  Hospital, 
  Clipboard, 
  FileText, 
  AlertCircle, 
  Heart, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { User } from '../types';

interface SapuMenuProps {
  onBackToMenu: () => void;
  loggedInUser: User;
}

interface Pathology {
  id: string;
  name: string;
  category: string;
  anamnesis: string;
  exam: string;
  actuacion: string;
}

const PATHOLOGIES: Pathology[] = [
  {
    id: 'normal',
    name: 'Examen Físico Normal / Control General',
    category: 'General',
    anamnesis: 'Paciente consulta por evaluación general o control preventivo. Refiere sentirse en buenas condiciones de salud, sin sintomatología aguda, dolor, fiebre ni dificultades respiratorias recientes. Hábitos y apetito conservados, diuresis y deposiciones normales.',
    exam: 'Buen estado general, lúcido, orientado en tiempo, espacio y persona, cooperador. Hidratado y perfundido, llene capilar < 2 seg. Faringe normal sin exudado. Otoscopia normal bilateral. Pulmonar: Simétrico, expansibilidad conservada, murmullo pulmonar presente bidireccional sin ruidos agregados. Cardiovascular: Ruidos cardiacos rítmicos y regulares, sin soplos. Abdomen: Blando, depresible, indoloro a la palpación, ruidos hidroaéreos normales. Extremidades: Simétricas, sin edema, pulsos distales presentes. Sin focalidad neurológica.',
    actuacion: 'Indicaciones generales: Mantener hábitos saludables, alimentación equilibrada, buena hidratación y actividad física regular. Signos de alarma: Consultar en caso de aparición de síntomas nuevos como dolor agudo, fiebre persistente, dificultad para respirar o compromiso de conciencia.'
  },
  {
    id: 'rinofaringitis',
    name: 'Rinofaringitis aguda',
    category: 'Respiratorio',
    anamnesis: 'Cuadro de X días de evolución, caracterizado por coriza mucosa, congestión nasal, odinofagia leve y tos escasa inicialmente seca, luego productiva. Refiere sensación febril no medida (o fiebre cuantificada hasta X°C). Sin dificultad respiratoria, sin ruidos audibles a distancia. Alimentación tolerada, diuresis conservada.',
    exam: 'Buen estado general, hidratado, activo, perfundido. Mucosa oral húmeda, faringe congestiva sin exudado. Otoscopia normal bilateral. Fosas nasales con coriza anterior. Pulmonar: Simétrico, expansibilidad conservada, murmullo pulmonar presente bidireccional sin ruidos agregados. Sin signos de dificultad respiratoria (sin aleteo nasal, sin tirajes).',
    actuacion: 'Indicaciones generales: Reposo relativo, abundante hidratación oral y aseos nasales frecuentes con suero fisiológico. Signos de alarma para acudir a urgencias: Dificultad para respirar (respiración rápida, hundimiento de costillas, aleteo nasal), labios o uñas morados, quejido al respirar, rechazo alimentario o fiebre alta que no baja.'
  },
  {
    id: 'gastroenteritis',
    name: 'Gastroenteritis aguda',
    category: 'Digestivo',
    anamnesis: 'Cuadro caracterizado por deposiciones líquidas de consistencia disminuida en número de X en las últimas 24 horas, asociadas a episodios de vómitos alimentarios (X episodios). Refiere dolor abdominal tipo cólico difuso, sensación febril y sed moderada. Tolerancia oral parcial/nula en las últimas horas. No refiere sangre ni pus en deposiciones.',
    exam: 'Lúcido, hidratado/deshidratación leve, perfundido, llene capilar < 2 seg. Mucosas húmedas/semihúmedas, ojos normales/ligeramente hundidos. Abdomen blando, deprimible, doloroso a la palpación difusa, ruidos hidroaéreos aumentados. Sin signos de irritación peritoneal (Blumberg negativo). Diuresis presente.',
    actuacion: 'Indicaciones generales: Hidratación oral fraccionada y frecuente (sales de rehidratación), régimen blando y liviano según tolerancia. Signos de alarma para acudir a urgencias: Boca muy seca, llanto sin lágrimas, ojos hundidos, decaimiento extremo o somnolencia, no orinar en más de 6 horas, vómitos repetidos que impiden hidratarse, o deposiciones con sangre.'
  },
  {
    id: 'alergia',
    name: 'Alergia, no especificada',
    category: 'Dermatológico / Alergias',
    anamnesis: 'Paciente consulta por cuadro agudo de prurito generalizado asociado a la aparición de lesiones eritemato-papulares (habones) diseminadas en tronco y extremidades tras la exposición a presunto alérgeno (alimentario/medicamento/contacto) hace X horas. Niega disnea, disfonía, estridor, dolor abdominal, náuseas ni compromiso hemodinámico.',
    exam: 'Buen estado general, hemodinámicamente estable. Piel: Habones eritematosos, sobreelevados, pruriginosos en tronco y extremidades. Mucosa oral indemne, sin edema de úvula ni lengua. Respiratorio: Murmullo pulmonar conservado, sin sibilancias ni estridor laríngeo. Cardiovascular: Ruidos cardiacos rítmicos, regulares, pulsos conservados.',
    actuacion: 'Indicaciones generales: Evitar contacto con el presunto alérgeno causante y mantener la piel fresca. Signos de alarma para acudir a urgencias de inmediato: Dificultad para respirar o tragar, sensación de garganta cerrada, ronquera súbita, hinchazón de labios, lengua o cara, mareos intensos o desmayo.'
  },
  {
    id: 'asma',
    name: 'Crisis asmática',
    category: 'Respiratorio',
    anamnesis: 'Paciente con antecedente de asma bronquial/SBO recurrente, consulta por cuadro de X horas de evolución caracterizado por disnea de inicio progresivo, tos espasmódica, sibilancias audibles y opresión torácica. Refiere desencadenante (infección respiratoria alta/exposición a alérgeno). Uso de inhalador de rescate (salbutamol) con respuesta parcial/nula.',
    exam: 'Lúcido, cooperador, disneico, taquipneico. Uso de musculatura accesoria (tiraje intercostal/subcostal leve a moderado). Pulmonar: Expansión torácica conservada, murmullo pulmonar disminuido globalmente, espiración prolongada, sibilancias bilaterales difusas audibles en ambas fases. Saturación de O2 basal: X%.',
    actuacion: 'Indicaciones generales: Mantener reposo en posición sentada o semisentada. Signos de alarma para acudir a urgencias de inmediato: Dificultad para hablar en frases completas por falta de aire, hundimiento marcado de costillas o el pecho, labios o uñas de color azulado, agitación extrema o somnolencia, o falta de respuesta al inhalador de rescate.'
  },
  {
    id: 'otitis',
    name: 'Otitis media aguda (OMA)',
    category: 'Otorrinolaringología',
    anamnesis: 'Paciente consulta por otalgia aguda de inicio súbito, de carácter pulsátil, unilateral (derecho/izquierdo) de X horas de evolución. Se asocia a sensación de hipoacusia, irritabilidad/llanto en lactantes y fiebre cuantificada hasta X°C. Sin otorrea previa.',
    exam: 'Faringe levemente congestiva. Otoscopia: Conducto auditivo externo permeable, membrana timpánica eritematosa, abombada, con pérdida del triángulo luminoso y disminución de la movilidad. Sin perforación ni otorrea.',
    actuacion: 'Indicaciones generales: Mantener reposo, evitar la entrada de agua al oído afectado y aplicar compresas tibias externas para aliviar el dolor local. Signos de alarma para acudir a urgencias: Salida de líquido, sangre o pus por el oído, inflamación o enrojecimiento doloroso detrás de la oreja, dolor de cabeza muy intenso, vómitos persistentes o fiebre alta sostenida.'
  },
  {
    id: 'faringoamigdalitis',
    name: 'Faringoamigdalitis aguda',
    category: 'Otorrinolaringología',
    anamnesis: 'Consulta por odinofagia intensa de inicio agudo, disfagia, sensación febril cuantificada hasta X°C y cefalea. Refiere compromiso del estado general y adenopatías cervicales dolorosas. Sin tos ni coriza asociada.',
    exam: 'Faringe intensamente congestiva, amígdalas hipertróficas (grado X) con presencia de placas de exudado pultáceo bilateral. Adenopatías submandibulares y cervicales anteriores palpables, dolorosas a la palpación. Sin trismus ni desviación de úvula.',
    actuacion: 'Indicaciones generales: Abundante hidratación con líquidos templados o fríos y reposo. Signos de alarma para acudir a urgencias: Dificultad para respirar, incapacidad para tragar saliva (babeo constante), dificultad extrema para abrir la boca (trismus), úvula desviada o fiebre que persiste tras 48 horas de iniciado el tratamiento.'
  },
  {
    id: 'itu',
    name: 'Infección del tracto urinario (ITU)',
    category: 'Nefrourología',
    anamnesis: 'Paciente consulta por cuadro de disuria dolorosa, poliaquiuria, tenesmo vesical y dolor hipogástrico de X días de evolución. Refiere orinas turbias, de mal olor y hematuria macroscópica terminal. Niega fiebre, escalofríos ni dolor lumbar.',
    exam: 'Buen estado general, asebril. Abdomen blando, deprimible, doloroso a la palpación profunda en hipogastrio. Puño percusión lumbar (PPL) negativa bilateral. Puntos ureterales negativos.',
    actuacion: 'Indicaciones generales: Abundante consumo de agua y no aguantar deseos de orinar. Signos de alarma para acudir a urgencias: Fiebre alta asociada a dolor en la espalda o en un costado, escalofríos intensos, vómitos repetidos que impiden tomar medicamentos, o sangrado abundante en la orina.'
  },
  {
    id: 'neumonia',
    name: 'Neumonía adquirida en la comunidad (NAC)',
    category: 'Respiratorio',
    anamnesis: 'Paciente consulta por tos productiva con expectoración mucopurulenta/herrumbrosa, dolor torácico de tipo pleurítico unilateral que aumenta con la inspiración profunda, fiebre alta persistente con calofríos y disnea de esfuerzo de X días de evolución.',
    exam: 'Estado general regular, febril, taquipneico. Pulmonar: Expansión torácica disminuida en hemitórax afectado, matidez a la percusión localizada, aumento de las vibraciones vocales, murmullo pulmonar disminuido con presencia de crépitos localizados y soplo tubario en zona afectada.',
    actuacion: 'Indicaciones generales: Reposo absoluto en casa, abundante hidratación oral y control médico programado. Signos de alarma para acudir a urgencias de inmediato: Respiración muy rápida, sensación de ahogo o falta de aire al mínimo esfuerzo, hundimiento del pecho al respirar, ruidos o quejidos al exhalar, coloración azulada en labios o uñas, o somnolencia marcada.'
  },
  {
    id: 'hipertensiva',
    name: 'Crisis hipertensiva',
    category: 'Cardiovascular',
    anamnesis: 'Paciente con antecedente de hipertensión arterial, consulta por cefalea holocraneana de moderada intensidad, tinitus, fotopsias y mareos de inicio agudo. Niega dolor torácico, disnea, déficit neurológico focal o alteraciones visuales mayores.',
    exam: 'Lúcido, orientado, vigil. Presión Arterial: X/Y mmHg. Cardiovascular: Ruidos cardiacos rítmicos, regulares, sin soplos. Examen neurológico sumario normal, sin focalidad ni signos de meningismo. Fondo de ojo (si corresponde): normal.',
    actuacion: 'Indicaciones generales: Reposo absoluto en un ambiente tranquilo y sin estímulos luminosos o ruidosos. Signos de alarma para acudir a urgencias de inmediato: Dolor en el pecho opresivo o que se irradia al brazo/cuello, falta de aire súbita, dolor de cabeza extremadamente fuerte de inicio brusco, dificultad para hablar o sonreír, debilidad en un lado del cuerpo, o visión borrosa.'
  },
  {
    id: 'lumbago',
    name: 'Lumbago agudo / Lumbalgia',
    category: 'Musculoesquelético',
    anamnesis: 'Consulta por dolor lumbar bajo de inicio brusco tras esfuerzo físico/giro forzado hace X horas. Dolor limita la deambulación y bipedestación, irradia a glúteos pero no sobrepasa la rodilla. Alivia parcialmente en decúbito.',
    exam: 'Marcha antálgica. Columna lumbar con pérdida de la lordosis fisiológica por contractura de musculatura paravertebral bilateral. Puntos de Valleix negativos. Laségue y Bragard negativos bilateral. Reflejos osteotendíneos y sensibilidad conservada.',
    actuacion: 'Indicaciones generales: Evitar el reposo absoluto en cama (mantener movimiento suave tolerado) y aplicar calor local localizadamente. Signos de alarma para acudir a urgencias de inmediato: Pérdida de fuerza súbita o adormecimiento en una o ambas piernas, pérdida de sensibilidad en la zona íntima (perianal), pérdida del control de la orina o deposiciones, o fiebre alta asociada al dolor lumbar.'
  },
  {
    id: 'quemadura',
    name: 'Quemadura menor',
    category: 'Traumatología / Procedimientos',
    anamnesis: 'Paciente refiere accidente doméstico (contacto con líquido caliente/fuego/objeto caliente) hace X horas, sufriendo quemadura en extremidad/zona. Presenta dolor local urente intenso y aparición progresiva de eritema/ampollas.',
    exam: 'Lesión eritematosa en zona afectada, dolorosa a la palpación (1° grado) / Presencia de flictenas (ampollas) con lecho rosado, húmedo y altamente doloroso al tacto (2° grado superficial). Extensión estimada: X% de superficie corporal total. Bordes netos.',
    actuacion: 'Indicaciones generales: Enfriar la zona con agua corriente templada o fría durante 10-15 minutos, cubrir con gasa limpia y estéril sin apretar. No romper las ampollas. Signos de alarma para acudir a urgencias: Dolor muy intenso que no cede, enrojecimiento o hinchazón que se extiende rápidamente alrededor de la quemadura, salida de pus o mal olor en la herida, o fiebre.'
  },
  {
    id: 'esguince',
    name: 'Esguince de tobillo',
    category: 'Musculoesquelético',
    anamnesis: 'Paciente refiere mecanismo de inversión forzada del tobillo derecho/izquierdo durante deambulación/actividad física hace X horas. Presenta dolor agudo localizado, aumento de volumen local y dificultad para el apoyo del pie.',
    exam: 'Marcha claudicante. Tobillo con aumento de volumen local y equimosis perimaleolar externa. Dolor exquisito a la palpación de ligamento talofibular anterior. Sin dolor en maléolos óseos, base del 5° metatarsiano ni hueso navicular (Criterios de Ottawa negativos).',
    actuacion: 'Indicaciones generales: Reposo de la extremidad lesionada, aplicación de hielo local (cubierto con un paño) por 15 minutos varias veces al día, mantener el pie elevado y usar un vendaje de soporte suave. Signos de alarma para acudir a urgencias: Dedos del pie fríos, pálidos o morados, pérdida de sensibilidad en el pie, dolor insoportable que aumenta progresivamente, o incapacidad total de apoyar el pie después de 48 horas.'
  }
];

interface Contact {
  name: string;
  phone: string;
  notes: string;
  category: 'Salud' | 'Emergencia' | 'Comunidad';
}

const CONTACTS: Contact[] = [
  {
    name: 'Centro Regulador SAMU',
    phone: '131',
    notes: 'Coordinación directa traslados de urgencia y ambulancias.',
    category: 'Salud'
  },
  {
    name: 'CITUC Toxicología (PUC)',
    phone: '2 2635 3800',
    notes: 'Información y manejo por intoxicaciones y envenenamientos.',
    category: 'Salud'
  },
  {
    name: 'Urgencias Hospital Coquimbo',
    phone: '51 233 6000',
    notes: 'Teléfono OIRS central y categorización del hospital de referencia.',
    category: 'Salud'
  },
  {
    name: 'Pediatría Hospital Coquimbo',
    phone: '51 233 6150',
    notes: 'Especialista de turno / Enlace técnico interconsultas infantiles.',
    category: 'Salud'
  },
  {
    name: 'Salud Responde Minsal',
    phone: '600 360 7777',
    notes: 'Orientación médica telefónica nacional las 24 horas.',
    category: 'Salud'
  },
  {
    name: 'Carabineros de Chile',
    phone: '133',
    notes: 'Comisaría local / Respaldo por agresiones o constatación de lesiones.',
    category: 'Emergencia'
  },
  {
    name: 'Bomberos Coquimbo',
    phone: '132',
    notes: 'Rescate vehicular e incendios.',
    category: 'Emergencia'
  },
  {
    name: 'PDI Coquimbo',
    phone: '134',
    notes: 'Policía de Investigaciones para procedimientos forenses de urgencia.',
    category: 'Emergencia'
  },
  {
    name: 'Fono Violencia Sernameg',
    phone: '1455',
    notes: 'Apoyo urgente ante casos de violencia contra la mujer.',
    category: 'Comunidad'
  },
  {
    name: 'Fono SENDA Drogas/Alcohol',
    phone: '1412',
    notes: 'Orientación sobre consumo de sustancias de forma anónima y gratuita.',
    category: 'Comunidad'
  }
];

export const SapuMenu: React.FC<SapuMenuProps> = ({ onBackToMenu, loggedInUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPathology, setSelectedPathology] = useState<Pathology>(PATHOLOGIES[0]);
  const [copiedStatus, setCopiedStatus] = useState<'anamnesis' | 'exam' | 'actuacion' | 'both' | null>(null);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);

  // Filter pathologies
  const filteredPathologies = useMemo(() => {
    return PATHOLOGIES.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleCopy = (text: string, type: 'anamnesis' | 'exam' | 'actuacion' | 'both') => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(type);
    setTimeout(() => setCopiedStatus(null), 2000);
  };

  const handleCopyContact = (phone: string, name: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedContact(name);
    setTimeout(() => setCopiedContact(null), 2000);
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-4 sm:p-5 w-full flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-red-200">
            <Hospital className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Portal Clínico SAPU</h2>
            <p className="text-[11px] text-slate-500 font-medium">Módulo de Urgencia y Enlaces Directos de Derivación</p>
          </div>
        </div>
        <button
          onClick={onBackToMenu}
          className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          Volver al Inicio
        </button>
      </div>

      {/* Main Grid Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">
        {/* Left Column: Anamnesis / Exam Templates by Pathology (Cols 8) */}
        <div className="lg:col-span-8 flex flex-col min-h-0 space-y-3 overflow-hidden">
          <div className="flex justify-between items-center gap-3 shrink-0">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar patología de urgencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-sky-500 transition-all font-sans text-slate-700"
              />
            </div>
            <div className="text-[10px] bg-sky-50 text-sky-700 px-2 py-1 rounded-md font-semibold shrink-0">
              {filteredPathologies.length} Disponibles
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0 overflow-hidden">
            {/* Pathology List */}
            <div className="md:col-span-1 border border-slate-100 rounded-xl overflow-y-auto custom-scrollbar bg-slate-50/50 p-2 space-y-1 h-full min-h-0">
              {filteredPathologies.map(pathology => (
                <button
                  key={pathology.id}
                  onClick={() => setSelectedPathology(pathology)}
                  className={`w-full text-left p-2.5 rounded-lg transition-all duration-150 flex items-center justify-between text-xs cursor-pointer ${
                    selectedPathology.id === pathology.id 
                      ? 'bg-gradient-to-r from-sky-600 to-sky-700 text-white font-bold shadow-sm shadow-sky-100' 
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/40'
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="truncate">{pathology.name}</div>
                    <div className={`text-[9px] mt-0.5 ${selectedPathology.id === pathology.id ? 'text-sky-100' : 'text-slate-400'}`}>
                      {pathology.category}
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${selectedPathology.id === pathology.id ? 'text-white' : 'text-slate-300'}`} />
                </button>
              ))}
              {filteredPathologies.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  No se encontraron patologías.
                </div>
              )}
            </div>

            {/* Template Detail Panels */}
            <div className="md:col-span-2 flex flex-col min-h-0 overflow-hidden">
              {selectedPathology ? (
                <div className="flex-1 flex flex-col space-y-3.5 bg-slate-50/30 border border-slate-100 rounded-xl p-4 min-w-0 h-full min-h-0 overflow-hidden">
                  {/* Selected Header */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2 shrink-0">
                    <div>
                      <span className="text-[9px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {selectedPathology.category}
                      </span>
                      <h3 className="text-xs font-bold text-slate-800 mt-1">{selectedPathology.name}</h3>
                    </div>
                    <button
                      onClick={() => handleCopy(`[ANAMNESIS]\n${selectedPathology.anamnesis}\n\n[EXPLORACIÓN]\n${selectedPathology.exam}\n\n[ACTUACIÓN]\n${selectedPathology.actuacion}`, 'both')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-[10px] shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      {copiedStatus === 'both' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedStatus === 'both' ? '¡Todo Copiado!' : 'Copiar Ficha Completa'}</span>
                    </button>
                  </div>

                  {/* Anamnesis Template */}
                  <div className="space-y-1 flex-1 min-h-0 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-1 text-slate-700 font-bold text-[11px]">
                        <Clipboard className="w-3.5 h-3.5 text-sky-600" />
                        <span>Anamnesis</span>
                      </div>
                      <button
                        onClick={() => handleCopy(selectedPathology.anamnesis, 'anamnesis')}
                        className="p-1 hover:bg-slate-200/60 rounded text-slate-400 hover:text-sky-600 transition-colors cursor-pointer flex items-center justify-center"
                        title="Copiar Anamnesis"
                      >
                        {copiedStatus === 'anamnesis' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="p-2.5 bg-white border border-slate-200/60 rounded-lg text-xs text-slate-600 font-sans leading-relaxed select-all overflow-y-auto flex-grow min-h-0 max-h-[85px] custom-scrollbar">
                      {selectedPathology.anamnesis}
                    </div>
                  </div>

                  {/* Exploración Template */}
                  <div className="space-y-1 flex-1 min-h-0 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-1 text-slate-700 font-bold text-[11px]">
                        <FileText className="w-3.5 h-3.5 text-sky-600" />
                        <span>Exploración</span>
                      </div>
                      <button
                        onClick={() => handleCopy(selectedPathology.exam, 'exam')}
                        className="p-1 hover:bg-slate-200/60 rounded text-slate-400 hover:text-sky-600 transition-colors cursor-pointer flex items-center justify-center"
                        title="Copiar Exploración"
                      >
                        {copiedStatus === 'exam' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="p-2.5 bg-white border border-slate-200/60 rounded-lg text-xs text-slate-600 font-sans leading-relaxed select-all overflow-y-auto flex-grow min-h-0 max-h-[85px] custom-scrollbar">
                      {selectedPathology.exam}
                    </div>
                  </div>

                  {/* Actuación Template */}
                  <div className="space-y-1 flex-1 min-h-0 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-1 text-slate-700 font-bold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        <span>Actuación (Con signos de alarma específicos)</span>
                      </div>
                      <button
                        onClick={() => handleCopy(selectedPathology.actuacion, 'actuacion')}
                        className="p-1 hover:bg-slate-200/60 rounded text-slate-400 hover:text-sky-600 transition-colors cursor-pointer flex items-center justify-center"
                        title="Copiar Actuación"
                      >
                        {copiedStatus === 'actuacion' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="p-2.5 bg-white border border-slate-200/60 rounded-lg text-xs text-slate-650 font-sans leading-relaxed select-all overflow-y-auto flex-grow min-h-0 max-h-[85px] custom-scrollbar">
                      {selectedPathology.actuacion}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[9px] text-slate-400 bg-slate-100 p-2 rounded-lg shrink-0">
                    <AlertCircle className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>Puedes hacer clic en los textos para seleccionarlos por completo o copiar individualmente.</span>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                  Selecciona una patología del panel lateral para ver las directrices clínicas.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Urgencies Phone Directory (Cols 4) */}
        <div className="lg:col-span-4 flex flex-col min-h-0 bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3 shrink-0">
            <Phone className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-bold text-slate-800">Directorio Telefónico SAPU</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0 h-full">
            {CONTACTS.map((contact, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200/60 rounded-lg p-2.5 hover:shadow-2xs transition-shadow flex items-start gap-2.5 justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-800">{contact.name}</span>
                    <span className={`text-[7.5px] font-black uppercase tracking-wider px-1 py-0.5 rounded leading-none ${
                      contact.category === 'Salud' ? 'bg-emerald-50 text-emerald-700' :
                      contact.category === 'Emergencia' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {contact.category}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 font-medium leading-tight mt-0.5">{contact.notes}</p>
                  <a 
                    href={`tel:${contact.phone.replace(/\s+/g, '')}`} 
                    className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 text-[11px] font-extrabold mt-1"
                  >
                    <Phone className="w-2.5 h-2.5" />
                    <span>{contact.phone}</span>
                  </a>
                </div>

                <button
                  onClick={() => handleCopyContact(contact.phone, contact.name)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-sky-600 transition-all cursor-pointer shrink-0"
                  title="Copiar Teléfono"
                >
                  {copiedContact === contact.name ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="bg-red-50 border border-red-100 rounded-lg p-2 mt-2.5 shrink-0 flex items-start gap-1.5 text-[9px] text-red-700">
            <Sparkles className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
            <span>Ante riesgo vital coordinar de inmediato con SAMU (131).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
