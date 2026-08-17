
import { jsPDF } from 'jspdf';

export enum FormStatus {
  Idle,
  Generating,
  Error,
  TextGenerated,
}

export type Profession = 
  | 'medicina' 
  | 'enfermeria' 
  | 'nutricion' 
  | 'psicologia' 
  | 'kinesiologo' 
  | 'matroneria' 
  | 'tens' 
  | 'quimico_farmaceutico' 
  | 'asistente_social'
  | 'odontologia';

export type CESFAM = 'CESFAM Santa Cecilia' | 'CESFAM San Juan' | 'CESFAM Sergio Aguilar' | 'CESFAM Tierras Blancas' | 'CESFAM Tongoy' | 'CESFAM Pan de Azúcar' | 'CESFAM El Sauce' | 'CESFAM Lila Cortés' | 'CECOSF Punta Mira';

export interface User {
  username: string;
  password?: string;
  fullName: string;
  profession: Profession;
  rut?: string;
  cesfam: CESFAM;
  electronicSignature?: string;
  sector?: Sector;
  profilePictureUrl?: string;
}

export type Sector = 'Verde' | 'Amarillo' | 'Naranjo' | 'No especificado';

export type CertificateType =
  | 'constanciaAtencion'
  | 'ordenExamenRadiologico'
  | 'ordenLaboratorio'
  | 'certificadoEscolar'
  | 'derivacionesPscv'
  | 'recetaMedica'
  | 'certificadoMedico'
  | 'fichaControlHipotiroidismo'
  | 'fichaPreingresoEcicep'
  | 'fichaIngresoEcicep'
  | 'fichaControlEcicep'
  | 'fichaControlEcicepNuevo'
  | 'fichaSeguimientoEcicep'
  | 'fichaControlSalaEra'
  | 'fichaControlSalaIra'
  | 'fichaControlNinoSano'
  | 'fichaControlCardiovascular'
  | 'fichaControlAdultoMayor'
  | 'fichaControlNinoSano1Mes'
  | 'fichaControlNinoSano3Mes'
  | 'fichaControlNinoSano6Anos'
  | 'fichaMorbilidad'
  | 'fichaControlPscv'
  | 'fichaIngresoSm'
  | 'fichaControlSm'
  | 'fichaConsultaPasmi'
  | 'fichaConsultoria'
  | 'fichaControlEpilepsia'
  | 'fichaControlArtrosis'
  | 'fichaFondoOjo'
  | 'fichaPolichoque'
  | 'fichaGrupalDiabetes'
  | 'ingresoDemencias'
  | 'fichaControlDemencias'
  | 'bitacora'
  | 'calculoLeches'
  | 'curvasCrecimiento'
  | 'dosisPediatria'
  | 'ajusteDosisErc'
  | 'grupalDiabetesManager'
  | 'arsenalFarmacologico'
  | 'fichaFirmarGes'
  | 'buscadorExamenesLab'
  | 'hdDermatologia'
  | 'hdDiabetes'
  | 'hdEndocrinologia'
  | 'hdGeriatria'
  | 'hdReumatologia'
  | 'hojaDiariaRem'
  | 'tablaComposicionAlimentos'
  | 'fichaVisitaDomiciliaria';

export interface PccObjetivo {
  titulo?: string;
  objetivo?: string;
  acuerdo: string;
  acciones: string;
  plazo: string;
  responsables: string;
  seguimiento: string;
}

export interface ObjetivoAnterior extends PccObjetivo {
  cumplio: 'Sí' | 'No' | '';
  aclaracionNoCumplimiento: string;
}

export type View = CertificateType | 'login' | 'menu' | 'misPacientes' | 'sapu';

export type OnCallSchedule = Record<number, Record<number, Record<number, string[]>>>;

export interface SpecialEvent {
  id: string;
  year: number;
  month: number;
  day: number;
  title: string;
  color: string;
  startTime: string; // e.g., '14:00'
  endTime?: string;  // e.g., '15:00'
  location: string;
  invitees: string[]; // array of usernames or group identifiers
  isPrivate: boolean;
  creator: string; // username
  noBackground?: boolean;
}

export type SpecialEventData = Record<number, Record<number, Record<number, SpecialEvent[]>>>;

export interface BaseFichaData {
  nombrePaciente: string;
  rutPaciente: string;
}

export interface FichaControlPscvFormData extends BaseFichaData {
  fechaControl: string;
  estratificacion: string;
  tipoControlCronico: string;
  // Hipotiroidismo
  hipotiroidismoConstipacion: boolean; hipotiroidismoConstipacionAclaracion: string;
  hipotiroidismoIntoleranciaFrio: boolean; hipotiroidismoIntoleranciaFrioAclaracion: string;
  hipotiroidismoDebilidadFanereos: boolean; hipotiroidismoDebilidadFanereosAclaracion: string;
  hipotiroidismoIncrementoPeso: boolean; hipotiroidismoIncrementoPesoAclaracion: string;
  hipotiroidismoAdinamia: boolean; hipotiroidismoAdinamiaAclaracion: string;
  hipotiroidismoRamLevotiroxina: boolean; hipotiroidismoRamLevotiroxinaAclaracion: string;
  hipotiroidismoActividadFisica: boolean; hipotiroidismoActividadFisicaAclaracion: string;
  // Epilepsia
  epilepsiaUltimaCrisis: string;
  epilepsiaDesencadenante: string;
  epilepsiaControlesNeurologo: string;
  epilepsiaIndicacionesSecundaria: string;
  // Artrosis
  artrosisDolor: boolean; artrosisDolorAclaracion: string;
  artrosisRigidezArticular: boolean; artrosisRigidezArticularAclaracion: string;
  artrosisFracasoAnalgesia: boolean; artrosisFracasoAnalgesiaAclaracion: string;
  artrosisKinesioterapia: boolean; artrosisKinesioterapiaAclaracion: string;
  artrosisActividadFisica: boolean; artrosisActividadFisicaAclaracion: string;
  edad: string;
  sexo: string;
  anamnesisGeneral: string;
  antecedentesPersonales: string;
  morbilidad: string;
  ramFarmacos: string;
  ramFarmacosAclaracion: string;
  alergias: string;
  cirugias: string;
  hospitalizaciones: string;
  controlExtrasistema: string;
  factoresRiesgo: string[];
  antecedentesMedicos: string;
  farmacos: string;
  historiaPreviaAcv: boolean;
  historiaPreviaAcvAclaracion: string;
  historiaPreviaIam: boolean;
  historiaPreviaIamAclaracion: string;
  antecedentesFamiliaresCv: string;
  adherenciaTratamiento: string;
  dieta: string;
  tabaco: boolean;
  tabacoAclaracion: string;
  ipaNroCigarrillos: string;
  ipaNroAnos: string;
  ipaResultado: string;
  oh: boolean;
  ohAclaracion: string;
  drogas: boolean;
  drogasAclaracion: string;
  actividadFisica: boolean;
  actividadFisicaAclaracion: string;
  sintomaOrtopnea: boolean;
  sintomaOrtopneaAclaracion: string;
  sintomaDpn: boolean;
  sintomaDpnAclaracion: string;
  sintomaNicturia: boolean;
  sintomaNicturiaAclaracion: string;
  sintomaEdemaEeii: boolean;
  sintomaEdemaEeiiAclaracion: string;
  sintomaAngor: boolean;
  sintomaAngorAclaracion: string;
  sintomaPalpitaciones: boolean;
  sintomaPalpitacionesAclaracion: string;
  sintomaPolidipsia: boolean;
  sintomaPolidipsiaAclaracion: string;
  sintomaPoliuria: boolean;
  sintomaPoliuriaAclaracion: string;
  sintomaPolifagia: boolean;
  sintomaPolifagiaAclaracion: string;
  sintomaBajaPeso: boolean;
  sintomaBajaPesoAclaracion: string;
  ultimoLaboratorioFecha: string;
  ultimoLaboratorioResultados: string;
  ekgFecha: string;
  ekgResultados: string;
  otrasImagenesFecha: string;
  otrasImagenesResultados: string;
  peso: string;
  talla: string;
  imc: string;
  pa: string;
  fc: string;
  cc: string;
  efGeneralSegmentario: string;
  borgScaleResult: string;
  integralIndividual: string;
  integralFamiliar: string;
  integralTipologia: string;
  integralCronicas: string;
  pccPersonaFamilia: string;
  pccEquipoSalud: string;
  tomaDecisionesCompartidas: string;
  opcionesConversadas: string;
  pccObjetivos: PccObjetivo[];
  acuerdoPlanEquipo: string;
  acuerdoContactoSeguimiento: string;
  planEcicepLabsRutina: boolean;
  planEcicepEKG: boolean;
  planEcicepHBA1C: boolean; planEcicepHBA1CTiempo: string;
  planEcicepFondoOjo: boolean;
  planEcicepCtrlPiesEnf: boolean;
  planEcicepInterconsulta: boolean; planEcicepInterconsultaEspecialidad: string;
  planProximoControlTiempo: string;
  planProximoControlDupla: string;
  indicaciones: string;
}

