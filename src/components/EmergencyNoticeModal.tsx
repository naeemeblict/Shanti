import React from 'react';
import { ShieldAlert, AlertTriangle, Phone, ExternalLink, X, HeartPulse } from 'lucide-react';
import { CLINIC_CONFIG } from '../constants/case-form-data';

interface EmergencyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerReason?: string;
}

export const EmergencyNoticeModal: React.FC<EmergencyNoticeModalProps> = ({
  isOpen,
  onClose,
  triggerReason,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-red-500/50">
        {/* Header */}
        <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-700 rounded-xl">
              <ShieldAlert className="w-6 h-6 animate-pulse text-amber-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">জরুরি স্বাস্থ্য সতর্কবার্তা</h3>
              <p className="text-xs text-red-100">Clinical Safety & Emergency Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-red-200 hover:text-white p-1 rounded-lg hover:bg-red-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-slate-800">
          {triggerReason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-900 text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">চিহ্নিত ঝুঁকিপূর্ণ উপসর্গ: </span>
                <span>{triggerReason}</span>
              </div>
            </div>
          )}

          <p className="text-sm leading-relaxed text-slate-700">
            শান্তি হোমিও কেয়ারের অনলাইন কেস টেকিং ফর্মটি কোনো তাৎক্ষণিক জরুরি সেবার বিকল্প নয়। আপনার
            বা রোগীর ক্ষেত্রে যদি তীব্র রক্তক্ষরণ, প্রস্রাবের সম্পূর্ণ প্রতিবন্ধকতা, অসহ্য পেটব্যথা বা
            শ্বাসকষ্টের মতো তীব্র উপসর্গ দেখা দেয়, তবে{' '}
            <strong className="text-red-700">
              অনলাইন পর্যালোচনার জন্য এক মুহূর্তও অপেক্ষা না করে সরাসরি নিকটস্থ হাসপাতালের জরুরি বিভাগে
            </strong>{' '}
            যোগাযোগ করার পরামর্শ দেওয়া হচ্ছে।
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-amber-600" />
              জাতীয় ও জরুরি স্বাস্থ্য হটলাইন নম্বর
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
              <a
                href="tel:16263"
                className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 hover:border-amber-400 text-slate-800 shadow-xs"
              >
                <span>স্বাস্থ্য বাতায়ন</span>
                <span className="text-teal-700 font-bold">১৬২৬৩</span>
              </a>
              <a
                href="tel:999"
                className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 hover:border-amber-400 text-slate-800 shadow-xs"
              >
                <span>জাতীয় জরুরি সেবা</span>
                <span className="text-red-700 font-bold">৯৯৯</span>
              </a>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
            <a
              href={`tel:${CLINIC_CONFIG.phoneRaw}`}
              className="flex-1 flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>চেম্বারে সরাসরি কল: {CLINIC_CONFIG.phone}</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
            >
              বুঝেছি, চালিয়ে যান
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
