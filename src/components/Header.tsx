import React from 'react';
import { Phone, MapPin, ShieldAlert, Info, UserCheck, FileText, Search } from 'lucide-react';
import { CLINIC_CONFIG } from '../constants/case-form-data';

interface HeaderProps {
  currentTab: 'form' | 'lookup' | 'doctor' | 'info';
  onSelectTab: (tab: 'form' | 'lookup' | 'doctor' | 'info') => void;
  onOpenEmergencyModal: () => void;
  pendingCasesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenEmergencyModal,
  pendingCasesCount = 0,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-950/10 shadow-xs">
      {/* Top Banner with Address and Emergency Hotline */}
      <div className="bg-[#0F766E] text-white text-xs sm:text-sm py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-200" />
            <span className="truncate">{CLINIC_CONFIG.address}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <a
              href={`tel:${CLINIC_CONFIG.phoneRaw}`}
              className="flex items-center gap-1.5 font-medium hover:text-emerald-100 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-200" />
              <span>হটলাইন: {CLINIC_CONFIG.phone}</span>
            </a>

            <button
              onClick={onOpenEmergencyModal}
              className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2 py-0.5 rounded text-[11px] sm:text-xs transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>জরুরি সতর্কতা</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Branding */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSelectTab('form')}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-teal-700 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-teal-900/15 shrink-0 border border-teal-600/30">
              <span className="text-xl sm:text-2xl font-black font-serif">শ</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-teal-950 group-hover:text-teal-800 transition-colors">
                  {CLINIC_CONFIG.nameBangla}
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-200">
                  ডিজিটাল কেস টেকিং
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                Shanti Homeo Care • ক্লাসিক্যাল হোমিওপ্যাথি ও এআই ক্লিনিক্যাল অ্যাসিস্ট্যান্স
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center flex-wrap gap-1.5 sm:gap-2 pt-1 md:pt-0">
            <button
              onClick={() => onSelectTab('form')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'form'
                  ? 'bg-teal-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>কেস ফর্ম</span>
            </button>

            <button
              onClick={() => onSelectTab('lookup')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'lookup'
                  ? 'bg-teal-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>কেস অনুসন্ধান</span>
            </button>

            <button
              onClick={() => onSelectTab('doctor')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all relative cursor-pointer ${
                currentTab === 'doctor'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 hover:bg-emerald-100'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>চিকিৎসক পোর্টাল</span>
              {pendingCasesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold bg-amber-500 text-slate-950 rounded-full">
                  {pendingCasesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('info')}
              className={`p-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'info'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="ক্লিনিক পরিচিতি ও নিয়মাবলী"
              aria-label="ক্লিনিক পরিচিতি"
            >
              <Info className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