export interface FichaConsultaPasmiFormData extends BaseFichaData {
  fechaConsulta: string;
  profesionalResponsable: string;
  motivoConsulta: string;

  // Antecedentes Personales
  edad: string;
  antecedentesMedicos: string;
  alergias: string;
  farmacos: string;
  hospitalizaciones: string;
  consultasUrgencias: string;
  derivaciones: string;

  // Contexto Escolar
  colegio: string;
  curso: string;
  rendimiento: string;
  comportamiento: string;
  relacionPares: string;
  relacionSuperiores: string;
  tareasEscolares: string;
  bullying: string;
  pie: string; // Programa de Integración Escolar (PIE)

  // Contexto Domiciliario
  integrantesGrupoFamiliar: string;
  ocupacionPadres: string;
  intereses: string;
  actividadesExtraprogramaticas: string;
  alimentacion: string;
  apetito: string;
  sueno: string;

  // Contexto Psicosocial
  psicosocialImpulsividad: string;
  psicosocialAnimo: string;
  psicosocialAnsiosos: string;
  psicosocialSomatizaciones: string;
  psicosocialIdeacionSuicida: string;

  // Examen Mental
  examenMentalVigilancia: string;
  examenMentalContacto: string;
  examenMentalLenguaje: string;
  examenMentalAfectos: string;
  examenMentalPsicomotricidad: string;
  examenMentalPensamiento: string;
  examenMentalPercepcion: string;
  examenMentalIntelectual: string;
  examenMentalJuicio: string;
  examenMentalInsight: string;

  // Plan
  planControlMensual: boolean;
  planInterconsulta: boolean;
  planExamenes: boolean;
  planObservacion: boolean;
  planAltaMedica: boolean;
  planIndicacionesAdicionales: string;
  planProximoControlTiempo: string;
  planProximoControlDupla: string;
  indicaciones: string;

  // PCI
  pccPersonaFamilia?: string;
  pccEquipoSalud?: string;
  tomaDecisionesCompartidas?: string;
  opcionesConversadas?: string;
  pccObjetivos?: PccObjetivo[];
  acuerdoPlanEquipo?: string;
  acuerdoContactoSeguimiento?: string;
}

export interface IngresoDemenciasFormData extends BaseFichaData {
  omitirOpcionales: boolean;
  fechaIngreso: string;
  diagnosticoPrincipal: string;
  motivoConsulta: string;
  sexo: 'Masculino' | 'Femenino' | '';
  hospitalizacionesRecientes: boolean;
  hospitalizacionesRecientesAclaracion: string;
  eventosCardiovasculares: boolean;
  eventosCardiovascularesAclaracion: string;
  historiaTEC: boolean;
  historiaTECAclaracion: string;
  antecedentesFamiliares: string;
  farmacos: string;
  adherenciaTratamiento: 'Sí' | 'No' | '';
  adherenciaTratamientoAclaracion: string;
  alergias: boolean;
  alergiasAclaracion: string;
  cirugias: boolean;
  cirugiasAclaracion: string;
  hospitalizaciones: boolean;
  hospitalizacionesAclaracion: string;
  controlExtrasistema: boolean;
  controlExtrasistemaAclaracion: string;
  alcohol: boolean;
  alcoholAclaracion: string;
  tabaco: boolean;
  tabacoAclaracion: string;
  drogas: boolean;
  drogasAclaracion: string;
  viveCon: string;
  cuidadorPrincipal: string;
  relacionCuidador: string;
  redesApoyo: string;
  actividadesComunitarias_masama: boolean;
  actividadesComunitarias_talleres: boolean;
  actividadesComunitarias_juntaVecinal: boolean;
  actividadesComunitarias_clubAdultoMayor: boolean;
  actividadesComunitarias_otra: boolean;
  actividadesComunitarias_otraDetalle: string;
  actividadesFamiliares: string;
  alimentacion: string;
  deglucion: string;
  deposiciones: string;
  miccion: string;
  dolor: string;
  caidas: string;
  cognicion: string;
  olvidosFrecuentes: 'Sí' | 'No' | '';
  olvidosFrecuentesAclaracion: string;
  orientacionTE: string;
  atencion: string;
  organizacionMental: string;
  sueno: string;
  npiqScore?: string;
  animoTest?: 'PHQ-9' | 'Yesavage' | 'Cornell' | '';
  animoScore?: string;
  cuidadorTest?: 'Zarit' | 'Readiness' | '';
  cuidadorScore?: string;
  biografiaVida: string;
  escolaridad: string;
  alfabetizacion: string;
  abvd: string;
  barthelScore?: string;
  aivd: string;
  lawtonBrodyScore?: string;
  laboratorioFecha: string;
  laboratorioResultados: string;
  ekgFecha: string;
  ekgResultados: string;
  otrasImagenesFecha: string;
  otrasImagenesResultados: string;
  peso: string;
  talla: string;
  imc: string;
  pa: string;
  fc: string;
  cc: string;
  examenFisicoGeneralSegmentario: string;
  neuroParesia: string;
  neuroROT: string;
  neuroDiadococinesia: string;
  neuroMarcha: string;
  neuroParesCraneales: string;
  testNeurocognitivo: 'mmse' | 'mis' | 'moca' | 'reloj' | 'fototest' | 'rudas' | '';
  testNeurocognitivoPuntaje: string;
  actuacion_ges: boolean;
  actuacion_tallerCuidadores: boolean;
  actuacion_tallerCaidas: boolean;
  actuacion_manejoMultidisciplinario: boolean;
  actuacion_evaluacionCuidadora: boolean;
  actuacion_controlMedico: string;
  actuacion_manejoSindrome: boolean;
  actuacion_derivacionCedem: boolean;
}

export interface FichaControlDemencias2026FormData extends FichaIngresoEcicepFormData {
    objetivosAnteriores: ObjetivoAnterior[];
    integralRiesgoCv: string;
}

