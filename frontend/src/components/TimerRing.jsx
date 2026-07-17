import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export default function TimerRing({ isRunning, onTimeUp, theme, maxSeconds = 120, resetKey }) {
  const [secondsLeft, setSecondsLeft] = useState(maxSeconds);

  // Only reset when question changes (resetKey), NOT when isRunning toggles (start/stop recording)
  useEffect(() => {
    setSecondsLeft(maxSeconds);
  }, [resetKey, maxSeconds]);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, onTimeUp]);

  const percentage = (secondsLeft / maxSeconds) * 100;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isLowTime = secondsLeft <= 15;
  const isDark = theme === 'dark';

  let colorClass = isLowTime 
    ? "text-rose-500" 
    : isDark ? "text-indigo-500" : "text-orange-500";

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* SVG Circle Timer */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius}
            className={`stroke-current ${isDark ? 'text-white/5' : 'text-slate-200'}`}
            strokeWidth="3.5"
            fill="transparent"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            className={`stroke-current ${colorClass} transition-all duration-1000`}
            strokeWidth="3.5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute text-[11px] font-mono font-black ${colorClass}`}>
          {secondsLeft}s
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
          <Clock className="w-3 h-3" /> Answer Time Limit
        </span>
        <span className="text-[11px] font-semibold text-slate-500 leading-tight">
          {isLowTime ? "Time running low! Wrap up answer..." : "Focus on STAR structure clarity."}
        </span>
      </div>
    </div>
  );
}
