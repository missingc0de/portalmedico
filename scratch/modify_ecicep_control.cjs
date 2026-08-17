const fs = require("fs");

let code = fs.readFileSync("components/FichaControlEcicepNuevo.tsx", "utf-8");

// 1. Add state variable isAdditionalControlsOpen next to isBorgModalOpen
code = code.replace(
  "  const [isBorgModalOpen, setIsBorgModalOpen] = useState(false);",
  "  const [isBorgModalOpen, setIsBorgModalOpen] = useState(false);\n  const [isAdditionalControlsOpen, setIsAdditionalControlsOpen] = useState(false);"
);

// 2. Define arrays before render
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
  "  const cicloVitalFamiliarOptions = [",
  arraysDef + "\n\n  const cicloVitalFamiliarOptions = ["
);

// 3. Replace sec-identificacion
const oldSecIdentificacion = `                  <section id="sec-identificacion" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
              <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Identificación</h3>

              <div className="mt-0">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Dupla profesional:</label>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center flex-grow">
                    <span className="mr-2 text-slate-700 whitespace-nowrap text-sm font-bold">Médico +</span>
                    <div className="flex-grow">
                      <UserAutocomplete
                        value={formData.duplaProfesionalOtroNombre || ''}
                        onSelect={handleSelectDuplaUser}
                        onChange={(val: any) => handleInputChange('duplaProfesionalOtroNombre', val)}
                        onClear={handleClearDuplaUser}
                        placeholder="Buscar o escribir nombre del profesional..."
                        disabled={formData.sinDupla}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-end gap-3 mt-1 animate-fadeIn">
                    <div className={\`flex-grow transition-opacity duration-300 \${formData.sinDupla ? 'opacity-50 pointer-events-none' : 'opacity-100'}\`}>
                      <label htmlFor="duplaProfesional" className="block text-sm font-medium text-slate-700 mb-1">Profesión de la dupla</label>
                      <select
                        id="duplaProfesional"
                        name="duplaProfesional"
                        value={formData.duplaProfesional || ''}
                        onChange={handleChange as any}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-800 font-sans text-sm font-normal h-[42px]"
                      >
                        <option value="">Seleccione profesión...</option>
                        {duplaProfesionalOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center flex-shrink-0">
                      <label className={\`flex items-center justify-center gap-2 cursor-pointer border px-3 rounded-lg shadow-sm transition-colors h-[42px] \${formData.sinDupla ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}\`}>
                        <input
                          type="checkbox"
                          name="sinDupla"
                          checked={formData.sinDupla}
                          onChange={handleChange as any}
                          className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                        />
                        <span className="text-[10px] font-black uppercase whitespace-nowrap tracking-tighter">Sin dupla</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-4 mt-4">
                <div className="flex-grow">
                  {renderRadioGroup("Estratificación", "estratificacion", [{ value: "G1", label: "G1" }, { value: "G2", label: "G2" }, { value: "G3", label: "G3" }])}
                </div>
                <button
                  type="button"
                  onClick={() => setIsRiskCalculatorOpen(true)}
                  className="mb-4 flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-lg shadow hover:bg-sky-700 transition-all h-[42px]"
                >
                  <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                    <path d="M12 4L4 20H20L12 4Z" />
                  </svg>
                  CALCULAR
                </button>
              </div>
            </section>`;

const newSecIdentificacion = `                  <section id="sec-identificacion" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Identificación</h3>

                    <div className="flex items-end gap-2.5 mt-2 flex-wrap">
                      <div className="flex-grow">
                        {renderRadioGroup("Estratificación", "estratificacion", [{ value: "G1", label: "G1" }, { value: "G2", label: "G2" }, { value: "G3", label: "G3" }])}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsRiskCalculatorOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow transition-all h-[38px] cursor-pointer whitespace-nowrap"
                      >
                        <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                          <path d="M12 4L4 20H20L12 4Z" />
                        </svg>
                        <span>CALCULAR</span>
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
                            value={additionalControlsItems.find(item => formData[item.key as keyof FichaControlEcicepFormData])?.key || ''}
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
                                      checked={formData[item.key as keyof FichaControlEcicepFormData] as boolean}
                                      onChange={(e) => handleInputChange(item.key as any, e.target.checked)}
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
                                      checked={formData[item.key as keyof FichaControlEcicepFormData] as boolean}
                                      onChange={(e) => handleInputChange(item.key as any, e.target.checked)}
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
                                      checked={formData[item.key as keyof FichaControlEcicepFormData] as boolean}
                                      onChange={(e) => handleInputChange(item.key as any, e.target.checked)}
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

code = code.replace(oldSecIdentificacion, newSecIdentificacion);

fs.writeFileSync("components/FichaControlEcicepNuevo.tsx", code, "utf-8");
console.log("Control ECICEP Identificación updated");
