import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EmotionalCharts } from './components/EmotionalCharts';
import { ScreeningModule } from './components/ScreeningModule';
import { CounselingSupport } from './components/CounselingSupport';
import { SelfCareLab } from './components/SelfCareLab';
import { EmergencyModal } from './components/EmergencyModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { MonthlyScreeningRecord, NotificationItem } from './types/mentalHealth';
import { INITIAL_MONTHLY_RECORDS, INITIAL_NOTIFICATIONS, DAILY_AFFIRMATIONS } from './utils/mentalHealthConstants';
import { HeartPulse, Bell, Calendar, Sparkles, ShieldCheck, ArrowRight, BookOpen, Clock, Activity, MessageSquareHeart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'screening' | 'counseling' | 'selfcare' | 'counselor-booking'>('dashboard');
  const [counselingSubTab, setCounselingSubTab] = useState<'ai-chat' | 'booking' | 'report'>('ai-chat');

  // Persistent screening records
  const [records, setRecords] = useState<MonthlyScreeningRecord[]>(() => {
    const saved = localStorage.getItem('mindcampus_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_MONTHLY_RECORDS;
  });

  // Persistent notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('mindcampus_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Notification reminder day setting (default tanggal 1 setiap bulan)
  const [reminderDay, setReminderDay] = useState<number>(() => {
    const saved = localStorage.getItem('mindcampus_reminder_day');
    return saved ? parseInt(saved, 10) : 1;
  });

  // Web Notification permission state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Selected record for modal detail view
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<MonthlyScreeningRecord | null>(null);

  // Emergency SOS Modal
  const [isSosOpen, setIsSosOpen] = useState(false);

  // Daily Affirmation
  const [dailyQuoteIndex, setDailyQuoteIndex] = useState(0);

  // Sync records to localStorage
  useEffect(() => {
    localStorage.setItem('mindcampus_records', JSON.stringify(records));
  }, [records]);

  // Sync notifications to localStorage
  useEffect(() => {
    localStorage.setItem('mindcampus_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('mindcampus_reminder_day', reminderDay.toString());
  }, [reminderDay]);

  // Request browser notification permission
  const handleRequestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          new Notification('MindCampus Notifikasi Aktif!', {
            body: 'Pengingat skrining berkala kesehatan mental mahasiswa berhasil diaktifkan.',
            icon: '/favicon.ico',
          });
        }
      } catch (e) {
        console.warn('Notification permission error:', e);
      }
    }
  };

  // Trigger test notification
  const handleTestNotification = () => {
    const newNotif: NotificationItem = {
      id: `notif-test-${Date.now()}`,
      title: 'Uji Notifikasi Pengingat Bulanan',
      message: 'Ini adalah simulasi pengingat bulanan untuk mengisi skrining DASS-21 dan evaluasi pola tidur.',
      date: 'Hari ini',
      type: 'reminder',
      read: false,
      actionTarget: 'screening',
    };

    setNotifications([newNotif, ...notifications]);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('Pengingat Skrining Mental Mahasiswa', {
          body: 'Saatnya mengisi skrining bulanan kesehatan mental Anda di Trivora MindSpace.',
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleSaveRecord = (newRecord: MonthlyScreeningRecord) => {
    // Check if month already exists, update or append
    const existingIndex = records.findIndex((r) => r.month === newRecord.month);
    let updated: MonthlyScreeningRecord[];
    if (existingIndex >= 0) {
      updated = [...records];
      updated[existingIndex] = newRecord;
    } else {
      updated = [...records, newRecord];
    }
    setRecords(updated);

    // Create a notification for record completion
    const completionNotif: NotificationItem = {
      id: `notif-complete-${Date.now()}`,
      title: `Hasil Skrining ${newRecord.month} Tersimpan`,
      message: `Indeks Kesejahteraan Anda tercatat ${newRecord.wellbeingIndex}%. Grafik emosional telah diperbarui.`,
      date: 'Baru saja',
      type: 'affirmation',
      read: false,
      actionTarget: 'dashboard',
    };
    setNotifications([completionNotif, ...notifications]);
  };

  const handleOpenCounselingWithData = (record: MonthlyScreeningRecord) => {
    setSelectedRecordForDetail(null);
    setCounselingSubTab('ai-chat');
    setActiveTab('counseling');
  };

  const latestRecord = records.length > 0 ? records[records.length - 1] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab === 'counselor-booking' ? 'counselor-booking' : activeTab}
        setActiveTab={(tab) => {
          if (tab === 'counselor-booking') {
            setActiveTab('counseling');
            setCounselingSubTab('booking');
          } else {
            setActiveTab(tab as any);
          }
        }}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onOpenSos={() => setIsSosOpen(true)}
        onTestNotification={handleTestNotification}
        notificationPermission={notificationPermission}
        onRequestNotificationPermission={handleRequestNotificationPermission}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Hero Banner with Monthly Screening Reminder */}
            <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-xs text-teal-300">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Platform Resmi Bimbingan & Konseling Universitas</span>
                  <span>·</span>
                  <span>Semester Ganjil 2026/2027</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                  Pemantauan Berkala Kesehatan Mental Mahasiswa
                </h1>
                <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
                  Lakukan skrining rutin setiap bulan untuk melacak perkembangan stabilitas emosi, mencegah burnout akademik, dan mendapatkan dukungan konseling psikologis berbasis data secara personal dan real-time.
                </p>

                {/* Reminder Frequency Info */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-teal-200">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-300" />
                    Jadwal Pengingat: <strong>Tanggal {reminderDay} Setiap Bulan</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Status Bulan Ini:{' '}
                    <strong className="text-emerald-300">
                      {latestRecord?.month === 'November 2026' ? 'Sudah Terisi (Nov 2026)' : 'Perlu Evaluasi'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Hero Action CTAs */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => setActiveTab('screening')}
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs whitespace-nowrap"
                >
                  <Activity className="w-4 h-4" />
                  Isi Skrining Bulan Ini
                </button>
                <button
                  onClick={() => {
                    setActiveTab('counseling');
                    setCounselingSubTab('ai-chat');
                  }}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/20 whitespace-nowrap"
                >
                  <MessageSquareHeart className="w-4 h-4 text-teal-300" />
                  Konseling Real-Time
                </button>
              </div>
            </div>

            {/* Daily Affirmation Card */}
            <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block">
                    Afirmasi & Mindfulness Hari Ini
                  </span>
                  <p className="text-xs text-slate-800 italic">
                    "{DAILY_AFFIRMATIONS[dailyQuoteIndex]}"
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setDailyQuoteIndex((prev) => (prev + 1) % DAILY_AFFIRMATIONS.length)
                }
                className="text-xs text-teal-800 hover:text-teal-950 font-semibold underline shrink-0 whitespace-nowrap self-end sm:self-auto"
              >
                Ganti Afirmasi
              </button>
            </div>

            {/* Interactive Visual Charts & Historical Trends */}
            <EmotionalCharts
              records={records}
              onSelectRecord={(rec) => setSelectedRecordForDetail(rec)}
              onStartNewScreening={() => setActiveTab('screening')}
              onOpenCounselingWithData={handleOpenCounselingWithData}
            />

            {/* Notification & Monitoring Cadence Configuration Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-700">
                  <Bell className="w-4 h-4" />
                  <span>Pengaturan Notifikasi & Pengingat Berkala Mahasiswa</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Kustomisasi Jadwal Notifikasi Skrining Bulanan
                </h4>
                <p className="text-xs text-slate-500 max-w-xl">
                  Sistem akan mengirimkan push notification pada tanggal yang Anda tentukan setiap bulan agar pemantauan kesehatan emosional Anda tetap konsisten.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs">
                  <label className="text-slate-600 font-medium pl-1">Ingatkan Tanggal:</label>
                  <select
                    value={reminderDay}
                    onChange={(e) => setReminderDay(parseInt(e.target.value, 10))}
                    className="bg-white border border-slate-200 rounded px-2 py-1 font-semibold text-slate-800"
                  >
                    {[1, 5, 10, 15, 20, 25, 28].map((d) => (
                      <option key={d} value={d}>
                        Tanggal {d} tiap bulan
                      </option>
                    ))}
                  </select>
                </div>

                {notificationPermission !== 'granted' ? (
                  <button
                    onClick={handleRequestNotificationPermission}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors"
                  >
                    Izinkan Web Notification
                  </button>
                ) : (
                  <button
                    onClick={handleTestNotification}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors border border-slate-200"
                  >
                    Uji Kirim Notifikasi
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SCREENING TAB */}
        {activeTab === 'screening' && (
          <ScreeningModule
            onSaveRecord={handleSaveRecord}
            onOpenCounselingWithData={handleOpenCounselingWithData}
            onOpenSos={() => setIsSosOpen(true)}
            existingRecordsCount={records.length}
          />
        )}

        {/* COUNSELING SUPPORT TAB */}
        {activeTab === 'counseling' && (
          <CounselingSupport
            latestRecord={latestRecord}
            records={records}
            onOpenSos={() => setIsSosOpen(true)}
            activeSubTab={counselingSubTab}
          />
        )}

        {/* SELF CARE LAB TAB */}
        {activeTab === 'selfcare' && (
          <SelfCareLab onOpenSos={() => setIsSosOpen(true)} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-700">Trivora MindSpace</span>
            <span>·</span>
            <span>Unit Pelaksana Teknis Bimbingan & Konseling Mahasiswa</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Privasi & Kerahasiaan Terjamin</span>
            <span>·</span>
            <button
              onClick={() => setIsSosOpen(true)}
              className="text-red-600 hover:text-red-700 font-semibold underline"
            >
              Kontak Darurat 24/7 (112 / (0274) 587402)
            </button>
          </div>
        </div>
      </footer>

      {/* Detail Record Modal */}
      <RecordDetailModal
        record={selectedRecordForDetail}
        onClose={() => setSelectedRecordForDetail(null)}
        onOpenCounselingWithData={handleOpenCounselingWithData}
      />

      {/* Emergency Crisis Hotline Modal */}
      <EmergencyModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
}
