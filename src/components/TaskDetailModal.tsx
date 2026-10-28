import React, { useState, useRef } from 'react';
import { InternshipTask, TaskSubmission, UserProfile } from '../types';
import { 
  X, 
  CheckCircle2, 
  Upload, 
  FileText, 
  Clock, 
  ExternalLink, 
  Mail, 
  AlertCircle, 
  Sparkles,
  History,
  FileCode,
  ShieldCheck,
  Send
} from 'lucide-react';

interface TaskDetailModalProps {
  task: InternshipTask;
  submission?: TaskSubmission;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (submission: TaskSubmission) => void;
  onOpenAIReview: (submission: TaskSubmission, task: InternshipTask) => void;
  onAskMentor: (task: InternshipTask) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  submission,
  currentUser,
  isOpen,
  onClose,
  onUploadSuccess,
  onOpenAIReview,
  onAskMentor,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSendingTaskEmail, setIsSendingTaskEmail] = useState<boolean>(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file extension
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAllowed = task.allowedFileTypes.some(t => t.toLowerCase() === ext);
      if (!isAllowed) {
        setUploadError(`File type "${ext}" is not permitted. Please upload: ${task.allowedFileTypes.join(', ')}`);
        setSelectedFile(null);
        return;
      }

      // Validate file size
      const maxBytes = task.maxFileSizeMb * 1024 * 1024;
      if (file.size > maxBytes) {
        setUploadError(`File exceeds maximum size of ${task.maxFileSizeMb} MB.`);
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('taskId', task.id);
      formData.append('internId', currentUser.id);
      formData.append('notes', submissionNotes);

      const res = await fetch('/api/submissions/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload and evaluation failed');
      }

      onUploadSuccess(data.submission);
      setSelectedFile(null);
      setSubmissionNotes('');
      // Open AI Review View right away
      onOpenAIReview(data.submission, task);
    } catch (err: any) {
      console.error('Error uploading submission:', err);
      setUploadError(err.message || 'Error uploading file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendTaskEmail = async () => {
    try {
      setIsSendingTaskEmail(true);
      setEmailSentSuccess(false);

      const res = await fetch('/api/notifications/send-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, internId: currentUser.id }),
      });

      if (res.ok) {
        setEmailSentSuccess(true);
        setTimeout(() => setEmailSentSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to trigger email:', err);
    } finally {
      setIsSendingTaskEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 font-mono font-bold text-sm flex items-center justify-center border border-blue-500/30">
              M{task.month}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  {task.monthTitle}
                </span>
                <span className="text-xs text-slate-500">&bull;</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                  {task.domain}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Task {task.taskNumber}: {task.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSendTaskEmail}
              disabled={isSendingTaskEmail}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5 border border-slate-700 transition"
              title="Send task instructions and rubrics to my email"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">
                {emailSentSuccess ? 'Email Dispatched!' : isSendingTaskEmail ? 'Sending...' : 'Email Instructions'}
              </span>
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* Email dispatch alert */}
          {emailSentSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full task instructions, acceptance criteria, and deadline sent to {currentUser.email}!</span>
            </div>
          )}

          {/* Description Block */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overview & Context
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-slate-800">
              {task.description}
            </p>
          </div>

          {/* Grid: Objectives & Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Learning Objectives */}
            <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Learning Objectives</span>
              </h3>
              <ul className="space-y-2">
                {task.objectives.map((obj, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-blue-400 font-bold">&bull;</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Acceptance Criteria */}
            <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Acceptance Criteria</span>
              </h3>
              <ul className="space-y-2">
                {task.acceptanceCriteria.map((c, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Deliverables & Resources */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expected Deliverables</span>
              <p className="text-xs text-slate-300">{task.deliverables}</p>
              <div className="pt-2 text-[11px] text-slate-400 font-mono">
                Formats: {task.allowedFileTypes.join(', ')} &bull; Max: {task.maxFileSizeMb} MB
              </div>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Curated Resources</span>
              <div className="space-y-1.5">
                {task.learningResources.map((res, i) => (
                  <a
                    key={i}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-xs text-blue-400 hover:text-blue-300 hover:underline bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50"
                  >
                    <span className="truncate">{res.title}</span>
                    <ExternalLink className="w-3 h-3 ml-1 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Submission & AI Evaluation Section */}
          <div className="border-t border-slate-800 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Upload Assignment & Automated Review</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Uploaded files are automatically analyzed against task rubrics using Gemini AI to provide a 6-dimension evaluation scorecard.
                </p>
              </div>

              <button
                onClick={() => { onClose(); onAskMentor(task); }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1.5 hover:bg-indigo-600/30 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Ask Dr. Nova Hints</span>
              </button>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                selectedFile
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/60'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={task.allowedFileTypes.join(',')}
                className="hidden"
              />
              
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 rounded-full bg-slate-800 border border-slate-700 text-blue-400">
                  <FileCode className="w-6 h-6" />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click to choose another file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Click or drag and drop your project file here
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supported: {task.allowedFileTypes.join(', ')} (Up to {task.maxFileSizeMb} MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submission Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Notes for Evaluator & Reviewer (Optional)
              </label>
              <textarea
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                rows={2}
                placeholder="Mention key design choices, formula approaches, or areas you would like specific feedback on..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Submit & Evaluate Button */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
              >
                Close
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-blue-500/20 transition"
              >
                {isUploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI Evaluating Submission...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Upload & Generate AI Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Submission History / Past Versions */}
          {submission && submission.versions.length > 0 && (
            <div className="border-t border-slate-800 pt-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Submission Version History ({submission.versions.length} versions)</span>
              </h4>

              <div className="space-y-2">
                {submission.versions.map((ver) => (
                  <div
                    key={ver.version}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        v{ver.version}
                      </span>
                      <div>
                        <span className="font-semibold text-slate-200">{ver.fileName}</span>
                        <span className="text-slate-500 ml-2">
                          {(ver.fileSize / 1024).toFixed(1)} KB &bull;{' '}
                          {new Date(ver.uploadedAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {ver.submissionNotes && (
                          <p className="text-[11px] text-slate-400 mt-0.5 italic">
                            "{ver.submissionNotes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {submission.evaluation && ver.version === submission.currentVersion && (
                      <button
                        onClick={() => onOpenAIReview(submission, task)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold hover:bg-cyan-500/30 transition text-[11px]"
                      >
                        Score: {submission.evaluation.score}/100
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
