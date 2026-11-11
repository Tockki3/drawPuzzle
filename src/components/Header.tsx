import React from 'react';
import { Volume2, VolumeX, Sparkles, Box, BookOpen, Layers } from 'lucide-react';

interface HeaderProps {
  onOpenLevels: () => void;
  onOpenSandbox: () => void;
  onOpenGuide: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentLevelTitle: string;
  totalStars: number;
  isSandbox: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLevels,
  onOpenSandbox,
  onOpenGuide,
  isMuted,
  onToggleMute,
  currentLevelTitle,
  totalStars,
  isSandbox,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-white select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
          ✏️
        </div>
        <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
          Physics Draw
        </span>
        <span className="text-xs text-slate-400 border-l border-slate-700 pl-3 hidden sm:inline whitespace-nowrap">
          {isSandbox ? '샌드박스 공작소' : currentLevelTitle}
        </span>
      </div>

      {/* Zone 2: 4 concise single-line nav links */}
      <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={onOpenLevels}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>레벨 목록</span>
          <span className="text-xs text-amber-400 font-semibold ml-1">★ {totalStars}</span>
        </button>

        <button
          onClick={onOpenSandbox}
          className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            isSandbox ? 'text-indigo-400 font-semibold' : ''
          }`}
        >
          <Box className="w-4 h-4 text-emerald-400" />
          <span>{isSandbox ? '퍼즐로 돌아가기' : '샌드박스'}</span>
        </button>

        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer hidden md:flex"
        >
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span>도움말</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleMute}
          title={isMuted ? '음소거 해제' : '음소거'}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenLevels}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          스테이지 변경
        </button>
      </div>
    </header>
  );
};
