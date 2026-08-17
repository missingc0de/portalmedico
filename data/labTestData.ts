import { OrdenLaboratorioFormData } from '../types';

export interface LabTestItem {
  key: keyof OrdenLaboratorioFormData;
  label: string;
}

export interface LabTestCategory {
  title: string;
  items: LabTestItem[];
  subCategory?: {
    title: string;
    items: LabTestItem[];
  }
}

export const labCategoriesConfig: LabTestCategory[] = [
  {
    title: 'Hematología',
    items: [
      { key: 'hematologia_hematocrito', label: 'Hematocrito' },
      { key: 'hematologia_hemoglobina', label: 'Hemoglobina' },
      { key: 'hematologia_hemograma', label: 'Hemograma' },
      { key: 'hematologia_hemoglobina_glicosilada', label: 'Hemoglobina Glicosilada' },
      { key: 'hematologia_vhs', label: 'VHS' },
      { key: 'hematologia_protrombina', label: 'Protrombina (tiempo INR)' },
      { key: 'hematologia_ttpk', label: 'TTPK (TTPA)' },
      { key: 'hematologia_recuento_plaquetas', label: 'Recuento plaquetas' },
      { key: 'hematologia_recuento_leucocitos', label: 'Recuento leucocitos' },
    ],
  },
  {
    title: 'Bioquímica',
    items: [
      { key: 'bioquimica_acido_urico', label: 'Ácido Úrico' },
      { key: 'bioquimica_calcio', label: 'Calcio' },
      { key: 'bioquimica_bilirrubina_total_conjugada', label: 'Bilirrubina total y conjugada' },
      { key: 'bioquimica_colesterol_total', label: 'Colesterol total' },
      { key: 'bioquimica_colesterol_hdl', label: 'Colesterol HDL' },
      { key: 'bioquimica_ldh', label: 'LDH' },
      { key: 'bioquimica_creatinina', label: 'Creatinina' },
      { key: 'bioquimica_clearance_creatinina', label: 'Clearance de creatinina' },
      { key: 'bioquimica_fosfatasa_alcalina', label: 'Fosfatasa alcalina' },
      { key: 'bioquimica_glicemia', label: 'Glicemia' },
      { key: 'bioquimica_ptgo', label: 'Prueba de tolerancia a la glucosa oral (PTGO)' },
      { key: 'bioquimica_ggt', label: 'GGT' },
      { key: 'bioquimica_proteinas_totales', label: 'Proteínas Totales' },
      { key: 'bioquimica_albumina', label: 'Albúmina' },
      { key: 'bioquimica_tgo_ast', label: 'TGO (AST)' },
      { key: 'bioquimica_tgp_alt', label: 'TGP (ALT)' },
      { key: 'bioquimica_trigliceridos', label: 'Triglicéridos' },
      { key: 'bioquimica_uremia', label: 'Uremia (Nitrógeno Ureico)' },
      { key: 'bioquimica_ck_total', label: 'CK-Total' },
      { key: 'bioquimica_electrolitos_plasmaticos', label: 'Electrolitos Plasmáticos' },
      { key: 'bioquimica_perfil_lipidico', label: 'Perfil Lipídico' },
      { key: 'bioquimica_fosforo', label: 'Fósforo' },
    ],
  },
  {
    title: 'Hormonas',
    items: [
      { key: 'hormonas_tsh', label: 'TSH' },
      { key: 'hormonas_t4l', label: 'T4L' },
      { key: 'hormonas_antigeno_prostatico_total', label: 'Antígeno Prostático Total' },
    ],
  },
  {
    title: 'Orina',
    items: [
      { key: 'orina_deteccion_embarazo', label: 'Detección de embarazo' },
      { key: 'orina_fisico_quimico', label: 'Físico-químico de orina' },
      { key: 'orina_completa', label: 'Orina completa' },
      { key: 'orina_proteinuria_24hr', label: 'Proteinuria 24 hr' },
      { key: 'orina_microalbuminuria_creatinuria', label: 'Microalbuminuria/Creatinuria' },
    ],
  },
  {
    title: 'Deposiciones',
    items: [
      { key: 'deposiciones_leucositos_fecales', label: 'Leucositos fecales' },
      { key: 'deposiciones_hemorragias_ocultas', label: 'Hemorragias ocultas en deposiciones' },
      { key: 'deposiciones_azucares_reductores', label: 'Azúcares reductores (PH)' },
      { key: 'deposiciones_test_helicobacter', label: 'Test Helicobacter Pylori Deposición' },
    ],
  },
  {
    title: 'Inmunología',
    items: [
      { key: 'inmunologia_factor_reumatoideo', label: 'Factor Reumatoideo' },
    ],
  },
  {
    title: 'Microbiología',
    items: [
      { key: 'microbiologia_rpr', label: 'R.P.R.' },
      { key: 'microbiologia_vdrl', label: 'V.D.R.L.' },
      { key: 'microbiologia_secrecion_uretral', label: 'Secreción uretral' },
      { key: 'microbiologia_urocultivo', label: 'Urocultivo' },
      { key: 'microbiologia_sedimento_orina', label: 'Sedimento de Orina' },
      { key: 'microbiologia_cultivo_gonococo', label: 'Cultivo para Gonococo' },
      { key: 'microbiologia_antibiograma_gonococo', label: 'Antibiograma para gonococo' },
      { key: 'microbiologia_strepto_b', label: 'Strepto B directo y cultivo' },
      { key: 'microbiologia_cultivo_herida', label: 'Cultivo de herida' },
      { key: 'microbiologia_examen_directo_fresco', label: 'Examen directo al fresco' },
      { key: 'microbiologia_gram_flujo_vaginal', label: 'Gram (de flujo vaginal)' },
      { key: 'microbiologia_flujo_vaginal', label: 'Flujo Vaginal' },
    ],
  },
  {
    title: 'Parasitología',
    items: [
      { key: 'parasitologia_coproparasitologico_seriado', label: 'Coprocultivo seriado (EPSD)' },
      { key: 'parasitologia_examen_graham', label: 'Examen de Graham' },
      { key: 'parasitologia_diagnostico_gusanos', label: 'Diagnóstico de gusanos macroscópicos' },
    ],
  },
  {
    title: 'Epilepsia',
    items: [
      { key: 'epilepsia_perfil_hepatico', label: 'Perfil hepático' },
    ],
    subCategory: {
      title: 'Niveles Plasmáticos de',
      items: [
        { key: 'epilepsia_acido_valproico', label: 'Niveles Plasmáticos de Ácido Valproico' },
        { key: 'epilepsia_carbamazepina', label: 'Niveles Plasmáticos de Carbamazepina' },
        { key: 'epilepsia_vitamina_b12', label: 'Vitamina B12' },
        { key: 'epilepsia_fenitoina', label: 'Niveles Plasmáticos de Fenitoína' },
        { key: 'epilepsia_fenobarbital', label: 'Niveles Plasmáticos de Fenobarbital' },
        { key: 'epilepsia_lamotrigina', label: 'Niveles Plasmáticos de Lamotrigina' },
      ]
    }
  },
];

