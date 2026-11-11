import { Counselor, MonthlyScreeningRecord, NotificationItem, ScreeningQuestion, SeverityLevel, SubscaleScore } from '../types/mentalHealth';

// DASS-21 Standard Instrument Questions adapted for Indonesian university students
export const DASS21_QUESTIONS: ScreeningQuestion[] = [
  { id: 1, scale: 'stress', text: 'Saya merasa sulit untuk beristirahat atau menenangkan diri.', categoryName: 'Stres' },
  { id: 2, scale: 'anxiety', text: 'Saya menyadari mulut saya terasa kering saat merasa tegang.', categoryName: 'Kecemasan' },
  { id: 3, scale: 'depression', text: 'Saya sama sekali tidak dapat merasakan perasaan positif atau antusias.', categoryName: 'Depresi' },
  { id: 4, scale: 'anxiety', text: 'Saya mengalami kesulitan bernapas (misal: napas tersengal-sengal tanpa aktivitas fisik).', categoryName: 'Kecemasan' },
  { id: 5, scale: 'depression', text: 'Saya merasa sulit untuk berinisiatif melakukan kegiatan atau tugas perkuliahan.', categoryName: 'Depresi' },
  { id: 6, scale: 'stress', text: 'Saya cenderung bereaksi berlebihan terhadap suatu situasi yang menantang.', categoryName: 'Stres' },
  { id: 7, scale: 'anxiety', text: 'Saya mengalami gemetar pada tangan atau bagian tubuh lainnya.', categoryName: 'Kecemasan' },
  { id: 8, scale: 'stress', text: 'Saya merasa telah menghabiskan banyak energi karena gugup atau cemas.', categoryName: 'Stres' },
  { id: 9, scale: 'anxiety', text: 'Saya merasa cemas tentang situasi yang mungkin membuat saya panik atau mempermalukan diri.', categoryName: 'Kecemasan' },
  { id: 10, scale: 'depression', text: 'Saya merasa tidak ada hal baik yang dapat saya harapkan di masa depan.', categoryName: 'Depresi' },
  { id: 11, scale: 'stress', text: 'Saya mendapati diri saya mudah gelisah dan tidak sabaran.', categoryName: 'Stres' },
  { id: 12, scale: 'stress', text: 'Saya merasa sulit untuk bersantai meskipun sedang waktu luang.', categoryName: 'Stres' },
  { id: 13, scale: 'depression', text: 'Saya merasa sedih, murung, dan kehilangan semangat menjalani hari.', categoryName: 'Depresi' },
  { id: 14, scale: 'stress', text: 'Saya tidak dapat mentoleransi hal-hal yang menghalangi apa yang sedang saya kerjakan.', categoryName: 'Stres' },
  { id: 15, scale: 'anxiety', text: 'Saya merasa hampir panik saat menghadapi tekanan perkuliahan atau presentasi.', categoryName: 'Kecemasan' },
  { id: 16, scale: 'depression', text: 'Saya tidak dapat antusias terhadap kegiatan yang biasanya saya sukai.', categoryName: 'Depresi' },
  { id: 17, scale: 'depression', text: 'Saya merasa diri saya tidak berharga atau tidak cukup baik sebagai mahasiswa.', categoryName: 'Depresi' },
  { id: 18, scale: 'stress', text: 'Saya merasa diri saya sangat mudah tersinggung atau sensitif.', categoryName: 'Stres' },
  { id: 19, scale: 'anxiety', text: 'Saya menyadari detak jantung saya berdegup kencang meski tidak sedang berolahraga.', categoryName: 'Kecemasan' },
  { id: 20, scale: 'anxiety', text: 'Saya merasa takut tanpa alasan yang jelas atau logis.', categoryName: 'Kecemasan' },
  { id: 21, scale: 'depression', text: 'Saya merasa hidup ini terasa hampa dan tidak memiliki makna.', categoryName: 'Depresi' },
];

export const ANSWER_OPTIONS = [
  { value: 0, label: 'Tidak pernah', description: 'Tidak berlaku bagi saya sama sekali selama sebulan terakhir.' },
  { value: 1, label: 'Kadang-kadang', description: 'Berlaku bagi saya sampai tingkat tertentu atau beberapa waktu.' },
  { value: 2, label: 'Sering', description: 'Berlaku bagi saya sampai tingkat yang cukup nyata atau sering kali.' },
  { value: 3, label: 'Hampir selalu', description: 'Sangat sering berlaku bagi saya hampir setiap hari.' },
];

