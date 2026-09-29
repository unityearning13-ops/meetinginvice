import React from 'react';
import { X, PlusCircle, Check, Trash2 } from 'lucide-react';
import { TimeOption } from '../types.ts';

interface TimePickerModalProps {
  isOpen: boolean;
  options: TimeOption[];
  selectedId: string;
  onSelect: (option: TimeOption | null) => void;
  onOpenCustomModal: () => void;
  onDeleteCustom?: (id: string) => void;
  onClose: () => void;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  options,
  selectedId,
  onSelect,
  onOpenCustomModal,
  onDeleteCustom,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#181a20] sm:rounded-2xl rounded-t-3xl border-t sm:border border-[#343a46] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar on mobile */}
        <div className="w-12 h-1.5 bg-slate-600 rounded-full mx-auto mt-3 mb-1 sm:hidden opacity-60" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#292e38]">
          <div>
            <h3 className="font-semibold text-white text-base font-bengali">
              মিটিংয়ের সময় নির্বাচন করুন
            </h3>
            <p className="text-xs text-slate-400">Select Counselling Meeting Time</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options list matching Screenshot 2 */}
        <div className="overflow-y-auto divide-y divide-[#262b35] py-1">
          {/* Empty / reset option */}
          <div
            onClick={() => {
              onSelect(null);
              onClose();
            }}
            className={`flex items-center justify-between px-5 py-3.5 cursor-pointer active:bg-white/5 transition-colors ${
              !selectedId ? 'bg-teal-950/20' : ''
            }`}
          >
            <span className="text-slate-300 font-bengali text-base">-- সময় নির্বাচন করুন --</span>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                !selectedId
                  ? 'border-teal-400 bg-teal-500/20'
                  : 'border-slate-500 bg-transparent'
              }`}
            >
              {!selectedId && <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />}
            </div>
          </div>

          {/* Preset & Custom Options */}
          {options.map((option) => {
            const isSelected = selectedId === option.id;
            return (
              <div
                key={option.id}
                onClick={() => {
                  onSelect(option);
                  onClose();
                }}
                className={`flex items-center justify-between px-5 py-3.5 cursor-pointer active:bg-white/5 transition-colors group ${
                  isSelected ? 'bg-teal-950/25' : ''
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-base font-bengali tracking-wide">
                      {option.bengali}
                    </span>
                    {option.isCustom && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700/50">
                        Custom
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-sans">{option.english}</span>
                </div>

                <div className="flex items-center gap-3">
                  {option.isCustom && onDeleteCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustom(option.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors opacity-80 hover:opacity-100"
                      title="Remove custom time"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Radio indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-teal-400 bg-teal-500/20'
                        : 'border-slate-500 bg-transparent group-hover:border-slate-400'
                    }`}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add custom time button */}
        <div className="p-4 border-t border-[#292e38] bg-[#12141a]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCustomModal();
            }}
            className="w-full py-3 px-4 rounded-xl border border-dashed border-teal-500/60 bg-teal-950/30 hover:bg-teal-900/40 text-teal-300 font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-teal-400" />
            <span>অন্য কোনো সময় যুক্ত করুন (Add custom time)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
