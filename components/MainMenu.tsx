
import React, { useState } from 'react';
import { View, CertificateType, Profession } from '../types'; 

interface MainMenuProps {
  onSelectMenuItem: (view: View) => void;
  profession: Profession;
  onOpenRem?: () => void;
}

const certificateOptions: { label: string; type: CertificateType, description: string }[] = [
  { label: 'ORDEN DE LABORATORIO', type: 'ordenLaboratorio', description: 'Generar una orden para exámenes de laboratorio.' },
  { label: 'ORDEN DE IMÁGENES', type: 'ordenExamenRadiologico', description: 'Generar una orden para exámenes de imágenes/radiológicos.' },
  { label: 'FICHA DE CONSULTORÍA', type: 'fichaConsultoria', description: 'Generar una ficha de consultoría de especialidad.' },
];

interface ClinicalTemplateSubItem {
  label: string;
  type: CertificateType;
}

interface ClinicalTemplateCategory {
  id: string;
  label: string;
  action?: () => void;
  isDirectAction?: boolean;
  items?: ClinicalTemplateSubItem[];
}

const calculatorOptions: { label: string; type: CertificateType, description: string }[] = [
  { label: 'CÁLCULO DE LECHES', type: 'calculoLeches', description: 'Calculadora para fórmulas lácteas pediátricas.' },
  { label: 'CURVAS DE CRECIMIENTO', type: 'curvasCrecimiento', description: 'Visualizar y triangular curvas de crecimiento pediátricas.' },
  { label: 'TABLA DE COMPOSICIÓN DE ALIMENTOS', type: 'tablaComposicionAlimentos', description: 'Consultar la composición nutricional de diversos alimentos.' },
  { label: 'DOSIS EN PEDIATRÍA', type: 'dosisPediatria', description: 'Calculadora de dosis de medicamentos pediátricos.' },
  { label: 'AJUSTE DE DOSIS EN ERC', type: 'ajusteDosisErc', description: 'Calculadora para ajuste de dosis en Enfermedad Renal Crónica.' },
];

const hospitalDigitalOptions: { label: string; type: CertificateType, description: string }[] = [
    { label: 'DERMATOLOGÍA', type: 'hdDermatologia', description: 'Plantillas para interconsulta de dermatología.' },
    { label: 'DIABETES', type: 'hdDiabetes', description: 'Plantillas para interconsulta de diabetes.' },
    { label: 'ENDOCRINOLOGÍA', type: 'hdEndocrinologia', description: 'Plantillas para interconsulta de endocrinología.' },
    { label: 'GERIATRÍA', type: 'hdGeriatria', description: 'Plantillas para interconsulta de geriatría.' },
    { label: 'REUMATOLOGÍA', type: 'hdReumatologia', description: 'Plantillas para interconsulta de reumatología.' },
];


