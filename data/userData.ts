
import { User, OnCallSchedule, Profession, CESFAM, Sector } from '../types';
import { onCallScheduleData } from './onCallScheduleData';

const getLastName = (fullName: string): string => {
  if (!fullName) return "";
  const parts = fullName.trim().split(' ');
  return parts[parts.length - 1].toLowerCase();
};

export const generateUsersFromSchedule = (schedule: OnCallSchedule): User[] => {
  const uniqueFullNames = new Set<string>();

  Object.values(schedule).forEach(yearData => {
    Object.values(yearData).forEach(monthData => {
      Object.values(monthData).forEach(dailySchedule => {
        dailySchedule.forEach(doctorFullName => {
          if (doctorFullName && doctorFullName.trim() !== "") {
            uniqueFullNames.add(doctorFullName.trim());
          }
        });
      });
    });
  });

  const generatedUsers: User[] = Array.from(uniqueFullNames).map(fullName => {
    let username = getLastName(fullName);
    let password = "1234"; // Contraseña por defecto para médicos del calendario
    let rut;
    let electronicSignature = `${fullName}\nMédico Cirujano`;
    let finalFullName = fullName;

    // Diferenciación de usuarios con el mismo apellido
    if (fullName === "BENJAMIN ROJAS") {
      username = "benjarojas";
    } else if (fullName === "CAMILA ROJAS") {
      username = "camirojas";
    }

    if (fullName === "VICTOR VEGA") {
      password = "1234";
      rut = "19.507.002-4";
      finalFullName = "VÍCTOR VEGA ÁVALOS";
      electronicSignature = `VÍCTOR VEGA ÁVALOS\nRUT 19.507.002-4\nMédico cirujano`;
    }

    return {
      username,
      password,
      fullName: finalFullName,
      profession: 'medicina' as Profession,
      cesfam: 'CESFAM San Juan' as CESFAM,
      electronicSignature,
      sector: 'No especificado' as Sector,
      ...(rut && { rut }),
    };
  });

  return generatedUsers;
};

