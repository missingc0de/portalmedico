const fs = require("fs");

let code = fs.readFileSync("components/FichaSeguimientoEcicep.tsx", "utf-8");

// 1. Add fields to initialFormData
code = code.replace(
  "  planProximoControlTiempo: '',\n};",
  "  planProximoControlTiempo: '',\n  incluirControlCardiovascular: false,\n  incluirControlHipotiroidismo: false,\n  incluirControlArtrosis: false,\n  incluirControlEpilepsia: false,\n  incluirControlSalaEra: false,\n  incluirControlSalaIra: false,\n  incluirControlDemencias: false,\n  incluirControlSm: false,\n};"
);

// 2. Add state variable isAdditionalControlsOpen next to showRemActive
code = code.replace(
  "  const [showRemActive, setShowRemActive] = useState(false);",
  "  const [showRemActive, setShowRemActive] = useState(false);\n  const [isAdditionalControlsOpen, setIsAdditionalControlsOpen] = useState(false);"
);

// 3. Define arrays before render
const arraysDef = `  const additionalControlsItems = [
    { key: 'incluirControlCardiovascular', label: 'Control cardiovascular' },
    { key: 'incluirControlHipotiroidismo', label: 'Control hipotiroidismo' },
    { key: 'incluirControlArtrosis', label: 'Control artrosis' },
    { key: 'incluirControlEpilepsia', label: 'Control epilepsia' },
    { key: 'incluirControlSalaEra', label: 'Control SALA ERA' },
    { key: 'incluirControlSalaIra', label: 'Control SALA IRA' },
    { key: 'incluirControlDemencias', label: 'Control demencias' },
    { key: 'incluirControlSm', label: 'Control SM' },
  ];

  const cvSymptomsItems = [
    { key: 'cv_sintoma_ortopnea', label: 'Ortopnea' },
    { key: 'cv_sintoma_dpn', label: 'DPN' },
    { key: 'cv_sintoma_nicturia', label: 'Nicturia' },
    { key: 'cv_sintoma_edema', label: 'Edema en MM.II.' },
    { key: 'cv_sintoma_angor', label: 'Ángor' },
    { key: 'cv_sintoma_palpitaciones', label: 'Palpitaciones' },
    { key: 'cv_sintoma_polidipsia', label: 'Polidipsia' },
    { key: 'cv_sintoma_poliuria', label: 'Poliuria' },
    { key: 'cv_sintoma_polifagia', label: 'Polifagia' },
    { key: 'cv_sintoma_perdida_peso', label: 'Pérdida de peso' },
  ];

  const eraSymptomsItems = [
    { key: 'era_sintoma_tos', label: 'Tos con risa/ejercicio/frío' },
    { key: 'era_sintoma_opresion', label: 'Sensación opresión torácica' },
    { key: 'era_sintoma_rinorrea', label: 'Rinorrea' },
    { key: 'era_sintoma_estornudos', label: 'Estornudos en salva' },
    { key: 'era_sintoma_prurito', label: 'Prurito nasal/ocular' },
    { key: 'era_sintoma_limitan', label: 'Limitan actividades' },
    { key: 'era_sintoma_diarios', label: 'Síntomas diarios (>2 veces/semana)' },
    { key: 'era_sintoma_nocturnos', label: 'Síntomas nocturnos' },
    { key: 'era_sintoma_sbt_sos', label: 'Requerimiento SBT SOS' },
    { key: 'era_sintoma_urgencias', label: 'Consultas en urgencias' },
    { key: 'era_sintoma_corticoides', label: 'Uso de corticoides sistémicos (actual/reciente)' },
  ];

  const eraTriggersItems = [
    { key: 'era_desencadenante_mascotas', label: 'Mascotas' },
    { key: 'era_desencadenante_higiene', label: 'Higiene de hogar' },
    { key: 'era_desencadenante_alfombras', label: 'Alfombras' },
    { key: 'era_desencadenante_tabaco_ambiental', label: 'Hábito tabáquico ambiental' },
    { key: 'era_desencadenante_cocina', label: 'Cocina a leña/carbón' },
    { key: 'era_desencadenante_calefaccion', label: 'Calefacción' },
  ];

  const additionalControlsKeys = additionalControlsItems.map(item => item.key);`;

code = code.replace(
  "  const handleLabFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {",
  arraysDef + "\n\n  const handleLabFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {"
);

// 4. Replace Identificación block in JSX
const oldIdentBlock = `                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                    <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Identificación</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <FormField label="Edad" id="edad" name="edad" type="number" value={formData.edad} onChange={handleChange as any} inputClassName="!h-[42px] text-black" />
                            <div className="-mt-4">
                                {renderRadioGroup("Sexo", "sexo", [{value: "Masculino", label: "Masculino"}, {value: "Femenino", label: "Femenino"}])}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-end gap-4 mt-2">
                        <div className="flex-grow">
                            {renderRadioGroup("Estratificación", "estratificacion", [{value: "G1", label: "G1"}, {value: "G2", label: "G2"}, {value: "G3", label: "G3"}])}
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsRiskCalculatorOpen(true)}
                            className="mb-4 flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-[10px] font-bold rounded-lg shadow hover:bg-sky-700 transition-all h-[42px]"
                        >
                            <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                                <path d="M12 4L4 20H20L12 4Z" />
                            </svg>
                            CALCULAR
                        </button>
                    </div>
                </section>`;