export interface FichaVisitaDomiciliariaFormData {
  sector: string;
  direccion: string;
  prestadores: string;
  derivadoPor: string;
  familia: string;
  viaDerivacion: string;
  viaDerivacionAclare: string;
  fechaVdi: string;
  fechaPautaVdi: string;
  integrantes: { nombre: string; edad: string; parentesco: string }[];
  objetivos: string[];
  expectativasFamilia: string;
  cuidadorPrincipal: string;
  cuidadorEdad: string;
  cuidadorEnfermedades: string;
  viviendaTenencia: string;
  viviendaTenenciaObs: string;
  problemasViviendaFamilia: string;
  problemasViviendaEquipo: string;
  serviciosAguaPotable: boolean;
  serviciosSistemaElectrico: boolean;
  serviciosDisposicionDesechos: boolean;
  serviciosObs: string;
  problemasPriorizados: { problema: string; puntaje: string }[];
  recursosPersonales: string;
  recursosMateriales: string;
  recursosFuncionales: string;
  recursosOtros: string;
  otrasIntervenciones: 'Sí' | 'No' | '';
  otrasIntervencionesAclare: string;
  realizaTarjeton: 'Sí' | 'No' | '';
  otrosInstrumentos: 'Sí' | 'No' | '';
  otrosInstrumentosAclare: string;
  firmoConsentimiento: 'Sí' | 'No' | '';
  registraPci: 'Sí' | 'No' | '';
  continuidadAtencionObs: string;
  logroObjetivos: 'Sí' | 'No' | '';
  logroObjetivosObs: string;
  logroExpectativas: 'Sí' | 'No' | '';
}

export interface FichaDemenciaFormData {
  nombrePaciente: string;
  rutPaciente: string;
  edad: string;
  sexo: string;
  omitOptional: boolean;
  hospitalizacionesRecientes: string;
  eventosCardiovasculares: string;
  antecedentesFamiliares: string;
  farmacosHabituales: string;
  cirugias: string;
  alergias: string;
  oh: string;
  tabaco: string;
  drogas: string;
  historiaTEC: string;
  viveCon: string;
  cuidadorPrincipal: string;
  redesApoyo: string;
  actividadesComunitarias: string;
  actividadesFamiliares: string;
  alimentacion: string;
  deglucion: string;
  deposiciones: string;
  miccion: string;
  dolor: string;
  caidas: string;
  examenesDemenciaSecundaria: string;
  historiaDeficitCognitivo: string;
  olvidosFrecuentes: string;
  orientacionTemporoEspacial: string;
  atencion: string;
  organizacionMental: string;
  sueno: string;
  npiq_delirios: boolean;
  npiq_alucinaciones: boolean;
  npiq_agitacion: boolean;
  npiq_depresion: boolean;
  npiq_ansiedad: boolean;
  npiq_euforia: boolean;
  npiq_apatia: boolean;
  npiq_inhibicion: boolean;
  npiq_irritabilidad: boolean;
  npiq_motor: boolean;
  npiq_nocturnas: boolean;
  npiq_apetito: boolean;
  animo_phq9: string;
  animo_yesavage: string;
  impacto_zarit: string;
  impacto_readiness: string;
  funcional_biografia: string;
  escolaridad: string;
  alfabetismo: string;
  abvd_barthel: string;
  aivd_lawton: string;
  tAdlq: string;
  examenFisico_general: string;
  neuro_paresia: string;
  neuro_rot: string;
  neuro_diadococinesia: string;
  neuro_marcha: string;
  neuro_paresCraneales: string;
  test_mmse: boolean;
  test_mis: boolean;
  test_moca: boolean;
  test_reloj: boolean;
  test_fototest: boolean;
  test_rudas: boolean;
  diagnostico: string;
  demencia_tipo_alzheimer: boolean;
  demencia_tipo_vascular: boolean;
  demencia_tipo_lewy: boolean;
  demencia_tipo_frontotemporal: boolean;
  demencia_tipo_pseudodemencia: boolean;
  demencia_severidad: string;
  demencia_sintomasAsociados: string;
  demencia_funcionalidad: string;
  sg_caidas: boolean;
  sg_incontinencia: boolean;
  sg_hipotension: boolean;
  sg_polifarmacia: boolean;
  sg_fragilidad: boolean;
  sg_sarcopenia: boolean;
  comorbilidades: string;
  plan_ges: boolean;
  plan_taller_cuidadores: boolean;
  plan_taller_cuidadores_lugar: string;
  plan_taller_caidas: boolean;
  plan_manejo_multidisciplinario: boolean;
  plan_manejo_especifico: boolean;
  plan_derivacion_cedem: boolean;
}

export interface FichaControlNinoSano1MesFormData {
  sexo: string;
  peso: string;
  talla: string;
  perimetroCefalico: string;
  calificacionNutricional: string;
  calificacionEstatural: string;
  evaluacionPerimetroCefalico: string;
  edad: string;
  acudeJuntoA: string;
  estadoGeneral: string;
  naneasPresente: boolean;
  naneasDetalle: string;
  perinatalGpa: string;
  perinatalControles: string;
  perinatalPatologias: string;
  perinatalParto: string;
  perinatalRnt: string;
  perinatalPatologiasRecienNacido: string;
  perinatalInmunizaciones: string;
  perinatalScreening: string;
  perinatalPkuTsh: string;
  perinatalAlta: string;
  perinatalPesoAlta: string;
  personalesEnfermedades: string;
  personalesHospitalizaciones: string;
  personalesAlimentacion: string;
  personalesHigiene: string;
  personalesHabitoMiccional: string;
  personalesHabitoIntestinal: string;
  personalesSueno: string;
  personalesInmunizacionesAlDia: string;
  personalesSeguridad: string;
  socialesEdadPadres: string;
  socialesVivenCon: string;
  socialesCuidadoPor: string;
  socialesAsisteSalaCuna: string;
  socialesTabaquismoFamiliar: string;
  socialesMascotas: string;
  familiaresRelacion: string;
  familiaresPatologias: string;
  familiaresHipoacusia: string;
  efGeneral: string;
  efPiel: string;
  efCabezaCuello: string;
  efOftalmologico: string;
  efAuditivo: string;
  efMucosaOral: string;
  efAdenopatias: string;
  efCardiopulmonar: string;
  efAbdomen: string;
  efGenitoanal: string;
  efNeurologico: string;
  efSenalesMaltrato: string;
  antropometria: string;
  scoreRMN: string;
  scoreNeurosensorial: string;
  diagnosticos: string;
  patologia: string;
  riesgoPsicosocial: string;
  indicaciones: string;
  proximoControl: string;
  // Reflejos arcaicos
  reflejoMoro: 'Presente' | 'Alterado' | 'Ausente';
  reflejoMoroDetalle: string;
  reflejoBusqueda: 'Presente' | 'Alterado' | 'Ausente';
  reflejoBusquedaDetalle: string;
  reflejoSuccion: 'Presente' | 'Alterado' | 'Ausente';
  // FIX: Removed duplicate reflejoBusquedaDetalle and reflejoSuccion properties to resolve duplicate identifier errors.
  reflejoSuccionDetalle: string;
  reflejoPrensionPalmar: 'Presente' | 'Alterado' | 'Ausente';
  reflejoPrensionPalmarDetalle: string;
  reflejoPrensionPlantar: 'Presente' | 'Alterado' | 'Ausente';
  reflejoPrensionPlantarDetalle: string;
  reflejoBabinski: 'Presente' | 'Alterado' | 'Ausente';
  reflejoBabinskiDetalle: string;
  reflejoGalant: 'Presente' | 'Alterado' | 'Ausente';
  reflejoGalantDetalle: string;
}

