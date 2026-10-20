const fs = require('fs');

const templates = [
  { key: 'fichaControlNinoSanoRN', title: 'CONTROL DE SALUD DE LA DÍADA / RECIÉN NACIDO', next: '1 mes' },
  { key: 'fichaControlNinoSano2Meses', title: 'CONTROL NIÑO SANO – 2 MESES', next: '3 meses' },
  { key: 'fichaControlNinoSano4Meses', title: 'CONTROL NIÑO SANO – 4 MESES', next: 'consulta nutricional de 5 meses' },
  { key: 'consultaNutricional5Meses', title: 'CONSULTA NUTRICIONAL – 5 MESES', next: '6 meses' },
  { key: 'fichaControlNinoSano6Meses', title: 'CONTROL NIÑO SANO – 6 MESES', next: '8 meses' },
  { key: 'fichaControlNinoSano8Meses', title: 'CONTROL NIÑO SANO – 8 MESES', next: '12 meses' },
  { key: 'fichaControlNinoSano12Meses', title: 'CONTROL NIÑO SANO – 12 MESES', next: '18 meses' },
  { key: 'fichaControlNinoSano18Meses', title: 'CONTROL NIÑO SANO – 18 MESES', next: '2 años' },
  { key: 'fichaControlNinoSano2Anos', title: 'CONTROL NIÑO SANO – 2 AÑOS', next: '3 años' },
  { key: 'fichaControlNinoSano3Anos', title: 'CONTROL NIÑO SANO – 3 AÑOS', next: 'consulta nutricional 3 años 6 meses' },
  { key: 'consultaNutricional3Anos6Meses', title: 'CONSULTA NUTRICIONAL – 3 AÑOS 6 MESES', next: '4 años' },
  { key: 'fichaControlNinoSano4Anos', title: 'CONTROL NIÑO SANO – 4 AÑOS', next: '5 años' },
  { key: 'fichaControlNinoSano5Anos', title: 'CONTROL NIÑO SANO – 5 AÑOS', next: '6 años' },
  { key: 'fichaControlNinoSano7Anos', title: 'CONTROL NIÑO SANO – 7 AÑOS', next: '8 años' },
  { key: 'fichaControlNinoSano8Anos', title: 'CONTROL NIÑO SANO – 8 AÑOS', next: '9 años' },
  { key: 'fichaControlNinoSano9Anos', title: 'CONTROL NIÑO SANO – 9 AÑOS', next: 'Transición a etapa siguiente' }
];

