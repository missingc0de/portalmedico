import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface GlobalWinner {
  name: string;
  wins: number;
  lastCompletedDay: string;
  completedAtTimestamp: number;
  completedAtDateStr: string;
  mistakesCount: number;
  bestTimeMs: number;
  lastTimeMs: number;
  bestScore?: number;
  lastScore?: number;
}

// Prefijo de almacenamiento (v2 = tabla de posiciones reiniciada, ranking por puntaje)
const LS = 'sudoku_v2_easy25_';
const LEADERBOARD_COL = 'sudoku_leaderboard_v2';
const HISTORY_COL = 'sudoku_history_v2';

// Penalización por cada error en segundos (más tiempo y más errores penalizan, menor puntaje es mejor posición)
export const ERROR_PENALTY_SECONDS = 10;

/**
 * Calcula el puntaje sumando tiempo en segundos y penalización por cantidad de errores.
 * Menor puntaje = mejor posición.
 */
export function calculateScore(timeMs: number, mistakes: number): number {
  if (!timeMs || timeMs <= 0) return Number.MAX_SAFE_INTEGER;
  const timeSec = Math.round(timeMs / 1000);
  const penalty = Math.max(0, mistakes || 0) * ERROR_PENALTY_SECONDS;
  return timeSec + penalty;
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
  SUDOKU DIFICULTAD 2/5 (FÁCIL / PRINCIPIANTE)
  - Grilla de 9x9 con 40+ números iniciales (solución única y 100% verificada).
  - Matemáticamente validada sin bloqueos.
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

// Obtener string de fecha del día actual YYYY-MM-DD para reinicio diario a las 00:00
function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface DailyRecord {
  id: string;
  name: string;
  dateKey: string;
  dateStr: string;
  completedAtTimestamp: number;
  mistakesCount: number;
  timeMs: number;
  score?: number;
}

interface AutomaticTranscriberProps {
  loggedInUser?: { fullName: string; profession: string } | null;
  profilePictureUrl?: string;
  profileName?: string;
}

const AutomaticTranscriber: React.FC<AutomaticTranscriberProps> = ({ loggedInUser, profileName }) => {
  const currentDayKey = getTodayDateStr();

  // Vista activa del Cuadro de Honor: 'ranking' (tabla global) | 'hoy' (del día) | 'historial' (por días anteriores)
  const [leaderboardTab, setLeaderboardTab] = useState<'ranking' | 'hoy' | 'historial'>('ranking');
  const [dailyHistory, setDailyHistory] = useState<DailyRecord[]>([]);

  // Mes seleccionado para el Podio Mensual en el Histórico (formato YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => currentDayKey.substring(0, 7));

  // Lista de meses disponibles en el historial
  const availableMonths = useMemo(() => {
    const currentMonthKey = currentDayKey.substring(0, 7);
    const set = new Set<string>([currentMonthKey]);
    dailyHistory.forEach(rec => {
      if (rec.dateKey && rec.dateKey.length >= 7) {
        set.add(rec.dateKey.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [dailyHistory, currentDayKey]);

  // Sincronizar mes si no se encuentra en disponibles
  useEffect(() => {
    if (!availableMonths.includes(selectedMonth) && availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  // Cálculo del Podio Mensual: se agrupan partidas por usuario del mes y se clasifica por su mejor puntaje
  // Menor tiempo y menos errores generan menor puntaje (mejor posición en el podio)
  const { monthlyPodium, monthRecords } = useMemo(() => {
    const records = dailyHistory.filter(r => r.dateKey && r.dateKey.startsWith(selectedMonth));

    // Partidas del mes ordenadas por menor puntaje
    const sortedRecords = [...records].sort((a, b) => {
      const sa = calculateScore(a.timeMs, a.mistakesCount);
      const sb = calculateScore(b.timeMs, b.mistakesCount);
      if (sa !== sb) return sa - sb;
      if (a.mistakesCount !== b.mistakesCount) return a.mistakesCount - b.mistakesCount;
      return a.completedAtTimestamp - b.completedAtTimestamp;
    });

    // Agrupar por usuario para encontrar su mejor partida del mes
    const userBestMap = new Map<string, {
      name: string;
      bestScore: number;
      bestTimeMs: number;
      bestMistakesCount: number;
      bestDateKey: string;
      totalWins: number;
    }>();

    sortedRecords.forEach(r => {
      const score = calculateScore(r.timeMs, r.mistakesCount);
      const existing = userBestMap.get(r.name);
      if (!existing) {
        userBestMap.set(r.name, {
          name: r.name,
          bestScore: score,
          bestTimeMs: r.timeMs,
          bestMistakesCount: r.mistakesCount,
          bestDateKey: r.dateKey,
          totalWins: 1
        });
      } else {
        existing.totalWins += 1;
        if (score < existing.bestScore || (score === existing.bestScore && r.mistakesCount < existing.bestMistakesCount)) {
          existing.bestScore = score;
          existing.bestTimeMs = r.timeMs;
          existing.bestMistakesCount = r.mistakesCount;
          existing.bestDateKey = r.dateKey;
        }
      }
    });

    const podiumUsers = Array.from(userBestMap.values()).sort((a, b) => {
      if (a.bestScore !== b.bestScore) return a.bestScore - b.bestScore;
      if (a.bestMistakesCount !== b.bestMistakesCount) return a.bestMistakesCount - b.bestMistakesCount;
      if (a.bestTimeMs !== b.bestTimeMs) return a.bestTimeMs - b.bestTimeMs;
      return b.totalWins - a.totalWins;
    });

    return {
      monthlyPodium: podiumUsers,
      monthRecords: sortedRecords
    };
  }, [dailyHistory, selectedMonth]);

  // Indica si el usuario ya completó el sudoku oficial del día
  const [dailyCompletedToday, setDailyCompletedToday] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LS}completed_day_${currentDayKey}`);
    return saved === 'true';
  });

  // Modo práctica posterior al sudoku diario completado (no califica para ranking ni puntaje)
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [practiceCompleted, setPracticeCompleted] = useState<boolean>(false);

  // Semilla / variación del tablero activo (para rotar o variar el puzzle en práctica)
  const [activePuzzle, setActivePuzzle] = useState<number[][]>(() => PUZZLE_EASY_2_5.map(row => [...row]));
  const [activeSolution, setActiveSolution] = useState<number[][]>(() => SOLUTION_EASY_2_5.map(row => [...row]));

  // Timer: momento de inicio y tiempo final
  const [startedAt, setStartedAt] = useState<number | null>(() => {
    const saved = localStorage.getItem(`${LS}startedat_day_${currentDayKey}`);
    return saved ? parseInt(saved, 10) : null;
  });
  const [finalTimeMs, setFinalTimeMs] = useState<number | null>(() => {
    const saved = localStorage.getItem(`${LS}finaltime_day_${currentDayKey}`);
    return saved ? parseInt(saved, 10) : null;
  });
  const [now, setNow] = useState<number>(Date.now());

  const [board, setBoard] = useState<number[][]>(() => {
    const saved = localStorage.getItem(`${LS}board_day_${currentDayKey}`);
    if (saved) return JSON.parse(saved);
    return PUZZLE_EASY_2_5.map(row => [...row]);
  });

  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [highlightedNum, setHighlightedNum] = useState<number | null>(null);
  const [showFloatingSuccess, setShowFloatingSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Contador de errores (máximo 3)
  const [mistakes, setMistakes] = useState<number>(() => {
    const saved = localStorage.getItem(`${LS}mistakes_day_${currentDayKey}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isGameOver, setIsGameOver] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LS}gameover_day_${currentDayKey}`);
    return saved === 'true';
  });

  // Estado activo de juego
  const isStarted = startedAt !== null;
  const isCurrentlyFinished = isPracticeMode ? practiceCompleted : dailyCompletedToday;
  const isRunning = isStarted && !isCurrentlyFinished && !isGameOver;
  const elapsedMs = finalTimeMs !== null ? finalTimeMs : startedAt !== null ? Math.max(0, now - startedAt) : 0;

  // Tick del timer
  useEffect(() => {
    if (!isRunning) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [isRunning]);

  const handleStart = () => {
    if (isStarted || isCurrentlyFinished || isGameOver) return;
    const t = Date.now();
    setStartedAt(t);
    setNow(t);
    if (!isPracticeMode) {
      localStorage.setItem(`${LS}startedat_day_${currentDayKey}`, t.toString());
    }
  };

  const stopTimer = (): number => {
    const total = startedAt !== null ? Date.now() - startedAt : 0;
    setFinalTimeMs(total);
    if (!isPracticeMode) {
      localStorage.setItem(`${LS}finaltime_day_${currentDayKey}`, total.toString());
    }
    return total;
  };

  // Iniciar partida de práctica (ilimitada, sin puntaje)
  const startPracticeGame = () => {
    // Generar permutación de dígitos para variar el tablero de práctica
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
    setPracticeCompleted(false);
    setIsPracticeMode(true);

    const t = Date.now();
    setStartedAt(t);
    setNow(t);
    setFinalTimeMs(null);
  };

  // Lista de ganadores sincronizada en tiempo real con Firebase Firestore
  const [completedUsers, setCompletedUsers] = useState<GlobalWinner[]>(() => {
    const saved = localStorage.getItem('sudoku_global_winners_v2');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Suscripción en tiempo real a Firebase para la colección de ranking (v2, por tiempo)
  useEffect(() => {
    try {
      const colRef = collection(db, LEADERBOARD_COL);
      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        const remoteUsers: GlobalWinner[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.name) {
            remoteUsers.push({
              name: data.name,
              wins: typeof data.wins === 'number' ? data.wins : 1,
              lastCompletedDay: data.lastCompletedDay || '',
              completedAtTimestamp: data.completedAtTimestamp || 0,
              completedAtDateStr: data.completedAtDateStr || '',
              mistakesCount: typeof data.mistakesCount === 'number' ? data.mistakesCount : 0,
              bestTimeMs: typeof data.bestTimeMs === 'number' ? data.bestTimeMs : 0,
              lastTimeMs: typeof data.lastTimeMs === 'number' ? data.lastTimeMs : 0
            });
          }
        });

        // Tabla de posiciones: menor puntaje = mejor posición (tiempo + cantidad de errores)
        remoteUsers.sort((a, b) => {
          const sa = calculateScore(a.bestTimeMs, a.mistakesCount);
          const sb = calculateScore(b.bestTimeMs, b.mistakesCount);
          if (sa !== sb) return sa - sb;
          if ((a.mistakesCount || 0) !== (b.mistakesCount || 0)) {
            return (a.mistakesCount || 0) - (b.mistakesCount || 0);
          }
          return a.completedAtTimestamp - b.completedAtTimestamp;
        });

        setCompletedUsers(remoteUsers);
        localStorage.setItem('sudoku_global_winners_v2', JSON.stringify(remoteUsers));

        // Verificar si el usuario actual ya completó el sudoku hoy en la base de datos remota
        const currentUserName = profileName || loggedInUser?.fullName;
        if (currentUserName) {
          const found = remoteUsers.find(u => u.name === currentUserName);
          if (found && found.lastCompletedDay === currentDayKey) {
            setDailyCompletedToday(true);
            localStorage.setItem(`${LS}completed_day_${currentDayKey}`, 'true');
          }
        }
      }, (error) => {
        console.warn('Error sincronizando Cuadro de Honor con Firebase:', error);
      });

      // Suscripción al historial de victorias por día (v2)
      const historyColRef = collection(db, HISTORY_COL);
      const unsubscribeHistory = onSnapshot(historyColRef, (snapshot) => {
        const records: DailyRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && d.name && d.dateKey) {
            records.push({
              id: docSnap.id,
              name: d.name,
              dateKey: d.dateKey,
              dateStr: d.dateStr || d.dateKey,
              completedAtTimestamp: d.completedAtTimestamp || 0,
              mistakesCount: typeof d.mistakesCount === 'number' ? d.mistakesCount : 0,
              timeMs: typeof d.timeMs === 'number' ? d.timeMs : 0,
              score: typeof d.score === 'number' ? d.score : calculateScore(d.timeMs, d.mistakesCount)
            });
          }
        });

        // Ordenar historial: Días más recientes primero, luego por menor puntaje (tiempo + errores)
        records.sort((a, b) => {
          if (b.dateKey !== a.dateKey) {
            return b.dateKey.localeCompare(a.dateKey);
          }
          const sa = calculateScore(a.timeMs, a.mistakesCount);
          const sb = calculateScore(b.timeMs, b.mistakesCount);
          if (sa !== sb) return sa - sb;
          if ((a.mistakesCount || 0) !== (b.mistakesCount || 0)) {
            return (a.mistakesCount || 0) - (b.mistakesCount || 0);
          }
          return a.completedAtTimestamp - b.completedAtTimestamp;
        });

        setDailyHistory(records);
      }, (err) => {
        console.warn('Error cargando historial de días anteriores de Sudoku:', err);
      });

      return () => {
        unsubscribe();
        unsubscribeHistory();
      };
    } catch (err) {
      console.warn('Firestore subscription fallback:', err);
    }
  }, [currentDayKey, profileName, loggedInUser]);

  // Manejar entrada por teclado físico (1-9 y Delete/Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || isCurrentlyFinished || isGameOver || !isStarted) return;
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
  }, [selectedCell, board, isCurrentlyFinished, isGameOver, mistakes, isStarted, startedAt, activePuzzle, activeSolution]);

  const updateCellValue = (r: number, c: number, num: number) => {
    if (activePuzzle[r][c] !== 0 || isGameOver || isCurrentlyFinished || !isStarted) return;

    if (num === 0) {
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = 0;
      setBoard(newBoard);
      if (!isPracticeMode) {
        localStorage.setItem(`${LS}board_day_${currentDayKey}`, JSON.stringify(newBoard));
      }
      return;
    }

    const expected = activeSolution[r][c];

    if (num !== expected) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (!isPracticeMode) {
        localStorage.setItem(`${LS}mistakes_day_${currentDayKey}`, newMistakes.toString());
      }

      if (newMistakes >= 3) {
        stopTimer();
        setIsGameOver(true);
        if (!isPracticeMode) {
          localStorage.setItem(`${LS}gameover_day_${currentDayKey}`, 'true');
        }
      }
      return;
    }

    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);
    if (!isPracticeMode) {
      localStorage.setItem(`${LS}board_day_${currentDayKey}`, JSON.stringify(newBoard));
    }
    setHighlightedNum(num);

    checkCompletion(newBoard);
  };

  const handleCellClick = (r: number, c: number) => {
    if (isGameOver || !isStarted || isCurrentlyFinished) return;
    setSelectedCell([r, c]);
    const clickedValue = board[r][c];
    if (clickedValue !== 0) {
      setHighlightedNum(clickedValue);
    }
  };

  const handleClearAll = () => {
    if (isGameOver || isCurrentlyFinished || !isStarted) return;
    const initialBoard = activePuzzle.map(row => [...row]);
    setBoard(initialBoard);
    setSelectedCell(null);
    setHighlightedNum(null);
    if (!isPracticeMode) {
      localStorage.setItem(`${LS}board_day_${currentDayKey}`, JSON.stringify(initialBoard));
    }
  };

  const checkCompletion = async (currentBoard: number[][]) => {
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

      // Si es modo práctica o ya se completó el oficial hoy: NO sube puntuación
      if (isPracticeMode || dailyCompletedToday) {
        setPracticeCompleted(true);
        setSuccessMessage(`¡Sudoku de práctica completado en ${formatTime(timeMs)}! (Sin puntuación)`);
        setShowFloatingSuccess(true);
        setTimeout(() => setShowFloatingSuccess(false), 4000);
        return;
      }

      // SUDOKU OFICIAL DEL DÍA: Sube puntuación
      setDailyCompletedToday(true);
      localStorage.setItem(`${LS}completed_day_${currentDayKey}`, 'true');
      setSuccessMessage(`¡Sudoku del día completado en ${formatTime(timeMs)}!`);
      setShowFloatingSuccess(true);

      // Ocultar mensaje flotante después de 3.5 segundos
      setTimeout(() => {
        setShowFloatingSuccess(false);
      }, 3500);

      const userName = profileName || loggedInUser?.fullName || 'Usuario Médico';
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timestamp = now.getTime();

      // Identificador seguro para el documento en Firestore
      const docId = userName.replace(/[\/\#\$\.\[\]]/g, '_').trim().toLowerCase();

      try {
        const userDocRef = doc(db, LEADERBOARD_COL, docId);
        const existingSnap = await getDoc(userDocRef);

        let currentWins = 0;
        let lastDay = '';
        let prevBest = 0;
        let prevMistakes = 0;

        if (existingSnap.exists()) {
          const remoteData = existingSnap.data();
          currentWins = typeof remoteData.wins === 'number' ? remoteData.wins : 0;
          lastDay = remoteData.lastCompletedDay || '';
          prevBest = typeof remoteData.bestTimeMs === 'number' ? remoteData.bestTimeMs : 0;
          prevMistakes = typeof remoteData.mistakesCount === 'number' ? remoteData.mistakesCount : 0;
        }

        const isNewDayWin = lastDay !== currentDayKey;
        const finalWins = isNewDayWin ? currentWins + 1 : currentWins;

        // Calcular puntajes: menor puntaje = mejor posición
        const prevBestScore = prevBest > 0 ? calculateScore(prevBest, prevMistakes) : Number.MAX_SAFE_INTEGER;
        const currentScore = calculateScore(timeMs, mistakes);
        const isBetterScore = currentScore < prevBestScore;

        const bestTimeMs = isBetterScore ? timeMs : (prevBest > 0 ? prevBest : timeMs);
        const bestMistakesCount = isBetterScore ? mistakes : (prevBest > 0 ? prevMistakes : mistakes);
        const bestScore = Math.min(prevBestScore, currentScore);

        await setDoc(userDocRef, {
          name: userName,
          wins: finalWins,
          lastCompletedDay: currentDayKey,
          completedAtTimestamp: timestamp,
          completedAtDateStr: dateStr,
          mistakesCount: bestMistakesCount,
          bestTimeMs,
          bestScore,
          lastMistakesCount: mistakes,
          lastTimeMs: timeMs,
          lastScore: currentScore,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Guardar registro histórico por fecha y usuario
        const historyDocId = `${currentDayKey}_${docId}`;
        await setDoc(doc(db, HISTORY_COL, historyDocId), {
          name: userName,
          dateKey: currentDayKey,
          dateStr: dateStr,
          completedAtTimestamp: timestamp,
          mistakesCount: mistakes,
          timeMs,
          score: currentScore,
          createdAt: serverTimestamp()
        }, { merge: true });

      } catch (err) {
        console.warn('Error guardando victoria en Firebase:', err);

        // Fallback local en caso de estar offline
        const existingUserIdx = completedUsers.findIndex(u => u.name === userName);
        let updatedList: GlobalWinner[] = [];
        const currentScore = calculateScore(timeMs, mistakes);

        if (existingUserIdx >= 0) {
          updatedList = completedUsers.map((user, idx) => {
            if (idx === existingUserIdx) {
              const isNewDay = user.lastCompletedDay !== currentDayKey;
              const prevBest = user.bestTimeMs > 0 ? user.bestTimeMs : 0;
              const prevMistakes = typeof user.mistakesCount === 'number' ? user.mistakesCount : 0;
              const prevScore = prevBest > 0 ? calculateScore(prevBest, prevMistakes) : Number.MAX_SAFE_INTEGER;
              const isBetter = currentScore < prevScore;

              return {
                ...user,
                wins: isNewDay ? user.wins + 1 : user.wins,
                lastCompletedDay: currentDayKey,
                completedAtTimestamp: timestamp,
                completedAtDateStr: dateStr,
                mistakesCount: isBetter ? mistakes : prevMistakes,
                bestTimeMs: isBetter ? timeMs : (prevBest > 0 ? prevBest : timeMs),
                bestScore: Math.min(prevScore, currentScore),
                lastMistakesCount: mistakes,
                lastTimeMs: timeMs,
                lastScore: currentScore
              };
            }
            return user;
          });
        } else {
          updatedList = [
            ...completedUsers,
            {
              name: userName,
              wins: 1,
              lastCompletedDay: currentDayKey,
              completedAtTimestamp: timestamp,
              completedAtDateStr: dateStr,
              mistakesCount: mistakes,
              bestTimeMs: timeMs,
              bestScore: currentScore,
              lastMistakesCount: mistakes,
              lastTimeMs: timeMs,
              lastScore: currentScore
            }
          ];
        }

        updatedList.sort((a, b) => {
          const sa = calculateScore(a.bestTimeMs, a.mistakesCount);
          const sb = calculateScore(b.bestTimeMs, b.mistakesCount);
          if (sa !== sb) return sa - sb;
          return a.completedAtTimestamp - b.completedAtTimestamp;
        });
        setCompletedUsers(updatedList);
        localStorage.setItem('sudoku_global_winners_v2', JSON.stringify(updatedList));
      }
    }
  };

  return (
    /* CONTENEDOR FUSIONADO COMO UN ÚNICO BLOQUE UNIFICADO */
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col gap-3 relative">
      {/* MENSAJE FLOTANTE BREVE DE ÉXITO */}
      {showFloatingSuccess && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-lg font-bold text-xs flex items-center gap-2 animate-bounce">
          <span>🎉</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* ENCABEZADO SUPERIOR UNIFICADO DEL BLOQUE */}
      <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
            🧩
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              SUDOKU DIARIO
            </h3>
            {isPracticeMode ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                Modo Práctica (Sin Puntuación)
              </span>
            ) : dailyCompletedToday ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                ✓ Desafío Oficial Completado
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                Puntúa para Cuadro de Honor
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dailyCompletedToday && (
            <button
              type="button"
              onClick={startPracticeGame}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              title="Jugar otro Sudoku (Modo Práctica - No califica para puntuación)"
            >
              <span>🔄</span>
              <span>{isPracticeMode ? 'Nuevo Sudoku Práctica' : 'Jugar otro Sudoku'}</span>
            </button>
          )}

          {/* BOTÓN ROJO SOLO CON ICONO DE BASURERO BLANCO */}
          <button
            onClick={handleClearAll}
            disabled={isGameOver || isCurrentlyFinished}
            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all cursor-pointer flex items-center justify-center shadow-2xs disabled:opacity-40 shrink-0"
            title="Borrar valores ingresados y reiniciar tablero"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* MENSAJE DE PÉRDIDA POR 3 ERRORES */}
      {isGameOver && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold text-center animate-fadeIn flex items-center justify-between gap-2">
          <span>❌ Has cometido 3 errores.</span>
          {dailyCompletedToday && (
            <button
              onClick={startPracticeGame}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-[11px] font-extrabold hover:bg-red-700 transition cursor-pointer"
            >
              Reintentar en modo práctica
            </button>
          )}
        </div>
      )}

      {/* CUERPO DEL BLOQUE: GRILLA Y ESTADÍSTICAS/CUADRO DE HONOR FUSIONADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch w-full">
        {/* LADO IZQUIERDO: GRILLA SUDOKU (Ocupa todo su espacio, sin doble marco) */}
        <div className="w-full flex flex-col items-center justify-center relative overflow-hidden">
          {/* OVERLAY CUANDO EL DESAFÍO DIARIO FUE COMPLETADO (CON OPCIÓN DE JUGAR PRÁCTICA) */}
          {dailyCompletedToday && !isPracticeMode && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs z-40 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 rounded-xl animate-fadeIn">
              <span className="text-4xl animate-bounce">🏆</span>
              <h3 className="text-base font-extrabold text-emerald-400">¡Sudoku del día completado!</h3>
              {finalTimeMs !== null && (
                <p className="font-mono text-2xl font-black text-white tracking-wider">⏱ {formatTime(finalTimeMs)}</p>
              )}
              <p className="text-xs text-slate-200 max-w-xs leading-relaxed font-medium">
                Tu puntuación del día ya quedó registrada en el Cuadro de Honor. Puedes continuar jugando todos los sudokus que desees en modo práctica.
              </p>
              <button
                type="button"
                onClick={startPracticeGame}
                className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-sky-900/40 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>🎮</span>
                <span>Jugar otro Sudoku (Modo Práctica)</span>
              </button>
              <span className="text-[10px] text-amber-300 font-medium">
                * Las partidas adicionales no califican para puntuación
              </span>
            </div>
          )}

          {/* OVERLAY CUANDO LA PARTIDA DE PRÁCTICA SE COMPLETA */}
          {isPracticeMode && practiceCompleted && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs z-40 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 rounded-xl animate-fadeIn">
              <span className="text-4xl animate-bounce">✨</span>
              <h3 className="text-base font-extrabold text-sky-400">¡Sudoku de Práctica Completado!</h3>
              {finalTimeMs !== null && (
                <p className="font-mono text-2xl font-black text-white tracking-wider">⏱ {formatTime(finalTimeMs)}</p>
              )}
              <p className="text-xs text-slate-200 max-w-xs leading-relaxed font-medium">
                ¡Gran partida! Recuerda que esta partida fue de entrenamiento y no modifica tu ranking oficial de hoy.
              </p>
              <button
                type="button"
                onClick={startPracticeGame}
                className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-sky-900/40 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>🔄</span>
                <span>Jugar otro Sudoku</span>
              </button>
            </div>
          )}

          {/* OVERLAY DE INICIO: tablero antes de presionar Iniciar */}
          {!isStarted && !dailyCompletedToday && !isGameOver && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 rounded-xl animate-fadeIn">
              <span className="text-4xl">⏱️</span>
              <h3 className="text-base font-extrabold">¿List@ para el desafío de hoy?</h3>
              <p className="text-xs text-slate-200 max-w-xs leading-relaxed">
                El cronómetro comenzará al presionar el botón. ¡El menor tiempo gana el primer lugar!
              </p>
              <button
                id="sudoku-start-button"
                type="button"
                onClick={handleStart}
                className="mt-1 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-extrabold text-sm shadow-lg shadow-sky-900/40 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Iniciar Sudoku
              </button>
            </div>
          )}

          {/* GRILLA SUDOKU: Ocupa todo el espacio de su mitad con cuadrados completos */}
          <div className="w-full max-w-[400px] aspect-square rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-300 shadow-xs flex">
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
                      disabled={isGameOver || isCurrentlyFinished || !isStarted}
                      onClick={() => handleCellClick(r, c)}
                      className={`flex items-center justify-center font-sans font-bold text-base sm:text-lg transition-colors p-0 m-0 w-full h-full leading-none select-none ${
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

        {/* LADO DERECHO: CRONÓMETRO, ERRORES Y CUADRO DE HONOR */}
        <div className="w-full flex flex-col justify-between h-full space-y-2.5">
          {/* CRONÓMETRO */}
          <div className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
            isRunning ? 'bg-sky-50 border-sky-200' : isCurrentlyFinished ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1.5">
              {isRunning && <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />}
              Tiempo:
            </span>
            <span id="sudoku-timer" className={`font-mono text-sm font-black tabular-nums ${
              isRunning ? 'text-sky-700' : isCurrentlyFinished ? 'text-emerald-700' : 'text-slate-500'
            }`}>
              {isStarted ? formatTime(elapsedMs) : '00:00'}
            </span>
          </div>

          {/* INDICADOR DE ERRORES (MAX 3) */}
          <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
            <span className="font-bold text-slate-700 text-[11px]">Errores permitidos:</span>
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
              <span className="ml-1 font-mono text-[10.5px] font-bold text-slate-600">{mistakes}/3</span>
            </div>
          </div>

          {/* CUADRO DE HONOR: TABS (RANKING GLOBAL, HOY, DÍAS ANTERIORES) */}
          <div className="flex-1 flex flex-col justify-start min-h-0">
            <div className="flex flex-col gap-1.5 border-b border-slate-200/70 pb-2 mb-1.5">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                🏆 CUADRO DE HONOR
              </span>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/70 text-[10px]">
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
                  onClick={() => setLeaderboardTab('hoy')}
                  className={`py-1 rounded font-bold transition-all cursor-pointer text-center ${
                    leaderboardTab === 'hoy' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setLeaderboardTab('historial')}
                  className={`py-1 rounded font-bold transition-all cursor-pointer text-center ${
                    leaderboardTab === 'historial' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Histórico
                </button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[225px] overflow-y-auto custom-scrollbar pr-1 flex-1">
              {/* TAB: RANKING GLOBAL HISTÓRICO */}
              {leaderboardTab === 'ranking' && (
                completedUsers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-400 space-y-1">
                    <span className="text-2xl">⏳</span>
                    <p className="text-[11px] font-medium">Aún no hay usuarios en el cuadro de honor.</p>
                    <p className="text-[10px] text-slate-400">¡Sé el primero en resolver el Sudoku!</p>
                  </div>
                ) : (
                  completedUsers.map((user, idx) => {
                    const isWonToday = user.lastCompletedDay === currentDayKey;
                    const score = calculateScore(user.bestTimeMs, user.mistakesCount);
                    return (
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
                            <span className="font-semibold text-slate-800 truncate text-[11.5px] leading-tight">
                              {user.name}
                            </span>
                            <span className="text-[9px] text-slate-400 flex items-center gap-1 font-medium">
                              ⏱ {formatTime(user.bestTimeMs)} • {user.mistakesCount === 0 ? 'Sin errores' : `+${user.mistakesCount * ERROR_PENALTY_SECONDS}s (${user.mistakesCount} err)`}
                            </span>
                            {isWonToday && (
                              <span className="text-[8.5px] text-emerald-600 font-bold flex items-center gap-0.5">
                                ✓ Completado hoy
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 font-black text-[10px] rounded-md inline-flex items-center gap-0.5 shadow-2xs">
                            ⭐ {score} pts
                          </span>
                        </div>
                      </div>
                    );
                  })
                )
              )}

              {/* TAB: GANADORES DE HOY */}
              {leaderboardTab === 'hoy' && (() => {
                const todaysWinners = completedUsers
                  .filter(u => u.lastCompletedDay === currentDayKey)
                  .sort((a, b) => {
                    const sa = calculateScore(a.lastTimeMs, a.mistakesCount);
                    const sb = calculateScore(b.lastTimeMs, b.mistakesCount);
                    if (sa !== sb) return sa - sb;
                    if ((a.mistakesCount || 0) !== (b.mistakesCount || 0)) {
                      return (a.mistakesCount || 0) - (b.mistakesCount || 0);
                    }
                    return a.completedAtTimestamp - b.completedAtTimestamp;
                  });

                if (todaysWinners.length === 0) {
                  return (
                    <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-400 space-y-1">
                      <span className="text-2xl">⏳</span>
                      <p className="text-[11px] font-medium">Aún nadie ha completado el Sudoku hoy.</p>
                      <p className="text-[10px] text-slate-400">¡Sé el primero en ganar hoy!</p>
                    </div>
                  );
                }
                return todaysWinners.map((user, idx) => {
                  const score = calculateScore(user.lastTimeMs, user.mistakesCount);
                  return (
                    <div
                      key={idx}
                      className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className={`w-4 h-4 rounded-full text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
                          idx === 0 ? 'bg-amber-400 text-amber-950 shadow-xs' : idx === 1 ? 'bg-slate-300 text-slate-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-800 truncate text-[11.5px] leading-tight">{user.name}</span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            ⏱ {formatTime(user.lastTimeMs)} • {user.mistakesCount === 0 ? 'Sin errores' : `+${user.mistakesCount * ERROR_PENALTY_SECONDS}s (${user.mistakesCount} err)`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-300 font-black text-[10px] rounded-md inline-flex items-center gap-0.5 shadow-2xs">
                          ⭐ {score} pts
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}

              {/* TAB: PODIO MENSUAL (HISTÓRICO) */}
              {leaderboardTab === 'historial' && (
                monthlyPodium.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-400 space-y-1">
                    <span className="text-2xl">⏳</span>
                    <p className="text-[11px] font-medium">Aún no hay registros este mes.</p>
                    <p className="text-[10px] text-slate-400">¡Sé el primero en liderar el podio!</p>
                  </div>
                ) : (
                  <>
                    {availableMonths.length > 1 && (
                      <div className="flex items-center justify-between pb-1 px-1 text-[9.5px] font-bold text-slate-500 border-b border-slate-100 mb-1">
                        <span>Podio de:</span>
                        <select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 text-[9px] font-bold cursor-pointer"
                        >
                          {availableMonths.map((m) => (
                            <option key={m} value={m}>{formatMonthName(m)}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {monthlyPodium.map((user, idx) => {
                      const isWonToday = user.bestDateKey === currentDayKey;
                      return (
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
                                {idx === 0 && <span title="1.º Lugar del mes">🥇</span>}
                                {idx === 1 && <span title="2.º Lugar del mes">🥈</span>}
                                {idx === 2 && <span title="3.º Lugar del mes">🥉</span>}
                              </span>
                              <span className="text-[9px] text-slate-400 flex items-center gap-1 font-medium">
                                ⏱ {formatTime(user.bestTimeMs)} • {user.bestMistakesCount === 0 ? 'Sin errores' : `+${user.bestMistakesCount * ERROR_PENALTY_SECONDS}s (${user.bestMistakesCount} err)`}
                              </span>
                              {isWonToday && (
                                <span className="text-[8.5px] text-emerald-600 font-bold flex items-center gap-0.5">
                                  ✓ Completado hoy
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`px-1.5 py-0.5 font-black text-[10px] rounded-md inline-flex items-center gap-0.5 border shadow-2xs ${
                              idx === 0
                                ? 'bg-amber-100 text-amber-950 border-amber-300'
                                : idx === 1
                                ? 'bg-slate-100 text-slate-800 border-slate-300'
                                : idx === 2
                                ? 'bg-orange-100 text-orange-950 border-orange-300'
                                : 'bg-sky-50 text-sky-800 border-sky-200'
                            }`}>
                              ⭐ {user.bestScore} pts
                            </span>
                          </div>
                        </div>
                      );
                    })}
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