const newIdentBlock = `                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                    <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Identificación</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <FormField label="Edad" id="edad" name="edad" type="number" value={formData.edad} onChange={handleChange as any} inputClassName="!h-[42px] text-black" />
                            <div className="-mt-4">
                                {renderRadioGroup("Sexo", "sexo", [{value: "Masculino", label: "Masculino"}, {value: "Femenino", label: "Femenino"}])}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-end gap-4 mt-2">
                        <div className="flex-grow">
                            {renderRadioGroup("Estratificación", "estratificacion", [{value: "G1", label: "G1"}, {value: "G2", label: "G2"}, {value: "G3", label: "G3"}])}
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsRiskCalculatorOpen(true)}
                            className="mb-4 flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-[10px] font-bold rounded-lg shadow hover:bg-sky-700 transition-all h-[42px]"
                        >
                            <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                                <path d="M12 4L4 20H20L12 4Z" />
                            </svg>
                            CALCULAR
                        </button>
                    </div>

                    <div className="mt-2 border-t border-slate-200 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAdditionalControlsOpen(!isAdditionalControlsOpen)}
                        className="w-full flex justify-between items-center py-2 text-sm font-bold text-sky-800 uppercase tracking-tighter"
                      >
                        <span>Controles Adicionales</span>
                        <svg className={\`h-5 w-5 transform transition-transform \${isAdditionalControlsOpen ? 'rotate-180' : ''}\`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isAdditionalControlsOpen && (
                        <div className="mt-2 bg-white p-3 rounded-lg border border-sky-100 shadow-inner animate-fadeIn">
                          <label htmlFor="additionalControlSelect" className="block text-sm font-medium text-slate-700 mb-1.5">Seleccionar Control Específico</label>
                          <select
                            id="additionalControlSelect"
                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 outline-none text-sm font-sans font-normal"
                            onChange={(e) => {
                              const selectedKey = e.target.value;
                              setFormData(prev => {
                                const newState = { ...prev };
                                additionalControlsKeys.forEach(key => {
                                  (newState as any)[key] = false;
                                });
                                if (selectedKey) {
                                  (newState as any)[selectedKey] = true;
                                }
                                return newState;
                              });
                            }}
                            value={additionalControlsItems.find(item => formData[item.key as keyof FichaSeguimientoEcicepFormData])?.key || ''}
                          >
                            <option value="">Ninguno / Solo ECICEP</option>
                            {additionalControlsItems.map(item => (
                              <option key={item.key} value={item.key}>{item.label}</option>
                            ))}
                          </select>

                          {formData.incluirControlCardiovascular && (
                            <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn">
                              <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Síntomas Cardiovasculares</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                {cvSymptomsItems.map(item => (
                                  <div key={item.key} className="flex items-center gap-2 py-1">
                                    <input
                                      type="checkbox"
                                      id={item.key}
                                      name={item.key}
                                      checked={formData[item.key as keyof FichaSeguimientoEcicepFormData] as boolean}
                                      onChange={(e) => setFormData(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                      className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                                    />
                                    <label htmlFor={item.key} className="text-xs font-medium text-slate-700 cursor-pointer">
                                      {item.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {formData.incluirControlSalaEra && (
                            <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn">
                              <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Síntomas Respiratorios</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                {eraSymptomsItems.map(item => (
                                  <div key={item.key} className="flex items-center gap-2 py-1">
                                    <input
                                      type="checkbox"
                                      id={item.key}
                                      name={item.key}
                                      checked={formData[item.key as keyof FichaSeguimientoEcicepFormData] as boolean}
                                      onChange={(e) => setFormData(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                      className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                                    />
                                    <label htmlFor={item.key} className="text-xs font-medium text-slate-700 cursor-pointer">
                                      {item.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              <h4 className="text-[10px] font-black text-sky-800 uppercase mt-4 mb-3 tracking-widest border-b border-sky-100 pb-1">Desencadenantes Ambientales</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                {eraTriggersItems.map(item => (
                                  <div key={item.key} className="flex items-center gap-2 py-1">
                                    <input
                                      type="checkbox"
                                      id={item.key}
                                      name={item.key}
                                      checked={formData[item.key as keyof FichaSeguimientoEcicepFormData] as boolean}
                                      onChange={(e) => setFormData(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                      className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                                    />
                                    <label htmlFor={item.key} className="text-xs font-medium text-slate-700 cursor-pointer">
                                      {item.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                </section>`;

code = code.replace(oldIdentBlock, newIdentBlock);

fs.writeFileSync("components/FichaSeguimientoEcicep.tsx", code, "utf-8");
console.log("Seguimiento ECICEP updated");
