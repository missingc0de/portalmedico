import { OnCallSchedule, SpecialEventData, SpecialEvent } from '../types';

export const onCallScheduleData: OnCallSchedule = {
  2025: { // Year
    5: { // Month (0-indexed, so 5 is June)
      2: ["DANIELA ZAMORANO", "MARIANY DAVILA", "RUBEN QUEZADA"],
      3: ["VICTOR VEGA", "ROMINA LOPEZ", "RODRIGO PIZARRO"],
      4: ["FRANCO MILOS", "BENJAMIN ROJAS", "HENRY PATIÑO"],
      5: ["LUCIANO RAMOS", "ISMAEL VALDÉS", "CAROLINA MADARIAGA"],
      6: ["DAVID CORTES", "CECILIA YEPEZ", "GABRIELA CUELLO"],
      // Sabado 7, Domingo 8: Empty
      7: [],
      8: [],
      9: ["MARIANY DAVILA", "RUBEN QUEZADA", "DANIELA ZAMORANO"],
      10: ["CAMILA ROJAS", "RODRIGO PIZARRO", "ROMINA LOPEZ"],
      11: ["BENJAMIN ROJAS", "HENRY PATIÑO", "FRANCO MILOS"],
      12: ["ISMAEL VALDÉS", "CAROLINA MADARIAGA", "LUCIANO RAMOS"],
      13: ["CECILIA YEPEZ", "GABRIELA CUELLO", "DAVID CORTES"],
      // Sabado 14, Domingo 15: Empty
      14: [],
      15: [],
      16: ["RUBEN QUEZADA", "DANIELA ZAMORANO", "MARIANY DAVILA"],
      17: ["ROMINA LOPEZ", "CAMILA ROJAS", "VICTOR VEGA"],
      18: ["HENRY PATIÑO", "FRANCO MILOS", "BENJAMIN ROJAS"],
      19: ["CAROLINA MADARIAGA", "LUCIANO RAMOS", "ISMAEL VALDÉS"],
      20: ["GABRIELA CUELLO", "DAVID CORTES", "CECILIA YEPEZ"],
      // Sabado 21, Domingo 22: Empty
      21: [],
      22: [],
      23: ["DANIELA ZAMORANO", "MARIANY DAVILA", "RUBEN QUEZADA"],
      24: ["VICTOR VEGA", "ROMINA LOPEZ", "CAMILA ROJAS"],
      25: ["BENJAMIN ROJAS"], // JORNADA APS
      26: ["ISMAEL VALDÉS"],  // JORNADA APS
      27: ["RODRIGO PIZARRO"],// JORNADA APS
      // Sabado 28, Domingo 29: Empty
      28: [],
      29: [],
      30: ["RODRIGO PIZARRO", "RUBEN QUEZADA", "DANIELA ZAMORANO"],
    },
    6: { // July (0-indexed)
      7: ["RUBEN QUEZADA", "RODRIGO PIZARRO", "DANIELA ZAMORANO"],
      8: ["ROMINA LOPEZ", "VICTOR VEGA", "CAMILA ROJAS"],
      9: ["BENJAMIN ROJAS", "HENRY PATIÑO", "FRANCO MILOS"],
      10: ["ISMAEL VALDÉS", "CAROLINA MADARIAGA", "LUCIANO RAMOS"],
      11: ["CECILIA YEPEZ", "GABRIELA CUELLO", "DAVID CORTES"],
      12: [],
      13: [],
      14: ["RUBEN QUEZADA", "DANIELA ZAMORANO", "MARIANY DAVILA"],
      15: ["VICTOR VEGA", "ROMINA LOPEZ", "CAMILA ROJAS"],
      16: ["HENRY PATIÑO", "FRANCO MILOS", "BENJAMIN ROJAS"],
      17: ["CAROLINA MADARIAGA", "LUCIANO RAMOS", "ISMAEL VALDÉS"],
      18: ["GABRIELA CUELLO", "DAVID CORTES", "CECILIA YEPEZ"],
      19: [],
      20: [],
      21: ["DANIELA ZAMORANO", "MARIANY DAVILA", "RUBEN QUEZADA"],
      22: ["CAMILA ROJAS", "ROMINA LOPEZ", "VICTOR VEGA"],
      23: ["BENJAMIN ROJAS", "HENRY PATIÑO", "FRANCO MILOS"],
      24: ["LUCIANO RAMOS", "CAROLINA MADARIAGA", "ISMAEL VALDÉS"],
      25: ["DAVID CORTES", "CECILIA YEPEZ", "GABRIELA CUELLO"],
      26: [],
      27: [],
      28: ["RODRIGO PIZARRO", "RUBEN QUEZADA", "DANIELA ZAMORANO"],
      29: ["ROMINA LOPEZ", "VICTOR VEGA", "CAMILA ROJAS"],
      30: ["FRANCO MILOS", "BENJAMIN ROJAS", "HENRY PATIÑO"],
      31: ["ISMAEL VALDÉS", "LUCIANO RAMOS", "CAROLINA MADARIAGA"]
    },
    7: { // August (0-indexed)
      1: ["GABRIELA CUELLO", "DAVID CORTES", "CECILIA YEPEZ"],
      2: [],
      3: [],
      4: ["MARIANY DAVILA", "DANIELA ZAMORANO", "RODRIGO PIZARRO"],
      5: ["CAMILA ROJAS", "ROMINA LOPEZ", "VICTOR VEGA"],
      6: ["HENRY PATIÑO", "BENJAMIN ROJAS", "FRANCO MILOS"],
      7: ["CAROLINA MADARIAGA", "LUCIANO RAMOS", "ISMAEL VALDES"],
      8: ["CECILIA YEPEZ", "GABRIELA CUELLO", "DAVID CORTES"],
      9: [],
      10: [],
      11: ["DANIELA ZAMORANO", "RODRIGO PIZARRO", "MARIANY DAVILA"],
      12: ["VICTOR VEGA", "CAMILA ROJAS", "ROMINA LOPEZ"],
      13: ["BENJAMIN ROJAS", "FRANCO MILOS", "HENRY PATIÑO"],
      14: ["CAROLINA MADARIAGA", "ISMAEL VALDES"],
      15: ["DAVID CORTES", "CECILIA YEPEZ", "GABRIELA CUELLO"],
      16: [],
      17: [],
      18: ["RODRIGO PIZARRO", "MARIANY DAVILA", "DANIELA ZAMORANO"],
      19: ["ROMINA LOPEZ", "VICTOR VEGA", "CAMILA ROJAS"],
      20: ["FRANCO MILOS", "HENRY PATIÑO", "BENJAMIN ROJAS"],
      21: ["LUCIANO RAMOS", "CAROLINA MADARIAGA", "ISMAEL VALDES"],
      22: ["GABRIELA CUELLO", "DAVID CORTES", "CECILIA YEPEZ"],
      23: [],
      24: [],
      25: ["MARIANY DAVILA", "DANIELA ZAMORANO", "RODRIGO PIZARRO"],
      26: ["CAMILA ROJAS", "ROMINA LOPEZ", "VICTOR VEGA"],
      27: ["HENRY PATIÑO", "BENJAMIN ROJAS", "FRANCO MILOS"],
      28: ["ISMAEL VALDES", "LUCIANO RAMOS", "CAROLINA MADARIAGA"],
      29: ["CECILIA YEPEZ", "GABRIELA CUELLO", "DAVID CORTES"],
      30: [],
      31: []
    },
    8: { // September (0-indexed)
      1: ["DANIELA ZAMORANO", "RODRIGO PIZARRO", "MARIANY DAVILA"],
      2: ["VICTOR VEGA", "CAMILA ROJAS", "ROMINA LOPEZ"],
      3: ["BENJAMIN ROJAS", "FRANCO MILOS", "HENRY PATIÑO"],
      4: ["ISMAEL VALDES", "CAROLINA MADARIAGA"],
      5: ["DAVID CORTES", "CECILIA YEPEZ", "GABRIELA CUELLO"],
      6: [],
      7: [],
      8: ["RODRIGO PIZARRO", "MARIANY DAVILA", "DANIELA ZAMORANO"],
      9: ["ROMINA LOPEZ", "VICTOR VEGA", "CAMILA ROJAS"],
      10: ["FRANCO MILOS", "HENRY PATIÑO", "BENJAMIN ROJAS"],
      11: ["CAROLINA MADARIAGA", "LUCIANO RAMOS", "ISMAEL VALDES"],
      12: ["GABRIELA CUELLO", "DAVID CORTES", "CECILIA YEPEZ"],
      13: [],
      14: [],
      15: ["MARIANY DAVILA", "DANIELA ZAMORANO", "RODRIGO PIZARRO"],
      16: ["CAMILA ROJAS", "ROMINA LOPEZ", "VICTOR VEGA"],
      17: ["HENRY PATIÑO", "BENJAMIN ROJAS", "FRANCO MILOS"],
      18: [],
      19: [],
      20: [],
      21: [],
      22: ["DANIELA ZAMORANO", "RODRIGO PIZARRO", "MARIANY DAVILA"],
      23: ["VICTOR VEGA", "CAMILA ROJAS", "ROMINA LOPEZ"],
      24: ["BENJAMIN ROJAS", "FRANCO MILOS", "HENRY PATIÑO"],
      25: ["LUCIANO RAMOS", "ISMAEL VALDES", "CAROLINA MADARIAGA"],
      26: ["CECILIA YEPEZ", "GABRIELA CUELLO", "DAVID CORTES"],
      27: [],
      28: [],
      29: ["RODRIGO PIZARRO", "MARIANY DAVILA", "DANIELA ZAMORANO"],
      30: ["ROMINA LOPEZ", "VICTOR VEGA", "CAMILA ROJAS"],
    },
    9: { // October (0-indexed)
      1: ["FRANCO MILOS", "BENJAMIN ROJAS"],
      2: ["ISMAEL VALDES", "CAROLINA MADARIAGA"],
      3: ["RAMOS", "VEGA"],
      4: [],
      5: [],
      6: ["RODRIGO PIZARRO", "DANIELA ZAMORANO", "MARIANY DAVILA"],
      7: ["CAMILA ROJAS", "ROMINA LOPEZ", "VICTOR VEGA"],
      8: ["HENRY PATIÑO", "BENJAMIN ROJAS", "FRANCO MILOS"],
      9: ["MADARIAGA", "ROJAS"],
      10: ["PATIÑO", "GARCIA"],
      11: [],
      12: [],
      13: ["MARIANY DAVILA", "RODRIGO PIZARRO", "DANIELA ZAMORANO"],
      14: ["VICTOR VEGA", "CAMILA ROJAS", "ROMINA LOPEZ"],
      15: ["BENJAMIN ROJAS", "FRANCO MILOS", "HENRY PATIÑO"],
      16: ["PEREZ", "CORTES"],
      17: ["CUELLO", "OCHOA"],
      18: [],
      19: [],
      20: ["RODRIGO PIZARRO", "MARIANY DAVILA", "DANIELA ZAMORANO"],
      21: ["CAMILA ROJAS", "VICTOR VEGA", "ROMINA LOPEZ"],
      22: ["FRANCO MILOS", "HENRY PATIÑO", "BENJAMIN ROJAS"],
      23: ["PIZARRO", "VALDES"],
      24: ["CORTES", "PEREZ"],
      25: [],
      26: [],
      27: ["MARIANY DAVILA", "DANIELA ZAMORANO", "RODRIGO PIZARRO"],
      28: ["ROMINA LOPEZ", "CAMILA ROJAS", "VICTOR VEGA"],
      29: ["FRANCO MILOS", "BENJAMIN ROJAS", "HENRY PATIÑO"],
      30: ["PATIÑO", "GARCIA"],
      31: [],
    },
    10: { // November (0-indexed)
      1: [], // Sat
      2: [], // Sun
      3: ["RODRIGO PIZARRO", "MARIANY DAVILA", "DANIELA ZAMORANO"],
      4: ["VICTOR VEGA", "CAMILA ROJAS", "ROMINA LOPEZ"],
      5: ["BENJAMIN ROJAS", "HENRY PATIÑO", "FRANCO MILOS"],
      6: ["CAROLINA MADARIAGA", "LUCIANO RAMOS", "ISMAEL VALDES"],
      7: ["GABRIELA CUELLO", "DAVID CORTES", "CECILIA YEPEZ"],
      8: [], // Sat
      9: [], // Sun
      10: ["DANIELA ZAMORANO", "MARIANY DAVILA", "RODRIGO PIZARRO"],
      11: ["ROMINA LOPEZ", "CAMILA ROJAS", "VICTOR VEGA"],
      12: ["FRANCO MILOS", "BENJAMIN ROJAS", "HENRY PATIÑO"],
      13: ["ISMAEL VALDES", "LUCIANO RAMOS", "CAROLINA MADARIAGA"],
      14: ["DAVID CORTES", "DAVID CORTES", "GABRIELA CUELLO"],
      15: [], // Sat
      16: [], // Sun
      17: ["MARIANY DAVILA", "RODRIGO PIZARRO", "DANIELA ZAMORANO"],
      18: ["CAMILA ROJAS", "VICTOR VEGA", "ROMINA LOPEZ"],
      19: ["HENRY PATIÑO", "FRANCO MILOS", "BENJAMIN ROJAS"],
      20: ["LUCIANO RAMOS", "ISMAEL VALDES", "CAROLINA MADARIAGA"],
      21: ["CECILIA YEPEZ", "GABRIELA CUELLO", "DAVID CORTES"],
      22: [], // Sat
      23: [], // Sun
      24: ["RODRIGO PIZARRO", "MARIANY DAVILA", "DANIELA ZAMORANO"],
      25: ["VICTOR VEGA", "ROMINA LOPEZ", "CAMILA ROJAS"],
      26: ["BENJAMIN ROJAS", "HENRY PATIÑO", "FRANCO MILOS"],
      27: ["CAROLINA MADARIAGA", "ISMAEL VALDES", "LUCIANO RAMOS"],
      28: ["GABRIELA CUELLO", "DAVID CORTES", "CECILIA YEPEZ"],
      29: [], // Sat
      30: [], // Sun
    },
    11: { // December (0-indexed)
      1: ["DANIELA ZAMORANO", "MARIANY DAVILA", "RODRIGO PIZARRO"],
      2: ["CAMILA ROJAS", "ROMINA LOPEZ", "VICTOR VEGA"],
      3: ["FRANCO MILOS", "HENRY PATIÑO", "BENJAMIN ROJAS"],
      4: ["LUCIANO RAMOS", "ISMAEL VALDES"],
      5: ["DAVID CORTES"],
      6: [], // Sat
      7: [], // Sun
      8: [],
      9: ["ROMINA LOPEZ", "VICTOR VEGA", "CAMILA ROJAS"],
      10: ["BENJAMIN ROJAS", "HENRY PATIÑO", "FRANCO MILOS"],
      11: ["ISMAEL VALDES", "LUCIANO RAMOS"],
      12: ["DAVID CORTES", "CECILIA YEPEZ", "GABRIELA CUELLO"],
      13: [], // Sat
      14: [], // Sun
      15: ["MARIANY DAVILA", "RODRIGO PIZARRO", "DANIELA ZAMORANO"],
      16: ["VICTOR VEGA", "CAMILA ROJAS", "ROMINA LOPEZ"],
      17: ["HENRY PATIÑO", "FRANCO MILOS"],
      18: ["LUCIANO RAMOS", "ISMAEL VALDES"],
      19: ["GABRIELA CUELLO", "CECILIA YEPEZ", "DAVID CORTES"],
      20: [], // Sat
      21: [], // Sun
      22: ["DANIELA ZAMORANO", "RODRIGO PIZARRO", "MARIANY DAVILA"],
      23: ["CAMILA ROJAS", "ROMINA LOPEZ", "VICTOR VEGA"],
      24: ["FRANCO MILOS", "HENRY PATIÑO"],
      25: [],
      26: ["CECILIA YEPEZ", "DAVID CORTES", "GABRIELA CUELLO"],
      27: [], // Sat
      28: [], // Sun
      29: ["RODRIGO PIZARRO", "MARIANY DAVILA", "DANIELA ZAMORANO"],
      30: ["ROMINA LOPEZ", "VICTOR VEGA", "CAMILA ROJAS"],
      31: ["HENRY PATIÑO", "FRANCO MILOS"],
    }
  },
  2026: {
    0: { // January (0-indexed)
      2: ["GABRIELA CUELLO", "CECILIA YEPEZ", "DAVID CORTES"],
      5: ["DANIELA ZAMORANO", "RODRIGO PIZARRO"],
      6: ["CAMILA ROJAS", "ROMINA LOPEZ", "VICTOR VEGA"],
      7: ["FRANCO MILOS", "HENRY PATIÑO", "BENJAMIN ROJAS"],
      8: ["CAROLINA MADARIAGA", "LUCIANO RAMOS"],
      9: ["DAVID CORTES", "GABRIELA CUELLO", "CECILIA YEPEZ"],
      12: ["RODRIGO PIZARRO", "DANIELA ZAMORANO", "MARIANY DAVILA"],
      13: ["VICTOR VEGA", "CAMILA ROJAS", "ROMINA LOPEZ"],
      14: ["HENRY PATIÑO", "BENJAMIN ROJAS", "FRANCO MILOS"],
      15: ["LUCIANO RAMOS", "CAROLINA MADARIAGA"],
      16: ["CECILIA YEPEZ", "DAVID CORTES", "GABRIELA CUELLO"],
      19: ["MARIANY DAVILA", "RODRIGO PIZARRO", "DANIELA ZAMORANO"],
      20: ["ROMINA LOPEZ", "VICTOR VEGA", "CAMILA ROJAS"],
      21: ["BENJAMIN ROJAS", "FRANCO MILOS", "HENRY PATIÑO"],
      22: ["CARO MADARIAGA", "LUCIANO RAMOS"],
      23: ["GABRIELA CUELLO", "CECILIA YEPEZ", "DAVID CORTES"],
      26: ["DANIELA ZAMORANO", "MARIANY DÁVILA", "RODRIGO PIZARRO"],
      27: ["CAMILA ROJAS", "ROMINA LOPEZ", "VICTOR VEGA"],
      28: ["FRANCO MILOS", "HENRY PATIÑO", "BENJAMIN ROJAS"],
      29: ["LUCIANO RAMOS", "CARO MADARIAGA"],
      30: ["DAVID CORTES", "GABRIELA CUELLO", "CECILIA YEPEZ"]
    },
    1: { // February (0-indexed) - UPDATED BASED ON IMAGE
      2: ["RODRIGO PIZARRO", "DANIELA ZAMORANO", "MARIANY DAVILA"],
      3: ["CAMILA ROJAS", "ROMINA LOPEZ"],
      4: ["BENJAMIN ROJAS", "FRANCO MILOS", "HENRY PATIÑO"],
      5: ["LUCIANO RAMOS", "CARO MADARIAGA"],
      6: ["CECILIA YEPEZ", "DAVID CORTES", "GABRIELA CUELLO"],
      9: ["MARIANY DAVILA", "RODRIGO PIZARRO", "DANIELA ZAMORANO"],
      10: ["ROMINA LOPEZ", "CAMILA ROJAS"],
      11: ["HENRY PATIÑO", "BENJAMIN ROJAS", "FRANCO MILOS"],
      12: ["CARO MADARIAGA", "LUCIANO RAMOS"],
      13: ["GABRIELA CUELLO", "CECILIA YEPEZ", "DAVID CORTES"],
      16: ["BASTIAN CÓRDOVA", "RODRIGO PIZARRO"],
      17: ["VICTOR VEGA", "ROMINA LOPEZ"],
      18: ["BENJAMIN ROJAS", "HENRY PATIÑO"],
      19: ["LUCIANO RAMOS", "CAROLINA MADARIAGA"],
      20: ["CECILIA YEPEZ", "DAVID CORTES", "GABRIELA CUELLO"],
      23: ["RODRIGO PIZARRO", "BASTIAN CÓRDOVA"],
      24: ["ROMINA LOPEZ", "VICTOR VEGA"],
      25: ["HENRY PATIÑO", "BENJAMIN ROJAS"],
      26: ["CARO MADARIAGA", "LUCIANO RAMOS"],
      27: ["GABRIELA CUELLO", "CECILIA YEPEZ", "DAVID CORTES"]
    },
    2: { // March (0-indexed)
      2: ["VICTOR VEGA", "RODRIGO PIZARRO", "GABRIELA CUELLO"],
      3: ["CAMILA ROJAS", "ROMINA LOPEZ"],
      4: ["BENJAMIN ROJAS", "DAVID CORTES", "BASTIAN CORDOVA"],
      5: ["FRANCO MILOS", "CECILIA YEPEZ", "LUCIANO RAMOS"],
      6: ["HENRY PATIÑO", "CAROLINA MADARIAGA"],
      9: ["GABRIELA CUELLO", "VICTOR VEGA", "RODRIGO PIZARRO"],
      10: ["ROMINA LOPEZ", "CAMILA ROJAS"],
      11: ["BASTIAN CORDOVA", "BENJAMIN ROJAS", "DAVID CORTES"],
      12: ["LUCIANO RAMOS", "FRANCO MILOS", "CECILIA YEPEZ"],
      13: ["CAROLINA MADARIAGA", "HENRY PATIÑO"],
      16: ["RODRIGO PIZARRO", "GABRIELA CUELLO", "VICTOR VEGA"],
      17: ["CAMILA ROJAS", "ROMINA LOPEZ"],
      18: ["DAVID CORTES", "BASTIAN CORDOVA", "BENJAMIN ROJAS"],
      19: ["CECILIA YEPEZ", "LUCIANO RAMOS", "FRANCO MILOS"],
      20: ["HENRY PATIÑO", "CAROLINA MADARIAGA"],
      23: ["VICTOR VEGA", "RODRIGO PIZARRO", "GABRIELA CUELLO"],
      24: ["ROMINA LOPEZ", "CAMILA ROJAS"],
      25: ["BENJAMIN ROJAS", "DAVID CORTES", "BASTIAN CORDOVA"],
      26: ["FRANCO MILOS", "CECILIA YEPEZ", "LUCIANO RAMOS"],
      27: ["CAROLINA MADARIAGA", "HENRY PATIÑO"],
      30: ["GABRIELA CUELLO", "VICTOR VEGA", "RODRIGO PIZARRO"],
      31: ["CAMILA ROJAS", "ROMINA LOPEZ"]
    },
    3: { // April (0-indexed)
      1: ["BASTIAN CORDOVA", "BENJAMIN ROJAS", "DAVID CORTES"],
      2: ["LUCIANO RAMOS", "FRANCO MILOS", "CECILIA YEPEZ"],
      3: [],
      6: ["RODRIGO PIZARRO", "GABRIELA CUELLO", "VICTOR VEGA"],
      7: ["ROMINA LOPEZ", "CAMILA ROJAS"],
      8: ["DAVID CORTES", "BASTIAN CORDOVA", "BENJAMIN ROJAS"],
      9: ["CECILIA YEPEZ", "LUCIANO RAMOS", "FRANCO MILOS"],
      10: ["CAROLINA MADARIAGA", "HENRY PATIÑO"],
      13: ["VICTOR VEGA", "RODRIGO PIZARRO", "GABRIELA CUELLO"],
      14: ["CAMILA ROJAS", "ROMINA LOPEZ"],
      15: ["BENJAMIN ROJAS", "DAVID CORTES", "BASTIAN CORDOVA"],
      16: ["FRANCO MILOS", "CECILIA YEPEZ", "LUCIANO RAMOS"],
      17: ["HENRY PATIÑO", "CAROLINA MADARIAGA"],
      20: ["GABRIELA CUELLO", "VICTOR VEGA", "RODRIGO PIZARRO"],
      21: ["ROMINA LOPEZ", "CAMILA ROJAS"],
      22: ["BASTIAN CORDOVA", "BENJAMIN ROJAS", "DAVID CORTES"],
      23: ["LUCIANO RAMOS", "FRANCO MILOS", "CECILIA YEPEZ"],
      24: ["CAROLINA MADARIAGA", "HENRY PATIÑO"],
      27: ["RODRIGO PIZARRO", "GABRIELA CUELLO", "VICTOR VEGA"],
      28: ["CAMILA ROJAS", "ROMINA LOPEZ"],
      29: ["DAVID CORTES", "BASTIAN CORDOVA", "BENJAMIN ROJAS"],
      30: ["CECILIA YEPEZ", "LUCIANO RAMOS", "FRANCO MILOS"]
    },
    4: { // May (0-indexed)
      4: ["VICTOR VEGA", "SOFIA ROJAS"],
      5: ["GABRIELA CUELLO", "CAMILA ROJAS"],
      6: ["HENRY PATIÑO", "DAVID CORTES"],
      7: ["LUCIANO RAMOS", "CECILIA YEPEZ"],
      8: ["ABBY ROJAS", "CAROLINA MADARIAGA"],
      11: ["SOFIA ROJAS", "VICTOR VEGA"],
      12: ["CAMILA ROJAS", "GABRIELA CUELLO"],
      13: ["DAVID CORTES", "HENRY PATIÑO"],
      14: ["ABBY ROJAS", "LUCIANO RAMOS"],
      15: ["BASTIAN CORDOVA", "CAROLINA MADARIAGA"],
      18: ["VICTOR VEGA", "SOFIA ROJAS"],
      19: ["GABRIELA CUELLO", "CAMILA ROJAS"],
      20: ["HENRY PATIÑO", "DAVID CORTES"],
      21: [],
      22: ["CAROLINA MADARIAGA", "ABBY ROJAS", "BASTIAN CORDOVA"],
      25: ["SOFIA ROJAS", "VICTOR VEGA"],
      26: ["CAMILA ROJAS", "GABRIELA CUELLO"],
      27: ["DAVID CORTES", "HENRY PATIÑO"],
      28: ["CECILIA YEPEZ", "LUCIANO RAMOS"],
      29: ["ABBY ROJAS", "BASTIAN CORDOVA", "CAROLINA MADARIAGA"]
    },
    5: { // June (0-indexed)
      1: ["VICTOR VEGA", "SOFIA ROJAS"],
      2: ["GABRIELA CUELLO", "CAMILA ROJAS"],
      3: ["HENRY PATIÑO", "DAVID CORTES"],
      4: ["LUCIANO RAMOS", "CECILIA YEPEZ"],
      5: ["CAROLINA MADARIAGA", "ABBY ROJAS"],
      8: ["SOFIA ROJAS", "VICTOR VEGA"],
      9: ["CAMILA ROJAS", "GABRIELA CUELLO"],
      10: ["DAVID CORTES", "HENRY PATIÑO"],
      11: ["CECILIA YEPEZ", "LUCIANO RAMOS"],
      12: ["ABBY ROJAS", "CAROLINA MADARIAGA"],
      15: ["VICTOR VEGA", "SOFIA ROJAS"],
      16: ["GABRIELA CUELLO", "CAMILA ROJAS"],
      17: ["HENRY PATIÑO", "DAVID CORTES"],
      18: ["LUCIANO RAMOS", "CECILIA YEPEZ"],
      19: ["CAROLINA MADARIAGA", "ABBY ROJAS"],
      22: ["SOFIA ROJAS", "VICTOR VEGA"],
      23: ["CAMILA ROJAS", "GABRIELA CUELLO"],
      24: ["DAVID CORTES", "HENRY PATIÑO"],
      25: ["CECILIA YEPEZ", "LUCIANO RAMOS"],
      26: ["ABBY ROJAS", "CAROLINA MADARIAGA"],
      29: [],
      30: ["GABRIELA CUELLO", "CAMILA ROJAS"]
    },
    6: { // July (0-indexed)
      // Week 1: Jun 30 – Jul 3
      1: ["HENRY PATIÑO", "DAVID CORTES"],
      2: ["LUCIANO RAMOS", "CECILIA YEPEZ"],
      3: [],                                   // VIE: CONTINUIDAD DRA. CAMILA ROJAS
      4: [],                                   // Sábado
      5: [],                                   // Domingo
      // Week 2: Jul 6–10
      6: ["ABBY ROJAS", "SOFIA ROJAS"],
      7: ["CAMILA ROJAS", "GABRIELA CUELLO"],
      8: ["DAVID CORTES", "HENRY PATIÑO"],
      9: ["SOFIA ROJAS"],                       // JUE: REUNIÓN COMUNAL / CONTINUIDAD DRA. GARCIA
      10: [],                                  // VIE: REUNIÓN ESTAMENTO / CONTINUIDAD DR. B. ROJAS
      11: [],                                  // Sábado
      12: [],                                  // Domingo
      // Week 3: Jul 13–17
      13: ["SOFIA ROJAS", "ABBY ROJAS"],
      14: ["GABRIELA CUELLO", "CAMILA ROJAS"],
      15: ["HENRY PATIÑO", "DAVID CORTES"],
      16: [],                                  // JUE: FERIADO
      17: [],                                  // VIE: CONTINUIDAD DR. PIZARRO
      18: [],                                  // Sábado
      19: [],                                  // Domingo
      // Week 4: Jul 20–24
      20: ["VICTOR VEGA", "SOFIA ROJAS"],
      21: ["CAMILA ROJAS", "GABRIELA CUELLO"],
      22: ["DAVID CORTES", "HENRY PATIÑO"],
      23: ["LUCIANO RAMOS", "CECILIA YEPEZ"],
      24: [],                                  // VIE: CONTINUIDAD DRA. CUELLO / REUNIÓN SALUD MENTAL
      25: [],                                  // Sábado
      26: [],                                  // Domingo
      // Week 5: Jul 27–31
      27: ["SOFIA ROJAS", "VICTOR VEGA"],
      28: ["GABRIELA CUELLO", "CAMILA ROJAS"],
      29: ["HENRY PATIÑO", "DAVID CORTES"],
      30: ["CECILIA YEPEZ", "LUCIANO RAMOS"],
      31: [],                                  // VIE: CONTINUIDAD DRA. YEPEZ
    },
    7: { // August (0-indexed)
      3: ["VICTOR VEGA", "SOFIA ROJAS"],
      4: ["CAMILA ROJAS", "GABRIELA CUELLO"],
      5: ["DAVID CORTES", "HENRY PATIÑO"],
      6: ["LUCIANO RAMOS", "CECILIA YEPEZ"],
      7: ["HENRY PATIÑO", "RODRIGO PIZARRO"],
      10: ["SOFIA ROJAS", "CAROLINA MADARIAGA"],
      11: ["GABRIELA CUELLO", "VICTOR VEGA"],
      12: ["HENRY PATIÑO", "DAVID CORTES"],
      13: ["CECILIA YEPEZ", "LUCIANO RAMOS"],
      14: ["LUCIANO RAMOS", "BASTIAN CORDOVA"],
      17: ["CARO MADARIAGA", "SOFIA ROJAS"],
      18: ["VICTOR VEGA", "GABRIELA CUELLO"],
      19: ["DAVID CORTES", "HENRY PATIÑO"],
      20: ["SOFIA ROJAS"],
      21: ["ABBY ROJAS"],
      24: ["SOFIA ROJAS", "CARO MADARIAGA"],
      25: ["GABRIELA CUELLO", "VICTOR VEGA"],
      26: ["HENRY PATIÑO", "DAVID CORTES"],
      27: ["LUCIANO RAMOS", "CECILIA YEPEZ"],
      28: ["FRANCO MILOS", "BENJAMIN ROJAS"],
      31: ["CARO MADARIAGA", "SOFIA ROJAS"]
    },
    8: { // September (0-indexed)
      1: ["VICTOR VEGA", "GABRIELA CUELLO"],
      2: ["DAVID CORTES", "HENRY PATIÑO"],
      3: ["CECILIA YEPEZ", "LUCIANO RAMOS"],
      4: ["GABRIELA CUELLO", "VICTOR VEGA"],
      7: ["SOFIA ROJAS", "CAROLINA MADARIAGA"],
      8: ["GABRIELA CUELLO", "CAMILA ROJAS"],
      9: ["HENRY PATIÑO", "DAVID CORTES"],
      10: ["LUCIANO RAMOS", "CECILIA YEPEZ"],
      11: ["DAVID CORTES", "ROMINA LOPEZ"],
      14: ["CARO MADARIAGA", "SOFIA ROJAS"],
      15: ["CAMILA ROJAS", "GABRIELA CUELLO"],
      16: ["DAVID CORTES", "HENRY PATIÑO"],
      17: ["CECILIA YEPEZ", "LUCIANO RAMOS"],
      18: [],
      21: ["SOFIA ROJAS", "CARO MADARIAGA"],
      22: ["GABRIELA CUELLO", "CAMILA ROJAS"],
      23: ["HENRY PATIÑO", "DAVID CORTES"],
      24: ["LUCIANO RAMOS", "CECILIA YEPEZ"],
      25: ["RODRIGO PIZARRO", "SOFIA ROJAS"],
      28: ["CARO MADARIAGA", "SOFIA ROJAS"],
      29: ["CAMILA ROJAS", "GABRIELA CUELLO"],
      30: ["DAVID CORTES", "HENRY PATIÑO"]
    },
    9: { // October (0-indexed)
      1: ["CECILIA YEPEZ", "LUCIANO RAMOS"],
      2: ["VICTOR VEGA", "CAMILA ROJAS"]
    }
  }
};

