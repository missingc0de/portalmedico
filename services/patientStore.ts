import { getChileDDMMYYYY, getChileDateTime } from './dateService';
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
  fechaCreacion?: string;
  tipoFicha?: string;
  
  // TRES BLOQUES CLÍNICOS
  anamnesis?: string;
  exploracion?: string;
  actuacion?: string;

  edad?: string;
  sexo?: 'Masculino' | 'Femenino' | '';
  telefono?: string; // e.g., "+56 9 8765 4321"
  sector?: 'Verde' | 'Amarillo' | 'Naranjo';
  fechaUltimaAtencion?: string;
  ultimaPrestacion?: string;
  prestacionCategory?: 'ecicep' | 'pscv' | 'salud_mental' | 'respiratorio' | 'vdi' | 'nino_sano' | 'preingreso' | 'none';

  // Array of individually stored clinical records nominated by control number
  fichasClinicas?: SavedFichaEntry[];
  formDataSnapshot?: any;

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
  delirios?: string;
  dolor?: string;
  espiritualidad?: string;

  // Salud Social & Estilo de Vida
  encuestaAlimentaria?: string;
  pautaAlimentariaId?: string;
  pautaAlimentariaNombre?: string;
  pautaAlimentariaFavorecer?: string;
  pautaAlimentariaEvitar?: string;
  pautaAlimentariaRecomendaciones?: string;
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
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined && typeof val !== 'function') {
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
        if (data && (data.rut || data.nombre)) {
          const id = data.id || docSnap.id;

          let anamnesis = data.anamnesis || '';
          let exploracion = data.exploracion || '';
          let actuacion = data.actuacion || '';

          if (!anamnesis && !exploracion && !actuacion && data.anamnesisGeneral) {
            const raw = data.anamnesisGeneral;
            if (raw.includes('ANAMNESIS:') || raw.includes('EXPLORACIÓN:') || raw.includes('ACTUACIÓN:')) {
              const p1 = raw.indexOf('ANAMNESIS:');
              const p2 = raw.indexOf('EXPLORACIÓN:');
              const p3 = raw.indexOf('ACTUACIÓN:');
              if (p1 !== -1 && p2 !== -1 && p3 !== -1) {
                anamnesis = raw.slice(p1 + 10, p2).trim();
                exploracion = raw.slice(p2 + 12, p3).trim();
                actuacion = raw.slice(p3 + 10).trim();
              } else {
                anamnesis = raw;
              }
            } else {
              anamnesis = raw;
            }
          }

          cloudList.push({
            ...data,
            id,
            nombre: data.nombre ? data.nombre.toUpperCase().trim() : 'PACIENTE SIN NOMBRE',
            rut: (data.rut || '').trim(),
            fechaCreacion: data.fechaCreacion || data.fechaUltimaAtencion || 'Sin fecha',
            tipoFicha: data.tipoFicha || data.ultimaPrestacion || 'Ficha Clínica',
            anamnesis,
            exploracion,
            actuacion,
          });
        }
      });

      // Sort by creation date or ID descending
      cloudList.sort((a, b) => (b.fechaCreacion || b.id || '').localeCompare(a.fechaCreacion || a.id || ''));

      if (cloudList.length > 0) {
        memoryPatientsCache = cloudList;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudList));
        } catch (e) {
          console.error('Error saving patients backup to localStorage:', e);
        }
        patientStore._notify(cloudList);
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

  async uploadToCloud(record: PatientRecord): Promise<void> {
    try {
      const docId = record.id;
      const docRef = doc(db, PATIENTS_COLLECTION, docId);
      const cleanData = sanitizeForFirestore(record);
      await setDoc(docRef, cleanData, { merge: true });
    } catch (e) {
      console.error('Error uploading patient record to Firestore:', e);
    }
  },

  savePatient(data: Partial<PatientRecord> & { rut: string; nombre?: string }): PatientRecord {
    initCloudListener();
    const list = [...this.getPatients()];
    const cleanRut = (data.rut || '').trim();
    const uppercaseNombre = data.nombre ? data.nombre.toUpperCase().trim() : 'PACIENTE SIN NOMBRE';
    const recordId = data.id || `REG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fechaCreacion = data.fechaCreacion || data.fechaUltimaAtencion || getChileDateTime();

    const existingIdx = list.findIndex(p => p.id === recordId);

    let updatedRecord: PatientRecord;

    if (existingIdx >= 0) {
      const existing = list[existingIdx];
      updatedRecord = {
        ...existing,
        ...data,
        id: recordId,
        rut: cleanRut || existing.rut,
        nombre: uppercaseNombre || existing.nombre,
        fechaCreacion: existing.fechaCreacion || fechaCreacion,
        fechaUltimaAtencion: fechaCreacion,
        tipoFicha: data.tipoFicha || existing.tipoFicha || data.ultimaPrestacion || existing.ultimaPrestacion || 'Ficha Clínica',
        ultimaPrestacion: data.tipoFicha || existing.tipoFicha || data.ultimaPrestacion || existing.ultimaPrestacion || 'Ficha Clínica',
        anamnesis: data.anamnesis !== undefined ? data.anamnesis : (existing.anamnesis ?? ''),
        exploracion: data.exploracion !== undefined ? data.exploracion : (existing.exploracion ?? ''),
        actuacion: data.actuacion !== undefined ? data.actuacion : (existing.actuacion ?? ''),
      };
      list[existingIdx] = updatedRecord;
    } else {
      updatedRecord = {
        id: recordId,
        rut: cleanRut,
        nombre: uppercaseNombre,
        fechaCreacion: fechaCreacion,
        fechaUltimaAtencion: fechaCreacion,
        tipoFicha: data.tipoFicha || data.ultimaPrestacion || 'Ficha Clínica',
        ultimaPrestacion: data.tipoFicha || data.ultimaPrestacion || 'Ficha Clínica',
        anamnesis: data.anamnesis ?? '',
        exploracion: data.exploracion ?? '',
        actuacion: data.actuacion ?? '',
        edad: data.edad || '',
        sexo: data.sexo || 'Masculino',
        telefono: data.telefono || '+56 9 ',
        sector: data.sector || 'Verde',
        prestacionCategory: data.prestacionCategory || 'none',
        estratificacion: data.estratificacion || 'G0',
        ...data
      };
      list.unshift(updatedRecord);
    }

    memoryPatientsCache = list;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving patient to localStorage:', e);
    }

    this._notify(list);

    // Save to Firestore Online Cloud
    this.uploadToCloud(updatedRecord);

    return updatedRecord;
  },

  addFichaToPatient(
    rut: string,
    tipoFicha: string,
    formDataSnapshot: any,
    fecha?: string,
    prestacionCategory?: any
  ): { patient: PatientRecord; fichaEntry: SavedFichaEntry } | undefined {
    const existing = this.findPatientByRut(rut);
    const nombre = existing?.nombre || 'PACIENTE';
    const fechaCreacion = fecha || getChileDateTime();
    const newId = `REG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    let anamnesis = formDataSnapshot?.anamnesis || formDataSnapshot?.anamnesisGeneral || '';
    let exploracion = formDataSnapshot?.exploracion || '';
    let actuacion = formDataSnapshot?.actuacion || '';

    if (!anamnesis && !exploracion && !actuacion && formDataSnapshot?.anamnesisGeneral) {
      const raw = formDataSnapshot.anamnesisGeneral;
      if (raw.includes('ANAMNESIS:') || raw.includes('EXPLORACIÓN:') || raw.includes('ACTUACIÓN:')) {
        const p1 = raw.indexOf('ANAMNESIS:');
        const p2 = raw.indexOf('EXPLORACIÓN:');
        const p3 = raw.indexOf('ACTUACIÓN:');
        if (p1 !== -1 && p2 !== -1 && p3 !== -1) {
          anamnesis = raw.slice(p1 + 10, p2).trim();
          exploracion = raw.slice(p2 + 12, p3).trim();
          actuacion = raw.slice(p3 + 10).trim();
        } else {
          anamnesis = raw;
        }
      }
    }

    const newRecord = this.savePatient({
      id: newId,
      rut: rut.trim(),
      nombre: nombre.toUpperCase().trim(),
      fechaCreacion: fechaCreacion,
      fechaUltimaAtencion: fechaCreacion,
      tipoFicha: tipoFicha.trim(),
      ultimaPrestacion: tipoFicha.trim(),
      prestacionCategory: prestacionCategory || existing?.prestacionCategory || 'none',
      anamnesis,
      exploracion,
      actuacion,
      formDataSnapshot,
    });

    const fichaEntry: SavedFichaEntry = {
      id: newId,
      tipoFicha: tipoFicha.trim(),
      nombreNominal: tipoFicha.trim(),
      fecha: fechaCreacion,
      formDataSnapshot,
    };

    return { patient: newRecord, fichaEntry };
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

  deletePatient(idOrRut: string): void {
    initCloudListener();
    const clean = idOrRut.trim();
    const list = this.getPatients().filter(p => p.id !== clean && p.rut.toLowerCase() !== clean.toLowerCase());
    memoryPatientsCache = list;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error deleting patient from localStorage:', e);
    }
    this._notify(list);

    // Delete from Firestore Online Cloud
    try {
      const docRef = doc(db, PATIENTS_COLLECTION, clean);
      deleteDoc(docRef).catch(err => console.error("Error deleting doc in Firestore:", err));
      if (clean.includes('-') || clean.length < 15) {
        const legacyDocRef = doc(db, PATIENTS_COLLECTION, sanitizeRutForDocId(clean));
        deleteDoc(legacyDocRef).catch(() => {});
      }
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
