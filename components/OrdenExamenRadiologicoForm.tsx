import React, { useState, useCallback, useEffect } from 'react';
import { OrdenExamenRadiologicoFormData, FormStatus, User } from '../types'; // Import User
import FormField from './FormField';
import { generateOrdenExamenRadiologicoPdf } from '../services/pdfGenerator';
import ResolutividadModal from './ResolutividadModal'; // Import the new modal
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData: OrdenExamenRadiologicoFormData = {
  nombrePaciente: '',
  edadPaciente: '',
  numeroFichaClinica: '',
  nombreMedicoSolicitante: '', 
  examenSolicitado: '',
  diagnosticoSintomas: '',
};

const resolutividadContentMain: string[] = [
  "En relación a lo conversado sobre los tipos de radiografías que se pueden enviar a SAR de Tierras Blancas, envío listado con los tipos y proyecciones. Destacar que en las órdenes se debe registrar las proyecciones del tipo de radiografía que solicita.",
  "- Radiografía de partes blandas, laringe lateral, cavum rinofaríngeo (rinofaringe).",
  "- Radiografía de tórax frontal y lateral.",
  "- Radiografía de Abdomen Simple.",
  "- Radiografía de abdomen simple, proyección complementaria (lateral y/o oblicua).",
  "- Radiografía de cavidades perinasales.",
  "- Radiografía de cavidades perinasales + órbitas.",
  "- Radiografía de articulaciones temporomandibulares.",
  "- Radiografía de huesos propios de la nariz.",
  "- Radiografía de malar, maxilar, arco cigomático o cara.",
  "- Radiografía de cráneo frontal y lateral + proyecciones especiales.",
  "- Radiografía de columna cervical o atlas-axis y/o oblicuas.",
  "- Radiografía de columna cervical de flexión y extensión (Dinámicas).",
  "- Radiografía parrilla costal adultos individual o bilateral (ambas parrillas costales).",
  "- Radiografía de columna dorsal o dorsolumbar localizada, parrilla costal adultos (frontal y lateral).",
  "- Columna lumbar o lumbosacra (frontal-lateral).",
  "- Radiografía columna lumbar o lumbosacra flexión y extensión (Dinámicas).",
  "- Radiografía columna lumbar o lumbosacra, oblicuas adicionales.",
  "- Radiografía de pelvis y/o Lowestein.",
  "- Radiografía de cadera individual o bilateral, con o sin proyecciones especiales.",
  "- Radiografía de Sacrocoxis o articulaciones sacroilíacas.",
  "- Radiografía de brazo o húmero individual o bilateral (derecho e izquierdo).",
  "- Radiografía de muñeca individual o bilateral (derecha e izquierda).",
  "- Radiografía de antebrazo (radio y cubito) individual o bilateral (derecha e izquierda).",
  "- Radiografía de codo individual o bilateral (derecha e izquierda).",
  "- Radiografía de mano o bilateral (derecha e izquierda).",
  "- Radiografía de dedos (uno o más).",
  "- Radiografía de pie individual o bilateral (derecho e izquierdo), con o sin carga.",
  "- Radiografía de tobillo individual o bilateral (derecho e izquierdo), con o sin carga.",
  "- Radiografía de clavícula.",
  "- Radiografía Edad Ósea: carpo y mano.",
  "- Radiografía Edad ósea: rodilla frontal.",
  "- Estudio radiológico de escafoides.",
  "- Radiografía de hombro individual o bilateral (ambos hombros).",
  "- Radiografía de fémur o muslo.",
  "- Radiografía de fémur o muslo bilateral (ambos fémures).",
  "- Radiografía de pierna o tibia.",
  "- Radiografía de pierna o tibia bilateral (ambas piernas).",
  "- Radiografía de Tórax óseo.",
  "- Radiografía de esternón.",
  "- Radiografía de rodilla proyecciones especiales (rosenberg).",
  "- Radiografía de rodilla individual o bilateral (ambas rodillas).",
  "- Radiografía, axial de ambas rótulas o solo una rótula.",
  "- Radiografía de túnel intercondíleo o radio-carpiano."
];

const resolutividadNotPerformedTitle: string = "Los únicos tipos de radiografías que no se realizan son las siguientes:";
const resolutividadNotPerformed: string[] = [
  "- COLUMNA RX TOTAL (COMPLETA)",
  "- RX TREN INFERIOR (MIEMBRO INFERIOR)"
];


interface OrdenExamenRadiologicoFormProps {
  onBackToMenu: () => void;
  loggedInUser: User | null; // Add loggedInUser prop
}