export interface FichaControlNinoSano3MesFormData extends FichaControlNinoSano1MesFormData {
  vacunas: string;
  patologiasNacimientoPresente: boolean;
  patologiasNacimientoDetalle: string;
  hospitalizacionesPresente: boolean;
  hospitalizacionesDetalle: string;
  urgenciasPresente: boolean;
  urgenciasDetalle: string;
  accidentesPresente: boolean;
  accidentesDetalle: string;
  alimentacionLME: string;
  alimentacionOtrasLechesAgua: string;
  alimentacionVitaminasHierro: string;
  habitosHigiene: string;
  habitosDiuresis: string;
  habitosIntestinal: string;
  habitosSueno: string;
  habitosSeguridad: string;
  reflejoTonicoCervical: 'Presente' | 'Alterado' | 'Ausente';
  reflejoTonicoCervicalDetalle: string;
  reflejoMarchaAutomatica: 'Presente' | 'Alterado' | 'Ausente';
  reflejoMarchaAutomaticaDetalle: string;
  reflejoApoyoPositivo: 'Presente' | 'Alterado' | 'Ausente';
  reflejoApoyoPositivoDetalle: string;
}

export interface FichaControlNinoSano6AnosFormData {
  antecedentesFarmacos: string;
  antecedentesCirugias: string;
  antecedentesAlergias: string;
  antecedentesHospitalizacion: string;
  antecedentesVacunas: string;
  nutricionAlimentacion: string;
  nutricionAmbiente: string;
  nutricionChatarra: string;
  nutricionHidratacion: string;
  higieneBano: string;
  higieneVestimenta: string;
  higieneManos: string;
  higieneDental: string;
  actividadFisica: string;
  eliminacionPatrones: string;
  suenoHigiene: string;
  suenoDificultades: string;
  suenoParasomnias: string;
  hogarFamilia: string;
  hogarEstresores: string;
  conductaRelaciones: string;
  conductaRendimiento: string;
  conductaAutoridad: string;
  conductaRecreativas: string;
  conductaAccidentes: string;
  conductaPantallas: string;
  efPeso: string;
  efTalla: string;
  efImc: string;
  efPercentilImc: string;
  efGeneral: string;
  efTiroides: string;
  efTorax: string;
  efAbdomen: string;
  efEeii: string;
  efMarcha: string;
  efTestAdams: string;
  efPiePlano: string;
  diagnosticos: string;
  indicaciones: string;
}

export interface FichaControlEpilepsiaFormData {
  nombrePaciente: string;
  rutPaciente: string;
  patologias: string;
  thisTreatmentActual: string; // Internal to avoid name collision in component
  tratamiento: string;
  adherenciaTratamiento: boolean;
  tabaco: boolean;
  oh: boolean;
  drogas: boolean;
  mac: boolean;
  ultimaCrisis: string;
  desencadenante: string;
  controlNeurologo: string;
  indicacionesSecundaria: string;
  examenes: string;
  examenFisico: string;
  planProximoControl: string;
  planTratamiento: string;
  planExamenes: string;
}

export interface FichaControlArtrosisFormData {
  nombrePaciente: string;
  rutPaciente: string;
  patologias: string;
  tratamiento: string;
  dolor: string;
  rigidezArticular: string;
  respuestaAnalgesia: string;
  kinesiterapia: string;
  actividadFisica: string;
  tabaco: boolean;
  oh: boolean;
  radiografia: string;
  examenFisico: string;
  articulacionesAfectadas: string;
  planProximoControl: string;
  planTratamiento: string;
  planExamenes: string;
}

export interface FichaFondoOjoFormData {
  nombrePaciente: string;
  rutPaciente: string;
  sexo: string;
  edad: string;
  tipoAtencion: string;
  antecedentes: string;
  farmacos: string;
  fechaExamen: string;
  resultado: string;
  indicacionEducacion: boolean;
  indicacionSeguimientoPscv: boolean;
  indicacionOftalmoUapo: boolean;
  indicacionOftalmoHospital: boolean;
  indicacionControlesPeriodicos: boolean;
  fono: string;
}

export interface FichaPreingresoEcicepFormData {
    estadoCivilHijos?: string;
    factoresProtectores?: string;
  fechaIngreso: string;
  profesionalResponsable: string;
  duplaProfesionalOtro: string;
  duplaProfesionalOtroNombre: string;
  sinDupla?: boolean;
  estratificacion: string;
  incluirControlCardiovascular: boolean;
  incluirControlHipotiroidismo: boolean;
  incluirControlArtrosis: boolean;
  incluirControlEpilepsia: boolean;
  incluirControlSalaEra: boolean;
  incluirControlSalaIra: boolean;
  incluirControlDemencias: boolean;
  incluirControlSm: boolean;
  edad: string;
  sexo: string;
  anamnesisGeneral: string;
  antecedentesPersonales: string;
  morbilidad: string;
  adherenciaTratamiento: string;
  ramFarmacos: string;
  ramFarmacosAclaracion: string;
  alergias: string;
  cirugias: string;
  hospitalizaciones: string;
  controlExtrasistema: string;
  factoresRiesgo: string[];
  antecedentesMedicos: string;
  farmacos: string;
  alergiasPresentes: boolean;
  alergiasDetalle: string;
  cirugiasPresentes: boolean;
  cirugiasDetalle: string;
  hospitalizacionesPresentes: boolean;
  hospitalizacionesDetalle: string;
  controlExtrasistemaPresentes: boolean;
  controlExtrasistemaDetalle: string;
  consultasUrgenciasPresentes: boolean;
  consultasUrgenciasDetalle: string;
  adherenciaTratamientoPresentes: boolean;
  adherenciaTratamientoDetalle: string;
  encuestaAlimentaria: string;
  adhierePautaNutricional: string;
  escolaridad: string;
  ocupacion: string;
  antecedentesFamiliares: string;
  viveCon: string;
  redesApoyo: string;
  percepcionEconomica: string;
  espiritualidad: string;
  alcohol: boolean;
  alcoholAclaracion: string;
  tabaco: boolean;
  tabacoAclaracion: string;
  ipaNroCigarrillos: string;
  ipaNroAnos: string;
  ipaResultado: string;
  drogas: boolean;
  drogasAclaracion: string;
  actividadFisicaHabito: string;
  habitoMiccional: string;
  habitoDefecatorio: string;
  actividadSexualProteccion: string;
  antecedentesGineco: string;
  fum: string;
  sintomasClimaterio: string;
  mamografiaDia: string;
  papVigente: string;
  empam: string;
  fondoOjo: string;
  podologo: string;
  evaluacionPie: string;
  atencionesPsa: string;
  examenesFecha: string;
  examenes: string;
  vacunas: string;
  ekgFecha: string;
  ekgResultados: string;
  otrasImagenesFecha?: string;
  otrasImagenesResultados?: string;
  telefonoPrefijo: string;
  telefonoNumero: string;
  gestionIngresoEstado: string;
  gestionIngresoMes: string;
  gestionIngresoPunto: string;
  gestionIngresoDupla: string;
  indicaciones: string;
  // Ánimo section
  phq9_interes: string;
  phq9_animo: string;
  phq9_sueno: string;
  phq9_energia: string;
  phq9_apetito: string;
  phq9_culpa: string;
  phq9_concentracion: string;
  phq9_motor: string;
  phq9_suicidio: string;
  animo_estadoAnimo: string;
  animo_habitoSueno: string;
  animo_percepcionSalud: string;
  animo_ideacionSuicida: string;
  // Dimensión Social section (already has some, but ensuring consistency)
  // Valoración Integral section
  integralIndividual: string;
  integralFamiliar: string;
  integralTipologia: string;
  integralCronicas: string;
  // Symptoms cardiovascular section
  cv_sintoma_ortopnea: boolean;
  cv_sintoma_dpn: boolean;
  cv_sintoma_nicturia: boolean;
  cv_sintoma_edema: boolean;
  cv_sintoma_angor: boolean;
  cv_sintoma_palpitaciones: boolean;
  cv_sintoma_polidipsia: boolean;
  cv_sintoma_poliuria: boolean;
  cv_sintoma_polifagia: boolean;
  cv_sintoma_perdida_peso: boolean;
  // Symptoms ERA section
  era_sintoma_tos: boolean;
  era_sintoma_opresion: boolean;
  era_sintoma_rinorrea: boolean;
  era_sintoma_estornudos: boolean;
  era_sintoma_prurito: boolean;
  era_sintoma_limitan: boolean;
  era_sintoma_diarios: boolean;
  era_sintoma_nocturnos: boolean;
  era_sintoma_sbt_sos: boolean;
  era_sintoma_urgencias: boolean;
  era_sintoma_corticoides: boolean;
  // Desencadenantes Ambientales section
  era_desencadenante_mascotas: boolean;
  era_desencadenante_higiene: boolean;
  era_desencadenante_alfombras: boolean;
  era_desencadenante_tabaco_ambiental: boolean;
  era_desencadenante_cocina: boolean;
  era_desencadenante_calefaccion: boolean;
}

