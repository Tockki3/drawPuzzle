import React from 'react';
import { X, PenTool, Anchor, Pin, Eraser, Star, Compass, Keyboard } from 'lucide-react';

interface InstructionsModalProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold">물리 드로잉 퍼즐 가이드</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {/* Section 1: Core Mechanics */}
          <div>
            <h3 className="text-base font-semibold text-slate-100 mb-2.5 flex items-center gap-2">
              <span>✏️ 드로잉 도구 활용법</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
                  <PenTool className="w-4 h-4" />
                  <span>자유 낙하 (Dynamic)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  선을 그리면 즉시 실제 무게와 중력을 갖는 물리적 강체가 됩니다. 경사로, 지렛대, 무게추를 직접 만들어 물체를 밀어보세요.
                </p>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <Anchor className="w-4 h-4" />
                  <span>고정 지지대 (Static)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  공중에 단단히 고정되어 떨어지지 않는 영구적인 다리나 미끄럼틀을 만듭니다. 복잡한 낙하 코스에 필수적입니다.
                </p>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                  <Pin className="w-4 h-4" />
                  <span>회전 힌지 (Pivot)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  첫 번째 그린 좌표에 고정 회전 핀이 꽂힙니다. 시계추처럼 스윙하거나 투석기처럼 회전하는 도구를 만들 수 있습니다.
                </p>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                  <Eraser className="w-4 h-4" />
                  <span>지우개 & 잉크 환불</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  지우개 모드로 그린 물체를 클릭하면 해당 물체가 제거되며 사용했던 잉크가 즉시 복구됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Star Evaluation */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-100 mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>3스타 달성 조건</span>
            </h3>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong className="text-slate-200">기본 1스타</strong>: 공이 목표 컵 안으로 완전히 골인하면 클리어.</li>
              <li><strong className="text-slate-200">2스타</strong>: 맵에 흩어진 황금 별 2개 이상을 획득하거나 적은 잉크로 해결.</li>
              <li><strong className="text-slate-200">3스타 (완벽 클리어)</strong>: 모든 황금 별(3개)을 획득하고 잉크 예산 한도 내에서 골인!</li>
            </ul>
          </div>

          {/* Section 3: Keyboard Shortcuts */}
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-2 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-slate-400" />
              <span>단축키 안내</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-800/70 p-2 rounded-lg border border-slate-700/60 flex flex-col">
                <span className="font-mono font-bold text-indigo-300">Space</span>
                <span className="text-[11px] text-slate-400">재생 / 일시정지</span>
              </div>
              <div className="bg-slate-800/70 p-2 rounded-lg border border-slate-700/60 flex flex-col">
                <span className="font-mono font-bold text-indigo-300">Ctrl + Z</span>
                <span className="text-[11px] text-slate-400">마지막 선 취소</span>
              </div>
              <div className="bg-slate-800/70 p-2 rounded-lg border border-slate-700/60 flex flex-col">
                <span className="font-mono font-bold text-indigo-300">R</span>
                <span className="text-[11px] text-slate-400">레벨 초기화</span>
              </div>
              <div className="bg-slate-800/70 p-2 rounded-lg border border-slate-700/60 flex flex-col">
                <span className="font-mono font-bold text-indigo-300">H</span>
                <span className="text-[11px] text-slate-400">힌트 가이드</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
          >
            이해했습니다, 플레이하기
          </button>
        </div>
      </div>
    </div>
  );
};