const OrdenExamenRadiologicoForm: React.FC<OrdenExamenRadiologicoFormProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<OrdenExamenRadiologicoFormData>('local_OrdenExamenRadiologicoForm', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isResolutividadModalOpen, setIsResolutividadModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (loggedInUser) {
      setFormData(prev => ({
        ...prev,
        nombreMedicoSolicitante: loggedInUser.fullName,
      }));
    }
  }, [loggedInUser]);

  useEffect(() => {
    const { nombrePaciente, edadPaciente, examenSolicitado, diagnosticoSintomas, numeroFichaClinica } = formData;
    // nombreMedicoSolicitante is now auto-filled if loggedInUser exists.
    // Its presence for form validity depends on loggedInUser.
    const medicoSolicitanteValid = loggedInUser ? formData.nombreMedicoSolicitante.trim() !== '' : false;

    setIsFormValid(
      nombrePaciente.trim() !== '' &&
      edadPaciente.trim() !== '' &&
      examenSolicitado.trim() !== '' &&
      diagnosticoSintomas.trim() !== '' &&
      numeroFichaClinica.trim() !== '' &&
      medicoSolicitanteValid // Check if auto-filled field is populated
    );
  }, [formData, loggedInUser]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async () => {
    if (!isFormValid) {
      alert("Por favor, complete todos los campos requeridos.");
      return;
    }
    if (!loggedInUser) {
      alert("Error: No se ha podido identificar al médico solicitante. Por favor, inicie sesión nuevamente.");
      return;
    }
    setStatus(FormStatus.Generating);
    try {
      const currentDate = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      
      await generateOrdenExamenRadiologicoPdf(formData, currentDate, loggedInUser);
      setStatus(FormStatus.Idle);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setStatus(FormStatus.Error);
      alert("Error al generar el PDF. Verifique la consola para más detalles.");
    }
  };

  const handleNewDocument = () => {
     // Reset form, but keep auto-filled doctor info if user is still logged in
    setFormData(prev => ({
        ...initialFormData,
        nombreMedicoSolicitante: loggedInUser?.fullName || '',
    }));
    setStatus(FormStatus.Idle);
  };

  return (
    <>
      <div className="w-full bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-10 relative"> {/* Added relative for FAB positioning context if needed, though FAB is fixed */}
        <header className="mb-8 text-center">
          <h2 className="text-3xl font-semibold text-slate-700">Orden de Estudios de Imágenes</h2>
          <p className="text-slate-500 mt-2">Complete los datos para generar la orden.</p>
        </header>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          <section className="p-6 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-xl font-semibold mb-6 text-sky-700 border-b border-sky-200 pb-2">Datos del Paciente y Examen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Nombre Completo del Paciente" id="nombrePaciente" name="nombrePaciente" value={formData.nombrePaciente} onChange={handleChange} placeholder="Ej: Juan Pérez González" required />
              <FormField label="Edad del Paciente" id="edadPaciente" name="edadPaciente" value={formData.edadPaciente} onChange={handleChange} placeholder="Ej: 30 años" required />
            </div>
            <div className="mt-6">
              <FormField label="N° Ficha Clínica" id="numeroFichaClinica" name="numeroFichaClinica" value={formData.numeroFichaClinica} onChange={handleChange} placeholder="Ej: 1234567" required />
            </div>
            
            <div className="mt-6">
              <FormField label="Examen Solicitado" id="examenSolicitado" name="examenSolicitado" value={formData.examenSolicitado} onChange={handleChange} placeholder="Ej: Radiografía de Tórax AP y Lateral" required />
            </div>
            <div className="mt-6">
              <FormField label="Diagnóstico y Síntomas Principales" id="diagnosticoSintomas" name="diagnosticoSintomas" value={formData.diagnosticoSintomas} onChange={handleChange} placeholder="Ej: Sospecha de neumonía, tos persistente." required isTextArea />
            </div>
          </section>

          <section className="p-6 bg-slate-100 rounded-lg border border-slate-300">
            <h3 className="text-xl font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">Médico Emisor (Para PDF)</h3>
            {loggedInUser ? (
              <div className="space-y-2 text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {loggedInUser.electronicSignature || `${loggedInUser.fullName}\nMédico Cirujano`}
              </div>
            ) : (
              <p className="text-red-500">Error: No se pudo cargar la información del médico solicitante.</p>
            )}
          </section>


          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-300">
            <button
              type="button"
              onClick={onBackToMenu}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400"
              aria-label="Volver al menú principal"
            >
              Volver al Menú
            </button>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleNewDocument}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400"
                aria-label="Emitir un nuevo documento y limpiar formulario"
              >
                Limpiar Formulario
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === FormStatus.Generating || !isFormValid}
                className={`w-full sm:w-auto px-6 py-2.5 font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400
                  ${isFormValid ? 'bg-sky-600 hover:bg-sky-700 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}
                  ${status === FormStatus.Generating ? 'opacity-70 cursor-wait' : ''}`}
                aria-label="Emitir orden en formato PDF"
              >
                {status === FormStatus.Generating ? 'Generando PDF...' : 'Emitir Orden'}
              </button>
            </div>
          </div>
          {status === FormStatus.Error && (
            <p role="alert" className="text-red-500 text-center mt-4">Hubo un error al generar el PDF. Por favor, intente de nuevo.</p>
          )}
        </form>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsResolutividadModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-5 rounded-full shadow-lg flex items-center transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
          aria-label="Mostrar información de RX Resolutividad"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          RX RESOLUTIVIDAD
        </button>
      </div>

      <ResolutividadModal
        isOpen={isResolutividadModalOpen}
        onClose={() => setIsResolutividadModalOpen(false)}
        title="RESOLUTIVIDAD RX (SAR Tierras Blancas)"
        content={resolutividadContentMain}
        notPerformedTitle={resolutividadNotPerformedTitle}
        notPerformedContent={resolutividadNotPerformed}
      />
    </>
  );
};

export default OrdenExamenRadiologicoForm;
