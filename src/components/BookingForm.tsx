import React, { useState, useEffect } from 'react';
import {
  History,
  ClipboardPaste,
  Check,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { BookingRecord, TimeOption } from '../types.ts';
import { generateInvoiceNo, DEFAULT_CODES, getStoredCounsellorName, saveStoredCounsellorName } from '../utils/storage.ts';
import { formatDateTimeBangladesh } from '../utils/date.ts';

interface BookingFormProps {
  timeOptions: TimeOption[];
  onOpenCustomModal: () => void;
  selectedTime: TimeOption | null;
  onSelectTime: (option: TimeOption) => void;
  onOpenHistory: () => void;
  historyCount: number;
  onBookingSuccess: (booking: BookingRecord) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  timeOptions,
  onOpenCustomModal,
  selectedTime,
  onSelectTime,
  onOpenHistory,
  historyCount,
  onBookingSuccess,
  onShowToast,
}) => {
  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [idCode, setIdCode] = useState(DEFAULT_CODES.idCode);
  const [meetingCode, setMeetingCode] = useState(DEFAULT_CODES.meetingCode);
  const [seatCode, setSeatCode] = useState(DEFAULT_CODES.seatCode);
  const [counsellorName, setCounsellorName] = useState(() => getStoredCounsellorName());

  // Errors state
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    meetingTime?: string;
  }>({});

  // Auto-select evening 7:00 PM if no time selected
  useEffect(() => {
    if (!selectedTime && timeOptions.length > 0) {
      const defaultOption =
        timeOptions.find((t) => t.english.includes('7:00 PM')) || timeOptions[0];
      if (defaultOption) {
        onSelectTime(defaultOption);
      }
    }
  }, [timeOptions, selectedTime, onSelectTime]);

  // Clean phone input and extract numbers
  const sanitizePhoneNumber = (val: string): string => {
    return val.replace(/[^0-9+]/g, '');
  };

  // Paste action for Phone input (Right-side button)
  const handlePastePhone = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const trimmed = text.trim();
          const cleanPhone = sanitizePhoneNumber(trimmed);

          if (cleanPhone.length >= 6) {
            setPhone(cleanPhone);
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
            onShowToast(`নম্বর "${cleanPhone}" পেস্ট করা হয়েছে!`, 'success');
          } else {
            setPhone(trimmed);
            onShowToast('ক্লিপবোর্ডের টেক্সট পেস্ট করা হয়েছে', 'info');
          }
        } else {
          onShowToast('ক্লিপবোর্ডে কোনো লেখা পাওয়া যায়নি', 'error');
        }
      } else {
        onShowToast('ক্লিপবোর্ড পারমিশন পাওয়া যায়নি', 'error');
      }
    } catch {
      onShowToast('ক্লিপবোর্ড রিড করা সম্ভব হয়নি, ম্যানুয়ালি পেস্ট করুন', 'error');
    }
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { fullName?: string; phone?: string; meetingTime?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'দয়া করে আপনার নাম লিখুন';
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      newErrors.phone = 'দয়া করে মোবাইল নম্বর লিখুন';
    } else if (cleanPhone.length < 8) {
      newErrors.phone = 'সঠিক মোবাইল নম্বর লিখুন (কমপক্ষে ৮ সংখ্যা)';
    }

    if (!selectedTime) {
      newErrors.meetingTime = 'দয়া করে মিটিং টাইম সিলেক্ট করুন';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      onShowToast('ফর্মের প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন', 'error');
      return;
    }

    const now = new Date();
    const dtInfo = formatDateTimeBangladesh(now);
    const invoiceNo = generateInvoiceNo();

    // Persist counsellor name automatically
    if (counsellorName.trim()) {
      saveStoredCounsellorName(counsellorName);
    }

    const newBooking: BookingRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      invoiceNo,
      fullName: fullName.trim(),
      phone: phone.trim(),
      idCode: idCode.trim() || DEFAULT_CODES.idCode,
      meetingCode: meetingCode.trim() || DEFAULT_CODES.meetingCode,
      seatCode: seatCode.trim() || DEFAULT_CODES.seatCode,
      teamCode: seatCode.trim() || DEFAULT_CODES.seatCode,
      counsellorName: counsellorName.trim() || undefined,
      meetingTime: selectedTime!.english,
      meetingTimeBengali: selectedTime!.bengali,
      meetingDate: dtInfo.dateEnglish,
      meetingDateBengali: dtInfo.dateBengali,
      bookingTimestamp: now.getTime(),
      bookingDateTimeStr: dtInfo.english,
      bookingDateTimeBengaliStr: dtInfo.bengali,
    };

    onBookingSuccess(newBooking);
    onShowToast('সিট বুকিং নিশ্চিত হয়েছে!', 'success');
  };

  const handleSaveCounsellor = () => {
    saveStoredCounsellorName(counsellorName);
    if (counsellorName.trim()) {
      onShowToast(`কাউন্সিলর "${counsellorName.trim()}" সেভ রাখা হয়েছে!`, 'success');
    } else {
      onShowToast('কাউন্সিলরের নাম খালি রাখা হয়েছে', 'info');
    }
  };

  const handleClearCounsellor = () => {
    setCounsellorName('');
    saveStoredCounsellorName('');
    onShowToast('কাউন্সিলরের নাম রিমুভ করা হয়েছে', 'info');
  };

  return (
    <div className="w-full max-w-[410px] mx-auto py-2">
      {/* Elegantly Proportioned Form Card */}
      <div className="relative bg-gradient-to-b from-[#091424] via-[#07101d] to-[#040914] border border-[#1b3354] rounded-3xl p-5 sm:p-6 shadow-2xl">
        {/* Subtle Top Blue Accent Line */}
        <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

        {/* History Button at Top-Right */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="absolute top-4 right-4 h-8 px-2.5 rounded-xl bg-[#0d1e34] border border-blue-500/30 text-blue-300 hover:text-white hover:bg-blue-600/30 hover:border-blue-400/50 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
          title="বুকিং হিস্ট্রি দেখুন"
        >
          <History className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold">হিস্ট্রি</span>
          {historyCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-600 text-white rounded-full font-mono">
              {historyCount}
            </span>
          )}
        </button>

        {/* Card Header & Level Hierarchy */}
        <div className="text-center pt-1 pb-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-blue-400 font-bold">
            COUNSELLING MEETING
          </p>
          <h2 className="font-serif-title text-2xl font-bold text-white mt-0.5 tracking-tight">
            Seat Booking Form
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-bengali">
            মিটিং সিট নিশ্চিত করতে নিচের তথ্যগুলো পূরণ করুন
          </p>
        </div>

        {/* Form Body - Proper Labels, Heights, and Spacing */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Level 1: Full Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-200">
                FULL NAME <span className="text-blue-400">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-bengali">আপনার পূর্ণ নাম</span>
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              placeholder="আপনার নাম লিখুন"
              className={`w-full h-11 bg-[#040a14] text-white placeholder-slate-500 rounded-xl px-3.5 text-sm border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                errors.fullName
                  ? 'border-rose-500 focus:border-rose-400'
                  : 'border-[#1b3354] focus:border-blue-500'
              }`}
            />
            {errors.fullName && (
              <p className="text-rose-400 text-xs mt-1 font-bengali flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Level 2: Phone Number with Paste Button Aligned on the Right */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-200">
                PHONE NUMBER <span className="text-blue-400">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-bengali">মোবাইল নম্বর</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Phone Input */}
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="মোবাইল নম্বর লিখুন"
                className={`flex-1 h-11 bg-[#040a14] text-white placeholder-slate-500 rounded-xl px-3.5 text-sm border font-mono tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                  errors.phone
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-[#1b3354] focus:border-blue-500'
                }`}
              />

              {/* Matching Height Paste Button on the Right */}
              <button
                type="button"
                onClick={handlePastePhone}
                className="h-11 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:from-blue-700 active:to-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 active:scale-95 transition-all shadow-md shadow-blue-900/40 cursor-pointer border border-blue-400/30"
                title="ক্লিপবোর্ড থেকে নম্বর পেস্ট করুন"
              >
                <ClipboardPaste className="w-4 h-4" />
                <span>পেস্ট</span>
              </button>
            </div>
            {errors.phone && (
              <p className="text-rose-400 text-xs mt-1 font-bengali flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>

          {/* Level 3: ID Code (Editable) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-200">
                ID CODE
              </label>
              <span className="text-[10px] text-slate-400 font-mono">EDITABLE</span>
            </div>
            <input
              type="text"
              value={idCode}
              onChange={(e) => setIdCode(e.target.value)}
              className="w-full h-11 bg-[#040a14] text-blue-300 font-bold rounded-xl px-3.5 text-sm border border-[#1b3354] font-mono tracking-wider focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* Level 4: Meeting Code (Editable) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-200">
                MEETING CODE
              </label>
              <span className="text-[10px] text-slate-400 font-mono">EDITABLE</span>
            </div>
            <input
              type="text"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              className="w-full h-11 bg-[#040a14] text-blue-300 font-bold rounded-xl px-3.5 text-sm border border-[#1b3354] font-mono tracking-wider focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* Level 5: Professional Seat Code (Editable) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-200">
                SEAT CODE
              </label>
              <span className="text-[10px] text-slate-400 font-mono">EDITABLE</span>
            </div>
            <input
              type="text"
              value={seatCode}
              onChange={(e) => setSeatCode(e.target.value)}
              className="w-full h-11 bg-[#040a14] text-white font-bold rounded-xl px-3.5 text-sm border border-[#1b3354] font-mono tracking-wider focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* Level 6: Counsellor Name (Persistent / Fixed with Auto-Save & Edit) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-200 flex items-center gap-1.5">
                <span>COUNSELLOR NAME</span>
                <span className="text-[10px] text-emerald-400 font-normal font-bengali">(ফিক্সড / অটো সেভ)</span>
              </label>
              <div className="flex items-center gap-1.5">
                {counsellorName && (
                  <button
                    type="button"
                    onClick={handleClearCounsellor}
                    className="text-[10px] text-slate-400 hover:text-rose-400 font-bengali transition-colors cursor-pointer px-1 py-0.5"
                  >
                    রিমুভ
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveCounsellor}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:bg-blue-600 hover:text-white transition-all cursor-pointer font-bengali"
                >
                  সেভ রাখুন
                </button>
              </div>
            </div>
            <input
              type="text"
              value={counsellorName}
              onChange={(e) => {
                setCounsellorName(e.target.value);
                saveStoredCounsellorName(e.target.value);
              }}
              placeholder="কাউন্সিলরের নাম লিখুন"
              className="w-full h-11 bg-[#040a14] text-white font-medium rounded-xl px-3.5 text-sm border border-[#1b3354] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all placeholder-slate-500"
            />
          </div>

          {/* Level 6: Meeting Time Selector - Fast 1-Tap Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-200">
                MEETING TIME <span className="text-blue-400">*</span>
              </label>
              {selectedTime && (
                <span className="text-xs font-sans font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{selectedTime.english}</span>
                </span>
              )}
            </div>

            {/* Quick 1-Tap Time Options Grid in Clear English */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeOptions.slice(0, 5).map((opt) => {
                const isSelected = selectedTime?.id === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSelectTime(opt);
                      if (errors.meetingTime) setErrors((prev) => ({ ...prev, meetingTime: undefined }));
                    }}
                    className={`h-10 px-2 rounded-xl text-xs font-sans font-bold transition-all text-center border cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/50 scale-[1.02]'
                        : 'bg-[#040a14] text-slate-300 border-[#1b3354] hover:border-blue-500/60 hover:text-white hover:bg-[#0b172a]'
                    }`}
                  >
                    <span>{opt.english}</span>
                  </button>
                );
              })}

              {/* Add Custom Time Button in grid */}
              <button
                type="button"
                onClick={onOpenCustomModal}
                className="h-10 px-2 rounded-xl text-xs font-sans font-bold transition-all text-center border border-dashed border-blue-500/60 bg-[#071324] text-blue-300 hover:bg-blue-900/40 hover:text-white flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>+ Custom</span>
              </button>
            </div>

            {errors.meetingTime && (
              <p className="text-rose-400 text-xs mt-1.5 font-bengali flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.meetingTime}</span>
              </p>
            )}
          </div>

          {/* Subtext info notice */}
          <div className="pt-1 text-center">
            <p className="text-[11px] text-slate-400 font-bengali">
              ID Code ও Meeting Code স্বয়ংক্রিয়ভাবে নির্ধারিত, প্রয়োজনে পরিবর্তনযোগ্য
            </p>
          </div>

          {/* Primary Submit Button - Level Hierarchy Accent */}
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-400 active:from-blue-700 active:to-blue-600 text-white font-bold text-sm shadow-xl shadow-blue-950/60 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer font-bengali border border-blue-400/30"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>সিট বুকিং নিশ্চিত করুন</span>
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-3 text-center text-[11px] text-slate-500 font-medium">
        © Unity Earning E-Learning Platform
      </div>
    </div>
  );
};
