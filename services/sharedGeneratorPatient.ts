export interface SharedGeneratorPatientData {
  nombrePaciente?: string;
  rutPaciente?: string;
  direccion?: string;
  diagnostico?: string;
  fechaNacimiento?: string;
  edad?: string;
}

const STORAGE_KEY = 'local_sharedGeneratorPatient';
const EVENT_NAME = 'shared_generator_patient_update';

export function getSharedGeneratorPatient(): SharedGeneratorPatientData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setSharedGeneratorPatient(update: Partial<SharedGeneratorPatientData>): SharedGeneratorPatientData {
  try {
    const current = getSharedGeneratorPatient();
    // Only update if there are actual changes
    let hasChanges = false;
    const next = { ...current };
    (Object.keys(update) as Array<keyof SharedGeneratorPatientData>).forEach(key => {
      if (update[key] !== undefined && update[key] !== current[key]) {
        next[key] = update[key];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
    }
    return next;
  } catch {
    return {};
  }
}

export function clearSharedGeneratorPatient(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: {} }));
  } catch {}
}

export function subscribeSharedGeneratorPatient(callback: (data: SharedGeneratorPatientData) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<SharedGeneratorPatientData>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