// DASS-21 Clinical Scoring Multipliers (multiplied by 2 to equate to DASS-42 normative tables)
export function calculateSeverity(scale: 'depression' | 'anxiety' | 'stress', rawScore: number): SubscaleScore {
  const normalizedScore = rawScore * 2;
  let severity: SeverityLevel = 'Normal';
  let color = '#059669'; // Emerald

  if (scale === 'depression') {
    if (normalizedScore <= 9) {
      severity = 'Normal';
      color = '#059669';
    } else if (normalizedScore <= 13) {
      severity = 'Ringan';
      color = '#10B981';
    } else if (normalizedScore <= 20) {
      severity = 'Sedang';
      color = '#F59E0B';
    } else if (normalizedScore <= 27) {
      severity = 'Berat';
      color = '#F97316';
    } else {
      severity = 'Sangat Berat';
      color = '#EF4444';
    }
  } else if (scale === 'anxiety') {
    if (normalizedScore <= 7) {
      severity = 'Normal';
      color = '#059669';
    } else if (normalizedScore <= 9) {
      severity = 'Ringan';
      color = '#10B981';
    } else if (normalizedScore <= 14) {
      severity = 'Sedang';
      color = '#F59E0B';
    } else if (normalizedScore <= 19) {
      severity = 'Berat';
      color = '#F97316';
    } else {
      severity = 'Sangat Berat';
      color = '#EF4444';
    }
  } else if (scale === 'stress') {
    if (normalizedScore <= 14) {
      severity = 'Normal';
      color = '#059669';
    } else if (normalizedScore <= 18) {
      severity = 'Ringan';
      color = '#10B981';
    } else if (normalizedScore <= 25) {
      severity = 'Sedang';
      color = '#F59E0B';
    } else if (normalizedScore <= 33) {
      severity = 'Berat';
      color = '#F97316';
    } else {
      severity = 'Sangat Berat';
      color = '#EF4444';
    }
  }

  return {
    score: normalizedScore,
    maxScore: 42,
    severity,
    color,
  };
}

export function calculateWellbeingIndex(depScore: number, anxScore: number, strScore: number): number {
  // Sum max possible is 42 * 3 = 126
  const total = depScore + anxScore + strScore;
  const ratio = Math.max(0, 1 - (total / 100));
  return Math.round(ratio * 100);
}

