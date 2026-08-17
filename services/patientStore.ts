export interface SavedFichaEntry {
  id: string;
  tipoFicha: string;
  numeroControl?: number;
  nombreNominal: string;
  fecha: string;
  formDataSnapshot: any;
}

export interface PatientRecord {
  id: string;
  rut: string;
  nombre: string; // Stored & displayed in UPPERCASE
  edad: string;
  sexo: 'Masculino' | 'Femenino' | '';
  telefono: string; // e.g., "+56 9 8765 4321"
  sector?: 'Verde' | 'Amarillo' | 'Naranjo';
  fechaUltimaAtencion?: string;
  ultimaPrestacion?: string;
  prestacionCategory?: 'ecicep' | 'pscv' | 'salud_mental' | 'respiratorio' | 'vdi' | 'nino_sano' | 'preingreso' | 'none';

  // Array of individually stored clinical records nominated by control number
  fichasClinicas?: SavedFichaEntry[];

  // Shared Clinical Fields across forms
  anamnesisGeneral?: string;
  antecedentesPersonales?: string;
  morbilidad?: string;
  farmacos?: string;
  adherenciaTratamiento?: string;
  ramFarmacos?: string;
  ramFarmacosAclaracion?: string;
  alergias?: string;
  cirugias?: string;
  hospitalizaciones?: string;
  controlExtrasistema?: string;
  factoresRiesgo?: string[];
  estratificacion?: string;
  duplaProfesional?: string;

  // Habitos
  actividadFisicaHabito?: string;
  actividadFisica?: boolean;
  actividadFisicaAclaracion?: string;
  tabaco?: boolean;
  tabacoAclaracion?: string;
  oh?: boolean;
  ohAclaracion?: string;
  drogas?: boolean;
  drogasAclaracion?: string;
  habitoMiccional?: string;
  habitoDefecatorio?: string;
  actividadSexualProteccion?: string;

  // Atenciones Vigentes
  empam?: string;
  fondoOjo?: string;
  podologo?: string;
  evaluacionPie?: string;
  atencionesPsa?: string;
  vacunas?: string;

  // Gineco-Obstetricia
  antecedentesGineco?: string;
  fum?: string;
  sintomasClimaterio?: string;
  mamografiaDia?: string;
  papVigente?: string;

  // Ánimo & Espiritualidad
  animo_estadoAnimo?: string;
  animo_habitoSueno?: string;
  animo_percepcionSalud?: string;
  animo_ideacionSuicida?: string;
  espiritualidad?: string;

  // Salud Social & Estilo de Vida
  encuestaAlimentaria?: string;
  escolaridad?: string;
  ocupacion?: string;
  antecedentesFamiliaresRelevantes?: string;
  viveCon?: string;
  factoresProtectores?: string;
  estadoCivilHijos?: string;
  redesApoyo?: string;
  percepcionSituacionEconomica?: string;

  // Exámenes & Constantes Vitales / Antropometría
  laboratorio?: string;
  laboratorioFecha?: string;
  electrocardiograma?: string;
  ekgFecha?: string;
  imagenes?: string;
  otrasImagenesFecha?: string;
  peso?: string;
  talla?: string;
  imc?: string;
  pa?: string;
  fc?: string;
  cc?: string;

  // Valoración Integral & Salud Familiar
  integralIndividual?: string;
  integralFamiliar?: string;
  integralTipologia?: string;
  integralCronicas?: string;
}

const STORAGE_KEY = 'portalmedico_patients_v1';

export const INITIAL_PATIENTS: PatientRecord[] = [];

type Listener = (patients: PatientRecord[]) => void;
const listeners: Set<Listener> = new Set();