const manualUsers: User[] = [
  {
    username: 'house',
    password: '1234',
    fullName: 'MÉDICO TRATANTE',
    profession: 'medicina',
    cesfam: 'CESFAM San Juan',
    electronicSignature: 'MÉDICO TRATANTE\nMédico Cirujano',
    sector: 'No especificado',
  },
  {
    username: 'vega',
    password: '1234',
    fullName: 'ADMINISTRACIÓN',
    rut: '19.507.002-4',
    profession: 'medicina',
    cesfam: 'CESFAM San Juan',
    electronicSignature: 'VÍCTOR VEGA ÁVALOS\nRUT 19.507.002-4\nMédico cirujano',
    sector: 'Verde',
  },
  {
    username: 'vvega',
    password: 'vvega',
    fullName: 'VÍCTOR VEGA ÁVALOS',
    rut: '19.507.002-4',
    profession: 'medicina',
    cesfam: 'CESFAM San Juan',
    electronicSignature: 'VÍCTOR VEGA ÁVALOS\nRUT 19.507.002-4\nMédico cirujano',
    sector: 'Verde',
  },
  {
    username: 'lopez',
    password: '1234',
    fullName: 'ROMINA LÓPEZ CASTILLO',
    profession: 'medicina',
    cesfam: 'CESFAM San Juan',
    electronicSignature: 'ROMINA LÓPEZ\nMédico Cirujano',
    sector: 'Verde',
  },
  {
    username: 'ramos',
    password: '1234',
    fullName: 'LUCIANO RAMOS ARGANDOÑA',
    profession: 'medicina',
    cesfam: 'CESFAM San Juan',
    electronicSignature: 'LUCIANO RAMOS\nMédico Cirujano',
    sector: 'Naranjo',
  },
  {
    username: 'zamorano',
    password: '1234',
    fullName: 'DANIELA ZAMORANO AGUIRRE',
    profession: 'medicina',
    cesfam: 'CESFAM San Juan',
    electronicSignature: 'DANIELA ZAMORANO AGUIRRE\nMédico Cirujano',
    sector: 'Verde',
  },
  {
    username: 'milos',
    password: '1234',
    fullName: 'FRANCO MILOS RUIZ',
    profession: 'medicina',
    cesfam: 'CESFAM San Juan',
    electronicSignature: 'FRANCO MILOS RUIZ\nMédico Cirujano',
    sector: 'Naranjo',
  },
  {
    username: 'patiño',
    password: '1234',
    fullName: 'HENRY PATIÑO ULLAURI',
    profession: 'medicina',
    cesfam: 'CESFAM San Juan',
    electronicSignature: 'HENRY PATIÑO ULLAURI\nMédico Cirujano',
    sector: 'Verde',
  },
  {
    username: 'madariaga',
    password: '1234',
    fullName: 'CAROLINA MADARIAGA',
    profession: 'medicina',
    cesfam: 'CESFAM San Juan',
    electronicSignature: 'CAROLINA MADARIAGA\nMédico Cirujano',
    sector: 'Naranjo',
  },
  {
    username: 'cuello',
    password: '1234',
    fullName: 'GABRIELA CUELLO PEÑA',
    profession: 'medicina',
    cesfam: 'CESFAM San Juan',
    electronicSignature: 'GABRIELA CUELLO PEÑA\nMédico Cirujano',
    sector: 'Amarillo',
  },
  {
    username: 'yepez',
    password: '1234',
    fullName: 'CECILIA YEPEZ NÚÑEZ',
    profession: 'medicina',
    cesfam: 'CESFAM San Juan',
    electronicSignature: 'CECILIA YEPEZ NÚÑEZ\nMédico Cirujano',
    sector: 'Naranjo',
  },
  {
    username: 'valdes',
    password: '1234',
    fullName: 'ISMAEL VALDÉS MELÉNDEZ',
    profession: 'medicina',
    cesfam: 'CESFAM San Juan',
    electronicSignature: 'ISMAEL VALDÉS MELÉNDEZ\nMédico Cirujano',
    sector: 'Naranjo',
  },
  {
    username: 'cordova',
    password: '195158584',
    fullName: 'NICOLÁS EDUARDO CÓRDOVA GUERRA',
    rut: '19.515.858-4',
    profession: 'medicina',
    cesfam: 'CESFAM San Juan',
    electronicSignature: 'NICOLÁS EDUARDO CÓRDOVA GUERRA\nRUT 19.515.858-4\nMédico Cirujano',
    sector: 'No especificado',
  },
  {
    username: 'cat',
    password: '1975',
    fullName: 'EMPERATRIZ GARCÍA MITE',
    rut: '22.765.511-9',
    profession: 'medicina',
    cesfam: 'CESFAM San Juan',
    electronicSignature: 'EMPERATRIZ GARCÍA MITE\nRUT 22.765.511-9\nMédico Cirujano',
    sector: 'Amarillo',
  },
  {
    username: 'muñozsauce',
    password: 'muñozsauce',
    fullName: 'RICARDO MUÑOZ CASTRO',
    profession: 'medicina',
    cesfam: 'CESFAM El Sauce',
    electronicSignature: 'RICARDO MUÑOZ CASTRO\nMédico Cirujano',
    sector: 'No especificado',
  },
  {
    username: 'sulbaran',
    password: '1234',
    fullName: 'EDGAR SULBARAN ESPINOSA',
    profession: 'medicina',
    cesfam: 'CESFAM Tierras Blancas',
    electronicSignature: 'Edgar Sulbaran Espinoza\nMédico Cirujano',
    sector: 'No especificado',
  },
  {
    username: 'bastiancordova',
    password: '20458608k',
    fullName: 'BASTIÁN CÓRDOVA',
    rut: '20.458.608-K',
    profession: 'medicina',
    cesfam: 'CESFAM San Juan',
    electronicSignature: 'BASTIÁN CÓRDOVA\nRUT 20.458.608-K\nMédico Cirujano',
    sector: 'Naranjo',
  },
  // --- ENFERMERAS ---
  { username: 'camiaguilar', password: 'csanjuan', fullName: 'CAMILA AGUILAR', profession: 'enfermeria', cesfam: 'CESFAM San Juan', electronicSignature: 'CAMILA AGUILAR\nEnfermera', sector: 'Verde' },
  { username: 'patriciacortes', password: 'csanjuan', fullName: 'PATRICIA CORTÉS AYALA', profession: 'enfermeria', cesfam: 'CESFAM San Juan', electronicSignature: 'PATRICIA CORTÉS AYALA\nEnfermera', sector: 'No especificado' },
  { username: 'valetapia', password: 'csanjuan', fullName: 'VALENTINA TAPIA', profession: 'enfermeria', cesfam: 'CESFAM San Juan', electronicSignature: 'VALENTINA TAPIA\nEnfermera', sector: 'No especificado' },
  { username: 'carlitorres', password: 'csanjuan', fullName: 'CARLINA TORRES', profession: 'enfermeria', cesfam: 'CESFAM San Juan', electronicSignature: 'CARLINA TORRES\nEnfermera', sector: 'No especificado' },
  { username: 'roxanarojas', password: 'csanjuan', fullName: 'ROXANA ROJAS', profession: 'enfermeria', cesfam: 'CESFAM San Juan', electronicSignature: 'ROXANA ROJAS\nEnfermera', sector: 'No especificado' },
  { username: 'maritzasoto', password: 'csanjuan', fullName: 'MARITZA SOTO', profession: 'enfermeria', cesfam: 'CESFAM San Juan', electronicSignature: 'MARITZA SOTO\nEnfermera', sector: 'No especificado' },
  { username: 'franramos', password: 'csanjuan', fullName: 'FRANCISCA RAMOS', profession: 'enfermeria', cesfam: 'CESFAM San Juan', electronicSignature: 'FRANCISCA RAMOS\nEnfermera', sector: 'No especificado' },
  { username: 'ossandon', password: 'csanjuan', fullName: 'XIMENA OSSANDÓN', profession: 'enfermeria', cesfam: 'CESFAM San Juan', electronicSignature: 'XIMENA OSSANDÓN\nEnfermera', sector: 'No especificado' },
  { username: 'nataliapineda', password: 'csanjuan', fullName: 'NATALIA PINEDA RIVERA', profession: 'enfermeria', cesfam: 'CESFAM San Juan', electronicSignature: 'NATALIA PINEDA RIVERA\nEnfermera', sector: 'No especificado' },
  { username: 'marciaaraya', password: 'csanjuan', fullName: 'MARCIA ARAYA', profession: 'enfermeria', cesfam: 'CESFAM San Juan', electronicSignature: 'MARCIA ARAYA\nEnfermera', sector: 'No especificado' },
  { username: 'dubo', password: 'csanjuan', fullName: 'KATHERINE DUBÓ', profession: 'enfermeria', cesfam: 'CESFAM San Juan', electronicSignature: 'KATHERINE DUBÓ\nEnfermera', sector: 'No especificado' },
  { username: 'angelojorquera', password: 'csanjuan', fullName: 'ANGELO JORQUERA', profession: 'enfermeria', cesfam: 'CESFAM San Juan', electronicSignature: 'ANGELO JORQUERA\nEnfermero', sector: 'No especificado' },
  { username: 'cesarcoudray', password: 'csanjuan', fullName: 'CÉSAR COUDRAY', profession: 'enfermeria', cesfam: 'CESFAM San Juan', electronicSignature: 'CÉSAR COUDRAY\nEnfermero', sector: 'Verde' },
  // --- MÉDICOS ---
  { username: 'ochoa', password: 'csanjuan', fullName: 'GÉNESIS OCHOA', profession: 'medicina', cesfam: 'CESFAM San Juan', electronicSignature: 'GÉNESIS OCHOA\nMédico Cirujano', sector: 'Verde' },
  { username: 'nuñez', password: 'csanjuan', fullName: 'DANIELA NÚÑEZ', profession: 'medicina', cesfam: 'CESFAM San Juan', electronicSignature: 'DANIELA NÚÑEZ\nMédico Cirujano', sector: 'Naranjo' },
  { username: 'benjarojas', password: 'csanjuan', fullName: 'BENJAMIN ROJAS', profession: 'medicina', cesfam: 'CESFAM San Juan', electronicSignature: 'BENJAMIN ROJAS\nMédico Cirujano', sector: 'Naranjo' },
  { username: 'camirojas', password: 'csanjuan', fullName: 'CAMILA ROJAS RIVERA', profession: 'medicina', cesfam: 'CESFAM San Juan', electronicSignature: 'CAMILA ROJAS RIVERA\nMédico Cirujano', sector: 'Amarillo' },
  { username: 'cortes', password: 'csanjuan', fullName: 'DAVID CORTÉS CORONADO', profession: 'medicina', cesfam: 'CESFAM San Juan', electronicSignature: 'DAVID CORTÉS CORONADO\nMédico Cirujano', sector: 'No especificado' },
  { username: 'pizarro', password: 'csanjuan', fullName: 'RODRIGO PIZARRO BLANCO', profession: 'medicina', cesfam: 'CESFAM San Juan', electronicSignature: 'RODRIGO PIZARRO BLANCO\nMédico Cirujano', sector: 'Amarillo' },
  // --- NUTRICIONISTAS ---
  { username: 'campano', password: 'csanjuan', fullName: 'CONSTANZA CAMPANO', profession: 'nutricion', cesfam: 'CESFAM San Juan', electronicSignature: 'CONSTANZA CAMPANO\nNutricionista', sector: 'No especificado' },
  { username: 'nataliajimenez', password: 'csanjuan', fullName: 'NATALIA JIMENEZ', profession: 'nutricion', cesfam: 'CESFAM San Juan', electronicSignature: 'NATALIA JIMENEZ\nNutricionista', sector: 'No especificado' },
  { username: 'sandraulloa', password: 'csanjuan', fullName: 'SANDRA ULLOA', profession: 'nutricion', cesfam: 'CESFAM San Juan', electronicSignature: 'SANDRA ULOLA\nNutricionista', sector: 'No especificado' },
  { username: 'cristobalnutri', password: 'csanjuan', fullName: 'CRISTOBAL JORQUERA', profession: 'nutricion', cesfam: 'CESFAM San Juan', electronicSignature: 'CRISTOBAL JORQUERA\nNutricionista' },
  { username: 'mjolivares', password: 'csanjuan', fullName: 'MARÍA JOSÉ OLIVARES', profession: 'nutricion', cesfam: 'CESFAM San Juan', electronicSignature: 'MARÍA JOSÉ OLIVARES\nNutricionista' },
  { username: 'fapablaza', password: 'csanjuan', fullName: 'FERNANDA APABLAZA', profession: 'nutricion', cesfam: 'CESFAM San Juan', electronicSignature: 'FERNANDA APABLAZA\nNutricionista' },
  // --- PSICÓLOGAS ---
  { username: 'psbarrios', password: 'csanjuan', fullName: 'JOCELINE BARRIOS', profession: 'psicologia', cesfam: 'CESFAM San Juan', electronicSignature: 'JOCELINE BARRIOS\nPsicóloga' },
  { username: 'piafredes', password: 'csanjuan', fullName: 'PIA FREDES', profession: 'psicologia', cesfam: 'CESFAM San Juan', electronicSignature: 'PIA FREDES\nPsicóloga' },
  { username: 'lauraflores', password: 'csanjuan', fullName: 'LAURA FLORES', profession: 'psicologia', cesfam: 'CESFAM San Juan', electronicSignature: 'LAURA FLORES\nPsicóloga' },
  { username: 'tamaragonzalez', password: 'csanjuan', fullName: 'TAMARA GONZALEZ', profession: 'psicologia', cesfam: 'CESFAM San Juan', electronicSignature: 'TAMARA GONZALEZ\nPsicóloga' },
  { username: 'claudiarojas', password: 'csanjuan', fullName: 'CLAUDIA ROJAS', profession: 'psicologia', cesfam: 'CESFAM San Juan', electronicSignature: 'CLAUDIA ROJAS\nPsicóloga' },
  { username: 'giannina', password: 'csanjuan', fullName: 'GIANNINA MAUREIRA', profession: 'psicologia', cesfam: 'CESFAM San Juan', electronicSignature: 'GIANNINA MAUREIRA\nPsicóloga' },
  // --- KINESIOLOGO ---
  { username: 'luiscarmona', password: 'csanjuan', fullName: 'LUIS CARMONA', profession: 'kinesiologo', cesfam: 'CESFAM San Juan', electronicSignature: 'LUIS CARMONA\nKinesiólogo' },
  // --- TENS ---
  { username: 'sandraveliz', password: 'csanjuan', fullName: 'SANDRA VELIZ', profession: 'tens', cesfam: 'CESFAM San Juan', electronicSignature: 'SANDRA VELIZ\nTENS' },
  { username: 'zapata', password: 'csanjuan', fullName: 'GABRIELA ZAPATA', profession: 'tens', cesfam: 'CESFAM San Juan', electronicSignature: 'GABRIELA ZAPATA\nTENS' },
  { username: 'danigarcia', password: 'csanjuan', fullName: 'DANIELA GARCÍA', profession: 'tens', cesfam: 'CESFAM San Juan', electronicSignature: 'DANIELA GARCÍA\nTENS' },
];

const usersFromSchedule = generateUsersFromSchedule(onCallScheduleData);

const allUsersMap = new Map<string, User>();

// Llenar con usuarios del calendario
usersFromSchedule.forEach(u => allUsersMap.set(u.username, u));
// Sobrescribir con manuales (que incluyen las contraseñas csanjuan y profesiones correctas)
manualUsers.forEach(u => allUsersMap.set(u.username, u));

export const users: User[] = Array.from(allUsersMap.values());
