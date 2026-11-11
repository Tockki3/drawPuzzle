import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ToolMode,
  LevelDefinition,
  LevelProgress,
  StarObject,
  Point
} from './types';
import { INITIAL_LEVELS, CANVAS_WIDTH, CANVAS_HEIGHT } from './game/levels';
import { PhysicsEngine } from './game/physics';
import { sounds } from './game/sound';
import { Header } from './components/Header';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { LevelSelectModal } from './components/LevelSelectModal';
import { VictoryModal } from './components/VictoryModal';
import { InstructionsModal } from './components/InstructionsModal';
import { SandboxToolbar, SandboxTool } from './components/SandboxToolbar';
import { Star, Trophy, Sparkles } from 'lucide-react';

const PROGRESS_STORAGE_KEY = 'physics_draw_progress_v1';

export default function App() {
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [toolMode, setToolMode] = useState<ToolMode>('dynamic');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [timeScale, setTimeScale] = useState<number>(1.0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [currentInkUsed, setCurrentInkUsed] = useState<number>(0);
  const [starsCollected, setStarsCollected] = useState<Set<string>>(new Set());

  // Level Progression Storage
  const [progressMap, setProgressMap] = useState<Map<number, LevelProgress>>(() => {
    const map = new Map<number, LevelProgress>();
    INITIAL_LEVELS.forEach((lvl, idx) => {
      map.set(lvl.id, {
        levelId: lvl.id,
        unlocked: idx === 0, // Level 1 unlocked by default
        completed: false,
        starsEarned: 0,
        bestInkRatio: 1,
        bestTime: 999
      });
    });

    try {
      const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (saved) {
        const parsed: LevelProgress[] = JSON.parse(saved);
        parsed.forEach((p) => map.set(p.levelId, p));
      }
    } catch {
      // fallback
    }
    return map;
  });

  // Modals
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [victoryData, setVictoryData] = useState<{
    stars: number;
    time: number;
    inkUsed: number;
  } | null>(null);

  // Sound state
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.isMuted());

  // Sandbox Mode State
  const [isSandbox, setIsSandbox] = useState<boolean>(false);
  const [activeSandboxTool, setActiveSandboxTool] = useState<SandboxTool>('none');
  const [sandboxLevel, setSandboxLevel] = useState<LevelDefinition>(() => ({
    id: 999,
    title: '나만의 공작소',
    titleEn: 'Custom Sandbox',
    subtitle: '자유롭게 물체를 배치하고 새로운 퍼즐을 설계하세요',
    description: '공, 컵, 탄성 패드, 별 등을 자유롭게 배치하고 물리 법칙을 시험해보세요.',
    inkBudget: 1500,
    parTime: 30,
    balls: [{ id: 'sb_b1', x: 200, y: 150, radius: 14, color: '#ef4444' }],
    targets: [{ id: 'sb_t1', x: 800, y: 520, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444' }],
    stars: [
      { id: 'sb_s1', x: 350, y: 300, radius: 14, collected: false },
      { id: 'sb_s2', x: 500, y: 220, radius: 14, collected: false },
      { id: 'sb_s3', x: 650, y: 350, radius: 14, collected: false }
    ],
    obstacles: [
      { id: 'sb_floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
    ]
  }));

  // JSON Import/Export modal
  const [showIOModal, setShowIOModal] = useState<'export' | 'import' | null>(null);
  const [ioText, setIoText] = useState<string>('');

  // Active level definition
  const activeLevel: LevelDefinition = isSandbox
    ? sandboxLevel
    : INITIAL_LEVELS.find((l) => l.id === currentLevelId) || INITIAL_LEVELS[0];

  const physicsEngineRef = useRef<PhysicsEngine | null>(null);
  const [strokeLengths, setStrokeLengths] = useState<number[]>([]);
  const levelStartTimeRef = useRef<number>(Date.now());

  // Save progress
  const saveProgress = (map: Map<number, LevelProgress>) => {
    setProgressMap(new Map(map));
    try {
      const arr = Array.from(map.values());
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(arr));
    } catch {
      // ignore
    }
  };

  // Re-initialize physics engine when level changes
  const initEngine = useCallback((level: LevelDefinition) => {
    if (physicsEngineRef.current) {
      physicsEngineRef.current.setRunning(false);
    }

    const engine = new PhysicsEngine(level, {
      onStarCollect: (starId: string) => {
        setStarsCollected((prev) => {
          if (prev.has(starId)) return prev;
          const next = new Set(prev);
          next.add(starId);
          sounds.playStar(next.size);
          return next;
        });
      },
      onGoalReached: (targetId: string, ballId: string) => {
        // Victory!
        if (victoryData) return; // already showing
        const timeTaken = (Date.now() - levelStartTimeRef.current) / 1000;

        // Calculate stars
        let stars = 1;
        const totalBonusStars = level.stars.length;
        const collectedBonusCount = starsCollected.size;

        if (totalBonusStars > 0 && collectedBonusCount === totalBonusStars) {
          stars = 3;
        } else if (collectedBonusCount >= 1 || currentInkUsed < level.inkBudget * 0.7) {
          stars = 2;
        }

        setVictoryData({
          stars,
          time: timeTaken,
          inkUsed: currentInkUsed
        });

        // Update progress
        if (!isSandbox) {
          const map = new Map(progressMap);
          const currentProgress = map.get(level.id);
          const oldStars = currentProgress?.starsEarned || 0;

          map.set(level.id, {
            levelId: level.id,
            unlocked: true,
            completed: true,
            starsEarned: Math.max(oldStars, stars),
            bestInkRatio: Math.min(currentProgress?.bestInkRatio || 1, currentInkUsed / level.inkBudget),
            bestTime: Math.min(currentProgress?.bestTime || 999, timeTaken)
          });

          // Unlock next level
          const nextLevel = INITIAL_LEVELS.find((l) => l.id === level.id + 1);
          if (nextLevel) {
            const nextProgress = map.get(nextLevel.id);
            map.set(nextLevel.id, {
              levelId: nextLevel.id,
              unlocked: true,
              completed: nextProgress?.completed || false,
              starsEarned: nextProgress?.starsEarned || 0,
              bestInkRatio: nextProgress?.bestInkRatio || 1,
              bestTime: nextProgress?.bestTime || 999
            });
          }

          saveProgress(map);
        }
      },
      onBallImpact: (velocity: number) => {
        sounds.playImpact(velocity);
      }
    });

    physicsEngineRef.current = engine;
    setCurrentInkUsed(0);
    setStrokeLengths([]);
    setStarsCollected(new Set());
    setVictoryData(null);
    levelStartTimeRef.current = Date.now();
  }, [currentInkUsed, isSandbox, progressMap, starsCollected, victoryData]);

  // Load level on currentLevelId or isSandbox change
  useEffect(() => {
    initEngine(activeLevel);
  }, [currentLevelId, isSandbox]);

  // Handle stroke additions
  const handleStrokeComplete = (length: number) => {
    setStrokeLengths((prev) => [...prev, length]);
    setCurrentInkUsed((prev) => prev + length);
  };

  const handleEraseStroke = (refundLength: number) => {
    setCurrentInkUsed((prev) => Math.max(0, prev - refundLength));
  };

  const handleUndo = () => {
    if (!physicsEngineRef.current) return;
    const removed = physicsEngineRef.current.undoLastStroke();
    if (removed) {
      setCurrentInkUsed((prev) => Math.max(0, prev - removed.length));
      setStrokeLengths((prev) => prev.slice(0, -1));
    }
  };

  const handleClearDrawings = () => {
    if (!physicsEngineRef.current) return;
    physicsEngineRef.current.clearDrawings();
    setCurrentInkUsed(0);
    setStrokeLengths([]);
  };

  const handleResetLevel = () => {
    initEngine(activeLevel);
    sounds.playClick();
  };

  const handleToggleRunning = () => {
    const next = !isRunning;
    setIsRunning(next);
    if (physicsEngineRef.current) {
      physicsEngineRef.current.setRunning(next);
    }
    sounds.playClick();
  };

  const handleChangeTimeScale = (scale: number) => {
    setTimeScale(scale);
    if (physicsEngineRef.current) {
      physicsEngineRef.current.setTimeScale(scale);
    }
    sounds.playClick();
  };

  const handleToggleMute = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleSelectLevel = (id: number) => {
    setIsSandbox(false);
    setCurrentLevelId(id);
    setShowHint(false);
  };

  const handleNextLevel = () => {
    const nextLvl = INITIAL_LEVELS.find((l) => l.id === currentLevelId + 1);
    if (nextLvl) {
      setCurrentLevelId(nextLvl.id);
      setShowHint(false);
    }
  };

  const handleUnlockAll = () => {
    const map = new Map(progressMap);
    INITIAL_LEVELS.forEach((lvl) => {
      const p = map.get(lvl.id);
      map.set(lvl.id, {
        levelId: lvl.id,
        unlocked: true,
        completed: p?.completed || false,
        starsEarned: p?.starsEarned || 0,
        bestInkRatio: p?.bestInkRatio || 1,
        bestTime: p?.bestTime || 999
      });
    });
    saveProgress(map);
    sounds.playSuccess();
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleRunning();
      } else if (e.code === 'KeyR') {
        handleResetLevel();
      } else if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleUndo();
      } else if (e.code === 'KeyH') {
        setShowHint((prev) => !prev);
        sounds.playClick();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isRunning]);

  // Total stars
  const totalStars = Array.from(progressMap.values()).reduce((sum, p) => sum + p.starsEarned, 0);

  // Sandbox item placement clicking on canvas
  const handleSandboxPlace = (pt: Point) => {
    if (!isSandbox || activeSandboxTool === 'none') return;

    setSandboxLevel((prev) => {
      let updated = { ...prev };
      const uid = Date.now().toString(36);

      if (activeSandboxTool === 'add_ball') {
        updated.balls = [
          ...updated.balls,
          { id: `b_${uid}`, x: pt.x, y: pt.y, radius: 14, color: '#ef4444' }
        ];
      } else if (activeSandboxTool === 'add_cup') {
        updated.targets = [
          ...updated.targets,
          { id: `t_${uid}`, x: pt.x, y: pt.y, width: 90, height: 60, color: '#3b82f6', targetBallColor: '#ef4444' }
        ];
      } else if (activeSandboxTool === 'add_bouncer') {
        updated.obstacles = [
          ...updated.obstacles,
          { id: `bnc_${uid}`, type: 'bouncer', x: pt.x, y: pt.y, width: 120, height: 24, isStatic: true, color: '#10b981', restitution: 0.95 }
        ];
      } else if (activeSandboxTool === 'add_star') {
        updated.stars = [
          ...updated.stars,
          { id: `s_${uid}`, x: pt.x, y: pt.y, radius: 14, collected: false }
        ];
      } else if (activeSandboxTool === 'add_gravity_zone') {
        const zones = updated.gravityZones || [];
        updated.gravityZones = [
          ...zones,
          { id: `gz_${uid}`, x: pt.x - 100, y: pt.y - 100, width: 200, height: 200, forceY: -0.0028, label: '반중력 상승존' }
        ];
      }

      initEngine(updated);
      return updated;
    });

    sounds.playClick();
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Header (Satisfies Top Bar Contract) */}
      <Header
        onOpenLevels={() => setShowLevelSelect(true)}
        onOpenSandbox={() => {
          setIsSandbox(!isSandbox);
          sounds.playClick();
        }}
        onOpenGuide={() => setShowGuide(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        currentLevelTitle={`STAGE ${String(activeLevel.id).padStart(2, '0')}. ${activeLevel.title}`}
        totalStars={totalStars}
        isSandbox={isSandbox}
      />

      {/* 2. Level Info Sub-header Bar (Clean, unboxed metadata) */}
      <div className="px-6 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-200 text-sm">
            {activeLevel.title}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-400 hidden sm:inline">{activeLevel.subtitle}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="hidden md:inline">별 수집: {starsCollected.size} / {activeLevel.stars.length}</span>
          <span aria-hidden="true" className="text-slate-600 hidden md:inline">·</span>
          <span>목표 시간: {activeLevel.parTime}초</span>
        </div>
      </div>

      {/* 3. Main Game Viewport */}
      <main className="flex-1 relative flex flex-col items-center justify-center min-h-0 bg-slate-950">
        <GameCanvas
          level={activeLevel}
          physicsEngine={physicsEngineRef.current}
          toolMode={toolMode}
          currentInkUsed={currentInkUsed}
          maxInkBudget={activeLevel.inkBudget}
          showHint={showHint}
          onStrokeComplete={handleStrokeComplete}
          onEraseStroke={handleEraseStroke}
          isRunning={isRunning}
          starsCollected={starsCollected}
          onSandboxPlace={handleSandboxPlace}
          isSandboxPlacing={isSandbox && activeSandboxTool !== 'none'}
        />
      </main>

      {/* 4. Controls / Toolbar Footer */}
      <footer className="shrink-0 bg-slate-900 border-t border-slate-800/90 py-1.5 px-4">
        {isSandbox ? (
          <SandboxToolbar
            activeSandboxTool={activeSandboxTool}
            onSelectSandboxTool={setActiveSandboxTool}
            onClearCustom={() => {
              setSandboxLevel((prev) => ({
                ...prev,
                balls: [],
                targets: [],
                stars: [],
                obstacles: [
                  { id: 'floor', type: 'rectangle', x: 500, y: 635, width: 1000, height: 30, isStatic: true, color: '#334155' }
                ]
              }));
              handleResetLevel();
            }}
            onResetBalls={handleResetLevel}
            onExport={() => {
              setIoText(JSON.stringify(sandboxLevel, null, 2));
              setShowIOModal('export');
            }}
            onImport={() => {
              setIoText('');
              setShowIOModal('import');
            }}
            onExitSandbox={() => setIsSandbox(false)}
          />
        ) : (
          <GameHUD
            toolMode={toolMode}
            onSelectTool={(mode) => {
              setToolMode(mode);
              sounds.playClick();
            }}
            inkUsed={currentInkUsed}
            maxInk={activeLevel.inkBudget}
            isRunning={isRunning}
            onToggleRunning={handleToggleRunning}
            onReset={handleResetLevel}
            onUndo={handleUndo}
            onClear={handleClearDrawings}
            showHint={showHint}
            onToggleHint={() => {
              setShowHint(!showHint);
              sounds.playClick();
            }}
            timeScale={timeScale}
            onChangeTimeScale={handleChangeTimeScale}
            canUndo={strokeLengths.length > 0}
          />
        )}
      </footer>

      {/* Modals */}
      {showLevelSelect && (
        <LevelSelectModal
          levels={INITIAL_LEVELS}
          currentLevelId={currentLevelId}
          progressMap={progressMap}
          onSelectLevel={handleSelectLevel}
          onClose={() => setShowLevelSelect(false)}
          onUnlockAll={handleUnlockAll}
        />
      )}

      {showGuide && (
        <InstructionsModal onClose={() => setShowGuide(false)} />
      )}

      {victoryData && (
        <VictoryModal
          levelTitle={activeLevel.title}
          levelNumber={activeLevel.id}
          starsEarned={victoryData.stars}
          inkUsed={victoryData.inkUsed}
          maxInk={activeLevel.inkBudget}
          timeTaken={victoryData.time}
          hasNextLevel={INITIAL_LEVELS.some((l) => l.id === activeLevel.id + 1)}
          onNextLevel={handleNextLevel}
          onReplay={handleResetLevel}
        />
      )}

      {/* Import / Export Dialog */}
      {showIOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-white">
            <h3 className="text-base font-bold mb-2">
              {showIOModal === 'export' ? '레벨 JSON 내보내기' : '레벨 JSON 불러오기'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {showIOModal === 'export'
                ? '아래 코드를 복사하여 다른 브라우저나 친구와 공유하세요.'
                : '공유받은 레벨 JSON 코드를 아래에 붙여넣어 즉시 플레이하세요.'}
            </p>
            <textarea
              value={ioText}
              onChange={(e) => setIoText(e.target.value)}
              readOnly={showIOModal === 'export'}
              rows={8}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 mb-4 select-text"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowIOModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                닫기
              </button>
              {showIOModal === 'import' && (
                <button
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(ioText);
                      setSandboxLevel(parsed);
                      initEngine(parsed);
                      setShowIOModal(null);
                      sounds.playSuccess();
                    } catch {
                      alert('유효하지 않은 레벨 JSON 형식입니다.');
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg cursor-pointer text-white"
                >
                  적용하기
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
