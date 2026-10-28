import React, { useState, useEffect } from 'react';
import { InternshipTask, TaskSubmission, UserProfile, ChatbotFeedbackEntry } from '../types';
import { 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Video, 
  Calendar, 
  Star, 
  MessageSquare, 
  FileCode, 
  Sparkles, 
  Mail, 
  Send,
  Layers,
  ChevronDown
} from 'lucide-react';

interface ReviewerPortalProps {
  currentUser: UserProfile;
  tasks: InternshipTask[];
  submissions: TaskSubmission[];
  allUsers: UserProfile[];
  onRefreshData: () => void;
  onOpenAIReview: (submission: TaskSubmission, task: InternshipTask) => void;
}

export const ReviewerPortal: React.FC<ReviewerPortalProps> = ({
  currentUser,
  tasks,
  submissions,
  allUsers,
  onRefreshData,
  onOpenAIReview,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'feedback' | 'schedule'>('queue');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [reviewerDecision, setReviewerDecision] = useState<'approved' | 'revision_requested'>('approved');
  const [reviewerScore, setReviewerScore] = useState<number>(90);
  const [reviewerComments, setReviewerComments] = useState<string>('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);
  const [decisionSuccessMsg, setDecisionSuccessMsg] = useState<string | null>(null);

  // Scheduling state
  const [scheduleDate, setScheduleDate] = useState<string>('2026-03-05T15:00');
  const [scheduleMeetLink, setScheduleMeetLink] = useState<string>('https://meet.google.com/ais-data-review-2026');
  const [scheduleAgenda, setScheduleAgenda] = useState<string>('Technical code walkthrough, SQL query optimization explanation, and viva review.');
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState<string | null>(null);

  // Feedback list
  const [feedbackEntries, setFeedbackEntries] = useState<ChatbotFeedbackEntry[]>([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch('/api/chat/feedback');
        if (res.ok) {
          const data = await res.json();
          setFeedbackEntries(data);
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
      }
    };
    fetchFeedback();
  }, [activeTab]);

  const selectedSubmission = submissions.find(s => s.id === selectedSubmissionId) || submissions[0];
  const selectedTask = selectedSubmission ? tasks.find(t => t.id === selectedSubmission.taskId) : null;
  const selectedIntern = selectedSubmission ? allUsers.find(u => u.id === selectedSubmission.internId) : null;

  // Initialize form when selected submission changes
  useEffect(() => {
    if (selectedSubmission) {
      if (selectedSubmission.evaluation) {
        setReviewerScore(selectedSubmission.evaluation.score);
      }
      setReviewerComments(
        selectedSubmission.reviewerApproval?.reviewerFeedback ||
        (selectedSubmission.evaluation?.aiVerdict === 'RECOMMENDED_FOR_APPROVAL'
          ? 'Work is verified and meets academic standards. Excellent methodology.'
          : 'Please address the missing index optimization before final sign-off.')
      );
    }
  }, [selectedSubmissionId]);

  const handleDecisionSubmit = async () => {
    if (!selectedSubmission) return;

    try {
      setIsSubmittingDecision(true);
      setDecisionSuccessMsg(null);

      const res = await fetch('/api/reviewer/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          decision: reviewerDecision,
          reviewerComments: reviewerComments,
          officialScore: reviewerScore,
          reviewerId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit decision');

      setDecisionSuccessMsg(`Task marked as ${reviewerDecision.toUpperCase()} and official notification email dispatched to intern!`);
      onRefreshData();
      setTimeout(() => setDecisionSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Error submitting reviewer decision:', err);
      alert(err.message || 'Error saving decision');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!selectedSubmission) return;

    try {
      setIsScheduling(true);
      setScheduleSuccessMsg(null);

      const res = await fetch('/api/reviewer/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          scheduledAt: scheduleDate,
          meetingLink: scheduleMeetLink,
          agenda: scheduleAgenda,
          reviewerId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule review');

      setScheduleSuccessMsg('Review session confirmed and calendar invitation emailed to the intern!');
      onRefreshData();
      setTimeout(() => setScheduleSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Error scheduling review:', err);
      alert(err.message);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Authorized Reviewer & Evaluator Board</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1.5">
            Academic Reviewer Portal
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Logged in as <strong>{currentUser.name}</strong> &bull; Inspect student code, review AI assessments, approve tasks, and schedule presentations.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center space-x-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'queue' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Submissions Queue ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'schedule' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Schedule Reviews
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'feedback' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Chatbot Feedback Ratings
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Submissions List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Submission to Review
            </h3>

            <div className="space-y-2.5">
              {submissions.map((sub) => {
                const t = tasks.find(tsk => tsk.id === sub.taskId);
                const intern = allUsers.find(u => u.id === sub.internId);
                const isSelected = selectedSubmission?.id === sub.id;

                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubmissionId(sub.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">
                        {intern?.name || 'Intern'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : sub.status === 'under_review'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {sub.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">
                      {t?.title || sub.taskId}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-700/60">
                      <span>Version {sub.currentVersion}</span>
                      {sub.evaluation && (
                        <span className="text-cyan-400 font-semibold">
                          AI Score: {sub.evaluation.score}/100
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Detailed Review & Approval Form */}
          {selectedSubmission && selectedTask ? (
            <div className="lg:col-span-2 space-y-5">
              
              {decisionSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{decisionSuccessMsg}</span>
                </div>
              )}

              {/* Submission Overview Card */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      {selectedTask.monthTitle} &bull; {selectedTask.domain}
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      {selectedTask.title}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Intern: <strong>{selectedIntern?.name}</strong> ({selectedIntern?.email}) &bull; Enrolment: {selectedIntern?.enrollmentId}
                    </p>
                  </div>

                  {selectedSubmission.evaluation && (
                    <button
                      onClick={() => onOpenAIReview(selectedSubmission, selectedTask)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1.5 hover:bg-indigo-600/30 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>View Full AI Breakdown</span>
                    </button>
                  )}
                </div>

                {/* Submitted Files Preview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <FileCode className="w-3.5 h-3.5 text-slate-400" />
                    <span>Uploaded Artifacts & Code Preview (Version {selectedSubmission.currentVersion})</span>
                  </h4>

                  {selectedSubmission.versions[0] && (
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="font-semibold">{selectedSubmission.versions[0].fileName}</span>
                        <span className="text-slate-500">
                          {(selectedSubmission.versions[0].fileSize / 1024).toFixed(1)} KB &bull;{' '}
                          {new Date(selectedSubmission.versions[0].uploadedAt).toLocaleString()}
                        </span>
                      </div>

                      {selectedSubmission.versions[0].submissionNotes && (
                        <p className="text-slate-400 italic">
                          Intern Notes: "{selectedSubmission.versions[0].submissionNotes}"
                        </p>
                      )}

                      {selectedSubmission.versions[0].fileContentPreview && (
                        <pre className="mt-2 p-3 bg-slate-950 rounded-lg text-slate-300 font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                          {selectedSubmission.versions[0].fileContentPreview}
                        </pre>
                      )}
                    </div>
                  )}
                </div>

                {/* AI Evaluation Snapshot */}
                {selectedSubmission.evaluation && (
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">AI Mentor Assessment:</span>
                      <span className="font-bold text-cyan-400">Score: {selectedSubmission.evaluation.score}/100</span>
                    </div>
                    <p className="text-slate-300 line-clamp-2">
                      {selectedSubmission.evaluation.overallEvaluation}
                    </p>
                  </div>
                )}
              </div>

              {/* Official Reviewer Decision Form */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Official Reviewer Sign-Off</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Decision radio */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Official Decision</label>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-1.5 text-xs text-emerald-300 cursor-pointer">
                        <input
                          type="radio"
                          name="decision"
                          value="approved"
                          checked={reviewerDecision === 'approved'}
                          onChange={() => setReviewerDecision('approved')}
                          className="accent-emerald-500"
                        />
                        <span>Approve Task (Pass)</span>
                      </label>
                      <label className="flex items-center space-x-1.5 text-xs text-rose-300 cursor-pointer">
                        <input
                          type="radio"
                          name="decision"
                          value="revision_requested"
                          checked={reviewerDecision === 'revision_requested'}
                          onChange={() => setReviewerDecision('revision_requested')}
                          className="accent-rose-500"
                        />
                        <span>Request Revision</span>
                      </label>
                    </div>
                  </div>

                  {/* Official Grade / Score */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Official Grade (0 - 100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={reviewerScore}
                      onChange={(e) => setReviewerScore(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Reviewer Comments */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Reviewer Official Comments (Will be emailed directly to intern)
                  </label>
                  <textarea
                    rows={3}
                    value={reviewerComments}
                    onChange={(e) => setReviewerComments(e.target.value)}
                    placeholder="Enter formal academic remarks, areas of mastery, and next steps..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleDecisionSubmit}
                    disabled={isSubmittingDecision}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isSubmittingDecision ? 'Submitting & Dispatching Email...' : 'Sign-Off & Email Intern'}
                    </span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="lg:col-span-2 text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800 p-8">
              <p className="text-slate-400 text-sm">Select a submission from the queue to review.</p>
            </div>
          )}

        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-6 max-w-2xl mx-auto shadow-xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Schedule Technical Review / Viva</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Select a task and schedule a 1-on-1 presentation session. An automated calendar invite and Google Meet link will be emailed to the intern.
            </p>
          </div>

          {scheduleSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{scheduleSuccessMsg}</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            {/* Task selector */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Target Task Submission</label>
              <select
                value={selectedSubmissionId || submissions[0]?.id || ''}
                onChange={(e) => setSelectedSubmissionId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200"
              >
                {submissions.map((sub) => {
                  const t = tasks.find(tsk => tsk.id === sub.taskId);
                  return (
                    <option key={sub.id} value={sub.id}>
                      {t?.title || sub.taskId} (v{sub.currentVersion})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Date & Time */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Scheduled Date & Time (IST)</label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200"
              />
            </div>

            {/* Meeting link */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Google Meet Video Link</label>
              <input
                type="text"
                value={scheduleMeetLink}
                onChange={(e) => setScheduleMeetLink(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
              />
            </div>

            {/* Agenda */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Review Session Agenda</label>
              <textarea
                rows={3}
                value={scheduleAgenda}
                onChange={(e) => setScheduleAgenda(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleScheduleSubmit}
                disabled={isScheduling}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{isScheduling ? 'Sending Invitation...' : 'Confirm & Email Schedule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback & Ratings Tab (Feature 8) */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>Chatbot Feedback & Quality Ratings ({feedbackEntries.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ratings, suggestions, and critique collected directly from interns interacting with Dr. Nova.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedbackEntries.map((fb) => (
              <div
                key={fb.id}
                className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= fb.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                    {fb.category || 'General'}
                  </span>
                </div>

                <p className="text-xs text-slate-200 italic">
                  "{fb.comment || 'No comment written.'}"
                </p>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                  <span>Intern: <strong>{fb.internName}</strong></span>
                  <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
