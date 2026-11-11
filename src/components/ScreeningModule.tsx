import React, { useState } from 'react';
import { ANSWER_OPTIONS, DASS21_QUESTIONS, calculateSeverity, calculateWellbeingIndex } from '../utils/mentalHealthConstants';
import { MonthlyScreeningRecord } from '../types/mentalHealth';
import { CheckCircle2, AlertOctagon, ArrowLeft, ArrowRight, Save, RotateCcw, Sparkles, MessageSquareHeart } from 'lucide-react';

interface ScreeningModuleProps {
  onSaveRecord: (record: MonthlyScreeningRecord) => void;
  onOpenCounselingWithData: (record: MonthlyScreeningRecord) => void;
  onOpenSos: () => void;
  existingRecordsCount: number;
}

export const ScreeningModule: React.FC<ScreeningModuleProps> = ({
  onSaveRecord,
  onOpenCounselingWithData,
  onOpenSos,
  existingRecordsCount,
}) => {
  // Screening Form State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedMonth, setSelectedMonth] = useState('Desember 2026');
  const [academicPeriod, setAcademicPeriod] = useState('Pekan Menjelang UAS & Tugas Akhir');
  const [sleepHours, setSleepHours] = useState(6.5);
  const [academicPressure, setAcademicPressure] = useState<'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi'>('Sedang');
  const [selectedIssues, setSelectedIssues] = useState<string[]>(['Beban tugas akhir & UAS']);
  const [isCompleted, setIsCompleted] = useState(false);
  const [calculatedRecord, setCalculatedRecord] = useState<MonthlyScreeningRecord | null>(null);

  const availableIssuesList = [
    'Beban tugas akhir & UAS',
    'Bimbingan skripsi / revisi dosen',
    'Gangguan jam tidur / insomnia',
    'Kecemasan masa depan & karir',
    'Masalah pertemanan / adaptasi',
    'Kelelahan fisik & burnout',
    'Tantangan finansial mahasiswa',
  ];

  const handleSelectAnswer = (questionId: number, value: number) => {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);

    if (currentQuestionIndex < DASS21_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Last question answered, calculate
      calculateResults(updated);
    }
  };

  const calculateResults = (finalAnswers: Record<number, number>) => {
    let depRaw = 0;
    let anxRaw = 0;
    let strRaw = 0;

    DASS21_QUESTIONS.forEach((q) => {
      const val = finalAnswers[q.id] ?? 0;
      if (q.scale === 'depression') depRaw += val;
      if (q.scale === 'anxiety') anxRaw += val;
      if (q.scale === 'stress') strRaw += val;
    });

    const depression = calculateSeverity('depression', depRaw);
    const anxiety = calculateSeverity('anxiety', anxRaw);
    const stress = calculateSeverity('stress', strRaw);
    const wellbeingIndex = calculateWellbeingIndex(depression.score, anxiety.score, stress.score);

    const newRecord: MonthlyScreeningRecord = {
      id: `rec-custom-${Date.now()}`,
      month: selectedMonth,
      date: new Date().toISOString().split('T')[0],
      academicPeriod,
      depression,
      anxiety,
      stress,
      wellbeingIndex,
      sleepHoursAverage: sleepHours,
      academicPressureLevel: academicPressure,
      dominantIssues: selectedIssues.length > 0 ? selectedIssues : ['Keletihan akademik'],
      answers: finalAnswers,
      notes: `Skrining mandiri berkala ${selectedMonth}. Dikerjakan dengan durasi tidur rata-rata ${sleepHours} jam.`,
    };

    setCalculatedRecord(newRecord);
    setIsCompleted(true);
  };

  const toggleIssue = (issue: string) => {
    if (selectedIssues.includes(issue)) {
      setSelectedIssues(selectedIssues.filter((i) => i !== issue));
    } else {
      setSelectedIssues([...selectedIssues, issue]);
    }
  };

  const resetScreening = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    setCalculatedRecord(null);
  };

  const isHighRisk =
    calculatedRecord?.depression.severity === 'Berat' ||
    calculatedRecord?.depression.severity === 'Sangat Berat' ||
    calculatedRecord?.anxiety.severity === 'Berat' ||
    calculatedRecord?.anxiety.severity === 'Sangat Berat' ||
    calculatedRecord?.stress.severity === 'Berat' ||
    calculatedRecord?.stress.severity === 'Sangat Berat';

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / DASS21_QUESTIONS.length) * 100);
  const currentQ = DASS21_QUESTIONS[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {!isCompleted ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span>Instrumen Terstandar DASS-21</span>
                  <span>·</span>
                  <span>Skrining Mental Mahasiswa Bulanan</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Evaluasi Kesehatan Emosional Berkala
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pilihlah jawaban yang paling menggambarkan kondisi yang Anda rasakan selama sebulan terakhir. Tidak ada jawaban benar atau salah.
                </p>
              </div>

              {/* Month Selection */}
              <div className="shrink-0 flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <label className="text-xs font-medium text-slate-600 pl-1">Bulan:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white text-xs font-semibold text-slate-800 border border-slate-200 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Desember 2026">Desember 2026</option>
                  <option value="Januari 2027">Januari 2027</option>
                  <option value="Februari 2027">Februari 2027</option>
                  <option value="Maret 2027">Maret 2027</option>
                  <option value="November 2026">November 2026 (Update)</option>
                </select>
              </div>
            </div>

            {/* Context bar (sleep and academic context) */}
            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Rata-rata Jam Tidur / Malam:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="3"
                    max="10"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                  <span className="font-mono tabular-nums font-semibold text-slate-800 w-12 text-right">
                    {sleepHours} jam
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Beban Akademik Dirasakan:
                </label>
                <select
                  value={academicPressure}
                  onChange={(e) =>
                    setAcademicPressure(e.target.value as 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi')
                  }
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                >
                  <option value="Rendah">Rendah (Santai / Awal Semester)</option>
                  <option value="Sedang">Sedang (Tugas Mingguan Standar)</option>
                  <option value="Tinggi">Tinggi (Pekan Ujian / Deadline)</option>
                  <option value="Sangat Tinggi">Sangat Tinggi (Skripsi & Sidang)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Periode Akademik:
                </label>
                <input
                  type="text"
                  value={academicPeriod}
                  onChange={(e) => setAcademicPeriod(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 text-xs"
                  placeholder="Misal: Pekan UAS / Bimbingan"
                />
              </div>
            </div>

            {/* Tags for issues */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500 mr-1">Fokus Tantangan:</span>
              {availableIssuesList.map((issue) => {
                const active = selectedIssues.includes(issue);
                return (
                  <button
                    key={issue}
                    type="button"
                    onClick={() => toggleIssue(issue)}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      active
                        ? 'bg-teal-100 text-teal-800 font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}{issue}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Pertanyaan <strong className="font-mono tabular-nums text-slate-900">{currentQuestionIndex + 1}</strong> dari{' '}
              <span className="font-mono tabular-nums">21</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono tabular-nums font-medium text-teal-700">
                {progressPercent}% Terjawab
              </span>
              <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Body */}
          <div className="p-8">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Question Category indicator */}
              <div className="text-xs font-semibold text-teal-700 uppercase tracking-wide">
                Indikator {currentQ.categoryName}
              </div>

              {/* Question Statement */}
              <h3 className="text-xl font-bold text-slate-900 leading-snug">
                "{currentQ.text}"
              </h3>

              {/* Answer Choices */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {ANSWER_OPTIONS.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectAnswer(currentQ.id, opt.value)}
                      className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        isSelected
                          ? 'bg-teal-50/70 border-teal-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <span className="w-2 h-2 bg-white rounded-full"></span>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-semibold ${
                              isSelected ? 'text-teal-900' : 'text-slate-900'
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Skor: {opt.value}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Question Navigation footer */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 rounded font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Sebelumnya
                </button>

                {/* Quick question jumping pills */}
                <div className="hidden sm:flex items-center gap-1">
                  {DASS21_QUESTIONS.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = idx === currentQuestionIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-6 h-6 rounded text-[10px] font-mono tabular-nums transition-colors ${
                          isCurrent
                            ? 'bg-teal-600 text-white font-bold'
                            : isAnswered
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title={`Pertanyaan ${idx + 1}: ${q.categoryName}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={answers[currentQ.id] === undefined}
                  onClick={() => {
                    if (currentQuestionIndex < DASS21_QUESTIONS.length - 1) {
                      setCurrentQuestionIndex((prev) => prev + 1);
                    } else {
                      calculateResults(answers);
                    }
                  }}
                  className="px-4 py-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-colors"
                >
                  {currentQuestionIndex === DASS21_QUESTIONS.length - 1 ? (
                    'Selesaikan & Lihat Hasil'
                  ) : (
                    <>
                      Berikutnya <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Result Screen */
        calculatedRecord && (
          <div className="space-y-6">
            {/* Risk Banner if severe */}
            {isHighRisk && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3.5 text-amber-900">
                <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <h4 className="font-bold text-sm text-amber-950 mb-0.5">
                    Perhatian: Skor Menunjukkan Tingkat Beban Emosional Tinggi
                  </h4>
                  <p className="text-amber-800 leading-relaxed">
                    Hasil skrining Anda menunjukkan salah satu indikator berada pada tingkat berat. Ini adalah respons normal tubuh terhadap tekanan perkuliahan yang intens, namun Anda tidak harus menghadapinya sendirian. Tim psikolog kampus siap mendampingi Anda secara rahasia dan aman.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={onOpenSos}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-xs transition-colors"
                    >
                      Buka Kontak Krisis / SOS
                    </button>
                    <button
                      onClick={() => onOpenCounselingWithData(calculatedRecord)}
                      className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-semibold rounded text-xs transition-colors"
                    >
                      Konsultasi dengan Psikolog Kampus
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Score Summary Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-900">{calculatedRecord.month}</span>
                    <span>·</span>
                    <span>{calculatedRecord.academicPeriod}</span>
                    <span>·</span>
                    <span>{calculatedRecord.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Laporan Hasil Skrining Kesehatan Mental
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Indeks Kesejahteraan:</span>
                  <span className="text-2xl font-bold text-teal-800 font-mono tabular-nums">
                    {calculatedRecord.wellbeingIndex}%
                  </span>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Subskala Depresi</span>
                    <span className="font-mono tabular-nums">{calculatedRecord.depression.score}/42</span>
                  </div>
                  <div
                    className="text-2xl font-bold font-mono tabular-nums"
                    style={{ color: calculatedRecord.depression.color }}
                  >
                    {calculatedRecord.depression.severity}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Refleksi suasana hati, energi, dan harapan akademik.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Subskala Kecemasan</span>
                    <span className="font-mono tabular-nums">{calculatedRecord.anxiety.score}/42</span>
                  </div>
                  <div
                    className="text-2xl font-bold font-mono tabular-nums"
                    style={{ color: calculatedRecord.anxiety.color }}
                  >
                    {calculatedRecord.anxiety.severity}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Respon fisik gugup, ketegangan somatik, dan kekhawatiran.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Subskala Stres</span>
                    <span className="font-mono tabular-nums">{calculatedRecord.stress.score}/42</span>
                  </div>
                  <div
                    className="text-2xl font-bold font-mono tabular-nums"
                    style={{ color: calculatedRecord.stress.color }}
                  >
                    {calculatedRecord.stress.severity}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Toleransi terhadap beban kerja, relaksasi, dan iritabilitas.
                  </p>
                </div>
              </div>

              {/* Context Summary */}
              <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 text-xs text-slate-700 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span>
                    Rata-rata tidur: <strong className="font-mono tabular-nums">{calculatedRecord.sleepHoursAverage} jam</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Beban perkuliahan: <strong>{calculatedRecord.academicPressureLevel}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Fokus tantangan: <strong>{calculatedRecord.dominantIssues.join(', ')}</strong>
                  </span>
                </div>
                <p className="text-slate-600">
                  Data ini telah diolah secara otomatis untuk memperbarui grafik tren emosional Anda serta memberi input personal pada sistem konseling real-time.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={resetScreening}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Ulangi Skrining
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      onSaveRecord(calculatedRecord);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan ke Riwayat Bulanan
                  </button>

                  <button
                    onClick={() => {
                      onSaveRecord(calculatedRecord);
                      onOpenCounselingWithData(calculatedRecord);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <MessageSquareHeart className="w-4 h-4" /> Mulai Konseling Personal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
