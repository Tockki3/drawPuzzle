import React from 'react';
import {
  Circle,
  Square,
  Sparkles,
  Zap,
  ArrowUpCircle,
  Play,
  RotateCcw,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { LevelDefinition } from '../types';

export type SandboxTool = 'none' | 'add_ball' | 'add_cup' | 'add_bouncer' | 'add_star' | 'add_gravity_zone';

interface SandboxToolbarProps {
  activeSandboxTool: SandboxTool;
  onSelectSandboxTool: (tool: SandboxTool) => void;
  onClearCustom: () => void;
  onResetBalls: () => void;
  onExport: () => void;
  onImport: () => void;
  onExitSandbox: () => void;
}

export const SandboxToolbar: React.FC<SandboxToolbarProps> = ({
  activeSandboxTool,
  onSelectSandboxTool,
  onClearCustom,
  onResetBalls,
  onExport,
  onImport,
  onExitSandbox
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 text-white text-xs select-none">
      {/* Object placement tools */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-slate-400 font-medium mr-1.5 hidden sm:inline">물체 배치:</span>

        <button
          onClick={() => onSelectSandboxTool(activeSandboxTool === 'add_ball' ? 'none' : 'add_ball')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeSandboxTool === 'add_ball'
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
          }`}
          title="클릭한 위치에 빨간 구슬을 배치합니다"
        >
          <Circle className="w-3.5 h-3.5 text-red-300" />
          <span>공 추가</span>
        </button>

        <button
          onClick={() => onSelectSandboxTool(activeSandboxTool === 'add_cup' ? 'none' : 'add_cup')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeSandboxTool === 'add_cup'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
          }`}
          title="클릭한 위치에 목표 컵을 배치합니다"
        >
          <Square className="w-3.5 h-3.5 text-blue-300" />
          <span>목표 컵</span>
        </button>

        <button
          onClick={() => onSelectSandboxTool(activeSandboxTool === 'add_bouncer' ? 'none' : 'add_bouncer')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeSandboxTool === 'add_bouncer'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
          }`}
          title="클릭한 위치에 고탄성 반사 패드를 배치합니다"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-300" />
          <span>탄성 패드</span>
        </button>

        <button
          onClick={() => onSelectSandboxTool(activeSandboxTool === 'add_star' ? 'none' : 'add_star')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeSandboxTool === 'add_star'
              ? 'bg-amber-500 text-slate-900 shadow-md font-bold'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
          }`}
          title="클릭한 위치에 수집용 별을 배치합니다"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>별</span>
        </button>

        <button
          onClick={() => onSelectSandboxTool(activeSandboxTool === 'add_gravity_zone' ? 'none' : 'add_gravity_zone')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeSandboxTool === 'add_gravity_zone'
              ? 'bg-purple-500 text-white shadow-md'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
          }`}
          title="클릭한 위치에 반중력 영역을 배치합니다"
        >
          <ArrowUpCircle className="w-3.5 h-3.5 text-purple-300" />
          <span>반중력 존</span>
        </button>
      </div>

      {/* Level operations */}
      <div className="flex items-center gap-2">
        <button
          onClick={onResetBalls}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors cursor-pointer"
          title="공들을 원래 시작 위치로 리셋"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>공 리셋</span>
        </button>

        <button
          onClick={onClearCustom}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-rose-900/60 hover:text-rose-300 text-slate-200 rounded-lg transition-colors cursor-pointer"
          title="모든 배치 요소 초기화"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>전체 초기화</span>
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors cursor-pointer"
          title="내가 만든 레벨 JSON 코드로 내보내기"
        >
          <Download className="w-3.5 h-3.5" />
          <span>내보내기</span>
        </button>

        <button
          onClick={onImport}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors cursor-pointer"
          title="레벨 코드 붙여넣기로 불러오기"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>불러오기</span>
        </button>

        <button
          onClick={onExitSandbox}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors cursor-pointer ml-1"
        >
          퍼즐 모드
        </button>
      </div>
    </div>
  );
};
