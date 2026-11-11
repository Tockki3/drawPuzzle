import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Undo2,
  Trash2,
  Lightbulb,
  Gauge,
  PenTool,
  Anchor,
  Pin,
  Eraser
} from 'lucide-react';
import { ToolMode } from '../types';

interface GameHUDProps {
  toolMode: ToolMode;
  onSelectTool: (mode: ToolMode) => void;
  inkUsed: number;
  maxInk: number;
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
  onUndo: () => void;
  onClear: () => void;
  showHint: boolean;
  onToggleHint: () => void;
  timeScale: number;
  onChangeTimeScale: (scale: number) => void;
  canUndo: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  toolMode,
  onSelectTool,
  inkUsed,
  maxInk,
  isRunning,
  onToggleRunning,
  onReset,
  onUndo,
  onClear,
  showHint,
  onToggleHint,
  timeScale,
  onChangeTimeScale,
  canUndo
}) => {
  const inkRemaining = Math.max(0, maxInk - inkUsed);
  const inkPercent = Math.min(100, Math.max(0, (inkRemaining / maxInk) * 100));

  // Determine ink bar color
  let inkBarColor = 'bg-emerald-500';
  if (inkPercent < 25) {
    inkBarColor = 'bg-rose-500';
  } else if (inkPercent < 50) {
    inkBarColor = 'bg-amber-500';
  }

  const nextSpeed = timeScale === 1.0 ? 1.5 : timeScale === 1.5 ? 0.5 : 1.0;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 select-none">
      {/* 1. Tool Selection (Segmented Control) */}
      <div className="flex items-center gap-1 p-1 bg-slate-800/90 rounded-xl border border-slate-700 shadow-lg shrink-0">
        <button
          onClick={() => onSelectTool('dynamic')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            toolMode === 'dynamic'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
          title="물리 법칙에 따라 떨어지고 굴러가는 물체를 그립니다"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>자유 낙하</span>
        </button>

        <button
          onClick={() => onSelectTool('static')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            toolMode === 'static'
              ? 'bg-amber-500 text-slate-900 shadow-md font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
          title="공중에 고정되어 떨어지지 않는 단단한 경사로나 다리를 만듭니다"
        >
          <Anchor className="w-3.5 h-3.5" />
          <span>고정 지지대</span>
        </button>

        <button
          onClick={() => onSelectTool('pivot')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            toolMode === 'pivot'
              ? 'bg-purple-500 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
          title="첫 번째 점에 회전 힌지 핀을 꽂아 진자나 카타펄트를 만듭니다"
        >
          <Pin className="w-3.5 h-3.5" />
          <span>회전 힌지</span>
        </button>

        <button
          onClick={() => onSelectTool('eraser')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            toolMode === 'eraser'
              ? 'bg-rose-500 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
          title="그려진 물체를 클릭하여 지우고 잉크를 돌려받습니다"
        >
          <Eraser className="w-3.5 h-3.5" />
          <span>지우개</span>
        </button>
      </div>

      {/* 2. Ink Level Meter */}
      <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/80 w-full md:w-64 shadow-md">
        <span className="text-xs font-medium text-slate-400 whitespace-nowrap">잉크 잔여량</span>
        <div className="flex-1 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative">
          <div
            className={`h-full ${inkBarColor} transition-all duration-150 ease-out`}
            style={{ width: `${inkPercent}%` }}
          />
        </div>
        <span className="text-xs font-mono font-bold text-slate-200 tabular-nums w-10 text-right">
          {Math.round(inkPercent)}%
        </span>
      </div>

      {/* 3. Physics Simulation Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleRunning}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm ${
            isRunning
              ? 'bg-amber-600/90 hover:bg-amber-500 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
          }`}
          title="물리 시뮬레이션 재생/일시정지 (스페이스바)"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRunning ? '일시정지' : '시뮬레이션'}</span>
        </button>

        <button
          onClick={() => onChangeTimeScale(nextSpeed)}
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-medium border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
          title="재생 속도 변경 (1.0x / 1.5x / 0.5x)"
        >
          <Gauge className="w-3 h-3 text-slate-400" />
          <span>{timeScale.toFixed(1)}x</span>
        </button>

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          title="마지막 선 실행 취소 (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onClear}
          className="p-1.5 bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          title="모든 드로잉 지우기"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleHint}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            showHint
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="힌트 가이드 선 보기/숨기기"
        >
          <Lightbulb className="w-4 h-4" />
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          title="현재 레벨 처음부터 다시 시작 (R)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">초기화</span>
        </button>
      </div>
    </div>
  );
};