export interface FichaControlNinoSanoFormData {
  fechaControl: string;
  edadCorregidaCronologica: string;
  naneas: boolean;
  naneasPatologia: string;
  grupoEtario: string;
  acompanadoPor: string;
  acompanadoPorOtros: string;
  estadoGeneral: string;
  consultasPreviasUrgencia: string;
  viveCon: string;
  trabajoPadresCuidador: string;
  antecedentesFamiliaresECNT: string;
  antecedentesMorbidosAlergicos: string;
  antecedentesQuirurgicosHospitalizacion: string;
  asisteA: string;
  asisteAOtro: string;
  tipoAlimentacion: string;
  tipoAlimentacionAclaracion: string;
  numComidasDiarias: string;
  eliminacion: string;
  higieneCorporal: string;
  higieneBucal: string;
  reposoSueno: string;
  medicamentosSuplementos: string;
  vacunasAlDia: boolean;
  esquemaIncompleto: boolean;
  esquemaIncompletoDetalle: string;
  dsmResultado: string;
  asisteSet: boolean;
  usoMacMadre: boolean;
  usoMacMadreAclaracion: string;
  resultadoEdimburgo: string;
  resultadoScoreIRA: string;
  resultadoMalnutricionExceso: string;
  resultadoPautaSeguridadInfantil: string;
  telefonoContacto: string;
  edadIndicaciones: string;
  indicacionesPorEdad: string;
}

export interface FichaControlCardiovascularFormData {
  fechaControl: string;
  antecedentesMorbidos: string;
  antecedentesHospitalizaciones: string;
  iam: boolean;
  acv: boolean;
  asisteAcompanado: string;
  viveCon: string;
  dinamicaFamiliar: string;
  tipoTrabajoPensionados: string;
  pap: boolean;
  vacunas: boolean;
  baciloscopia: boolean;
  htaTinitus: boolean;
  htaFotopsia: boolean;
  htaEdema: boolean;
  htaPrecordalgia: boolean;
  htaMareos: boolean;
  htaCefalea: boolean;
  dmPoliuria: boolean;
  dmPolidipsia: boolean;
  dmPolifagia: boolean;
  medicamentos: string;
  alimentacion: string;
  alcohol: string;
  tabaco: string;
  actividadFisica: string;
  sueno: string;
  suenoAclaracion: string;
  eliminacion: string;
  proximoControl: string;
  derivacion: string;
}

export interface FichaControlAdultoMayorFormData {
  fechaControl: string;
  edad: string;
  sexo: string;
  asisteCompaniaDe: string;
  usoAyudasTecnicas: string;
  viveCon: string;
  ocupacion: string;
  redesApoyo: string;
  setEscolaridad: string;
  antecedentesMorbidos: string;
  tratamientoFarmacologicoActual: string;
  alimentacion: string;
  ingestaLiquidos: string;
  oh: string;
  tabaquismo: string;
  actividadFisica: string;
  sueno: string;
  orina: string;
  deposiciones: string;
  incontinencia: string;
  usoLaxantes: string;
  actividadSexual: string;
  examenMamas: string;
  vacunas: string;
  sintomatologia: string;
  alteracionVisual: string;
  alteracionVisualAclaracion?: string;
  alteracionAuditiva: string;
  alteracionAuditivaAclaracion?: string;
  participacionSocial: string;
  hobbiesBienestar: string;
  derivacionVacunatorio: boolean;
  derivacionPacam: boolean;
  derivacionControlesPendientes: boolean;
  consejeriaAlimentacionSaludable: boolean;
  refuerzaEstimulacionCognitiva: boolean;
  derivacionMasAma: boolean;
  tallerCaidas: boolean;
  derivacionMedicoDepresion: boolean;
  derivacionMedicoDemencia: boolean;
  derivacionMedicoInterconsulta: boolean;
  proximoControlMeses: string;
  tomaDecisionesCompartidas: string;
}

export interface FichaGrupalDiabetesFormData {
  nombrePaciente: string;
  rutPaciente: string;
  edad: string;
  sexo: string;
  antecedentesMedicos: string;
  medicacionActual: string;
  hba1c: string;
  perfilHemoglucotest: string;
  planMantenerTratamiento: boolean;
  planAltaGrupal: boolean;
  planAgendarHoraMedico: boolean;
  planAsistirProximoEncuentro: boolean;
  planSolicitarHba1c: boolean;
  planSolicitarNuevoHgt: boolean;
}

export interface FoodCategory {
  title: string;
  headers: string[];
  data: (string | number)[][];
}

export type Priority = 'Alta' | 'Mediana' | 'Baja';
export type ActivityType = 'Otra' | 'Hospital digital' | 'Consultoría SM' | 'Receta' | 'Sector rojo' | 'Interconsulta' | 'Derivación' | 'SOME' | 'GES' | 'Llamado';

export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  priority: Priority;
  activity: ActivityType;
  createdAt: number;
}

