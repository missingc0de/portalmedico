const fs = require('fs');
const path = require('path');

function escapeJsx(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const fieldSpecs = {
  edad: { label: 'Edad / Control', type: 'text' },
  acompanante: { label: 'Acompañante', type: 'text' },
  parentesco: { label: 'Parentesco', type: 'text' },
  profesional: { label: 'Profesional Responsable', type: 'text' },
  establecimientoCurso: { label: 'Establecimiento Educacional / Curso', type: 'text' },
  establecimientoEducacionalCurso: { label: 'Establecimiento Educacional / Curso', type: 'text' },
  motivoConsulta: { label: 'Motivo de Consulta', type: 'text' },

  egSemanas: { label: 'Edad Gestacional (semanas)', type: 'text' },
  embarazoDetalle: { label: 'Detalles del Embarazo', type: 'text' },
  partoDetalle: { label: 'Detalles del Parto', type: 'text' },
  pnGramos: { label: 'Peso Nacimiento (g)', type: 'text' },
  tnCm: { label: 'Talla Nacimiento (cm)', type: 'text' },
  ccCm: { label: 'C. Cefálico Nacimiento (cm)', type: 'text' },
  apgar: { label: 'Apgar (1 min / 5 min)', type: 'text' },
  hospitalizacionNeonatal: { label: 'Hospitalización Neonatal', type: 'select', options: ['No', 'Sí'] },
  hospitalizacionMotivo: { label: 'Motivo Hospitalización Neonatal', type: 'text' },
  morbilidadNeonatal: { label: 'Morbilidad / Antecedentes Neonatales', type: 'text' },
  altaDias: { label: 'Alta Hospitalaria (días de vida)', type: 'text' },
  contactoPielConPiel: { label: 'Contacto Piel con Piel en Parto', type: 'select', options: ['Sí', 'No'] },
  inicioLactanciaPrimeraHora: { label: 'Inicio Lactancia Primera Hora', type: 'select', options: ['Sí', 'No'] },
  tamizajesNeonatales: { label: 'Tamizajes Neonatales (PKU / TSH / Audición)', type: 'text' },
  inmunizaciones: { label: 'Inmunizaciones / Vacunas', type: 'text' },
  vacunas: { label: 'Inmunizaciones / Vacunas Al Día', type: 'select', options: ['Al día', 'Pendientes', 'En regla'] },

  enfermedadesUltimoControl: { label: 'Enfermedades desde Último Control', type: 'text' },
  urgenciasHospitalizaciones: { label: 'Consultas de Urgencia / Hospitalizaciones', type: 'text' },
  medicamentos: { label: 'Medicamentos en Uso', type: 'text' },
  alergias: { label: 'Alergias Conocidas', type: 'text' },
  antecedentesSalud: { label: 'Antecedentes Mórbidos de Salud', type: 'text' },

  tipoAlimentacion: { label: 'Tipo de Alimentación Actual', type: 'select', options: ['Lactancia materna exclusiva', 'Lactancia mixta', 'Fórmula láctea', 'Alimentación familiar + Lactancia', 'Alimentación familiar completa'] },
  tipoAlimentacionActual: { label: 'Tipo de Alimentación Actual', type: 'select', options: ['Lactancia materna exclusiva', 'Lactancia mixta', 'Fórmula láctea', 'Alimentación complementaria iniciada'] },
  frecuenciaAlimentacion: { label: 'Frecuencia de Tomas / Comidas', type: 'text' },
  frecuenciaVolumenAlimentacion: { label: 'Frecuencia y Volumen de Alimentación', type: 'text' },
  acopleSuccion: { label: 'Acople y Succión al Pecho', type: 'select', options: ['Adecuados', 'Dificultades', 'No aplica'] },
  dolorAmamantar: { label: 'Dolor al Amamantar', type: 'select', options: ['No', 'Sí'] },
  grietas: { label: 'Presencia de Grietas en Pezón', type: 'select', options: ['No', 'Sí'] },
  produccionLactea: { label: 'Percepción de Producción Láctea', type: 'select', options: ['Suficiente / Adecuada', 'Insuficiente'] },
  dificultadesLactancia: { label: 'Dificultades de Lactancia', type: 'text' },
  usoMamaderaChupete: { label: 'Uso de Mamadera o Chupete', type: 'select', options: ['No', 'Mamadera', 'Chupete', 'Ambos'] },
  regurgitacionVomitos: { label: 'Regurgitación o Vómitos', type: 'text' },
  aceptacionAlimentosSolidos: { label: 'Aceptación de Alimentos Sólidos', type: 'text' },
  ingresoLegumbresPescadoHuevo: { label: 'Introducción de Legumbres, Pescado y Huevo', type: 'text' },
  incorporacionMesaFamiliar: { label: 'Incorporación a la Mesa Familiar', type: 'select', options: ['Sí', 'En proceso', 'No'] },
  colacionesSaludables: { label: 'Tipo de Colaciones Consumidas', type: 'text' },
  aguaPuraConsumo: { label: 'Consumo de Agua Pura', type: 'select', options: ['Sí', 'No', 'Ocasional'] },
  consumoAgua: { label: 'Ingesta de Agua Pura', type: 'text' },
  consumoAguaYBebidas: { label: 'Ingesta de Líquidos (Agua / Bebidas / Jugos)', type: 'text' },
  consumoFrutasVerduras: { label: 'Consumo Diario de Frutas y Verduras', type: 'text' },
  consumoLacteos: { label: 'Porciones Diarias de Lácteos', type: 'text' },
  consumoUltraprocesados: { label: 'Consumo de Golosinas / Ultraprocesados', type: 'text' },
  suplementacionVitaminasHierro: { label: 'Suplementación de Vitaminas y Hierro', type: 'text' },
  toleranciaDigestiva: { label: 'Tolerancia Digestiva', type: 'text' },
  toleranciaAlimentaria: { label: 'Tolerancia Alimentaria', type: 'text' },
  evaluacionMadurezAlimentaria: { label: 'Madurez para Alimentación Complementaria', type: 'text' },
  planRetornoLaboralLactancia: { label: 'Plan de Lactancia por Retorno Laboral', type: 'text' },
  anamnesisAlimentaria: { label: 'Estructura Diaria de Alimentación', type: 'text' },

  diuresis: { label: 'Diuresis / Hábito Miccional', type: 'text' },
  diuresisPañalesDia: { label: 'Número de Pañales Mojados al Día', type: 'text' },
  deposiciones: { label: 'Deposiciones / Hábito Intestinal', type: 'text' },
  deposicionesDia: { label: 'Frecuencia y Aspecto de Deposiciones', type: 'text' },
  habitoMiccionalControlEsfinteer: { label: 'Control de Esfínter Anal / Vesical', type: 'select', options: ['No iniciado', 'En proceso', 'Logrado diurno', 'Logrado completo'] },
  controlEsfinteerDiurno: { label: 'Control de Esfínter Diurno', type: 'select', options: ['Logrado', 'En proceso', 'No logrado'] },
  controlEsfinteerNocturno: { label: 'Control de Esfínter Nocturno', type: 'select', options: ['Logrado', 'En proceso', 'No logrado'] },
  controlEsfinteresCompleto: { label: 'Control Completo de Esfínteres', type: 'select', options: ['Sí', 'En proceso', 'No'] },
  habitoDeposicional: { label: 'Hábito Deposicional', type: 'text' },

  suenoHoras: { label: 'Horas Diarias de Sueño', type: 'text' },
  suenoPatron: { label: 'Patrón y Calidad del Sueño', type: 'text' },
  lugarSueno: { label: 'Lugar para Dormir', type: 'select', options: ['Cuna propia', 'Cama propia', 'Cama de padres'] },
  lugarPosicionSueno: { label: 'Lugar y Posición para Dormir', type: 'text' },
  posicionSueno: { label: 'Posición al Dormir', type: 'select', options: ['Decúbito supino (espalda)', 'Decúbito lateral', 'Decúbito prono (boca abajo)'] },
  colecho: { label: 'Práctica de Colecho', type: 'select', options: ['No', 'Sí (colecho seguro)', 'Sí'] },

  fijaSigueRostros: { label: 'Fija y Sigue Rostros u Objetos', type: 'select', options: ['Sí', 'No'] },
  sonrisaSocial: { label: 'Sonrisa Social Presente', type: 'select', options: ['Sí', 'No'] },
  reaccionaSonidosVoz: { label: 'Reacciona a Sonidos y Voz', type: 'select', options: ['Sí', 'No'] },
  vocalizaciones: { label: 'Emite Vocalizaciones / Balbuceos', type: 'select', options: ['Sí', 'No'] },
  movimientosSimetricos: { label: 'Movimientos Simétricos de Extremidades', type: 'select', options: ['Sí', 'No'] },
  controlCefalico: { label: 'Sostén Cefálico', type: 'select', options: ['Sí (Completo)', 'En desarrollo', 'No'] },
  sostenCefalicoCompleto: { label: 'Sostén Cefálico Completo', type: 'select', options: ['Sí', 'No'] },
  buscaOrigenSonidos: { label: 'Busca el Origen de Sonidos', type: 'select', options: ['Sí', 'No'] },
  giraDePronoAAsupino: { label: 'Gira de Prono a Supino', type: 'select', options: ['Sí', 'En proceso', 'No'] },
  tomaObjetosVoluntario: { label: 'Prensión Voluntaria de Objetos', type: 'select', options: ['Sí', 'No'] },
  vocalizacionesRisas: { label: 'Emisión de Risas Sonoras y Gorjeos', type: 'select', options: ['Sí', 'No'] },
  sedestacionConApoyo: { label: 'Sedestación con Apoyo', type: 'select', options: ['Sí', 'No'] },
  sedestacionSinApoyo: { label: 'Sedestación Independiente (Sin Apoyo)', type: 'select', options: ['Sí', 'No'] },
  giraDePronoASupinoYSupinoAProno: { label: 'Rueda hacia Ambos Lados', type: 'select', options: ['Sí', 'No'] },
  transfiereObjetosManoAMano: { label: 'Transfiere Objetos de Mano a Mano', type: 'select', options: ['Sí', 'No'] },
  balbuceoSilabico: { label: 'Balbuceo Silábico (ej. ma-ma, da-da)', type: 'select', options: ['Sí', 'No'] },
  respondeASuNombre: { label: 'Responde cuando se le Llama por su Nombre', type: 'select', options: ['Sí', 'No'] },
  gateoODesplazamiento: { label: 'Gateo o Desplazamiento Activo', type: 'select', options: ['Sí', 'En proceso', 'No'] },
  prensionPinzaPinzaInicial: { label: 'Prensión en Pinza Digital', type: 'select', options: ['Sí', 'No'] },
  angustiaDeSeparacion: { label: 'Ansiedad / Angustia ante Extraños', type: 'select', options: ['Sí', 'No'] },
  comprendeElNo: { label: 'Comprende el Significado del "No"', type: 'select', options: ['Sí', 'No'] },
  bipedestacionYMarcha: { label: 'Bipedestación y Marcha', type: 'select', options: ['Marcha independiente', 'Bipedestación con apoyo', 'Bipedestación inicial'] },
  pinzaFina: { label: 'Logro de Pinza Fina', type: 'select', options: ['Sí', 'No'] },
  primerasPalabrasConSignificado: { label: 'Primeras Palabras con Significado', type: 'select', options: ['Sí (2-3 palabras)', 'No'] },
  comprendeOrdenesSimples: { label: 'Comprende Órdenes Sencillas', type: 'select', options: ['Sí', 'No'] },
  juegoInteractivo: { label: 'Juego Interactivo (Imita gestos/aplaude)', type: 'select', options: ['Sí', 'No'] },
  marchaIndependiente: { label: 'Marcha Independiente Estable', type: 'select', options: ['Sí', 'No'] },
  vocabularioPalabras: { label: 'Cantidad Aprox. de Palabras en Vocabulario', type: 'text' },
  identificaPartesCuerpo: { label: 'Reconoce Partes del Cuerpo', type: 'select', options: ['Sí (3 o más)', 'En proceso', 'No'] },
  torreDeCubos: { label: 'Construcción de Torre de Cubos', type: 'select', options: ['Sí (3-4 cubos)', 'No'] },
  usaCuchara: { label: 'Uso de Cuchara al Comer', type: 'select', options: ['Sí (con autonomía)', 'En proceso', 'No'] },
  juegoSimbolico: { label: 'Presencia de Juego Simbólico', type: 'select', options: ['Sí', 'En desarrollo', 'No'] },
  combinaDosPalabras: { label: 'Combina 2 o Más Palabras en Frases', type: 'select', options: ['Sí', 'No'] },
  correYPateaPelota: { label: 'Corre y Patea una Pelota', type: 'select', options: ['Sí', 'No'] },
  subeEscalerasConApoyo: { label: 'Sube Escaleras con Apoyo', type: 'select', options: ['Sí', 'No'] },
  copiaLineaVertical: { label: 'Copia Línea Vertical / Garabatea', type: 'select', options: ['Sí', 'No'] },
  autonomiaAlimentacion: { label: 'Autonomía en Alimentación', type: 'select', options: ['Sí', 'Requiere ayuda'] },
  asisteJardinJardin: { label: 'Asistencia a Jardín / Sala Cuna', type: 'select', options: ['Sí', 'No'] },
  frasesCompletasLenguaje: { label: 'Estructuración de Frases de 3-4 Palabras', type: 'select', options: ['Sí', 'No'] },
  hacePreguntas: { label: 'Formula Preguntas Frecuentes', type: 'select', options: ['Sí', 'No'] },
  saltaEnDosPies: { label: 'Salta con Ambos Pies', type: 'select', options: ['Sí', 'No'] },
  copiaCirculo: { label: 'Copia un Círculo', type: 'select', options: ['Sí', 'No'] },
  seVisteConAyuda: { label: 'Se Viste solo/a con Poca Ayuda', type: 'select', options: ['Sí', 'No'] },
  juegoConPares: { label: 'Juego Interactivo / Asociativo con Pares', type: 'select', options: ['Sí', 'No'] },
  escolaridadNivel: { label: 'Nivel Escolar / Nivel Parvulario', type: 'text' },
  rendimientoAdaptacionEscolar: { label: 'Adaptación y Rendimiento Escolar', type: 'text' },
  lenguajeClaroFluido: { label: 'Lenguaje Claro y Fluido', type: 'select', options: ['Sí', 'No'] },
  saltaEnUnPie: { label: 'Salta en Un Pie', type: 'select', options: ['Sí', 'No'] },
  copiaCruzYCuadrado: { label: 'Copia Cruz / Cuadrado', type: 'select', options: ['Sí', 'No'] },
  dibujaMonigote: { label: 'Dibuja Persona con Detalles', type: 'select', options: ['Sí', 'No'] },
  seVisteSolo: { label: 'Autonomía para Vestirse', type: 'select', options: ['Sí', 'Con ayuda'] },
  juegoReglado: { label: 'Participación en Juegos con Reglas', type: 'select', options: ['Sí', 'No'] },
  articulaTodosLosFonemas: { label: 'Articulación Correcta de Fonemas', type: 'select', options: ['Sí', 'Dificultad en fonemas'] },
  atrapaPelota: { label: 'Atrapa una Pelota con Ambas Manos', type: 'select', options: ['Sí', 'No'] },
  copiaTrianguloCuadrado: { label: 'Copia Triángulo / Cuadrado', type: 'select', options: ['Sí', 'No'] },
  dibujaFiguraHumanaCompleta: { label: 'Dibuja Figura Humana Completa', type: 'select', options: ['Sí', 'No'] },
  seVisteYDesvisteSolo: { label: 'Se Viste y Desviste Sin Ayuda', type: 'select', options: ['Sí', 'No'] },
  juegoConReglas: { label: 'Respeto por Reglas de Juego', type: 'select', options: ['Sí', 'No'] },
  rendimientoEscolar: { label: 'Rendimiento Escolar General', type: 'select', options: ['Adecuado', 'Dificultades'] },
  relacionCompanerosProfesores: { label: 'Relación con Compañeros y Profesores', type: 'text' },
  conductaEscolar: { label: 'Conducta en el Aula', type: 'select', options: ['Adecuada', 'Observaciones'] },
  bullyingAcoso: { label: 'Antecedentes de Bullying / Acoso', type: 'select', options: ['Niega', 'Sospecha', 'Confirmado'] },
  animoSocioemocional: { label: 'Estado Ánimo y Socioemocional', type: 'text' },
  actividadFisicaJuego: { label: 'Minutos Diarios de Juego Activo / Ejercicio', type: 'text' },
  actividadFisicaDeporte: { label: 'Práctica de Deporte / Actividad Física', type: 'text' },
  pantallasHorasDia: { label: 'Tiempo Diario Exposición a Pantallas', type: 'select', options: ['Menos de 1 hora/día', '1 a 2 horas/día', 'Más de 2 horas/día', 'Sin pantallas'] },

  madreEstadoGeneral: { label: 'Estado General de la Madre', type: 'text' },
  madreAnimo: { label: 'Ánimo Materno / Vínculo', type: 'text' },
  madreDolorSangrado: { label: 'Molestias Fisiológicas o Dolor Materno', type: 'text' },
  redApoyo: { label: 'Redes de Apoyo Familiar y Social', type: 'text' },
  participacionPadre: { label: 'Participación Activa del Padre o Cuidador', type: 'select', options: ['Activa', 'Parcial', 'Ausente'] },
  factoresRiesgoBiopsicosocial: { label: 'Riesgo Biopsicosocial Identificado', type: 'text' },
  dudasFamiliares: { label: 'Dudas o Preocupaciones Expresadas por la Familia', type: 'text' },
  interaccionCuidadores: { label: 'Calidad de Interacción con Cuidadores', type: 'select', options: ['Adecuada', 'Alterada / En observación'] },
  consolabilidad: { label: 'Consolabilidad del Lactante', type: 'select', options: ['Adecuada', 'Dificultad para consolar'] },
  estadoEmocionalMadre: { label: 'Estado Emocional Referido por la Madre', type: 'text' },
  estresoresFamiliares: { label: 'Estresores Familiares Recientes', type: 'text' },
  planCuidado: { label: 'Plan de Cuidado del Niño/a', type: 'text' },

  peso: { label: 'Peso (kg)', type: 'text' },
  talla: { label: 'Talla (cm)', type: 'text' },
  perimetroCefalico: { label: 'Perímetro Cefálico (cm)', type: 'text' },
  imc: { label: 'Índice de Masa Corporal (IMC kg/m²)', type: 'text' },
  peZ: { label: 'P/E Puntuación Z', type: 'text' },
  teZ: { label: 'T/E Puntuación Z', type: 'text' },
  ptZ: { label: 'P/T Puntuación Z', type: 'text' },
  imcz: { label: 'IMC/E Puntuación Z', type: 'text' },
  tez: { label: 'T/E Puntuación Z', type: 'text' },
  diagnosticoNutricional: { label: 'Diagnóstico Nutricional Integrado', type: 'select', options: ['Eutrófico/a', 'Riesgo de desnutrición', 'Desnutrido/a', 'Sobrepeso', 'Obesidad'] },
  diagnosticoTalla: { label: 'Diagnóstico de Talla', type: 'select', options: ['Talla normal', 'Talla baja', 'Riesgo de talla baja', 'Talla alta'] },
  velocidadCrecimiento: { label: 'Velocidad de Crecimiento', type: 'select', options: ['Normocrecimiento', 'Acelerado', 'Lentificado'] },
  pa: { label: 'Presión Arterial (PA mmHg)', type: 'text' },
  percentilPa: { label: 'Percentil de PA según Edad/Sexo/Talla', type: 'text' },
  fc: { label: 'Frecuencia Cardíaca (FC lpm)', type: 'text' },
  fr: { label: 'Frecuencia Respiratoria (FR rpm)', type: 'text' },

  efPesoActual: { label: 'Peso Actual Registrado (g / kg)', type: 'text' },
  efVariacionPesoNacimiento: { label: 'Variación % respecto a Peso Nacimiento', type: 'text' },
  efTalla: { label: 'Talla Medida (cm)', type: 'text' },
  efPerimetroCefalico: { label: 'Perímetro Cefálico Medido (cm)', type: 'text' },
  efEstadoGeneral: { label: 'Examen Físico General', type: 'text' },
  efPielIctericia: { label: 'Ictericia Cutánea', type: 'select', options: ['No', 'Sí (Zona I-V)'] },
  efPielCianosis: { label: 'Cianosis', type: 'select', options: ['No', 'Central', 'Periférica'] },
  efPielLesiones: { label: 'Lesiones Cutáneas / Marcas de Nacimiento', type: 'text' },
  efPielMucosas: { label: 'Piel y Mucosas', type: 'text' },
  efPiel: { label: 'Estado de la Piel', type: 'text' },
  efCabezaFontanela: { label: 'Cráneo y Fontanelas', type: 'text' },
  efFontanelaSuturas: { label: 'Fontanelas y Suturas Craneales', type: 'text' },
  efOjosReflejoRojo: { label: 'Reflejo Rojo Pupilar', type: 'select', options: ['Presente bilateral', 'Alterado / Ausente'] },
  efOjosVisual: { label: 'Examen Oftalmológico / Seguimiento Visual', type: 'text' },
  efBocaPaladar: { label: 'Cavidad Oral, Mucosas y Paladar', type: 'text' },
  efCuelloClaviculas: { label: 'Cuello y Clavículas', type: 'text' },
  efFc: { label: 'Frecuencia Cardíaca Medida (lpm)', type: 'text' },
  efFr: { label: 'Frecuencia Respiratoria Medida (rpm)', type: 'text' },
  efCardiopulmonar: { label: 'Examen Cardiopulmonar', type: 'text' },
  efCardiovascular: { label: 'Examen Cardiovascular', type: 'text' },
  efPulmonar: { label: 'Examen Pulmonar', type: 'text' },
  efAbdomenOmbligo: { label: 'Abdomen y Cordón Umbilical', type: 'text' },
  efAbdomen: { label: 'Examen de Abdomen', type: 'text' },
  efGenitalesAno: { label: 'Genitales Externos y Permeabilidad Anal', type: 'text' },
  efGenitales: { label: 'Genitales Externos', type: 'text' },
  efGenitalesTanner: { label: 'Desarrollo Puberal / Estadio de Tanner', type: 'text' },
  efCaderasOrtolaniBarlow: { label: 'Evaluación de Caderas (Ortolani / Barlow)', type: 'select', options: ['Ortolani y Barlow negativos', 'Ortolani positivo', 'Barlow positivo', 'Limitación abducción'] },
  efCaderasRxPelvisRevisada: { label: 'Radiografía de Pelvis', type: 'text' },
  efExtremidades: { label: 'Extremidades y Movilidad', type: 'text' },
  efExtremidadesPies: { label: 'Extremidades y Pies', type: 'text' },
  efExtremidadesNeurologico: { label: 'Extremidades y Examen Neurológico', type: 'text' },
  efColumnaPies: { label: 'Columna y Estructura de Pies', type: 'text' },
  efColumnaPostura: { label: 'Columna y Postura', type: 'text' },
  efColumnaTestAdams: { label: 'Test de Adams (Escoliosis)', type: 'select', options: ['Negativo', 'Positivo / Asimétrico'] },
  efNeurologicoTono: { label: 'Tono Muscular y Reflejos', type: 'text' },
  efDenticion: { label: 'Estado de Dentición / Caries', type: 'text' },
  efAudicionRespuesta: { label: 'Respuesta Auditiva', type: 'text' },
  efAudicion: { label: 'Evaluación Auditiva', type: 'text' },
  efAgudezaVisual: { label: 'Agudeza Visual Medida', type: 'text' },

  scoreRiesgoNeumonia: { label: 'Score Riesgo Neumonía Ira/Era', type: 'select', options: ['Bajo riesgo', 'Riesgo moderado', 'Alto riesgo'] },
  pautaRiesgoBiopsicosocial: { label: 'Pauta de Riesgo Biopsicosocial', type: 'select', options: ['Sin riesgo', 'Con riesgo psicosocial'] },
  edimburgoMaternoScore: { label: 'Puntaje Escala Edimburgo Materna', type: 'text' },
  edimburgoResultado: { label: 'Resultado Escala Edimburgo', type: 'select', options: ['Normal (< 10 ptos)', 'Alterado (≥ 10 ptos)'] },
  rxPelvisSolicitada: { label: 'Solicitud Radiografía de Pelvis (3 meses)', type: 'select', options: ['Sí', 'No', 'Revisada normal'] },
  pensAlteracionPrevia: { label: 'Evaluación PENS Previas', type: 'text' },
  pautaEdpAplicada: { label: 'Evaluación Pauta EDP / EEDP', type: 'text' },
  evaluacionMCHAT: { label: 'Tamizaje M-CHAT-R (Espectro Autista)', type: 'select', options: ['Bajo riesgo (0-2 ptos)', 'Riesgo medio (3-7 ptos)', 'Riesgo alto (8-20 ptos)'] },
  evaluacionEDP: { label: 'Evaluación EDP / EEDP', type: 'text' },
  evaluacionEEDP: { label: 'Evaluación EEDP Al Año', type: 'text' },
  evaluacionTEPSI: { label: 'Evaluación TEPSI', type: 'text' },
  saludBucalCepillado: { label: 'Frecuencia Cepillado Dental', type: 'text' },

  diagnostico1: { label: 'Diagnóstico Principal', type: 'text' },
  diagnosticoAlimentacion: { label: 'Diagnóstico Nutricional de Lactancia/Dieta', type: 'text' },
  diagnosticoBiopsicosocial: { label: 'Diagnóstico de Riesgo Biopsicosocial', type: 'text' },
  diagnosticos: { label: 'Diagnósticos Clínicos Integrados', type: 'textarea' },
  indicaciones: { label: 'Indicaciones e Indicadores de Alarma', type: 'textarea' },
  proximoControl: { label: 'Programación de Próximo Control', type: 'text' }
};

const targetFiles = [
  'fichaControlNinoSanoRN.tsx',
  'fichaControlNinoSano2Meses.tsx',
  'fichaControlNinoSano4Meses.tsx',
  'consultaNutricional5Meses.tsx',
  'fichaControlNinoSano6Meses.tsx',
  'fichaControlNinoSano8Meses.tsx',
  'fichaControlNinoSano12Meses.tsx',
  'fichaControlNinoSano18Meses.tsx',
  'fichaControlNinoSano2Anos.tsx',
  'fichaControlNinoSano3Anos.tsx',
  'consultaNutricional3Anos6Meses.tsx',
  'fichaControlNinoSano4Anos.tsx',
  'fichaControlNinoSano5Anos.tsx',
  'fichaControlNinoSano7Anos.tsx',
  'fichaControlNinoSano8Anos.tsx',
  'fichaControlNinoSano9Anos.tsx'
];

targetFiles.forEach(file => {
  const filePath = path.join('components', file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  const match = content.match(/const initialFormData = ({[\s\S]*?});/);
  if (!match) return;

  let formDataObj;
  try {
    formDataObj = eval('(' + match[1] + ')');
  } catch (e) {
    return;
  }

  const componentName = file.replace('.tsx', '');
  const keys = Object.keys(formDataObj);

  // Group keys into ECICEP-like sections
  const headerKeys = ['edad', 'sexo', 'acompanante', 'parentesco', 'profesional', 'motivoConsulta', 'establecimientoCurso', 'establecimientoEducacionalCurso'];
  const antropometriaKeys = ['peso', 'talla', 'perimetroCefalico', 'imc', 'imcz', 'peZ', 'teZ', 'ptZ', 'tez', 'diagnosticoNutricional', 'diagnosticoTalla', 'velocidadCrecimiento', 'pa', 'percentilPa', 'fc', 'fr'];
  const actuacionKeys = ['diagnostico1', 'diagnosticoAlimentacion', 'diagnosticoBiopsicosocial', 'diagnosticos', 'indicaciones', 'proximoControl'];

  const secHeader = keys.filter(k => headerKeys.includes(k));
  const secAntropometria = keys.filter(k => antropometriaKeys.includes(k));
  const secActuacion = keys.filter(k => actuacionKeys.includes(k));
  const secAnamnesis = keys.filter(k => !headerKeys.includes(k) && !antropometriaKeys.includes(k) && !actuacionKeys.includes(k) && !k.startsWith('ef'));
  const secExamenFisico = keys.filter(k => k.startsWith('ef'));

  function renderFieldList(keyList) {
    return keyList.map(key => {
      const spec = fieldSpecs[key] || {
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        type: key.toLowerCase().includes('detalle') || key.toLowerCase().includes('indicacion') || key.toLowerCase().includes('diagnostico') ? 'textarea' : 'text'
      };

      if (spec.type === 'select' && spec.options) {
        const optionsJsx = spec.options.map(opt => `<option value="${escapeJsx(opt)}">${escapeJsx(opt)}</option>`).join('');
        return `
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="${key}" className="block text-sm font-medium text-slate-700">${escapeJsx(spec.label)}:</label>
                  <select
                    id="${key}"
                    name="${key}"
                    value={formData.${key} || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    ${optionsJsx}
                  </select>
                </div>`;
      } else if (spec.type === 'textarea' || spec.rows) {
        return `
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="${escapeJsx(spec.label)}"
                    id="${key}"
                    name="${key}"
                    value={formData.${key} || ''}
                    onChange={handleChange}
                    isTextArea
                    rows={4}
                    inputClassName="text-slate-700 font-mono text-xs"
                  />
                </div>`;
      } else {
        return `
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="${escapeJsx(spec.label)}"
                    id="${key}"
                    name="${key}"
                    value={formData.${key} || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>`;
      }
    }).join('');
  }

  let title = componentName.toUpperCase();
  const titleMatch = content.match(/<h3 className="[^"]*">([^<]+)<\/h3>/);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1];
  }

  const updatedCode = `import React, { useState, useCallback, useEffect } from 'react';
import { User } from '../types';
import FormField from './FormField';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData = ${JSON.stringify(formDataObj, null, 2)};

interface Props {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const ${componentName}: React.FC<Props> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage('local_${componentName}', initialFormData);
  const [isUppercase, setIsUppercase] = useState<boolean>(false);
  const [anamnesisText, setAnamnesisText] = useState('');
  const [exploracionText, setExploracionText] = useState('');
  const [actuacionText, setActuacionText] = useState('');

  const generateSummaryParts = useCallback(() => {
    const todayStr = new Date().toLocaleDateString('es-ES');
    let anamnesis = \`${title}\\n---------------------------------------\\nFECHA CONTROL: \${todayStr}\\nPROFESIONAL RESPONSABLE: \${loggedInUser?.fullName || 'Profesional de Salud'}\\n---------------------------------------\\n\\nANAMNESIS:\\n\`;
    let exploracion = \`EXPLORACIÓN FÍSICA Y PARÁMETROS:\\n\`;
    let actuacion = \`ACTUACIÓN Y DIAGNÓSTICOS:\\n\`;

    Object.keys(formData).forEach(key => {
      const val = formData[key];
      if (val && typeof val === 'string' && val.trim()) {
        if (key.startsWith('ef') || ['peso', 'talla', 'perimetroCefalico', 'imc', 'pa', 'fc', 'fr', 'peZ', 'teZ', 'ptZ', 'diagnosticoNutricional', 'diagnosticoTalla', 'scoreRiesgoNeumonia'].includes(key)) {
          exploracion += \`- \${key}: \${val}\\n\`;
        } else if (['diagnosticos', 'indicaciones', 'proximoControl'].includes(key)) {
          actuacion += \`- \${key.toUpperCase()}:\\n\${val}\\n\\n\`;
        } else {
          anamnesis += \`- \${key}: \${val}\\n\`;
        }
      }
    });

    return {
      anamnesis: anamnesis.trim(),
      exploracion: exploracion.trim(),
      actuacion: actuacion.trim(),
    };
  }, [formData, loggedInUser]);

  useEffect(() => {
    const { anamnesis, exploracion, actuacion } = generateSummaryParts();
    setAnamnesisText(anamnesis);
    setExploracionText(exploracion);
    setActuacionText(actuacion);
  }, [formData, generateSummaryParts]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, [setFormData]);

  const handleCopyToClipboard = (text: string, title: string) => {
    const textToCopy = isUppercase ? text.toUpperCase() : text;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert(\`'\${title}' copiado al portapapeles.\`);
    }).catch(err => {
      console.error('Error al copiar: ', err);
    });
  };

  const handleNewDocument = () => {
    setFormData(initialFormData);
  };

  return (
    <div className="w-full flex flex-col font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">
        <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
          <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4 pb-16">
            
            {/* SECCIÓN IDENTIFICACIÓN */}
            {${secHeader.length > 0} && (
              <section id="sec-identificacion" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Identificación</h3>
                <div className="flex flex-col gap-3">
                  ${renderFieldList(secHeader)}
                </div>
              </section>
            )}

            {/* SECCIÓN ANAMNESIS */}
            {${secAnamnesis.length > 0} && (
              <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Anamnesis y Antecedentes</h3>
                <div className="flex flex-col gap-3">
                  ${renderFieldList(secAnamnesis)}
                </div>
              </section>
            )}

            {/* SECCIÓN ANTROPOMETRÍA Y SIGNOS VITALES */}
            {${secAntropometria.length > 0} && (
              <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Parámetros Clínicos y Antropometría</h3>
                <div className="flex flex-col gap-3">
                  ${renderFieldList(secAntropometria)}
                </div>
              </section>
            )}

            {/* SECCIÓN EXAMEN FÍSICO */}
            {${secExamenFisico.length > 0} && (
              <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Examen Físico Segmentario</h3>
                <div className="flex flex-col gap-3">
                  ${renderFieldList(secExamenFisico)}
                </div>
              </section>
            )}

            {/* SECCIÓN ACTUACIÓN E INDICACIONES */}
            {${secActuacion.length > 0} && (
              <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Actuación, Diagnósticos e Indicaciones</h3>
                <div className="flex flex-col gap-3">
                  ${renderFieldList(secActuacion)}
                </div>
              </section>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border border-slate-200 bg-white rounded-xl shadow-sm mt-2">
              <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs uppercase tracking-widest cursor-pointer">
                Volver al Menú
              </button>
              <button type="button" onClick={handleNewDocument} className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg transition-all uppercase text-xs tracking-widest cursor-pointer">
                BORRAR TODO
              </button>
            </div>
          </form>
        </div>

        {/* Columna Derecha: Resumen Ficha Clínica */}
        <div className="lg:col-span-4 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2 lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden">
          <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden w-full">
            <div className="border-b border-sky-200/80 pb-1 mb-2 w-full flex-shrink-0">
              <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Resumen Ficha Clínica (Editable)</h3>
            </div>
            <div className="mb-2 flex items-center gap-1.5 flex-shrink-0">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={isUppercase}
                  onChange={e => setIsUppercase(e.target.checked)}
                  className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer"
                />
                <span>MAYÚSCULAS</span>
              </label>
            </div>
            <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">ANAMNESIS</label>
                  <button onClick={() => handleCopyToClipboard(anamnesisText, 'Anamnesis')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                </div>
                <textarea value={isUppercase ? anamnesisText.toUpperCase() : anamnesisText} onChange={(e) => setAnamnesisText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">EXPLORACIÓN</label>
                  <button onClick={() => handleCopyToClipboard(exploracionText, 'Exploración')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                </div>
                <textarea value={isUppercase ? exploracionText.toUpperCase() : exploracionText} onChange={(e) => setExploracionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">ACTUACIÓN</label>
                  <button onClick={() => handleCopyToClipboard(actuacionText, 'Actuación')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                </div>
                <textarea value={isUppercase ? actuacionText.toUpperCase() : actuacionText} onChange={(e) => setActuacionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
                <div className="pt-2 mt-1 border-t border-slate-200/80 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleNewDocument}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                    id="btn-borrar-todo-right"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    BORRAR TODO
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;

  fs.writeFileSync(filePath, updatedCode, 'utf8');
  console.log('Successfully styled component to match FichaIngresoEcicep:', file);
});
