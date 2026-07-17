import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function QuestionStepper({ questions, currentIndex, answerScores, onSelectQuestion, theme }) {
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-2 p-3 border rounded-2xl overflow-x-auto select-none ${
      isDark ? 'bg-black/10 border-white/5' : 'bg-orange-50/40 border-orange-200/20'
    }`}>
      {questions.map((q, idx) => {
        const isActive = idx === currentIndex;
        const isAnswered = !!answerScores[q.id];

        let stateClasses = "";
        if (isActive) {
          stateClasses = isDark 
            ? "bg-indigo-600/20 border-indigo-500 text-indigo-400 font-extrabold ring-2 ring-indigo-500/20 animate-pulse" 
            : "bg-orange-100 border-orange-500 text-orange-700 font-extrabold ring-2 ring-orange-500/25";
        } else if (isAnswered) {
          stateClasses = isDark 
            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20" 
            : "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100/60";
        } else {
          stateClasses = isDark 
            ? "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200" 
            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50";
        }

        return (
          <button
            key={q.id}
            onClick={() => onSelectQuestion(idx)}
            className={`flex-shrink-0 px-4 py-2 border rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${stateClasses}`}
          >
            <span>Q{idx + 1}</span>
            {isAnswered ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            ) : (
              <Circle className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-indigo-500 dark:bg-sky-400' : 'bg-slate-400'}`} />
            )}
          </button>
        );
      })}
    </div>
  );
}
