import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Colección Firestore para el historial de partidas
const HISTORY_COL = 'sudoku_history_v2';
const LEADERBOARD_COL = 'sudoku_leaderboard_v2';
const LS = 'sudoku_v3_scoring_';

export interface SudokuRecord {
  id: string;
  name: string;
  dateKey: string; // 'YYYY-MM-DD'
  dateStr: string;
  completedAtTimestamp: number;
  mistakesCount: number;
  timeMs: number;
  isSuccess: boolean;
  baseScore: number; // 150 (0 err), 100 (1 err), 50 (2 err), -50 (3 err)
}

/**
 * Calcula el puntaje base de un sudoku según las reglas:
 * - 0 errores: 150 puntos
 * - 1 error: 100 puntos
 * - 2 errores: 50 puntos
 * - 3 errores (partida cerrada): -50 puntos
 */
export function calculateBaseScore(isSuccess: boolean, mistakes: number): number {
  if (!isSuccess || mistakes >= 3) return -50;
  if (mistakes === 0) return 150;
  if (mistakes === 1) return 100;
  if (mistakes === 2) return 50;
  return -50;
}

export function formatMonthName(monthKey: string): string {
  if (!monthKey || monthKey.length < 7) return monthKey;
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month)) return monthKey;
  const date = new Date(year, month - 1, 1);
  const name = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatTime(ms: number): string {
  if (!ms || ms < 0) return '--:--';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * SUDOKU BASE DIFICULTAD MEDIA-FÁCIL
 * Solución única y 100% verificada.
 */
const PUZZLE_EASY_2_5 = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

const SOLUTION_EASY_2_5 = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface AutomaticTranscriberProps {
  loggedInUser?: { fullName: string; profession: string } | null;
  profilePictureUrl?: string;
  profileName?: string;
}

const AutomaticTranscriber: React.FC<AutomaticTranscriberProps> = ({ loggedInUser, profileName }) => {
  const currentDayKey = getTodayDateStr();

  // Pestaña activa del Cuadro de Honor: 'hoy' | 'ranking' | 'historico'
  const [leaderboardTab, setLeaderboardTab] = useState<'hoy' | 'ranking' | 'historico'>('hoy');
  
  // Historial completo de partidas cargadas desde Firestore / LocalStorage
  const [dailyHistory, setDailyHistory] = useState<SudokuRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LS}history_cache`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Tablero activo y solución (permite generar variantes para jugar múltiples veces)
  const [activePuzzle, setActivePuzzle] = useState<number[][]>(() => PUZZLE_EASY_2_5.map(row => [...row]));
  const [activeSolution, setActiveSolution] = useState<number[][]>(() => SOLUTION_EASY_2_5.map(row => [...row]));

  // Estados de la partida activa
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finalTimeMs, setFinalTimeMs] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [mistakes, setMistakes] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [board, setBoard] = useState<number[][]>(() => PUZZLE_EASY_2_5.map(row => [...row]));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [highlightedNum, setHighlightedNum] = useState<number | null>(null);
  const [showFloatingSuccess, setShowFloatingSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Resultado de la última partida terminada
  const [lastGameResult, setLastGameResult] = useState<{
    isSuccess: boolean;
    mistakesCount: number;
    timeMs: number;
    baseScore: number;
    bonus: number;
    totalScore: number;
    isBestTime: boolean;
  } | null>(null);

  const isStarted = startedAt !== null;
  const isRunning = isStarted && !isCompleted && !isGameOver;
  const elapsedMs = finalTimeMs !== null ? finalTimeMs : startedAt !== null ? Math.max(0, now - startedAt) : 0;

  // Tick del timer
  useEffect(() => {
    if (!isRunning) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [isRunning]);

  // Suscripción en tiempo real a Firebase Firestore para el historial de partidas
  useEffect(() => {
    try {
      const historyColRef = collection(db, HISTORY_COL);
      const unsubscribeHistory = onSnapshot(historyColRef, (snapshot) => {
        const records: SudokuRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && d.name && d.dateKey) {
            const mistakesCount = typeof d.mistakesCount === 'number' ? d.mistakesCount : 0;
            const isSuccess = d.isSuccess !== undefined ? Boolean(d.isSuccess) : mistakesCount < 3;
            const baseScore = typeof d.baseScore === 'number' ? d.baseScore : calculateBaseScore(isSuccess, mistakesCount);

            records.push({
              id: docSnap.id,
              name: d.name,
              dateKey: d.dateKey,
              dateStr: d.dateStr || d.dateKey,
              completedAtTimestamp: d.completedAtTimestamp || 0,
              mistakesCount,
              timeMs: typeof d.timeMs === 'number' ? d.timeMs : 0,
              isSuccess,
              baseScore
            });
          }
        });

        setDailyHistory(records);
        try {
          localStorage.setItem(`${LS}history_cache`, JSON.stringify(records));
        } catch {}
      }, (err) => {
        console.warn('Error cargando historial de partidas de Sudoku:', err);
      });

      return () => unsubscribeHistory();
    } catch (err) {
      console.warn('Firestore subscription fallback:', err);
    }
  }, []);

  /**
   * Identifica el mejor tiempo completado de cada día.
   * Regla de negocio: "ser el mejor tiempo del día le dará al sudoku completado 50 puntos adicionales por ser el primer podio. los demás puestos no tendrán bonificación de puntaje por tiempo."
   */
  const dailyBestRecordIdMap = useMemo(() => {
    const map = new Map<string, { id: string; minTime: number }>();
    dailyHistory.forEach(r => {
      if (r.isSuccess && r.timeMs > 0) {
        const existing = map.get(r.dateKey);
        if (!existing || r.timeMs < existing.minTime) {
          map.set(r.dateKey, { id: r.id, minTime: r.timeMs });
        }
      }
    });
    const idMap = new Map<string, string>();
    map.forEach((val, key) => idMap.set(key, val.id));
    return idMap;
  }, [dailyHistory]);

  /**
   * Pestaña "Hoy": Muestra los puntajes del día actual ordenados de MEJOR a PEOR.
   * Muestra todos los puntajes, independiente de si fue exitoso o no (incluyendo 3 errores con -50 pts).
   */
  const todaysGames = useMemo(() => {
    return dailyHistory
      .filter(r => r.dateKey === currentDayKey)
      .map(r => {
        const isBestTime = r.isSuccess && dailyBestRecordIdMap.get(r.dateKey) === r.id;
        const totalScore = r.baseScore + (isBestTime ? 50 : 0);
        return {
          ...r,
          isBestTime,
          totalScore
        };
      })
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if (a.isSuccess !== b.isSuccess) return a.isSuccess ? -1 : 1;
        return a.timeMs - b.timeMs;
      });
  }, [dailyHistory, currentDayKey, dailyBestRecordIdMap]);

  /**
   * Pestaña "Ranking": Muestra el puntaje acumulativo de todos los sudoku del mes actual (desde el 1º al último día).
   * Suma todas las partidas jugadas en el mes (incluye 150/100/50 + bono 50 por mejor tiempo, y descuenta -50 por fallidos).
   */
  const monthlyRanking = useMemo(() => {
    const currentMonthPrefix = currentDayKey.substring(0, 7); // 'YYYY-MM'
    const map = new Map<string, {
      name: string;
      totalScore: number;
      completedCount: number;
      failedCount: number;
      totalGames: number;
      bestTimeMs: number;
    }>();

    dailyHistory.forEach(r => {
      if (r.dateKey && r.dateKey.startsWith(currentMonthPrefix)) {
        const isBestTime = r.isSuccess && dailyBestRecordIdMap.get(r.dateKey) === r.id;
        const score = r.baseScore + (isBestTime ? 50 : 0);

        const existing = map.get(r.name);
        if (!existing) {
          map.set(r.name, {
            name: r.name,
            totalScore: score,
            completedCount: r.isSuccess ? 1 : 0,
            failedCount: r.isSuccess ? 0 : 1,
            totalGames: 1,
            bestTimeMs: r.isSuccess ? r.timeMs : 0
          });
        } else {
          existing.totalScore += score;
          if (r.isSuccess) {
            existing.completedCount += 1;
            if (existing.bestTimeMs === 0 || r.timeMs < existing.bestTimeMs) {
              existing.bestTimeMs = r.timeMs;
            }
          } else {
            existing.failedCount += 1;
          }
          existing.totalGames += 1;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
      return (a.bestTimeMs || 9999999) - (b.bestTimeMs || 9999999);
    });
  }, [dailyHistory, currentDayKey, dailyBestRecordIdMap]);

  /**
   * Pestaña "Histórico": Muestra el puntaje total acumulado desde el inicio de los tiempos.
   */
  const allTimeRanking = useMemo(() => {
    const map = new Map<string, {
      name: string;
      totalScore: number;
      completedCount: number;
      failedCount: number;
      totalGames: number;
      bestTimeMs: number;
    }>();

    dailyHistory.forEach(r => {
      const isBestTime = r.isSuccess && dailyBestRecordIdMap.get(r.dateKey) === r.id;
      const score = r.baseScore + (isBestTime ? 50 : 0);

      const existing = map.get(r.name);
      if (!existing) {
        map.set(r.name, {
          name: r.name,
          totalScore: score,
          completedCount: r.isSuccess ? 1 : 0,
          failedCount: r.isSuccess ? 0 : 1,
          totalGames: 1,
          bestTimeMs: r.isSuccess ? r.timeMs : 0
        });
      } else {
        existing.totalScore += score;
        if (r.isSuccess) {
          existing.completedCount += 1;
          if (existing.bestTimeMs === 0 || r.timeMs < existing.bestTimeMs) {
            existing.bestTimeMs = r.timeMs;
          }
        } else {
          existing.failedCount += 1;
        }
        existing.totalGames += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
      return (a.bestTimeMs || 9999999) - (b.bestTimeMs || 9999999);
    });
  }, [dailyHistory, dailyBestRecordIdMap]);

  const handleStart = () => {
    if (isStarted || isCompleted || isGameOver) return;
    const t = Date.now();
    setStartedAt(t);
    setNow(t);
  };

  const stopTimer = (): number => {
    const total = startedAt !== null ? Math.max(0, Date.now() - startedAt) : 0;
    setFinalTimeMs(total);
    return total;
  };

  /**
   * Inicia una nueva partida con permutación de dígitos para que el tablero sea variado y fresco.
   */
  const startNewGame = () => {
    const perm = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    const mapVal = (v: number) => (v === 0 ? 0 : perm[v - 1]);

    const newPuzzle = PUZZLE_EASY_2_5.map(row => row.map(mapVal));
    const newSolution = SOLUTION_EASY_2_5.map(row => row.map(mapVal));

    setActivePuzzle(newPuzzle);
    setActiveSolution(newSolution);
    setBoard(newPuzzle.map(r => [...r]));
    setSelectedCell(null);
    setHighlightedNum(null);
    setMistakes(0);
    setIsGameOver(false);
    setIsCompleted(false);
    setLastGameResult(null);

    const t = Date.now();
    setStartedAt(t);
    setNow(t);
    setFinalTimeMs(null);
  };

  /**
   * Guarda el resultado de la partida tanto en Firestore como en memoria local.
   */
  const recordGameResult = async (isSuccess: boolean, finalMistakes: number, timeMs: number) => {
    const baseScore = calculateBaseScore(isSuccess, finalMistakes);
    const userName = profileName || loggedInUser?.fullName || 'Usuario Médico';
    const nowObj = new Date();
    const dateStr = nowObj.toISOString().split('T')[0];
    const timestamp = nowObj.getTime();
    const docId = userName.replace(/[\/\#\$\.\[\]]/g, '_').trim().toLowerCase();
    const gameDocId = `${currentDayKey}_${docId}_${timestamp}`;

    const newRecord: SudokuRecord = {
      id: gameDocId,
      name: userName,
      dateKey: currentDayKey,
      dateStr,
      completedAtTimestamp: timestamp,
      mistakesCount: finalMistakes,
      timeMs,
      isSuccess,
      baseScore
    };

    // Actualización inmediata del estado local para feedback en tiempo real
    setDailyHistory(prev => [newRecord, ...prev]);

    // Persistir en Firestore
    try {
      await setDoc(doc(db, HISTORY_COL, gameDocId), {
        ...newRecord,
        createdAt: serverTimestamp()
      }, { merge: true });

      // Actualizar también resumen en LEADERBOARD_COL para mantener compatibilidad
      const userRef = doc(db, LEADERBOARD_COL, docId);
      await setDoc(userRef, {
        name: userName,
        lastCompletedDay: currentDayKey,
        lastTimeMs: timeMs,
        lastMistakesCount: finalMistakes,
        lastScore: baseScore,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Error registrando partida en Firestore:', err);
    }
  };

  // Manejar teclado físico (1-9 y Backspace/Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || isCompleted || isGameOver || !isStarted) return;
      const [r, c] = selectedCell;
      if (activePuzzle[r][c] !== 0) return;

      if (e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key, 10);
        updateCellValue(r, c, num);
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        updateCellValue(r, c, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, board, isCompleted, isGameOver, mistakes, isStarted, activePuzzle, activeSolution]);

  const updateCellValue = (r: number, c: number, num: number) => {
    if (activePuzzle[r][c] !== 0 || isGameOver || isCompleted || !isStarted) return;

    if (num === 0) {
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = 0;
      setBoard(newBoard);
      return;
    }

    const expected = activeSolution[r][c];

    if (num !== expected) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);

      if (newMistakes >= 3) {
        const timeMs = stopTimer();
        setIsGameOver(true);
        setLastGameResult({
          isSuccess: false,
          mistakesCount: 3,
          timeMs,
          baseScore: -50,
          bonus: 0,
          totalScore: -50,
          isBestTime: false
        });
        recordGameResult(false, 3, timeMs);
      }
      return;
    }

    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);
    setHighlightedNum(num);

    checkCompletion(newBoard);
  };

  const handleCellClick = (r: number, c: number) => {
    if (isGameOver || !isStarted || isCompleted) return;
    setSelectedCell([r, c]);
    const clickedValue = board[r][c];
    if (clickedValue !== 0) {
      setHighlightedNum(clickedValue);
    }
  };

  const handleClearBoard = () => {
    if (isGameOver || isCompleted || !isStarted) return;
    const initialBoard = activePuzzle.map(row => [...row]);
    setBoard(initialBoard);
    setSelectedCell(null);
    setHighlightedNum(null);
  };

  const checkCompletion = (currentBoard: number[][]) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c] === 0) return;
      }
    }

    let isValid = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c] !== activeSolution[r][c]) {
          isValid = false;
        }
      }
    }

    if (isValid) {
      const timeMs = stopTimer();
      setIsCompleted(true);

      const baseScore = calculateBaseScore(true, mistakes);
      
      // Evaluar si es el mejor tiempo del día entre los exitosos de hoy
      const currentBestTime = todaysGames.find(g => g.isSuccess)?.timeMs;
      const isBest = !currentBestTime || timeMs <= currentBestTime;
      const bonus = isBest ? 50 : 0;
      const totalScore = baseScore + bonus;

      setLastGameResult({
        isSuccess: true,
        mistakesCount: mistakes,
        timeMs,
        baseScore,
        bonus,
        totalScore,
        isBestTime: isBest
      });

      setSuccessMessage(`¡Sudoku completado en ${formatTime(timeMs)}! +${totalScore} pts${isBest ? ' (🥇 Mejor tiempo: +50 pts)' : ''}`);
      setShowFloatingSuccess(true);
      setTimeout(() => setShowFloatingSuccess(false), 4500);

      recordGameResult(true, mistakes, timeMs);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col gap-3 relative">
      {/* MENSAJE FLOTANTE BREVE DE ÉXITO */}
      {showFloatingSuccess && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-lg font-bold text-xs flex items-center gap-2 animate-bounce">
          <span>🎉</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* ENCABEZADO SUPERIOR */}
      <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
            🧩
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              SUDOKU DIARIO
            </h3>
            {isCompleted ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                ✓ Completado
              </span>
            ) : isGameOver ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300">
                ✕ 3 Errores (-50 pts)
              </span>
            ) : isStarted ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                Partida en curso
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startNewGame}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            title="Iniciar un nuevo Sudoku para seguir sumando puntos"
          >
            <span>🔄</span>
            <span>Nuevo Sudoku</span>
          </button>

          {/* BOTÓN PARA LIMPIAR CELDAS INGRESADAS */}
          <button
            onClick={handleClearBoard}
            disabled={isGameOver || isCompleted || !isStarted}
            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all cursor-pointer flex items-center justify-center shadow-2xs disabled:opacity-40 shrink-0"
            title="Borrar valores ingresados y reiniciar tablero"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* CUERPO DEL BLOQUE: TAMAÑO AJUSTADO AL FRAME SIN DESBORDAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start w-full min-w-0">
        {/* LADO IZQUIERDO: GRILLA SUDOKU AJUSTADA A SU FRAME */}
        <div className="w-full flex flex-col items-center justify-start min-w-0">
          <div className="relative w-full max-w-[280px] sm:max-w-[290px] aspect-square mx-auto shrink-0">
            {/* OVERLAY CUANDO LA PARTIDA SE COMPLETA */}
            {isCompleted && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs z-40 flex flex-col items-center justify-center p-3 text-center text-white space-y-2 rounded-xl animate-fadeIn">
                <span className="text-3xl animate-bounce">🏆</span>
                <h3 className="text-sm font-extrabold text-emerald-400">¡Sudoku Completado!</h3>
                {finalTimeMs !== null && (
                  <p className="font-mono text-lg font-black text-white tracking-wider">⏱ {formatTime(finalTimeMs)}</p>
                )}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-sm font-black text-amber-300">
                    +{lastGameResult?.totalScore ?? (mistakes === 0 ? 150 : mistakes === 1 ? 100 : 50)} Puntos
                  </span>
                  <span className="text-[10px] text-slate-300">
                    {mistakes === 0 ? 'Sin errores (150 pts)' : mistakes === 1 ? '1 error (100 pts)' : '2 errores (50 pts)'}
                    {lastGameResult?.isBestTime ? ' • 🥇 Mejor tiempo (+50 pts)' : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={startNewGame}
                  className="mt-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-extrabold text-xs shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>🔄</span>
                  <span>Jugar otro Sudoku</span>
                </button>
              </div>
            )}

            {/* OVERLAY CUANDO PIERDE POR 3 ERRORES */}
            {isGameOver && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs z-40 flex flex-col items-center justify-center p-3 text-center text-white space-y-2 rounded-xl animate-fadeIn">
                <span className="text-3xl animate-bounce">❌</span>
                <h3 className="text-sm font-extrabold text-red-400">¡3 Errores Cometidos!</h3>
                {finalTimeMs !== null && (
                  <p className="font-mono text-base font-bold text-slate-300">⏱ {formatTime(finalTimeMs)}</p>
                )}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs font-black text-red-300 bg-red-950/60 px-2.5 py-0.5 rounded-md border border-red-500/40">
                    -50 Puntos de Penalización
                  </span>
                  <span className="text-[10px] text-slate-300 max-w-[220px] leading-tight">
                    Sudoku cerrado y 50 pts descontados de tu acumulado.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={startNewGame}
                  className="mt-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-white font-extrabold text-xs shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>🔄</span>
                  <span>Jugar nuevo Sudoku</span>
                </button>
              </div>
            )}

            {/* OVERLAY DE INICIO */}
            {!isStarted && !isCompleted && !isGameOver && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md z-40 flex flex-col items-center justify-center p-3 text-center text-white space-y-2 rounded-xl animate-fadeIn">
                <span className="text-3xl">⏱️</span>
                <h3 className="text-sm font-extrabold">¿List@ para jugar?</h3>
                <div className="bg-slate-800/90 rounded-xl p-2 text-[10px] text-slate-200 border border-slate-700/80 w-full max-w-[220px] text-left space-y-0.5 shadow-md">
                  <div className="flex justify-between"><span>• Sin errores:</span> <b className="text-emerald-400">+150 pts</b></div>
                  <div className="flex justify-between"><span>• 1 error:</span> <b className="text-sky-400">+100 pts</b></div>
                  <div className="flex justify-between"><span>• 2 errores:</span> <b className="text-amber-400">+50 pts</b></div>
                  <div className="flex justify-between"><span>• 3 errores:</span> <b className="text-red-400">-50 pts</b></div>
                  <div className="flex justify-between border-t border-slate-700/80 pt-0.5"><span>• 🥇 Mejor tiempo:</span> <b className="text-amber-300">+50 pts</b></div>
                </div>
                <button
                  id="sudoku-start-button"
                  type="button"
                  onClick={handleStart}
                  className="mt-0.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-extrabold text-xs shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  Iniciar Sudoku
                </button>
              </div>
            )}

            {/* GRILLA SUDOKU */}
            <div className="w-full h-full rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-300 shadow-xs flex">
              <div className="grid grid-cols-9 grid-rows-9 gap-[1px] bg-slate-300 w-full h-full p-0">
                {board.map((row, r) =>
                  row.map((val, c) => {
                    const isOriginal = activePuzzle[r][c] !== 0;
                    const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                    const isMatchHighlight = val !== 0 && val === highlightedNum;
                    const isBorderRight = (c + 1) % 3 === 0 && c < 8;
                    const isBorderBottom = (r + 1) % 3 === 0 && r < 8;

                    return (
                      <button
                        key={`${r}-${c}`}
                        disabled={isGameOver || isCompleted || !isStarted}
                        onClick={() => handleCellClick(r, c)}
                        className={`flex items-center justify-center font-sans font-bold text-sm sm:text-base transition-colors p-0 m-0 w-full h-full leading-none select-none ${
                          isMatchHighlight
                            ? 'bg-amber-300 text-amber-950 shadow-inner'
                            : isOriginal
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-white text-sky-600'
                        } ${isSelected ? 'ring-2 ring-sky-500 ring-inset z-10 bg-sky-50' : 'hover:bg-slate-50'} ${
                          isBorderRight ? 'border-r-2 border-r-slate-700' : ''
                        } ${isBorderBottom ? 'border-b-2 border-b-slate-700' : ''}`}
                      >
                        {val !== 0 ? val : ''}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* TECLADO NUMÉRICO RÁPIDO PARA PANTALLAS TÁCTILES O RATÓN */}
          <div className="flex items-center justify-center gap-1 mt-2 w-full max-w-[280px] sm:max-w-[290px] mx-auto shrink-0">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                disabled={isGameOver || isCompleted || !isStarted || !selectedCell || activePuzzle[selectedCell[0]][selectedCell[1]] !== 0}
                onClick={() => {
                  if (selectedCell) {
                    updateCellValue(selectedCell[0], selectedCell[1], num);
                  }
                }}
                className="flex-1 py-1 rounded bg-slate-100 hover:bg-sky-100 text-slate-800 hover:text-sky-800 font-black text-xs border border-slate-300 shadow-2xs transition active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              disabled={isGameOver || isCompleted || !isStarted || !selectedCell || activePuzzle[selectedCell[0]][selectedCell[1]] !== 0}
              onClick={() => {
                if (selectedCell) {
                  updateCellValue(selectedCell[0], selectedCell[1], 0);
                }
              }}
              className="px-1.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs border border-red-200 shadow-2xs transition active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Borrar número de la celda"
            >
              ⌫
            </button>
          </div>
        </div>

        {/* LADO DERECHO: CRONÓMETRO, ERRORES Y CUADRO DE HONOR */}
        <div className="w-full flex flex-col justify-start space-y-2 min-w-0">
          {/* CRONÓMETRO */}
          <div className={`flex items-center justify-between p-2 rounded-xl border text-xs shrink-0 transition-colors ${
            isRunning ? 'bg-sky-50 border-sky-200' : isCompleted ? 'bg-emerald-50 border-emerald-200' : isGameOver ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1.5">
              {isRunning && <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />}
              Tiempo:
            </span>
            <span id="sudoku-timer" className={`font-mono text-sm font-black tabular-nums ${
              isRunning ? 'text-sky-700' : isCompleted ? 'text-emerald-700' : isGameOver ? 'text-red-700' : 'text-slate-500'
            }`}>
              {isStarted ? formatTime(elapsedMs) : '00:00'}
            </span>
          </div>

          {/* INDICADOR DE ERRORES (MÁXIMO 3) */}
          <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs shrink-0">
            <span className="font-bold text-slate-700 text-[11px]">Errores:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(step => (
                <span
                  key={step}
                  className={`w-3.5 h-3.5 rounded-full text-[9px] font-black flex items-center justify-center ${
                    mistakes >= step ? 'bg-red-500 text-white shadow-2xs' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  ✕
                </span>
              ))}
              <span className={`ml-1 font-mono text-[10.5px] font-bold ${mistakes >= 3 ? 'text-red-600' : 'text-slate-600'}`}>
                {mistakes}/3 {mistakes >= 3 ? '(Cerrado)' : ''}
              </span>
            </div>
          </div>

          {/* CUADRO DE HONOR CON TAMAÑO FIJO Y SCROLL */}
          <div className="flex flex-col justify-start bg-slate-50/50 border border-slate-200/60 rounded-xl p-2 min-w-0">
            <div className="flex flex-col gap-1 border-b border-slate-200/70 pb-1.5 mb-1 shrink-0">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                🏆 CUADRO DE HONOR
              </span>
              {/* TABS: HOY | RANKING | HISTÓRICO */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/70 text-[10px]">
                <button
                  type="button"
                  onClick={() => setLeaderboardTab('hoy')}
                  className={`py-1 rounded font-bold transition-all cursor-pointer text-center ${
                    leaderboardTab === 'hoy' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setLeaderboardTab('ranking')}
                  className={`py-1 rounded font-bold transition-all cursor-pointer text-center ${
                    leaderboardTab === 'ranking' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Ranking
                </button>
                <button
                  type="button"
                  onClick={() => setLeaderboardTab('historico')}
                  className={`py-1 rounded font-bold transition-all cursor-pointer text-center ${
                    leaderboardTab === 'historico' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Histórico
                </button>
              </div>
            </div>

            <div className="space-y-1.5 h-[190px] overflow-y-auto custom-scrollbar pr-1">
              {/* TAB 1: HOY (Todas las partidas del día ordenadas del mejor al peor) */}
              {leaderboardTab === 'hoy' && (
                todaysGames.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-400 space-y-1">
                    <span className="text-2xl">⏳</span>
                    <p className="text-[11px] font-medium">Aún no hay partidas jugadas hoy.</p>
                    <p className="text-[10px] text-slate-400">¡Sé el primero en resolver el Sudoku de hoy!</p>
                  </div>
                ) : (
                  todaysGames.map((game, idx) => (
                    <div
                      key={game.id || idx}
                      className={`p-2 rounded-xl flex items-center justify-between text-xs shadow-2xs border transition-all ${
                        idx === 0 && game.isSuccess
                          ? 'bg-amber-50/70 border-amber-200/90'
                          : !game.isSuccess
                          ? 'bg-red-50/50 border-red-200/80'
                          : 'bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className={`w-4 h-4 rounded-full text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
                          idx === 0 && game.isSuccess
                            ? 'bg-amber-400 text-amber-950 shadow-xs'
                            : idx === 1 && game.isSuccess
                            ? 'bg-slate-300 text-slate-800'
                            : !game.isSuccess
                            ? 'bg-red-200 text-red-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-800 truncate text-[11.5px] leading-tight flex items-center gap-1">
                            {game.name}
                            {game.isBestTime && <span title="Primer Podio: Mejor tiempo del día (+50 pts)">🥇</span>}
                          </span>
                          <span className="text-[9px] text-slate-400 flex items-center gap-1 font-medium">
                            ⏱ {formatTime(game.timeMs)} • {
                              game.isSuccess
                                ? (game.mistakesCount === 0 ? 'Sin errores' : `${game.mistakesCount} error(es)`)
                                : '3 errores (Cerrado)'
                            }
                            {game.isBestTime && (
                              <span className="text-amber-600 font-bold ml-0.5">• 🥇 Mejor tiempo (+50 pts)</span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {game.totalScore >= 0 ? (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-300 font-black text-[10px] rounded-md inline-flex items-center gap-0.5 shadow-2xs">
                            ⭐ +{game.totalScore} pts
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-300 font-black text-[10px] rounded-md inline-flex items-center gap-0.5 shadow-2xs">
                            ✕ {game.totalScore} pts
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )
              )}

              {/* TAB 2: RANKING (Puntaje acumulativo del mes actual) */}
              {leaderboardTab === 'ranking' && (
                monthlyRanking.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-400 space-y-1">
                    <span className="text-2xl">⏳</span>
                    <p className="text-[11px] font-medium">Aún no hay puntajes acumulados este mes.</p>
                    <p className="text-[10px] text-slate-400">Mes: {formatMonthName(currentDayKey.substring(0, 7))}</p>
                  </div>
                ) : (
                  <>
                    <div className="text-[9px] font-bold text-slate-400 px-1 pb-1 flex justify-between items-center border-b border-slate-100">
                      <span>Mes: {formatMonthName(currentDayKey.substring(0, 7))}</span>
                      <span>Puntaje acumulado mensual</span>
                    </div>
                    {monthlyRanking.map((user, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl flex items-center justify-between text-xs shadow-2xs border transition-all ${
                          idx === 0
                            ? 'bg-amber-50/70 border-amber-200/90'
                            : idx === 1
                            ? 'bg-slate-100/70 border-slate-200'
                            : idx === 2
                            ? 'bg-orange-50/70 border-orange-200/80'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className={`w-4 h-4 rounded-full text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
                            idx === 0
                              ? 'bg-amber-400 text-amber-950 shadow-xs'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-800'
                              : idx === 2
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-800 truncate text-[11.5px] leading-tight flex items-center gap-1">
                              {user.name}
                              {idx === 0 && <span>🥇</span>}
                              {idx === 1 && <span>🥈</span>}
                              {idx === 2 && <span>🥉</span>}
                            </span>
                            <span className="text-[9px] text-slate-400 flex items-center gap-1 font-medium">
                              {user.completedCount} completado{user.completedCount !== 1 ? 's' : ''}
                              {user.failedCount > 0 ? ` • ${user.failedCount} fallido(s)` : ''}
                              {user.bestTimeMs > 0 ? ` • Mejor: ${formatTime(user.bestTimeMs)}` : ''}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`px-1.5 py-0.5 font-black text-[10px] rounded-md inline-flex items-center gap-0.5 border shadow-2xs ${
                            user.totalScore >= 0
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-red-50 text-red-700 border-red-300'
                          }`}>
                            ⭐ {user.totalScore} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )
              )}

              {/* TAB 3: HISTÓRICO (Puntaje total acumulado desde el inicio de los tiempos) */}
              {leaderboardTab === 'historico' && (
                allTimeRanking.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-400 space-y-1">
                    <span className="text-2xl">⏳</span>
                    <p className="text-[11px] font-medium">Aún no hay registros en el historial.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-[9px] font-bold text-slate-400 px-1 pb-1 flex justify-between items-center border-b border-slate-100">
                      <span>Histórico General</span>
                      <span>Puntaje total histórico</span>
                    </div>
                    {allTimeRanking.map((user, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl flex items-center justify-between text-xs shadow-2xs border transition-all ${
                          idx === 0
                            ? 'bg-amber-50/70 border-amber-200/90'
                            : idx === 1
                            ? 'bg-slate-100/70 border-slate-200'
                            : idx === 2
                            ? 'bg-orange-50/70 border-orange-200/80'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className={`w-4 h-4 rounded-full text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
                            idx === 0
                              ? 'bg-amber-400 text-amber-950 shadow-xs'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-800'
                              : idx === 2
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-800 truncate text-[11.5px] leading-tight flex items-center gap-1">
                              {user.name}
                              {idx === 0 && <span>🥇</span>}
                              {idx === 1 && <span>🥈</span>}
                              {idx === 2 && <span>🥉</span>}
                            </span>
                            <span className="text-[9px] text-slate-400 flex items-center gap-1 font-medium">
                              {user.completedCount} completado{user.completedCount !== 1 ? 's' : ''}
                              {user.failedCount > 0 ? ` • ${user.failedCount} fallido(s)` : ''}
                              {` • ${user.totalGames} partida(s)`}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`px-1.5 py-0.5 font-black text-[10px] rounded-md inline-flex items-center gap-0.5 border shadow-2xs ${
                            user.totalScore >= 0
                              ? 'bg-amber-100 text-amber-950 border-amber-300'
                              : 'bg-red-50 text-red-700 border-red-300'
                          }`}>
                            ⭐ {user.totalScore} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomaticTranscriber;
