export type SeverityLevel = 'Normal' | 'Ringan' | 'Sedang' | 'Berat' | 'Sangat Berat';

export interface SubscaleScore {
  score: number;
  maxScore: number;
  severity: SeverityLevel;
  color: string;
}

export interface MonthlyScreeningRecord {
  id: string;
  month: string; // e.g. "Juli 2026", "Agustus 2026", "September 2026", etc.
  date: string; // ISO format or YYYY-MM-DD
  academicPeriod: string; // e.g. "Semester Ganjil 2026/2027"
  depression: SubscaleScore;
  anxiety: SubscaleScore;
  stress: SubscaleScore;
  wellbeingIndex: number; // 0 - 100
  sleepHoursAverage: number;
  academicPressureLevel: 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi';
  dominantIssues: string[];
  notes?: string;
  answers?: Record<number, number>;
}

export interface ScreeningQuestion {
  id: number;
  scale: 'depression' | 'anxiety' | 'stress';
  text: string;
  categoryName: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'reminder' | 'alert' | 'affirmation' | 'counseling';
  read: boolean;
  actionTarget?: 'dashboard' | 'screening' | 'counseling' | 'charts' | 'selfcare';
}

export interface Counselor {
  id: string;
  name: string;
  title: string;
  sip: string; // Surat Izin Praktik
  specialties: string[];
  avatar: string;
  availableDays: string[];
  rating: number;
  totalConsultations: number;
  bio: string;
}

export interface CounselingAppointment {
  id: string;
  counselorId: string;
  counselorName: string;
  studentName: string;
  studentNim: string;
  studentFaculty: string;
  date: string;
  timeSlot: string;
  topic: string;
  mode: 'Online (Video Conference)' | 'Tatap Muka (Gedung Layanan Konseling)';
  status: 'Menunggu' | 'Dikonfirmasi' | 'Selesai';
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: 'sangat_baik' | 'baik' | 'netral' | 'cemas' | 'lelah' | 'kewalahan';
  energy: number; // 1 - 5
  tags: string[];
  note: string;
  gratitude?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'counselor';
  text: string;
  timestamp: string;
  source?: 'gemini' | 'fallback';
}
