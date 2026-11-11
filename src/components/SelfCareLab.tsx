import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../types/mentalHealth';
import { Wind, Heart, Phone, Smile, Frown, Meh, Sparkles, BookOpen, Trash2, ShieldAlert } from 'lucide-react';

interface SelfCareLabProps {
  onOpenSos: () => void;
}

export const SelfCareLab: React.FC<SelfCareLabProps> = ({ onOpenSos }) => {
  // Breathing Widget State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathingCount, setBreathingCount] = useState(4);
  const [cycleCompleted, setCycleCompleted] = useState(0);

  // Journal State
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('mindcampus_journal');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'journal-1',
        date: '10 Nov 2026',
        mood: 'baik',
        energy: 4,
        tags: ['Tugas Selesai', 'Tidur Cukup'],
        note: 'Menyelesaikan bab 2 skripsi setelah bimbingan pagi tadi. Rasanya jauh lebih lega dibanding minggu lalu.',
        gratitude: 'Bersyukur teman kelompok sangat suportif dan bisa diajak diskusi.',
      },
      {
        id: 'journal-2',
        date: '08 Nov 2026',
        mood: 'lelah',
        energy: 2,
        tags: ['Kuliah Padat', 'Kurang Tidur'],
        note: 'Jadwal praktikum padat sampai sore. Malam ini memutuskan tidur lebih awal jam 22.00.',
        gratitude: 'Bisa menikmati segelas teh hangat sore ini.',
      },
    ];
  });

  const [selectedMood, setSelectedMood] = useState<JournalEntry['mood']>('baik');
  const [journalEnergy, setJournalEnergy] = useState(3);
  const [journalNote, setJournalNote] = useState('');
  const [journalGratitude, setJournalGratitude] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Tugas Selesai']);

  const availableTags = [
    'Tugas Selesai',
    'Bimbingan Sukses',
    'Olahraga / Jalan Santai',
    'Me Time',
    'Makan Enak',
    'Tidur Cukup',
    'Diskusi Teman',
    'Overthinking',
  ];

  // Save journal entries to local storage
  useEffect(() => {
    localStorage.setItem('mindcampus_journal', JSON.stringify(journalEntries));
  }, [journalEntries]);

  // Breathing Box Timer Loop (4s Inhale, 7s Hold, 8s Exhale)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathingCount((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            // Switch Phase
            if (breathingPhase === 'Inhale') {
              setBreathingPhase('Hold');
              return 7;
            } else if (breathingPhase === 'Hold') {
              setBreathingPhase('Exhale');
              return 8;
            } else {
              setBreathingPhase('Inhale');
              setCycleCompleted((c) => c + 1);
              return 4;
            }
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, breathingPhase]);

  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalNote.trim()) return;

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      mood: selectedMood,
      energy: journalEnergy,
      tags: selectedTags,
      note: journalNote,
      gratitude: journalGratitude,
    };

    setJournalEntries([newEntry, ...journalEntries]);
    setJournalNote('');
    setJournalGratitude('');
  };

  const handleDeleteJournal = (id: string) => {
    setJournalEntries(journalEntries.filter((j) => j.id !== id));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-8">
      {/* 2-Column: Guided Breathing & Daily Journal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive 4-7-8 Breathing Relaxation Widget */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-teal-700 font-semibold uppercase tracking-wider">
                Teknik Regulasi Sistem Saraf
              </span>
              <Wind className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Latihan Relaksasi Pernapasan 4-7-8
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Membantu menurunkan detak jantung dan meredakan ketegangan sistem saraf otonom saat stres atau cemas melanda.
            </p>
          </div>

          {/* Calming visual bubble */}
          <div className="py-8 flex flex-col items-center justify-center">
            <div
              className={`w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-1000 select-none shadow-inner ${
                !isBreathingActive
                  ? 'bg-slate-100 border-2 border-slate-200 scale-95'
                  : breathingPhase === 'Inhale'
                  ? 'bg-teal-50 border-4 border-teal-500 scale-110 shadow-teal-100'
                  : breathingPhase === 'Hold'
                  ? 'bg-indigo-50 border-4 border-indigo-500 scale-110 shadow-indigo-100'
                  : 'bg-emerald-50 border-4 border-emerald-500 scale-95 shadow-emerald-100'
              }`}
            >
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                {isBreathingActive
                  ? breathingPhase === 'Inhale'
                    ? 'Tarik Napas'
                    : breathingPhase === 'Hold'
                    ? 'Tahan'
                    : 'Hembuskan'
                  : 'Siap Mulai'}
              </span>
              <span className="text-4xl font-bold font-mono tabular-nums text-slate-800 my-1">
                {isBreathingActive ? breathingCount : '4-7-8'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isBreathingActive ? `Siklus ke-${cycleCompleted + 1}` : 'Durasi 2 Menit'}
              </span>
            </div>

            {/* Instruction caption */}
            <p className="text-xs text-slate-600 mt-5 text-center max-w-xs">
              {isBreathingActive
                ? breathingPhase === 'Inhale'
                  ? 'Tarik napas perlahan melalui hidung (4 detik)'
                  : breathingPhase === 'Hold'
                  ? 'Tahan napas dengan tenang dan rileks (7 detik)'
                  : 'Hembuskan perlahan lewat mulut secara lembut (8 detik)'
                : 'Duduk tegak dengan rileks, letakkan telapak tangan di paha, lalu tekan tombol mulai di bawah.'}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Siklus selesai: <strong>{cycleCompleted}</strong>
            </span>
            <button
              onClick={() => {
                if (!isBreathingActive) {
                  setBreathingPhase('Inhale');
                  setBreathingCount(4);
                  setIsBreathingActive(true);
                } else {
                  setIsBreathingActive(false);
                }
              }}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                isBreathingActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
              }`}
            >
              {isBreathingActive ? 'Hentikan Sesi' : 'Mulai Latihan Relaksasi'}
            </button>
          </div>
        </div>

        {/* Daily Mood & Reflection Journal */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-teal-700 font-semibold uppercase tracking-wider">
                Ekspresi Emosi Bebas
              </span>
              <BookOpen className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Jurnal Refleksi Harian Mahasiswa
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Menuliskan apa yang dirasakan membantu mengurangi beban kerja kognitif dan meningkatkan kejernihan pikiran.
            </p>
          </div>

          <form onSubmit={handleAddJournal} className="space-y-3.5 my-4">
            {/* Mood Picker */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Bagaimana suasana hati Anda hari ini?
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { key: 'sangat_baik', label: 'Hebat', icon: '😄' },
                  { key: 'baik', label: 'Baik', icon: '🙂' },
                  { key: 'netral', label: 'Biasa', icon: '😐' },
                  { key: 'cemas', label: 'Cemas', icon: '😰' },
                  { key: 'lelah', label: 'Lelah', icon: '🥱' },
                  { key: 'kewalahan', label: 'Pusing', icon: '🤯' },
                ].map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setSelectedMood(m.key as any)}
                    className={`py-2 px-1 text-center rounded-lg border transition-colors ${
                      selectedMood === m.key
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-lg block leading-none mb-1">{m.icon}</span>
                    <span className="text-[10px] block">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note Input */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Catatan Refleksi Hari Ini:
              </label>
              <textarea
                rows={2}
                value={journalNote}
                onChange={(e) => setJournalNote(e.target.value)}
                placeholder="Apa yang paling mendominasi pikiranmu hari ini? (tugas, interaksi, atau perasaanmu)"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
              ></textarea>
            </div>

            {/* Gratitude */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Satu hal kecil yang patut disyukuri:
              </label>
              <input
                type="text"
                value={journalGratitude}
                onChange={(e) => setJournalGratitude(e.target.value)}
                placeholder="Misal: secangkir kopi hangat, teman yang menyapa, atau istirahat tepat waktu..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Tag Selection */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {availableTags.map((t) => {
                const active = selectedTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                      active
                        ? 'bg-teal-100 text-teal-800 font-medium'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}{t}
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Simpan Entri Jurnal
            </button>
          </form>
        </div>
      </div>

      {/* Journal Entries Timeline */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h4 className="text-sm font-bold text-slate-900 mb-4">
          Catatan Refleksi Sebelumnya
        </h4>
        <div className="space-y-3">
          {journalEntries.map((j) => (
            <div
              key={j.id}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between gap-4 text-xs"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{j.date}</span>
                  <span className="text-slate-300">·</span>
                  <span className="capitalize font-medium text-teal-700">
                    Suasana Hati: {j.mood.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{j.note}</p>
                {j.gratitude && (
                  <p className="text-slate-500 italic">
                    🌸 Syukur: "{j.gratitude}"
                  </p>
                )}
                <div className="flex flex-wrap gap-1 pt-1">
                  {j.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleDeleteJournal(j.id)}
                className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                title="Hapus entri"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Campus Emergency & Crisis Directory Strip */}
      <div className="bg-red-50/60 rounded-xl border border-red-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-red-800">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Pusat Bantuan Krisis & Darurat 24 Jam</span>
          </div>
          <h4 className="text-base font-bold text-slate-900">
            Merasa Sangat Tertekan atau Membutuhkan Bantuan Segera?
          </h4>
          <p className="text-xs text-slate-600 max-w-xl">
            Jika Anda mengalami krisis emosional mendalam atau pikiran yang mengkhawatirkan, bantuan profesional selalu tersedia 24 jam sehari bebas pulsa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href="tel:112"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Phone className="w-4 h-4" /> Hubungi SEJIWA 112
          </a>
          <button
            onClick={onOpenSos}
            className="px-4 py-2 bg-white hover:bg-red-50 text-red-700 border border-red-300 font-semibold text-xs rounded-lg transition-colors"
          >
            Lihat Semua Hotline Krisis
          </button>
        </div>
      </div>
    </div>
  );
};
