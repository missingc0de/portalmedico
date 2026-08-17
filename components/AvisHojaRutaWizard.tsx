import React, { useState, useEffect } from 'react';

// The new list of images for the slider.
const wizardImages = [
    "https://i.ibb.co/fzmc81Ht/1.png",
    "https://i.ibb.co/DgpCKcjr/2.png",
    "https://i.ibb.co/4hqKCGT/3.png",
    "https://i.ibb.co/s9S2Zfb6/4.png",
    "https://i.ibb.co/b5bs7Ypf/5.png",
    "https://i.ibb.co/d0xDm5Pf/6.png",
    "https://i.ibb.co/MyrqdJN2/7.png",
    "https://i.ibb.co/MxJmPJmJ/8.png",
    "https://i.ibb.co/NgnFrCyW/9.png",
    "https://i.ibb.co/Qvf3f5sb/10.png",
    "https://i.ibb.co/0VvXk1rQ/11.png",
    "https://i.ibb.co/1YkXFmr6/12.png",
    "https://i.ibb.co/DT6qSXC/13.png",
    "https://i.ibb.co/Gv61DjW0/14.png"
];

interface AvisHojaRutaWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const AvisHojaRutaWizard: React.FC<AvisHojaRutaWizardProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // When the modal is closed, reset the step to 0 for the next time it opens.
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setCurrentStep(0), 300); 
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }
  
  const handleNext = () => {
    if (currentStep < wizardImages.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  const isLastStep = currentStep === wizardImages.length - 1;
  const currentImage = wizardImages[currentStep];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex-shrink-0">
          <h2 id="wizard-title" className="text-xl font-semibold text-sky-700">
            Guía Hoja de Ruta AVIS ({currentStep + 1}/{wizardImages.length})
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </header>
        
        <main className="flex-grow p-2 sm:p-4 overflow-auto custom-scrollbar flex items-center justify-center bg-slate-200">
          <img src={currentImage} alt={`Paso ${currentStep + 1}`} className="max-w-full max-h-full object-contain" />
        </main>

        <footer className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-between items-center flex-shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          
          <span className="text-sm font-medium text-slate-600 hidden sm:block">
            Paso {currentStep + 1} de {wizardImages.length}
          </span>

          <button
            onClick={isLastStep ? onClose : handleNext}
            className={`px-6 py-2.5 font-semibold rounded-lg shadow-sm transition-colors ${
              isLastStep 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-sky-600 hover:bg-sky-700 text-white'
            }`}
          >
            {isLastStep ? 'Finalizar' : 'Siguiente paso'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AvisHojaRutaWizard;

