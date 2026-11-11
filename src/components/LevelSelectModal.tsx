import React from 'react';
import { X, Star, Lock, CheckCircle2, Trophy } from 'lucide-react';
import { LevelDefinition, LevelProgress } from '../types';

interface LevelSelectModalProps {
  levels: LevelDefinition[];
  currentLevelId: number;
  progressMap: Map<number, LevelProgress>;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
  onUnlockAll?: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  levels,
  currentLevelId,
  progressMap,
  onSelectLevel,
  onClose,
  onUnlockAll
}) => {
  const totalStars = Array.from(progressMap.values()).reduce((sum, p) => sum + p.starsEarned, 0);
  const maxPossibleStars = levels.length * 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold">스테이지 선택</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>획득한 별: {totalStars} / {maxPossibleStars}</span>
                <span aria-hidden="true">·</span>
                <span>총 {levels.length}개 퍼즐</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onUnlockAll && (
              <button
                onClick={onUnlockAll}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
              >
                모든 레벨 잠금 해제
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Level Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {levels.map((lvl) => {
            const progress = progressMap.get(lvl.id);
            const isUnlocked = progress?.unlocked ?? (lvl.id === 1);
            const isCurrent = lvl.id === currentLevelId;
            const stars = progress?.starsEarned ?? 0;
            const isCompleted = progress?.completed ?? false;

            return (
              <button
                key={lvl.id}
                disabled={!isUnlocked}
                onClick={() => {
                  onSelectLevel(lvl.id);
                  onClose();
                }}
                className={`relative p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[105px] ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50 shadow-lg'
                    : isUnlocked
                    ? 'border-slate-800 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800 shadow-sm'
                    : 'border-slate-800/50 bg-slate-900/50 opacity-45 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    STAGE {String(lvl.id).padStart(2, '0')}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : !isUnlocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  ) : null}
                </div>

                <div className="my-1.5">
                  <div className="text-sm font-semibold text-slate-100 truncate">
                    {lvl.title}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {lvl.titleEn}
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-3.5 h-3.5 ${
                        starIdx <= stars
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
