const BENGALI_DIGITS: { [key: string]: string } = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

const BENGALI_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const ENGLISH_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function toBengaliDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (match) => BENGALI_DIGITS[match] || match);
}

/**
 * Returns current Date adjusted to Bangladesh Standard Time (UTC+6)
 */
export function getBangladeshDate(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  period: 'AM' | 'PM';
  formatted12Hours: number;
} {
  // Use Intl.DateTimeFormat with Asia/Dhaka timezone
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(date);
  
  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  for (const part of parts) {
    if (part.type === 'year') year = parseInt(part.value, 10);
    if (part.type === 'month') month = parseInt(part.value, 10) - 1;
    if (part.type === 'day') day = parseInt(part.value, 10);
    if (part.type === 'hour') hours = parseInt(part.value, 10);
    if (part.type === 'minute') minutes = parseInt(part.value, 10);
    if (part.type === 'second') seconds = parseInt(part.value, 10);
  }

  const period: 'AM' | 'PM' = hours >= 12 ? 'PM' : 'AM';
  const formatted12Hours = hours % 12 || 12;

  return {
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    period,
    formatted12Hours,
  };
}

export function formatDateTimeBangladesh(date: Date = new Date()): {
  english: string;
  bengali: string;
  dateEnglish: string;
  dateBengali: string;
} {
  const bst = getBangladeshDate(date);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const enDate = `${bst.day} ${ENGLISH_MONTHS[bst.month]}, ${bst.year}`;
  const bnDate = `${toBengaliDigits(bst.day)} ${BENGALI_MONTHS[bst.month]}, ${toBengaliDigits(bst.year)}`;

  const timeStr = `${pad(bst.formatted12Hours)}:${pad(bst.minutes)} ${bst.period}`;
  const bnTimeStr = `${toBengaliDigits(pad(bst.formatted12Hours))}:${toBengaliDigits(pad(bst.minutes))} ${bst.period}`;

  return {
    english: `${enDate} at ${timeStr}`,
    bengali: `${bnDate} এ ${bnTimeStr}`,
    dateEnglish: enDate,
    dateBengali: bnDate,
  };
}
