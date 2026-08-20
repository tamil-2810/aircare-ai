import React from 'react';
import { X, Info, ShieldCheck, Activity, Heart, Sparkles } from 'lucide-react';

interface AQIInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AQIInfoModal: React.FC<AQIInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const tiers = [
    { range: '0 – 50', status: 'Good', color: 'bg-emerald-500 text-white', desc: 'Air quality is satisfactory and poses little or no risk.' },
    { range: '51 – 100', status: 'Moderate', color: 'bg-teal-500 text-white', desc: 'Acceptable; unusually sensitive people should consider reducing prolonged heavy exertion.' },
    { range: '101 – 150', status: 'Unhealthy for Sensitive Groups', color: 'bg-amber-500 text-white', desc: 'Members of sensitive groups may experience health effects. General public not likely affected.' },
    { range: '151 – 200', status: 'Unhealthy', color: 'bg-orange-500 text-white', desc: 'Everyone may begin to experience health effects; sensitive groups may experience more serious health effects.' },
    { range: '201 – 300', status: 'Very Unhealthy', color: 'bg-purple-600 text-white', desc: 'Health alert: The risk of health effects is increased for everyone in the area.' },
    { range: '301+', status: 'Hazardous', color: 'bg-rose-700 text-white', desc: 'Health warning of emergency conditions: the entire population is even more likely to be affected.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 text-left space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Air Quality Index Guide</h2>
              <span className="text-xs text-slate-500">Understanding US EPA Standards & Biometric Translation</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Why AirCare AI is Different */}
        <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-emerald-900 text-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Why an AQI Number Alone Isn&apos;t Enough</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            A runner breathing 60 liters of air per minute at 150 AQI inhales <strong>5 times more particulate mass</strong> than someone walking for 20 minutes. AirCare AI translates the environmental score into personal respiratory strain.
          </p>
        </div>

        {/* AQI Tiers Table */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-slate-900">Official Standard Scale</h3>
          <div className="space-y-2">
            {tiers.map((t, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5 min-w-[170px]">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${t.color}`}>
                    {t.range}
                  </span>
                  <span className="font-bold text-slate-900">{t.status}</span>
                </div>
                <p className="text-slate-600 sm:text-right">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
          >
            Got it, Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
