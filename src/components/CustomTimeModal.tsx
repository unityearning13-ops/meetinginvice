import React, { useState } from 'react';
import { X, Clock, Plus } from 'lucide-react';
import { TimeOption } from '../types.ts';
import { toBengaliDigits } from '../utils/date.ts';

interface CustomTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (timeOption: TimeOption) => void;
}

export const CustomTimeModal: React.FC<CustomTimeModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [hour, setHour] = useState('08');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('PM');
  const [customLabel, setCustomLabel] = useState('');

  if (!isOpen) return null;

  const getBengaliPrefix = (h: number, p: 'AM' | 'PM') => {
    if (p === 'AM') {
      if (h === 12 || h < 6) return 'রাত';
      return 'সকাল';
    } else {
      if (h === 12 || h < 4) return 'দুপুর';
      if (h >= 4 && h < 6) return 'বিকাল';
      if (h >= 6 && h < 8) return 'সন্ধ্যা';
      return 'রাত';
    }
  };

  const hourNum = parseInt(hour, 10) || 12;
  const prefix = getBengaliPrefix(hourNum, period);
  const formattedEnglish = `${hourNum}:${minute} ${period}`;
  const bnMinutes = minute === '00' ? '' : `:${toBengaliDigits(minute)}`;
  const autoBengali = `${prefix} ${toBengaliDigits(hourNum)}${bnMinutes} টা`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEnglish = formattedEnglish;
    const finalBengali = customLabel.trim() || autoBengali;
    const newOption: TimeOption = {
      id: `custom_${Date.now()}`,
      english: finalEnglish,
      bengali: finalBengali,
      isCustom: true,
    };
    onAdd(newOption);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0b1626] border border-[#1d3557] rounded-2xl w-full max-w-sm p-5 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3 text-blue-400">
          <Clock className="w-5 h-5" />
          <h3 className="font-semibold text-base text-white">নতুন সময় যুক্ত করুন</h3>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          Add custom meeting time for seat booking.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Time Picker Controls */}
          <div className="bg-[#060e1b] border border-[#172b47] rounded-xl p-3 flex items-center justify-center gap-2">
            {/* Hour */}
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="bg-[#0c1c33] text-white border border-[#214370] rounded-lg px-2.5 py-1.5 text-base font-semibold focus:outline-none focus:border-blue-400"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const val = (i + 1).toString().padStart(2, '0');
                return (
                  <option key={val} value={val}>
                    {val}
                  </option>
                );
              })}
            </select>

            <span className="text-xl font-bold text-blue-400">:</span>

            {/* Minute */}
            <select
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              className="bg-[#0c1c33] text-white border border-[#214370] rounded-lg px-2.5 py-1.5 text-base font-semibold focus:outline-none focus:border-blue-400"
            >
              {['00', '15', '30', '45'].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* AM / PM Toggle */}
            <div className="flex bg-[#0c1c33] rounded-lg p-0.5 border border-[#214370]">
              <button
                type="button"
                onClick={() => setPeriod('AM')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  period === 'AM' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setPeriod('PM')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  period === 'PM' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Bengali Preview */}
          <div className="p-3 bg-[#06101f] rounded-xl border border-[#1b3559] text-center">
            <div className="text-[10px] uppercase tracking-wider text-blue-300 font-medium mb-0.5">
              PREVIEW
            </div>
            <div className="text-white font-bold text-base">{formattedEnglish}</div>
            <div className="text-emerald-400 font-bengali text-sm mt-0.5">{autoBengali}</div>
          </div>

          {/* Optional Bangla name */}
          <div>
            <label className="block text-[11px] text-slate-300 mb-1">
              বাংলা বিবরণ (ঐচ্ছিক / Optional Label):
            </label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder={autoBengali}
              className="w-full bg-[#060e1b] border border-[#1c3559] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 font-bengali"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-md shadow-blue-900/30"
            >
              <Plus className="w-3.5 h-3.5" />
              সময় যুক্ত করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
