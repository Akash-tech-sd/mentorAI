import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { Award, CheckCircle2, Download, Printer, ShieldCheck, X } from 'lucide-react';

interface GraduationCertificateModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  isEligible: boolean;
}

export const GraduationCertificateModal: React.FC<GraduationCertificateModalProps> = ({
  user,
  isOpen,
  onClose,
  isEligible,
}) => {
  useEffect(() => {
    if (isOpen && isEligible) {
      // Fire celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen, isEligible]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 print:hidden">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Official Data Analytics Internship Completion Certificate
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* EXACT REQUIRED MESSAGE BANNER */}
          <div className="text-center space-y-2 py-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border border-amber-500/40 rounded-2xl p-6 shadow-lg print:border-none">
            <span className="text-4xl">🎓</span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-300 tracking-tight">
              Congratulations! You have successfully completed your internship!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              All 12 curriculum milestones and the Final Enterprise Data Analytics Capstone Defense have been reviewed and approved with distinction.
            </p>
          </div>

          {/* PRINTABLE OFFICIAL CERTIFICATE DOCUMENT */}
          <div className="relative bg-gradient-to-b from-white via-slate-50 to-amber-50 text-slate-900 p-8 sm:p-12 rounded-2xl border-8 border-double border-amber-600/30 shadow-2xl print:border-none print:shadow-none">
            {/* Watermark Crest */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <Award className="w-96 h-96 text-slate-900" />
            </div>

            <div className="relative z-10 text-center space-y-6">
              {/* Top Institution Header */}
              <div className="space-y-1">
                <span className="text-xs uppercase font-extrabold tracking-widest text-blue-900">
                  Global Institute of Data Science & Artificial Intelligence
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-slate-950 uppercase">
                  Certificate of Internship Completion
                </h2>
                <div className="w-24 h-0.5 bg-amber-500 mx-auto mt-2" />
              </div>

              {/* Recipient */}
              <div className="py-2 space-y-1">
                <p className="text-xs uppercase tracking-wider text-slate-600 font-medium">
                  This is proudly presented to
                </p>
                <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-blue-950 underline decoration-amber-500 decoration-2 underline-offset-8">
                  {user.name}
                </h3>
                <p className="text-xs text-slate-600 pt-2 font-mono">
                  Enrolment ID: <strong>{user.enrollmentId}</strong> &bull; {user.degree || 'B.Tech Information Technology'}
                </p>
              </div>

              {/* Citation Body */}
              <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed font-serif">
                for exemplary performance and successful completion of the intensive <strong>One-Year Data Analytics & Business Intelligence Mentorship Track</strong>. The candidate has demonstrated rigorous practical competencies in <em>Advanced Spreadsheet Modeling, Relational PostgreSQL Schema Architecture, Advanced SQL Window Functions, Python Data Pipelines, Seaborn Storytelling, Power BI Star Schema Modeling, DAX Time Intelligence, Applied Statistics & A/B Experimentation, Predictive Machine Learning, and Enterprise Capstone Executive Defense</em>.
              </p>

              {/* Key Domains Mastered Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-semibold text-slate-700 max-w-2xl mx-auto">
                <div className="p-2 rounded bg-amber-100/70 border border-amber-200">
                  Excel & Modeling
                </div>
                <div className="p-2 rounded bg-amber-100/70 border border-amber-200">
                  PostgreSQL & SQL
                </div>
                <div className="p-2 rounded bg-amber-100/70 border border-amber-200">
                  Python & Pandas
                </div>
                <div className="p-2 rounded bg-amber-100/70 border border-amber-200">
                  Power BI & DAX
                </div>
                <div className="p-2 rounded bg-amber-100/70 border border-amber-200">
                  A/B Testing & Stats
                </div>
                <div className="p-2 rounded bg-amber-100/70 border border-amber-200">
                  Scikit-Learn ML
                </div>
                <div className="p-2 rounded bg-amber-100/70 border border-amber-200">
                  Production Pipelines
                </div>
                <div className="p-2 rounded bg-amber-100/70 border border-amber-200">
                  Enterprise Capstone
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-200 max-w-xl mx-auto">
                <div className="text-center">
                  <div className="font-serif italic font-bold text-slate-900 text-lg border-b border-slate-400 pb-1">
                    Dr. Priya Sharma
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">
                    Lead Mentor & Reviewer Board
                  </div>
                </div>

                {/* Golden Seal */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md border-2 border-amber-700 shrink-0">
                  <div className="w-12 h-12 rounded-full border border-amber-900/40 flex items-center justify-center text-center text-[8px] font-black uppercase">
                    Verified<br/>Credential
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-serif italic font-bold text-slate-900 text-lg border-b border-slate-400 pb-1">
                    Prof. M. K. Raman
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">
                    Director of Academic Affairs
                  </div>
                </div>
              </div>

              {/* Verification Metadata */}
              <div className="pt-4 text-[10px] text-slate-500 font-mono flex flex-wrap justify-between items-center max-w-xl mx-auto border-t border-slate-200">
                <span>Credential ID: CERT-DA-2026-889</span>
                <span>Date: October 28, 2026</span>
                <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Digitally Signed & Verified</span>
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
