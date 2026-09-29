import React from 'react';
import { GraduationCap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="pt-2 pb-2 px-2 text-center select-none">
      <div className="inline-flex items-center justify-center gap-2.5 mb-1">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-900/50 text-white border border-blue-400/30">
          <GraduationCap className="w-4 h-4 stroke-[2.4]" />
        </div>
        <h1 className="font-serif-title text-2xl font-bold tracking-tight text-white drop-shadow-sm">
          Unity Earning
        </h1>
      </div>
      <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-blue-400 font-bold">
        E-LEARNING PLATFORM
      </p>
    </header>
  );
};
