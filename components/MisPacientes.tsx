import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  ChevronDown,
  ArrowUpDown,
  Filter,
  FileText,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Save,
  Phone,
  User as UserIcon,
  AlertTriangle,
  ShieldAlert,
  Edit,
  FilePlus,
  Cloud,
  Check
} from 'lucide-react';
import { View, User } from '../types';
import { patientStore, PatientRecord, SavedFichaEntry } from '../services/patientStore';
import SmartAntecedentesTextarea from './SmartAntecedentesTextarea';
import SmartFarmacosTextarea from './SmartFarmacosTextarea';

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

const MisPacientes: React.FC<MisPacientesProps> = ({ onSelectMenuItem, loggedInUser }) => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');
  const [selectedPrestacionFilter, setSelectedPrestacionFilter] = useState('All');
  const [selectedPatients, setSelectedPatients] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal State
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Partial<PatientRecord>>({
    rut: '',
    nombre: '',
    edad: '',
    sexo: 'Masculino',
    telefono: '+56 9 ',
    sector: 'Verde',
    antecedentesPersonales: '',
    morbilidad: '',
    farmacos: '',
    alergias: '',
    cirugias: '',
    hospitalizaciones: '',
    adherenciaTratamiento: 'Sí',
    estratificacion: 'G1',
    duplaProfesional: '',
    actividadFisicaHabito: '',
    animo_estadoAnimo: '',
    espiritualidad: ''
  });

  const [deleteConfirmRut, setDeleteConfirmRut] = useState<string | null>(null);
  const [patientModalTab, setPatientModalTab] = useState<'datos' | 'fichas'>('datos');

  // Modal Crear Nueva Ficha
  const [isNewFichaModalOpen, setIsNewFichaModalOpen] = useState(false);
  const [selectedPatientForFicha, setSelectedPatientForFicha] = useState<string>('');
  const [selectedFichaView, setSelectedFichaView] = useState<View>('fichaIngresoEcicep');
  const [fichaSearchQuery, setFichaSearchQuery] = useState('');

  // Available Clinical Records for selection
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
      group: 'Controles Crónicos y Especialidades',
      fichas: [
        { label: 'Control Crónico (PSCV)', view: 'fichaControlPscv', desc: 'Programa de Salud Cardiovascular' },
        { label: 'Control Salud Mental', view: 'fichaControlSm', desc: 'Seguimiento y control de salud mental' },
        { label: 'Ingreso Salud Mental', view: 'fichaIngresoSm', desc: 'Ingreso al programa de salud mental' },
        { label: 'Consulta PASMI', view: 'fichaConsultaPasmi', desc: 'Programa de atención en salud mental infantil' },
        { label: 'Control IRA / ERA', view: 'fichaControlSalaEra', desc: 'Salas respiratorias adultos y niños' },
        { label: 'Control Sala IRA (Infantil)', view: 'fichaControlSalaIra', desc: 'Infecciones respiratorias agudas infantil' },
        { label: 'Control Hipotiroidismo', view: 'fichaControlHipotiroidismo', desc: 'Seguimiento de patología tiroidea' },
        { label: 'Control Epilepsia', view: 'fichaControlEpilepsia', desc: 'Atención y control de epilepsia' },
        { label: 'Control Artrosis', view: 'fichaControlArtrosis', desc: 'Programa de artrosis leve y moderada' },
        { label: 'Fondo de Ojo', view: 'fichaFondoOjo', desc: 'Tamizaje retinopatía diabética' },
        { label: 'Ingreso Demencias', view: 'ingresoDemencias', desc: 'Ingreso integral plan nacional demencias' },
        { label: 'Control Demencias', view: 'fichaControlDemencias', desc: 'Seguimiento y control plan demencias' },
        { label: 'Equipo de cabecera', view: 'fichaVisitaDomiciliaria', desc: 'Atención de equipo de cabecera en domicilio' },
        { label: 'Ingreso PADDS', view: 'fichaIngresoPadds', desc: 'Ingreso al programa PADDS' },
        { label: 'Control PADDS', view: 'fichaControlPadds', desc: 'Control de seguimiento del programa PADDS' },
      ]
    },
    {
      group: 'Programa Infantil - Niño Sano',
      fichas: [
        { label: 'Control Díada / Recién Nacido', view: 'fichaControlNinoSanoRN' },
        { label: 'Control Niño Sano 1° Mes', view: 'fichaControlNinoSano1Mes' },
        { label: 'Control Niño Sano 2 Meses', view: 'fichaControlNinoSano2Meses' },
        { label: 'Control Niño Sano 3° Mes', view: 'fichaControlNinoSano3Mes' },
        { label: 'Control Niño Sano 4 Meses', view: 'fichaControlNinoSano4Meses' },
        { label: 'Consulta Nutricional 5 Meses', view: 'consultaNutricional5Meses' },
        { label: 'Control Niño Sano 6 Meses', view: 'fichaControlNinoSano6Meses' },
        { label: 'Control Niño Sano 8 Meses', view: 'fichaControlNinoSano8Meses' },
        { label: 'Control Niño Sano 12 Meses', view: 'fichaControlNinoSano12Meses' },
        { label: 'Control Niño Sano 18 Meses', view: 'fichaControlNinoSano18Meses' },
        { label: 'Control Niño Sano 2 Años', view: 'fichaControlNinoSano2Anos' },
        { label: 'Control Niño Sano 3 Años', view: 'fichaControlNinoSano3Anos' },
        { label: 'Consulta Nutricional 3 Años 6 M.', view: 'consultaNutricional3Anos6Meses' },
        { label: 'Control Niño Sano 4 Años', view: 'fichaControlNinoSano4Anos' },
        { label: 'Control Niño Sano 5 Años', view: 'fichaControlNinoSano5Anos' },
        { label: 'Control Niño Sano 6 Años', view: 'fichaControlNinoSano6Anos' },
        { label: 'Control Niño Sano 7 Años', view: 'fichaControlNinoSano7Anos' },
        { label: 'Control Niño Sano 8 Años', view: 'fichaControlNinoSano8Anos' },
        { label: 'Control Niño Sano 9 Años', view: 'fichaControlNinoSano9Anos' },
      ]
    },
    {
      group: 'Atención y Documentos Médicos',
      fichas: [
        { label: 'Receta Médica', view: 'recetaMedica', desc: 'Emisión de recetas y prescripción de fármacos' },
        { label: 'Certificado Médico', view: 'certificadoMedico', desc: 'Certificado de reposo y constatación de salud' },
        { label: 'Orden de Laboratorio', view: 'ordenLaboratorio', desc: 'Solicitud exámenes de laboratorio clínico' },
        { label: 'Orden de Imágenes / Radiografías', view: 'ordenExamenRadiologico', desc: 'Solicitud de exámenes de radiología y ecografía' },
        { label: 'Ficha de Morbilidad', view: 'fichaMorbilidad', desc: 'Atención médica aguda de morbilidad' },
        { label: 'Ficha de Consultoría', view: 'fichaConsultoria', desc: 'Interconsulta o consultoría médica' },
      ]
    }
  ], []);

  const handleStartNewFicha = () => {
    let targetPatient: PatientRecord | undefined = undefined;
    if (selectedPatientForFicha) {
      targetPatient = patients.find(p => p.rut === selectedPatientForFicha);
    }
    setIsNewFichaModalOpen(false);
    onSelectMenuItem(selectedFichaView, targetPatient);
  };

  useEffect(() => {
    setPatients(patientStore.getPatients());
    const unsub = patientStore.subscribe((updated) => {
      setPatients(updated);
    });
    return unsub;
  }, []);

  const itemsPerPage = 10;

  // Filter logic
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch =
        patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.telefono && patient.telefono.includes(searchTerm)) ||
        (patient.ultimaPrestacion && patient.ultimaPrestacion.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesPrestacion =
        selectedPrestacionFilter === 'All' || patient.prestacionCategory === selectedPrestacionFilter;

      return matchesSearch && matchesPrestacion;
    });
  }, [patients, searchTerm, selectedPrestacionFilter]);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allSelected: Record<string, boolean> = {};
      paginatedPatients.forEach(p => { allSelected[p.id] = true; });
      setSelectedPatients(allSelected);
    } else {
      setSelectedPatients({});
    }
  };

  const toggleSelectPatient = (id: string) => {
    setSelectedPatients(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isAllSelected = paginatedPatients.length > 0 && paginatedPatients.every(p => selectedPatients[p.id]);

  const handleDeletePatient = (rut: string) => {
    patientStore.deletePatient(rut);
    setDeleteConfirmRut(null);
  };

  const handleSaveModalPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient.rut || !editingPatient.nombre) {
      alert('Por favor ingrese RUT y Nombre del paciente.');
      return;
    }

    patientStore.savePatient({
      ...editingPatient,
      rut: editingPatient.rut.trim(),
      nombre: editingPatient.nombre.toUpperCase().trim(),
      edad: editingPatient.edad || '',
      telefono: editingPatient.telefono || '+56 9 8765 4321',
      sexo: editingPatient.sexo || 'Masculino',
      fechaUltimaAtencion: editingPatient.fechaUltimaAtencion || 'Sin atenciones',
      ultimaPrestacion: editingPatient.ultimaPrestacion || 'No registra',
      prestacionCategory: editingPatient.prestacionCategory || 'none',
      estratificacion: editingPatient.estratificacion || 'G0'
    } as any);

    setIsPatientModalOpen(false);
  };

  const handleOpenEditModal = (patient: PatientRecord) => {
    setEditingPatient(patient);
    setPatientModalTab('datos');
    setIsPatientModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setEditingPatient({
      rut: '',
      nombre: '',
      edad: '',
      sexo: 'Masculino',
      telefono: '+56 9 ',
      sector: 'Verde',
      antecedentesPersonales: '',
      morbilidad: '',
      farmacos: '',
      alergias: '',
      cirugias: '',
      hospitalizaciones: '',
      adherenciaTratamiento: 'Sí',
      estratificacion: 'G0',
      duplaProfesional: '',
      actividadFisicaHabito: '',
      animo_estadoAnimo: '',
      espiritualidad: ''
    });
    setIsPatientModalOpen(true);
  };

  const renderEstratificacionBadge = (estratificacion?: string) => {
    const val = (estratificacion || 'G0').toUpperCase();
    switch (val) {
      case 'G3':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-50 text-red-700 border border-red-200">
            <ShieldAlert className="w-3 h-3 text-red-600" />
            G3
          </span>
        );
      case 'G2':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            G2
          </span>
        );
      case 'G1':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            G1
          </span>
        );
      case 'G0':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            G0
          </span>
        );
    }
  };

  const renderPrestacionBadge = (patient: PatientRecord) => {
    const label = patient.ultimaPrestacion;
    if (!label || label === 'No registra') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
          No registra
        </span>
      );
    }

    switch (patient.prestacionCategory) {
      case 'ecicep':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case 'pscv':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/70">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case 'salud_mental':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/70">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case 'respiratorio':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/70">
            <Clock className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case 'vdi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case 'preingreso':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/70">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/70">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {label}
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-4 p-4 sm:p-5 animate-fadeIn">
      {/* Header Banner - Exact padding & borders matching Ingreso ECICEP (p-4 sm:p-5, rounded-xl border border-slate-200) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Mis Pacientes</h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
              {filteredPatients.length} registrados
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs" title="Sincronizado en tiempo real con la base de datos en la nube">
              <Cloud className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Base de Datos Online</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro centralizado y compartido en la nube. Consulta, crea y transfiere fichas clínicas desde cualquier equipo.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleOpenNewModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>NUEVO PACIENTE</span>
          </button>

          <button
            onClick={() => {
              setSelectedPatientForFicha('');
              setIsNewFichaModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            <span>CREAR NUEVA FICHA</span>
          </button>
        </div>
      </div>

      {/* Main Table Grid - Exact border & padding limits matching Ingreso ECICEP */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full">
        
        {/* Filter Bar Top */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 bg-white">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar paciente, RUT o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Filters Right */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            {/* Fecha Filter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600">
              <span className="text-slate-400">Fecha:</span>
              <select
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
              >
                <option value="All">Todas</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Prestación Filter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600">
              <span className="text-slate-400">Prestación:</span>
              <select
                value={selectedPrestacionFilter}
                onChange={(e) => setSelectedPrestacionFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
              >
                <option value="All">Todas</option>
                <option value="ecicep">ECICEP</option>
                <option value="pscv">Control PSCV</option>
                <option value="salud_mental">Salud Mental</option>
                <option value="respiratorio">Respiratorio</option>
                <option value="vdi">Visita Domiciliaria</option>
                <option value="preingreso">Preingreso ECICEP</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Sort Button */}
            <button
              title="Ordenar lista"
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>

            {/* Filter Icon Button */}
            <button
              title="Filtrar avanzado"
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 transition-colors cursor-pointer"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clinical Grid Table with Slate Header & Column Dividers */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-xs font-bold text-slate-700">
                <th className="py-3 px-3 w-10 text-center border-r border-slate-200">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 border-r border-slate-200 font-bold text-slate-700">Paciente</th>
                <th className="py-3 px-3 border-r border-slate-200 font-bold text-slate-700">RUT</th>
                <th className="py-3 px-3 border-r border-slate-200 font-bold text-slate-700">Edad</th>
                <th className="py-3 px-3 border-r border-slate-200 font-bold text-slate-700 text-center">Estratificación</th>
                <th className="py-3 px-4 border-r border-slate-200 font-bold text-slate-700">Última prestación</th>
                <th className="py-3 px-4 border-r border-slate-200 font-bold text-slate-700">Fecha de atención</th>
                <th className="py-3 px-4 font-bold text-slate-700 text-right pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-sans">
              {paginatedPatients.length > 0 ? (
                paginatedPatients.map((patient, idx) => {
                  const isSelected = !!selectedPatients[patient.id];
                  const uppercaseName = patient.nombre.toUpperCase();
                  const phoneFormatted = patient.telefono || '+56 9 8765 4321';
                  const ageDisplay = patient.edad ? `${patient.edad} años` : 'S/I';
                  const isEven = idx % 2 === 0;

                  return (
                    <tr
                      key={patient.id}
                      className={`transition-colors border-b border-slate-100 ${
                        isSelected ? 'bg-sky-50/60' : isEven ? 'bg-white' : 'bg-slate-50/40'
                      } hover:bg-sky-50/40`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center border-r border-slate-200/80">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectPatient(patient.id)}
                          className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                      </td>

                      {/* Paciente (with clickable avatar icon to open saved fichas collection) */}
                      <td className="py-3 px-4 whitespace-nowrap border-r border-slate-200/80">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPatient(patient);
                              setPatientModalTab('fichas');
                              setIsPatientModalOpen(true);
                            }}
                            title="Ver colección de fichas guardadas"
                            className="cursor-pointer hover:scale-105 transition-transform"
                          >
                            <PatientAvatarIcon className="w-7 h-7" />
                          </button>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-800 text-sm tracking-tight font-sans leading-snug">
                              {uppercaseName}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {phoneFormatted}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* RUT */}
                      <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap border-r border-slate-200/80">
                        {patient.rut}
                      </td>

                      {/* Edad */}
                      <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap border-r border-slate-200/80">
                        {ageDisplay}
                      </td>

                      {/* Estratificación Column (G0, G1, G2, G3) */}
                      <td className="py-3 px-3 text-center border-r border-slate-200/80">
                        {renderEstratificacionBadge(patient.estratificacion)}
                      </td>

                      {/* Última prestación (Default: "No registra") */}
                      <td className="py-3 px-4 whitespace-nowrap border-r border-slate-200/80">
                        {renderPrestacionBadge(patient)}
                      </td>

                      {/* Fecha de última atención */}
                      <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap border-r border-slate-200/80">
                        {patient.fechaUltimaAtencion || 'Sin atenciones'}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right pr-6 whitespace-nowrap relative">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Open Ficha Icon Button */}
                          <button
                            onClick={() => {
                              onSelectMenuItem(patient.viewTarget || 'fichaIngresoEcicep', patient);
                            }}
                            title="Abrir ficha clínica de atención con datos cargados"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 transition-all cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Edit Patient Data Modal */}
                          <button
                            onClick={() => handleOpenEditModal(patient)}
                            title="Editar registro del paciente"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 transition-all cursor-pointer"
                          >
                            <UserIcon className="w-4 h-4" />
                          </button>

                          {/* Trash Delete Patient Button */}
                          <button
                            onClick={() => setDeleteConfirmRut(patient.rut)}
                            title="Eliminar paciente del registro"
                            className="p-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Options Menu Button */}
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === patient.id ? null : patient.id)}
                            title="Más opciones"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Dropdown Options */}
                        {activeMenuId === patient.id && (
                          <div className="absolute right-6 top-11 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 w-48 text-left animate-fadeIn">
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onSelectMenuItem('fichaIngresoEcicep', patient);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-600" />
                              <span>Ingreso ECICEP</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onSelectMenuItem('fichaControlEcicepNuevo', patient);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-600" />
                              <span>Control ECICEP</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onSelectMenuItem('fichaControlPscv', patient);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-600" />
                              <span>Control Crónico</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onSelectMenuItem('recetaMedica', patient);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Generar Receta</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron pacientes que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Bar matching photo prompt */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500 bg-white">
          
          {/* Pagination buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              const isCurrent = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Entries summary */}
          <div className="text-slate-400 font-medium">
            Mostrando <span className="font-bold text-slate-700">1-{paginatedPatients.length}</span> de <span className="font-bold text-slate-700">{filteredPatients.length}</span> pacientes
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal (PORTAL A NIVEL DE PANTALLA COMPLETA) */}
      {deleteConfirmRut && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">¿Eliminar paciente?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              ¿Está seguro que desea eliminar del registro al paciente con RUT <strong className="text-slate-900">{deleteConfirmRut}</strong>? Esta acción borrará la conservación de datos de este paciente.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmRut(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeletePatient(deleteConfirmRut)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: REGISTRO / NUEVO PACIENTE (PORTAL A NIVEL DE PANTALLA COMPLETA) */}
      {isPatientModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
            {/* Modal Header matching Crear Nueva Ficha Clínica */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-sky-50 via-cyan-50 to-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-sky-700 text-white flex items-center justify-center shadow-sm">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {editingPatient.rut ? 'Ficha de Paciente Registrado' : 'Registrar Nuevo Paciente'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingPatient.rut 
                      ? 'Edita antecedentes y consulta las atenciones clínicas del paciente' 
                      : 'Crea un paciente en la base de datos online para usarlo en cualquier ficha clínica'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPatientModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            {editingPatient.rut && (
              <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 shrink-0 pt-2">
                <button
                  type="button"
                  onClick={() => setPatientModalTab('datos')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer ${
                    patientModalTab === 'datos'
                      ? 'bg-white border-t border-x border-slate-200 text-sky-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  Datos y Antecedentes
                </button>
                <button
                  type="button"
                  onClick={() => setPatientModalTab('fichas')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    patientModalTab === 'fichas'
                      ? 'bg-white border-t border-x border-slate-200 text-sky-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  <span>Fichas Guardadas</span>
                  {(editingPatient.fichasClinicas?.length ?? 0) > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] font-black bg-sky-100 text-sky-700 rounded-full">
                      {editingPatient.fichasClinicas!.length}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Tab: Datos del Paciente (original form) OR Tab: Fichas Guardadas */}
            {patientModalTab === 'datos' || !editingPatient.rut ? (
            <form onSubmit={handleSaveModalPatient} className="flex-1 overflow-y-auto p-6 flex flex-col justify-between text-xs space-y-6 custom-scrollbar">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 items-start">
                
                {/* Columna Izquierda: Datos Personales & Estado */}
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                    <div className="w-2 h-2 rounded-full bg-sky-600"></div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Identificación y Ubicación</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">RUT *</label>
                      <input
                        type="text"
                        required
                        placeholder="12.345.678-9"
                        value={editingPatient.rut || ''}
                        onChange={(e) => setEditingPatient(prev => ({ ...prev, rut: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-bold outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Edad</label>
                      <input
                        type="text"
                        placeholder="Ej: 64"
                        value={editingPatient.edad || ''}
                        onChange={(e) => setEditingPatient(prev => ({ ...prev, edad: e.target.value.replace(/\D/g, '') }))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="NOMBRE COMPLETO"
                      value={editingPatient.nombre || ''}
                      onChange={(e) => setEditingPatient(prev => ({ ...prev, nombre: e.target.value.toUpperCase() }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-extrabold uppercase outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Teléfono</label>
                      <input
                        type="text"
                        placeholder="+56 9 8765 4321"
                        value={editingPatient.telefono || ''}
                        onChange={(e) => setEditingPatient(prev => ({ ...prev, telefono: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Sexo</label>
                      <select
                        value={editingPatient.sexo || 'Masculino'}
                        onChange={(e) => setEditingPatient(prev => ({ ...prev, sexo: e.target.value as any }))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Estratificación ECICEP</label>
                      <select
                        value={editingPatient.estratificacion || 'G0'}
                        onChange={(e) => setEditingPatient(prev => ({ ...prev, estratificacion: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="G0">G0 - Sin riesgo</option>
                        <option value="G1">G1 - Riesgo Bajo</option>
                        <option value="G2">G2 - Riesgo Moderado</option>
                        <option value="G3">G3 - Riesgo Alto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Adherencia Tratamiento</label>
                      <select
                        value={editingPatient.adherenciaTratamiento || 'Sí'}
                        onChange={(e) => setEditingPatient(prev => ({ ...prev, adherenciaTratamiento: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="Sí">Sí</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Alergias Conocidas</label>
                    <input
                      type="text"
                      placeholder="Alergias o 'Niega'..."
                      value={editingPatient.alergias || ''}
                      onChange={(e) => setEditingPatient(prev => ({ ...prev, alergias: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Columna Derecha: Smart Antecedentes & Smart Fármacos */}
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-600"></div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Antecedentes Clínicos y Fármacos</h3>
                  </div>
                  
                  <SmartAntecedentesTextarea
                    label="Antecedentes Personales / Morbilidad"
                    id="modal_antecedentesPersonales"
                    name="modal_antecedentesPersonales"
                    value={editingPatient.antecedentesPersonales || ''}
                    onChange={(val) => setEditingPatient(prev => ({ ...prev, antecedentesPersonales: val, morbilidad: val }))}
                    rows={3}
                    placeholder="Escriba antecedente o morbilidad..."
                  />

                  <SmartFarmacosTextarea
                    label="Fármacos en Uso"
                    id="modal_farmacos"
                    name="modal_farmacos"
                    value={editingPatient.farmacos || ''}
                    onChange={(val) => setEditingPatient(prev => ({ ...prev, farmacos: val }))}
                    rows={4}
                    placeholder="Escriba medicamento o marca comercial..."
                  />
                </div>
              </div>

              {/* Modal Footer matching Crear Nueva Ficha */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPatientModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar en Base de Datos</span>
                </button>
              </div>
            </form>
            ) : (
            /* FICHAS GUARDADAS TAB */
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs">
              {(editingPatient.fichasClinicas?.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-slate-200">
                    <path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zM12 19a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3-10H6V5h9v4z"/>
                  </svg>
                  <p className="font-semibold text-sm">No hay fichas guardadas</p>
                  <p className="text-[11px] text-center max-w-xs">Cuando guarde una ficha clínica desde Ingreso ECICEP u otras fichas, aparecerán aquí.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500 mb-3 font-medium">Fichas guardadas para <strong className="text-slate-800">{editingPatient.nombre}</strong> — ordenadas de más reciente a más antigua:</p>
                  {editingPatient.fichasClinicas!.map((ficha: SavedFichaEntry, idx: number) => (
                    <div key={ficha.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-sky-300 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5 text-sky-500">
                              <path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zM12 19a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3-10H6V5h9v4z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">{ficha.nombreNominal}</span>
                              {idx === 0 && (
                                <span className="px-1.5 py-0.5 text-[9px] font-black bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-wider">
                                  Más reciente
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500">Guardada el: {ficha.fecha}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            #{editingPatient.fichasClinicas!.length - idx}
                          </span>

                          {/* Botón Editar Ficha (Lápiz) */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsPatientModalOpen(false);
                              onSelectMenuItem(editingPatient.viewTarget || 'fichaIngresoEcicep', {
                                ...editingPatient,
                                ...ficha.formDataSnapshot
                              } as PatientRecord);
                            }}
                            title="Editar esta ficha clínica"
                            className="p-1.5 rounded-lg border border-slate-200 text-sky-600 hover:bg-sky-50 hover:border-sky-300 transition-all cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Botón Borrar Ficha (Basurero) */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Está seguro de eliminar la ficha "${ficha.nombreNominal}" del paciente?`)) {
                                const updated = patientStore.deleteFichaFromPatient(editingPatient.rut!, ficha.id);
                                if (updated) {
                                  setEditingPatient(updated);
                                }
                              }
                            }}
                            title="Eliminar esta ficha clínica"
                            className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Preview of key fields from the ficha snapshot */}
                      {ficha.formDataSnapshot && (
                        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                          {([
                            { label: 'Estratificación', key: 'estratificacion' },
                            { label: 'Edad', key: 'edad' },
                            { label: 'Peso', key: 'peso' },
                            { label: 'Talla', key: 'talla' },
                            { label: 'IMC', key: 'imc' },
                            { label: 'PA', key: 'pa' },
                          ] as {label: string, key: string}[]).filter(f => ficha.formDataSnapshot[f.key]).map(f => (
                            <div key={f.key}>
                              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{f.label}</span>
                              <p className="text-[11px] font-semibold text-slate-800 truncate">{String(ficha.formDataSnapshot[f.key])}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-200 mt-4">
                <button
                  type="button"
                  onClick={() => setIsPatientModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: CREAR NUEVA FICHA CLÍNICA (PORTAL A NIVEL DE PANTALLA COMPLETA) */}
      {isNewFichaModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <FilePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Crear Nueva Ficha Clínica</h3>
                  <p className="text-xs text-slate-500">Selecciona el paciente y el tipo de ficha para iniciar la atención</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewFichaModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {/* 1. Seleccionar Paciente */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  1. Paciente a atender <span className="text-slate-400 font-normal lowercase">(opcional - precarga antecedentes del registro online)</span>
                </label>
                <select
                  value={selectedPatientForFicha}
                  onChange={(e) => setSelectedPatientForFicha(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="">-- Sin paciente seleccionado (Iniciar ficha en blanco) --</option>
                  {patients.map(p => (
                    <option key={p.rut} value={p.rut}>
                      {p.nombre} ({p.rut}) {p.edad ? `- ${p.edad} años` : ''} {p.sector ? `[Sector ${p.sector}]` : ''}
                    </option>
                  ))}
                </select>
                {selectedPatientForFicha && (
                  <p className="text-[11px] text-emerald-700 mt-1.5 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Los antecedentes médicos, alergias, fármacos y datos personales de este paciente se cargarán automáticamente en la ficha.
                  </p>
                )}
              </div>

              {/* 2. Seleccionar Tipo de Ficha */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    2. Selecciona la Ficha Clínica o Documento
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Buscador rápido:</span>
                </div>

                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar fichas (ej: ECICEP, Niño sano, Crónico, Receta, Salud mental)..."
                    value={fichaSearchQuery}
                    onChange={(e) => setFichaSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  {fichaSearchQuery && (
                    <button
                      onClick={() => setFichaSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Groups */}
                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                  {CLINICAL_FICHAS_GROUPS.map((group) => {
                    const filteredFichas = group.fichas.filter(f =>
                      f.label.toLowerCase().includes(fichaSearchQuery.toLowerCase()) ||
                      (f.desc && f.desc.toLowerCase().includes(fichaSearchQuery.toLowerCase()))
                    );

                    if (filteredFichas.length === 0) return null;

                    return (
                      <div key={group.group} className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-100 px-3.5 py-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          {group.group}
                        </div>
                        <div className="divide-y divide-slate-100 bg-white">
                          {filteredFichas.map((ficha) => {
                            const isSelected = selectedFichaView === ficha.view;
                            return (
                              <button
                                key={ficha.view}
                                type="button"
                                onClick={() => setSelectedFichaView(ficha.view)}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-50 text-emerald-900 font-bold border-l-4 border-l-emerald-600'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span>{ficha.label}</span>
                                    {isSelected && (
                                      <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[9px] rounded-full uppercase">
                                        Seleccionada
                                      </span>
                                    )}
                                  </div>
                                  {ficha.desc && (
                                    <p className="text-[10px] text-slate-400 font-normal mt-0.5">{ficha.desc}</p>
                                  )}
                                </div>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsNewFichaModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleStartNewFicha}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <FilePlus className="w-4 h-4" />
                <span>Abrir Ficha Clínica</span>
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