const MainMenu: React.FC<MainMenuProps> = ({ onSelectMenuItem, profession, onOpenRem }) => {
  const [isClinicalTemplatesOpen, setIsClinicalTemplatesOpen] = useState(false);
  const [isHospitalDigitalOpen, setIsHospitalDigitalOpen] = useState(false);
  const [isGeneradorDocumentosOpen, setIsGeneradorDocumentosOpen] = useState(false);
  const [isCalculadorasOpen, setIsCalculadorasOpen] = useState(false);

  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  const toggleSubMenu = (subMenuKey: string) => {
    setOpenSubMenus(prev => ({ ...prev, [subMenuKey]: !prev[subMenuKey] }));
  };

  const clinicalTemplateCategories: ClinicalTemplateCategory[] = [
    {
      id: 'ecicep',
      label: 'ECICEP',
      items: [
        { label: 'PREINGRESO ECICEP', type: 'fichaPreingresoEcicep' },
        { label: 'INGRESO ECICEP', type: 'fichaIngresoEcicep' },
        { label: 'CONTROL ECICEP (NUEVO)', type: 'fichaControlEcicepNuevo' },
        { label: 'SEGUIMIENTO ECICEP', type: 'fichaSeguimientoEcicep' },
      ]
    },
    { 
      id: 'controlPscv', 
      label: 'CONTROL CRÓNICO', 
      action: () => onSelectMenuItem('fichaControlPscv'), 
      isDirectAction: true 
    },

    {
      id: 'enfermeria',
      label: 'CONTROLES ENFERMERÍA',
      items: [
        { label: 'CONTROL CARDIOVASCULAR (ENF)', type: 'fichaControlCardiovascular' },
        { label: 'CONTROL ADULTO MAYOR (ENF)', type: 'fichaControlAdultoMayor' },
      ]
    },
    {
      id: 'saludMental',
      label: 'SALUD MENTAL',
      items: [
        { label: 'CONTROL SALUD MENTAL', type: 'fichaControlSm' },
        { label: 'CONSULTA PASMI', type: 'fichaConsultaPasmi' },
      ]
    },
    {
      id: 'controlIraEra',
      label: 'CONTROL IRA/ERA',
      action: () => onSelectMenuItem('fichaControlSalaEra'),
      isDirectAction: true
    },
    {
      id: 'ninoSano',
      label: 'NIÑO SANO',
      items: [
        { label: 'CONTROL DÍADA / RECIÉN NACIDO', type: 'fichaControlNinoSanoRN' },
        { label: 'CONTROL NIÑO SANO 1° MES', type: 'fichaControlNinoSano1Mes' },
        { label: 'CONTROL NIÑO SANO 2 MESES', type: 'fichaControlNinoSano2Meses' },
        { label: 'CONTROL NIÑO SANO 3° MES', type: 'fichaControlNinoSano3Mes' },
        { label: 'CONTROL NIÑO SANO 4 MESES', type: 'fichaControlNinoSano4Meses' },
        { label: 'CONSULTA NUTRICIONAL 5 MESES', type: 'consultaNutricional5Meses' },
        { label: 'CONTROL NIÑO SANO 6 MESES', type: 'fichaControlNinoSano6Meses' },
        { label: 'CONTROL NIÑO SANO 8 MESES', type: 'fichaControlNinoSano8Meses' },
        { label: 'CONTROL NIÑO SANO 12 MESES', type: 'fichaControlNinoSano12Meses' },
        { label: 'CONTROL NIÑO SANO 18 MESES', type: 'fichaControlNinoSano18Meses' },
        { label: 'CONTROL NIÑO SANO 2 AÑOS', type: 'fichaControlNinoSano2Anos' },
        { label: 'CONTROL NIÑO SANO 3 AÑOS', type: 'fichaControlNinoSano3Anos' },
        { label: 'CONSULTA NUTRICIONAL 3 AÑOS 6 MESES', type: 'consultaNutricional3Anos6Meses' },
        { label: 'CONTROL NIÑO SANO 4 AÑOS', type: 'fichaControlNinoSano4Anos' },
        { label: 'CONTROL NIÑO SANO 5 AÑOS', type: 'fichaControlNinoSano5Anos' },
        { label: 'CONTROL NIÑO SANO 6 AÑOS', type: 'fichaControlNinoSano6Anos' },
        { label: 'CONTROL NIÑO SANO 7 AÑOS', type: 'fichaControlNinoSano7Anos' },
        { label: 'CONTROL NIÑO SANO 8 AÑOS', type: 'fichaControlNinoSano8Anos' },
        { label: 'CONTROL NIÑO SANO 9 AÑOS', type: 'fichaControlNinoSano9Anos' },
      ]
    },
    {
      id: 'visitaDomiciliaria',
      label: 'VISITA DOMICILIARIA',
      items: [
        { label: 'EQUIPO DE CABECERA', type: 'fichaVisitaDomiciliaria' },
        { label: 'INGRESO PADDS', type: 'fichaIngresoPadds' },
        { label: 'CONTROL PADDS', type: 'fichaControlPadds' },
      ]
    },
    { 
      id: 'fondoOjo',
      label: 'FONDO DE OJO',
      action: () => onSelectMenuItem('fichaFondoOjo'),
      isDirectAction: true
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col w-full relative overflow-hidden">
      <div className="border-b border-slate-150 pb-2 mb-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accesos y Herramientas</h3>
      </div>
      <div className="flex flex-col gap-3">
        
        {/* MIS PACIENTES */}
        <div className="w-full flex">
          <button onClick={() => onSelectMenuItem('misPacientes')} className="w-full py-2 px-4 bg-violet-500 hover:bg-violet-600 bg-gradient-to-r from-transparent to-black/10 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 flex flex-col items-center justify-center text-center border border-violet-600/50 cursor-pointer">
            <span className="block text-sm uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">MIS PACIENTES</span>
            <span className="block text-[10px] font-normal text-violet-100 mt-0.5 w-full whitespace-nowrap overflow-hidden text-ellipsis">Ver y gestionar tus pacientes registrados.</span>
          </button>
        </div>

        {/* PLANTILLAS DE FICHAS CLÍNICAS */}
        <div className="w-full flex flex-col">
          <button
            onClick={() => setIsClinicalTemplatesOpen(!isClinicalTemplatesOpen)}
            className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-600 bg-gradient-to-r from-transparent to-black/10 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 flex flex-col items-center justify-center text-center border border-teal-600/50 cursor-pointer"
            aria-expanded={isClinicalTemplatesOpen}
            aria-controls="clinical-templates-submenu"
          >
            <div className="flex items-center justify-center gap-2 w-full">
              <span className="block text-sm uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">PLANTILLAS DE FICHAS CLÍNICAS</span>
              <span className="text-sm font-light">{isClinicalTemplatesOpen ? '−' : '+'}</span>
            </div>
            <span className="block text-[10px] font-normal text-teal-100 mt-0.5 w-full whitespace-nowrap overflow-hidden text-ellipsis">Acceder a plantillas para registros clínicos.</span>
          </button>
          {isClinicalTemplatesOpen && (
            <div id="clinical-templates-submenu" className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-150 space-y-2 animate-fadeIn">
              {clinicalTemplateCategories.map(category => (
                <div key={category.id}>
                  {category.isDirectAction && category.action ? (
                    <button onClick={category.action} className="w-full text-left p-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded shadow-sm hover:shadow transition-all cursor-pointer">
                      <span>{category.label}</span>
                    </button>
                  ) : (
                    <>
                      <button onClick={() => toggleSubMenu(category.id)} className="w-full text-left p-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded shadow-sm hover:shadow transition-all flex justify-between items-center cursor-pointer" aria-expanded={openSubMenus[category.id]}>
                        <span>{category.label}</span>
                        <span className="text-sky-100">{openSubMenus[category.id] ? '▲' : '▼'}</span>
                      </button>
                      {openSubMenus[category.id] && category.items && (
                        <div className="pl-3 mt-1.5 space-y-1.5 border-l-2 border-sky-300 ml-1.5">
                          {(() => {
                            const isNinoSano = category.id === 'ninoSano';
                            const showAll = openSubMenus['ninoSano_all'];
                            const medicalTypes = ['fichaControlNinoSano1Mes', 'fichaControlNinoSano3Mes', 'fichaControlNinoSano6Anos'];
                            
                            const itemsToDisplay = isNinoSano && !showAll
                              ? category.items.filter(item => medicalTypes.includes(item.type))
                              : category.items;

                            return (
                              <>
                                {itemsToDisplay.map(item => {
                                  const isStar = medicalTypes.includes(item.type);
                                  return (
                                    <button
                                      key={item.type}
                                      onClick={() => onSelectMenuItem(item.type)}
                                      className="w-full text-left p-2 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded border border-sky-100 shadow-sm transition-all cursor-pointer flex items-center justify-between"
                                    >
                                      <span className="flex items-center gap-1.5">
                                        {isStar && <span className="text-sky-500 font-bold text-sm">★</span>}
                                        {item.label}
                                      </span>
                                    </button>
                                  );
                                })}
                                {isNinoSano && (
                                  <button
                                    onClick={() => toggleSubMenu('ninoSano_all')}
                                    className="w-full text-center p-1.5 bg-sky-100/70 hover:bg-sky-200/70 text-sky-800 text-[11px] font-bold rounded transition-all cursor-pointer mt-1"
                                  >
                                    {showAll ? 'Mostrar menos (solo médico)' : 'Ver más controles...'}
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PLANTILLAS DE HOSPITAL DIGITAL */}
        <div className="w-full flex flex-col">
          <button
            onClick={() => setIsHospitalDigitalOpen(!isHospitalDigitalOpen)}
            className="w-full py-2 px-4 bg-rose-500 hover:bg-rose-600 bg-gradient-to-r from-transparent to-black/10 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 flex flex-col items-center justify-center text-center border border-rose-600/50 cursor-pointer"
            aria-expanded={isHospitalDigitalOpen}
            aria-controls="hospital-digital-submenu"
          >
            <div className="flex items-center justify-center gap-2 w-full">
              <span className="block text-sm uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">PLANTILLAS HOSPITAL DIGITAL</span>
              <span className="text-sm font-light">{isHospitalDigitalOpen ? '−' : '+'}</span>
            </div>
            <span className="block text-[10px] font-normal text-rose-100 mt-0.5 w-full whitespace-nowrap overflow-hidden text-ellipsis">Generar plantillas para interconsultas.</span>
          </button>
          {isHospitalDigitalOpen && (
            <div id="hospital-digital-submenu" className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-150 space-y-2 animate-fadeIn">
              {hospitalDigitalOptions.map((option) => (
                <button key={option.type} onClick={() => onSelectMenuItem(option.type)} className="w-full text-left p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded border border-rose-100 shadow-sm transition-all cursor-pointer">
                  <span className="block font-bold">{option.label}</span>
                  <span className="block text-[10px] text-rose-500/80 mt-0.5">{option.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GENERADOR DE DOCUMENTOS */}
        <div className="w-full flex flex-col">
          <button
            onClick={() => setIsGeneradorDocumentosOpen(!isGeneradorDocumentosOpen)}
            className="w-full py-2 px-4 bg-sky-500 hover:bg-sky-600 bg-gradient-to-r from-transparent to-black/10 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 flex flex-col items-center justify-center text-center border border-sky-600/50 cursor-pointer"
            aria-expanded={isGeneradorDocumentosOpen}
          >
            <div className="flex items-center justify-center gap-2 w-full">
              <span className="block text-sm uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">GENERADOR DE DOCUMENTOS</span>
              <span className="text-sm font-light">{isGeneradorDocumentosOpen ? '−' : '+'}</span>
            </div>
            <span className="block text-[10px] font-normal text-sky-100 mt-0.5 w-full whitespace-nowrap overflow-hidden text-ellipsis">Emitir certificados y órdenes médicas.</span>
          </button>
          {isGeneradorDocumentosOpen && (
            <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-150 space-y-2 animate-fadeIn">
              {certificateOptions.map((option) => (
                <button key={option.type} onClick={() => onSelectMenuItem(option.type)} className="w-full text-left p-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded border border-sky-100 shadow-sm transition-all cursor-pointer">
                  <span className="block font-bold">{option.label}</span>
                  <span className="block text-[10px] text-sky-600/70 mt-0.5">{option.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CALCULADORAS */}
        <div className="w-full flex flex-col">
          <button onClick={() => setIsCalculadorasOpen(!isCalculadorasOpen)} className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 bg-gradient-to-r from-transparent to-black/10 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 flex flex-col items-center justify-center text-center border border-indigo-600/50 cursor-pointer" aria-expanded={isCalculadorasOpen}>
            <div className="flex items-center justify-center gap-2 w-full">
              <span className="block text-sm uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">CALCULADORAS</span>
              <span className="text-sm font-light">{isCalculadorasOpen ? '−' : '+'}</span>
            </div>
            <span className="block text-[10px] font-normal text-indigo-100 mt-0.5 w-full whitespace-nowrap overflow-hidden text-ellipsis">Acceder a herramientas de cálculo médico.</span>
          </button>
          {isCalculadorasOpen && (
            <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-150 space-y-2 animate-fadeIn">
              {calculatorOptions.map((option) => (
                <button key={option.type} onClick={() => onSelectMenuItem(option.type)} className="w-full text-left p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded border border-indigo-100 shadow-sm transition-all cursor-pointer" aria-label={`Seleccionar ${option.label}`}>
                  <span className="block font-bold">{option.label}</span>
                  <span className="block text-[10px] text-indigo-500/80 mt-0.5">{option.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GRUPAL DE DIABETES */}
        <div className="w-full flex">
          <button onClick={() => onSelectMenuItem('grupalDiabetesManager')} className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 bg-gradient-to-r from-transparent to-black/10 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 flex flex-col items-center justify-center text-center border border-green-600/50 cursor-pointer">
            <span className="block text-sm uppercase tracking-wide w-full whitespace-nowrap overflow-hidden text-ellipsis">GRUPAL DE DIABETES</span>
            <span className="block text-[10px] font-normal text-green-100 mt-0.5 w-full whitespace-nowrap overflow-hidden text-ellipsis">Gestión y análisis grupal de hemoglucotest.</span>
          </button>
        </div>

        {/* FARMACIA */}
        <div className="w-full flex">
           <button onClick={() => onSelectMenuItem('arsenalFarmacologico')} className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 bg-gradient-to-r from-transparent to-black/10 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 flex flex-col items-center justify-center text-center border border-orange-600/50 cursor-pointer">
             <span className="block text-sm uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">FARMACIA</span>
             <span className="block text-[10px] font-normal text-orange-100 mt-0.5 w-full whitespace-nowrap overflow-hidden text-ellipsis">Consulta de arsenal farmacológico.</span>
           </button>
        </div>

        {/* COMUNIDAD */}
        <div className="w-full flex">
           <button onClick={() => onSelectMenuItem('comunidad')} className="w-full py-2 px-4 bg-sky-500 hover:bg-sky-600 bg-gradient-to-r from-transparent to-black/10 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 flex flex-col items-center justify-center text-center border border-sky-600/50 cursor-pointer">
             <span className="block text-sm uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">COMUNIDAD</span>
             <span className="block text-[10px] font-normal text-sky-100 mt-0.5 w-full whitespace-nowrap overflow-hidden text-ellipsis">Publicaciones y avisos compartidos con el equipo (estilo Twitter/Slack).</span>
           </button>
        </div>

        {/* PORTAL CLÍNICO SAPU */}
        <div className="w-full flex">
           <button onClick={() => onSelectMenuItem('sapu')} className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 bg-gradient-to-r from-transparent to-black/10 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 flex flex-col items-center justify-center text-center border border-red-600/50 cursor-pointer">
             <span className="block text-sm uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">PORTAL CLÍNICO SAPU</span>
             <span className="block text-[10px] font-normal text-red-100 mt-0.5 w-full whitespace-nowrap overflow-hidden text-ellipsis">Directorio telefónico y plantillas de anamnesis / examen físico.</span>
           </button>
        </div>

        {/* CALCULAR REM */}
        {onOpenRem && (
          <div className="w-full flex">
            <button
              onClick={onOpenRem}
              className="w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-600 bg-gradient-to-r from-transparent to-black/10 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 flex flex-col items-center justify-center text-center border border-emerald-600/50 cursor-pointer"
            >
              <span className="block text-sm uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">CALCULAR REM</span>
              <span className="block text-[10px] font-normal text-emerald-100 mt-0.5 w-full whitespace-nowrap overflow-hidden text-ellipsis">Registro estadístico mensual.</span>
            </button>
          </div>
        )}

      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MainMenu;
