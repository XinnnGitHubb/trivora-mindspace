import React, { useState, useRef, useEffect } from 'react';
import { MonthlyScreeningRecord, Counselor, CounselingAppointment, ChatMessage } from '../types/mentalHealth';
import { CAMPUS_COUNSELORS } from '../utils/mentalHealthConstants';
import { Send, Bot, User, Sparkles, Calendar, Clock, Video, MapPin, CheckCircle2, ShieldAlert, Printer, ArrowRight, RefreshCw } from 'lucide-react';

interface CounselingSupportProps {
  latestRecord: MonthlyScreeningRecord | null;
  records: MonthlyScreeningRecord[];
  onOpenSos: () => void;
  activeSubTab?: 'ai-chat' | 'booking' | 'report';
}

export const CounselingSupport: React.FC<CounselingSupportProps> = ({
  latestRecord,
  records,
  onOpenSos,
  activeSubTab = 'ai-chat',
}) => {
  const [subTab, setSubTab] = useState<'ai-chat' | 'booking' | 'report'>(activeSubTab);

  // AI Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'counselor',
      text: `Halo! Saya **Sahabat MindCare**, konselor pendamping kesehatan mental virtual Anda. Saya telah membaca hasil skrining bulanan Anda (${latestRecord ? latestRecord.month : 'terbaru'}). 
      
Bagaimana perasaan atau aktivitas kuliah Anda hari ini? Ceritakan apa saja yang sedang membebani pikiran Anda—baik itu seputar tugas, relasi pertemanan, pola tidur, atau rencana masa depan.`,
      timestamp: 'Baru saja',
      source: 'gemini',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Booking State
  const [counselors] = useState<Counselor[]>(CAMPUS_COUNSELORS);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [bookingDate, setBookingDate] = useState('2026-11-16');
  const [bookingTime, setBookingTime] = useState('10:00 - 11:00 WIB');
  const [bookingMode, setBookingMode] = useState<'Online (Video Conference)' | 'Tatap Muka (Gedung Layanan Konseling)'>('Online (Video Conference)');
  const [bookingTopic, setBookingTopic] = useState('Manajemen Stres Akademik & Skripsi');
  const [bookingNotes, setBookingNotes] = useState('');
  const [studentNim, setStudentNim] = useState('2201103049');
  const [studentFaculty, setStudentFaculty] = useState('Fakultas Ilmu Komputer & Sains');
  const [appointments, setAppointments] = useState<CounselingAppointment[]>([
    {
      id: 'app-sample-1',
      counselorId: 'counselor-1',
      counselorName: 'Dr. Retno Anindita, M.Psi., Psikolog',
      studentName: 'Mahasiswa (Anda)',
      studentNim: '2201103049',
      studentFaculty: 'Fakultas Ilmu Komputer & Sains',
      date: '2026-11-18',
      timeSlot: '13:30 - 14:30 WIB',
      topic: 'Evaluasi Kecemasan Akademik Pasca UTS',
      mode: 'Tatap Muka (Gedung Layanan Konseling)',
      status: 'Dikonfirmasi',
      notes: 'Bawa riwayat skrining DASS-21 bulan Oktober dan November untuk ditinjau bersama.',
    },
  ]);
  const [bookingSuccessModal, setBookingSuccessModal] = useState(false);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/counseling/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          screeningData: latestRecord,
          history: messages.slice(-4),
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi server konseling');
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'counselor',
        text: data.reply || 'Terima kasih telah berbagi. Saya siap mendengarkan kembali.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('Chat request failed, providing fallback:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-fallback-${Date.now()}`,
        sender: 'counselor',
        text: `Terima kasih sudah bercerita. Menghadapi tekanan kuliah memerlukan keseimbangan antara usaha dan istirahat yang cukup. Berdasarkan skor skriningmu (${latestRecord?.month || 'Bulan ini'}), cobalah fokus pada 1 target prioritas kecil hari ini, dan jangan ragu untuk beristirahat bila tubuhmu terasa lelah. Konselor UPT BK kami juga selalu terbuka bila kamu ingin berdiskusi langsung.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'fallback',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCounselor) return;

    const newAppointment: CounselingAppointment = {
      id: `app-${Date.now()}`,
      counselorId: selectedCounselor.id,
      counselorName: selectedCounselor.name,
      studentName: 'Mahasiswa (Anda)',
      studentNim,
      studentFaculty,
      date: bookingDate,
      timeSlot: bookingTime,
      topic: bookingTopic,
      mode: bookingMode,
      status: 'Menunggu',
      notes: bookingNotes || 'Konseling berkala berdasarkan data skrining kesehatan mental bulanan.',
    };

    setAppointments([newAppointment, ...appointments]);
    setBookingSuccessModal(true);
    setSelectedCounselor(null);
    setBookingNotes('');
  };

  const quickPrompts = [
    'Bagaimana mengatasi rasa cemas berlebih saat menghadapi revisi tugas?',
    'Analisis kondisi mentalku berdasarkan skor skrining bulan ini.',
    'Pikiran saya sering berputar di malam hari dan sulit tidur (overthinking).',
    'Saya merasa lelah secara emosional dan kehilangan motivasi kuliah.',
  ];

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Sub navigation bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Dukungan Konseling Berbasis Data Real-Time
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pendampingan psikologis personal yang terintegrasi dengan pemantauan emosional berkala Anda
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setSubTab('ai-chat')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              subTab === 'ai-chat'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Konselor AI Real-Time
          </button>
          <button
            onClick={() => setSubTab('booking')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              subTab === 'booking'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jadwal Psikolog Kampus ({appointments.length})
          </button>
          <button
            onClick={() => setSubTab('report')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              subTab === 'report'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Laporan Klinis Resmi
          </button>
        </div>
      </div>

      {/* TAB 1: AI COUNSELOR CHAT */}
      {subTab === 'ai-chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Active Data Context Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Konteks Data Pengguna</span>
              </div>
              {latestRecord ? (
                <div className="space-y-2.5">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Evaluasi Terbaru:</span>
                    <strong className="text-slate-900">{latestRecord.month}</strong>
                    <span className="text-slate-400 block text-[10px]">
                      {latestRecord.academicPeriod}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-100">
                      <span className="text-[10px] text-emerald-800 block">Depresi</span>
                      <strong className="text-sm font-mono tabular-nums text-emerald-900">
                        {latestRecord.depression.score}
                      </strong>
                      <span className="text-[9px] text-emerald-700 block">
                        {latestRecord.depression.severity}
                      </span>
                    </div>
                    <div className="p-2 bg-amber-50 rounded border border-amber-100">
                      <span className="text-[10px] text-amber-800 block">Kecemasan</span>
                      <strong className="text-sm font-mono tabular-nums text-amber-900">
                        {latestRecord.anxiety.score}
                      </strong>
                      <span className="text-[9px] text-amber-700 block">
                        {latestRecord.anxiety.severity}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-rose-50 rounded border border-rose-100 text-center">
                    <span className="text-[10px] text-rose-800 block">Tingkat Stres</span>
                    <strong className="text-sm font-mono tabular-nums text-rose-900">
                      {latestRecord.stress.score} ({latestRecord.stress.severity})
                    </strong>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1 text-slate-600">
                    <p>
                      Tidur:{' '}
                      <strong className="font-mono tabular-nums text-slate-900">
                        {latestRecord.sleepHoursAverage} jam/hari
                      </strong>
                    </p>
                    <p>
                      Beban Kuliah: <strong>{latestRecord.academicPressureLevel}</strong>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">
                  Belum ada catatan skrining tersimpan. Anda tetap dapat mengobrol santai dengan konselor.
                </p>
              )}
            </div>

            {/* Privacy & Confidentiality note */}
            <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200/70 text-[11px] text-teal-900">
              <strong className="block mb-1">Kerahasiaan Terjamin</strong>
              Sesi konseling ini dirancang aman, empati, dan tidak menggantikan diagnosis klinis resmi. Data Anda terlindungi privasinya.
            </div>
          </div>

          {/* Right: Interactive Chat Window */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 flex flex-col h-[600px] overflow-hidden shadow-xs">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Sahabat MindCare</h4>
                  <span className="text-[10px] text-teal-700 font-medium">
                    Konselor Psikologis Virtual Mahasiswa · Real-Time
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setMessages([
                    {
                      id: `msg-reset-${Date.now()}`,
                      sender: 'counselor',
                      text: `Sesi telah diperbarui. Silakan ceritakan apa yang sedang ada di pikiran Anda seputar kuliah atau keseharian.`,
                      timestamp: 'Baru saja',
                    },
                  ]);
                }}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded text-xs flex items-center gap-1 transition-colors"
                title="Mulai Sesi Baru"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="text-[11px]">Sesi Baru</span>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 max-w-[85%] ${
                    m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      m.sender === 'user'
                        ? 'bg-slate-800 text-white'
                        : 'bg-teal-600 text-white'
                    }`}
                  >
                    {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-slate-900 text-white rounded-tr-xs'
                          : 'bg-slate-100 text-slate-800 rounded-tl-xs whitespace-pre-wrap'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block px-1">
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2.5 max-w-[80%]">
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3.5 bg-slate-100 rounded-2xl rounded-tl-xs text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    <span className="ml-1 text-[11px]">Konselor sedang menganalisis & mengetik...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestion Prompts */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                Saran Topik:
              </span>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 rounded-md text-slate-600 hover:text-teal-700 hover:border-teal-300 transition-colors whitespace-nowrap shrink-0"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ketik curahan hati atau pertanyaan seputar kesehatan mental Anda..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2 text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-40 rounded-lg transition-colors focus:outline-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: COUNSELOR BOOKING (UPT BK KAMPUS) */}
      {subTab === 'booking' && (
        <div className="space-y-6">
          {/* Active Appointments */}
          {appointments.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Jadwal Konsultasi Terdaftar Anda
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">
                        {app.counselorName}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[10px]">
                        {app.status}
                      </span>
                    </div>
                    <p className="text-slate-600">Topik: <strong>{app.topic}</strong></p>
                    <div className="flex flex-wrap items-center gap-3 text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" /> {app.date}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" /> {app.timeSlot}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-teal-100 text-[11px] text-teal-900 flex items-center gap-1.5">
                      {app.mode.includes('Online') ? (
                        <Video className="w-3.5 h-3.5" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5" />
                      )}
                      <span>{app.mode}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Counselor List & Booking Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Pilih Psikolog / Konselor Kampus Berlisensi
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Layanan bimbingan dan konseling gratis resmi universitas untuk seluruh mahasiswa aktif
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {counselors.map((c) => {
                const isSelected = selectedCounselor?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={`rounded-xl border p-5 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-600 ring-2 ring-teal-500/20 bg-teal-50/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {c.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 block">{c.sip}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{c.bio}</p>

                      <div className="flex flex-wrap gap-1">
                        {c.specialties.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 text-[11px] text-slate-500">
                        Hari praktik: <strong>{c.availableDays.join(', ')}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCounselor(c)}
                      className={`mt-4 w-full py-2 text-xs font-semibold rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ Konselor Dipilih' : 'Pilih Konselor Ini'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Booking Form if counselor selected */}
            {selectedCounselor && (
              <form
                onSubmit={handleCreateAppointment}
                className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900">
                    Formulir Reservasi Sesi Bersama: {selectedCounselor.name}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedCounselor(null)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">NIM Mahasiswa:</label>
                    <input
                      type="text"
                      value={studentNim}
                      onChange={(e) => setStudentNim(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Fakultas / Program Studi:</label>
                    <input
                      type="text"
                      value={studentFaculty}
                      onChange={(e) => setStudentFaculty(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Tanggal Konsultasi:</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Pilihan Sesi Jam:</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2"
                    >
                      <option value="09:00 - 10:00 WIB">09:00 - 10:00 WIB</option>
                      <option value="10:30 - 11:30 WIB">10:30 - 11:30 WIB</option>
                      <option value="13:30 - 14:30 WIB">13:30 - 14:30 WIB</option>
                      <option value="15:00 - 16:00 WIB">15:00 - 16:00 WIB</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Metode Konsultasi:</label>
                    <select
                      value={bookingMode}
                      onChange={(e) =>
                        setBookingMode(
                          e.target.value as 'Online (Video Conference)' | 'Tatap Muka (Gedung Layanan Konseling)'
                        )
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg p-2"
                    >
                      <option value="Online (Video Conference)">
                        Online (Video Conference Google Meet / Zoom)
                      </option>
                      <option value="Tatap Muka (Gedung Layanan Konseling)">
                        Tatap Muka (Ruang Konseling Gedung Rektorat Lt. 2)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Fokus Keluhan / Topik:</label>
                    <input
                      type="text"
                      value={bookingTopic}
                      onChange={(e) => setBookingTopic(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 text-xs mb-1">
                    Catatan Tambahan untuk Konselor (Opsional):
                  </label>
                  <textarea
                    rows={2}
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Misal: Saya merasa cemas terutama saat mendekati tenggat sidang skripsi..."
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
                  >
                    Konfirmasi Reservasi Jadwal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PRINTABLE OFFICIAL CLINICAL REPORT */}
      {subTab === 'report' && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 space-y-6 print:m-0 print:border-none print:shadow-none">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <span className="text-[11px] text-teal-700 font-bold tracking-wider uppercase">
                Dokumen Resmi Layanan Kesehatan Mental Mahasiswa
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Lembar Ringkasan Pemantauan Emosional Berkala
              </h3>
              <p className="text-xs text-slate-500">
                Unit Pelaksana Teknis Bimbingan & Konseling (UPT-BK) Perguruan Tinggi
              </p>
            </div>
            <button
              onClick={handlePrintReport}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-colors print:hidden"
            >
              <Printer className="w-4 h-4" /> Cetak / Unduh PDF
            </button>
          </div>

          {/* Student Identitas Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block">Nama Mahasiswa:</span>
              <strong className="text-slate-900">Mahasiswa Aktif</strong>
            </div>
            <div>
              <span className="text-slate-400 block">NIM:</span>
              <strong className="text-slate-900 font-mono">2201103049</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Fakultas / Prodi:</span>
              <strong className="text-slate-900">Ilmu Komputer & Sains</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Tanggal Unduh:</span>
              <strong className="text-slate-900 font-mono">
                {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </strong>
            </div>
          </div>

          {/* Clinical DASS-21 Evolution Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
              1. Trajektori DASS-21 Semester Ini
            </h4>
            <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-2.5">Bulan</th>
                  <th className="p-2.5 text-right">Depresi (0-42)</th>
                  <th className="p-2.5 text-right">Kecemasan (0-42)</th>
                  <th className="p-2.5 text-right">Stres (0-42)</th>
                  <th className="p-2.5 text-right">Indeks Kesejahteraan</th>
                  <th className="p-2.5">Catatan Klinis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="p-2.5 font-semibold text-slate-900">{r.month}</td>
                    <td className="p-2.5 text-right font-mono tabular-nums">
                      {r.depression.score} ({r.depression.severity})
                    </td>
                    <td className="p-2.5 text-right font-mono tabular-nums">
                      {r.anxiety.score} ({r.anxiety.severity})
                    </td>
                    <td className="p-2.5 text-right font-mono tabular-nums">
                      {r.stress.score} ({r.stress.severity})
                    </td>
                    <td className="p-2.5 text-right font-mono tabular-nums font-bold text-teal-800">
                      {r.wellbeingIndex}%
                    </td>
                    <td className="p-2.5 text-slate-600">{r.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendations for Advisor / Lecturer */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-900">
              Rekomendasi untuk Konselor / Dosen Pembimbing Akademik (PA):
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>
                Pertahankan ruang dialog berkala mengenai beban studi dan progres pengerjaan tugas.
              </li>
              <li>
                Edukasi mahasiswa mengenai manajemen ritme tidur dan pemanfaatan konseling UPT BK kampus.
              </li>
              <li>
                Jika terindikasi peningkatan skor kecemasan mendekati masa ujian, tawarkan konsultasi suportif lanjutan.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Booking confirmation modal */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Reservasi Konseling Berhasil Dibuat!
            </h3>
            <p className="text-xs text-slate-600">
              Jadwal Anda telah tercatat di sistem UPT Bimbingan & Konseling Kampus. Konselor kami akan memvalidasi jadwal dan mengirimkan link pertemuan / petunjuk ruangan.
            </p>
            <button
              onClick={() => setBookingSuccessModal(false)}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Tutup & Lihat Jadwal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
