import React, { useState, useEffect } from 'react';

interface SectionItem {
  id: string;
  label: string;
  subIds?: string[];
}

const SECTIONS: SectionItem[] = [
  // Ingreso ECICEP
  { id: 'sec-identificacion', label: 'Identificación' },
  { id: 'sec-antecedentes', label: 'Antecedentes generales' },
  { id: 'sec-atenciones', label: 'Atenciones vigentes' },
  { id: 'sec-gineco', label: 'Antecedentes ginecológicos' },
  { id: 'sec-habitos', label: 'Hábitos y alimentación', subIds: ['sec-alimentacion'] },
  { id: 'sec-animo', label: 'Estado anímico y sueño' },
  { id: 'sec-dimension-social', label: 'Dimensión social, familiar y comunitaria' },
  { id: 'sec-estudios', label: 'Exámenes y exploración física', subIds: ['sec-examen-fisico'] },
  { id: 'sec-valoracion', label: 'Valoración integral' },
  { id: 'sec-pci', label: 'Plan de cuidado integral' },
  { id: 'sec-proximo-control', label: 'Próximo control e indicaciones', subIds: ['sec-indicaciones'] },

  // Control ECICEP
  { id: 'sec-evaluacion-ultimo-control', label: 'Evaluación desde último control' },
  { id: 'sec-plan-metas-anteriores', label: 'Plan y metas anteriores' },
  { id: 'sec-atenciones-vigentes', label: 'Atenciones vigentes' },
  { id: 'sec-estudios-control', label: 'Exámenes y exploración física', subIds: ['sec-examen-fisico-control'] },
  { id: 'sec-valoracion-control', label: 'Valoración integral' },
  { id: 'sec-plan-cuidado-control', label: 'Plan de cuidado integral' },
  { id: 'sec-proximo-control-control', label: 'Próximo control e indicaciones', subIds: ['sec-indicaciones-control'] },

  // Preingreso ECICEP
  { id: 'sec-identificacion-pre', label: 'Identificación' },
  { id: 'sec-antecedentes-pre', label: 'Antecedentes generales' },
  { id: 'sec-atenciones-pre', label: 'Atenciones vigentes' },
  { id: 'sec-gineco-pre', label: 'Antecedentes ginecológicos' },
  { id: 'sec-habitos-pre', label: 'Hábitos y alimentación' },
  { id: 'sec-animo-pre', label: 'Ánimo' },
  { id: 'sec-dimension-social-pre', label: 'Dimensión social, familiar y comunitaria' },
  { id: 'sec-contacto-pre', label: 'Datos de contacto' },
  { id: 'sec-examenes-pre', label: 'Exámenes, EKG e Imágenes' },
  { id: 'sec-valoracion-pre', label: 'Valoración integral' },
  { id: 'sec-gestion-pre', label: 'Gestión de ingreso' },
  { id: 'sec-indicaciones-pre', label: 'Indicaciones' },

  // Sala ERA
  { id: 'sec-anamnesis-era', label: 'Antecedentes Generales' },
  { id: 'sec-habitos-era', label: 'Factores de riesgo' },
  { id: 'sec-historia-era', label: 'Sintomatología' },
  { id: 'sec-disnea-era', label: 'Escala de disnea mMRC' },
  { id: 'sec-examenes-era', label: 'Exámenes y exploración física' },
  { id: 'sec-plan-era', label: 'Próximo control e indicaciones' },

  // Salud Mental
  { id: 'sec-identificacion-sm', label: 'Identificación del paciente' },
  { id: 'sec-antecedentes-sm', label: 'Antecedentes' },
  { id: 'sec-anamnesis-sm', label: 'Anamnesis e historia' },
  { id: 'sec-contexto-sm', label: 'Contexto' },
  { id: 'sec-sintomatologia-sm', label: 'Sintomatología actual' },
  { id: 'sec-mental-sm', label: 'Examen mental' },
  { id: 'sec-habitos-sm', label: 'Hábitos' },
  { id: 'sec-plan-sm', label: 'Próximo control e indicaciones' }
];

export const LeftIndex: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [visibleSections, setVisibleSections] = useState<SectionItem[]>([]);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let knownIds = new Set<string>();

    const setupObserver = () => {
      const existing = SECTIONS.filter(sec => {
        const mainEl = document.getElementById(sec.id);
        const subElsExist = sec.subIds?.some(subId => document.getElementById(subId));
        return !!(mainEl || subElsExist);
      });
      const currentIds = new Set(existing.map(s => s.id));
      
      // Si son las mismas secciones, no re-observamos
      let isSame = false;
      if (knownIds.size === currentIds.size) {
        isSame = Array.from(knownIds).every(id => currentIds.has(id));
      }
      
      if (isSame) return;
      
      knownIds = currentIds;
      setVisibleSections(existing);

      if (observer) observer.disconnect();
      
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const targetId = entry.target.id;
              const parentSec = SECTIONS.find(s => s.id === targetId || s.subIds?.includes(targetId));
              if (parentSec) {
                setActiveSection(parentSec.id);
              }
            }
          });
        },
        { rootMargin: '-100px 0px -70% 0px' }
      );

      existing.forEach(sec => {
        const el = document.getElementById(sec.id);
        if (el) observer?.observe(el);
        if (sec.subIds) {
          sec.subIds.forEach(subId => {
            const subEl = document.getElementById(subId);
            if (subEl) observer?.observe(subEl);
          });
        }
      });
    };

    setupObserver();
    const interval = setInterval(setupObserver, 1000);

    return () => {
      clearInterval(interval);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex flex-col gap-2 mt-2 animate-fadeIn">
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150 pb-1.5 mb-1 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
        Índice de Secciones
      </h3>
      <div className="flex flex-col gap-0.5 overflow-hidden">
        {visibleSections.map(item => (
          <button
            key={item.id}
            onClick={() => {
              const el = document.getElementById(item.id);
              if (el) {
                const scrollContainer = document.getElementById('ecicep-center-column');
                if (scrollContainer) {
                  const containerRect = scrollContainer.getBoundingClientRect();
                  const elementRect = el.getBoundingClientRect();
                  const relativeTop = elementRect.top - containerRect.top + scrollContainer.scrollTop;
                  const offsetPosition = relativeTop - 10;
                  scrollContainer.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                } else {
                  const offset = 80;
                  const elementPosition = el.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - offset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
                setActiveSection(item.id);
              }
            }}
            className={`text-left text-[11px] leading-snug font-semibold py-1.5 px-2 rounded-md transition-colors border flex items-center justify-between group ${
              activeSection === item.id 
                ? 'bg-sky-100 text-sky-800 border-sky-200 shadow-sm' 
                : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-sky-700'
            }`}
          >
            <span className="truncate">{item.label}</span>
            <svg className={`w-3 h-3 transition-opacity shrink-0 ${activeSection === item.id ? 'text-sky-500 opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        ))}
      </div>
    </div>
  );
};