const prompts = {
  fichaControlNinoSanoRN: `CONTROL DE SALUD DE LA DÍADA / RECIÉN NACIDO
Edad: _____ días
Acompañante: __________
Parentesco: __________
Profesional: Matrón/a – Médico/a
ANAMNESIS
RN de ___ días de vida, sexo ___, acompañado de __________.
Antecedentes perinatales: EG ___ semanas. Embarazo __________. Parto __________. PN ___ g, TN ___ cm, CC ___ cm. Apgar /.
Hospitalización neonatal: Sí / No. Motivo: __________.
Antecedentes/morbilidad neonatal: __________.
Alta hospitalaria a los ___ días.
Contacto piel con piel: Sí / No.
Inicio lactancia primera hora de vida: Sí / No.
Tamizajes neonatales realizados: __________.
Inmunizaciones: __________.
Alimentación actual: LME / mixta / fórmula. Frecuencia: __________.
Acople y succión: adecuados / dificultad. Dolor al amamantar: Sí / No. Grietas: Sí / No. Percepción de producción láctea: __________.
Diuresis: ___ pañales/día. Deposiciones: ___/día, características __________.
Regurgitación/vómitos: __________.
Sueño: __________. Lugar de sueño: __________. Posición habitual: __________.
Madre: estado general __________. Ánimo __________. Dolor/sangrado u otras molestias __________.
Red de apoyo: __________. Participación padre/otro cuidador: __________.
Factores de riesgo biopsicosocial: __________.
Dudas/preocupaciones familiares: __________.
EXPLORACIÓN
Peso actual: ___ g.
Variación respecto a peso nacimiento: ___ %.
Talla: ___ cm. CC: ___ cm.
Estado general: activo/reactivo, hidratado, perfundido, coloración __________.
Piel: ictericia Sí / No. Cianosis Sí / No. Lesiones: __________.
Cabeza: normocéfalo, fontanela anterior __________, suturas __________.
Ojos: reflejo rojo presente bilateral / alterado.
Boca: mucosas, paladar, frenillo, succión __________.
Cuello/clavículas: __________.
Cardiovascular: FC ___ lpm, RCR 2T, soplos Sí / No. Pulsos femorales presentes y simétricos / alterados.
Respiratorio: FR ___ rpm, MP (+) bilateral, sin ruidos agregados / __________.
Abdomen: blando, depresible, sin masas ni visceromegalias. Ombligo: __________.
Genitales: __________. Ano permeable: Sí / No.
Caderas: abducción __________. Ortolani/Barlow __________.
Extremidades: simétricas, movilidad espontánea adecuada.
Neurológico: alerta/reactividad __________, tono __________, movimientos simétricos, reflejos primitivos __________.
Score riesgo de morir por neumonía: __________.
Pauta riesgo biopsicosocial: __________.
Diagnósticos:  
1. RN de ___ días.
2. Estado nutricional/recuperación ponderal: __________.
3. Alimentación: __________.
4. Riesgo biopsicosocial: __________.
5. Otros: __________.
ACTUACIÓN
Se refuerza lactancia materna a libre demanda y técnica de amamantamiento.
Se educa respecto a signos de hambre/saciedad y signos de adecuada transferencia de leche.
Se refuerza sueño seguro, prevención de muerte súbita y evitar exposición a humo de tabaco.
Se educa sobre cuidados del cordón, higiene y cuidado de piel.
Se refuerza vínculo, contacto físico, respuesta sensible al llanto y corresponsabilidad en cuidados.
Se entregan recomendaciones de prevención de accidentes.
Se explican signos de alarma del RN: rechazo alimentario, fiebre/hipotermia, dificultad respiratoria, compromiso de conciencia, cianosis, vómitos persistentes, disminución de diuresis, ictericia progresiva u otros.
Derivación/consulta lactancia: __________.
Otras derivaciones: __________.
Próximo control: 1 mes.
La norma establece este control antes de los 10 días y lo orienta específicamente a adaptación del RN, bienestar materno-familiar, lactancia y riesgo biopsicosocial.`,

  fichaControlNinoSano2Meses: `CONTROL NIÑO SANO – 2 MESES
Edad: 2 meses
Acompañante: __________
Profesional: Enfermero/a – Médico/a
ANAMNESIS
Desde último control: enfermedades/intercurrencias __________. Urgencias/hospitalizaciones __________.
Alimentación: LME / mixta / fórmula. Frecuencia __________. Dificultades de lactancia __________.
Regurgitación/vómitos: __________.
Diuresis: __________. Deposiciones: __________.
Sueño: ___ horas/día. Lugar/posición: __________.
Desarrollo: fija y sigue rostros/objetos Sí / No. Sonrisa social Sí / No. Reacciona a sonidos/voz Sí / No. Vocalizaciones __________. Movimientos simétricos Sí / No. Control cefálico __________.
Interacción cuidador-niño: __________. Consolabilidad: __________.
Inmunizaciones: al día / pendientes __________.
Estado emocional materno: __________. Red de apoyo: __________.
Factores biopsicosociales/estresores familiares: __________.
EXPLORACIÓN
Peso: ___ kg. Talla: ___ cm. CC: ___ cm.
P/E Z: ___ / L-E Z: ___ / P-L Z: ___ / CC-E: ___.
Diagnóstico nutricional: __________.
Diagnóstico talla: __________.
Estado general: __________.
Piel: __________.
Fontanela/suturas: __________.
Ojos: reflejo rojo bilateral, motilidad __________.
Audición/respuesta sonora: __________.
Boca/paladar: __________.
FC ___ lpm. FR ___ rpm.
Corazón: __________. Pulsos femorales: __________.
Pulmones: __________.
Abdomen: __________.
Genitales: __________.
Caderas: abducción __________, Ortolani/Barlow __________.
Extremidades/pies: __________.
Neurológico: tono __________, simetría __________, control cefálico __________, interacción __________.
Score riesgo neumonía: __________.
Edimburgo materno: ___ puntos / resultado __________.
Radiografía de pelvis solicitada: Sí / No.
Diagnósticos: __________.
ACTUACIÓN
Mantener LME hasta los 6 meses si es posible.
Se refuerza técnica de lactancia y alimentación responsiva.
Se educa sobre estimulación acorde a edad, interacción cara a cara, conversación, sonrisa y tummy time supervisado durante vigilia.
Sueño seguro y prevención de accidentes.
Evitar humo de tabaco y exposición a contaminantes.
Se revisa calendario de inmunizaciones.
Se solicita radiografía de pelvis según normativa.
Edimburgo alterado: conducta/derivación __________.
PENS si existió alteración al mes.
Próximo control: 3 meses.
La norma especifica a los 2 meses score de riesgo de neumonía, Edimburgo, solicitud de radiografía de pelvis y PENS si hubo alteración previa.`,

  fichaControlNinoSano4Meses: `CONTROL NIÑO SANO – 4 MESES
ANAMNESIS
Intercurrencias desde control previo: __________.
Alimentación: LME / mixta / fórmula. Frecuencia __________.
Dificultades: __________. Inicio precoz de otros líquidos/alimentos: Sí / No.
Diuresis/deposiciones: __________.
Sueño: __________.
Desarrollo: sonrisa social __________, vocalizaciones __________, seguimiento visual __________, respuesta auditiva __________, control cefálico __________, movimientos simétricos __________, interacción/manipulación de objetos __________.
Cuidador principal/red de apoyo: __________.
Retorno laboral/estudios de madre: __________.
Factores biopsicosociales: __________.
Inmunizaciones: __________.
EXPLORACIÓN
Peso ___ kg. Talla ___ cm. CC ___ cm.
P/E Z ___ / L-E Z ___ / P-L Z ___ / CC-E ___.
Diagnóstico nutricional: __________.
Talla: __________.
Examen general: __________.
Piel: __________.
Fontanela: __________.
Reflejo rojo/motilidad ocular: __________.
Respuesta auditiva: __________.
Cavidad oral: __________.
Cardiopulmonar: __________.
Abdomen: __________.
Genitales: __________.
Caderas/extremidades/pies: __________.
Neurológico/DSM: tono __________, simetría __________, control cefálico __________, interacción __________.
Pauta breve DSM: normal / alterada __________.
Pauta riesgo malnutrición por exceso: __________.
Pauta riesgo biopsicosocial: __________.
Score neumonía: __________.
Diagnósticos: __________.
ACTUACIÓN
Mantener lactancia materna exclusiva hasta los 6 meses cuando corresponda.
No iniciar alimentación complementaria rutinariamente antes de los 6 meses.
Estimulación acorde a edad, juego e interacción sensible.
Tummy time supervisado en vigilia.
Prevención de caídas, quemaduras, asfixia y accidentes.
Sueño seguro.
Revisión de inmunizaciones.
Alteración DSM → conducta/derivación según resultado.
Riesgo malnutrición → intervención y seguimiento.
Próximo control: consulta nutricional de 5 meses.
La norma diferencia este control incorporando pauta breve de DSM, factores de riesgo de malnutrición por exceso y pauta de riesgo biopsicosocial.`,

  consultaNutricional5Meses: `CONSULTA NUTRICIONAL – 5 MESES
Profesional: Nutricionista
ANAMNESIS
Alimentación actual: LME / mixta / fórmula.
Frecuencia lactancia: __________. Libre demanda: Sí / No.
Dificultades: __________.
Uso de fórmula: __________. Preparación: __________.
Otros líquidos/alimentos introducidos: Sí / No. Cuáles: __________.
Conocimiento familiar sobre alimentación complementaria: __________.
Antecedentes familiares de obesidad, DM2, dislipidemia u otros: __________.
Hábitos alimentarios familiares: __________.
Retorno laboral/estudios maternos: __________.
Conocimiento de extracción, conservación y transporte de leche materna: __________.
PNAC: retiro/uso __________.
Pauta riesgo malnutrición por exceso del 4.º mes: __________.
EXPLORACIÓN
Peso ___ kg. Talla ___ cm. CC ___ cm.
P/E Z ___ / L-E Z ___ / P-L Z ___.
Diagnóstico nutricional: __________.
Tendencia curva crecimiento: __________.
Examen general orientado a problemas nutricionales: __________.
Score riesgo neumonía: __________.
Diagnóstico nutricional integral: __________.
ACTUACIÓN
Mantener lactancia materna exclusiva hasta cumplir 6 meses.
Educar sobre inicio de alimentación complementaria desde los 180 días.
Explicar alimentación responsiva: respetar señales de hambre y saciedad, sin forzar, engañar, premiar ni castigar con alimentos.
Orientar sobre consistencia, cantidades, horarios y progresión de alimentación complementaria.
Educar sobre preparación, almacenamiento, higiene y prevención de contaminación cruzada.
Indicar alimentación sin adición de sal ni azúcar según recomendación de la norma.
Evitar pantallas durante alimentación.
Orientar uso seguro de silla y utensilios.
Mantener/promover lactancia materna complementaria.
Plan nutricional: __________.
Derivación/seguimiento: __________.
Próximo control: 6 meses.
Estos contenidos corresponden directamente a la consulta nutricional de 5 meses descrita por la norma, cuyo objetivo incluye preparar a la familia para la alimentación complementaria desde los 6 meses.`,

  fichaControlNinoSano6Meses: `CONTROL NIÑO SANO – 6 MESES
ANAMNESIS
Intercurrencias: __________.
Alimentación: LM __________. Alimentación complementaria iniciada: Sí / No.
Alimentos/consistencia/frecuencia: __________.
Aceptación/tolerancia: __________.
Señales hambre-saciedad respetadas: __________.
Diuresis/deposiciones: __________.
Sueño/despertares: __________.
Desarrollo: control cefálico __________, sedestación con apoyo __________, manipulación/transfiere objetos __________, vocalizaciones __________, respuesta al nombre/sonidos __________, interacción social __________.
Salud oral/erupción dentaria: __________.
Estado emocional materno: __________.
Red de apoyo/retorno laboral: __________.
Inmunizaciones: __________.
EXPLORACIÓN
Peso ___ kg. Talla ___ cm. CC ___ cm.
P/E Z ___ / L-E Z ___ / P-L Z ___ / CC-E ___.
Diagnóstico nutricional: __________.
Examen general y segmentario: piel, cabeza/fontanela, ojos/reflejo rojo, audición, boca/dentición, cardiopulmonar, abdomen, genitales, caderas/extremidades.
Neurológico/DSM: tono __________, sedestación __________, prensión/manipulación __________, interacción __________.
Score neumonía: __________.
Edimburgo materno: ___ puntos / __________.
Pauta seguridad infantil entregada: Sí / No.
CERO 6 meses realizado/pendiente: __________.
Diagnósticos: __________.
ACTUACIÓN
Mantener lactancia materna complementaria.
Continuar/progresar alimentación complementaria saludable y responsiva.
Orientar sobre consistencias y variedad acorde a desarrollo.
Evitar azúcar y sal añadidas según recomendación de la norma.
Estimulación mediante juego, interacción, vocalización y exploración segura.
Prevención de caídas, quemaduras, asfixia/atragantamiento, intoxicaciones y accidentes.
Higiene oral desde erupción dentaria.
Revisar inmunizaciones.
Edimburgo alterado → derivación/seguimiento.
Derivar a CERO si pendiente.
Próximo control: 8 meses.
La norma establece a los 6 meses score de neumonía, Edimburgo y entrega de pauta de seguridad infantil; además, el calendario incorpora CERO de 6 meses.`,

  fichaControlNinoSano8Meses: `CONTROL NIÑO SANO – 8 MESES
ANAMNESIS
Intercurrencias: __________.
LM: Sí / No. Alimentación complementaria: __________.
Frecuencia/variedad/consistencia: __________.
Agua: __________. Dificultades alimentarias: __________.
Sueño: __________.
Eliminación: __________.
Desarrollo: sedestación __________, desplazamiento __________, transferencia/manipulación objetos __________, balbuceo __________, interacción social __________, respuesta al nombre __________.
Preocupaciones por desarrollo: __________.
Seguridad domiciliaria: __________.
Pauta de seguridad completada: Sí / No.
CERO: __________.
Inmunizaciones: __________.
EXPLORACIÓN
Peso ___ kg. Talla ___ cm. CC ___ cm.
P/E ___ / L-E ___ / P-L ___ / CC-E ___.
Diagnóstico nutricional: __________.
Examen físico general y segmentario: __________.
Dentición/salud oral: __________.
Neurológico: tono, simetría, sedestación, movilidad, manipulación, lenguaje/interacción __________.
EEDP: puntaje __________.
Resultado: normal / riesgo / retraso __________.
Score neumonía: __________.
Pauta seguridad infantil: __________.
Pauta CERO: __________.
Diagnósticos: __________.
ACTUACIÓN
Continuar LM complementaria y alimentación saludable/responsiva.
Progresar consistencias según habilidades oromotoras.
Estimulación del DSM mediante juego, exploración segura, comunicación y lectura/interacción.
No utilizar dispositivos que limiten innecesariamente movimiento/exploración.
Prevención de accidentes, especialmente caídas, quemaduras, asfixia, intoxicaciones y acceso a objetos pequeños.
Higiene oral.
EEDP alterado → plan de intervención/derivación y seguimiento.
Revisar inmunizaciones.
Próximo control: 12 meses.
La característica central de este control es la evaluación formal del DSM mediante EEDP, junto con revisión de pauta de seguridad y CERO.`,

  fichaControlNinoSano12Meses: `CONTROL NIÑO SANO – 12 MESES
ANAMNESIS
Intercurrencias: __________.
Alimentación: LM __________. Número de comidas __________. Variedad/consistencia __________. Agua __________.
Uso de mamadera/chupete: __________.
Sueño: __________. Eliminación: __________.
Desarrollo: sedestación __________, se pone de pie __________, marcha con/sin apoyo __________, pinza fina __________, señala __________, balbuceo/palabras __________, responde a nombre/órdenes simples __________, interacción social __________.
Salud oral: dentición __________. Cepillado __________. CERO __________.
Riesgo biopsicosocial: __________.
Inmunizaciones: __________.
EXPLORACIÓN
Peso ___ kg. Talla ___ cm. CC ___ cm.
P/E ___ / L-E ___ / P-L ___ / CC-E ___.
Diagnóstico nutricional: __________.
Examen general/segmentario completo.
Ojos: reflejo rojo/motilidad __________.
Audición: __________.
Boca/dentición: __________.
Cardiopulmonar: __________.
Abdomen: __________.
Genitales: __________.
Extremidades/marcha si corresponde: __________.
Neurológico/DSM: __________.
Pauta breve DSM: __________.
Score neumonía: __________.
Pauta biopsicosocial: __________.
CERO: __________.
Diagnósticos: __________.
ACTUACIÓN
Promover alimentación familiar saludable adaptada a edad y desarrollo.
Mantener LM complementaria según díada/familia.
Alimentación responsiva, respetando hambre/saciedad.
Promover vaso y autonomía progresiva para alimentación.
Estimulación del lenguaje, lectura, juego e interacción.
Favorecer desplazamiento/exploración en ambiente seguro.
Cepillado dental y seguimiento CERO.
Prevención de accidentes.
Revisión de inmunizaciones.
DSM alterado → intervención/derivación.
Próximo control: 18 meses.
A los 12 meses la norma contempla pauta breve de DSM, score de neumonía, pauta biopsicosocial y revisión CERO.`,

  fichaControlNinoSano18Meses: `CONTROL NIÑO SANO – 18 MESES
ANAMNESIS
Intercurrencias: __________.
Alimentación: número de comidas __________, variedad __________, frutas/verduras __________, agua __________, bebidas/jugos __________.
LM: Sí / No. Mamadera/chupete: __________.
Sueño: __________.
Eliminación: __________. Inicio control esfínter: __________.
Desarrollo: marcha independiente __________, carrera/inicio __________, manipulación fina __________, palabras __________, comprensión de órdenes __________, señala para pedir/mostrar __________, imitación/juego __________, contacto/interacción social __________.
Preocupaciones por lenguaje/conducta/desarrollo: __________.
Salud oral: __________.
Inmunizaciones: __________.
EXPLORACIÓN
Peso ___ kg. Talla ___ cm. CC ___ cm.
P/E ___ / L-E ___ / P-L ___ / CC-E ___.
Diagnóstico nutricional: __________.
Examen físico segmentario completo.
Marcha y extremidades: __________.
Neurológico: tono, simetría, coordinación, interacción __________.
EEDP: puntaje __________. Resultado __________.
Diagnósticos: __________.
ACTUACIÓN
Alimentación saludable, variada y responsiva.
Promover agua y limitar bebidas azucaradas/alimentos de baja calidad nutricional.
Estimular lenguaje mediante conversación, lectura, canciones y juego.
Favorecer juego libre y actividad física.
Orientar sobre rabietas y acompañamiento emocional respetuoso.
Control de esfínter según madurez, sin castigos ni presión.
Prevención de accidentes.
Higiene oral y control odontológico según calendario.
EEDP alterado → intervención/derivación/seguimiento.
Revisión de inmunizaciones.
Próximo control: 2 años.
La norma reserva en este control la evaluación formal mediante EEDP.`,

  fichaControlNinoSano2Anos: `CONTROL NIÑO SANO – 2 AÑOS
ANAMNESIS
Intercurrencias/morbilidades: __________.
Alimentación: horarios __________, variedad __________, frutas/verduras __________, agua __________, lácteos __________, ultraprocesados/bebidas azucaradas __________.
Sueño: ___ horas. Ronquidos/apneas: __________.
Eliminación: __________. Control esfínter: __________.
Desarrollo: marcha/carrera __________, escaleras __________, motricidad fina __________, lenguaje/palabras/frases __________, comprensión __________, juego simbólico __________, interacción social __________.
Conducta/rabietas: __________.
Pantallas: ___ h/día.
Salud oral: cepillado __________, CERO __________.
Riesgo biopsicosocial: __________.
Inmunizaciones: __________.
EXPLORACIÓN
Peso ___ kg. Talla ___ cm. CC ___ cm.
P/E ___ / T-E ___ / P-T ___.
Diagnóstico nutricional/talla: __________.
Examen físico segmentario completo.
Dentición/caries: __________.
Marcha/extremidades/pies: __________.
Neurológico/DSM: __________.
Pauta breve DSM: normal / alterada __________.
Pauta riesgo biopsicosocial: __________.
CERO: __________.
Diagnósticos: __________.
ACTUACIÓN
Promover alimentación familiar saludable y agua como bebida principal.
Evitar alimentos/bebidas de alta densidad energética y bajo aporte nutricional.
Promover actividad física y juego libre.
Orientar límites de pantallas y priorizar interacción directa.
Estimular lenguaje, lectura y juego simbólico.
Orientar manejo respetuoso de rabietas.
Control de esfínter acorde a madurez.
Cepillado dental y CERO.
Prevención de accidentes.
DSM alterado → derivación/seguimiento.
Revisión de inmunizaciones.
Próximo control: 3 años.
La norma indica a los 2 años pauta biopsicosocial, pauta breve DSM y revisión CERO.`,

  fichaControlNinoSano3Anos: `CONTROL NIÑO SANO – 3 AÑOS
ANAMNESIS
Intercurrencias: __________.
Alimentación/hidratación: __________.
Actividad física: __________. Pantallas: ___ h/día.
Sueño: ___ h. Ronquidos/apneas: __________.
Eliminación/control esfínter: __________.
Desarrollo: marcha/carrera/salto __________, escaleras __________, motricidad fina __________, lenguaje/frases __________, comprensión __________, juego imaginativo __________, interacción con pares __________, autonomía __________.
Asistencia jardín infantil: Sí / No. Adaptación: __________.
Conducta/estado emocional: __________.
Visión: preocupaciones __________.
Audición/lenguaje: __________.
Salud oral/CERO: __________.
Riesgo biopsicosocial: __________.
EXPLORACIÓN
Peso ___ kg. Talla ___ cm.
IMC ___ kg/m². Indicadores antropométricos: __________.
Diagnóstico nutricional: __________. Talla: __________.
PA: / mmHg.
Examen físico general y segmentario.
Agudeza visual: OD ___ / OI ___ mediante Tumbling E/Snellen según cooperación.
Cavidad oral/dentición/caries: __________.
Cardiopulmonar/abdomen/genitales: __________.
Marcha/postura/extremidades: __________.
Neurológico: __________.
TEPSI: puntaje __________. Resultado: normal / riesgo / retraso __________.
Pauta riesgo biopsicosocial: __________.
Pauta riesgo malnutrición por exceso: __________.
CERO: __________.
Diagnósticos: __________.
ACTUACIÓN
Alimentación saludable y estructurada.
Promover actividad física/juego diario.
Regular pantallas y evitar uso durante comidas/sueño.
Promover lectura, conversación, juego imaginativo y socialización.
Orientar límites consistentes y acompañamiento emocional.
Higiene oral/CERO.
Alteración visual → evaluación/derivación.
TEPSI alterado → intervención/derivación y seguimiento.
Alteración PA/nutricional → conducta correspondiente.
Revisión de inmunizaciones.
Próximo control: consulta nutricional 3 años 6 meses.
Este control incluye específicamente TEPSI, visión con Tumbling E/Snellen, presión arterial, pauta de riesgo de malnutrición por exceso, pauta biopsicosocial y CERO.`,

  consultaNutricional3Anos6Meses: `CONSULTA NUTRICIONAL – 3 AÑOS 6 MESES
Profesional: Nutricionista
ANAMNESIS
Antecedentes/intercurrencias desde último control: __________.
Frecuencia y horarios de comidas: __________.
Desayuno: __________.
Frutas/verduras: __________.
Lácteos: __________.
Carnes/legumbres: __________.
Agua: __________.
Bebidas/jugos: __________.
Golosinas/snacks/ultraprocesados: __________.
Porciones: __________.
Selectividad alimentaria: __________.
Uso mamadera/chupete: __________.
Lugar/contexto de alimentación: __________.
Pantallas durante comidas: Sí / No.
Actividad física: __________.
Sedentarismo/pantallas: ___ h/día.
Sueño: __________.
Hábitos alimentarios familiares: __________.
Antecedentes familiares metabólicos/cardiovasculares: __________.
CERO: __________.
EXPLORACIÓN
Peso ___ kg. Talla ___ cm. IMC ___.
IMC/E Z ___ / T/E Z ___.
Diagnóstico nutricional: __________.
Evolución curva crecimiento: __________.
Examen dirigido: signos de déficit/exceso nutricional __________.
Diagnóstico nutricional integral: __________.
ACTUACIÓN
Plan alimentario individualizado según diagnóstico.
Mantener horarios estructurados de alimentación.
Promover alimentación variada, frutas, verduras, legumbres y agua.
Disminuir bebidas azucaradas, golosinas y ultraprocesados.
Respetar hambre/saciedad; no obligar ni utilizar alimentos como premio/castigo.
Comer idealmente en familia y sin pantallas.
Promover actividad física y juego activo.
Abordar selectividad alimentaria con exposición repetida y respetuosa.
Derivaciones según estado nutricional/factores de riesgo: __________.
Seguimiento: __________.
Próximo CSI: 4 años.
La consulta de 3 años 6 meses está dirigida específicamente a pesquisar malnutrición, hábitos alimentarios y factores de riesgo, y a intervenir sobre alimentación y actividad física.`,

  fichaControlNinoSano4Anos: `CONTROL NIÑO SANO – 4 AÑOS
ANAMNESIS
Morbilidades/intercurrencias: __________.
Alimentación/hidratación: __________.
Actividad física: __________. Pantallas: __________.
Sueño: __________. Ronquidos/apneas: __________.
Eliminación: __________.
Desarrollo/lenguaje/autonomía: __________.
Jardín/colegio: __________. Rendimiento/adaptación: __________.
Interacción con pares: __________.
Conducta/estado emocional: __________.
Visión/audición: __________.
Salud oral/CERO: __________.
Riesgo biopsicosocial: __________.
EXPLORACIÓN
Peso ___ kg. Talla ___ cm. IMC ___.
IMC/E Z ___ / T/E Z ___.
Diagnóstico nutricional: __________.
PA / mmHg.
Agudeza visual: OD ___ / OI ___.
Examen general.
Piel: __________.
Boca/dentición: __________.
Cardiopulmonar: __________.
Abdomen: __________.
Genitales: __________.
Marcha/postura/columna/extremidades/pies: __________.
Neurológico/desarrollo: __________.
Pauta biopsicosocial: __________.
CERO: __________.
Diagnósticos: __________.
ACTUACIÓN
Alimentación saludable, hidratación con agua y actividad física diaria.
Promover autonomía progresiva.
Estimulación de lenguaje, lectura, juego y habilidades sociales.
Higiene del sueño y límites de pantallas.
Cepillado dental y seguimiento CERO.
Prevención de accidentes.
Alteración visual/auditiva → derivación.
PA o estado nutricional alterado → evaluación/intervención.
Revisión de inmunizaciones.
Próximo control: 5 años.
La norma indica a los 4 años riesgo biopsicosocial, CERO, evaluación visual y toma de presión arterial.`,

  fichaControlNinoSano5Anos: `CONTROL NIÑO SANO – 5 AÑOS
ANAMNESIS
Antecedentes/morbilidades/medicamentos/alergias: __________.
Escolaridad/jardín: __________. Rendimiento/aprendizaje __________. Atención/conducta __________. Relación con pares __________.
Estado emocional: ánimo __________, ansiedad/miedos __________, conducta __________.
Alimentación: __________. Agua __________.
Actividad física: __________. Pantallas: ___ h/día.
Sueño: ___ h. Ronquidos/apneas: __________.
Eliminación/enuresis/encopresis: __________.
Visión: __________. Audición: __________.
Salud oral: cepillado __________, caries/dolor __________, CERO __________.
Seguridad/prevención de accidentes: __________.
EXPLORACIÓN
Peso ___ kg. Talla ___ cm. IMC ___.
IMC/E Z ___ / T/E Z ___.
Diagnóstico nutricional: __________.
PA / mmHg. FC ___.
Estado general/interacción/ánimo: __________.
Piel y fanéreos: __________.
Agudeza visual: OD ___ / OI ___. Reflejo rojo __________.
Audición: __________.
Cavidad oral: dentición __________, caries __________, encías __________, oclusión __________.
Cardiopulmonar: __________.
Abdomen: __________.
Genitales: __________. Desarrollo puberal si corresponde: __________.
Marcha/postura: __________.
Test de Adams: __________.
Extremidades/pies: __________.
Neurológico: __________.
Cuestionario de Salud Infantil: __________.
CERO: __________.
Diagnósticos: __________.
ACTUACIÓN
Consejería sobre alimentación saludable, agua y actividad física.
Promover juego activo y disminuir sedentarismo.
Higiene del sueño y uso adecuado de pantallas.
Cepillado dental y CERO.
Promover adaptación escolar, autonomía y habilidades socioemocionales.
Prevención de accidentes y seguridad vial.
Derivaciones según visión, audición, nutrición, salud oral, columna, desarrollo o salud mental.
Revisión de inmunizaciones.
Próximo control: 6 años.`,

  fichaControlNinoSano7Anos: `CONTROL NIÑO SANO – 7 AÑOS
ANAMNESIS
Antecedentes/morbilidades/medicamentos/alergias: __________.
Curso/colegio: __________. Rendimiento __________. Asistencia __________. Aprendizaje/atención __________.
Relación con pares/docentes: __________. Bullying: Sí / No.
Estado emocional/conductual: __________.
Alimentación/hidratación: __________.
Actividad física: ___ min/día. Sedentarismo/pantallas: __________.
Sueño: ___ h. Ronquidos/apneas: __________.
Eliminación: __________.
Salud oral/CERO: __________.
Visión/lentes: __________. Audición: __________.
Seguridad vial/casco/cinturón: __________.
EXPLORACIÓN
Peso ___ kg. Talla ___ cm. IMC ___.
IMC/E Z ___ / T/E Z ___.
PA / mmHg.
Estado general/ánimo/interacción: __________.
Piel: lesiones __________, acantosis __________.
Cabello/cuero cabelludo: __________.
Agudeza visual OD ___ / OI ___. Reflejo rojo __________.
Audición: __________.
Dentición mixta/caries/encías/oclusión: __________.
Cardiopulmonar: __________.
Síntomas sugerentes de asma: __________.
Abdomen: __________.
Desarrollo puberal/Tanner con consentimiento y resguardo de privacidad: __________.
Marcha/postura/columna: __________. Adams __________.
Extremidades/pies: __________.
Neurológico: __________.
Cuestionario Salud Infantil: __________.
CERO: __________.
Diagnósticos: __________.
ACTUACIÓN
Consejería en alimentación, hidratación y actividad física.
Promover ≥60 minutos/día de actividad física según recomendaciones de la norma para escolares.
Reducir sedentarismo y uso excesivo de pantallas.
Higiene del sueño.
Cepillado dental y CERO.
Promover bienestar emocional, convivencia escolar y prevención de bullying.
Educación en seguridad vial y prevención de accidentes.
Evaluar/derivar alteraciones visuales, auditivas, nutricionales, PA, columna, pubertad o salud mental.
Revisión de inmunizaciones.
Próximo control: 8 años.`,

  fichaControlNinoSano8Anos: `CONTROL NIÑO SANO – 8 AÑOS
ANAMNESIS
Morbilidades/medicamentos/alergias: __________.
Escolaridad/rendimiento/aprendizaje: __________.
Atención/conducta: __________.
Relación con pares/bullying: __________.
Ánimo/ansiedad/irritabilidad: __________.
Alimentación/hidratación: __________.
Actividad física: __________. Pantallas: __________.
Sueño: __________. Ronquidos/apneas: __________.
Eliminación: __________.
Salud oral/CERO: __________.
Visión/audición: __________.
Cambios puberales referidos: __________.
EXPLORACIÓN
Peso ___ kg. Talla ___ cm. IMC ___.
IMC/E Z ___ / T/E Z ___.
PA / mmHg.
Estado general/ánimo/interacción: __________.
Piel: __________. Acantosis: __________. Olor axilar: __________.
Agudeza visual OD ___ / OI ___.
Audición: __________.
Cavidad oral/dentición/caries/oclusión: __________.
Cardiopulmonar: __________.
Abdomen: __________.
Tanner: __________, realizado con consentimiento/asentimiento y privacidad.
Signos de pubertad precoz/alteración puberal: __________.
Postura/columna/Adams: __________.
Extremidades/pies/marcha: __________.
Neurológico: __________.
Cuestionario Salud Infantil: __________.
CERO: __________.
Diagnósticos: __________.
ACTUACIÓN
Consejería nutricional y actividad física.
Promover estilos de vida saludables y prevención de malnutrición por exceso.
Educación sobre cambios corporales/puberal acorde a edad.
Promover autoestima, bienestar emocional y relaciones saludables.
Prevención de bullying y violencia.
Higiene corporal y oral.
Higiene del sueño y uso responsable de pantallas.
Derivación según hallazgos nutricionales, visuales, auditivos, puberales, osteomusculares o psicosociales.
Revisión de inmunizaciones.
Próximo control: 9 años.`,

  fichaControlNinoSano9Anos: `CONTROL NIÑO SANO – 9 AÑOS
ANAMNESIS
Antecedentes/morbilidades/medicamentos/alergias: __________.
Curso/colegio: __________. Rendimiento __________. Aprendizaje/atención __________.
Relación con pares: __________. Bullying/ciberbullying: __________.
Estado emocional: ánimo __________, ansiedad __________, irritabilidad __________, autoestima __________.
Dinámica familiar/red de apoyo: __________.
Alimentación: __________. Hidratación: __________.
Actividad física: __________. Sedentarismo/pantallas: __________.
Sueño: ___ h. Calidad __________. Ronquidos/apneas __________.
Eliminación: __________.
Salud oral/CERO: __________.
Visión/audición: __________.
Cambios puberales: __________.
EXPLORACIÓN
Peso ___ kg. Talla ___ cm. IMC ___.
IMC/E Z ___ / T/E Z ___.
Diagnóstico nutricional: __________.
PA / mmHg. FC ___.
Estado general/ánimo/interacción: __________.
Piel: __________. Acantosis: __________. Lesiones autoinfligidas visibles: __________.
Cabello/cuero cabelludo/uñas: __________.
Agudeza visual OD ___ / OI ___.
Audición: __________.
Cavidad oral: dentición permanente/en recambio __________, caries __________, encías __________, oclusión __________.
Cardiopulmonar: __________.
Abdomen: __________.
Desarrollo puberal/Tanner: __________, con consentimiento/asentimiento y privacidad.
Marcha/postura/columna: __________. Adams __________.
Extremidades/pies: __________.
Neurológico: __________.
Cuestionario Salud Infantil: __________.
CERO: __________.
Diagnósticos:  
1. Estado nutricional: __________.
2. Talla/crecimiento: __________.
3. PA: __________.
4. Desarrollo puberal: __________.
5. Salud oral: __________.
6. Salud visual/auditiva: __________.
7. Salud mental/psicosocial: __________.
8. Otros: __________.
ACTUACIÓN
Consejería sobre alimentación saludable e hidratación.
Promover actividad física diaria y reducción del sedentarismo.
Orientar sobre sueño saludable y pantallas.
Educación anticipatoria respecto a pubertad, cambios físicos y autocuidado.
Promover autoestima, comunicación familiar y relaciones respetuosas.
Pesquisar y abordar bullying, violencia u otras situaciones de riesgo.
Higiene corporal y oral. Continuar controles CERO.
Seguridad vial y prevención de accidentes.
Derivación según alteraciones de estado nutricional, PA, visión, audición, salud oral, columna, pubertad, aprendizaje o salud mental.
Revisión de inmunizaciones.
Continuidad de atención según hallazgos y transición a controles correspondientes a etapa siguiente.`
};

