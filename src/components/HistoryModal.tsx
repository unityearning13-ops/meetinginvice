import React, { useState } from 'react';
import { X, Search, Copy, Check, Trash2, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { BookingRecord } from '../types.ts';

interface HistoryModalProps {
  isOpen: boolean;
  bookings: BookingRecord[];
  onSelectBooking: (booking: BookingRecord) => void;
  onClearHistory: () => void;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  bookings,
  onSelectBooking,
  onClearHistory,
  onClose,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleCopyPhone = (e: React.MouseEvent, phone: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    onShowToast(`মোবাইল নম্বর ${phone} কপি করা হয়েছে!`, 'success');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchTerm.toLowerCase();
    return (
      b.fullName.toLowerCase().includes(q) ||
      b.phone.includes(q) ||
      b.idCode.toLowerCase().includes(q) ||
      b.meetingCode.toLowerCase().includes(q) ||
      b.invoiceNo.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#0a1220] sm:rounded-2xl rounded-t-2xl border-t sm:border border-[#1a2f4c] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag indicator */}
        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mt-2.5 mb-1 sm:hidden opacity-60" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#162740]">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>বুকিং হিস্ট্রি (History)</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40">
                {bookings.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">সকল বুকিং তালিকা</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        {bookings.length > 0 && (
          <div className="p-3 border-b border-[#162740] bg-[#060c17]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, phone or code..."
                className="w-full bg-[#0c182b] border border-[#1d3557] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Booking list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {bookings.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400 mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-slate-300 font-semibold text-sm mb-0.5">কোনো বুকিং সংরক্ষিত নেই</h4>
              <p className="text-xs text-slate-500">বুকিং করলে এখানে তালিকা দেখতে পাবেন</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400">"{searchTerm}" এর জন্য কোনো ফলাফল নেই</p>
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  onSelectBooking(b);
                  onClose();
                }}
                className="bg-[#0b1629] hover:bg-[#0f203a] border border-[#192f4e] hover:border-blue-500/60 rounded-xl p-3 transition-all cursor-pointer group shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors">
                        {b.fullName}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#070f1a] text-blue-400 border border-[#1b3459]">
                        {b.invoiceNo}
                      </span>
                    </div>

                    {/* Phone with copy button */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-slate-200">{b.phone}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyPhone(e, b.phone, b.id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                          copiedId === b.id
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-blue-950/80 text-blue-300 border border-blue-800/60 hover:bg-blue-900'
                        }`}
                        title="Copy Phone"
                      >
                        {copiedId === b.id ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-lg bg-[#07111e] text-slate-400 group-hover:text-blue-400 transition-colors shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Codes & Time */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#15253d] text-[11px]">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Time:</span>
                    <span className="font-bengali font-semibold text-emerald-400">
                      {b.meetingTimeBengali}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Codes:</span>
                    <span className="font-mono text-blue-400 font-semibold text-[10px]">
                      ID:{b.idCode} | M:{b.meetingCode}
                    </span>
                  </div>
                </div>

                <div className="mt-1 pt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-bengali">{b.bookingDateTimeBengaliStr}</span>
                  <span className="text-blue-400 font-medium group-hover:underline">
                    রসিদ দেখুন →
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Clear Data */}
        {bookings.length > 0 && (
          <div className="p-3 border-t border-[#162740] bg-[#060c17] flex items-center justify-between">
            <span className="text-[11px] text-slate-400">মোট {bookings.length} টি বুকিং</span>
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-2.5 py-1.5 rounded-lg border border-rose-900/60 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Data</span>
            </button>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showClearConfirm && (
          <div className="absolute inset-0 z-20 bg-black/85 backdrop-blur-sm p-5 flex flex-col items-center justify-center text-center animate-in fade-in">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">সকল ডেটা মুছে ফেলবেন?</h4>
            <p className="text-xs text-slate-300 mb-4 max-w-xs">
              আপনি কি নিশ্চিত যে সকল {bookings.length} টি বুকিং রেকর্ড মুছে ফেলতে চান?
            </p>
            <div className="flex gap-2 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                  onShowToast('সকল ইতিহাস মুছে ফেলা হয়েছে', 'info');
                }}
                className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
