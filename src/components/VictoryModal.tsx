import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, ArrowRight, Award } from 'lucide-react';
import { sounds } from '../game/sound';

interface VictoryModalProps {
  levelTitle: string;
  levelNumber: number;
  starsEarned: number;
  inkUsed: number;
  maxInk: number;
  timeTaken: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelTitle,
  levelNumber,
  starsEarned,
  inkUsed,
  maxInk,
  timeTaken,
  hasNextLevel,
  onNextLevel,
  onReplay
}) => {
  useEffect(() => {
    sounds.playSuccess();

    // Trigger confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  }, []);

  const inkPercentage = Math.round((inkUsed / maxInk) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white text-center flex flex-col items-center">
        {/* Badge Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
          <Award className="w-9 h-9" />
        </div>

        <span className="text-xs font-mono font-bold text-indigo-400 tracking-wider">
          STAGE {String(levelNumber).padStart(2, '0')} COMPLETED
        </span>
        <h2 className="text-2xl font-black mt-1 mb-1 tracking-tight text-white">
          {levelTitle} 클리어!
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          물리 법칙을 완벽히 활용해 공을 목표 지점으로 이끌었습니다!
        </p>

        {/* Animated Stars */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= starsEarned;
            return (
              <div
                key={starIdx}
                className={`transition-all duration-300 transform ${
                  isEarned ? 'scale-110' : 'opacity-30 scale-90'
                }`}
                style={{ transitionDelay: `${starIdx * 150}ms` }}
              >
                <Star
                  className={`w-9 h-9 ${
                    isEarned
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                      : 'text-slate-600'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="w-full bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 grid grid-cols-2 gap-4 mb-6 text-left">
          <div>
            <div className="text-[11px] text-slate-400">잉크 사용량</div>
            <div className="text-base font-mono font-bold text-slate-100">
              {inkPercentage}% <span className="text-xs text-slate-400 font-normal">({Math.round(inkUsed)}px)</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">소요 시간</div>
            <div className="text-base font-mono font-bold text-slate-100">
              {timeTaken.toFixed(1)}초
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onReplay}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 도전</span>
          </button>

          {hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-98"
            >
              <span>다음 스테이지</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