const generateLegacyEvent = (idStr: string, year: number, month: number, day: number, title: string, noBackground: boolean = false): SpecialEvent[] => [{
  id: `legacy_${idStr}_${year}_${month}_${day}`,
  year,
  month,
  day,
  title,
  color: '#22c55e', // Default green
  startTime: '08:00',
  location: 'No especificada',
  invitees: ['all'],
  isPrivate: false,
  creator: 'system',
  noBackground
}];

export const specialEventsData: SpecialEventData = {
  2025: {
    5: { // June (0-indexed)
      25: generateLegacyEvent('1', 2025, 5, 25, "JORNADA APS"),
      26: generateLegacyEvent('2', 2025, 5, 26, "JORNADA APS"),
      27: generateLegacyEvent('3', 2025, 5, 27, "JORNADA APS"),
      28: generateLegacyEvent('4', 2025, 5, 28, "TORNEO KARTING COLMED"),
    },
    8: { // September (0-indexed)
      18: generateLegacyEvent('5', 2025, 8, 18, "¡FELICES FIESTAS PATRIAS!"),
      19: generateLegacyEvent('6', 2025, 8, 19, "¡FELICES FIESTAS PATRIAS!"),
      30: generateLegacyEvent('7', 2025, 8, 30, "AUTOCUIDADO GENERAL")
    },
    9: { // October (0-indexed)
      3: generateLegacyEvent('8', 2025, 9, 3, "OLIMPIADAS"),
      9: generateLegacyEvent('9', 2025, 9, 9, "OLIMPIADAS"),
      10: generateLegacyEvent('10', 2025, 9, 10, "OLIMPIADAS"),
      16: generateLegacyEvent('11', 2025, 9, 16, "OLIMPIADAS"),
      17: generateLegacyEvent('12', 2025, 9, 17, "OLIMPIADAS"),
      23: generateLegacyEvent('13', 2025, 9, 23, "OLIMPIADAS"),
      24: generateLegacyEvent('14', 2025, 9, 24, "OLIMPIADAS"),
      30: generateLegacyEvent('15', 2025, 9, 30, "OLIMPIADAS"),
      31: generateLegacyEvent('16', 2025, 9, 31, "DÍA DE TODOS LOS SANTOS")
    },
    10: { // November (0-indexed)
      7: generateLegacyEvent('17', 2025, 10, 7, "DÍA DE AMEDCO")
    },
    11: { // December (0-indexed)
      5: generateLegacyEvent('18', 2025, 11, 5, "DIA DEL MEDICO"),
      8: generateLegacyEvent('19', 2025, 11, 8, "INMACULADA CONCEPCIÓN"),
      25: generateLegacyEvent('20', 2025, 11, 25, "¡FELIZ NAVIDAD!")
    }
  },
  2026: {
    0: { // January (0-indexed)
      1: generateLegacyEvent('21', 2026, 0, 1, "¡FELIZ AÑO NUEVO!")
    },
    1: { // February (0-indexed)
    },
    2: { // March (0-indexed)
      6: generateLegacyEvent('22', 2026, 2, 6, "CONTINUIDAD: PIZARRO"),
      12: generateLegacyEvent('23', 2026, 2, 12, "REUNIÓN COMUNAL CONTINUIDAD: CÓRDOVA"),
      13: generateLegacyEvent('24', 2026, 2, 13, "CONTINUIDAD: PATIÑO"),
      20: generateLegacyEvent('25', 2026, 2, 20, "CONTINUIDAD: MADARIAGA"),
      26: generateLegacyEvent('26', 2026, 2, 26, "REUNION DELEGADOS"),
      27: generateLegacyEvent('27', 2026, 2, 27, "CONTINUIDAD: CUELLO")
    },
    3: { // April
      3: generateLegacyEvent('28', 2026, 3, 3, "FERIADO")
    },
    4: { // May
      1: generateLegacyEvent('33', 2026, 4, 1, "FERIADO"),
      8: generateLegacyEvent('34', 2026, 4, 8, "[C] S. ROJAS", true),
      15: generateLegacyEvent('36', 2026, 4, 15, "[C] G. OCHOA", true),
      21: generateLegacyEvent('37', 2026, 4, 21, "FERIADO"),
      22: generateLegacyEvent('38', 2026, 4, 22, "[C] R. PIZARRO", true),
      29: generateLegacyEvent('39', 2026, 4, 29, "[C] D. CORTÉS", true)
    },
    5: { // June
      5: generateLegacyEvent('40', 2026, 5, 5, "[C] GARCIA", true),
      12: generateLegacyEvent('41', 2026, 5, 12, "[C] PATIÑO", true),
      19: generateLegacyEvent('42', 2026, 5, 19, "[C] RAMOS", true),
      26: generateLegacyEvent('43', 2026, 5, 26, "[C] ROJAS", true),
      29: generateLegacyEvent('44', 2026, 5, 29, "FERIADO")
    },
    6: { // July
      3:  generateLegacyEvent('46', 2026, 6,  3, "CONTINUIDAD: DRA. C. ROJAS", true),
      9:  generateLegacyEvent('47', 2026, 6,  9, "REUNIÓN COMUNAL · CONTINUIDAD: DRA. GARCIA"),
      10: generateLegacyEvent('48', 2026, 6, 10, "CONTINUIDAD: DR. B. ROJAS", true),
      16: generateLegacyEvent('49', 2026, 6, 16, "FERIADO"),
      17: generateLegacyEvent('50', 2026, 6, 17, "CONTINUIDAD: DR. PIZARRO", true),
      24: generateLegacyEvent('51', 2026, 6, 24, "CONTINUIDAD: DRA. CUELLO", true),
      31: generateLegacyEvent('52', 2026, 6, 31, "CONTINUIDAD: DRA. YEPEZ", true),
    },
    7: { // August
      7:  generateLegacyEvent('53', 2026, 7, 7, "CONTINUIDAD: DR. VEGA", true),
      14: generateLegacyEvent('54', 2026, 7, 14, "CONTINUIDAD: DRA. LOPEZ", true),
      20: generateLegacyEvent('55', 2026, 7, 20, "JORNADA AMEDCO"),
      21: generateLegacyEvent('56', 2026, 7, 21, "JORNADA AMEDCO"),
      28: generateLegacyEvent('57', 2026, 7, 28, "CONTINUIDAD: DR. CORTES", true),
    },
    8: { // September
      4:  generateLegacyEvent('58', 2026, 8, 4, "CONTINUIDAD: DRA. ABBY ROJAS", true),
      10: generateLegacyEvent('59', 2026, 8, 10, "REUNION COMUNAL ESTAMENTO · DR. CORTÉS"),
      11: generateLegacyEvent('60', 2026, 8, 11, "CONTINUIDAD: DR. MILOS", true),
      18: generateLegacyEvent('61', 2026, 8, 18, "FERIADO"),
      25: generateLegacyEvent('62', 2026, 8, 25, "CONTINUIDAD: DRA. OCHOA", true),
    },
    9: { // October
      2:  generateLegacyEvent('63', 2026, 9, 2, "CONTINUIDAD: DRA. GARCIA", true),
    }
  }
};
