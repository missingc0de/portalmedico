import React from 'react';
import { PAUTAS_ALIMENTARIAS, getPautaById, PautaAlimentariaInfo } from '../data/pautasAlimentariasData';
import { Utensils, CheckCircle2, AlertCircle, RotateCcw, Trash2, FileText } from 'lucide-react';

export interface PautaAlimentariaData {
  id: string;
  nombre: string;
  favorecer: string;
  evitar: string;
  recomendaciones: string;
}

interface PautaAlimentariaSelectorProps {
  pautaId?: string;
  pautaNombre?: string;
  pautaFavorecer?: string;
  pautaEvitar?: string;
  pautaRecomendaciones?: string;
  onChange: (data: PautaAlimentariaData) => void;
}

const PautaAlimentariaSelector: React.FC<PautaAlimentariaSelectorProps> = ({
  pautaId = '',
  pautaNombre = '',
  pautaFavorecer = '',
  pautaEvitar = '',
  pautaRecomendaciones = '',
  onChange
}) => {
  const handleSelectDiet = (selectedId: string) => {
    if (!selectedId) {
      onChange({
        id: '',
        nombre: '',
        favorecer: '',
        evitar: '',
        recomendaciones: ''
      });
      return;
    }

    if (selectedId === 'personalizada') {
      onChange({
        id: 'personalizada',
        nombre: 'Pauta Alimentaria Personalizada',
        favorecer: pautaFavorecer || '• ',
        evitar: pautaEvitar || '• ',
        recomendaciones: pautaRecomendaciones || '• '
      });
      return;
    }

    const preset = getPautaById(selectedId);
    if (preset) {
      onChange({
        id: preset.id,
        nombre: preset.nombre,
        favorecer: preset.alimentosFavorecer.map(f => `• ${f}`).join('\n'),
        evitar: preset.alimentosEvitar.map(e => `• ${e}`).join('\n'),
        recomendaciones: preset.recomendacionesGenerales.map(r => `• ${r}`).join('\n')
      });
    }
  };

  const handleResetToPreset = () => {
    if (!pautaId || pautaId === 'personalizada') return;
    const preset = getPautaById(pautaId);
    if (preset && window.confirm('¿Restablecer el texto de la pauta a las recomendaciones clínicas sugeridas?')) {
      onChange({
        id: preset.id,
        nombre: preset.nombre,
        favorecer: preset.alimentosFavorecer.map(f => `• ${f}`).join('\n'),
        evitar: preset.alimentosEvitar.map(e => `• ${e}`).join('\n'),
        recomendaciones: preset.recomendacionesGenerales.map(r => `• ${r}`).join('\n')
      });
    }
  };

  const handleClear = () => {
    if (window.confirm('¿Quitar la pauta alimentaria? (No se generará página adicional en el Resumen ECICEP)')) {
      onChange({
        id: '',
        nombre: '',
        favorecer: '',
        evitar: '',
        recomendaciones: ''
      });
    }
  };

  const hasActiveDiet = Boolean(pautaId || pautaFavorecer.trim() || pautaEvitar.trim());

  return (
    <div className="mt-3 bg-white rounded-xl border border-sky-200/80 shadow-xs overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-gradient-to-r from-sky-50 via-slate-50 to-emerald-50/40 border-b border-sky-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-600 text-white rounded-lg shadow-2xs">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Agregar pauta alimentaria
              {hasActiveDiet ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Página 2 activa en PDF
                </span>
              ) : (
                <span className="text-[11px] font-normal text-slate-500">
                  (Opcional - solo si se define genera página 2 en Resumen ECICEP)
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500">
              Menú desplegable con pautas clínicas generales para favorecer o evitar alimentos.
            </p>
          </div>
        </div>
      </div>

      {/* Main Body - Siempre desplegado por defecto */}
      <div className="p-4 space-y-4 bg-slate-50/50">
        {/* Select Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label htmlFor="select-pauta-alimentaria" className="text-xs font-semibold text-slate-700 shrink-0">
            Seleccionar pauta:
          </label>
          <div className="flex-1 relative">
            <select
              id="select-pauta-alimentaria"
              value={pautaId}
              onChange={(e) => handleSelectDiet(e.target.value)}
              className="w-full h-[38px] px-3 pr-8 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none shadow-2xs cursor-pointer"
            >
              <option value="">-- Sin pauta alimentaria (no se generará página adicional) --</option>
              <optgroup label="Dietas específicas para patologías">
                <option value="erc">Enfermedad renal crónica (ERC - Control Potasio, Fósforo y Sodio)</option>
                <option value="alergia_urticaria">Alergia (urticaria reciente, baja en histamina / alérgenos)</option>
                <option value="colelitiasis">Colelitiasis (Colecistopatía / Baja en grasas)</option>
                <option value="aplv">Alergia a proteína de leche de vaca (APLV - Exclusión estricta)</option>
                <option value="celiaquia">Celiaquía (Libre de gluten / Sin TACC)</option>
              </optgroup>
              <optgroup label="Otras dietas clínicas relevantes">
                <option value="diabetes">Diabetes Mellitus / Resistencia a la insulina (Bajo índice glicémico)</option>
                <option value="hipertension">Hipertensión arterial (Dieta hiposódica / DASH)</option>
                <option value="dislipidemia">Dislipidemia (Cardioprotectora / Colesterol y Triglicéridos)</option>
                <option value="gota_hiperuricemia">Hiperuricemia y gota (Baja en purinas)</option>
                <option value="erge_gastritis">Reflujo gastroesofágico y gastritis (No irritante)</option>
                <option value="constipacion">Constipación crónica y tránsito lento (Rica en fibra)</option>
                <option value="higado_graso">Esteatosis hepática (Hígado graso no alcohólico)</option>
                <option value="personalizada">Pauta personalizada (Edición libre)</option>
              </optgroup>
            </select>
          </div>

          {hasActiveDiet && (
            <div className="flex items-center gap-2 shrink-0">
              {pautaId && pautaId !== 'personalizada' && (
                <button
                  type="button"
                  onClick={handleResetToPreset}
                  title="Restablecer textos a la sugerencia clínica por defecto"
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Restablecer</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                title="Quitar pauta y omitir página 2"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Quitar</span>
              </button>
            </div>
          )}
        </div>

        {/* If diet is active, show the 2 columns & recommendations editable boxes */}
        {hasActiveDiet ? (
          <div className="space-y-3 pt-2 border-t border-slate-200">
            {/* Info banner */}
            <div className="flex items-center gap-2 p-2.5 bg-sky-50/70 border border-sky-200 rounded-lg text-xs text-sky-800">
              <FileText className="w-4 h-4 text-sky-600 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold">Pauta activa:</span> {pautaNombre || 'Pauta general'}.{' '}
                <span className="text-slate-600">
                  Al generar el PDF del Resumen ECICEP, se creará automáticamente la <strong>Página 2</strong> con el formato institucional para entregar al paciente. Puede ajustar las viñetas según el criterio individual.
                </span>
              </div>
            </div>

            {/* Título editable de la pauta */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título de la pauta en el informe:
              </label>
              <input
                type="text"
                value={pautaNombre}
                onChange={(e) => onChange({
                  id: pautaId || 'personalizada',
                  nombre: e.target.value,
                  favorecer: pautaFavorecer,
                  evitar: pautaEvitar,
                  recomendaciones: pautaRecomendaciones
                })}
                className="w-full px-3 h-[34px] bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="Ej: Dieta para Enfermedad Renal Crónica"
              />
            </div>

            {/* Grid 2 Columnas: Favorecer vs Evitar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Columna Favorecer */}
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    Alimentos a favorecer (Recomendados)
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">Una viñeta por línea (•)</span>
                </div>
                <textarea
                  rows={6}
                  value={pautaFavorecer}
                  onChange={(e) => onChange({
                    id: pautaId || 'personalizada',
                    nombre: pautaNombre,
                    favorecer: e.target.value,
                    evitar: pautaEvitar,
                    recomendaciones: pautaRecomendaciones
                  })}
                  placeholder="• Ingrese los alimentos recomendados..."
                  className="w-full p-2.5 bg-white border border-emerald-300/80 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-sans leading-relaxed resize-y"
                />
              </div>

              {/* Columna Evitar */}
              <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-200 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                    Alimentos a evitar (Desaconsejados / Prohibidos)
                  </span>
                  <span className="text-[10px] text-rose-600 font-medium">Una viñeta por línea (•)</span>
                </div>
                <textarea
                  rows={6}
                  value={pautaEvitar}
                  onChange={(e) => onChange({
                    id: pautaId || 'personalizada',
                    nombre: pautaNombre,
                    favorecer: pautaFavorecer,
                    evitar: e.target.value,
                    recomendaciones: pautaRecomendaciones
                  })}
                  placeholder="• Ingrese los alimentos a evitar..."
                  className="w-full p-2.5 bg-white border border-rose-300/80 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none font-sans leading-relaxed resize-y"
                />
              </div>
            </div>

            {/* Recomendaciones Generales */}
            <div className="bg-sky-50/40 p-3 rounded-lg border border-sky-200 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500 inline-block"></span>
                  Recomendaciones generales y consejos prácticos para el paciente
                </span>
                <span className="text-[10px] text-sky-600 font-medium">Técnicas culinarias, hidratación, signos de alerta</span>
              </div>
              <textarea
                rows={3}
                value={pautaRecomendaciones}
                onChange={(e) => onChange({
                  id: pautaId || 'personalizada',
                  nombre: pautaNombre,
                  favorecer: pautaFavorecer,
                  evitar: pautaEvitar,
                  recomendaciones: e.target.value
                })}
                placeholder="• Consejos generales (ej: hidratación, técnica de cocción, etc.)..."
                className="w-full p-2.5 bg-white border border-sky-300/80 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none font-sans leading-relaxed resize-y"
              />
            </div>
          </div>
        ) : (
          <div className="p-3 bg-white border border-dashed border-slate-300 rounded-lg text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              Ninguna pauta alimentaria seleccionada. El resumen ECICEP se imprimirá en <strong>1 sola página</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PautaAlimentariaSelector;

