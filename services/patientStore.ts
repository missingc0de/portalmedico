import { getChileDDMMYYYY } from './dateService';
import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';

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
export const PATIENTS_COLLECTION = 'patients';

export const INITIAL_PATIENTS: PatientRecord[] = [];

type Listener = (patients: PatientRecord[]) => void;
const listeners: Set<Listener> = new Set();

// In-memory cache synced with Firestore and backed by localStorage
let memoryPatientsCache: PatientRecord[] = [];

// Helper to sanitize document ID from RUT (e.g. 12.345.678-9 -> 12345678-9)
export const sanitizeRutForDocId = (rut: string): string => {
  return rut.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'unknown';
};

// Function to clean undefined fields before sending to Firestore
const sanitizeForFirestore = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      cleaned[key] = sanitizeForFirestore(val);
    }
  }
  return cleaned;
};

// Start Firestore real-time listener
let isListenerInitialized = false;
const initCloudListener = () => {
  if (isListenerInitialized) return;
  isListenerInitialized = true;

  try {
    const colRef = collection(db, PATIENTS_COLLECTION);
    onSnapshot(colRef, (snapshot) => {
      const cloudList: PatientRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as PatientRecord;
        if (data && data.rut) {
          cloudList.push(data);
        }
      });

      // Sort by latest attention or ID
      cloudList.sort((a, b) => (b.id || '').localeCompare(a.id || ''));

      // If cloud has documents, update cache and localStorage
      if (cloudList.length > 0) {
        memoryPatientsCache = cloudList;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudList));
        } catch (e) {
          console.error('Error saving patients backup to localStorage:', e);
        }
        patientStore._notify(cloudList);
      } else {
        // If cloud is empty but local has data, upload local data to cloud
        const local = patientStore.getLocalBackup();
        if (local.length > 0) {
          local.forEach(p => {
            patientStore.uploadToCloud(p).catch(err => console.error('Error syncing local patient to cloud:', err));
          });
        }
      }
    }, (error) => {
      console.warn("Firestore patient listener warning (using local fallback):", error);
    });
  } catch (err) {
    console.error("Failed to initialize Firestore patient listener:", err);
  }
};

export const patientStore = {
  getLocalBackup(): PatientRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(p => p && p.id && !p.id.startsWith('PAT-00'));
        }
      }
    } catch (e) {
      console.error('Error reading patients from localStorage:', e);
    }
    return [];
  },

  getPatients(): PatientRecord[] {
    initCloudListener();
    if (memoryPatientsCache.length > 0) {
      return memoryPatientsCache;
    }
    const local = this.getLocalBackup();
    memoryPatientsCache = local;
    return local;
  },

  async uploadToCloud(patient: PatientRecord): Promise<void> {
    try {
      const docId = sanitizeRutForDocId(patient.rut);
      const docRef = doc(db, PATIENTS_COLLECTION, docId);
      const cleanData = sanitizeForFirestore(patient);
      await setDoc(docRef, cleanData, { merge: true });
    } catch (e) {
      console.error('Error uploading patient to Firestore:', e);
    }
  },

  savePatient(data: Partial<PatientRecord> & { rut: string; nombre?: string }): PatientRecord {
    initCloudListener();
    const list = [...this.getPatients()];
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

    memoryPatientsCache = list;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving patient to localStorage:', e);
    }

    this._notify(list);

    // Save to Firestore Online Cloud
    this.uploadToCloud(updatedPatient);

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
    const isSingleInstance = (
      cleanTipo.includes('ingreso ecicep') ||
      cleanTipo.includes('preingreso ecicep') ||
      cleanTipo.includes('control niño sano 1 mes') ||
      cleanTipo.includes('control niño sano 3 mes') ||
      cleanTipo.includes('control niño sano 6 años')
    );

    let updatedFichas: SavedFichaEntry[];
    let targetFichaEntry: SavedFichaEntry;

    const todayStr = fecha || getChileDDMMYYYY();

    if (isSingleInstance) {
      const existingIdx = existingFichas.findIndex(f => f.tipoFicha.trim().toLowerCase() === cleanTipo);

      if (existingIdx >= 0) {
        const existingEntry = existingFichas[existingIdx];
        targetFichaEntry = {
          ...existingEntry,
          fecha: todayStr,
          formDataSnapshot
        };
        updatedFichas = [...existingFichas];
        updatedFichas[existingIdx] = targetFichaEntry;
      } else {
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
    initCloudListener();
    const cleanRut = rut.trim().toLowerCase();
    const list = this.getPatients().filter(p => p.rut.toLowerCase() !== cleanRut);
    memoryPatientsCache = list;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error deleting patient from localStorage:', e);
    }
    this._notify(list);

    // Delete from Firestore Online Cloud
    try {
      const docId = sanitizeRutForDocId(rut);
      const docRef = doc(db, PATIENTS_COLLECTION, docId);
      deleteDoc(docRef).catch(err => console.error("Error deleting doc in Firestore:", err));
    } catch (e) {
      console.error("Error calling deleteDoc:", e);
    }
  },

  findPatientByRut(rut: string): PatientRecord | undefined {
    if (!rut || !rut.trim()) return undefined;
    const cleanRut = rut.trim().toLowerCase();
    return this.getPatients().find(p => p.rut.toLowerCase() === cleanRut);
  },

  subscribe(listener: Listener): () => void {
    initCloudListener();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  _notify(list: PatientRecord[]) {
    listeners.forEach(l => l(list));
  }
};