export const patientStore = {
  getPatients(): PatientRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Remove default mock patients that start with PAT-00
          return parsed.filter(p => p && p.id && !p.id.startsWith('PAT-00'));
        }
      }
    } catch (e) {
      console.error('Error reading patients from localStorage:', e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
    return INITIAL_PATIENTS;
  },

  savePatient(data: Partial<PatientRecord> & { rut: string; nombre?: string }): PatientRecord {
    const list = this.getPatients();
    const cleanRut = data.rut.trim();
    const uppercaseNombre = data.nombre ? data.nombre.toUpperCase().trim() : '';

    const existingIdx = list.findIndex(p => p.rut.toLowerCase() === cleanRut.toLowerCase());

    let updatedPatient: PatientRecord;

    if (existingIdx >= 0) {
      const existing = list[existingIdx];
      updatedPatient = {
        ...existing,
        ...data,
        rut: cleanRut,
        nombre: uppercaseNombre || existing.nombre,
      };
      list[existingIdx] = updatedPatient;
    } else {
      updatedPatient = {
        id: `PAT-${String(Date.now()).slice(-4)}`,
        rut: cleanRut,
        nombre: uppercaseNombre || 'PACIENTE SIN NOMBRE',
        edad: data.edad || '',
        sexo: data.sexo || '',
        telefono: data.telefono || '+56 9 8765 4321',
        fechaUltimaAtencion: data.fechaUltimaAtencion || 'Sin atenciones',
        ultimaPrestacion: data.ultimaPrestacion || 'No registra',
        prestacionCategory: data.prestacionCategory || 'none',
        sector: data.sector || 'Verde',
        estratificacion: data.estratificacion || 'G0',
        ...data
      };
      list.unshift(updatedPatient);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving patient to localStorage:', e);
    }

    this._notify(list);
    return updatedPatient;
  },

  addFichaToPatient(
    rut: string,
    tipoFicha: string,
    formDataSnapshot: any,
    fecha?: string,
    prestacionCategory?: any
  ): { patient: PatientRecord; fichaEntry: SavedFichaEntry } | undefined {
    const patient = this.findPatientByRut(rut);
    if (!patient) return undefined;

    const existingFichas = patient.fichasClinicas || [];
    const cleanTipo = tipoFicha.trim().toLowerCase();

    // Define forms that can only be saved ONCE per patient (unique instance).
    // All other controls can have multiple instances.
    const isSingleInstance = (
      cleanTipo.includes('ingreso ecicep') ||
      cleanTipo.includes('preingreso ecicep') ||
      cleanTipo.includes('control niño sano 1 mes') ||
      cleanTipo.includes('control niño sano 3 mes') ||
      cleanTipo.includes('control niño sano 6 años')
    );

    let updatedFichas: SavedFichaEntry[];
    let targetFichaEntry: SavedFichaEntry;

    const todayStr = fecha || (() => { const d = new Date(); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })();

    if (isSingleInstance) {
      // Find if this single-instance ficha already exists
      const existingIdx = existingFichas.findIndex(f => f.tipoFicha.trim().toLowerCase() === cleanTipo);

      if (existingIdx >= 0) {
        // Overwrite / Update existing ficha entry
        const existingEntry = existingFichas[existingIdx];
        targetFichaEntry = {
          ...existingEntry,
          fecha: todayStr,
          formDataSnapshot
        };
        updatedFichas = [...existingFichas];
        updatedFichas[existingIdx] = targetFichaEntry;
      } else {
        // Create new single-instance ficha entry
        targetFichaEntry = {
          id: `FCH-${Date.now()}`,
          tipoFicha,
          nombreNominal: tipoFicha,
          fecha: todayStr,
          formDataSnapshot
        };
        updatedFichas = [targetFichaEntry, ...existingFichas];
      }
    } else {
      // Multiple instances allowed (e.g. controls)
      const priorControlsOfSameType = existingFichas.filter(f => f.tipoFicha.trim().toLowerCase() === cleanTipo);
      const numeroControl = priorControlsOfSameType.length + 1;
      const nombreNominal = `${tipoFicha} #${numeroControl}`;

      targetFichaEntry = {
        id: `FCH-${Date.now()}`,
        tipoFicha,
        numeroControl,
        nombreNominal,
        fecha: todayStr,
        formDataSnapshot
      };
      updatedFichas = [targetFichaEntry, ...existingFichas];
    }

    const updatedPatient = this.savePatient({
      ...patient,
      fichasClinicas: updatedFichas,
      fechaUltimaAtencion: todayStr,
      ultimaPrestacion: targetFichaEntry.nombreNominal,
      prestacionCategory: prestacionCategory || patient.prestacionCategory || 'ecicep'
    });

    return { patient: updatedPatient, fichaEntry: targetFichaEntry };
  },

  deleteFichaFromPatient(rut: string, fichaId: string): PatientRecord | undefined {
    const patient = this.findPatientByRut(rut);
    if (!patient || !patient.fichasClinicas) return undefined;

    const updatedFichas = patient.fichasClinicas.filter(f => f.id !== fichaId);
    const lastFicha = updatedFichas[0];

    const updatedPatient = this.savePatient({
      ...patient,
      fichasClinicas: updatedFichas,
      fechaUltimaAtencion: lastFicha ? lastFicha.fecha : 'Sin atenciones',
      ultimaPrestacion: lastFicha ? lastFicha.nombreNominal : 'No registra',
    });

    return updatedPatient;
  },

  deletePatient(rut: string): void {
    const list = this.getPatients().filter(p => p.rut.toLowerCase() !== rut.trim().toLowerCase());
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error deleting patient from localStorage:', e);
    }
    this._notify(list);
  },

  findPatientByRut(rut: string): PatientRecord | undefined {
    if (!rut || !rut.trim()) return undefined;
    const cleanRut = rut.trim().toLowerCase();
    return this.getPatients().find(p => p.rut.toLowerCase() === cleanRut);
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  _notify(list: PatientRecord[]) {
    listeners.forEach(l => l(list));
  }
};