export const labTestDetails: Record<string, { code: string; label: string; group: string }> = {
  // Hematología
  hematologia_hematocrito: { code: '0301036', label: 'HEMATOCRITO', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  hematologia_hemoglobina: { code: '0301038', label: 'HEMOGLOBINA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  hematologia_hemograma: { code: '0301045', label: 'HEMOGRAMA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  hematologia_hemoglobina_glicosilada: { code: '0301041', label: 'HEMOGLOBINA GLICOSILADA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  hematologia_vhs: { code: '0301086', label: 'VHS', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  hematologia_protrombina: { code: '0301059', label: 'PROTROMBINA (TIEMPO INR)', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  hematologia_ttpk: { code: '0301085', label: 'TTPK (TTPA)', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  hematologia_recuento_plaquetas: { code: '0301067', label: 'RECUENTO PLAQUETAS', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  hematologia_recuento_leucocitos: { code: '0301065', label: 'RECUENTO LEUCOCITOS', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },

  // Bioquímica
  bioquimica_acido_urico: { code: '0302005', label: 'ACIDO URICO', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_calcio: { code: '0302015', label: 'CALCIO', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_bilirrubina_total_conjugada: { code: '0302013-01', label: 'BILIRRUBINA TOTAL Y CONJUGADA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_colesterol_total: { code: '0302067', label: 'COLESTEROL TOTAL', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_colesterol_hdl: { code: '0302068', label: 'COLESTEROL HDL', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_ldh: { code: '0302030', label: 'LDH', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_creatinina: { code: '0302023', label: 'CREATININA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_clearance_creatinina: { code: '0302024', label: 'CLEARENCE DE CREATININA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_fosfatasa_alcalina: { code: '0302040', label: 'FOSFATASA ALCALINA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_glicemia: { code: '0302047', label: 'GLICEMIA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_ptgo: { code: '0302048', label: 'PRUEBA DE TOLERANCIA A LA GLUCOSA ORAL (PTGO)', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_ggt: { code: '0302045', label: 'GGT', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_proteinas_totales: { code: '0302060', label: 'PROTEINAS TOTALES', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_albumina: { code: '0302060-01', label: 'ALBUMINA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_tgo_ast: { code: '0302063-01', label: 'TGO (AST)', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_tgp_alt: { code: '0302063-02', label: 'TGP (ALT)', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_trigliceridos: { code: '0302064', label: 'TRIGLICERIDOS', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_uremia: { code: '0302057', label: 'UREMIA (NITROGENO UREICO)', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_ck_total: { code: '0302026', label: 'CK-TOTAL', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_electrolitos_plasmaticos: { code: '0302032', label: 'ELECTROLITOS PLASMATICOS', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_perfil_lipidico: { code: '0302034', label: 'PERFIL LIPIDICO (COLESTEROL TOTAL, HDL, LDL, VLDL Y TRIGLICERIDOS)', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  bioquimica_fosforo: { code: '0302042', label: 'FOSFORO', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },

  // Hormonas
  hormonas_tsh: { code: '0303024', label: 'HORMONA TIROESTIMULANTE (TSH)', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  hormonas_t4l: { code: '0303026', label: 'T4L', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  hormonas_antigeno_prostatico_total: { code: '0305070', label: 'ANTIGENO PROSTATICO TOTAL', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },

  // Orina
  orina_deteccion_embarazo: { code: '0309014', label: 'DETECCION DE EMBARAZO', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  orina_fisico_quimico: { code: '0309023', label: 'FISICO-QUIMICO DE ORINA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  orina_completa: { code: '0309022', label: 'ORINA COMPLETA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  orina_proteinuria_24hr: { code: '0309028', label: 'PROTEINURIA 24 HR', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  orina_microalbuminuria_creatinuria: { code: '0309013', label: 'MICROALBUMINURIA/CREATINURIA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },

  // Deposiciones
  deposiciones_leucositos_fecales: { code: '0308005', label: 'LEUCOCITOS FECALES', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  deposiciones_hemorragias_ocultas: { code: '0308004', label: 'HEMORRAGIAS OCULTAS EN DEPOSICIONES', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  deposiciones_azucares_reductores: { code: '0308001', label: 'AZUCARES REDUCTORES (PH)', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  deposiciones_test_helicobacter: { code: '03024', label: 'TEST HELICOBACTER PYLORI DEPOSICION', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },

  // Inmunología
  inmunologia_factor_reumatoideo: { code: '0305019', label: 'FACTOR REUMATOIDEO', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },

  // Microbiología
  microbiologia_rpr: { code: '0306038', label: 'R.P.R.', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  microbiologia_vdrl: { code: '0306042', label: 'V.D.R.L.', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  microbiologia_secrecion_uretral: { code: '0308044-01', label: 'SECRECION URETRAL', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  microbiologia_urocultivo: { code: '0306011', label: 'UROCULTIVO', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  microbiologia_sedimento_orina: { code: '0309024', label: 'SEDIMENTO DE ORINA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  microbiologia_cultivo_gonococo: { code: '0306016', label: 'CULTIVO PARA GONOCOCO', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  microbiologia_antibiograma_gonococo: { code: '0306026', label: 'ANTIBIOGRAMA PARA GONOCOCO', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  microbiologia_strepto_b: { code: '0306008-01', label: 'STREPTO B DIRECTO Y CULTIVO', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  microbiologia_cultivo_herida: { code: '0306008', label: 'CULTIVO DE HERIDA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  microbiologia_examen_directo_fresco: { code: '0306004', label: 'EXAMEN DIRECTO AL FRESCO', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  microbiologia_gram_flujo_vaginal: { code: '0306005', label: 'GRAM (DE FLUJO VAGINAL)', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  microbiologia_flujo_vaginal: { code: '0308044', label: 'FLUJO VAGINAL', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },

  // Parasitología
  parasitologia_coproparasitologico_seriado: { code: '0306048', label: 'COPROPARASITOLOGICO SERIADO (EPSD)', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  parasitologia_examen_graham: { code: '0306051', label: 'EXAMEN DE GRAHAM', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  parasitologia_diagnostico_gusanos: { code: '0306052', label: 'DIAGNOSTICOS DE GUSANOS MACROSCOPICOS', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },

  // Epilepsia
  epilepsia_perfil_hepatico: { code: '0302076', label: 'PERFIL HEPATICO', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  epilepsia_acido_valproico: { code: '0302035-10', label: 'NIVELES PLASMÁTICOS DE ÁCIDO VALPROICO', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  epilepsia_carbamazepina: { code: '0302035-11', label: 'NIVELES PLASMÁTICOS DE CARBAMAZEPINA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  epilepsia_vitamina_b12: { code: '0301087', label: 'VITAMINA B12', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  epilepsia_fenitoina: { code: '0302035-14', label: 'NIVELES PLASMÁTICOS DE FENITOÍNA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  epilepsia_fenobarbital: { code: '0302035-17', label: 'NIVELES PLASMÁTICOS DE FENOBARBITAL', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
  epilepsia_lamotrigina: { code: '0302035-16', label: 'NIVELES PLASMÁTICOS DE LAMOTRIGINA', group: 'GRUPO 01: EXAMENES DE LABORATORIO' },
};
