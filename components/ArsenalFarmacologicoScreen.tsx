
import React, { useState, useMemo } from 'react';
import { arsenalFarmacologicoData } from '../data/farmaciaData';
import { vademecumData } from '../data/vademecumData';
import { Farmaco } from '../types';
import FarmacoDetailsModal from './FarmacoDetailsModal';

interface ArsenalFarmacologicoScreenProps {
  onBackToMenu: () => void; 
}

const ArsenalFarmacologicoScreen: React.FC<ArsenalFarmacologicoScreenProps> = ({ onBackToMenu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmaco, setSelectedFarmaco] = useState<Farmaco | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return arsenalFarmacologicoData;
    }
    const lowercasedFilter = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return arsenalFarmacologicoData.filter(item =>
      item.medicamento.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(lowercasedFilter)
    );
  }, [searchTerm]);

  const handleDetailsClick = (farmaco: Farmaco) => {
    setSelectedFarmaco(farmaco);
    setIsModalOpen(true);
  };

  const getTypeClass = (tipo: 'URGENCIA' | 'RURAL' | 'APS') => {
    switch (tipo) {
      case 'URGENCIA':
        return 'bg-red-100 text-red-800 ring-red-600/20';
      case 'RURAL':
        return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'APS':
        return 'bg-sky-100 text-sky-800 ring-sky-600/20';
      default:
        return 'bg-slate-100 text-slate-800 ring-slate-600/20';
    }
  };


  return (
    <>
      <div className="w-full bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-10">

        {/* Search Bar */}
        <div className="mb-6 relative">
          <input
            type="search"
            placeholder="Buscar por nombre de medicamento..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 text-lg border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            aria-label="Buscar medicamento"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar shadow-md rounded-lg border border-slate-200 max-h-[60vh]">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">Tipo</th>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">Medicamento</th>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">Dosificación</th>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">Acciones</th>
                <th scope="col" className="px-4 py-3 whitespace-nowrap min-w-[300px]">Observaciones</th>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">Forma Farmacéutica</th>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">Registro ISP</th>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">Programa/GES</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((item, index) => (
                <tr key={`${item.registroISP}-${item.medicamento}-${index}`} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getTypeClass(item.tipo)}`}>
                      {item.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-900">{item.medicamento}</td>
                  <td className="px-4 py-2">{item.dosificacion}</td>
                  <td className="px-4 py-2">
                    {vademecumData[item.medicamento.toLowerCase()] ? (
                        <button 
                            onClick={() => handleDetailsClick(item)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
                        >
                            Detalles
                        </button>
                    ) : null}
                  </td>
                  <td className="px-4 py-2">{item.observaciones}</td>
                  <td className="px-4 py-2">{item.formaFarmaceutica}</td>
                  <td className="px-4 py-2">{item.registroISP}</td>
                  <td className="px-4 py-2">{item.programaOges}</td>
                </tr>
              )) : (
                  <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-500">
                          No se encontraron medicamentos para "{searchTerm}".
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <FarmacoDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        farmaco={selectedFarmaco}
      />
    </>
  );
};

export default ArsenalFarmacologicoScreen;