export interface FichaControlSalaEraFormData {
  edad: string;
  acompanante: string;
  acompananteOtroAclaracion: string;
  antecedentesMedicos: string;
  antecedeEraAsma: boolean;
  antecedeEraEpoc: boolean;
  antecedeEraErge: boolean;
  antecedeEraCancerPulmon: boolean;
  alergias: boolean;
  alergiasAclaracion: string;
  farmacos: string;
  adherenciaTratamiento: string;
  hospitalizaciones: boolean;
  hospitalizacionesAclaracion: string;
  neumonia: boolean;
  pneumoniaAclaracion: string;
  exacerbaciones: boolean;
  exacerbacionesAclaracion: string;
  // FIX: Renamed corticoidesSistemicedAntecedente to corticoidesSistemicosAntecedente to resolve typo.
  corticoidesSistemicosAntecedente: boolean;
  corticoidesSistemicosAntecedenteAclaracion: string;
  tabaquismo: boolean;
  tabaquismoAclaracion: string;
  ipaNroCigarrillos: string;
  ipaNroAnos: string;
  ipaResultado: string;
  alcohol: boolean;
  alcoholAclaracion: string;
  drogas: boolean;
  drogasAclaracion: string;
  exposicionVolatiles: boolean;
  exposicionVolatilesAclaracion: string;
  antecedentesFamiliaresResp: boolean;
  antecedentesFamiliaresRespAclaracion: string;
  laboratorioFecha: string;
  laboratorioResultados: string;
  historiaActual: string;
  sintomasTosRisaEjercicioFrio: boolean;
  sintomasTosRisaEjercicioFrioAclaracion: string;
  sintomasSensacionOpresionToracica: boolean;
  sintomasSensacionOpresionToracicaAclaracion: string;
  sintomasRinorrea: boolean;
  sintomasRinorreaAclaracion: string;
  sintomasEstornudosSalva: boolean;
  sintomasEstornudosSalvaAclaracion: string;
  sintomasPruritoNasalOcular: boolean;
  sintomasPruritoNasalOcularAclaracion: string;
  sintomasLimitanActividades: boolean;
  sintomasLimitanActividadesAclaracion: string;
  sintomasDiarios: boolean;
  sintomasDiariosAclaracion: string;
  sintomasNocturnos: boolean;
  sintomasNocturnosAclaracion: string;
  sintomasRequerimientoSbtSos: boolean;
  sintomasRequerimientoSbtSosAclaracion: string;
  sintomasConsultasSapuUrgencias: boolean;
  sintomasConsultasSapuUrgenciasAclaracion: string;
  sintomasUsoCorticoidesSistemicos: boolean;
  sintomasUsoCorticoidesSistemicosAclaracion: string;
  mMRCScore: string;
  desencadenantesMascotas: boolean;
  desencadenantesMascotasAclaracion: string;
  desencadenantesHigieneHogar: boolean;
  desencadenantesHigieneHogarAclaracion: string;
  desencadenantesAlfombras: boolean;
  desencadenantesAlfombrasAclaracion: string;
  desencadenantesHabitoTabaquicoAmbiental: boolean;
  desencadenantesHabitoTabaquicoAmbientalAclaracion: string;
  desencadenantesCocinaLenaCarbon: boolean;
  desencadenantesCocinaLenaCarbonAclaracion: string;
  desencadenantesCalefaccion: boolean;
  desencadenantesCalefaccionAclaracion: string;
  efPielMucosas: string;
  efMucosaNasal: string;
  efCavidadOral: string;
  efCardiologico: string;
  efPulmonar: string;
  efGeneralAdicional: string;
  planEducacionPatologiaPrevencion: string;
  planEducacionUsoAerocamara: string;
  planVacunas: string;
  planConsultarUrgenciasSos: string;
  planOtros: string;
  espirometriaResultados: any[];
  espirometriaInterpretacion: string;
}

export interface FichaControlSalaIraFormData extends FichaControlSalaEraFormData {
  antecedenteSBOA: boolean;
  antecedenteSBOR: boolean;
  antecedenteAsma: boolean;
  antecedenteRinitis: boolean;
  antecedenteDermatitis: boolean;
  antecedentePrurigo: boolean;
  // FIX: Added scoreRMN and scoreNeurosensorial to resolve Property '...' does not exist on type 'FichaControlSalaIraFormData' errors.
  scoreRMN: string;
  scoreNeurosensorial: string;
}

export interface FichaControlEcicepFormData {
    borgScaleResult?: string;
  fechaControlActual: string;
  fechaControlAnterior: string;
  ingresoControlAnterior: string;
  estadoSaludDesdeUltimoControl: string;
  cambiosDinamicaFamiliar: string;
  cambiosDinamicaFamiliarAclaracion: string;
  controlesExtrasistema: string;
  controlesExtrasistemaAclaracion: string;
  ram: string;
  ramAclaracion: string;
  requiereEducacionFarmacos: string;
  requiereEducacionFarmacosAclaracion: string;
  opcionesConversadas: string;
  planConsensuadoAnterior: string; // Deprecated but kept for compatibility
  objetivosAnteriores: ObjetivoAnterior[]; // Structured replacement
  cumplioMetasPropuestas: string; // Deprecated but kept for compatibility
  duplaProfesional: string;
  duplaProfesionalOtroNombre: string;
  sinDupla?: boolean; // Nueva propiedad
  estratificacion: string;
  phq9Resultado?: string;
  planProximoControlDupla: string;
  planProximoControlTiempo: string;
  indicaciones?: string;
  // Added missing inclusion flags to support new form logic
  incluirControlCardiovascular: boolean;
  incluirControlHipotiroidismo: boolean;
  incluirControlArtrosis: boolean;
  incluirControlEpilepsia: boolean;
  incluirControlSalaEra: boolean;
  incluirControlSalaIra: boolean;
  incluirControlDemencias: boolean;
  // Added missing planEcicep fields
  planEcicepLabsRutina: boolean;
  planEcicepEKG: boolean;
  planEcicepHBA1C: boolean;
  planEcicepHBA1CTiempo: string;
  planEcicepFondoOjo: boolean;
  planEcicepCtrlPiesEnf: boolean;
  planEcicepInterconsulta: boolean;
  planEcicepInterconsultaEspecialidad: string;
  sexo: string;
  anamnesisGeneral: string;
  antecedentesPersonales: string;
  morbilidad: string;
  farmacos: string;
  adherenciaTratamiento: string;
  alergiasPresentes: boolean;
  alergiasDetalle: string;
  cirugiasPresentes: boolean;
  cirugiasDetalle: string;
  hospitalizacionesPresentes: boolean;
  hospitalizacionesDetalle: string;
  controlExtrasistemaPresente: boolean;
  controlExtrasistemaDetalle: string;
  empam: string;
  fondoOjo: string;
  podologo: string;
  evaluacionPie: string;
  // FIX: Added atencionesPsa to resolve Property 'atencionesPsa' does not exist on type 'FichaControlEcicepFormData' error.
  atencionesPsa: string;
  vacunas: string;
  alcoholPresente: boolean;
  alcoholDetalle: string;
  tabacoPresente: boolean;
  tabacoDetalle: string;
  drogasPresentes: boolean;
  drogasDetalle: string;
  actividadFisicaPresente: boolean;
  actividadFisicaDetalle: string;
  habitoMiccional: string;
  habitoDefecatorio: string;
  actividadSexual: string;
  encuestaAlimentaria: string;
  estadoSueno: string;
  horasSueno: string;
  dificultadConciliacionPresente: boolean;
  dificultadConciliacionDetalle: string;
  dificultadMantencionPresente: boolean;
  dificultadMantencionDetalle: string;
  evolucionDesdeControlAnterior: string;
  phq9_interes: string;
  phq9_animo: string;
  phq9_sueno: string;
  phq9_energia: string;
  phq9_apetito: string;
  phq9_culpa: string;
  phq9_concentracion: string;
  phq9_motor: string;
  phq9_suicidio: string;
  estadoAnimoDesc: string;
  habitoSuenoDesc: string;
  ideacionSuicidaDesc: string;
  escolaridad: string;
  ocupacion: string;
  antecedentesFamiliaresRelevantes: string;
  viveCon: string;
  redesApoyo: string;
  percepcionSituacionEconomica: string;
  espiritualidad: string;
  factoresProtectores: string;
  estadoCivilHijos: string;
  fechaExamenLaboratorio: string;
  resultadosLaboratorio: string;
  ekgFecha: string;
  ekgResultados: string;
  otrasImagenesFecha: string;
  otrasImagenesResultados: string;
  peso: string;
  talla: string;
  imc: string;
  pa: string;
  fc: string;
  cc: string;
  examenFisicoGeneralSegmentario: string;
  pccPersonaFamilia?: string;
  pccEquipoSalud?: string;
  pccObjetivos?: PccObjetivo[];
  integralIndividual?: string;
  integralFamiliar?: string;
  integralTipologia?: string;
  integralCronicas?: string;
  integralRiesgoCv?: string;
  pccProblemasPersona?: string;
  pccProblemasFamiliar?: string;
  pccProblemasEquipo?: string;
  pccPriorizacionEntorno?: string;
  pccPriorizacionBiologico?: string;
  pccPriorizacionSaludFisica?: string;
  pccPriorizacionBienestarEmocional?: string;
  planConsensuado?: string;
  tomaDecisionesCompartidas?: string;
  acuerdoPlanEquipo: string;
  acuerdoContactoSeguimiento: string;
  indicacionesAdicionales: string;

}