function parseTemplateText(rawText) {
  const anamMatch = rawText.match(/ANAMNESIS([\s\S]*?)(?=EXPLORACIÓN|$)/i);
  const explMatch = rawText.match(/EXPLORACIÓN([\s\S]*?)(?=ACTUACIÓN|$)/i);
  const actMatch = rawText.match(/ACTUACIÓN([\s\S]*?)$/i);

  return {
    anamnesis: anamMatch ? anamMatch[1].trim() : '',
    exploracion: explMatch ? explMatch[1].trim() : '',
    actuacion: actMatch ? actMatch[1].trim() : ''
  };
}

for (const t of templates) {
  const rawText = prompts[t.key] || '';
  const parsed = parseTemplateText(rawText);
  
  const componentCode = `import React, { useState, useCallback, useEffect } from 'react';
import { User } from '../types';
import FormField from './FormField';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData = {
  edad: '${t.title.replace('CONTROL DE SALUD DE LA DÍADA / RECIÉN NACIDO', 'Recién Nacido').replace('CONTROL NIÑO SANO – ', '').replace('CONSULTA NUTRICIONAL – ', '')}',
  acompanante: '',
  parentesco: '',
  profesional: '',
  peso: '',
  talla: '',
  perimetroCefalico: '',
  imc: '',
  pa: '',
  fc: '',
  fr: '',
  diagnosticoNutricional: '',
  diagnosticoTalla: '',
  anamnesisDetalle: ${JSON.stringify(parsed.anamnesis)},
  exploracionDetalle: ${JSON.stringify(parsed.exploracion)},
  actuacionDetalle: ${JSON.stringify(parsed.actuacion)},
  proximoControl: '${t.next}',
};

interface Props {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const ${t.key}: React.FC<Props> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage('local_${t.key}', initialFormData);
  const [anamnesisText, setAnamnesisText] = useState('');
  const [exploracionText, setExploracionText] = useState('');
  const [actuacionText, setActuacionText] = useState('');

  const generateSummaryParts = useCallback(() => {
    const todayStr = new Date().toLocaleDateString('es-ES');
    let anamnesis = \`FICHA ${t.title}\\n---------------------------------------\\nFECHA INGRESO: \${todayStr}\\nPROFESIONAL RESPONSABLE: \${loggedInUser?.fullName || ''}\\nMOTIVO DE CONSULTA: ${t.title}\\n---------------------------------------\\n\\n\`;
    
    if (formData.acompanante) anamnesis += \`- Acompañante: \${formData.acompanante}\${formData.parentesco ? \` (\${formData.parentesco})\` : ''}\\n\`;
    if (formData.profesional) anamnesis += \`- Profesional: \${formData.profesional}\\n\`;
    anamnesis += \`\\nANAMNESIS:\\n\${formData.anamnesisDetalle}\\n\`;

    let exploracion = \`ANTROPOMETRÍA Y PARÁMETROS:\\n\`;
    if (formData.peso) exploracion += \`- Peso: \${formData.peso} kg\\n\`;
    if (formData.talla) exploracion += \`- Talla: \${formData.talla} cm\\n\`;
    if (formData.perimetroCefalico) exploracion += \`- P. Cefálico: \${formData.perimetroCefalico} cm\\n\`;
    if (formData.imc) exploracion += \`- IMC: \${formData.imc}\\n\`;
    if (formData.pa) exploracion += \`- PA: \${formData.pa} mmHg\\n\`;
    if (formData.fc) exploracion += \`- FC: \${formData.fc} lpm\\n\`;
    if (formData.fr) exploracion += \`- FR: \${formData.fr} rpm\\n\`;
    if (formData.diagnosticoNutricional) exploracion += \`- Dg. Nutricional: \${formData.diagnosticoNutricional}\\n\`;
    if (formData.diagnosticoTalla) exploracion += \`- Dg. Talla: \${formData.diagnosticoTalla}\\n\`;
    exploracion += \`\\nEXPLORACIÓN:\\n\${formData.exploracionDetalle}\\n\`;

    let actuacion = \`ACTUACIÓN Y PLAN:\\n\${formData.actuacionDetalle}\\n\`;
    if (formData.proximoControl) actuacion += \`\\nPRÓXIMO CONTROL: \${formData.proximoControl}\\n\`;

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
    navigator.clipboard.writeText(text).then(() => {
      alert(\`'\${title}' copiado al portapapeles.\`);
    }).catch(err => {
      console.error('Error al copiar: ', err);
    });
  };

  const handleNewDocument = () => {
    setFormData(initialFormData);
  };

  return (
    <div className="w-full flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">
        <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
          <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4">
            
            <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2">${t.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="Edad / Control" id="edad" name="edad" value={formData.edad} onChange={handleChange} inputClassName="text-black" />
                <FormField label="Acompañante" id="acompanante" name="acompanante" value={formData.acompanante} onChange={handleChange} inputClassName="text-black" />
                <FormField label="Parentesco" id="parentesco" name="parentesco" value={formData.parentesco} onChange={handleChange} inputClassName="text-black" />
              </div>
            </section>

            <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2">Parámetros y Antropometría</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <FormField label="Peso (kg / g)" id="peso" name="peso" value={formData.peso} onChange={handleChange} inputClassName="text-black" />
                <FormField label="Talla (cm)" id="talla" name="talla" value={formData.talla} onChange={handleChange} inputClassName="text-black" />
                <FormField label="P. Cefálico (cm)" id="perimetroCefalico" name="perimetroCefalico" value={formData.perimetroCefalico} onChange={handleChange} inputClassName="text-black" />
                <FormField label="IMC / Z-score" id="imc" name="imc" value={formData.imc} onChange={handleChange} inputClassName="text-black" />
                <FormField label="PA (mmHg)" id="pa" name="pa" value={formData.pa} onChange={handleChange} inputClassName="text-black" />
                <FormField label="FC (lpm)" id="fc" name="fc" value={formData.fc} onChange={handleChange} inputClassName="text-black" />
                <FormField label="FR (rpm)" id="fr" name="fr" value={formData.fr} onChange={handleChange} inputClassName="text-black" />
                <FormField label="Dg. Nutricional" id="diagnosticoNutricional" name="diagnosticoNutricional" value={formData.diagnosticoNutricional} onChange={handleChange} inputClassName="text-black" />
              </div>
            </section>

            <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2">Anamnesis</h3>
              <FormField label="Registro de Anamnesis" id="anamnesisDetalle" name="anamnesisDetalle" value={formData.anamnesisDetalle} onChange={handleChange} isTextArea rows={12} inputClassName="text-black font-mono text-xs" />
            </section>

            <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2">Exploración Física</h3>
              <FormField label="Registro de Exploración Física" id="exploracionDetalle" name="exploracionDetalle" value={formData.exploracionDetalle} onChange={handleChange} isTextArea rows={12} inputClassName="text-black font-mono text-xs" />
            </section>

            <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2">Actuación, Indicaciones y Próximo Control</h3>
              <FormField label="Registro de Actuación e Indicaciones" id="actuacionDetalle" name="actuacionDetalle" value={formData.actuacionDetalle} onChange={handleChange} isTextArea rows={10} inputClassName="text-black font-mono text-xs" />
              <FormField label="Próximo Control" id="proximoControl" name="proximoControl" value={formData.proximoControl} onChange={handleChange} inputClassName="text-black" />
            </section>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border border-slate-200 bg-white rounded-xl shadow-sm mb-6">
              <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs uppercase tracking-widest cursor-pointer">
                Volver al Menú
              </button>
              <button type="button" onClick={handleNewDocument} className="w-full sm:w-auto px-8 py-3 bg-slate-700 text-white font-black rounded-xl shadow-lg hover:bg-slate-800 transition-all uppercase text-xs tracking-widest cursor-pointer">
                Restablecer Plantilla
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-4 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2 lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden">
          <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden w-full">
            <div className="border-b border-sky-200/80 pb-1 mb-2 w-full flex-shrink-0">
              <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Resumen Ficha Clínica (Editable)</h3>
            </div>
            <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">ANAMNESIS</label>
                  <button onClick={() => handleCopyToClipboard(anamnesisText, 'Anamnesis')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                </div>
                <textarea value={anamnesisText} onChange={(e) => setAnamnesisText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">EXPLORACIÓN</label>
                  <button onClick={() => handleCopyToClipboard(exploracionText, 'Exploración')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                </div>
                <textarea value={exploracionText} onChange={(e) => setExploracionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">ACTUACIÓN</label>
                  <button onClick={() => handleCopyToClipboard(actuacionText, 'Actuación')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                </div>
                <textarea value={actuacionText} onChange={(e) => setActuacionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${t.key};
`;

  fs.writeFileSync(`components/${t.key}.tsx`, componentCode, 'utf-8');
  console.log('Created components/' + t.key + '.tsx');
}
