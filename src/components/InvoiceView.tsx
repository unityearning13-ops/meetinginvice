import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import { 
  Download, 
  ArrowLeft, 
  Check, 
  Calendar, 
  User, 
  Phone, 
  CreditCard, 
  Users, 
  Layers, 
  Clock,
  UserCheck,
  Globe 
} from 'lucide-react';
import { BookingRecord } from '../types.ts';

interface InvoiceViewProps {
  booking: BookingRecord;
  onNewBooking: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
  booking,
  onNewBooking,
  onShowToast,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Generate QR code for www.unityearning.com on mount
  useEffect(() => {
    QRCode.toDataURL('https://www.unityearning.com', {
      width: 120,
      margin: 1,
      color: {
        dark: '#0a3568',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, []);

  // Download Invoice action with guaranteed rounded corners in PNG
  const handleDownloadInvoice = async () => {
    if (!invoiceRef.current || isDownloading) return;
    setIsDownloading(true);
    onShowToast('ইনভয়েস ডাউনলোড হচ্ছে...', 'info');

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 150));

      const element = invoiceRef.current;
      const pixelRatio = 3;

      // Capture element as high-res PNG without forcing solid background
      const rawDataUrl = await toPng(element, {
        pixelRatio,
        cacheBust: true,
        skipFonts: true,
      });

      // Clip canvas with rounded corners so the downloaded PNG is genuinely rounded
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = rawDataUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      let blob: Blob | null = null;
      if (ctx) {
        const radius = 28 * pixelRatio; // 28px border-radius
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(0, 0, canvas.width, canvas.height, radius);
        } else {
          ctx.moveTo(radius, 0);
          ctx.lineTo(canvas.width - radius, 0);
          ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
          ctx.lineTo(canvas.width, canvas.height - radius);
          ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
          ctx.lineTo(radius, canvas.height);
          ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
          ctx.closePath();
        }
        ctx.clip();
        ctx.drawImage(img, 0, 0);

        // Draw smooth rounded border stroke
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5 * pixelRatio;
        ctx.stroke();

        const finalDataUrl = canvas.toDataURL('image/png');
        const res = await fetch(finalDataUrl);
        blob = await res.blob();
      } else {
        const res = await fetch(rawDataUrl);
        blob = await res.blob();
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `UnityEarning_${booking.invoiceNo}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 10000);
        onShowToast('ইনভয়েস সফলভাবে ডাউনলোড হয়েছে!', 'success');
      }
    } catch (err) {
      console.error('Download failed', err);
      onShowToast('ইনভয়েস ডাউনলোড ব্যর্থ হয়েছে। স্ক্রিনশট নিন।', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto py-1 flex flex-col justify-center animate-in fade-in duration-200">
      {/* Top tiny navigation */}
      <div className="flex items-center justify-between mb-1.5 px-1.5">
        <button
          onClick={onNewBooking}
          className="text-xs text-blue-400 hover:text-white flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>নতুন বুকিং (New Booking)</span>
        </button>
        <span className="text-[10px] font-mono text-slate-400 font-semibold">{booking.invoiceNo}</span>
      </div>

      {/* Smoothly Curved, Elegantly Proportioned Card with Modern Rounded Corners */}
      <div
        ref={invoiceRef}
        id="invoice-card"
        style={{
          borderRadius: '28px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          border: '1.5px solid #cbd5e1',
        }}
        className="relative shadow-xl text-slate-800 px-4 py-3.5 sm:px-5 sm:py-4"
      >
        {/* Subtle Accent Corner Wave */}
        <div className="absolute top-0 left-0 w-28 h-20 pointer-events-none z-0 overflow-hidden rounded-tl-[28px]">
          <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M-10 -10 Q 60 20 25 70 C 10 90 -20 90 -20 90 Z"
              fill="#0284c7"
              opacity="0.10"
            />
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative z-10">
          {/* Header: Pure Company Name Large + E-Learning Platform */}
          <div className="text-center pb-2 border-b border-slate-100">
            <h1 className="text-3xl sm:text-[34px] font-black tracking-tight font-sans leading-none">
              <span className="text-[#0a3568]">Unity </span>
              <span className="text-[#16a34a]">Earning</span>
            </h1>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-slate-500 mt-1.5 leading-none">
              E - L E A R N I N G &nbsp; P L A T F O R M
            </p>
          </div>

          {/* Banner: COUNSELLING MEETING SEAT BOOKING RECEIPT with Soft Curves */}
          <div className="mt-2 rounded-2xl bg-gradient-to-r from-[#10b981] via-[#0d9488] to-[#0284c7] px-3 py-1.5 text-white shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <Calendar className="w-3 h-3 text-white" />
              </div>
              <h2 className="font-sans font-bold text-[10.5px] sm:text-xs tracking-wider uppercase text-white drop-shadow-xs">
                COUNSELLING MEETING SEAT BOOKING RECEIPT
              </h2>
            </div>
          </div>

          {/* Date & Confirmed Status Strip */}
          <div className="mt-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-[10.5px] text-slate-800 font-sans">
                {booking.bookingDateTimeStr} (BST)
              </span>
            </div>
            <div className="bg-[#10b981] text-white px-2 py-0.5 rounded-full text-[9.5px] font-bold flex items-center gap-1 shrink-0 shadow-2xs">
              <Check className="w-2.5 h-2.5 stroke-[3.5]" />
              <span>Confirmed</span>
            </div>
          </div>

          {/* Main Details Table Card with Soft Rounded Corners */}
          <div className="mt-1.5 bg-white border border-slate-200/80 rounded-2xl px-3 py-0.5 shadow-2xs">
            {/* NAME - strictly 1 line, never wrapping to 2nd line */}
            <div className="flex items-center justify-between py-1 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-5.5 h-5.5 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                  <User className="w-3 h-3" />
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  NAME
                </span>
              </div>
              <span className="font-bold text-slate-900 text-xs sm:text-[13px] text-right whitespace-nowrap truncate min-w-0 flex-1">
                {booking.fullName}
              </span>
            </div>

            {/* PHONE */}
            <div className="flex items-center justify-between py-1 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-5.5 h-5.5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Phone className="w-3 h-3" />
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  PHONE
                </span>
              </div>
              <span className="font-bold font-mono text-slate-900 text-xs sm:text-[13px] text-right whitespace-nowrap">
                {booking.phone}
              </span>
            </div>

            {/* ID CODE */}
            <div className="flex items-center justify-between py-1 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-5.5 h-5.5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <CreditCard className="w-3 h-3" />
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  ID CODE
                </span>
              </div>
              <span className="font-bold font-mono text-blue-600 text-xs sm:text-[13px] text-right tracking-wide whitespace-nowrap">
                {booking.idCode}
              </span>
            </div>

            {/* MEETING CODE */}
            <div className="flex items-center justify-between py-1 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-5.5 h-5.5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Users className="w-3 h-3" />
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  MEETING CODE
                </span>
              </div>
              <span className="font-bold font-mono text-emerald-600 text-xs sm:text-[13px] text-right tracking-wide whitespace-nowrap">
                {booking.meetingCode}
              </span>
            </div>

            {/* SEAT CODE */}
            <div className="flex items-center justify-between py-1 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-5.5 h-5.5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Layers className="w-3 h-3" />
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  SEAT CODE
                </span>
              </div>
              <span className="font-bold font-mono text-slate-900 text-xs sm:text-[13px] text-right whitespace-nowrap">
                {booking.seatCode || booking.teamCode}
              </span>
            </div>

            {/* MEETING TIME */}
            <div className="flex items-center justify-between py-1 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-5.5 h-5.5 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                  <Clock className="w-3 h-3" />
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  MEETING TIME
                </span>
              </div>
              <span className="font-bold text-emerald-600 text-xs sm:text-[13px] text-right tracking-wide whitespace-nowrap">
                {booking.meetingTime}
              </span>
            </div>

            {/* COUNSELLOR NAME (Below Meeting Time) */}
            <div className="flex items-center justify-between py-1 gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-5.5 h-5.5 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                  <UserCheck className="w-3 h-3" />
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  COUNSELLOR
                </span>
              </div>
              <span className="font-bold text-slate-900 text-xs sm:text-[13px] text-right whitespace-nowrap truncate min-w-0 flex-1">
                {booking.counsellorName || 'Unity Earning'}
              </span>
            </div>
          </div>

          {/* Bengali Confirmation Box - Rounded & Comfortable */}
          <div 
            style={{ 
              backgroundColor: '#f0fdf4', 
              border: '1px solid #bbf7d0', 
              borderRadius: '14px', 
              padding: '6px 10px', 
              marginTop: '5px' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                style={{ 
                  width: '22px', 
                  height: '22px', 
                  borderRadius: '50%', 
                  backgroundColor: '#10b981', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0, 
                  color: '#ffffff' 
                }}
              >
                <Check className="w-3.5 h-3.5 stroke-[3.5]" />
              </div>
              <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                <div 
                  style={{ 
                    color: '#064e3b', 
                    fontWeight: 700, 
                    fontSize: '11px', 
                    lineHeight: '15px', 
                    marginBottom: '1px' 
                  }} 
                  className="font-bengali"
                >
                  আপনার সিট বুকিং সম্পন্ন হয়েছে।
                </div>
                <div 
                  style={{ 
                    color: '#047857', 
                    fontWeight: 500, 
                    fontSize: '10px', 
                    lineHeight: '14px' 
                  }} 
                  className="font-bengali"
                >
                  {booking.meetingTime} এ মিটিং লিংক দেওয়া হবে, অনুগ্রহ করে মিটিংয়ে জয়েন করবেন।
                </div>
              </div>
            </div>
          </div>

          {/* Sleek, Rounded Footer Frame with QR Code & Website Address */}
          <div className="mt-2 p-1.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between px-2.5">
            {/* Left: Website & Copyright */}
            <div className="text-left">
              <div className="flex items-center gap-1 text-[10.5px] font-semibold text-slate-700 font-mono">
                <Globe className="w-3 h-3 text-teal-600 shrink-0" />
                <span className="text-[#0a3568]">www.unityearning.com</span>
              </div>
              <p className="text-[8.5px] text-slate-400 mt-0.5">
                © Unity Earning E-Learning Platform
              </p>
            </div>

            {/* Right: Crisp, Proportional QR Code */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1 py-0.5 shadow-2xs">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="QR"
                  className="w-7 h-7 rounded-xs"
                />
              ) : (
                <div className="w-7 h-7 bg-slate-100 rounded-xs" />
              )}
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tight">
                SCAN
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Rounded Download Button */}
      <div className="mt-2.5 px-1">
        <button
          onClick={handleDownloadInvoice}
          disabled={isDownloading}
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 active:from-blue-700 active:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 font-bengali"
        >
          <Download className="w-4 h-4" />
          <span>
            {isDownloading ? 'ইনভয়েস ডাউনলোড হচ্ছে...' : 'ইনভয়েস ডাউনলোড করুন (Download Invoice)'}
          </span>
        </button>
      </div>
    </div>
  );
};
