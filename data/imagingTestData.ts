export interface ImagingTestDetail {
  code: string;
  label: string;
  category: 'Resonancia Magnética' | 'Tomografía Computada' | 'Ecografía' | 'Radiografía';
}

export const imagingTestDetails: Record<string, ImagingTestDetail> = {
  // --- RADIOGRAFÍAS (Radiografía de...) ---
  rx_torax: { code: '04-01-001', label: 'Radiografía de Tórax Frente y Perfil', category: 'Radiografía' },
  rx_columna_cervical: { code: '04-01-002', label: 'Radiografía de Columna Cervical Frente y Perfil', category: 'Radiografía' },
  rx_columna_dorsal: { code: '04-01-003', label: 'Radiografía de Columna Dorsal Frente y Perfil', category: 'Radiografía' },
  rx_columna_lumbar: { code: '04-01-004', label: 'Radiografía de Columna Lumbar Frente y Perfil', category: 'Radiografía' },
  rx_abdomen_simple: { code: '04-01-005', label: 'Radiografía de Abdomen Simple de Pie', category: 'Radiografía' },
  rx_pelvis: { code: '04-01-006', label: 'Radiografía de Pelvis y Caderas Anteroposterior', category: 'Radiografía' },
  rx_rodilla_der: { code: '04-01-007', label: 'Radiografía de Rodilla Derecha Anteroposterior y Lateral', category: 'Radiografía' },
  rx_rodilla_izq: { code: '04-01-008', label: 'Radiografía de Rodilla Izquierda Anteroposterior y Lateral', category: 'Radiografía' },
  rx_tobillo_der: { code: '04-01-009', label: 'Radiografía de Tobillo Derecho Anteroposterior y Lateral', category: 'Radiografía' },
  rx_tobillo_izq: { code: '04-01-010', label: 'Radiografía de Tobillo Izquierdo Anteroposterior y Lateral', category: 'Radiografía' },
  rx_mano_der: { code: '04-01-011', label: 'Radiografía de Mano Derecha Anteroposterior y Oblicua', category: 'Radiografía' },
  rx_mano_izq: { code: '04-01-012', label: 'Radiografía de Mano Izquierda Anteroposterior y Oblicua', category: 'Radiografía' },
  rx_muneca_der: { code: '04-01-013', label: 'Radiografía de Muñeca Derecha Anteroposterior y Lateral', category: 'Radiografía' },
  rx_muneca_izq: { code: '04-01-014', label: 'Radiografía de Muñeca Izquierda Anteroposterior y Lateral', category: 'Radiografía' },
  rx_pie_der: { code: '04-01-015', label: 'Radiografía de Pie Derecho Anteroposterior y Oblicua', category: 'Radiografía' },
  rx_pie_izq: { code: '04-01-016', label: 'Radiografía de Pie Izquierdo Anteroposterior y Oblicua', category: 'Radiografía' },
  rx_craneo: { code: '04-01-017', label: 'Radiografía de Cráneo Anteroposterior y Lateral', category: 'Radiografía' },
  rx_hombro_der: { code: '04-01-018', label: 'Radiografía de Hombro Derecho Anteroposterior y Axial', category: 'Radiografía' },
  rx_hombro_izq: { code: '04-01-019', label: 'Radiografía de Hombro Izquierdo Anteroposterior y Axial', category: 'Radiografía' },
  rx_clavicula_der: { code: '04-01-020', label: 'Radiografía de Clavícula Derecha', category: 'Radiografía' },
  rx_clavicula_izq: { code: '04-01-021', label: 'Radiografía de Clavícula Izquierda', category: 'Radiografía' },
  rx_codo_der: { code: '04-01-022', label: 'Radiografía de Codo Derecho Anteroposterior y Lateral', category: 'Radiografía' },
  rx_codo_izq: { code: '04-01-023', label: 'Radiografía de Codo Izquierdo Anteroposterior y Lateral', category: 'Radiografía' },
  rx_cavum: { code: '04-01-024', label: 'Radiografía de Cavum Rinofaríngeo', category: 'Radiografía' },

  // --- ECOGRAFÍAS ---
  eco_abdominal: { code: '04-04-001', label: 'Ecografía Abdominal Completa', category: 'Ecografía' },
  eco_renal_vesical: { code: '04-04-002', label: 'Ecografía Renal y Vesical', category: 'Ecografía' },
  eco_pelviana: { code: '04-04-003', label: 'Ecografía Pelviana Femenina', category: 'Ecografía' },
  eco_transvaginal: { code: '04-04-004', label: 'Ecografía Ginecología Transvaginal', category: 'Ecografía' },
  eco_mamaria: { code: '04-04-005', label: 'Ecografía Mamaria Bilateral y Axilar', category: 'Ecografía' },
  eco_tiroidea: { code: '04-04-006', label: 'Ecografía Tiroidea y Cervical', category: 'Ecografía' },
  eco_doppler_venoso_eeii: { code: '04-04-007', label: 'Ecografía Doppler Venoso de Miembros Inferiores', category: 'Ecografía' },
  eco_doppler_arterial_eeii: { code: '04-04-008', label: 'Ecografía Doppler Arterial de Miembros Inferiores', category: 'Ecografía' },
  eco_partes_blandas: { code: '04-04-009', label: 'Ecografía de Partes Blandas', category: 'Ecografía' },
  eco_abdomino_pelviana: { code: '04-04-010', label: 'Ecografía Abdominal y Pelviana', category: 'Ecografía' },
  eco_testicular: { code: '04-04-011', label: 'Ecografía Testicular y Escrotal con Doppler', category: 'Ecografía' },
  eco_prostata_transrectal: { code: '04-04-012', label: 'Ecografía Prostática Transrectal', category: 'Ecografía' },

  // --- TOMOGRAFÍAS COMPUTADAS (Tomografía Computada de...) ---
  tc_cerebro_sin: { code: '04-03-001', label: 'Tomografía Computada de Cerebro sin Contraste', category: 'Tomografía Computada' },
  tc_cerebro_con: { code: '04-03-002', label: 'Tomografía Computada de Cerebro con Contraste', category: 'Tomografía Computada' },
  tc_torax_sin: { code: '04-03-003', label: 'Tomografía Computada de Tórax sin Contraste', category: 'Tomografía Computada' },
  tc_torax_con: { code: '04-03-004', label: 'Tomografía Computada de Tórax con Contraste', category: 'Tomografía Computada' },
  tc_tap: { code: '04-03-005', label: 'Tomografía Computada de Abdomen y Pelvis con Contraste', category: 'Tomografía Computada' },
  tc_columna_lumbar: { code: '04-03-006', label: 'Tomografía Computada de Columna Lumbar', category: 'Tomografía Computada' },
  tc_spn: { code: '04-03-007', label: 'Tomografía Computada de Senos Paranasales', category: 'Tomografía Computada' },
  tc_cuello_con: { code: '04-03-008', label: 'Tomografía Computada de Cuello con Contraste', category: 'Tomografía Computada' },
  angio_tc_torax: { code: '04-03-009', label: 'Angiografía por Tomografía Computada de Tórax (Protocolo TEP)', category: 'Tomografía Computada' },
  tc_oidos: { code: '04-03-010', label: 'Tomografía Computada de Oídos y Peñascos de Alta Resolución', category: 'Tomografía Computada' },

  // --- RESONANCIAS MAGNÉTICAS (Resonancia Magnética de...) ---
  rm_cerebro_sin: { code: '04-05-001', label: 'Resonancia Magnética de Cerebro sin Contraste', category: 'Resonancia Magnética' },
  rm_cerebro_con: { code: '04-05-002', label: 'Resonancia Magnética de Cerebro con Contraste', category: 'Resonancia Magnética' },
  rm_columna_cervical: { code: '04-05-003', label: 'Resonancia Magnética de Columna Cervical', category: 'Resonancia Magnética' },
  rm_columna_dorsal: { code: '04-05-004', label: 'Resonancia Magnética de Columna Dorsal', category: 'Resonancia Magnética' },
  rm_columna_lumbar: { code: '04-05-005', label: 'Resonancia Magnética de Columna Lumbar', category: 'Resonancia Magnética' },
  rm_rodilla_der: { code: '04-05-006', label: 'Resonancia Magnética de Rodilla Derecha', category: 'Resonancia Magnética' },
  rm_rodilla_izq: { code: '04-05-007', label: 'Resonancia Magnética de Rodilla Izquierda', category: 'Resonancia Magnética' },
  rm_hombro_der: { code: '04-05-008', label: 'Resonancia Magnética de Hombro Derecho', category: 'Resonancia Magnética' },
  rm_hombro_izq: { code: '04-05-009', label: 'Resonancia Magnética de Hombro Izquierdo', category: 'Resonancia Magnética' },
  rm_pelvis: { code: '04-05-010', label: 'Resonancia Magnética de Pelvis y Próstata Multiparamétrica', category: 'Resonancia Magnética' },
  rm_cadera_der: { code: '04-05-011', label: 'Resonancia Magnética de Cadera Derecha', category: 'Resonancia Magnética' },
  rm_cadera_izq: { code: '04-05-012', label: 'Resonancia Magnética de Cadera Izquierda', category: 'Resonancia Magnética' },
  angio_rm_cerebral: { code: '04-05-013', label: 'Angiografía por Resonancia Magnética Cerebral', category: 'Resonancia Magnética' },
  rm_colangio: { code: '04-05-014', label: 'Resonancia Magnética de Abdomen Superior y Colangioresonancia', category: 'Resonancia Magnética' },
};
