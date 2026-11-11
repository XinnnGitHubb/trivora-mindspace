import React, { useState } from 'react';
import { Bell, HeartPulse, ShieldAlert, Sparkles, Check, Clock } from 'lucide-react';
import { NotificationItem } from '../types/mentalHealth';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onOpenSos: () => void;
  onTestNotification: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  notifications,
  onMarkNotificationRead,
  onOpenSos,
  onTestNotification,
  notificationPermission,
  onRequestNotificationPermission,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-700 transition-colors">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
                  Trivora MindSpace
                </span>
                <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap block">
                  Kesehatan Mental Mahasiswa
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-5 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-teal-700 transition-colors whitespace-nowrap py-1 ${
                activeTab === 'dashboard'
                  ? 'text-teal-700 font-semibold border-b-2 border-teal-600'
                  : ''
              }`}
            >
              Dashboard & Grafik
            </button>
            <button
              onClick={() => setActiveTab('screening')}
              className={`hover:text-teal-700 transition-colors whitespace-nowrap py-1 ${
                activeTab === 'screening'
                  ? 'text-teal-700 font-semibold border-b-2 border-teal-600'
                  : ''
              }`}
            >
              Skrining Bulanan
            </button>
            <button
              onClick={() => setActiveTab('counseling')}
              className={`hover:text-teal-700 transition-colors whitespace-nowrap py-1 ${
                activeTab === 'counseling'
                  ? 'text-teal-700 font-semibold border-b-2 border-teal-600'
                  : ''
              }`}
            >
              Konseling Real-Time
            </button>
            <button
              onClick={() => setActiveTab('selfcare')}
              className={`hover:text-teal-700 transition-colors whitespace-nowrap py-1 ${
                activeTab === 'selfcare'
                  ? 'text-teal-700 font-semibold border-b-2 border-teal-600'
                  : ''
              }`}
            >
              Self-Care Lab
            </button>
            <button
              onClick={() => setActiveTab('counselor-booking')}
              className={`hover:text-teal-700 transition-colors whitespace-nowrap py-1 ${
                activeTab === 'counselor-booking'
                  ? 'text-teal-700 font-semibold border-b-2 border-teal-600'
                  : ''
              }`}
            >
              Jadwal Konselor Kampus
            </button>
          </nav>

          {/* Zone 3: 1 primary action & functional utility controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Lihat Notifikasi"
                title="Pusat Notifikasi & Pengingat"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50 text-slate-800">
                  <div className="px-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Notifikasi & Pengingat
                      </h4>
                      <p className="text-xs text-slate-500">
                        Pemantauan berkala kesehatan mental
                      </p>
                    </div>
                    {notificationPermission !== 'granted' && (
                      <button
                        onClick={onRequestNotificationPermission}
                        className="text-xs text-teal-700 hover:text-teal-800 font-medium underline"
                      >
                        Aktifkan Web Push
                      </button>
                    )}
                  </div>

                  {/* Browser notification permission bar */}
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      Status Web Push:{' '}
                      <strong className="capitalize text-slate-800">
                        {notificationPermission === 'granted'
                          ? 'Aktif'
                          : notificationPermission === 'denied'
                          ? 'Diblokir'
                          : 'Perlu Izin'}
                      </strong>
                    </span>
                    <button
                      onClick={onTestNotification}
                      className="px-2 py-0.5 text-xs bg-white border border-slate-200 rounded hover:bg-slate-100 font-medium text-slate-700 transition-colors"
                    >
                      Uji Notifikasi
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        Tidak ada notifikasi saat ini.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 transition-colors hover:bg-slate-50 flex items-start gap-3 ${
                            !n.read ? 'bg-teal-50/40' : ''
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {n.type === 'alert' ? (
                              <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                                <ShieldAlert className="w-4 h-4" />
                              </div>
                            ) : n.type === 'affirmation' ? (
                              <div className="w-7 h-7 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center">
                                <Sparkles className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <h5 className="text-xs font-semibold text-slate-900 truncate">
                                {n.title}
                              </h5>
                              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                {n.date}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2">
                              {n.message}
                            </p>
                            <div className="mt-1.5 flex items-center gap-3 text-[11px]">
                              {n.actionTarget && (
                                <button
                                  onClick={() => {
                                    setActiveTab(n.actionTarget!);
                                    setShowNotifications(false);
                                  }}
                                  className="text-teal-700 hover:text-teal-800 font-medium underline"
                                >
                                  Buka Halaman
                                </button>
                              )}
                              {!n.read && (
                                <button
                                  onClick={() => onMarkNotificationRead(n.id)}
                                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" /> Tandai terbaca
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Emergency SOS Hotline Button */}
            <button
              onClick={onOpenSos}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Bantuan Darurat Psikologis & Hotline 24/7"
            >
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>SOS Krisis</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => setActiveTab('screening')}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 active:bg-teal-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              Skrining Bulan Ini
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded-md ${
              activeTab === 'dashboard'
                ? 'bg-teal-50 text-teal-800 font-semibold'
                : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('screening')}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded-md ${
              activeTab === 'screening'
                ? 'bg-teal-50 text-teal-800 font-semibold'
                : 'text-slate-600'
            }`}
          >
            Skrining
          </button>
          <button
            onClick={() => setActiveTab('counseling')}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded-md ${
              activeTab === 'counseling'
                ? 'bg-teal-50 text-teal-800 font-semibold'
                : 'text-slate-600'
            }`}
          >
            Konseling AI
          </button>
          <button
            onClick={() => setActiveTab('selfcare')}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded-md ${
              activeTab === 'selfcare'
                ? 'bg-teal-50 text-teal-800 font-semibold'
                : 'text-slate-600'
            }`}
          >
            Self-Care
          </button>
          <button
            onClick={() => setActiveTab('counselor-booking')}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded-md ${
              activeTab === 'counselor-booking'
                ? 'bg-teal-50 text-teal-800 font-semibold'
                : 'text-slate-600'
            }`}
          >
            Psikolog Kampus
          </button>
        </div>
      </div>
    </header>
  );
};
