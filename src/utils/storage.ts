import { BookingRecord, TimeOption } from '../types.ts';

const STORAGE_KEYS = {
  BOOKINGS: 'unity_earning_bookings_v1',
  CUSTOM_TIMES: 'unity_earning_custom_times_v1',
  DEFAULT_CODES: 'unity_earning_default_codes_v1',
  INVOICE_COUNTER: 'unity_earning_invoice_seq_v1',
};

export const INITIAL_TIME_OPTIONS: TimeOption[] = [
  { id: '11am', english: '11:00 AM', bengali: '11:00 AM' },
  { id: '3pm', english: '03:00 PM', bengali: '03:00 PM' },
  { id: '630pm', english: '06:30 PM', bengali: '06:30 PM' },
  { id: '7pm', english: '07:00 PM', bengali: '07:00 PM' },
  { id: '730pm', english: '07:30 PM', bengali: '07:30 PM' },
];

export const DEFAULT_CODES = {
  idCode: '600734',
  meetingCode: '22876',
  seatCode: 'UE-PRO-8890',
  teamCode: 'UE-PRO-8890',
};

export function getStoredBookings(): BookingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load bookings from storage', e);
    return [];
  }
}

export function saveBooking(booking: BookingRecord): void {
  const current = getStoredBookings();
  const updated = [booking, ...current.filter((b) => b.id !== booking.id)];
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
}

export function clearStoredBookings(): void {
  localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
}

export function getCustomTimes(): TimeOption[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_TIMES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom times', e);
    return [];
  }
}

export function saveCustomTime(timeOption: TimeOption): void {
  const current = getCustomTimes();
  // Check if already exists
  const exists = current.some((t) => t.english.toLowerCase() === timeOption.english.toLowerCase());
  if (!exists) {
    const updated = [...current, { ...timeOption, isCustom: true }];
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TIMES, JSON.stringify(updated));
  }
}

export function deleteCustomTime(id: string): void {
  const current = getCustomTimes();
  const updated = current.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_TIMES, JSON.stringify(updated));
}

export function getAllTimeOptions(): TimeOption[] {
  const custom = getCustomTimes();
  return [...INITIAL_TIME_OPTIONS, ...custom];
}

export function generateNextInvoiceNumber(): string {
  const currentYear = new Date().getFullYear();
  let counter = 1;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INVOICE_COUNTER);
    if (stored) {
      counter = parseInt(stored, 10) + 1;
    }
    localStorage.setItem(STORAGE_KEYS.INVOICE_COUNTER, counter.toString());
  } catch (e) {
    counter = Math.floor(1000 + Math.random() * 9000);
  }
  const padded = counter.toString().padStart(4, '0');
  return `UE-${currentYear}-${padded}`;
}

export function getStoredCounsellorName(): string {
  try {
    return localStorage.getItem('unity_earning_counsellor_name_v1') || '';
  } catch (e) {
    return '';
  }
}

export function saveStoredCounsellorName(name: string): void {
  try {
    if (name.trim()) {
      localStorage.setItem('unity_earning_counsellor_name_v1', name.trim());
    } else {
      localStorage.removeItem('unity_earning_counsellor_name_v1');
    }
  } catch (e) {
    console.error('Failed to save counsellor name', e);
  }
}

export const generateInvoiceNo = generateNextInvoiceNumber;
