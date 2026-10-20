const fs = require('fs');
const path = require('path');

// Definition of components that need structured form conversion
const templates = [
  {
    fileName: 'fichaControlNinoSanoRN.tsx',
    componentName: 'fichaControlNinoSanoRN',
    title: 'CONTROL DE SALUD DE LA DÍADA / RECIÉN NACIDO',
    storageKey: 'local_fichaControlNinoSanoRN',
    initialFormData: {
      edad: 'Recién Nacido',
      acompanante: '',
      parentesco: '',
      profesional: 'Matrón/a – Médico/a',
      egSemanas: '',
      embarazoDetalle: '',
      partoDetalle: '',
      pnGramos: '',
      tnCm: '',
      ccCm: '',
      apgar: '',
      hospitalizacionNeonatal: 'No',
      hospitalizacionMotivo: '',
      morbilidadNeonatal: 'Niega.',
      altaDias: '',
      contactoPielConPiel: 'Sí',
      inicioLactanciaPrimeraHora: 'Sí',
      tamizajesNeonatales: 'PKU/TSH realizado, Screening auditivo normal.',
      inmunizaciones: 'BCG y Hepatitis B al día.',
      alimentacionActual: 'LME',
      frecuenciaAlimentacion: 'Libre demanda (8-12 veces/día)',
      acopleSuccion: 'Adecuados',
      dolorAmamantar: 'No',
      grietas: 'No',
      produccionLactea: 'Percepción adecuada',
      diuresisPañalesDia: '6 pañales/día',
      deposicionesDia: '3-4/día, pastosas amarillas',
      regurgitacionVomitos: 'Ocasional / Niega',
      suenoPatron: 'Normal, 16-18 horas/día',
      lugarSueno: 'Cuna propia',
      posicionSueno: 'Decúbito supino',
      madreEstadoGeneral: 'Bueno',
      madreAnimo: 'Tranquila, buen vínculo',
      madreDolorSangrado: 'Loquios fisiológicos, dolor controlado',
      redApoyo: 'Presente y activa',
      participacionPadre: 'Activa',
      factoresRiesgoBiopsicosocial: 'Sin riesgo',
      dudasFamiliares: 'Atendidas',
      // Exploracion
      efPesoActual: '',
      efVariacionPesoNacimiento: '',
      efTalla: '',
      efPerimetroCefalico: '',
      efEstadoGeneral: 'Activo, reactivo, bien perfundido.',
      efPielIctericia: 'No',
      efPielCianosis: 'No',
      efPielLesiones: 'Sin lesiones',
      efCabezaFontanela: 'Normotensa, suturas afrontadas',
      efOjosReflejoRojo: 'Presente bilateral',
      efBocaPaladar: 'Mucosas húmedas, paladar indemne, succión vigorosa',
      efCuelloClaviculas: 'Indemnes, sin fractura de clavícula',
      efFc: '',
      efFr: '',
      efCardiovascular: 'RCR 2T, sin soplos, pulsos femorales presentes y simétricos',
      efPulmonar: 'MP (+) bilateral simétrico, sin ruidos agregados',
      efAbdomenOmbligo: 'Blando, depresible. Cordón umbilical en proceso de momificación, limpio',
      efGenitalesAno: 'Normoconfigurados según sexo, ano permeable',
      efCaderasOrtolaniBarlow: 'Ortolani y Barlow negativos, abducción simétrica',
      efExtremidades: 'Simétricas, movilidad espontánea adecuada',
      efNeurologicoTono: 'Alerta, tono y reflejos arcaicos presentes y simétricos',
      scoreRiesgoNeumonia: 'Bajo riesgo',
      pautaRiesgoBiopsicosocial: 'Sin riesgo',
      diagnostico1: 'RN en control de salud de la díada',
      diagnosticoNutricional: 'Recuperación ponderal adecuada',
      diagnosticoAlimentacion: 'Lactancia materna exclusiva',
      diagnosticoBiopsicosocial: 'Sin riesgo biopsicosocial',
      indicaciones: `- Reforzar lactancia materna exclusiva a libre demanda y técnica de amamantamiento.
- Educar respecto a signos de hambre/saciedad y adecuada transferencia de leche.
- Reforzar sueño seguro (decúbito supino, cuna sin almohadas ni peluches), prevención de muerte súbita y evitar humo de tabaco.
- Cuidados del cordón umbilical con alcohol al 70% e higiene diaria.
- Reforzar vínculo, contacto piel con piel, respuesta sensible al llanto y corresponsabilidad.
- Recomendaciones de prevención de accidentes.
- Explicar signos de alarma del RN: rechazo alimentario, fiebre/hipotermia, dificultad respiratoria, cianosis, ictericia progresiva.
- Próximo control: Control de salud infantil 1° mes.`,
      proximoControl: '1° mes con enfermera/médico'
    }
  },
  {
    fileName: 'fichaControlNinoSano2Meses.tsx',
    componentName: 'fichaControlNinoSano2Meses',
    title: 'CONTROL DE SALUD INFANTIL – 2 MESES',
    storageKey: 'local_fichaControlNinoSano2Meses',
    initialFormData: {
      edad: '2 meses',
      acompanante: '',
      parentesco: '',
      profesional: 'Enfermero/a – Médico/a',
      enfermedadesUltimoControl: 'Niega.',
      urgenciasHospitalizaciones: 'Niega.',
      medicamentos: 'Niega.',
      alergias: 'Niega.',
      vacunas: 'Al día (corresponden vacunas 2º mes).',
      tipoAlimentacion: 'Lactancia materna exclusiva',
      frecuenciaAlimentacion: 'Libre demanda',
      dificultadesLactancia: 'Niega.',
      usoMamaderaChupete: 'No',
      regurgitacionVomitos: 'Niega.',
      diuresis: 'Conservada.',
      deposiciones: 'Conservadas.',
      suenoHoras: '14-16 horas/día',
      lugarPosicionSueno: 'Cuna, decúbito supino',
      colecho: 'No',
      fijaSigueRostros: 'Sí',
      sonrisaSocial: 'Sí',
      reaccionaSonidosVoz: 'Sí',
      vocalizaciones: 'Sí (coexistencia de balbuceo)',
      movimientosSimetricos: 'Sí',
      controlCefalico: 'En progresión / Inicial',
      interaccionCuidadores: 'Adecuada',
      consolabilidad: 'Adecuada',
      estadoEmocionalMadre: 'Estable',
      redApoyo: 'Familia presente',
      estresoresFamiliares: 'Niega.',
      peso: '',
      talla: '',
      perimetroCefalico: '',
      peZ: '',
      teZ: '',
      ptZ: '',
      diagnosticoNutricional: 'Eutrófico/a',
      diagnosticoTalla: 'Talla normal',
      pa: '',
      fc: '',
      fr: '',
      efGeneral: 'Buen estado general, reactivo, hidratado.',
      efPiel: 'Rosada, sin ictericia ni lesiones.',
      efFontanelaSuturas: 'Fontanela anterior normotensa, suturas afrontadas.',
      efOjosReflejoRojo: 'Reflejo rojo bilateral presente, fijeza visual.',
      efAudicionRespuesta: 'Respuesta sonora adecuada.',
      efBocaPaladar: 'Mucosa oral húmeda, paladar indemne.',
      efCardiovascular: 'RR2T sin soplos, pulsos femorales presentes y simétricos.',
      efPulmonar: 'MP (+) bilateral simétrico, sin ruidos agregados.',
      efAbdomen: 'RHA (+), blando, depresible, indoloro.',
      efGenitales: 'Normoconfigurados.',
      efCaderasOrtolaniBarlow: 'Ortolani y Barlow negativos, abducción simétrica.',
      efExtremidadesPies: 'Simétricas, sin deformidades.',
      efNeurologicoTono: 'Tono adecuado, movilidad simétrica.',
      scoreRiesgoNeumonia: 'Bajo riesgo',
      edimburgoMaternoScore: '',
      edimburgoResultado: 'Normal',
      rxPelvisSolicitada: 'Sí',
      pensAlteracionPrevia: 'No',
      diagnosticos: `1. Lactante de 2 meses en control de salud infantil.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Desarrollo integral adecuado para la edad.
5. Lactancia materna exclusiva.
6. Caderas clínicamente normales. Radiografía de pelvis solicitada según norma.`,
      indicaciones: `- Mantener LME a libre demanda hasta los 6 meses.
- Reforzar técnica de lactancia y alimentación responsiva.
- Favorecer estimulación acorde a edad: interacción cara a cara, conversación, sonrisa y tummy time supervisado en vigilia.
- Mantener sueño seguro (decúbito supino, cuna despejada) y prevención de caídas/accidentes.
- Evitar humo de tabaco.
- Administrar vacunas correspondientes a los 2 meses.
- Solicitar radiografía de pelvis a los 3 meses según normativa vigente.
- Realizar tamizaje Edimburgo materno.
- Próximo control: 3 meses con médico/a.`,
      proximoControl: '3 meses con médico/a'
    }
  },
  {
    fileName: 'fichaControlNinoSano4Meses.tsx',
    componentName: 'fichaControlNinoSano4Meses',
    title: 'CONTROL DE SALUD INFANTIL – 4 MESES',
    storageKey: 'local_fichaControlNinoSano4Meses',
    initialFormData: {
      edad: '4 meses',
      acompanante: '',
      parentesco: '',
      profesional: 'Enfermero/a',
      enfermedadesUltimoControl: 'Niega.',
      urgenciasHospitalizaciones: 'Niega.',
      medicamentos: 'Niega.',
      alergias: 'Niega.',
      vacunas: 'Al día (vacunas 4º mes).',
      tipoAlimentacion: 'Lactancia materna exclusiva',
      frecuenciaAlimentacion: 'Libre demanda',
      dificultadesLactancia: 'Niega.',
      usoMamaderaChupete: 'No',
      regurgitacionVomitos: 'Niega.',
      diuresis: 'Conservada.',
      deposiciones: 'Conservadas.',
      suenoHoras: '14-15 horas/día',
      lugarPosicionSueno: 'Cuna, decúbito supino',
      colecho: 'No',
      sostenCefalicoCompleto: 'Sí',
      buscaOrigenSonidos: 'Sí',
      giraDePronoAAsupino: 'Sí / En inicio',
      tomaObjetosVoluntario: 'Sí (prensión palmar voluntaria)',
      vocalizacionesRisas: 'Risas sonoras y gorjeos',
      interaccionCuidadores: 'Adecuada',
      retornoMaternoTrabajo: 'No',
      planCuidado: '',
      peso: '',
      talla: '',
      perimetroCefalico: '',
      peZ: '',
      teZ: '',
      ptZ: '',
      diagnosticoNutricional: 'Eutrófico/a',
      diagnosticoTalla: 'Talla normal',
      pa: '',
      fc: '',
      fr: '',
      efGeneral: 'Buen estado general, reactivo, activo.',
      efPiel: 'Rosada, limpia, bien hidratada.',
      efCabezaFontanela: 'Fontanela anterior normotensa.',
      efOjosVisual: 'Fijeza y seguimiento ocular completas.',
      efAudicion: 'Orientación hacia la fuente sonora.',
      efCavidadOral: 'Mucosas limpias, paladar indemne.',
      efCardiopulmonar: 'RR2T sin soplos, MP (+) bilateral sin agregados.',
      efAbdomen: 'RHA (+), blando, depresible, indoloro.',
      efGenitales: 'Normoconfigurados.',
      efCaderasRxPelvisRevisada: 'Rx de pelvis revisada / solicitada',
      efExtremidadesNeurologico: 'Sostén cefálico firme, tono y movilidad simétricos.',
      scoreRiesgoNeumonia: 'Bajo riesgo',
      diagnosticos: `1. Lactante de 4 meses en control de salud infantil.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Desarrollo integral adecuado para la edad.
5. Alimentación: LME.
6. Evaluación de caderas al día.`,
      indicaciones: `- Mantener LME hasta los 6 meses.
- Reforzar extracción y conservación de leche si corresponde retorno laboral.
- Administrar vacunas correspondientes a los 4 meses.
- Continuar suplementación de vitaminas ACD.
- Estimulación: objetos llamativos, estimulo verbal, tummy time y libertad de movimiento sobre superficie firme.
- Sueño seguro y prevención de accidentes (caídas de superficies elevadas).
- Revisar radiografía de pelvis si no se ha realizado.
- Programar consulta nutricional de los 5 meses y control infantil de los 6 meses.`,
      proximoControl: '5° mes con nutricionista / 6° mes con enfermera'
    }
  },
  {
    fileName: 'consultaNutricional5Meses.tsx',
    componentName: 'consultaNutricional5Meses',
    title: 'CONSULTA NUTRICIONAL – 5 MESES',
    storageKey: 'local_consultaNutricional5Meses',
    initialFormData: {
      edad: '5 meses',
      acompanante: '',
      parentesco: '',
      profesional: 'Nutricionista',
      motivoConsulta: 'Evaluación y preparación para inicio de alimentación complementaria',
      antecedentesSalud: 'Sin eventos patológicos recientes.',
      tipoAlimentacionActual: 'Lactancia materna exclusiva / Fórmula',
      frecuenciaVolumenAlimentacion: '',
      suplementacionVitaminasHierro: 'Vitaminas ACD al día. Hierro según indicación.',
      toleranciaDigestiva: 'Buena, diuresis y deposiciones conservadas.',
      evaluacionMadurezAlimentaria: 'Sostén cefálico adecuado, sedestación con apoyo, pérdida de reflejo de extrusión.',
      planRetornoLaboralLactancia: '',
      peso: '',
      talla: '',
      perimetroCefalico: '',
      peZ: '',
      teZ: '',
      ptZ: '',
      imc: '',
      diagnosticoNutricional: 'Eutrófico/a',
      diagnosticoTalla: 'Talla normal',
      velocidadCrecimiento: 'Adecuada',
      efGeneral: 'Buen estado general, activo, rosado, hidratado.',
      efPielMucosas: 'Piel y mucosas sanas.',
      efCavidadOral: 'Encías sanas, paladar indemne.',
      efAbdomen: 'Blando, depresible, indoloro, RHA (+).',
      diagnosticos: `1. Lactante de 5 meses en consulta nutricional preventiva.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Alimentación actual: LME / Fórmulas adecuadamente administradas.
5. Preparado/a para inicio de alimentación complementaria a los 6 meses.`,
      indicaciones: `- Continuar LME/fórmula hasta los 6 meses.
- Educación detallada para el inicio de la alimentación complementaria a los 6 meses (papilla/puré suave, vegetales, carnes magras, legumbres, frutas).
- No agregar sal ni azúcar a las preparaciones.
- Introducción progresiva de agua pura al iniciar sólidos.
- Mantener vitaminas ACD y suplementación de hierro según norma.
- Fomentar alimentación autorregulada y ambiente tranquilo.
- Próximo control: 6° mes con enfermera/médico.`,
      proximoControl: '6° mes con enfermera'
    }
  },
  {
    fileName: 'fichaControlNinoSano6Meses.tsx',
    componentName: 'fichaControlNinoSano6Meses',
    title: 'CONTROL DE SALUD INFANTIL – 6 MESES',
    storageKey: 'local_fichaControlNinoSano6Meses',
    initialFormData: {
      edad: '6 meses',
      acompanante: '',
      parentesco: '',
      profesional: 'Enfermero/a',
      enfermedadesUltimoControl: 'Niega.',
      urgenciasHospitalizaciones: 'Niega.',
      medicamentos: 'Niega.',
      alergias: 'Niega.',
      vacunas: 'Al día (vacunas 6º mes e influenza si corresponde).',
      tipoAlimentacion: 'Lactancia materna + inicio de alimentación complementaria',
      aceptacionAlimentosSolidos: 'Inicio de papillas / purés',
      aguaPuraConsumo: 'Inicio de agua pura',
      diuresis: 'Conservada.',
      deposiciones: 'Conservadas (pueden cambiar consistencia con sólidos).',
      suenoHoras: '13-14 horas/día',
      lugarPosicionSueno: 'Cuna propia',
      colecho: 'No',
      sedestacionConApoyo: 'Sí',
      giraDePronoASupinoYSupinoAProno: 'Sí',
      transfiereObjetosManoAMano: 'Sí',
      balbuceoSilabico: 'Sí (ba-ba, ma-ma, da-da)',
      respondeASuNombre: 'Sí',
      interaccionCuidadores: 'Adecuada',
      peso: '',
      talla: '',
      perimetroCefalico: '',
      peZ: '',
      teZ: '',
      ptZ: '',
      diagnosticoNutricional: 'Eutrófico/a',
      diagnosticoTalla: 'Talla normal',
      pa: '',
      fc: '',
      fr: '',
      efGeneral: 'Buen estado general, activo, rosado.',
      efPielMucosas: 'Normales.',
      efDenticion: 'Inicio de erupción incisivos inferiores / sin piezas dentarias aún.',
      efCardiopulmonar: 'RR2T sin soplos, MP (+) bilateral sin agregados.',
      efAbdomen: 'RHA (+), blando, depresible, indoloro.',
      efGenitales: 'Normoconfigurados.',
      efNeurologicoTono: 'Sedestación con apoyo, buen tono y movilidad.',
      scoreRiesgoNeumonia: 'Bajo riesgo',
      pautaEdpAplicada: 'Sí - EDP al día',
      diagnosticos: `1. Lactante de 6 meses en control de salud infantil.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Desarrollo psicomotor (EDP): Normal.
5. Alimentación: Lactancia + alimentación complementaria iniciada.`,
      indicaciones: `- Mantener lactancia materna e incorporar 1 a 2 comidas al día (almuerzo y/o postre de fruta).
- Ofrecer agua pura hervida/filtrada varias veces al día.
- Iniciar higiene bucal desde la erupción del primer diente con cepillo infantil suave y pasta fluorada (1000 ppm fluor, cantidad granito de arroz).
- Administrar vacunas de los 6 meses.
- Iniciar o mantener suplementación de hierro según indicación profesional.
- Favorecer espacio seguro en el suelo para gateo y exploración activa.
- Evitar el uso de andador (prohibido por alto riesgo de accidentes).
- Próximo control: 8 meses con enfermera.`,
      proximoControl: '8° mes con enfermera'
    }
  },
  {
    fileName: 'fichaControlNinoSano8Meses.tsx',
    componentName: 'fichaControlNinoSano8Meses',
    title: 'CONTROL DE SALUD INFANTIL – 8 MESES',
    storageKey: 'local_fichaControlNinoSano8Meses',
    initialFormData: {
      edad: '8 meses',
      acompanante: '',
      parentesco: '',
      profesional: 'Enfermero/a',
      enfermedadesUltimoControl: 'Niega.',
      urgenciasHospitalizaciones: 'Niega.',
      medicamentos: 'Niega.',
      alergias: 'Niega.',
      vacunas: 'Al día.',
      tipoAlimentacion: 'Lactancia / Fórmula + 2 comidas al día (almuerzo y cena) + fruta',
      toleranciaAlimentaria: 'Buena aceptación de sólidos picados/grumosos',
      ingresoLegumbresPescadoHuevo: 'Iniciado progresivamente',
      diuresis: 'Conservada.',
      deposiciones: 'Conservadas.',
      suenoHoras: '13-14 horas/día',
      lugarPosicionSueno: 'Cuna propia',
      sedestacionSinApoyo: 'Sí (sedestación independiente)',
      gateoODesplazamiento: 'Gateo / Desplazamiento activo',
      prensionPinzaPinzaInicial: 'Sí (pinza gruesa / fina inicial)',
      angustiaDeSeparacion: 'Presente (ansiedad de separación normal)',
      comprendeElNo: 'Sí',
      peso: '',
      talla: '',
      perimetroCefalico: '',
      peZ: '',
      teZ: '',
      ptZ: '',
      diagnosticoNutricional: 'Eutrófico/a',
      diagnosticoTalla: 'Talla normal',
      pa: '',
      fc: '',
      fr: '',
      efGeneral: 'Buen estado general, interactivo, curioso.',
      efDenticion: 'Incisivos centrales presentes / erupción en curso.',
      efCardiopulmonar: 'RR2T sin soplos, MP (+) bilateral.',
      efAbdomen: 'Blando, depresible, indoloro.',
      efGenitales: 'Normoconfigurados.',
      efNeurologicoEDP: 'EDP normal / Sedestación estable, gateo.',
      scoreRiesgoNeumonia: 'Bajo riesgo',
      diagnosticos: `1. Lactante de 8 meses en control de salud infantil.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Desarrollo psicomotor: Adecuado.
5. Alimentación complementaria bien establecida.`,
      indicaciones: `- Avanzar a consistencias más molidas/trituradas con tenedor (no licuar en exceso).
- Incorporar legumbres (2 veces/semana), pescado y huevo bien cocidos.
- Mantener lactancia materna o fórmula habitual.
- Cepillado dental 2 veces/día con pasta fluorada (1000 ppm).
- Adecuar seguridad del hogar: proteger enchufes, escaleras, objetos pequeños y tóxicos (fase de exploración y gateo).
- Respetar la etapa de ansiedad de separación ofreciendo contención y seguridad.
- Próximo control: 12 meses (1 año) con médico/enfermera.`,
      proximoControl: '12° mes (1 año) con médico/enfermera'
    }
  },
  {
    fileName: 'fichaControlNinoSano12Meses.tsx',
    componentName: 'fichaControlNinoSano12Meses',
    title: 'CONTROL DE SALUD INFANTIL – 12 MESES (1 AÑO)',
    storageKey: 'local_fichaControlNinoSano12Meses',
    initialFormData: {
      edad: '12 meses (1 año)',
      acompanante: '',
      parentesco: '',
      profesional: 'Enfermero/a – Médico/a',
      enfermedadesUltimoControl: 'Niega.',
      urgenciasHospitalizaciones: 'Niega.',
      medicamentos: 'Niega.',
      alergias: 'Niega.',
      vacunas: 'Al día (corresponden vacunas de los 12 meses: Tres Vírica, Meningocócica, Neumocócica).',
      tipoAlimentacion: 'Alimentación familiar + Lactancia / Leche Purita Fortificada / Fórmula',
      incorporacionMesaFamiliar: 'Sí, 3-4 comidas diarias',
      consumoAguaYBebidas: 'Agua pura. Niega bebidas azucaradas',
      diuresis: 'Conservada.',
      deposiciones: 'Conservadas.',
      suenoHoras: '12-14 horas/día',
      bipedestacionYMarcha: 'Bipedestación con apoyo / Pasos independientes',
      pinzaFina: 'Sí (pinza fina lograda)',
      primerasPalabrasConSignificado: 'Sí (2 a 3 palabras con significado además de mamá/papá)',
      comprendeOrdenesSimples: 'Sí (ej. "dame", "mira")',
      juegoInteractivo: 'Imita gestos (chao, aplaude)',
      peso: '',
      talla: '',
      perimetroCefalico: '',
      peZ: '',
      teZ: '',
      ptZ: '',
      diagnosticoNutricional: 'Eutrófico/a',
      diagnosticoTalla: 'Talla normal',
      pa: '',
      fc: '',
      fr: '',
      efGeneral: 'Buen estado general, activo, colaborador.',
      efPiel: 'Normal, sin lesiones.',
      efDenticion: 'Incisivos superiores e inferiores presentes (4 a 8 dientes).',
      efCardiopulmonar: 'RR2T sin soplos, MP (+) simétrico.',
      efAbdomen: 'Blando, depresible, indoloro.',
      efGenitales: 'Normoconfigurados.',
      efMarchaBipedestacion: 'Bipedestación estable, marcha inicial.',
      evaluacionEDP: 'EDP 12 meses aplicado - Normal',
      evaluacionEEDP: 'Pauta EEDP aplicada al año de vida',
      diagnosticos: `1. Lactante mayor de 12 meses en control de salud infantil.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Desarrollo psicomotor (EEDP): Normal.
5. Salud bucal: En desarrollo, cepillado al día.`,
      indicaciones: `- Integrar progresivamente a la dieta familiar saludable (sin sal ni azúcar añadidos).
- Transición a taza o vaso de aprendizaje; desestimular el uso de mamadera.
- Mantener lactancia materna si la díada lo desea o leche Purita Fortificada 26% / leche entera según pauta.
- Suspender suplementación de vitaminas ACD al cumplir 12 meses si la dieta es variada y hay exposición solar segura.
- Administrar vacunas del 1° año.
- Cepillado dental obligatorio noche y mañana con pasta fluorada (1000 ppm, tamaño granito de arroz).
- Fomentar la lectura de cuentos, nombrar objetos y estimular el lenguaje.
- Próximo control: 18 meses con enfermera.`,
      proximoControl: '18° mes con enfermera'
    }
  },
  {
    fileName: 'fichaControlNinoSano18Meses.tsx',
    componentName: 'fichaControlNinoSano18Meses',
    title: 'CONTROL DE SALUD INFANTIL – 18 MESES (1 AÑO 6 MESES)',
    storageKey: 'local_fichaControlNinoSano18Meses',
    initialFormData: {
      edad: '18 meses',
      acompanante: '',
      parentesco: '',
      profesional: 'Enfermero/a',
      enfermedadesUltimoControl: 'Niega.',
      urgenciasHospitalizaciones: 'Niega.',
      medicamentos: 'Niega.',
      alergias: 'Niega.',
      vacunas: 'Al día (vacunas 18 meses: Hexavalente, Hepatitis A, Fiebre Amarilla si corresponde).',
      tipoAlimentacion: 'Alimentación familiar (4 comidas/día + fruta)',
      usoMamaderaChupete: 'No usa / En proceso de retiro',
      diuresis: 'Conservada.',
      deposiciones: 'Conservadas.',
      suenoHoras: '12-13 horas/día',
      marchaIndependiente: 'Sí, marcha estable y carrera inicial',
      vocabularioPalabras: '10 a 20 palabras con significado',
      identificaPartesCuerpo: 'Sí (señala al menos 2-3 partes del cuerpo)',
      torreDeCubos: 'Construye torre de 3-4 cubos',
      usaCuchara: 'Intenta comer solo/a con cuchara',
      juegoSimbolico: 'Incipiente (hace como que habla por teléfono, alimenta a muñeco)',
      peso: '',
      talla: '',
      perimetroCefalico: '',
      peZ: '',
      teZ: '',
      ptZ: '',
      diagnosticoNutricional: 'Eutrófico/a',
      diagnosticoTalla: 'Talla normal',
      pa: '',
      fc: '',
      fr: '',
      efGeneral: 'Activo/a, explorer/a, reactivo/a.',
      efDenticion: 'Primeros molares e caninos en erupción.',
      efCardiopulmonar: 'RR2T sin soplos, MP (+).',
      efAbdomen: 'Blando, depresible, indoloro.',
      efGenitales: 'Normoconfigurados.',
      efMarchaPostura: 'Marcha independiente, sin claudicación.',
      evaluacionMCHAT: 'M-CHAT-R aplicado (Tamizaje espectro autista): Bajo riesgo',
      evaluacionEEDP: 'EEDP 18 meses: Normal',
      diagnosticos: `1. Lactante mayor de 18 meses en control de salud infantil.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Desarrollo psicomotor (EEDP): Normal.
5. Tamizaje M-CHAT-R: Bajo riesgo.`,
      indicaciones: `- Alimentación saludable compartida en familia. Evitar golosinas, jugos procesados y comida rápida.
- Retiro definitivo de mamadera y chupete por riesgo de maloclusión dentaria y problemas de lenguaje.
- Administrar vacunas de los 18 meses.
- Cepillado dental 2 veces/día con pasta fluorada (1000 ppm).
- Estimular el lenguaje respondiendo a sus peticiones con frases completas, cantando y leyendo cuentos.
- Limitar estrictamente el uso de pantallas (TV, celulares, tablets).
- Establecer límites respetuosos y rutinas claras.
- Próximo control: 2 años con enfermera/médico.`,
      proximoControl: '2 años (24 meses) con enfermera'
    }
  },
  {
    fileName: 'fichaControlNinoSano2Anos.tsx',
    componentName: 'fichaControlNinoSano2Anos',
    title: 'CONTROL DE SALUD INFANTIL – 2 AÑOS (24 MESES)',
    storageKey: 'local_fichaControlNinoSano2Anos',
    initialFormData: {
      edad: '2 años',
      acompanante: '',
      parentesco: '',
      profesional: 'Enfermero/a – Médico/a',
      enfermedadesUltimoControl: 'Niega.',
      urgenciasHospitalizaciones: 'Niega.',
      medicamentos: 'Niega.',
      alergias: 'Niega.',
      vacunas: 'Al día.',
      tipoAlimentacion: 'Dieta familiar completa (4 comidas al día)',
      consumoLacteos: '2-3 porciones de lácteos al día',
      habitoMiccionalControlEsfinteer: 'Inicio de interés / Sin control aún',
      habitoDeposicional: 'Normal.',
      suenoHoras: '11-12 horas/día (sueño nocturno + 1 siesta)',
      combinaDosPalabras: 'Sí (frases de 2 palabras ej. "más leche", "vamos afuera")',
      correYPateaPelota: 'Sí',
      subeEscalerasConApoyo: 'Sí',
      copiaLineaVertical: 'Sí / Garabatea espontáneamente',
      autonomiaAlimentacion: 'Come solo/a con cuchara',
      pantallasHorasDia: '< 1 hora / Niega',
      peso: '',
      talla: '',
      imc: '',
      imcz: '',
      tez: '',
      diagnosticoNutricional: 'Eutrófico/a',
      diagnosticoTalla: 'Talla normal',
      pa: '',
      fc: '',
      fr: '',
      efGeneral: 'Buen estado general, activo/a, lenguaje comprensible.',
      efDenticion: 'Dentición temporal completa o en fase final de molares (20 piezas).',
      efCardiopulmonar: 'RR2T sin soplos, MP (+) bilateral.',
      efAbdomen: 'Blando, depresible, indoloro.',
      efGenitales: 'Normoconfigurados.',
      efColumnaPies: 'Pie plano fisiológico del lactante/preescolar.',
      efMarcha: 'Marcha y carrera armónica.',
      evaluacionTEPSI: 'Evaluación de desarrollo a los 2 años normal',
      diagnosticos: `1. Preescolar de 2 años en control de salud infantil.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Desarrollo lenguaje y motor adecuado.
5. Salud oral: Dentición temporal en buenas condiciones.`,
      indicaciones: `- Mantener alimentación saludable en familia. Evitar azúcares añadidos y ultraprocesados.
- Fomentar la autonomía en el comer, vestirse y lavarse las manos.
- Cepillado dental supervisado por un adulto 2 veces al día con pasta de 1000 a 1450 ppm de flúor (cantidad tamaño arveja).
- Control odontológico infantil de rutina.
- Fomentar el juego al aire libre y actividad física diaria.
- Limitar pantallas a máximo 1 hora al día de contenido de calidad y acompañado.
- Iniciar educación sobre control de esfínteres sin presiones cuando el niño/a muestre señales de madurez.
- Próximo control: 3 años con médico/a.`,
      proximoControl: '3 años con médico/a'
    }
  },
  {
    fileName: 'fichaControlNinoSano3Anos.tsx',
    componentName: 'fichaControlNinoSano3Anos',
    title: 'CONTROL DE SALUD INFANTIL – 3 AÑOS (36 MESES)',
    storageKey: 'local_fichaControlNinoSano3Anos',
    initialFormData: {
      edad: '3 años',
      acompanante: '',
      parentesco: '',
      profesional: 'Enfermero/a – Médico/a',
      enfermedadesUltimoControl: 'Niega.',
      urgenciasHospitalizaciones: 'Niega.',
      medicamentos: 'Niega.',
      alergias: 'Niega.',
      vacunas: 'Al día.',
      asisteJardinJardin: 'Sí / No',
      tipoAlimentacion: 'Alimentación familiar (4 comidas diarias)',
      colacionesSaludables: 'Frutas, lácteos, frutos secos molidos',
      controlEsfinteerDiurno: 'Logrado',
      controlEsfinteerNocturno: 'En proceso / Logrado',
      suenoHoras: '10-12 horas/día',
      frasesCompletasLenguaje: 'Sí, construye frases de 3-4 palabras, inteligible por terceros',
      hacePreguntas: 'Sí ("¿por qué?", "¿qué es?")',
      saltaEnDosPies: 'Sí',
      copiaCirculo: 'Sí',
      seVisteConAyuda: 'Sí',
      juegoConPares: 'Juego asociativo / interactivo',
      pantallasHorasDia: '< 1 hora/día',
      peso: '',
      talla: '',
      imc: '',
      imcz: '',
      tez: '',
      diagnosticoNutricional: 'Eutrófico/a',
      diagnosticoTalla: 'Talla normal',
      pa: '',
      fc: '',
      fr: '',
      efGeneral: 'Buen estado general, comunicativo/a.',
      efDenticion: 'Dentición temporal completa (20 dientes), sin caries visibles.',
      efCardiopulmonar: 'RR2T sin soplos, MP (+).',
      efAbdomen: 'Blando, depresible, indoloro.',
      efGenitales: 'Normoconfigurados.',
      efColumnaPostura: 'Normolineo, alineación de extremidades fisiológica.',
      evaluacionTEPSI: 'TEPSI 3 años aplicado: Normal en Lenguaje, Coordinación y Motricidad',
      diagnosticos: `1. Preescolar de 3 años en control de salud infantil.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Desarrollo psicomotor (TEPSI): Normal.
5. Control de esfínteres diurno logrado.`,
      indicaciones: `- Promover hábitos alimentarios saludables, variados y en familia.
- Fomentar la asistencia a jardín infantil o sala cuna para socialización y desarrollo de habilidades.
- Cepillado dental supervisado noche y mañana con pasta fluorada (1000-1450 ppm).
- Evaluación odontológica preventiva al día.
- Fomentar lectura diaria de cuentos y conversación sobre emociones.
- Promover juego activo libre mínimo 60 minutos al día.
- Mantener límites claros, constantes y basados en la crianza respetuosa.
- Próximo control: 3 años 6 meses (Consulta Nutricional) / 4 años con enfermera.`,
      proximoControl: '3 años 6 meses (Consulta Nutricional) / 4 años'
    }
  },
  {
    fileName: 'consultaNutricional3Anos6Meses.tsx',
    componentName: 'consultaNutricional3Anos6Meses',
    title: 'CONSULTA NUTRICIONAL – 3 AÑOS 6 MESES',
    storageKey: 'local_consultaNutricional3Anos6Meses',
    initialFormData: {
      edad: '3 años 6 meses',
      acompanante: '',
      parentesco: '',
      profesional: 'Nutricionista',
      motivoConsulta: 'Control nutricional preventivo y evaluación de hábitos alimentarios en preescolar',
      antecedentesSalud: 'Sin eventos mórbidos recientes.',
      anamnesisAlimentaria: '4 comidas principales (desayuno, almuerzo, cesantía/once, cena) + 1 colación',
      consumoFrutasVerduras: '2 porciones de fruta y 2 de verdura al día',
      consumoLacteos: '2-3 porciones diarias',
      consumoAgua: 'Agua pura como bebida principal',
      consumoUltraprocesados: 'Ocasional / Niega',
      actividadFisicaJuego: 'Juego activo diario > 60 min',
      pantallasHorasDia: '< 1 hora/día',
      peso: '',
      talla: '',
      imc: '',
      imcz: '',
      tez: '',
      diagnosticoNutricional: 'Eutrófico/a',
      diagnosticoTalla: 'Talla normal',
      velocidadCrecimiento: 'Normocrecimiento',
      efGeneral: 'Buen estado general, activo/a.',
      efPielMucosas: 'Normales.',
      efCavidadOral: 'Mucosas sanas, dentición temporal.',
      efAbdomen: 'Blando, depresible, indoloro.',
      diagnosticos: `1. Preescolar de 3 años 6 meses en consulta nutricional.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Hábitos alimentarios y estilo de vida adecuados.`,
      indicaciones: `- Reforzar la estructura de 4 comidas al día en horarios regulares.
- Incentivar el consumo de agua pura frente a jugos o bebidas.
- Fomentar el consumo diario de frutas y verduras variadas.
- Limitar el acceso a alimentos con sellos "Alto en" y golosinas.
- Fomentar la actividad física familiar y el juego al aire libre.
- Cepillado dental guiado por adultos 2 veces al día.
- Próximo control: Control de Salud Infantil de los 4 años.`,
      proximoControl: '4 años con enfermera/médico'
    }
  },
  {
    fileName: 'fichaControlNinoSano4Anos.tsx',
    componentName: 'fichaControlNinoSano4Meses',
    title: 'CONTROL DE SALUD INFANTIL – 4 AÑOS (48 MESES)',
    storageKey: 'local_fichaControlNinoSano4Anos',
    initialFormData: {
      edad: '4 años',
      acompanante: '',
      parentesco: '',
      profesional: 'Enfermero/a – Médico/a',
      enfermedadesUltimoControl: 'Niega.',
      urgenciasHospitalizaciones: 'Niega.',
      medicamentos: 'Niega.',
      alergias: 'Niega.',
      vacunas: 'Al día.',
      escolaridadNivel: 'Prekínder / Jardín Infantil',
      rendimientoAdaptacionEscolar: 'Buena adaptación y socialización',
      tipoAlimentacion: 'Alimentación familiar equilibrada',
      controlEsfinteresCompleto: 'Sí (diurno y nocturno)',
      suenoHoras: '10-11 horas/día',
      lenguajeClaroFluido: 'Sí, lenguaje estructurado y fluido',
      saltaEnUnPie: 'Sí',
      copiaCruzYCuadrado: 'Sí (copia cruz)',
      dibujaMonigote: 'Sí (dibujo de persona con 3-4 partes)',
      seVisteSolo: 'Sí con poca ayuda',
      juegoReglado: 'Juego compartido y cooperativo',
      pantallasHorasDia: '< 1 hora/día',
      peso: '',
      talla: '',
      imc: '',
      imcz: '',
      tez: '',
      diagnosticoNutricional: 'Eutrófico/a',
      diagnosticoTalla: 'Talla normal',
      pa: '',
      percentilPa: 'P50',
      fc: '',
      fr: '',
      efGeneral: 'Buen estado general, colaborador/a.',
      efAgudezaVisual: 'Evaluación visual con tabla E: 20/20 bilateral',
      efAudicion: 'Normal.',
      efDenticion: 'Dentición temporal completa, sin caries.',
      efCardiopulmonar: 'RR2T sin soplos, MP (+).',
      efAbdomen: 'Blando, depresible, indoloro.',
      efGenitales: 'Normoconfigurados.',
      efColumnaPies: 'Alineación articular normal.',
      evaluacionTEPSI: 'TEPSI 4 años aplicado: Normal',
      diagnosticos: `1. Preescolar de 4 años en control de salud infantil.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Presión arterial: Normal.
5. Desarrollo psicomotor (TEPSI): Normal.
6. Salud visual y auditiva normal.`,
      indicaciones: `- Mantener alimentación saludable en familia y colaciones escolares nutritivas.
- Promover actividad física diaria (mínimo 60 minutos de juego activo).
- Limitar tiempo de pantalla a máximo 1 hora al día.
- Cepillado dental supervisado noche y mañana con pasta de 1000-1450 ppm de flúor.
- Fomentar la lectura, expresión verbal y gestión de emociones.
- Reforzar educación vial y uso de cinturón/silla de auto correspondiente.
- Próximo control: 5 años con enfermera/médico.`,
      proximoControl: '5 años con enfermera/médico'
    }
  },
  {
    fileName: 'fichaControlNinoSano5Anos.tsx',
    componentName: 'fichaControlNinoSano5Anos',
    title: 'CONTROL DE SALUD INFANTIL – 5 AÑOS (60 MESES)',
    storageKey: 'local_fichaControlNinoSano5Anos',
    initialFormData: {
      edad: '5 años',
      acompanante: '',
      parentesco: '',
      profesional: 'Enfermero/a – Médico/a',
      enfermedadesUltimoControl: 'Niega.',
      urgenciasHospitalizaciones: 'Niega.',
      medicamentos: 'Niega.',
      alergias: 'Niega.',
      vacunas: 'Al día (corresponden vacunas de Escolar 1° Básico / 5 años).',
      escolaridadNivel: 'Kínder',
      rendimientoAdaptacionEscolar: 'Adecuada adaptación e interacción con pares',
      tipoAlimentacion: 'Alimentación familiar balanceada',
      controlEsfinteresCompleto: 'Sí',
      suenoHoras: '10 horas/día',
      articulaTodosLosFonemas: 'Sí (buena pronunciación)',
      atrapaPelota: 'Sí',
      copiaTrianguloCuadrado: 'Sí',
      dibujaFiguraHumanaCompleta: 'Sí (cabeza, tronco, extremidades, detalles)',
      seVisteYDesvisteSolo: 'Sí',
      juegoConReglas: 'Comprende y respeta reglas simples de juego',
      pantallasHorasDia: '< 1 hora/día',
      peso: '',
      talla: '',
      imc: '',
      imcz: '',
      tez: '',
      diagnosticoNutricional: 'Eutrófico/a',
      diagnosticoTalla: 'Talla normal',
      pa: '',
      percentilPa: 'P50',
      fc: '',
      fr: '',
      efGeneral: 'Buen estado general, activo/a, colaborador/a.',
      efAgudezaVisual: 'Agudeza visual 20/20 bilateral',
      efAudicion: 'Audición normal',
      efDenticion: 'Dentición temporal completa / inicio erupción 1° molar definitivo.',
      efCardiopulmonar: 'RR2T sin soplos, MP (+).',
      efAbdomen: 'Blando, depresible, indoloro.',
      efGenitales: 'Tanner 1 (Prepúber).',
      efColumnaTestAdams: 'Test de Adams negativo, simetría postural.',
      diagnosticos: `1. Escolar inicial de 5 años en control de salud infantil.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Presión arterial: Normal.
5. Desarrollo integral adecuado para la edad.
6. Salud visual, auditiva y oral normales.`,
      indicaciones: `- Mantener alimentación familiar balanceada y colaciones escolares saludables.
- Promover 60 minutos diarios de actividad física activa y deportes.
- Cepillado dental con pasta de 1450 ppm de flúor supervisado por un adulto.
- Fomentar la lectura, expresión verbal y habilidades sociales preescolares.
- Reforzar hábitos de sueño regular (10 horas nocturnas).
- Garantizar vacunación de 1° Básico cuando corresponda.
- Próximo control: 6 años (Control con Médico/a).`,
      proximoControl: '6 años con médico/a'
    }
  },
  {
    fileName: 'fichaControlNinoSano7Anos.tsx',
    componentName: 'fichaControlNinoSano7Anos',
    title: 'CONTROL DE SALUD INFANTIL – 7 AÑOS',
    storageKey: 'local_fichaControlNinoSano7Anos',
    initialFormData: {
      edad: '7 años',
      acompanante: '',
      parentesco: '',
      profesional: 'Enfermero/a – Médico/a',
      establecimientoCurso: '2° Básico',
      enfermedadesUltimoControl: 'Niega.',
      urgenciasHospitalizaciones: 'Niega.',
      medicamentos: 'Niega.',
      alergias: 'Niega.',
      vacunas: 'Al día.',
      rendimientoEscolar: 'Adecuado',
      relacionCompanerosProfesores: 'Buena',
      conductaEscolar: 'Adecuada',
      bullyingAcoso: 'Niega.',
      animoSocioemocional: 'Eutímico, alegre',
      alimentacionComidasDiarias: '4 comidas al día',
      actividadFisicaDeporte: '60 min/día de juego activo / deporte',
      pantallasHorasDia: '< 1-2 horas/día',
      suenoHoras: '9-10 horas/noche',
      saludBucalCepillado: '2-3 veces/día con pasta fluorada',
      peso: '',
      talla: '',
      imc: '',
      imcz: '',
      tez: '',
      diagnosticoNutricional: 'Eutrófico/a',
      diagnosticoTalla: 'Talla normal',
      pa: '',
      percentilPa: 'P50',
      fc: '',
      fr: '',
      efGeneral: 'Buen estado general, comunicativo/a.',
      efAgudezaVisual: '20/20 bilateral',
      efAudicion: 'Normal',
      efDenticion: 'Dentición mixta, erupción de incisivos y 1° molares permanentes.',
      efCardiopulmonar: 'RR2T sin soplos, MP (+).',
      efAbdomen: 'Blando, depresible, indoloro.',
      efGenitalesTanner: 'Tanner 1 (Prepúber).',
      efColumnaTestAdams: 'Test de Adams negativo.',
      diagnosticos: `1. Escolar de 7 años en control de salud infantil.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Presión arterial: Normal.
5. Desarrollo escolar y socioemocional adecuado.`,
      indicaciones: `- Mantener alimentación saludable y variada.
- Promover actividad física diaria y participación en deportes.
- Fomentar la lectura y el estudio en ambientes tranquilos.
- Cepillado dental minucioso supervisado por adultos.
- Mantener controles odontológicos al día.
- Limitar el tiempo de pantallas y supervisar contenidos.
- Próximo control: 8 años con enfermera/médico.`,
      proximoControl: '8 años con enfermera/médico'
    }
  },
  {
    fileName: 'fichaControlNinoSano8Anos.tsx',
    componentName: 'fichaControlNinoSano8Anos',
    title: 'CONTROL DE SALUD INFANTIL – 8 AÑOS',
    storageKey: 'local_fichaControlNinoSano8Anos',
    initialFormData: {
      edad: '8 años',
      acompanante: '',
      parentesco: '',
      profesional: 'Enfermero/a – Médico/a',
      establecimientoCurso: '3° Básico',
      enfermedadesUltimoControl: 'Niega.',
      urgenciasHospitalizaciones: 'Niega.',
      medicamentos: 'Niega.',
      alergias: 'Niega.',
      vacunas: 'Al día.',
      rendimientoEscolar: 'Adecuado',
      relacionCompanerosProfesores: 'Buena',
      conductaEscolar: 'Adecuada',
      bullyingAcoso: 'Niega.',
      animoSocioemocional: 'Estable',
      alimentacionComidasDiarias: '4 comidas al día',
      actividadFisicaDeporte: '60 min/día de ejercicio / deporte',
      pantallasHorasDia: '< 1-2 horas/día',
      suenoHoras: '9-10 horas/noche',
      saludBucalCepillado: '2-3 veces/día con pasta fluorada',
      peso: '',
      talla: '',
      imc: '',
      imcz: '',
      tez: '',
      diagnosticoNutricional: 'Eutrófico/a',
      diagnosticoTalla: 'Talla normal',
      pa: '',
      percentilPa: 'P50',
      fc: '',
      fr: '',
      efGeneral: 'Buen estado general, activo/a.',
      efAgudezaVisual: '20/20 bilateral',
      efAudicion: 'Normal',
      efDenticion: 'Dentición mixta en avance.',
      efCardiopulmonar: 'RR2T sin soplos, MP (+).',
      efAbdomen: 'Blando, depresible, indoloro.',
      efGenitalesTanner: 'Tanner 1 (Prepúber).',
      efColumnaTestAdams: 'Test de Adams negativo.',
      diagnosticos: `1. Escolar de 8 años en control de salud infantil.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Presión arterial: Normal.
5. Desarrollo escolar adecuado.`,
      indicaciones: `- Continuar con hábitos de estilo de vida saludable.
- Fomentar la responsabilidad escolar y el aprendizaje autónomo.
- Estimular el deporte en equipo y actividades al aire libre.
- Cepillado dental con pasta de 1450 ppm de flúor.
- Supervisar el uso de internet y redes sociales si corresponde.
- Próximo control: 9 años con enfermera/médico.`,
      proximoControl: '9 años con enfermera/médico'
    }
  },
  {
    fileName: 'fichaControlNinoSano9Anos.tsx',
    componentName: 'fichaControlNinoSano9Anos',
    title: 'CONTROL DE SALUD INFANTIL – 9 AÑOS',
    storageKey: 'local_fichaControlNinoSano9Anos',
    initialFormData: {
      edad: '9 años',
      acompanante: '',
      parentesco: '',
      profesional: 'Enfermero/a – Médico/a',
      establecimientoCurso: '4° Básico',
      enfermedadesUltimoControl: 'Niega.',
      urgenciasHospitalizaciones: 'Niega.',
      medicamentos: 'Niega.',
      alergias: 'Niega.',
      vacunas: 'Al día (preparación vacunas 4° básico VPH / dTPa).',
      rendimientoEscolar: 'Adecuado',
      relacionCompanerosProfesores: 'Buena',
      bullyingAcoso: 'Niega.',
      animoSocioemocional: 'Estable',
      alimentacionComidasDiarias: '4 comidas al día',
      actividadFisicaDeporte: '60 min/día de ejercicio',
      pantallasHorasDia: '< 2 horas/día',
      suenoHoras: '9-10 horas/noche',
      saludBucalCepillado: '2-3 veces/día',
      peso: '',
      talla: '',
      imc: '',
      imcz: '',
      tez: '',
      diagnosticoNutricional: 'Eutrófico/a',
      diagnosticoTalla: 'Talla normal',
      pa: '',
      percentilPa: 'P50',
      fc: '',
      fr: '',
      efGeneral: 'Buen estado general.',
      efAgudezaVisual: '20/20 bilateral',
      efAudicion: 'Normal',
      efDenticion: 'Dentición mixta avanzada.',
      efCardiopulmonar: 'RR2T sin soplos, MP (+).',
      efAbdomen: 'Blando, depresible, indoloro.',
      efGenitalesTanner: 'Tanner 1 / Inicio Tanner 2 (evaluación de adrenarquia/telarquia inicial).',
      efColumnaTestAdams: 'Test de Adams negativo (tamizaje escoliosis).',
      diagnosticos: `1. Escolar de 9 años en control de salud infantil final.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Presión arterial: Normal.
5. Desarrollo puberal (Tanner): Evaluar desarrollo incipiente.
6. Preparado/a para transición a control de salud adolescente.`,
      indicaciones: `- Mantener alimentación equilibrada y variada.
- Reforzar actividad física y hábitos de vida saludables.
- Educar sobre cambios corporales propios del inicio de la pubertad.
- Cepillado dental con pasta de 1450 ppm de flúor e hilo dental.
- Asegurar administración de vacunas de 4° Básico (VPH y dTPa).
- Próximo control: Control de salud del adolescente (10 a 14 años).`,
      proximoControl: 'Control de Salud del Adolescente (10-14 años)'
    }
  }
];

