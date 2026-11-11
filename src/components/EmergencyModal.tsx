import React from 'react';
import { X, Phone, ShieldAlert, Heart, ExternalLink, LifeBuoy } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-red-200 space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pusat Bantuan Darurat & Krisis Kesehatan Mental
              </h3>
              <p className="text-xs text-slate-500">
                Bantuan tersedia 24 jam sehari, rahasia, bebas biaya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hotlines */}
        <div className="space-y-3">
          {/* Sejiwa */}
          <div className="p-3.5 bg-red-50/70 rounded-xl border border-red-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-red-700 tracking-wider block">
                Kemenkes RI
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Layanan SEJIWA (Kemenkes)
              </h4>
              <p className="text-xs text-slate-600">
                Layanan konsultasi psikologis darurat bebas pulsa 24/7
              </p>
            </div>
            <a
              href="tel:112"
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Phone className="w-3.5 h-3.5" /> 112
            </a>
          </div>

          {/* UPK BK Kampus */}
          <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block">
                Layanan Kampus
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Hotline Siaga UPK BK Universitas
              </h4>
              <p className="text-xs text-slate-600">
                Dukungan krisis mahasiswa dan pendampingan psikolog kampus
              </p>
            </div>
            <a
              href="tel:0274587402"
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Phone className="w-3.5 h-3.5" /> (0274) 587402
            </a>
          </div>
        </div>

        {/* 5-4-3-2-1 Grounding Technique for Panic Attack */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <LifeBuoy className="w-4 h-4 text-teal-600" />
            <span>Teknik Grounding 5-4-3-2-1 Saat Mengalami Panik:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600">
            <li><strong>5 hal</strong> yang dapat kamu lihat di sekitarmu.</li>
            <li><strong>4 hal</strong> yang dapat kamu sentuh (meja, baju, rambut).</li>
            <li><strong>3 suara</strong> yang dapat kamu dengar saat ini.</li>
            <li><strong>2 aroma</strong> yang dapat kamu cium.</li>
            <li><strong>1 rasa</strong> di lidahmu, lalu tarik napas perlahan.</li>
          </ol>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
        >
          Tutup Jendela Bantuan
        </button>
      </div>
    </div>
  );
};