// Certified University Mental Health Counselors
export const CAMPUS_COUNSELORS: Counselor[] = [
  {
    id: 'counselor-1',
    name: 'Dr. Retno Anindita, M.Psi., Psikolog',
    title: 'Psikolog Klinis Dewasa & Koordinator UPT BK',
    sip: 'SIP: 503/442/IPPK/2021',
    specialties: ['Kecemasan Akademik & Ujian', 'Burnout Skripsi', 'Manajemen Stres'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    availableDays: ['Senin', 'Rabu', 'Jumat'],
    rating: 4.9,
    totalConsultations: 342,
    bio: 'Berpengalaman lebih dari 10 tahun mendampingi mahasiswa mengatasi prokrastinasi, kecemasan masa depan, dan sindrom imposter akademik.'
  },
  {
    id: 'counselor-2',
    name: 'Faisal Akbar, S.Psi., M.A.',
    title: 'Konselor Spesialis Regulasi Emosi & Hubungan Interpersonal',
    sip: 'SIP: 503/118/IPPK/2023',
    specialties: ['Penyesuaian Mahasiswa Baru', 'Quarter-Life Crisis', 'Dukungan Depresi'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    availableDays: ['Selasa', 'Kamis', 'Sabtu'],
    rating: 4.8,
    totalConsultations: 215,
    bio: 'Fokus pada pendekatan terapi berbasis kesadaran penuh (Mindfulness-Based CBT) dan konseling suportif yang nyaman tanpa penghakiman.'
  },
  {
    id: 'counselor-3',
    name: 'Maya Nirmala, M.Psi., Psikolog',
    title: 'Psikolog Konseling Karir & Kesehatan Mental Mahasiswa',
    sip: 'SIP: 503/902/IPPK/2022',
    specialties: ['Kecemasan Karir & Magang', 'Gangguan Pola Tidur / Insomnia', 'Manajemen Waktu'],
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    availableDays: ['Senin', 'Selasa', 'Kamis'],
    rating: 4.9,
    totalConsultations: 280,
    bio: 'Membantu mahasiswa menemukan kembali motivasi belajar, menyusun rutinitas sehat, dan mengatasi rasa kewalahan tugas akhir.'
  }
];

// Seed Historical Data (5 consecutive months leading to November 2026)
export const INITIAL_MONTHLY_RECORDS: MonthlyScreeningRecord[] = [
  {
    id: 'rec-jul-2026',
    month: 'Juli 2026',
    date: '2026-07-15',
    academicPeriod: 'Libur Semester Genap',
    depression: { score: 6, maxScore: 42, severity: 'Normal', color: '#059669' },
    anxiety: { score: 6, maxScore: 42, severity: 'Normal', color: '#059669' },
    stress: { score: 10, maxScore: 42, severity: 'Normal', color: '#059669' },
    wellbeingIndex: 88,
    sleepHoursAverage: 7.5,
    academicPressureLevel: 'Rendah',
    dominantIssues: ['Transisi jadwal liburan', 'Rencana magang mandiri'],
    notes: 'Kondisi emosi sangat stabil karena masa istirahat pasca ujian akhir semester.',
  },
  {
    id: 'rec-aug-2026',
    month: 'Agustus 2026',
    date: '2026-08-18',
    academicPeriod: 'Awal Semester Ganjil 2026/2027',
    depression: { score: 10, maxScore: 42, severity: 'Ringan', color: '#10B981' },
    anxiety: { score: 8, maxScore: 42, severity: 'Ringan', color: '#10B981' },
    stress: { score: 14, maxScore: 42, severity: 'Normal', color: '#059669' },
    wellbeingIndex: 81,
    sleepHoursAverage: 6.8,
    academicPressureLevel: 'Sedang',
    dominantIssues: ['Pengisian KRS & beban SKS baru', 'Adaptasi dosen baru'],
    notes: 'Mulai merasakan ketegangan menyusun jadwal kuliah dan kelompok tugas.',
  },
  {
    id: 'rec-sep-2026',
    month: 'September 2026',
    date: '2026-09-20',
    academicPeriod: 'Pertengahan Kuliah Bulan ke-2',
    depression: { score: 12, maxScore: 42, severity: 'Ringan', color: '#10B981' },
    anxiety: { score: 12, maxScore: 42, severity: 'Sedang', color: '#F59E0B' },
    stress: { score: 18, maxScore: 42, severity: 'Ringan', color: '#10B981' },
    wellbeingIndex: 73,
    sleepHoursAverage: 6.2,
    academicPressureLevel: 'Sedang',
    dominantIssues: ['Tugas presentasi berturut-turut', 'Kurang tidur akhir pekan'],
    notes: 'Kecemasan meningkat terutama menjelang presentasi kelompok dan kuis berkala.',
  },
  {
    id: 'rec-oct-2026',
    month: 'Oktober 2026',
    date: '2026-10-22',
    academicPeriod: 'Pekan Ujian Tengah Semester (UTS)',
    depression: { score: 16, maxScore: 42, severity: 'Sedang', color: '#F59E0B' },
    anxiety: { score: 16, maxScore: 42, severity: 'Berat', color: '#F97316' },
    stress: { score: 24, maxScore: 42, severity: 'Sedang', color: '#F59E0B' },
    wellbeingIndex: 59,
    sleepHoursAverage: 5.1,
    academicPressureLevel: 'Tinggi',
    dominantIssues: ['Pekan UTS beruntun', 'Jadwal tidur tidak teratur (insomnia)'],
    notes: 'Lonjakan stres dan kecemasan tinggi akibat beban ujian dan tenggat proposal.',
  },
  {
    id: 'rec-nov-2026',
    month: 'November 2026',
    date: '2026-11-10',
    academicPeriod: 'Evaluasi Pasca-UTS & Bimbingan',
    depression: { score: 10, maxScore: 42, severity: 'Ringan', color: '#10B981' },
    anxiety: { score: 10, maxScore: 42, severity: 'Sedang', color: '#F59E0B' },
    stress: { score: 16, maxScore: 42, severity: 'Ringan', color: '#10B981' },
    wellbeingIndex: 74,
    sleepHoursAverage: 6.5,
    academicPressureLevel: 'Sedang',
    dominantIssues: ['Evaluasi hasil UTS', 'Perbaikan manajemen waktu tidur'],
    notes: 'Terlihat pemulihan emosional setelah UTS usai dan mulai mempraktekkan relaksasi pernapasan rutin.',
  },
];

// Initial In-App Notifications
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Pengingat Rutin Skrining Bulanan',
    message: 'Waktunya evaluasi kondisi kesehatan emosional Anda untuk bulan November 2026. Hanya butuh 3 menit!',
    date: '10 Nov 2026',
    type: 'reminder',
    read: false,
    actionTarget: 'screening',
  },
  {
    id: 'notif-2',
    title: 'Evaluasi Perkembangan Emosional Positif',
    message: 'Kabar baik! Indeks kesejahteraan Anda meningkat dari 59% (Oktober) menjadi 74% (November). Pertahankan ritme istirahat Anda.',
    date: '08 Nov 2026',
    type: 'affirmation',
    read: false,
    actionTarget: 'charts',
  },
  {
    id: 'notif-3',
    title: 'Rekomendasi Konseling Suportif',
    message: 'Skor kecemasan Anda tercatat pada level sedang. Anda dapat berkonsultasi santai dengan Konselor Kampus atau mengobrol dengan Sahabat MindCare AI.',
    date: '05 Nov 2026',
    type: 'counseling',
    read: true,
    actionTarget: 'counseling',
  },
];

export const DAILY_AFFIRMATIONS = [
  'Kamu tidak harus menyelesaikan semua hal dalam satu hari. Satu langkah kecil setiap saat sudah sangat berarti.',
  'Nilai akademik adalah pencapaian belajar, bukan tolok ukur nilai kemanusiaanmu.',
  'Istirahat bukanlah tanda kelemahan, melainkan bagian penting dari proses belajar yang berkelanjutan.',
  'Perasaan cemas saat ini hanyalah awan yang lewat di langit pikiranmu. Ia tidak mendefinisikan dirimu.',
  'Berikan dirimu izin untuk bernapas dalam-dalam dan beristirahat sejenak hari ini.',
];
