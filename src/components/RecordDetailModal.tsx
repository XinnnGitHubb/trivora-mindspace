import React from 'react';
import { MonthlyScreeningRecord } from '../types/mentalHealth';
import { X, Calendar, Activity, Moon, MessageSquareHeart, Printer, AlertTriangle } from 'lucide-react';

interface RecordDetailModalProps {
  record: MonthlyScreeningRecord | null;
  onClose: () => void;
  onOpenCounselingWithData: (record: MonthlyScreeningRecord) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  onClose,
  onOpenCounselingWithData,
}) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>{record.date}</span>
              <span>·</span>
              <span>{record.academicPeriod}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Rincian Evaluasi Kesehatan Mental - {record.month}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wellbeing Barometer */}
        <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-teal-800 font-medium block">
              Indeks Kesejahteraan Emosional
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-teal-950">
              {record.wellbeingIndex}%
            </span>
            <span className="text-xs text-teal-700 block mt-0.5">
              {record.wellbeingIndex >= 70 ? 'Tergolong Stabil & Positif' : 'Memerlukan Pendampingan Suportif'}
            </span>
          </div>
          <div className="w-14 h-14 rounded-full bg-white border-4 border-teal-600 flex items-center justify-center font-bold text-teal-800 text-sm font-mono tabular-nums shadow-xs">
            {record.wellbeingIndex}%
          </div>
        </div>

        {/* 3 Metric Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[11px] text-slate-500 block mb-1">Depresi</span>
            <span
              className="text-lg font-bold font-mono tabular-nums block"
              style={{ color: record.depression.color }}
            >
              {record.depression.score}/42
            </span>
            <span className="text-xs font-semibold" style={{ color: record.depression.color }}>
              {record.depression.severity}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[11px] text-slate-500 block mb-1">Kecemasan</span>
            <span
              className="text-lg font-bold font-mono tabular-nums block"
              style={{ color: record.anxiety.color }}
            >
              {record.anxiety.score}/42
            </span>
            <span className="text-xs font-semibold" style={{ color: record.anxiety.color }}>
              {record.anxiety.severity}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[11px] text-slate-500 block mb-1">Stres</span>
            <span
              className="text-lg font-bold font-mono tabular-nums block"
              style={{ color: record.stress.color }}
            >
              {record.stress.score}/42
            </span>
            <span className="text-xs font-semibold" style={{ color: record.stress.color }}>
              {record.stress.severity}
            </span>
          </div>
        </div>

        {/* Academic context */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Rata-rata durasi tidur:</span>
            <strong className="font-mono tabular-nums text-slate-900">{record.sleepHoursAverage} jam/hari</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Tingkat beban perkuliahan:</span>
            <strong className="text-slate-900">{record.academicPressureLevel}</strong>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <span className="text-slate-500 block mb-1">Isu Utama Mahasiswa:</span>
            <p className="text-slate-800 font-medium">{record.dominantIssues.join(', ')}</p>
          </div>
          {record.notes && (
            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-500 block mb-0.5">Catatan Evaluasi:</span>
              <p className="text-slate-600 italic">"{record.notes}"</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Lembar Ini
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenCounselingWithData(record);
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageSquareHeart className="w-3.5 h-3.5" /> Mulai Konseling dengan Data Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
