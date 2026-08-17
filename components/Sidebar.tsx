import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Home,
  ClipboardList,
  Activity,
  FileText,
  Calculator,
  Wrench,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  LogOut,
  Copy,
  Check,
  Globe,
  X,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Stethoscope,
  Brain,
  Wind,
  Baby,
  Home as HomeIcon,
  User,
  Printer,
  Award,
  Syringe,
  Eye,
  Monitor,
  Scale,
  Pill,
  Shield,
  ShoppingBag,
  HardDrive,
  FileCheck,
  CheckSquare,
  Users,
  Hospital
} from 'lucide-react';
import { View, Profession, User as UserType } from '../types';

interface SidebarProps {
  loggedInUser: UserType;
  onSelectMenuItem: (view: View) => void;
  onOpenRem?: () => void;
  profilePictureUrl?: string;
  profileName?: string;
  onEditProfile: () => void;
  onLogout: () => void;
  computerSector?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentView?: View;
}

interface MenuItem {
  id: string;
  label: string;
  view?: View;
  icon: React.ComponentType<any>;
  isExternalLink?: boolean;
  externalLinkId?: string;
}

interface SubGroup {
  id: string;
  label: string;
  items: MenuItem[];
}

interface MenuCategory {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  subGroups?: SubGroup[];
  items?: MenuItem[];
}

const EXTERNAL_LINKS_DATA = {
  cyb: {
    title: 'LABORATORIO CYB',
    description: 'Exámenes desde mayo de 2025 en adelante.',
    url: 'http://mvlabcyb.sistemadecontrol.cl:8080/LoginConveniosX.aspx',
    user: 'csanjuan',
    pass: 'csanjuan',
  },
  imagensalud: {
    title: 'IMAGENSALUD',
    description: 'Exámenes desde mayo 2025 hacia atrás.',
    url: 'https://resultados.laboratorioimagensalud.cl/Convenios.aspx',
    user: 'CMC SAN JUAN',
    pass: 'JUAN2023',
  },
  hcoquimbo: {
    title: 'IMÁGENES HSP COQUIMBO',
    description: 'Estudios por imágenes en Hospital San Pablo.',
    url: 'https://sscssl.synapsetimed.cl/Synapse',
    user: 'clinicoser',
    pass: 'Hospital123',
  },
  sartb: {
    title: 'SAR TIERRAS BLANCAS',
    description: 'Radiografías tomadas en SAR.',
    url: 'https://ris.chile.telemedicina.com/',
    user: 'sar.tierrasbl',
    pass: 'Informes2!',
  },
};

const DRIVE_LINKS: Record<string, string> = {
  'Verde': 'https://docs.google.com/spreadsheets/d/1T9a8Z85iIvjZU1mq2wbGPTgrJo48e-CdkP95p5d0lSE/edit?gid=0#gid=0',
  'Naranjo': 'https://docs.google.com/spreadsheets/d/17cNcOTdn8qupYchtc10ouMG45ve_BpaZZmTGEdos-4Q/edit?gid=152571995#gid=152571995',
  'Amarillo': 'https://docs.google.com/spreadsheets/d/1paEDMTrLz2Ig_jpayPoc1z1GsnJTfSAR/edit?gid=1909397780#gid=1909397780',
};

const getPrefix = (profession: Profession): string => {
  switch (profession) {
    case 'medicina': return 'Dr. ';
    case 'nutricion': return 'Nta. ';
    case 'psicologia': return 'Ps. ';
    case 'enfermeria': return 'Enf. ';
    case 'tens': return 'TENS. ';
    case 'asistente_social': return 'TS. ';
    case 'quimico_farmaceutico': return 'QF. ';
    case 'odontologia': return 'OD. ';
    case 'kinesiologo': return 'Kn. ';
    case 'matroneria': return 'Mat. ';
    default: return '';
  }
};

