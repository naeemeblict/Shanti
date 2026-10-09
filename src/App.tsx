import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CaseTakingForm } from './components/CaseTakingForm';
import { CaseStatusLookup } from './components/CaseStatusLookup';
import { DoctorDashboard } from './components/DoctorDashboard';
import { CaseDetailModal } from './components/CaseDetailModal';
import { PrintCaseReport } from './components/PrintCaseReport';
import { EmergencyNoticeModal } from './components/EmergencyNoticeModal';
import { ClinicInfoModal } from './components/ClinicInfoModal';
import { PatientCase } from './types/case';
import { CaseStorage } from './services/storage';
import { CLINIC_CONFIG } from './constants/case-form-data';
import {
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  HeartHandshake,
  Heart,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'form' | 'lookup' | 'doctor' | 'info'>('form');
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<PatientCase | null>(null);
  const [selectedCaseForPrint, setSelectedCaseForPrint] = useState<PatientCase | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState<string | undefined>();
  const [isClinicInfoModalOpen, setIsClinicInfoModalOpen] = useState(false);

  // Load cases from storage on start
  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = () => {
    const list = CaseStorage.getAllCases();
    setCases(list);
  };

  const handleCaseSubmitted = (newCase: PatientCase) => {
    loadCases();
  };

  const handleCaseUpdated = (updated: PatientCase) => {
    loadCases();
    setSelectedCaseForDetail(updated);
  };

  const handleOpenEmergency = (reason?: string) => {
    setEmergencyReason(reason);
    setIsEmergencyModalOpen(true);
  };

  const pendingCount = cases.filter((c) => c.reviewStatus === 'pending').length;

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col text-slate-800">
      {/* Clinic Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'info') {
            setIsClinicInfoModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        onOpenEmergencyModal={() => handleOpenEmergency()}
        pendingCasesCount={pendingCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'form' && (
          <CaseTakingForm
            onCaseSubmitted={handleCaseSubmitted}
            onOpenEmergencyModal={handleOpenEmergency}
          />
        )}

        {currentTab === 'lookup' && (
          <CaseStatusLookup
            onSelectCaseToView={(c) => setSelectedCaseForDetail(c)}
            onNavigateToForm={() => setCurrentTab('form')}
          />
        )}

        {currentTab === 'doctor' && (
          <DoctorDashboard
            cases={cases}
            onSelectCase={(c) => setSelectedCaseForDetail(c)}
            onOpenPrintView={(c) => setSelectedCaseForPrint(c)}
            onAddNewCase={() => setCurrentTab('form')}
            onRefreshCases={loadCases}
          />
        )}
      </main>

      {/* Case Details Modal */}
      {selectedCaseForDetail && (
        <CaseDetailModal
          isOpen={true}
          caseData={selectedCaseForDetail}
          onClose={() => setSelectedCaseForDetail(null)}
          onCaseUpdated={handleCaseUpdated}
          onOpenPrintView={(c) => {
            setSelectedCaseForPrint(c);
          }}
          isDoctorMode={true}
        />
      )}

      {/* Printable Case Report Modal */}
      {selectedCaseForPrint && (
        <PrintCaseReport
          caseData={selectedCaseForPrint}
          onClose={() => setSelectedCaseForPrint(null)}
        />
      )}

      {/* Emergency Alert Modal */}
      <EmergencyNoticeModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        triggerReason={emergencyReason}
      />

      {/* Clinic Info Modal */}
      <ClinicInfoModal
        isOpen={isClinicInfoModalOpen}
        onClose={() => setIsClinicInfoModalOpen(false)}
      />

      {/* Footer */}
      <footer className="no-print bg-slate-900 text-slate-300 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            {/* Column 1: Clinic Intro */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-lg font-serif">
                  শ
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{CLINIC_CONFIG.nameBangla}</h3>
                  <p className="text-xs text-teal-400 font-medium">{CLINIC_CONFIG.nameEnglish}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                বিজ্ঞানসম্মত ক্লাসিক্যাল হোমিওপ্যাথি চিকিৎসা ও ব্যক্তিগত কেস বিশ্লেষণের মাধ্যমে
                রোগীর সার্বিক নিরাময় নিশ্চিতে আমরা অঙ্গীকারবদ্ধ।
              </p>
            </div>

            {/* Column 2: Address & Timings */}
            <div className="space-y-2.5 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-400" />
                চেম্বার ও সময়সূচি
              </h4>
              <p className="text-slate-300">{CLINIC_CONFIG.address}</p>
              <p className="text-slate-400">{CLINIC_CONFIG.consultationHours}</p>
              <div className="pt-1 flex items-center gap-2">
                <a
                  href={`tel:${CLINIC_CONFIG.phoneRaw}`}
                  className="inline-flex items-center gap-1.5 bg-teal-800/80 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-bold"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{CLINIC_CONFIG.phone}</span>
                </a>
                <a
                  href={CLINIC_CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>হোয়াটসঅ্যাপ</span>
                </a>
              </div>
            </div>

            {/* Column 3: Clinical Disclaimer */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ক্লিনিক্যাল সুরক্ষা ও ডিজিটাল নীতি
              </h4>
              <p className="text-slate-400 leading-relaxed">
                অনলাইন কেস বিবরণী চিকিৎসকের সরাসরি পর্যবেক্ষণের একটি সহায়কমাত্র। কোনো জরুরি প্রাণঘাতী
                সমস্যায় দেরি না করে নিকটস্থ হাসপাতালে সরাসরি যোগাযোগ করুন।
              </p>
              <p className="text-slate-500 text-[11px] pt-1">
                জাতীয় জরুরি সেবা: ৯৯৯ • স্বাস্থ্য বাতায়ন: ১৬২৬৩
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} {CLINIC_CONFIG.nameBangla} (Shanti Homeo Care). সর্বস্বত্ব সংরক্ষিত।</p>
            <p className="flex items-center gap-1">
              <span>নির্মিত হয়েছে ক্লাসিক্যাল হোমিওপ্যাথি সেবার আধুনিকায়নে</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
