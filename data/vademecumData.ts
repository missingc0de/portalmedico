export interface VademecumInfo {
  mecanismoAccion: string;
  indicaciones: string;
  posologia: string;
  modoAdministracion: string;
  contraindicaciones: string;
  advertencias: string;
  insuficienciaHepatica?: string;
  insuficienciaRenal?: string;
  interacciones: string;
  embarazo: string;
  lactancia: string;
  efectosConduccion?: string;
  reaccionesAdversas: string;
}

export const vademecumData: Record<string, VademecumInfo> = {
  'paracetamol': {
    mecanismoAccion: "Analgésico y antipirético. Inhibe la síntesis de prostaglandinas en el SNC y bloquea la generación del impulso doloroso a nivel periférico. Actúa sobre el centro hipotalámico regulador de la temperatura.",
    indicaciones: "Tratamiento sintomático del dolor de intensidad leve a moderada, como dolor de cabeza, dental, muscular (contracturas) o de espalda (lumbalgia). Estados febriles.",
    posologia: "Adultos y adolescentes > 15 años: 500 mg-1 g/4-6 h. Dosis máx: 4 g/día. Niños: 15 mg/kg/6 h o 10 mg/kg/4 h.",
    modoAdministracion: "Vía oral. Administrar con o sin alimentos.",
    contraindicaciones: "Hipersensibilidad al paracetamol, insuficiencia hepatocelular grave.",
    advertencias: "Riesgo de daño hepático grave a dosis superiores a las recomendadas. Se recomienda precaución en pacientes con alcoholismo crónico, insuficiencia renal, insuficiencia cardiaca grave y afecciones pulmonares.",
    insuficienciaHepatica: "Contraindicado en insuficiencia hepatocelular grave. En I.H. no grave, la dosis no debe exceder 2 g/24 h y el intervalo mínimo entre dosis será de 8 h.",
    insuficienciaRenal: "En I.R. grave (Clcr < 10 ml/min), el intervalo entre tomas será como mínimo de 8 h.",
    interacciones: "Aumenta efecto de anticoagulantes orales. Hepatotoxicidad potenciada por alcohol y fármacos inductores enzimáticos (barbitúricos, isoniazida, rifampicina).",
    embarazo: "No se han descrito problemas en humanos. Aunque no se han realizado estudios controlados, el paracetamol atraviesa la placenta. Usar solo si es estrictamente necesario.",
    lactancia: "Compatible. Se excreta en leche materna en concentraciones no significativas.",
    reaccionesAdversas: "Raras: malestar, hipotensión, aumento de transaminasas. Muy raras: reacciones de hipersensibilidad, trombocitopenia, agranulocitosis, erupciones cutáneas."
  },
  'amoxicilina': {
    mecanismoAccion: "Bactericida. Inhibe la acción de las peptidasas y carboxipeptidasas impidiendo la síntesis de la pared celular bacteriana.",
    indicaciones: "Infecciones de tracto respiratorio superior e inferior, sinusitis, otitis media, infecciones de tracto urinario no complicadas, infecciones de piel y tejidos blandos, producidas por microorganismos sensibles.",
    posologia: "Adultos: 500 mg/8 h. En infecciones más graves, 875 mg/12 h. Niños: 25-50 mg/kg/día en dosis divididas cada 8 h.",
    modoAdministracion: "Vía oral. Puede tomarse con o sin alimentos.",
    contraindicaciones: "Hipersensibilidad a penicilinas. Historial de reacción de hipersensibilidad inmediata y grave (anafilaxia) a otro agente beta-lactámico (p. ej. cefalosporina, carbapenem o monobactam).",
    advertencias: "Riesgo de reacciones de hipersensibilidad. En I.R. ajustar dosis. Posibilidad de sobreinfección por microorganismos no sensibles en tto. prolongado. Puede producir colitis pseudomembranosa. Riesgo de rash eritematoso en pacientes con mononucleosis infecciosa.",
    insuficienciaRenal: "Ajustar dosis según Clcr. Clcr 10-30 ml/min: máx. 500 mg/12 h. Clcr < 10 ml/min: máx. 500 mg/24 h.",
    interacciones: "Probenecid disminuye la secreción tubular renal de amoxicilina. Anticoagulantes orales: puede prolongar el tiempo de protrombina. Metotrexato: aumenta la toxicidad. Alopurinol: aumenta el riesgo de reacciones cutáneas.",
    embarazo: "Estudios en animales no han demostrado efectos teratogénicos. Usar con precaución y solo si el beneficio supera el riesgo.",
    lactancia: "Se excreta en leche materna en pequeñas cantidades. Riesgo de sensibilización, diarrea y candidiasis en mucosas en el lactante.",
    reaccionesAdversas: "Frecuentes: diarrea, náuseas, erupción cutánea. Poco frecuentes: vómitos, urticaria, prurito. Muy raras: colitis pseudomembranosa, hepatitis, ictericia colestásica, nefritis intersticial aguda, cristaluria."
  },
  'captopril': {
    mecanismoAccion: "Inhibidor del enzima convertidor de angiotensina (IECA). Da lugar a concentraciones reducidas de angiotensina II, que conduce a una disminución de la actividad vasopresora y a una secreción reducida de aldosterona.",
    indicaciones: "Hipertensión arterial. Insuficiencia cardíaca crónica con reducción de la función ventricular sistólica. Infarto de miocardio (en las primeras 24 h en pacientes hemodinámicamente estables). Nefropatía diabética tipo I.",
    posologia: "HTA: inicial 25-50 mg/día en 2 dosis. Mantenimiento: 50-100 mg/día en 2 dosis. Dosis máx: 150 mg/día. Insuficiencia cardíaca: inicial 6,25-12,5 mg/2-3 veces día. Mantenimiento: 75-150 mg/día.",
    modoAdministracion: "Vía oral. Administrar 1 hora antes de las comidas.",
    contraindicaciones: "Hipersensibilidad a captopril o a otro IECA. Antecedentes de angioedema. 2º y 3 er trimestre del embarazo.",
    advertencias: "Riesgo de hipotensión sintomática en pacientes con depleción de volumen/sodio. Riesgo de angioedema. Monitorizar función renal y niveles de potasio sérico. Riesgo de tos seca no productiva. Precaución en estenosis aórtica o mitral.",
    insuficienciaRenal: "Ajustar dosis. Clcr 20-59 ml/min: 25-100 mg/día. Clcr < 20 ml/min: 6,25-37,5 mg/día.",
    interacciones: "Riesgo de hiperpotasemia con diuréticos ahorradores de potasio, suplementos de K. Aumenta toxicidad de litio. AINEs pueden reducir el efecto antihipertensivo. Diuréticos pueden potenciar el efecto hipotensor.",
    embarazo: "Contraindicado en 2º y 3 er trimestre (toxicidad fetal). No se recomienda en 1 er trimestre. Si se detecta embarazo, suspender tratamiento.",
    lactancia: "No recomendado, especialmente en recién nacidos prematuros y durante las primeras semanas después del parto.",
    efectosConduccion: "Puede producir mareos o fatiga, especialmente al inicio del tratamiento, afectando la capacidad para conducir.",
    reaccionesAdversas: "Frecuentes: tos seca, trastornos del sueño, mareo, disgeusia, hipotensión, disnea, náuseas, vómitos, diarrea, dolor abdominal, prurito, erupción cutánea, alopecia."
  },
  'salbutamol sulfato': {
    mecanismoAccion: "Agonista selectivo ß2 -adrenérgico del músculo liso bronquial, proporciona broncodilatación de corta duración (4-6 h) con un rápido comienzo de acción (en 5 min) en la obstrucción reversible de las vías respiratorias.",
    indicaciones: "Tratamiento y prevención del broncoespasmo en pacientes con obstrucción reversible de la vía aérea (asma, bronquitis crónica, enfisema).",
    posologia: "Inhalación. Adultos: 100-200 mcg (1-2 inhalaciones) para alivio de broncoespasmo agudo. Profilaxis: 200 mcg 10-15 min antes del ejercicio. Dosis máx: 800 mcg/24 h. Niños: 100 mcg (1 inhalación), puede aumentarse a 200 mcg si es necesario.",
    modoAdministracion: "Vía inhalatoria. Es importante asegurar la correcta técnica de inhalación.",
    contraindicaciones: "Hipersensibilidad a salbutamol.",
    advertencias: "Riesgo de hipopotasemia grave. Usar con precaución en pacientes con tirotoxicosis, insuficiencia cardiaca grave, HTA no controlada, diabetes mellitus. El aumento del uso de agonistas ß2 de corta duración puede indicar un empeoramiento del asma.",
    interacciones: "No debe prescribirse junto con ß-bloqueantes no selectivos (propranolol). Potencialmente puede dar lugar a una hipopotasemia grave con derivados de la xantina, esteroides, diuréticos. Inhibidores de la MAO y antidepresivos tricíclicos pueden potenciar los efectos sobre el sistema vascular.",
    embarazo: "Solo debe ser considerado si el beneficio esperado para la madre es mayor que cualquier posible riesgo para el feto.",
    lactancia: "Probablemente se excreta en la leche materna, por lo tanto, su uso no se recomienda a no ser que los beneficios esperados para la madre sean mayores que cualquier posible riesgo.",
    reaccionesAdversas: "Frecuentes: temblor, cefalea, taquicardia. Raras: calambres musculares, hipopotasemia, irritación de boca y garganta. Muy raras: reacciones de hipersensibilidad (angioedema, urticaria, broncoespasmo, hipotensión)."
  },
  'aciclovir': {
    mecanismoAccion: "Antiviral análogo de la guanosina. Es fosforilado a su forma activa (trifosfato) que inhibe la ADN polimerasa viral, impidiendo la replicación del ADN del virus Herpes.",
    indicaciones: "Tratamiento de infecciones por virus Herpes Simple en piel y mucosas, incluyendo herpes genital inicial y recurrente. Profilaxis en pacientes inmunocomprometidos. Tratamiento de varicela y herpes zóster.",
    posologia: "Herpes simple: 200 mg, 5 veces/día, durante 5-10 días. Herpes zóster: 800 mg, 5 veces/día, durante 7 días. Varicela en niños: 20 mg/kg, 4 veces/día.",
    modoAdministracion: "Vía oral. Iniciar el tratamiento tan pronto como sea posible tras el inicio de la infección.",
    contraindicaciones: "Hipersensibilidad a aciclovir o valaciclovir.",
    advertencias: "Mantener una adecuada hidratación. Precaución en pacientes con insuficiencia renal y en ancianos. Riesgo de trastornos neurológicos reversibles.",
    insuficienciaRenal: "Ajustar dosis. Herpes simple: Clcr < 10 ml/min, 200 mg/12h. Herpes zóster: Clcr 10-25 ml/min, 800 mg/8h; Clcr < 10 ml/min, 800 mg/12h.",
    interacciones: "Probenecid aumenta la vida media de aciclovir. Cimetidina aumenta el AUC de aciclovir. Usar con precaución con fármacos nefrotóxicos.",
    embarazo: "Usar solo si el beneficio potencial justifica el riesgo para el feto. Existe un registro de embarazos post-comercialización.",
    lactancia: "Se excreta en leche materna. Usar con precaución.",
    reaccionesAdversas: "Frecuentes: cefalea, mareos, náuseas, vómitos, diarrea, dolor abdominal, prurito, erupciones cutáneas, fatiga, fiebre. Raras: aumento de bilirrubina y enzimas hepáticas, aumento de urea y creatinina."
  },
  'ácido acetilsalicílico': {
    mecanismoAccion: "Analgésico, antipirético y antiinflamatorio no esteroideo (AINE). Inhibe de forma irreversible la ciclooxigenasa (COX-1 y COX-2), reduciendo la síntesis de prostaglandinas y tromboxanos.",
    indicaciones: "Dosis bajas (100 mg): Antiagregante plaquetario para profilaxis de eventos cardiovasculares. Dosis altas (500 mg): Dolor leve a moderado, fiebre, artritis.",
    posologia: "Antiagregación: 100 mg/día. Dolor/Fiebre: 500 mg/4-6 h. Máx: 4 g/día.",
    modoAdministracion: "Vía oral. Tomar con alimentos o leche para reducir molestias gástricas.",
    contraindicaciones: "Hipersensibilidad a salicilatos o AINEs, úlcera péptica activa, hemofilia u otros trastornos hemorrágicos, insuficiencia renal o hepática grave. Niños < 16 años (riesgo de Síndrome de Reye).",
    advertencias: "Riesgo de hemorragia gastrointestinal, úlcera o perforación. Usar con precaución en asma, gota, HTA. Suspender 7 días antes de cirugía.",
    insuficienciaHepatica: "Contraindicado en insuficiencia grave. Precaución en leve a moderada.",
    insuficienciaRenal: "Contraindicado en insuficiencia grave (Clcr < 30 ml/min). Precaución en leve a moderada.",
    interacciones: "Aumenta riesgo de sangrado con otros AINEs, anticoagulantes, ISRS. Disminuye efecto de diuréticos, IECA. Aumenta toxicidad de metotrexato.",
    embarazo: "Contraindicado en el 3er trimestre. Usar con precaución en 1er y 2º trimestre.",
    lactancia: "Se excreta en leche. No se recomienda el uso regular de dosis altas.",
    reaccionesAdversas: "Frecuentes: irritación gastrointestinal, náuseas, dispepsia, sangrado (microhemorragias). Poco frecuentes: urticaria, erupciones cutáneas. Raras: hemorragia gástrica, reacciones de hipersensibilidad graves (broncoespasmo, angioedema)."
  },
  'amiodarona clorhidrato': {
    mecanismoAccion: "Antiarrítmico de clase III. Prolonga la duración del potencial de acción y el período refractario en el tejido miocárdico. Posee también efectos de clase I, II y IV.",
    indicaciones: "Profilaxis y tratamiento de arritmias ventriculares y supraventriculares graves.",
    posologia: "Dosis de carga oral: 600-800 mg/día durante 1-2 semanas. Mantenimiento: 100-400 mg/día. IV: Carga 5 mg/kg en 20-120 min, seguido de infusión.",
    modoAdministracion: "Vía oral o intravenosa. Oral con alimentos para mejorar tolerancia.",
    contraindicaciones: "Hipersensibilidad, bradicardia sinusal, bloqueo AV, enfermedad del nódulo sinusal (salvo con marcapasos), disfunción tiroidea, embarazo, lactancia.",
    advertencias: "Riesgo de toxicidad pulmonar (fibrosis), hepática y tiroidea (hipo o hipertiroidismo). Fotosensibilidad. Control oftalmológico (depósitos corneales).",
    interacciones: "Potencia efecto de anticoagulantes (warfarina). Aumenta niveles de digoxina, fenitoína, ciclosporina. Riesgo de arritmias graves con fármacos que prolongan el QT (quinolonas, macrólidos, antidepresivos).",
    embarazo: "Contraindicado. Puede causar hipotiroidismo y bocio en el feto.",
    lactancia: "Contraindicado. Se excreta en leche materna.",
    reaccionesAdversas: "Frecuentes: microdepósitos corneales, fotosensibilidad, náuseas, vómitos, alteración del gusto, elevación de transaminasas. Poco frecuentes: bradicardia, hipo/hipertiroidismo, toxicidad pulmonar, neuropatía periférica."
  },
  'amoxicilina + ac. clavulánico': {
    mecanismoAccion: "Combinación de amoxicilina (bactericida ß-lactámico) con ácido clavulánico (inhibidor de ß-lactamasas). El ácido clavulánico protege a la amoxicilina de la degradación por enzimas ß-lactamasas, extendiendo su espectro de acción.",
    indicaciones: "Infecciones bacterianas por cepas productoras de ß-lactamasas: Sinusitis, otitis media, infecciones del tracto respiratorio inferior, infecciones de piel y tejidos blandos, infecciones urinarias.",
    posologia: "Adultos (875/125 mg): 1 comp./12 h. Niños (suspensión): Dosis basada en el componente de amoxicilina (25-45 mg/kg/día, dividido cada 12h).",
    modoAdministracion: "Vía oral. Tomar al inicio de las comidas para minimizar la intolerancia gastrointestinal.",
    contraindicaciones: "Hipersensibilidad a penicilinas. Antecedentes de ictericia colestásica/disfunción hepática asociada a la combinación.",
    advertencias: "Similar a amoxicilina. Riesgo de disfunción hepática (generalmente reversible). Vigilar función hepática y renal en tratamientos prolongados.",
    insuficienciaHepatica: "Usar con precaución y monitorizar función hepática.",
    insuficienciaRenal: "Ajustar dosis. Clcr 10-30 ml/min: 1 dosis de 500/125 mg cada 12h. Clcr <10 ml/min: 1 dosis de 500/125 mg cada 24h.",
    interacciones: "Similar a amoxicilina. Puede reducir la eficacia de los anticonceptivos orales.",
    embarazo: "Usar con precaución. Un estudio observó un mayor riesgo de enterocolitis necrotizante en neonatos.",
    lactancia: "Ambos componentes se excretan en la leche materna. Riesgo de sensibilización, diarrea, candidiasis.",
    reaccionesAdversas: "Frecuentes: diarrea, náuseas, vómitos, candidiasis mucocutánea. Poco frecuentes: mareos, cefalea, indigestión, aumento de AST/ALT, erupción cutánea, urticaria, prurito."
  },
  'atenolol': {
    mecanismoAccion: "ß-bloqueante cardioselectivo (selectividad ß1). Reduce la frecuencia cardíaca, la contractilidad miocárdica y la presión arterial.",
    indicaciones: "Hipertensión arterial, angina de pecho, arritmias cardíacas, tratamiento post-infarto de miocardio.",
    posologia: "HTA: 50-100 mg/día. Angina: 100 mg/día en 1-2 tomas. Arritmias: 50-100 mg/día. Post-IAM: 100 mg/día.",
    modoAdministracion: "Vía oral. Puede tomarse con o sin alimentos.",
    contraindicaciones: "Hipersensibilidad, shock cardiogénico, insuficiencia cardiaca no controlada, bloqueo AV de 2º o 3 er grado, bradicardia sinusal severa (<45-50 lpm).",
    advertencias: "No suspender bruscamente (riesgo de isquemia miocárdica). Precaución en EPOC/asma, diabetes (puede enmascarar hipoglucemia), insuficiencia renal. Puede enmascarar signos de tirotoxicosis.",
    insuficienciaRenal: "Ajustar dosis. Clcr 15-35 ml/min: 50 mg/día. Clcr <15 ml/min: 50 mg cada 2 días.",
    interacciones: "Potencia efecto de otros antihipertensivos. Aumenta riesgo de bradicardia con verapamilo, diltiazem, amiodarona, digoxina. AINEs pueden disminuir su efecto.",
    embarazo: "Categoría D. Puede causar bradicardia fetal. No recomendado.",
    lactancia: "Se concentra en la leche materna. Puede causar bradicardia en el lactante. Usar con precaución.",
    reaccionesAdversas: "Frecuentes: bradicardia, extremidades frías, trastornos gastrointestinales, fatiga. Poco frecuentes: trastornos del sueño, elevación de transaminasas. Raras: bloqueo cardiaco, hipotensión postural, broncoespasmo en pacientes asmáticos."
  },
  'atorvastatina': {
    mecanismoAccion: "Inhibidor selectivo y competitivo de la HMG-CoA reductasa, enzima limitante en la biosíntesis de colesterol. Reduce los niveles de colesterol total, LDL-C, apolipoproteína B y triglicéridos.",
    indicaciones: "Hipercolesterolemia primaria y dislipidemia mixta. Prevención de eventos cardiovasculares en pacientes de alto riesgo.",
    posologia: "Inicial: 10-20 mg/día. Rango de dosis: 10-80 mg/día. Ajustar según niveles de LDL-C a las 2-4 semanas.",
    modoAdministracion: "Vía oral. Dosis única diaria, a cualquier hora, con o sin alimentos.",
    contraindicaciones: "Hipersensibilidad, enfermedad hepática activa, embarazo, lactancia, mujeres en edad fértil que no utilicen anticonceptivos adecuados.",
    advertencias: "Riesgo de miopatía/rabdomiólisis, especialmente con dosis altas o en combinación con otros fármacos (fibratos, ciclosporina, macrólidos). Realizar pruebas de función hepática antes de iniciar y periódicamente.",
    insuficienciaHepatica: "Contraindicado en enfermedad hepática activa.",
    interacciones: "Inhibidores potentes de CYP3A4 (ej. itraconazol, ketoconazol, claritromicina, inhibidores de proteasa) aumentan riesgo de miopatía. Riesgo aumentado de miopatía con gemfibrozilo, ezetimiba, colchicina.",
    embarazo: "Contraindicado. El colesterol es esencial para el desarrollo fetal.",
    lactancia: "Contraindicado.",
    reaccionesAdversas: "Frecuentes: nasofaringitis, hiperglucemia, cefalea, dolor faringolaríngeo, epistaxis, estreñimiento, flatulencia, dispepsia, náuseas, diarrea, mialgias, artralgias, dolor en extremidades, espasmos musculares, edema articular, dolor de espalda, pruebas de función hepática anormales, aumento de CK en sangre."
  },
  'budesonida': {
    mecanismoAccion: "Glucocorticoide con potente acción antiinflamatoria local. Reduce la hiperreactividad bronquial al inhibir la liberación de mediadores de la inflamación y las respuestas inmunes mediadas por citoquinas.",
    indicaciones: "Tratamiento de mantenimiento del asma persistente. EPOC.",
    posologia: "Inhalación. Adultos (asma): 200-1600 mcg/día, divididos en 2 dosis. Niños > 6 años: 200-800 mcg/día en 2 dosis.",
    modoAdministracion: "Vía inhalatoria. Enjuagar la boca con agua después de cada uso para reducir el riesgo de candidiasis orofaríngea.",
    contraindicaciones: "Hipersensibilidad.",
    advertencias: "No indicado para el alivio rápido del broncoespasmo agudo. Riesgo de efectos sistémicos con dosis altas y tratamiento prolongado (supresión adrenal, retraso del crecimiento en niños, disminución de la densidad mineral ósea, cataratas, glaucoma).",
    interacciones: "Inhibidores potentes de CYP3A4 (ketoconazol, itraconazol, ritonavir) pueden aumentar significativamente los niveles plasmáticos de budesonida.",
    embarazo: "Datos limitados no sugieren un aumento del riesgo de malformaciones. Usar si el beneficio supera el riesgo.",
    lactancia: "Se excreta en leche materna, pero a dosis terapéuticas no se esperan efectos en el lactante.",
    reaccionesAdversas: "Frecuentes: candidiasis orofaríngea, ronquera, tos, irritación de garganta. Raras: reacciones de hipersensibilidad, signos de efectos corticosteroideos sistémicos, hematomas cutáneos."
  },
  'carvedilol': {
    mecanismoAccion: "Betabloqueante no selectivo con propiedades bloqueantes de los receptores alfa-1 adrenérgicos. Produce vasodilatación (alfa-1) y reduce la frecuencia cardíaca y la contractilidad (beta-1 y beta-2).",
    indicaciones: "Hipertensión arterial esencial. Angina de pecho estable crónica. Tratamiento coadyuvante en la insuficiencia cardíaca crónica estable, de moderada a grave.",
    posologia: "HTA: inicial 12,5 mg/día, aumentar a 25 mg/día. Máx: 50 mg/día. Insuficiencia cardíaca: inicial 3,125 mg/12 h, aumentar gradualmente hasta la dosis máxima tolerada (25-50 mg/12 h).",
    modoAdministracion: "Vía oral. Tomar con alimentos para enlentecer la absorción y reducir el riesgo de hipotensión ortostática.",
    contraindicaciones: "Hipersensibilidad, insuficiencia cardíaca descompensada (clase IV NYHA), EPOC con componente broncoespástico, disfunción hepática, bloqueo AV de 2º y 3er grado, bradicardia grave (<50 lpm), shock cardiogénico.",
    advertencias: "No suspender bruscamente. Precaución en diabetes (puede enmascarar hipoglucemia), feocromocitoma, enfermedad vascular periférica. Puede empeorar los síntomas de la psoriasis.",
    insuficienciaHepatica: "Contraindicado.",
    interacciones: "Aumenta niveles de digoxina. Potencia efecto de otros antihipertensivos. Diltiazem y verapamilo pueden potenciar la depresión miocárdica. Rifampicina disminuye sus niveles plasmáticos.",
    embarazo: "No recomendado, puede causar bradicardia fetal y neonatal. Usar solo si el beneficio supera el riesgo.",
    lactancia: "No recomendado.",
    reaccionesAdversas: "Muy frecuentes: mareo, cefalea, insuficiencia cardíaca, hipotensión, fatiga. Frecuentes: bronquitis, neumonía, infección del tracto respiratorio superior, anemia, aumento de peso, hipercolesterolemia, empeoramiento del control de la glucosa en diabéticos, bradicardia, edema, síncope, náuseas, diarrea, vómitos, dispepsia."
  },
  // Add more drugs following the same structure. This is a manual and extensive process.
  // ... to be continued for all other drugs from the list.
};