const Sidebar: React.FC<SidebarProps> = ({
  loggedInUser,
  onSelectMenuItem,
  onOpenRem,
  profilePictureUrl,
  profileName,
  onEditProfile,
  onLogout,
  computerSector,
  isCollapsed,
  onToggleCollapse,
  currentView,
}) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    fichas_clinicas: true,
    hospital: false,
    docs: false,
    calcs: false,
    specials: false,
    externals: false,
  });

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeModalLink, setActiveModalLink] = useState<keyof typeof EXTERNAL_LINKS_DATA | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleCategory = (categoryId: string) => {
    if (isCollapsed) {
      onToggleCollapse();
      setOpenCategories(prev => ({ ...prev, [categoryId]: true }));
    } else {
      setOpenCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExternalLinkClick = (linkId: string) => {
    if (linkId === 'drive') {
      const sector = loggedInUser?.sector || computerSector || '';
      const driveUrl = DRIVE_LINKS[sector] || 'https://drive.google.com/';
      window.open(driveUrl, '_blank');
    } else {
      setActiveModalLink(linkId as keyof typeof EXTERNAL_LINKS_DATA);
    }
  };

  // Menu categories formatted with FICHAS CLÍNICAS containing ECICEP, Crónico, etc.
  const menuCategories = useMemo<MenuCategory[]>(() => {
    const categories: MenuCategory[] = [
      {
        id: 'fichas_clinicas',
        label: 'Fichas clínicas',
        icon: ClipboardList,
        subGroups: [
          {
            id: 'ecicep',
            label: 'ECICEP',
            items: [
              { id: 'preingreso', label: 'Preingreso ECICEP', view: 'fichaPreingresoEcicep', icon: FileCheck },
              { id: 'ingreso', label: 'Ingreso ECICEP', view: 'fichaIngresoEcicep', icon: ClipboardList },
              { id: 'control_ecicep', label: 'Control ECICEP', view: 'fichaControlEcicepNuevo', icon: CheckSquare },
              { id: 'seguimiento', label: 'Seguimiento ECICEP', view: 'fichaSeguimientoEcicep', icon: Activity },
            ],
          },
          {
            id: 'cronico',
            label: 'Control Crónico',
            items: [
              { id: 'control_cronico', label: 'Control Crónico', view: 'fichaControlPscv', icon: HeartPulse },
            ],
          },
          {
            id: 'salud_mental',
            label: 'Salud Mental',
            items: [
              { id: 'sm_control', label: 'Control Salud Mental', view: 'fichaControlSm', icon: Brain },
              { id: 'pasmi', label: 'Consulta PASMI', view: 'fichaConsultaPasmi', icon: HeartPulse },
            ],
          },
          {
            id: 'respiratorio',
            label: 'Respiratorio',
            items: [
              { id: 'ira_era', label: 'Control IRA/ERA', view: 'fichaControlSalaEra', icon: Wind },
            ],
          },
          {
            id: 'nino_sano',
            label: 'Niño Sano (Médico)',
            items: [
              { id: 'nino_sano_1m', label: 'Control Niño Sano 1° Mes', view: 'fichaControlNinoSano1Mes', icon: Baby },
              { id: 'nino_sano_3m', label: 'Control Niño Sano 3° Mes', view: 'fichaControlNinoSano3Mes', icon: Baby },
              { id: 'nino_sano_6a', label: 'Control Niño Sano 6 Años', view: 'fichaControlNinoSano6Anos', icon: Baby },
            ],
          },
          {
            id: 'vdi',
            label: 'Visita Domiciliaria',
            items: [
              { id: 'vdi_item', label: 'Visita Domiciliaria', view: 'fichaVisitaDomiciliaria', icon: HomeIcon },
            ],
          },
          {
            id: 'enfermeria',
            label: 'Enfermería',
            items: [
              { id: 'nino_sano_gen', label: 'Control Niño Sano (General)', view: 'fichaControlNinoSano', icon: Baby },
              { id: 'cv_enf', label: 'Control Cardiovascular (Enf)', view: 'fichaControlCardiovascular', icon: HeartPulse },
              { id: 'am_enf', label: 'Control Adulto Mayor (Enf)', view: 'fichaControlAdultoMayor', icon: Stethoscope },
            ],
          },
          {
            id: 'abreviadas',
            label: 'Abreviadas',
            items: [
              { id: 'fondo_ojo', label: 'Fondo de Ojo', view: 'fichaFondoOjo', icon: Eye },
            ],
          },
        ],
      },
      {
        id: 'hospital',
        label: 'Hospital digital',
        icon: Monitor,
        items: [
          { id: 'hd_derm', label: 'Dermatología', view: 'hdDermatologia', icon: Monitor },
          { id: 'hd_diab', label: 'Diabetes', view: 'hdDiabetes', icon: Activity },
          { id: 'hd_endo', label: 'Endocrinología', view: 'hdEndocrinologia', icon: Activity },
          { id: 'hd_geri', label: 'Geriatría', view: 'hdGeriatria', icon: Stethoscope },
          { id: 'hd_reum', label: 'Reumatología', view: 'hdReumatologia', icon: Activity },
        ],
      },
      {
        id: 'docs',
        label: 'Documentos',
        icon: FileText,
        items: [
          { id: 'lab_order', label: 'Orden de Laboratorio', view: 'ordenLaboratorio', icon: FileText },
          { id: 'receta', label: 'Receta Médica', view: 'recetaMedica', icon: Printer },
          { id: 'cert_med', label: 'Certificado Médico', view: 'certificadoMedico', icon: Award },
          { id: 'consultoria', label: 'Ficha de Consultoría', view: 'fichaConsultoria', icon: FileText },
          { id: 'ges_firm', label: 'Firmar GES', view: 'fichaFirmarGes', icon: FileCheck },
        ],
      },
      {
        id: 'calcs',
        label: 'Calculadoras',
        icon: Calculator,
        items: [
          { id: 'milk_calc', label: 'Cálculo de Leches', view: 'calculoLeches', icon: Calculator },
          { id: 'curves', label: 'Curvas de Crecimiento', view: 'curvasCrecimiento', icon: Scale },
          { id: 'food_table', label: 'Tabla Composición Alimentos', view: 'tablaComposicionAlimentos', icon: FileText },
          { id: 'ped_dose', label: 'Dosis en Pediatría', view: 'dosisPediatria', icon: Pill },
          { id: 'erc_adj', label: 'Ajuste de Dosis en ERC', view: 'ajusteDosisErc', icon: Pill },
        ],
      },
      {
        id: 'specials',
        label: 'Herramientas',
        icon: Wrench,
        items: [
          { id: 'diabetes_group', label: 'Grupal de Diabetes', view: 'grupalDiabetesManager', icon: Shield },
          { id: 'pharmacy', label: 'Farmacia', view: 'arsenalFarmacologico', icon: ShoppingBag },
        ],
      },
      {
        id: 'externals',
        label: 'Enlaces externos',
        icon: ExternalLink,
        items: [
          { id: 'ext_cyb', label: 'Laboratorio CYB', isExternalLink: true, externalLinkId: 'cyb', icon: Globe },
          { id: 'ext_imagensalud', label: 'Imagensalud', isExternalLink: true, externalLinkId: 'imagensalud', icon: Globe },
          { id: 'ext_hcoquimbo', label: 'Imágenes HSP Coquimbo', isExternalLink: true, externalLinkId: 'hcoquimbo', icon: ExternalLink },
          { id: 'ext_sartb', label: 'SAR Tierras Blancas', isExternalLink: true, externalLinkId: 'sartb', icon: ExternalLink },
          { id: 'ext_drive', label: 'Drive ECICEP', isExternalLink: true, externalLinkId: 'drive', icon: HardDrive },
        ],
      },
    ];

    if (onOpenRem) {
      const specialsCategory = categories.find(c => c.id === 'specials');
      if (specialsCategory && specialsCategory.items) {
        specialsCategory.items.push({
          id: 'rem_calc',
          label: 'Calcular REM',
          view: 'hojaDiariaRem',
          icon: Calculator,
        });
      }
    }

    return categories;
  }, [onOpenRem]);

  const activeModalData = activeModalLink ? EXTERNAL_LINKS_DATA[activeModalLink] : null;

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateTimeHeader = useMemo(() => {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  }, [now]);

  return (
    <aside
      className={`h-[calc(100vh-48px)] sticky top-12 bg-[#f8fafc] border-r border-slate-200/90 text-slate-800 shrink-0 flex flex-col select-none transition-all duration-300 ease-in-out z-40 font-sans ${isCollapsed ? 'w-16' : 'w-[260px]'
        }`}
    >

      {/* Main Content List matching the requested screenshot layout */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">

        {/* Top Direct Items: Home, Mis Pacientes & SAPU */}
        <div className="space-y-1">
          <button
            onClick={() => onSelectMenuItem('menu')}
            className={`w-full flex items-center justify-between px-2.5 py-2 text-left font-bold text-xs tracking-tight transition-all duration-150 cursor-pointer group rounded-xl ${currentView === 'menu'
              ? 'bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Home className={`w-4 h-4 shrink-0 ${currentView === 'menu' ? 'text-white' : 'text-slate-500 group-hover:text-sky-600'}`} />
              {!isCollapsed && <span className="truncate">Inicio</span>}
            </div>
          </button>

          <button
            onClick={() => onSelectMenuItem('misPacientes')}
            className={`w-full flex items-center justify-between px-2.5 py-2 text-left font-bold text-xs tracking-tight transition-all duration-150 cursor-pointer group rounded-xl ${currentView === 'misPacientes'
              ? 'bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            title="Mis pacientes"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Users className={`w-4 h-4 shrink-0 ${currentView === 'misPacientes' ? 'text-white' : 'text-slate-500 group-hover:text-sky-600'}`} />
              {!isCollapsed && <span className="truncate">Mis pacientes</span>}
            </div>
          </button>

          <button
            onClick={() => onSelectMenuItem('sapu')}
            className={`w-full flex items-center justify-between px-2.5 py-2 text-left font-bold text-xs tracking-tight transition-all duration-150 cursor-pointer group rounded-xl ${currentView === 'sapu'
              ? 'bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            title="SAPU"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Hospital className={`w-4 h-4 shrink-0 ${currentView === 'sapu' ? 'text-white' : 'text-slate-500 group-hover:text-sky-600'}`} />
              {!isCollapsed && <span className="truncate">SAPU</span>}
            </div>
          </button>
        </div>

        {/* Section Accordions */}
        <div className="space-y-4">
          {menuCategories.map(cat => {
            const isOpen = openCategories[cat.id];
            const CatIcon = cat.icon;

            if (isCollapsed) {
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl hover:bg-slate-200/60 text-slate-700 transition-colors cursor-pointer"
                  title={cat.label}
                >
                  <CatIcon className="w-4 h-4 text-sky-600" />
                </button>
              );
            }

            return (
              <div key={cat.id} className="space-y-1.5">

                {/* Category Header with Category Icon */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-left text-slate-600 font-bold text-xs tracking-tight hover:text-slate-900 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CatIcon className="w-4 h-4 text-slate-500 group-hover:text-sky-600 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                  )}
                </button>

                {/* Sub Items or Sub Groups */}
                {isOpen && (
                  <div className="space-y-2 pt-0.5 pl-2">

                    {/* Render SubGroups if present (e.g. inside FICHAS CLÍNICAS) */}
                    {cat.subGroups && cat.subGroups.map(sub => (
                      <div key={sub.id} className="space-y-1">
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 pt-1">
                          {sub.label}
                        </div>
                        <div className="space-y-0.5">
                          {sub.items.map(item => {
                            const isSelectedItem = currentView === item.view;
                            const ItemIcon = item.icon;

                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  if (item.view) onSelectMenuItem(item.view);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${isSelectedItem
                                  ? 'bg-gradient-to-r from-sky-600 to-sky-700 text-white font-bold shadow-sm'
                                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                                  }`}
                              >
                                <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${isSelectedItem ? 'text-white' : 'text-slate-500'}`} />
                                <span className="truncate">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Render Direct Items if no subGroups */}
                    {cat.items && cat.items.map(item => {
                      const isSelectedItem = currentView === item.view;
                      const ItemIcon = item.icon;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.isExternalLink && item.externalLinkId) {
                              handleExternalLinkClick(item.externalLinkId);
                            } else if (item.view === 'hojaDiariaRem' && onOpenRem) {
                              onOpenRem();
                            } else if (item.view) {
                              onSelectMenuItem(item.view);
                            }
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${isSelectedItem
                            ? 'bg-gradient-to-r from-sky-600 to-sky-700 text-white font-bold shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                            }`}
                        >
                          <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${isSelectedItem ? 'text-white' : 'text-slate-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}

                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Bottom Corner User Profile Footer */}
      <div className="w-full px-3.5 py-3 border-t border-slate-200 bg-[#f8fafc] shrink-0 mt-auto relative" ref={dropdownRef}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-[2.5px] rounded-full animate-color-fluctuate shrink-0 shadow-sm">
                <div className="p-[2px] rounded-full bg-[#f8fafc]">
                  {profilePictureUrl ? (
                    <img
                      src={profilePictureUrl}
                      className="w-8 h-8 rounded-full object-cover block"
                      alt="Avatar"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center uppercase">
                      {(profileName || loggedInUser?.fullName || 'U').charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {getPrefix(loggedInUser?.profession || 'medicina')}{profileName || loggedInUser?.fullName || 'Usuario'}
                </span>
                <span className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                  {loggedInUser?.cesfam === 'CESFAM San Juan' ? 'CESFAM San Juan' : (loggedInUser?.cesfam || '')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="p-1 hover:bg-slate-200/60 rounded-md text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
              title="Opciones de cuenta"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="p-[2.5px] rounded-full animate-color-fluctuate hover:ring-2 hover:ring-sky-500 transition-all cursor-pointer shadow-sm"
              title="Opciones de cuenta"
            >
              <div className="p-[2px] rounded-full bg-[#f8fafc]">
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    className="w-8 h-8 rounded-full object-cover block"
                    alt="Avatar"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center uppercase">
                    {(profileName || loggedInUser?.fullName || 'U').charAt(0)}
                  </div>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Float Dropdown Menu */}
        {isProfileDropdownOpen && (
          <div className={`absolute bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn font-semibold text-xs text-slate-700 ${isCollapsed ? 'left-2' : 'left-2'
            }`}>
            <button
              onClick={() => {
                onEditProfile();
                setIsProfileDropdownOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Editar Perfil</span>
            </button>
            <div className="border-t border-slate-150 my-1"></div>
            <button
              onClick={() => {
                onLogout();
                setIsProfileDropdownOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>

      {/* External Link credentials Modal */}
      {activeModalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] animate-fadeIn font-sans">
          <div className="bg-white text-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">

            {/* Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-800">
                <Globe className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-sm tracking-wide">{activeModalData.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalLink(null)}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-normal font-medium">
                {activeModalData.description}
              </p>

              <div className="space-y-3.5">
                {/* Usuario */}
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-600 font-semibold">USUARIO: <code className="ml-1 text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold lowercase">{activeModalData.user}</code></span>
                  <button
                    onClick={() => copyToClipboard(activeModalData.user, 'user')}
                    className="p-1 hover:bg-slate-200 text-slate-500 hover:text-sky-600 rounded transition-colors cursor-pointer"
                    title="Copiar usuario"
                  >
                    {copiedField === 'user' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Contraseña */}
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-600 font-semibold">CONTRASEÑA: <code className="ml-1 text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold lowercase">{activeModalData.pass}</code></span>
                  <button
                    onClick={() => copyToClipboard(activeModalData.pass, 'pass')}
                    className="p-1 hover:bg-slate-200 text-slate-500 hover:text-sky-600 rounded transition-colors cursor-pointer"
                    title="Copiar contraseña"
                  >
                    {copiedField === 'pass' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setActiveModalLink(null)}
                  className="flex-1 py-2 px-4 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  Cerrar
                </button>
                <a
                  href={activeModalData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Abrir enlace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background-color: transparent; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-scaleUp {
          animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

    </aside>
  );
};

export default Sidebar;
