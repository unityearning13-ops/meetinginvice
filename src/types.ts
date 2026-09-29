export interface BookingRecord {
  id: string;
  invoiceNo: string;
  fullName: string;
  phone: string;
  idCode: string;
  meetingCode: string;
  seatCode?: string;
  teamCode?: string;
  counsellorName?: string;
  meetingTime: string;
  meetingTimeBengali: string;
  meetingDate: string;
  meetingDateBengali: string;
  bookingTimestamp: number;
  bookingDateTimeStr: string;
  bookingDateTimeBengaliStr: string;
}

export interface TimeOption {
  id: string;
  english: string;
  bengali: string;
  isCustom?: boolean;
}
