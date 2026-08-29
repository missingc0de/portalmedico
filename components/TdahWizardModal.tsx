import React, { useState } from 'react';

interface TdahWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'ingreso' | 'evaluacion' | 'no_farmaco' | 'farmaco' | 'derivacion' | 'alta';

export const TdahWizardModal: React.FC<TdahWizardModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('ingreso');

  if (!isOpen) return null;

  const tabs: { id: TabType; label: string; icon: string; color: string }[] = [
    { id: 'ingreso', label: '1. Ingreso y Documentos', icon: '📝', color: 'bg-blue-500 text-blue-700' },
    { id: 'evaluacion', label: '2. Evaluación y Criterios', icon: '🔍', color: 'bg-amber-500 text-amber-700' },
    { id: 'no_farmaco', label: '3. Manejo No Farmacológico', icon: '🌱', color: 'bg-emerald-500 text-emerald-700' },
    { id: 'farmaco', label: '4. Farmacoterapia', icon: '💊', color: 'bg-rose-500 text-rose-700' },
    { id: 'derivacion', label: '5. Derivación y Mapa', icon: '🗺️', color: 'bg-purple-500 text-purple-700' },
    { id: 'alta', label: '6. Seguimiento y Alta', icon: '✨', color: 'bg-teal-500 text-teal-700' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-xs transition-opacity duration-300" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <header className="flex justify-between items-center p-5 border-b border-slate-200 bg-purple-50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-pulse">🪄</span>
            <div>
              <h2 className="text-xl font-bold text-purple-900 flex items-center gap-1.5">
                Guía de Manejo Clínico TDAH en APS
              </h2>
              <p className="text-slate-500 text-xs font-medium">Asistente y flujograma de ingreso, tratamiento y derivación regional</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        {/* Tab Buttons Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 p-2 shrink-0 overflow-x-auto custom-scrollbar flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <main className="flex-grow p-6 overflow-y-auto custom-scrollbar bg-slate-50/50">
          
          {activeTab === 'ingreso' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <h3 className="text-sm font-bold text-blue-800 mb-3 border-b pb-1.5 flex items-center gap-2">
                  <span>🔵</span> INGRESO Y RECEPCIÓN DOCUMENTAL OBLIGATORIA (APS)
                </h3>
                
                <div className="space-y-3.5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vías de Ingreso</h4>
                    <p className="text-sm text-slate-700 font-medium">Demanda espontánea / Derivación APS / Establecimientos Educacionales o Servicio de Protección Especializada (SPE).</p>
                  </div>

                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>🏫</span> Requisitos documentales obligatorios desde el colegio
                    </h4>
                    <ul className="list-disc pl-5 space-y-2 text-xs text-slate-700 font-medium">
                      <li>
                        <strong className="text-slate-900">Formulario de Derivación Escolar (Anexo 1)</strong>: Debe venir debidamente completado y firmado por el establecimiento.
                      </li>
                      <li>
                        <strong className="text-slate-900">Cuestionario Conners</strong>:
                        <ul className="list-circle pl-5 mt-1 space-y-1">
                          <li>Versión para Cuidadores / Padres (Anexo 2).</li>
                          <li>Versión para Profesores / Escuela (Anexo 3).</li>
                        </ul>
                      </li>
                      <li>
                        <strong className="text-slate-900">Historial Escolar PIE</strong>: Informe psicopedagógico y evaluación psicométrica si el establecimiento educativo cuenta con equipo del Programa de Integración Escolar (PIE).
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evaluacion' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <h3 className="text-sm font-bold text-amber-800 mb-3 border-b pb-1.5 flex items-center gap-2">
                  <span>🟡</span> EVALUACIÓN Y CONFIRMACIÓN DIAGNÓSTICA CLÍNICA
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-lg">
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">Criterios DSM-5 Clave</h4>
                      <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 font-medium">
                        <li>Sintomatología presente por <strong className="text-slate-900">&gt; 6 meses</strong>.</li>
                        <li>Inicio de síntomas <strong className="text-slate-900">&lt; 12 años</strong> de edad.</li>
                        <li>Impacto funcional evidente en <strong className="text-slate-900">2 o más contextos</strong> (hogar, colegio, social).</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Evaluación Requerida</h4>
                      <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 font-medium">
                        <li>Anamnesis completa e historial de desarrollo.</li>
                        <li>Examen físico y neurológico detallado.</li>
                        <li>Descarte obligatorio de déficits auditivos y visuales.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-lg">
                    <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2">Descarte de Diagnósticos Diferenciales / Comorbilidad</h4>
                    <p className="text-xs text-slate-700 font-medium mb-1">Evaluar activamente y descartar si la sintomatología se explica por:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                      <div className="flex items-center gap-1.5">❌ Trastorno del Espectro Autista (TEA)</div>
                      <div className="flex items-center gap-1.5">❌ Trastornos de Ansiedad</div>
                      <div className="flex items-center gap-1.5">❌ Trastornos del Ánimo / Depresión</div>
                      <div className="flex items-center gap-1.5">❌ Trastorno Oposicionista Desafiante</div>
                      <div className="flex items-center gap-1.5">❌ Entorno familiar/social desorganizado</div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-center">
                    <p className="text-sm font-bold text-emerald-800">
                      ¿Cumple criterios diagnósticos de TDAH? ➡️ <span className="underline">Sí</span>: Ingreso formal a Salud Mental APS.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'no_farmaco' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <h3 className="text-sm font-bold text-emerald-800 mb-3 border-b pb-1.5 flex items-center gap-2">
                  <span>🟢</span> MANEJO NO FARMACOLÓGICO (Mínimo 3 Meses)
                </h3>
                <p className="text-xs text-slate-500 italic mb-4">Obligatorio para el 100% de los casos antes de considerar fármacos.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                    <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">👨‍👩‍👦 Apoyo Familiar</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Psicoeducación familiar y entrega de pautas estructuradas de manejo conductual. Asistencia obligatoria a talleres de cuidadores (mínimo 2 sesiones por año).
                    </p>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                    <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">📱 Control de Pantallas (Anexo 4)</h4>
                    <ul className="text-xs text-slate-600 space-y-1 font-medium">
                      <li>• <strong className="text-slate-800">Menores de 3 años:</strong> 0 horas/día.</li>
                      <li>• <strong className="text-slate-800">4 a 5 años:</strong> Menos de 1 hora al día.</li>
                      <li>• <strong className="text-slate-800">6 a 12 años:</strong> Menos de 2 horas al día.</li>
                      <li className="text-rose-600 font-bold">• NUNCA usar pantallas en las 2 horas previas a dormir.</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                    <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">🏫 Intervención Escolar</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Coordinación directa del profesional de salud con los profesores jefes del menor. Asegurar aplicación de adecuaciones de aula de acuerdo con el Manual de TDAH del MINEDUC.
                    </p>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                    <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">👥 Individual / Grupal</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Entrenamiento guiado de habilidades sociales, resolución de conflictos y fomento estructurado de actividades deportivas, recreativas o artísticas extraprogramáticas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'farmaco' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <h3 className="text-sm font-bold text-rose-800 mb-3 border-b pb-1.5 flex items-center gap-2">
                  <span>🔴</span> FARMACOTERAPIA EN APS (≥ 6 AÑOS)
                </h3>
                <p className="text-xs text-slate-500 italic mb-4">Considerar si persiste la sintomatología moderada a severa tras al menos 3 meses de manejo no farmacológico.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2">
                    <h4 className="font-bold text-rose-900 text-xs uppercase">💊 Fármaco: METILFENIDATO</h4>
                    <ul className="text-xs text-slate-700 space-y-1 font-medium">
                      <li>
                        • <strong className="text-slate-900">Dosis de Inicio:</strong> 0,3 mg/kg/día.
                      </li>
                      <li>
                        • <strong className="text-slate-900">Ajuste:</strong> Incrementar de forma paulatina y progresiva según respuesta y tolerancia.
                      </li>
                      <li>
                        • <strong className="text-slate-900">Dosis Máxima:</strong> 1 mg/kg/día o tope absoluto de <span className="text-red-700 font-bold">60 mg/día</span>.
                      </li>
                      <li className="text-red-700 font-bold">
                        • Horario: Administrar dosis siempre inmediatamente post-comidas (desayuno/almuerzo). NUNCA administrar posterior a las 16:00 hrs.
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs uppercase mb-1">💧 Hábitos Obligatorios</h4>
                      <p className="text-xs text-slate-600 font-medium">Fomentar la ingesta regular de agua para mantener una hidratación de <strong className="text-slate-800">&gt; 1 Litro al día</strong>.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 text-xs uppercase mb-1.5">📊 Controles y Monitoreo</h4>
                      <ul className="text-xs text-slate-600 space-y-1 font-medium">
                        <li>• <strong className="text-slate-800">Peso y Talla:</strong> Cada 3 meses en menores de 10 años; cada 6 meses en mayores de 10 años.</li>
                        <li>• <strong className="text-slate-800">Signos Vitales:</strong> Medición de Presión Arterial y Frecuencia Cardíaca cada 6 meses.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'derivacion' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <h3 className="text-sm font-bold text-purple-800 mb-3 border-b pb-1.5 flex items-center gap-2">
                  <span>🟣</span> CRITERIOS DE DERIVACIÓN Y MAPA DE REFERENCIA REGIONAL
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-lg">
                    <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">Criterios de Derivación</h4>
                    <ul className="list-disc pl-5 space-y-2 text-xs text-slate-700 font-medium">
                      <li>
                        <strong className="text-slate-900">Neurología Infantil:</strong> Tratamiento instaurado en APS sin respuesta favorable tras observación y monitoreo continuo de al menos 6 meses.
                      </li>
                      <li>
                        <strong className="text-slate-900">Psiquiatría Infantil:</strong> TDAH con alta sospecha o confirmación de comorbilidad psiquiátrica severa.
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Documentación para Interconsulta (IC)</h4>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 font-medium">
                      <li>IC manual o digital completamente rellenada con hipótesis clara.</li>
                      <li>Informe escolar actualizado (conducta, social y rendimiento).</li>
                      <li>Informe psicopedagógico (en caso de PIE).</li>
                    </ul>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Mapa Regional de Derivación (Servicio de Salud Coquimbo)</h4>
                  <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="p-2.5 text-left">Provincia</th>
                        <th className="p-2.5 text-left">Comuna / Establecimiento de Origen</th>
                        <th className="p-2.5 text-left">Destino de Derivación (Neurología)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-600 font-medium">
                      <tr className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-800">Elqui</td>
                        <td className="p-2.5">Vicuña, Paihuano, La Higuera, La Serena</td>
                        <td className="p-2.5 font-semibold text-purple-700">Hospital de La Serena</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-800">Elqui / Choapa</td>
                        <td className="p-2.5">Coquimbo, Andacollo, Los Vilos, Canela, Salamanca, Illapel</td>
                        <td className="p-2.5 font-semibold text-purple-700">Hospital de Coquimbo</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-800">Limarí</td>
                        <td className="p-2.5">Ovalle (APS), Monte Patria, Río Hurtado, Punitaqui, Combarbalá</td>
                        <td className="p-2.5 font-semibold text-purple-700">Hospital Provincial de Ovalle</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alta' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <h3 className="text-sm font-bold text-teal-800 mb-3 border-b pb-1.5 flex items-center gap-2">
                  <span>🟢</span> CONTRARREFERENCIA, SEGUIMIENTO Y CRITERIOS DE ALTA
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-lg">
                      <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">Contrarreferencia y Fármacos</h4>
                      <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700 font-medium">
                        <li>Retorno desde especialidad documentado mediante el <strong className="text-slate-900">Anexo 5</strong>.</li>
                        <li>Fármacos fuera del arsenal común APS son garantizados y entregados por el hospital correspondiente vía <strong className="text-slate-900">Programa MAPA</strong>.</li>
                        <li>El tratamiento farmacológico se mantiene en APS idealmente <strong className="text-slate-900">hasta el término de la etapa escolar</strong> (4° Medio).</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">📅 Seguimiento APS</h4>
                        <p className="text-xs text-slate-600 font-medium">Se deben realizar un mínimo de <strong className="text-slate-800">2 controles médicos al año</strong>, idealmente coincidiendo con el inicio de año escolar y el inicio del segundo semestre académico.</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">🎓 Criterios de Alta</h4>
                        <p className="text-xs text-slate-600 font-medium">Si el paciente mantiene un óptimo funcionamiento escolar y social por <strong className="text-slate-800">6 a 12 meses</strong> con dosis subterapéutica: se debe probar suspensión programada del fármaco y evaluar el alta.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="p-4 border-t border-slate-200 bg-white rounded-b-2xl flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-colors text-xs">
            ENTENDIDO
          </button>
        </footer>
      </div>
    </div>
  );
};