export interface FichaIngresoEcicepFormData {
    borgScaleResult?: string;
  fechaIngreso: string;
  duplaProfesionalOtro: string;
  duplaProfesionalOtroNombre: string;
  sinDupla?: boolean; // Nueva propiedad
  estratificacion: string;
  // New checkbox flags for including specific control sections
  incluirControlCardiovascular: boolean;
  incluirControlHipotiroidismo: boolean;
  incluirControlArtrosis: boolean;
  incluirControlEpilepsia: boolean;
  incluirControlSalaEra: boolean;
  incluirControlSalaIra: boolean;
  incluirControlDemencias: boolean;
  incluirControlSm: boolean;
  edad: string;
  sexo: string;
  anamnesisGeneral: string;
  antecedentesPersonales: string;
  morbilidad: string;
  farmacos: string;
  adherenciaTratamiento: string;
  ramFarmacos: string;
  ramFarmacosAclaracion: string;
  alergias: string;
  cirugias: string;
  hospitalizaciones: string;
  controlExtrasistema: string;
  controlExtrasistemaAclaracion: string;
  empam: string;
  fondoOjo: string;
  podologo: string;
  evaluacionPie: string;
  atencionesPsa: string;
  factoresRiesgo: string[];
  vacunas: string;
  antecedentesGineco: string;
  fum: string;
  sintomasClimaterio: string;
  mamografiaDia: string;
  papVigente: string;
  alcohol: boolean;
  alcoholAclaracion: string;
  tabaco: boolean;
  tabacoAclaracion: string;
  ipaNroCigarrillos: string;
  ipaNroAnos: string;
  ipaResultado: string;
  drogas: boolean;
  drogasAclaracion: string;
  actividadFisicaHabito: string;
  habitoMiccional: string;
  habitoDefecatorio: string;
  actividadSexualProteccion: string;
  encuestaAlimentaria: string;
  estadoSueno: string;
  horasSueno: string;
  dificultadConciliacion: string;
  dificultadMantencion: string;
  phq9_interes: string;
  phq9_animo: string;
  phq9_sueno: string;
  phq9_energia: string;
  phq9_apetito: string;
  phq9_culpa: string;
  phq9_concentracion: string;
  phq9_motor: string;
  phq9_suicidio: string;
  animo_estadoAnimo: string;
  animo_habitoSueno: string;
  animo_percepcionSalud: string;
  animo_ideacionSuicida: string;
  escolaridad: string;
  ocupacion: string;
  antecedentesFamiliaresRelevantes: string;
  viveCon: string;
  factoresProtectores: string;
  estadoCivilHijos: string;
  redesApoyo: string;
  percepcionSituacionEconomica: string;
  espiritualidad: string;
  laboratorioFecha: string;
  laboratorioResultados: string;
  ekgFecha: string;
  ekgResultado: string;
  otrasImagenesFecha: string;
  otrasImagenesResultados: string;
  peso: string;
  talla: string;
  imc: string;
  pa: string;
  fc: string;
  cc: string;
  efGeneralSegmentario: string;
  
  integralIndividual: string;
  integralFamiliar: string;
  integralTipologia: string;
  integralCronicas: string;
  pccPersonaFamilia: string;
  pccEquipoSalud: string;
  tomaDecisionesCompartidas: string;
  opcionesConversadas: string;
  pccObjetivos: PccObjetivo[];
  acuerdoPlanEquipo: string;
  acuerdoContactoSeguimiento: string;
  planEcicepLabsRutina: boolean;
  planEcicepEKG: boolean;
  planEcicepHBA1C: boolean;
  planEcicepHBA1CTiempo: string;
  planEcicepFondoOjo: boolean;
  planEcicepCtrlPiesEnf: boolean;
  planEcicepInterconsulta: boolean;
  planEcicepInterconsultaEspecialidad: string;
  planProximoControlDupla: string;
  planProximoControlTiempo: string;
  indicaciones: string;
  // Symptoms cardiovascular section
  cv_sintoma_ortopnea: boolean;
  cv_sintoma_dpn: boolean;
  cv_sintoma_nicturia: boolean;
  cv_sintoma_edema: boolean;
  cv_sintoma_angor: boolean;
  cv_sintoma_palpitaciones: boolean;
  cv_sintoma_polidipsia: boolean;
  cv_sintoma_poliuria: boolean;
  cv_sintoma_polifagia: boolean;
  cv_sintoma_perdida_peso: boolean;
  // Symptoms ERA section
  era_sintoma_tos: boolean;
  era_sintoma_opresion: boolean;
  era_sintoma_rinorrea: boolean;
  era_sintoma_estornudos: boolean;
  era_sintoma_prurito: boolean;
  era_sintoma_limitan: boolean;
  era_sintoma_diarios: boolean;
  era_sintoma_nocturnos: boolean;
  era_sintoma_sbt_sos: boolean;
  era_sintoma_urgencias: boolean;
  era_sintoma_corticoides: boolean;
  // Desencadenantes Ambientales section
  era_desencadenante_mascotas: boolean;
  era_desencadenante_higiene: boolean;
  era_desencadenante_alfombras: boolean;
  era_desencadenante_tabaco_ambiental: boolean;
  era_desencadenante_cocina: boolean;
  era_desencadenante_calefaccion: boolean;
  // SM Fields
  sm_sintoma_animo: string;
  sm_sintoma_ansiosos: string;
  sm_sintoma_somatizaciones: string;
  sm_sintoma_sueno: string;
  sm_sintoma_psicoticos: string;
  sm_sintoma_suicidio: string;
  sm_em_descripcion: string;
  sm_em_conciencia: string;
  sm_em_lenguaje: string;
  sm_em_psicomotricidad: string;
  sm_em_pensamiento: string;
  sm_em_percepcion: string;
  sm_em_intelectual: string;
  sm_em_juicio: string;
  sm_em_insight: string;
}

export interface FichaSeguimientoEcicepFormData {
  // Header Info
  ultimoControlEcicepFecha: string;
  profesionalSeguimiento: string;
  edad: string;
  sexo: string;
  estratificacion: string;

  // Anamnesis
  estadoSaludDesdeUltimoControl: string;
  planConsensuadoAnterior: string;
  cumplioMetasPropuestas: 'Sí' | 'No' | '';
  cumplioMetasPropuestasAclaracion: string;

  // Atenciones
  molestiasReferidas: 'Sí' | 'No' | '';
  molestiasReferidasAclaracion: string;
  atencionesDesdeUltimo: 'Sí' | 'No' | '';
  atencionesDesdeUltimoAclaracion: string;
  hospitalizacionesDesdeUltimo: 'Sí' | 'No' | '';
  hospitalizacionesDesdeUltimoAclaracion: string;
  consultasUrgencias: 'Sí' | 'No' | '';
  consultasUrgenciasAclaracion: string;

