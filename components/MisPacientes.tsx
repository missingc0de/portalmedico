import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  ChevronDown,
  ArrowUpDown,
  Filter,
  FileText,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Save,
  User as UserIcon,
  AlertTriangle,
  FilePlus,
  Cloud,
  Check,
  Copy,
  PlusCircle,
  RefreshCw,
  ExternalLink,
  Fingerprint
} from 'lucide-react';
import { View, User } from '../types';
import { patientStore, PatientRecord } from '../services/patientStore';
import { getChileDateTime } from '../services/dateService';

export const PatientAvatarIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
    <div className="w-full h-full rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-500 overflow-hidden shadow-2xs">
      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#38bdf8] text-white font-bold text-[8px] rounded-full flex items-center justify-center border border-white font-sans leading-none shadow-2xs">
      i
    </span>
  </div>
);

interface MisPacientesProps {
  onSelectMenuItem: (view: View, patientData?: PatientRecord) => void;
  loggedInUser: User;
}

const MisPacientes: React.FC<MisPacientesProps> = ({ onSelectMenuItem }) => {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');
  const [selectedPrestacionFilter, setSelectedPrestacionFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal: Registro Individual (Visualizador y Editor de 3 bloques)
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PatientRecord>({
    id: '',
    rut: '',
    nombre: '',
    fechaCreacion: '',
    tipoFicha: 'Ficha Clínica',
    anamnesis: '',
    exploracion: '',
    actuacion: '',
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Modal: Crear Nueva Ficha Clínica (catálogo de fichas para abrir una en blanco)
  const [isNewFichaCatalogOpen, setIsNewFichaCatalogOpen] = useState(false);
  const [selectedFichaView, setSelectedFichaView] = useState<View>('fichaIngresoEcicep');
  const [fichaSearchQuery, setFichaSearchQuery] = useState('');

  const CLINICAL_FICHAS_GROUPS: { group: string; fichas: { label: string; view: View; desc?: string }[] }[] = useMemo(() => [
    {
      group: 'ECICEP',
      fichas: [
        { label: 'Preingreso ECICEP', view: 'fichaPreingresoEcicep', desc: 'Pre-evaluación y tamizaje ECICEP' },
        { label: 'Ingreso ECICEP', view: 'fichaIngresoEcicep', desc: 'Ingreso integral multiprofesional' },
        { label: 'Control ECICEP', view: 'fichaControlEcicepNuevo', desc: 'Control integral de salud cardiovascular y crónicos' },
        { label: 'Seguimiento ECICEP', view: 'fichaSeguimientoEcicep', desc: 'Seguimiento telefónico y presencial' },
      ]
    },
    {
      group: 'PADDS & Cardiovascular',
      fichas: [
        { label: 'Ingreso PADDS', view: 'fichaIngresoPadds', desc: 'Ingreso Programa Atención Domiciliaria Dependientes Severos' },
        { label: 'Control PADDS', view: 'fichaControlPadds', desc: 'Control y seguimiento PADDS' },
        { label: 'Control PSCV (Crónicos)', view: 'fichaControlPscv', desc: 'Control programa salud cardiovascular' },
        { label: 'Control Adulto Mayor', view: 'fichaControlAdultoMayor', desc: 'Control integral adulto y persona mayor' },
      ]
    },
    {
      group: 'Ciclo Vital & Especialidades',
      fichas: [
        { label: 'Control Niño Sano (1 Mes)', view: 'fichaControlNinoSano1Mes', desc: 'Evaluación integral infantil 1 mes' },
        { label: 'Control Niño Sano (3 Meses)', view: 'fichaControlNinoSano3Meses', desc: 'Evaluación integral infantil 3 meses' },
        { label: 'Salud Mental (Ingreso)', view: 'fichaIngresoSm', desc: 'Ingreso integral salud mental' },
        { label: 'Ingreso Demencias', view: 'fichaIngresoDemencias', desc: 'Evaluación integral sospecha o diagnóstico de demencia' },
        { label: 'Visita Domiciliaria (VDI)', view: 'fichaVisitaDomiciliaria', desc: 'Visita domiciliaria integral' },
      ]
    },
    {
      group: 'Documentos & Gestión',
      fichas: [
        { label: 'Receta Médica', view: 'recetaMedica', desc: 'Emisión de recetas y prescripción de fármacos' },
        { label: 'Certificado Médico', view: 'certificadoMedico', desc: 'Certificado de reposo y constatación de salud' },
        { label: 'Ficha de Morbilidad', view: 'fichaMorbilidad', desc: 'Atención médica aguda de morbilidad' },
      ]
    }
  ], []);

  // Sync with patientStore
  useEffect(() => {
    setRecords(patientStore.getPatients());
    const unsub = patientStore.subscribe((updated) => {
      setRecords(updated);
    });
    return unsub;
  }, []);

  // Filter logic
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (record.nombre && record.nombre.toLowerCase().includes(q)) ||
        (record.rut && record.rut.toLowerCase().includes(q)) ||
        (record.id && record.id.toLowerCase().includes(q)) ||
        (record.tipoFicha && record.tipoFicha.toLowerCase().includes(q)) ||
        (record.anamnesis && record.anamnesis.toLowerCase().includes(q));

      const matchesPrestacion =
        selectedPrestacionFilter === 'All' ||
        record.prestacionCategory === selectedPrestacionFilter ||
        (record.tipoFicha && record.tipoFicha.toLowerCase().includes(selectedPrestacionFilter.toLowerCase()));

      return matchesSearch && matchesPrestacion;
    });
  }, [records, searchTerm, selectedPrestacionFilter]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) {
      alert(`No hay contenido en ${label} para copiar.`);
      return;
    }
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOpenRecord = (record: PatientRecord) => {
    setIsCreatingNew(false);
    setEditingRecord({
      ...record,
      anamnesis: record.anamnesis || '',
      exploracion: record.exploracion || '',
      actuacion: record.actuacion || '',
      tipoFicha: record.tipoFicha || record.ultimaPrestacion || 'Ficha Clínica',
      fechaCreacion: record.fechaCreacion || record.fechaUltimaAtencion || getChileDateTime(),
    });
    setIsRecordModalOpen(true);
  };

  const handleOpenNewRecordModal = () => {
    const newId = `REG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const now = getChileDateTime();
    setIsCreatingNew(true);
    setEditingRecord({
      id: newId,
      rut: '',
      nombre: '',
      fechaCreacion: now,
      tipoFicha: 'Ficha Clínica',
      anamnesis: '',
      exploracion: '',
      actuacion: '',
    });
    setIsRecordModalOpen(true);
  };

  // 1. SOBREESCRIBIR / GUARDAR CAMBIOS (keeps the same ID)
  const handleSaveOverwrite = async () => {
    if (!editingRecord.nombre.trim()) {
      alert('Por favor ingrese el nombre del paciente.');
      return;
    }
    if (!editingRecord.rut.trim()) {
      alert('Por favor ingrese el RUT del paciente.');
      return;
    }

    const saved = patientStore.savePatient({
      ...editingRecord,
      id: editingRecord.id, // Mismo ID para sobreescribir
      nombre: editingRecord.nombre.toUpperCase().trim(),
      rut: editingRecord.rut.trim(),
      fechaCreacion: editingRecord.fechaCreacion || getChileDateTime(),
      tipoFicha: editingRecord.tipoFicha || 'Ficha Clínica',
      anamnesis: editingRecord.anamnesis || '',
      exploracion: editingRecord.exploracion || '',
      actuacion: editingRecord.actuacion || '',
    });

    await patientStore.uploadToCloud(saved);
    alert(`¡Registro "${saved.id}" actualizado y sobreescrito exitosamente!\nLos cambios han sido sincronizados en la nube.`);
    setIsRecordModalOpen(false);
  };

  // 2. CREAR UNO DIFERENTE / GUARDAR COMO NUEVO (generates a new unique ID)
  const handleSaveAsNew = async () => {
    if (!editingRecord.nombre.trim()) {
      alert('Por favor ingrese el nombre del paciente.');
      return;
    }
    if (!editingRecord.rut.trim()) {
      alert('Por favor ingrese el RUT del paciente.');
      return;
    }

    const newId = `REG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newDate = getChileDateTime();

    const saved = patientStore.savePatient({
      ...editingRecord,
      id: newId, // NUEVO ID INDEPENDIENTE
      fechaCreacion: newDate,
      fechaUltimaAtencion: newDate,
      nombre: editingRecord.nombre.toUpperCase().trim(),
      rut: editingRecord.rut.trim(),
      tipoFicha: editingRecord.tipoFicha || 'Ficha Clínica',
      anamnesis: editingRecord.anamnesis || '',
      exploracion: editingRecord.exploracion || '',
      actuacion: editingRecord.actuacion || '',
    });

    await patientStore.uploadToCloud(saved);
    setEditingRecord(saved);
    alert(`¡Nuevo registro creado exitosamente!\n\nID Asignado: ${newId}\nFecha: ${newDate}\nPaciente: ${saved.nombre}\nRUT: ${saved.rut}`);
  };

  const handleDeleteRecord = (id: string) => {
    patientStore.deletePatient(id);
    setDeleteConfirmId(null);
    if (isRecordModalOpen && editingRecord.id === id) {
      setIsRecordModalOpen(false);
    }
  };

  const handleCopyFullRecord = () => {
    const parts = [
      `REGISTRO CLÍNICO: ${editingRecord.tipoFicha || 'Ficha Clínica'}`,
      `PACIENTE: ${editingRecord.nombre}`,
      `RUT: ${editingRecord.rut}`,
      `FECHA: ${editingRecord.fechaCreacion || getChileDateTime()}`,
      `ID REGISTRO: ${editingRecord.id}`,
      '',
      `1. ANAMNESIS:\n${editingRecord.anamnesis || '(Sin registro)'}`,
      '',
      `2. EXPLORACIÓN:\n${editingRecord.exploracion || '(Sin registro)'}`,
      '',
      `3. ACTUACIÓN:\n${editingRecord.actuacion || '(Sin registro)'}`
    ];
    copyToClipboard(parts.join('\n'), 'Registro Completo');
  };

  return (
    <div className="w-full space-y-4 p-3 sm:p-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Mis Pacientes</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
              {filteredRecords.length} registros
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80" title="Sincronizado en tiempo real con Firebase Cloud">
              <Cloud className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Nube Firebase Online</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cada registro clínico cuenta con su propio ID independiente, fecha de creación y sus tres bloques de Anamnesis, Exploración y Actuación.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleOpenNewRecordModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>NUEVO REGISTRO</span>
          </button>

          <button
            onClick={() => setIsNewFichaCatalogOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            <span>ABRIR FICHA EN BLANCO</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col w-full">
        {/* Search & Filters */}
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 bg-white">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por paciente, RUT o ID de registro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600">
              <span className="text-slate-400">Prestación:</span>
              <select
                value={selectedPrestacionFilter}
                onChange={(e) => setSelectedPrestacionFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
              >
                <option value="All">Todas</option>
                <option value="ecicep">ECICEP</option>
                <option value="pscv">Cardiovascular / PADDS</option>
                <option value="salud_mental">Salud Mental</option>
                <option value="respiratorio">Respiratorio</option>
                <option value="vdi">VDI</option>
                <option value="nino_sano">Niño Sano</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* 1. DESKTOP VIEW: Clinical Table */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-xs font-bold text-slate-700">
                <th className="py-3 px-3 w-36 border-r border-slate-200">ID Registro</th>
                <th className="py-3 px-4 border-r border-slate-200">Paciente</th>
                <th className="py-3 px-3 w-32 border-r border-slate-200">RUT</th>
                <th className="py-3 px-4 border-r border-slate-200">Tipo de Ficha / Registro</th>
                <th className="py-3 px-4 border-r border-slate-200">Fecha de Creación</th>
                <th className="py-3 px-4 text-right pr-6 w-36">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-sans">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((record, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <tr
                      key={record.id}
                      onClick={() => handleOpenRecord(record)}
                      className={`transition-colors cursor-pointer border-b border-slate-100 ${
                        isEven ? 'bg-white' : 'bg-slate-50/40'
                      } hover:bg-sky-50/50`}
                    >
                      {/* ID Registro */}
                      <td className="py-3 px-3 border-r border-slate-200/80 whitespace-nowrap">
                        <span className="font-mono font-bold text-[11px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          {record.id || 'S/ID'}
                        </span>
                      </td>

                      {/* Paciente */}
                      <td className="py-3 px-4 border-r border-slate-200/80 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <PatientAvatarIcon className="w-6 h-6" />
                          <span className="font-bold text-slate-800 text-xs tracking-tight font-sans">
                            {record.nombre || 'PACIENTE SIN NOMBRE'}
                          </span>
                        </div>
                      </td>

                      {/* RUT */}
                      <td className="py-3 px-3 font-bold text-slate-700 whitespace-nowrap border-r border-slate-200/80">
                        {record.rut || 'Sin RUT'}
                      </td>

                      {/* Tipo de Ficha */}
                      <td className="py-3 px-4 whitespace-nowrap border-r border-slate-200/80">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {record.tipoFicha || record.ultimaPrestacion || 'Ficha Clínica'}
                        </span>
                      </td>

                      {/* Fecha de Creación */}
                      <td className="py-3 px-4 font-semibold text-slate-600 whitespace-nowrap border-r border-slate-200/80">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{record.fechaCreacion || record.fechaUltimaAtencion || 'Sin fecha'}</span>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right pr-6 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenRecord(record)}
                            title="Abrir y ver los 3 bloques de este registro"
                            className="p-1.5 rounded-lg border border-sky-200 text-sky-700 hover:bg-sky-100 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Registro</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(record.id)}
                            title="Eliminar este registro"
                            className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No se encontraron registros clínicos guardados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 2. MOBILE VIEW: Responsive Cards (One below the other, edge-to-edge) */}
        <div className="md:hidden divide-y divide-slate-100 w-full">
          {paginatedRecords.length > 0 ? (
            paginatedRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => handleOpenRecord(record)}
                className="p-3.5 bg-white hover:bg-sky-50/40 active:bg-sky-100/50 transition-colors cursor-pointer flex flex-col gap-2.5"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <PatientAvatarIcon className="w-6 h-6 shrink-0" />
                    <span className="font-bold text-slate-900 text-sm truncate uppercase">
                      {record.nombre || 'PACIENTE SIN NOMBRE'}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                    {record.id}
                  </span>
                </div>

                {/* Info row */}
                <div className="flex items-center justify-between text-xs text-slate-600 gap-2 flex-wrap">
                  <div>
                    <span className="text-slate-400 text-[11px]">RUT: </span>
                    <strong className="text-slate-800">{record.rut}</strong>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{record.fechaCreacion || 'Sin fecha'}</span>
                  </div>
                </div>

                {/* Badge row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 truncate">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{record.tipoFicha || 'Ficha Clínica'}</span>
                  </span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenRecord(record)}
                      className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Abrir</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(record.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No se encontraron registros clínicos guardados.
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-slate-500 bg-white">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
            <span className="px-2 text-slate-700 font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-slate-400 font-medium text-center sm:text-right">
            Mostrando <strong className="text-slate-700">{filteredRecords.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredRecords.length)}</strong> de <strong className="text-slate-700">{filteredRecords.length}</strong> registros
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL REGISTRO INDIVIDUAL: TRES BLOQUES DE ANAMNESIS, EXPLORACIÓN Y ACTUACIÓN */}
      {/* ========================================================================= */}
      {isRecordModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden animate-scaleIn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-gradient-to-r from-sky-50 via-cyan-50 to-white shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-sky-700 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {isCreatingNew ? 'Nuevo Registro Clínico' : 'Registro Clínico Individual'}
                    </h2>
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300">
                      ID: {editingRecord.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Fecha Creación: <strong>{editingRecord.fechaCreacion || 'Ahora'}</strong></span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Identificación del Paciente (Campos Editables) */}
            <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nombre Completo del Paciente *
                </label>
                <input
                  type="text"
                  value={editingRecord.nombre}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, nombre: e.target.value.toUpperCase() }))}
                  placeholder="EJ: JUAN PÉREZ GONZÁLEZ"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 uppercase outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  RUT del Paciente *
                </label>
                <input
                  type="text"
                  value={editingRecord.rut}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, rut: e.target.value }))}
                  placeholder="EJ: 12.345.678-9"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tipo de Registro / Ficha
                </label>
                <input
                  type="text"
                  value={editingRecord.tipoFicha || ''}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, tipoFicha: e.target.value }))}
                  placeholder="EJ: Ingreso ECICEP / Control PADDS"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Content: Los Tres Bloques Clínicos */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
              
              {/* BLOQUE 1: ANAMNESIS */}
              <div className="bg-white border-2 border-sky-200/80 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-sky-50/80 px-4 py-2 border-b border-sky-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                    <h3 className="text-xs font-black text-sky-900 uppercase tracking-wider">
                      1. ANAMNESIS
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(editingRecord.anamnesis || '', 'Anamnesis')}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md bg-white border border-sky-300 text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedField === 'Anamnesis' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'Anamnesis' ? '¡Copiado!' : 'COPIAR ANAMNESIS'}</span>
                  </button>
                </div>
                <textarea
                  value={editingRecord.anamnesis || ''}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, anamnesis: e.target.value }))}
                  placeholder="Ingrese el texto registrado para Anamnesis..."
                  rows={4}
                  className="w-full p-3 text-xs font-mono text-slate-800 bg-white outline-none resize-y leading-relaxed focus:bg-sky-50/20 transition-colors"
                />
              </div>

              {/* BLOQUE 2: EXPLORACIÓN */}
              <div className="bg-white border-2 border-emerald-200/80 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-emerald-50/80 px-4 py-2 border-b border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                      2. EXPLORACIÓN
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(editingRecord.exploracion || '', 'Exploración')}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedField === 'Exploración' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'Exploración' ? '¡Copiado!' : 'COPIAR EXPLORACIÓN'}</span>
                  </button>
                </div>
                <textarea
                  value={editingRecord.exploracion || ''}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, exploracion: e.target.value }))}
                  placeholder="Ingrese el texto registrado para Exploración física y exámenes..."
                  rows={4}
                  className="w-full p-3 text-xs font-mono text-slate-800 bg-white outline-none resize-y leading-relaxed focus:bg-emerald-50/20 transition-colors"
                />
              </div>

              {/* BLOQUE 3: ACTUACIÓN */}
              <div className="bg-white border-2 border-indigo-200/80 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-indigo-50/80 px-4 py-2 border-b border-indigo-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <h3 className="text-xs font-black text-indigo-900 uppercase tracking-wider">
                      3. ACTUACIÓN
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(editingRecord.actuacion || '', 'Actuación')}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedField === 'Actuación' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'Actuación' ? '¡Copiado!' : 'COPIAR ACTUACIÓN'}</span>
                  </button>
                </div>
                <textarea
                  value={editingRecord.actuacion || ''}
                  onChange={(e) => setEditingRecord(prev => ({ ...prev, actuacion: e.target.value }))}
                  placeholder="Ingrese el texto registrado para Actuación, indicaciones y plan terapéutico..."
                  rows={4}
                  className="w-full p-3 text-xs font-mono text-slate-800 bg-white outline-none resize-y leading-relaxed focus:bg-indigo-50/20 transition-colors"
                />
              </div>

              {/* Botón rápido para copiar los 3 bloques juntos */}
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={handleCopyFullRecord}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Todo el Registro (3 Bloques)</span>
                </button>
              </div>
            </div>

            {/* Footer Actions: SOBREESCRIBIR / CREAR UNO DIFERENTE / ELIMINAR */}
            <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(editingRecord.id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                >
                  Cerrar
                </button>

                {/* BOTÓN: CREAR UNO DIFERENTE / GUARDAR COMO NUEVO */}
                <button
                  type="button"
                  onClick={handleSaveAsNew}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
                  title="Crea una copia de este registro con un nuevo ID independiente"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Guardar como Nuevo</span>
                </button>

                {/* BOTÓN: SOBREESCRIBIR / GUARDAR CAMBIOS */}
                <button
                  type="button"
                  onClick={handleSaveOverwrite}
                  className="flex items-center justify-center gap-1.5 px-5 py-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
                  title="Sobreescribe este registro manteniendo su mismo ID"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Sobreescribir Registro</span>
                </button>
              </div>

            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteConfirmId && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">¿Eliminar registro clínico?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              ¿Está seguro de que desea eliminar este registro con ID <strong className="text-slate-900 font-mono">{deleteConfirmId}</strong>? Esta acción borrará la información de la base de datos en la nube y local.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteRecord(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL CREAR NUEVA FICHA CLÍNICA (CATÁLOGO) */}
      {/* ========================================================================= */}
      {isNewFichaCatalogOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xs">
                  <FilePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Crear Nueva Ficha Clínica</h3>
                  <p className="text-xs text-slate-500">Seleccione el formulario clínico a abrir</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewFichaCatalogOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar tipo de ficha o prestación..."
                  value={fichaSearchQuery}
                  onChange={(e) => setFichaSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
              {CLINICAL_FICHAS_GROUPS.map((grp) => {
                const filtered = grp.fichas.filter(f =>
                  f.label.toLowerCase().includes(fichaSearchQuery.toLowerCase()) ||
                  (f.desc && f.desc.toLowerCase().includes(fichaSearchQuery.toLowerCase()))
                );
                if (filtered.length === 0) return null;

                return (
                  <div key={grp.group} className="space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {grp.group}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filtered.map(f => {
                        const isSelected = selectedFichaView === f.view;
                        return (
                          <div
                            key={f.view}
                            onClick={() => setSelectedFichaView(f.view)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between gap-1 ${
                              isSelected
                                ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <span className="font-bold text-slate-900">{f.label}</span>
                            {f.desc && <span className="text-[11px] text-slate-500 leading-snug">{f.desc}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsNewFichaCatalogOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsNewFichaCatalogOpen(false);
                  onSelectMenuItem(selectedFichaView);
                }}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Abrir Ficha Seleccionada</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default MisPacientes;
