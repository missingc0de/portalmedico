
import React, { useState, useCallback } from 'react';
import { Farmaco } from '../types';
import FormField from './FormField';
import FarmacoAutocomplete from './FarmacoAutocomplete';

interface MedicamentoArsenalInputProps {
  currentValue: string;
  onValueChange: (newValue: string) => void;
}

const MedicamentoArsenalInput: React.FC<MedicamentoArsenalInputProps> = ({ currentValue, onValueChange }) => {
    const [showInputs, setShowInputs] = useState(false);
    const [selectedFarmaco, setSelectedFarmaco] = useState<Farmaco | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [cantidad, setCantidad] = useState('1');
    const [posologia, setPosologia] = useState('');

    const handleSelectFarmaco = (farmaco: Farmaco) => {
        setSelectedFarmaco(farmaco);
        setSearchTerm(farmaco.medicamento);
    };

    const handleSearchTermChange = (value: string) => {
        setSearchTerm(value);
        if (selectedFarmaco && value !== selectedFarmaco.medicamento) {
            setSelectedFarmaco(null); // Deselect if user types something different
        }
    };

    const handleAddMedicamento = () => {
        if (!selectedFarmaco || !cantidad.trim() || !posologia.trim()) {
            alert('Por favor, seleccione un fármaco y complete la cantidad y posología.');
            return;
        }

        const formaFarmaceutica = selectedFarmaco.formaFarmaceutica.toLowerCase();
        const cantidadNum = parseFloat(cantidad);
        const cantidadStr = cantidadNum > 1 ? `${cantidad} ${formaFarmaceutica}s` : `${cantidad} ${formaFarmaceutica}`;

        const posologiaStr = `cada ${posologia.trim()} horas`;
        
        const newMedicamentoString = `${selectedFarmaco.medicamento} ${selectedFarmaco.dosificacion} ${cantidadStr} ${posologiaStr}`;
        
        const newValue = currentValue ? `${currentValue}\n${newMedicamentoString}` : newMedicamentoString;
        onValueChange(newValue);

        // Reset for next entry
        setSelectedFarmaco(null);
        setSearchTerm('');
        setCantidad('1');
        setPosologia('');
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShowInputs(e.target.checked);
        if (!e.target.checked) {
            setSelectedFarmaco(null);
            setSearchTerm('');
            setCantidad('1');
            setPosologia('');
        }
    };

    return (
        <div className="mt-4 p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="add-from-arsenal"
                    name="add-from-arsenal"
                    checked={showInputs}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                />
                <label htmlFor="add-from-arsenal" className="ml-2 text-sm font-semibold text-slate-900">
                    Agregar desde arsenal APS
                </label>
            </div>
            {showInputs && (
                <div className="p-3 bg-white border border-slate-200 rounded-md space-y-4 animate-fadeIn">
                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">Principio activo</label>
                        <FarmacoAutocomplete
                            value={searchTerm}
                            onValueChange={handleSearchTermChange}
                            onSelect={handleSelectFarmaco}
                            placeholder="Buscar medicamento..."
                        />
                    </div>
                    {selectedFarmaco && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-800">
                            <p><span className="font-semibold">Dosificación:</span> {selectedFarmaco.dosificacion}</p>
                            <p><span className="font-semibold">Forma:</span> {selectedFarmaco.formaFarmaceutica}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            label="Cantidad"
                            id="cantidad-arsenal"
                            name="cantidad"
                            type="number"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            placeholder="Ej: 1"
                            inputClassName="text-slate-900"
                        />
                        <FormField
                            label="Posología (horas)"
                            id="posologia-arsenal"
                            name="posologia"
                            type="number"
                            value={posologia}
                            onChange={(e) => setPosologia(e.target.value)}
                            placeholder="Ej: 12"
                            inputClassName="text-slate-900"
                        />
                    </div>
                    <div className="text-right">
                        <button
                            type="button"
                            onClick={handleAddMedicamento}
                            disabled={!selectedFarmaco}
                            className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Agregar Medicamento
                        </button>
                    </div>
                     <style>{`
                        @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-5px); }
                        to { opacity: 1; transform: translateY(0); }
                        }
                        .animate-fadeIn {
                        animation: fadeIn 0.2s ease-out forwards;
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default MedicamentoArsenalInput;

