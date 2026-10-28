import React from 'react';
import { TaskSubmission, InternshipTask, UserProfile } from '../types';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  HelpCircle, 
  Lightbulb, 
  TrendingUp, 
  Upload, 
  UserCheck, 
  Mail, 
  Calendar,
  FileCheck
} from 'lucide-react';

interface AIEvaluationViewProps {
  submission: TaskSubmission;
  task: InternshipTask;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onOpenUpload: (task: InternshipTask) => void;
  onAskMentorWithContext: (task: InternshipTask, prompt: string) => void;
}

export const AIEvaluationView: React.FC<AIEvaluationViewProps> = ({
  submission,
  task,
  currentUser,
  isOpen,
  onClose,
  onOpenUpload,
  onAskMentorWithContext,
}) => {
  if (!isOpen || !submission.evaluation) return null;

  const evaluation = submission.evaluation;
  const isRecommended = evaluation.aiVerdict === 'RECOMMENDED_FOR_APPROVAL';
  const reviewerApproval = submission.reviewerApproval;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Automated Task Review &bull; Version {submission.currentVersion}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                AI Evaluation Report: {task.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* Top Score & Verdict Card */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center space-x-5">
              
              {/* Score Dial */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-700"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={evaluation.score >= 80 ? 'text-emerald-500' : 'text-amber-500'}
                    strokeDasharray={`${evaluation.score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-extrabold text-white">{evaluation.score}</span>
                  <span className="text-[10px] text-slate-400 block -mt-1">/100</span>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isRecommended
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isRecommended ? 'Recommended for Approval' : 'Revision Required'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Evaluated on {new Date(evaluation.evaluatedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1.5">
                  {isRecommended
                    ? 'Excellent Work! Core requirements satisfy technical criteria.'
                    : 'Good effort, but specific requirements require refinement before reviewer approval.'}
                </h3>
              </div>
            </div>

            {/* Email notification confirmation badge */}
            <div className="bg-slate-900/80 px-3.5 py-2.5 rounded-xl border border-slate-700/80 flex items-center space-x-2 text-xs text-slate-300 shrink-0">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Report emailed to {currentUser.email}</span>
            </div>
          </div>

          {/* Official Human Reviewer Sign-Off Box */}
          <div className="rounded-2xl border p-5 shadow-sm bg-slate-800/40 border-slate-700">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Authorized Reviewer Official Status</span>
              </h4>
              {reviewerApproval ? (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    reviewerApproval.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {reviewerApproval.status === 'approved' ? 'Officially Approved' : 'Revision Mandated'}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Pending Reviewer Sign-Off
                </span>
              )}
            </div>

            {reviewerApproval ? (
              <div className="mt-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    Reviewer: <strong>{reviewerApproval.approvedByName}</strong>
                  </span>
                  <span className="text-emerald-400 font-bold">
                    Official Score: {reviewerApproval.officialScore}/100
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic">
                  "{reviewerApproval.reviewerFeedback}"
                </p>
                <div className="text-[10px] text-slate-500">
                  Signed off on {new Date(reviewerApproval.approvedAt).toLocaleString()}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">
                "Do not automatically approve work solely because an AI model says it is complete."
                The Lead Mentor will review the AI findings, inspect the submission code, and provide official approval.
              </p>
            )}
          </div>

          {/* THE 6 MANDATORY EVALUATION DIMENSIONS */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Detailed 6-Dimension Feedback Breakdown
            </h3>

            {/* 1. What is Good */}
            <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4.5 space-y-2">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>1. What is Good</span>
              </h4>
              <ul className="space-y-1.5 pl-2">
                {evaluation.whatIsGood.map((item, i) => (
                  <li key={i} className="text-xs text-slate-200 flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. What is Missing */}
            <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-4.5 space-y-2">
              <h4 className="text-sm font-bold text-rose-400 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>2. What is Missing</span>
              </h4>
              <ul className="space-y-1.5 pl-2">
                {evaluation.whatIsMissing.map((item, i) => (
                  <li key={i} className="text-xs text-slate-200 flex items-start space-x-2">
                    <span className="text-rose-400 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. What Needs Correction */}
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4.5 space-y-2">
              <h4 className="text-sm font-bold text-amber-400 flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>3. What Needs Correction</span>
              </h4>
              <ul className="space-y-1.5 pl-2">
                {evaluation.whatNeedsCorrection.map((item, i) => (
                  <li key={i} className="text-xs text-slate-200 flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. What Should Be Added */}
            <div className="bg-blue-950/20 border border-blue-800/40 rounded-xl p-4.5 space-y-2">
              <h4 className="text-sm font-bold text-blue-400 flex items-center space-x-2">
                <PlusCircle className="w-4 h-4 text-blue-400" />
                <span>4. What Should Be Added</span>
              </h4>
              <ul className="space-y-1.5 pl-2">
                {evaluation.whatShouldBeAdded.map((item, i) => (
                  <li key={i} className="text-xs text-slate-200 flex items-start space-x-2">
                    <span className="text-blue-400 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Recommended Improvements */}
            <div className="bg-purple-950/20 border border-purple-800/40 rounded-xl p-4.5 space-y-2">
              <h4 className="text-sm font-bold text-purple-400 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-purple-400" />
                <span>5. Recommended Improvements</span>
              </h4>
              <ul className="space-y-1.5 pl-2">
                {evaluation.recommendedImprovements.map((item, i) => (
                  <li key={i} className="text-xs text-slate-200 flex items-start space-x-2">
                    <span className="text-purple-400 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 6. Overall Evaluation & Next Steps */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>6. Overall Evaluation & Next Steps</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {evaluation.overallEvaluation}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                onClose();
                onAskMentorWithContext(
                  task,
                  `I just received my AI evaluation for "${task.title}". The reviewer noted missing items: ${evaluation.whatIsMissing.join(', ')}. How can I fix these step by step?`
                );
              }}
              className="px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask Dr. Nova How to Resolve Corrections</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenUpload(task);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Revised Code (v{submission.currentVersion + 1})</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
