import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { BookingForm } from './components/BookingForm.tsx';
import { InvoiceView } from './components/InvoiceView.tsx';
import { CustomTimeModal } from './components/CustomTimeModal.tsx';
import { HistoryModal } from './components/HistoryModal.tsx';
import { Toast, ToastMessage } from './components/Toast.tsx';
import { BookingRecord, TimeOption } from './types.ts';
import {
  getAllTimeOptions,
  saveCustomTime,
  getStoredBookings,
  saveBooking,
  clearStoredBookings,
} from './utils/storage.ts';

export default function App() {
  const [view, setView] = useState<'form' | 'invoice'>('form');
  const [currentBooking, setCurrentBooking] = useState<BookingRecord | null>(null);

  // Time options & selection
  const [timeOptions, setTimeOptions] = useState<TimeOption[]>([]);
  const [selectedTime, setSelectedTime] = useState<TimeOption | null>(null);

  // Modals
  const [isCustomTimeOpen, setIsCustomTimeOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Bookings list
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load from localStorage
  useEffect(() => {
    const loadedOptions = getAllTimeOptions();
    setTimeOptions(loadedOptions);
    const loadedBookings = getStoredBookings();
    setBookings(loadedBookings);
  }, []);

  // Handle custom time addition
  const handleAddCustomTime = (newOption: TimeOption) => {
    saveCustomTime(newOption);
    const updatedOptions = getAllTimeOptions();
    setTimeOptions(updatedOptions);
    setSelectedTime(newOption);
    addToast(`"${newOption.bengali}" সময় যুক্ত করা হয়েছে`, 'success');
  };

  // Handle booking form submission
  const handleBookingSuccess = (newBooking: BookingRecord) => {
    saveBooking(newBooking);
    setBookings((prev) => [newBooking, ...prev]);
    setCurrentBooking(newBooking);
    setView('invoice');
  };

  // Handle selecting a booking from history to re-open invoice
  const handleSelectFromHistory = (booking: BookingRecord) => {
    setCurrentBooking(booking);
    setView('invoice');
  };

  // Handle clearing history
  const handleClearHistory = () => {
    clearStoredBookings();
    setBookings([]);
  };

  return (
    <div className="min-h-screen bg-[#050a12] text-white flex flex-col justify-start selection:bg-blue-600 selection:text-white font-sans-body">
      {/* Background subtle blue glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[450px] h-[250px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Main Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* App Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-3 py-1 flex-1 flex flex-col justify-start">
        {/* Brand Header only on form */}
        {view === 'form' && <Header />}

        {/* View Switcher: Form or Invoice */}
        <main className="flex-1 flex flex-col justify-center">
          {view === 'form' ? (
            <BookingForm
              timeOptions={timeOptions}
              onOpenCustomModal={() => setIsCustomTimeOpen(true)}
              selectedTime={selectedTime}
              onSelectTime={(opt) => setSelectedTime(opt)}
              onOpenHistory={() => setIsHistoryOpen(true)}
              historyCount={bookings.length}
              onBookingSuccess={handleBookingSuccess}
              onShowToast={addToast}
            />
          ) : (
            currentBooking && (
              <InvoiceView
                booking={currentBooking}
                onNewBooking={() => {
                  setSelectedTime(null);
                  setView('form');
                }}
                onShowToast={addToast}
              />
            )
          )}
        </main>
      </div>

      {/* Custom Time Input Modal */}
      <CustomTimeModal
        isOpen={isCustomTimeOpen}
        onClose={() => setIsCustomTimeOpen(false)}
        onAdd={handleAddCustomTime}
      />

      {/* History Drawer / Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        bookings={bookings}
        onSelectBooking={handleSelectFromHistory}
        onClearHistory={handleClearHistory}
        onClose={() => setIsHistoryOpen(false)}
        onShowToast={addToast}
      />
    </div>
  );
}
