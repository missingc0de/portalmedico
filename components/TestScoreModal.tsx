import React, { useState, useEffect } from 'react';

interface TestScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { score: string; testName?: string }) => void;
  title: string;
  testOptions?: string[]; // For modals with multiple test choices
}

const TestScoreModal: React.FC<TestScoreModalProps> = ({ isOpen, onClose, onSave, title, testOptions }) => {
  const [score, setScore] = useState('');
  const [selectedTest, setSelectedTest] = useState(testOptions ? testOptions[0] : '');

  useEffect(() => {
    if (isOpen) {
      setScore('');
      if (testOptions) {
        setSelectedTest(testOptions[0]);
      }
    }
  }, [isOpen, testOptions]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (score.trim()) {
      onSave({ score, testName: selectedTest });
      onClose();
    } else {
      alert('Por favor, ingrese un puntaje.');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-score-modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-slate-200">
          <h2 id="test-score-modal-title" className="text-lg font-semibold text-sky-700">{title}</h2>
        </header>
        <main className="p-6 space-y-4">
          {testOptions && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Seleccione el test:</label>
              <select
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"
              >
                {testOptions.map(test => <option key={test} value={test}>{test}</option>)}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="test-score-input" className="block text-sm font-medium text-slate-700 mb-1">Puntaje Obtenido:</label>
            <input
              id="test-score-input"
              type="text"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
              autoFocus
            />
          </div>
        </main>
        <footer className="p-4 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-md">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md">Guardar Puntaje</button>
        </footer>
      </div>
    </div>
  );
};

export default TestScoreModal;