  // Fármacos
  farmacosEnUso: string;
  dificultadUsoFarmacos: 'Sí' | 'No' | '';
  dificultadUsoFarmacosAclaracion: string;
  dudasFarmacos: 'Sí' | 'No' | '';
  dudasFarmacosAclaracion: string;
  requiereApoyo: 'Sí' | 'No' | '';
  requiereApoyoAclaracion: string;

  // Exploración (Labs)
  labFecha: string;
  labResultados: string;
  ekgFecha: string;
  ekgResultados: string;
  imgFecha: string;
  imgResultados: string;

  // Actuación
  fechaProximoControl: string;
  planSeguimiento: string;
  // FIX: Added planProximoControlDupla and planProximoControlTiempo to match new requirements
  planProximoControlDupla: string;
  planProximoControlTiempo: string;

  // Additional controls inclusion flags
  incluirControlCardiovascular?: boolean;
  incluirControlHipotiroidismo?: boolean;
  incluirControlArtrosis?: boolean;
  incluirControlEpilepsia?: boolean;
  incluirControlSalaEra?: boolean;
  incluirControlSalaIra?: boolean;
  incluirControlDemencias?: boolean;
  incluirControlSm?: boolean;

  // Dynamic checkbox symptoms keys
  [key: string]: any;
}

export interface FichaControlHipotiroidismoFormData extends BaseFichaData {
  edad: string;
  patologias: string;
  treatmentActual: string;
  adherenciaTratamiento: string;
  adherenciaTratamientoAclaracion: string;
  constipacion: string;
  constipacionAclaracion: string;
  intoleranciaFrio: string;
  intoleranciaFrioAclaracion: string;
  debilidadFanereos: string;
  debilidadFanereosAclaracion: string;
  gananciaPeso: string;
  gananciaPesoAclaracion: string;
  adinamia: string;
  adinamiaAclaracion: string;
  ramLvt: string;
  ramLvtAclaracion: string;
  tabaco: boolean;
  tabacoAclaracion: string;
  oh: boolean;
  ohAclaracion: string;
  actividadFisica: string;
  actividadFisicaAclaracion: string;
  controlTsh: string;
  controlTshAclaracion: string;
  ultimoLaboratorioFecha: string;
  ultimoLaboratorioResultados: string;
  estudiosImagenesFecha: string;
  estudiosImagenesResultados: string;
  examenFisico: string;
  proximoControl: string;
  tratamientoPlan: string;
  examenesPlan: string;
}

export interface BitacoraTask {
  id: string;
  patientName: string;
  patientRut: string;
  careDate: string;
  careType: string;
  pendingTasksDetails: string;
  isCompleted: boolean;
}

export interface CalculoLechesFormData {
  vecesPecho: string;
  vecesMamadera: string;
  vecesComida: string;
  edadMeses: string;
  pesoLactante: string;
  volumenPorTomaAjustado: string;
  sexo: string;
  usarPesoIdeal: boolean;
}

export interface FichaIngresoSmFormData {
  edad: string;
  sexo: string;
  sexoOtroAclaracion: string;
  antecedentesMedicos: string;
  antecedePsicoterapia: string;
  antecedentePsicoterapiaPsicologo: string;
  farmacos: string;
  adherenciaTratamiento: string;
  alergias: boolean;
  alergiasAclaracion: string;
  anamnesisProxima: string;
  historyDeVida: string;
  historyFamiliar: string;
  habitoTabaco: boolean;
  habitoTabacoAclaracion: string;
  habitoOh: boolean;
  habitoOhAclaracion: string;
  habitoDrogas: boolean;
  habitoDrogasAclaracion: string;
  estudios: string;
  relacionesSociales: string;
  redesApoyo: string;
  expectativasFuturo: string;
  sintomatologiaAnimo: string;
  sintomatologiaAnsiosos: string;
  sintomatologiaSomatizaciones: string;
  sintomatologiaAlteracionesSueno: string;
  sintomatologiaPsicoticos: string;
  sintomatologiaIdeacionSuicida: string;
  examenMental: string;
  planOtros: string;
}

export interface CurvasCrecimientoFormData {
  sexo: string;
  edad: string;
  peso: string;
  talla: string;
  pc: string;
}

export interface Farmaco {
  registroISP: string;
  medicamento: string;
  formaFarmaceutica: string;
  dosificacion: string;
  programaOges: string;
  observaciones: string;
  tipo: 'URGENCIA' | 'RURAL' | 'APS';
}

export interface FormData {
  fullName: string;
  rut: string;
  address: string;
  city: string;
  diagnosis: string;
  docName: string;
  docTitle: string;
  docRut: string;
  isCustomDiagnosis: boolean;
  customDiagnosisText: string;
  hideLogos: boolean;
}

export interface OrdenExamenRadiologicoFormData {
  nombrePaciente: string;
  edadPaciente: string;
  numeroFichaClinica: string;
  nombreMedicoSolicitante: string;
  examenSolicitado: string;
  diagnosticoSintomas: string;
}

export interface CertificadoEscolarFormData {
  nombrePaciente: string;
  diagnostico: string;
  asistioCentroSalud: boolean;
  noRequiereReposo: boolean;
  reposo: boolean;
  reposoDesde: string;
  reposoHasta: string;
  noEducacionFisica: boolean;
  noEducacionFisicaDesde: string;
  noEducacionFisicaHasta: string;
  otro: boolean;
  otroDetalle: string;
  fechaDocumento: string;
}

export interface DerivacionesPscvFormData {
  fecha: string;
  nombrePaciente: string;
  rutPaciente: string;
  ingresoCardiovascular: boolean;
  controlCardiovascular: boolean;
  ingresoEcicep: boolean;
  controlNutricionista: boolean;
  controlEnfermero: boolean;
  podologo: boolean;
  evaluacionPieDiabetico: boolean;
  empaEmpamEfam: boolean;
  poliChoque: boolean;
  pedirHoraMorbilidad: boolean;
  electrocardiograma: boolean;
  perfilPresionArterial: boolean;
  observaciones: string;
}

export interface OrdenLaboratorioFormData {
  nombrePaciente: string;
  rutPaciente: string;
  numeroFicha: string;
  procedencia: string;
  edad: string;
  fechaNacimiento: string;
  fechaExamen: string;
  nroSolicitud?: string;
  horaExamen?: string;
  sectorPaciente?: string;
  nhcPaciente?: string;
  prevision?: string;
  direccion?: string;
  telefono?: string;
  sexo?: string;
  diagnostico?: string;
  programaSalud?: string;
  laboratorioNombre?: string;
  laboratorioTipo?: string;
  laboratorioDireccion?: string;
  laboratorioTelefono?: string;
  prioridadGlobal?: 'Normal' | 'Urgente';
  observacionesGlobales?: string;
  [key: string]: string | boolean | undefined;
}

export interface RecetaMedicaFormData {
  nombrePaciente: string;
  rutPaciente: string;
  direccionPaciente: string;
  edadPaciente: string;
  diagnostico: string;
  rp: string;
  hideLogos: boolean;
}

export interface FichaConsultoriaFormData {
  nombre: string;
  fechaIngreso: string;
  fechaNac: string;
  edad: string;
  run: string;
  hcHospital: string;
  domicilioCiudad: string;
  telefonos: string;
  prevision: string;
  nivelEducacion: string;
  lugarDerivacion: string;
  canasta: string;
  ges: string;
  fechaProcesoDiagnostico: string;
  genogramaDescripcion: string;
  motivoConsulta: string;
  impresionClinica: string;
  antecedentesMorbidos: string;
  hipotesisDiagnostica: string;
  planTratamiento: string;
  evolucionTratamiento: string;
  motivoConsultoria: string;
  equipoResponsable: string;
  equipoConsultoria: string;
}