function generateCode(template) {
  const keys = Object.keys(template.initialFormData);
  
  // Create form fields render code dynamically
  let fieldsJsx = '';
  keys.forEach(key => {
    if (['diagnosticos', 'indicaciones', 'anamnesisDetalle', 'exploracionDetalle', 'actuacionDetalle'].includes(key)) {
      fieldsJsx += `
                <div className="sm:col-span-2">
                  <FormField label="${key.toUpperCase()}" id="${key}" name="${key}" value={formData.${key} || ''} onChange={handleChange} isTextArea rows={4} inputClassName="text-black" />
                </div>`;
    } else {
      fieldsJsx += `
                <FormField label="${key}" id="${key}" name="${key}" value={formData.${key} || ''} onChange={handleChange} inputClassName="text-black" />`;
    }
  });

  return `import React, { useState, useCallback, useEffect } from 'react';
import { User } from '../types';
import FormField from './FormField';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData = ${JSON.stringify(template.initialFormData, null, 2)};

interface Props {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const ${template.componentName}: React.FC<Props> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage('${template.storageKey}', initialFormData);
  const [isUppercase, setIsUppercase] = useState<boolean>(false);
  const [anamnesisText, setAnamnesisText] = useState('');
  const [exploracionText, setExploracionText] = useState('');
  const [actuacionText, setActuacionText] = useState('');

  const generateSummaryParts = useCallback(() => {
    const todayStr = new Date().toLocaleDateString('es-ES');
    let anamnesis = \`${template.title}\\n---------------------------------------\\nFECHA CONTROL: \${todayStr}\\nPROFESIONAL: \${loggedInUser?.fullName || formData.profesional || 'Profesional de Salud'}\\n---------------------------------------\\n\\nANAMNESIS:\\n\`;
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
          <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4">
            
            <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2">${template.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${fieldsJsx}
              </div>
            </section>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border border-slate-200 bg-white rounded-xl shadow-sm mb-6">
              <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs uppercase tracking-widest cursor-pointer">
                Volver al Menú
              </button>
              <button type="button" onClick={handleNewDocument} className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg transition-all uppercase text-xs tracking-widest cursor-pointer">
                BORRAR TODO
              </button>
            </div>
          </form>
        </div>

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

export default ${template.componentName};
`;
}

templates.forEach(template => {
  const code = generateCode(template);
  fs.writeFileSync(path.join('components', template.fileName), code, 'utf8');
  console.log('Successfully structured component:', template.fileName);
});
