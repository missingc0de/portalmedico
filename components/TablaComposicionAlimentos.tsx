import React, { useState, useMemo } from 'react';
// FIX: Changed import to get FoodCategory from types.ts, not from composicionAlimentosData.ts.
import { composicionAlimentosData } from '../data/composicionAlimentosData';
import { FoodCategory } from '../types';

interface AccordionItemProps {
  category: FoodCategory;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ category, isOpen, onToggle }) => {
  return (
    <div className="border-b border-slate-200">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center p-4 text-left text-lg font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 transition-colors"
        aria-expanded={isOpen}
      >
        <span>{category.title}</span>
        <svg
          className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-2 bg-white">
          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-lg max-h-[60vh]">
            <table className="min-w-full text-sm divide-y divide-slate-200">
              <thead className="bg-slate-100 sticky top-0 z-20">
                <tr>
                  {category.headers.map((header, index) => (
                    <th
                      key={index}
                      scope="col"
                      className={`px-3 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap ${
                        index === 0 ? 'sticky left-0 bg-slate-200 z-30 shadow-sm' : ''
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {category.data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-50">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`px-3 py-2 whitespace-nowrap ${
                          cellIndex === 0 ? 'sticky left-0 bg-white hover:bg-slate-50 font-medium text-slate-800 z-10' : 'text-slate-600'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

interface TablaComposicionAlimentosProps {
  onBackToMenu: () => void;
}

const TablaComposicionAlimentos: React.FC<TablaComposicionAlimentosProps> = ({ onBackToMenu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const normalizedSearchTerm = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredData = useMemo(() => {
    if (!normalizedSearchTerm) {
      return composicionAlimentosData;
    }

    const result = composicionAlimentosData
      .map(category => {
        const matchingHeaderIndices = [0]; // Always include the nutrient column
        category.headers.forEach((header, index) => {
          if (index > 0 && header.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedSearchTerm)) {
            matchingHeaderIndices.push(index);
          }
        });

        if (matchingHeaderIndices.length > 1) {
          const newHeaders = matchingHeaderIndices.map(i => category.headers[i]);
          const newData = category.data.map(row => matchingHeaderIndices.map(i => row[i]));
          return { ...category, headers: newHeaders, data: newData };
        }
        return null;
      })
      .filter((category): category is FoodCategory => category !== null);

    return result;
  }, [normalizedSearchTerm]);

  const toggleCategory = (title: string) => {
    setOpenCategories(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-6 sm:p-8">
      <header className="mb-6 text-center">
        <h2 className="text-3xl font-semibold text-slate-700">Tabla de Composición de Alimentos</h2>
        <p className="text-slate-500 mt-2">Busque un alimento o explore por categoría.</p>
      </header>

      <div className="mb-6 relative">
        <input
          type="search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar alimento (ej: Queso, Huevo, Manzana...)"
          className="w-full p-4 pl-12 text-lg border-2 border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          aria-label="Buscar alimento en la tabla de composición"
        />
         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
      </div>
      
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        {filteredData.map(category => (
          <AccordionItem
            key={category.title}
            category={category}
            isOpen={!!openCategories[category.title] || !!searchTerm}
            onToggle={() => toggleCategory(category.title)}
          />
        ))}
      </div>
       {filteredData.length === 0 && searchTerm && (
            <p className="text-center text-slate-500 mt-6">No se encontraron alimentos para "{searchTerm}".</p>
        )}

      <div className="text-center mt-8">
        <button
          onClick={onBackToMenu}
          className="px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm"
        >
          Volver al Menú
        </button>
      </div>
    </div>
  );
};

export default TablaComposicionAlimentos;
