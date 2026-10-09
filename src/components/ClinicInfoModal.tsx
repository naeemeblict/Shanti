import React from 'react';
import { CLINIC_CONFIG } from '../constants/case-form-data';
import { MapPin, Phone, MessageSquare, Clock, ShieldCheck, HeartHandshake, X } from 'lucide-react';

interface ClinicInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicInfoModal: React.FC<ClinicInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-[#0F766E] text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{CLINIC_CONFIG.nameBangla}</h3>
            <p className="text-xs text-teal-100">{CLINIC_CONFIG.nameEnglish} • সেবা নির্দেশিকা ও পরিচিতি</p>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1 rounded-lg hover:bg-teal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-700 text-sm max-h-[80vh] overflow-y-auto">
          {/* Doctor Profile Card */}
          <div className="bg-gradient-to-br from-teal-900 to-emerald-950 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-2 border border-teal-800">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-800 border border-teal-600 flex items-center justify-center text-white text-xl font-bold font-serif shrink-0 shadow-inner">
                ব
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 block">
                  {CLINIC_CONFIG.doctorRole}
                </span>
                <h4 className="text-lg font-black text-white">{CLINIC_CONFIG.doctorNameBangla}</h4>
                <p className="text-xs text-teal-200 font-bold">{CLINIC_CONFIG.doctorNameEnglish}</p>
                <p className="text-xs text-slate-300 mt-1 font-medium">{CLINIC_CONFIG.doctorDesignationBangla}</p>
                <p className="text-[11px] text-teal-200/80 italic">{CLINIC_CONFIG.doctorDesignationEnglish}</p>
              </div>
            </div>
          </div>

          {/* Chamber Details */}
          <div className="space-y-3 bg-[#FAF7F0] p-4 rounded-xl border border-amber-900/10">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">চেম্বারের ঠিকানা</h4>
                <p className="text-slate-600">{CLINIC_CONFIG.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">পরামর্শ ও সাক্ষাতের সময়সূচি</h4>
                <p className="text-slate-600">{CLINIC_CONFIG.consultationHours}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">সরাসরি সিরিয়াল ও যোগাযোগ</h4>
                <p className="text-slate-600">{CLINIC_CONFIG.phone}</p>
              </div>
            </div>
          </div>

          {/* Homeopathy Philosophy */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-700" />
              হোমিওপ্যাথিক কেস টেকিং কেন গুরুত্বপূর্ণ?
            </h4>
            <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
              হোমিওপ্যাথিতে শুধুমাত্র বাহ্যিক লক্ষণ নয়, বরং ব্যক্তির সম্পূর্ণ মানসিক গঠন, খাদ্যাভ্যাস,
              ঘুম, আবহাওয়ার প্রভাব এবং রোগের হ্রাস-বৃদ্ধি বিবেচনা করে সাদৃশ্যপূর্ণ ওষুধ নির্ধারণ করা হয়।
              আপনার দেওয়া প্রতিটি সূক্ষ্ম তথ্য চিকিৎসককে সঠিক ওষুধ নির্বাচনে সহায়তা করে।
            </p>
          </div>

          {/* Privacy & Safety */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              গোপনীয়তা ও ডেটা নিরাপত্তা নীতিমালা
            </h4>
            <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
              আপনার সংরক্ষিত স্বাস্থ্যসংক্রান্ত তথ্য সম্পূর্ণ নিরাপদ ও গোপনীয়। এআই সহকারী কোনো চূড়ান্ত
              প্রেসক্রিপশন প্রদান করে না; এটি কেবলমাত্র চিকিৎসকের পর্যালোচনার সুবিধার জন্য তথ্য সুবিন্যস্ত
              করে প্রস্তুত করে।
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
            <a
              href={CLINIC_CONFIG.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপে চ্যাট করুন</span>
            </a>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
