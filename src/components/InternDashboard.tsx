import React from 'react';
import { InternshipTask, TaskSubmission, UserProfile, EmailNotification } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Video, 
  ArrowRight, 
  Sparkles, 
  Upload, 
  BarChart3, 
  Calendar,
  FileCheck,
  TrendingUp,
  Mail
} from 'lucide-react';

interface InternDashboardProps {
  user: UserProfile;
  tasks: InternshipTask[];
  submissions: TaskSubmission[];
  notifications: EmailNotification[];
  onSelectTask: (task: InternshipTask) => void;
  onOpenTaskUpload: (task: InternshipTask) => void;
  onOpenAIReview: (submission: TaskSubmission, task: InternshipTask) => void;
  onOpenChatWithTask: (task: InternshipTask) => void;
  onOpenEmailInbox: () => void;
  onOpenGraduation: () => void;
  isEligibleForGraduation: boolean;
}

export const InternDashboard: React.FC<InternDashboardProps> = ({
  user,
  tasks,
  submissions,
  notifications,
  onSelectTask,
  onOpenTaskUpload,
  onOpenAIReview,
  onOpenChatWithTask,
  onOpenEmailInbox,
  onOpenGraduation,
  isEligibleForGraduation,
}) => {
  // Compute progress statistics
  const totalTasks = tasks.length;
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const underReviewSubmissions = submissions.filter(s => s.status === 'under_review');
  const revisionRequestedSubmissions = submissions.filter(s => s.status === 'revision_requested');
  
  const completionPercentage = Math.round((approvedSubmissions.length / totalTasks) * 100);

  // Compute average score from approved & evaluated tasks
  const scoredItems = submissions.filter(s => s.reviewerApproval?.officialScore || s.evaluation?.score);
  const avgScore = scoredItems.length > 0 
    ? Math.round(scoredItems.reduce((acc, s) => acc + (s.reviewerApproval?.officialScore || s.evaluation?.score || 0), 0) / scoredItems.length)
    : 0;

  // Find upcoming scheduled review meeting
  const upcomingReviewSubmission = submissions.find(s => s.reviewSchedule && s.reviewSchedule.status === 'scheduled');
  const upcomingReviewTask = upcomingReviewSubmission ? tasks.find(t => t.id === upcomingReviewSubmission.taskId) : null;

  // Active or next in-progress task
  const currentTask = tasks.find(t => {
    const sub = submissions.find(s => s.taskId === t.id);
    return !sub || sub.status === 'in_progress' || sub.status === 'under_review' || sub.status === 'revision_requested';
  }) || tasks[0];

  const currentSubmission = currentTask ? submissions.find(s => s.taskId === currentTask.id) : null;

  // Group progress by domain
  const domains: Array<InternshipTask['domain']> = ['Excel', 'SQL', 'Python', 'Power BI', 'Statistics', 'Machine Learning', 'Capstone'];
  const domainStats = domains.map(domain => {
    const domainTasks = tasks.filter(t => t.domain === domain);
    const domainApproved = domainTasks.filter(t => {
      const sub = submissions.find(s => s.taskId === t.id);
      return sub && sub.status === 'approved';
    });
    const percent = domainTasks.length > 0 ? Math.round((domainApproved.length / domainTasks.length) * 100) : 0;
    return { domain, total: domainTasks.length, approved: domainApproved.length, percent };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 border border-blue-800/40 shadow-xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Year Data Analytics Internship Track</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Enrolment: <span className="text-white font-mono">{user.enrollmentId}</span> &bull; {user.college || 'Final Year B.Tech IT'} &bull; Track: <strong className="text-blue-300">{user.track}</strong>
            </p>
          </div>

          {/* Completion Progress Gauge */}
          <div className="flex items-center space-x-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm self-start md:self-auto">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500 transition-all duration-1000 ease-out"
                  strokeDasharray={`${completionPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-base font-bold text-white">{completionPercentage}%</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Curriculum Progress</div>
              <div className="text-sm font-semibold text-white">
                {approvedSubmissions.length} of {totalTasks} Tasks Approved
              </div>
              <div className="text-xs text-emerald-400 font-medium mt-0.5">
                Avg Score: {avgScore > 0 ? `${avgScore}/100` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Graduation Alert if 100% completed */}
        {isEligibleForGraduation && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎓</span>
              <div>
                <h4 className="text-sm font-bold text-amber-200">
                  Congratulations! You have successfully completed your internship!
                </h4>
                <p className="text-xs text-slate-300">
                  All 12 modules and the Capstone project have been officially approved. Your verified completion certificate is ready.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenGraduation}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md whitespace-nowrap"
            >
              View Official Certificate &rarr;
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{approvedSubmissions.length}</div>
          <div className="text-xs text-slate-400 mt-1">
            {totalTasks - approvedSubmissions.length} tasks remaining
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Under Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{underReviewSubmissions.length}</div>
          <div className="text-xs text-amber-400/90 mt-1">
            Awaiting reviewer feedback
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Revisions Needed</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">{revisionRequestedSubmissions.length}</div>
          <div className="text-xs text-slate-400 mt-1">
            Re-submit with corrections
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Grade</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{avgScore > 0 ? `${avgScore}%` : '--'}</div>
          <div className="text-xs text-cyan-400 mt-1">
            Academic Performance
          </div>
        </div>
      </div>

      {/* Scheduled Review Meeting Alert (if any) */}
      {upcomingReviewSubmission && upcomingReviewSubmission.reviewSchedule && upcomingReviewTask && (
        <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
                  Scheduled Technical Review
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(upcomingReviewSubmission.reviewSchedule.scheduledAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  at{' '}
                  {new Date(upcomingReviewSubmission.reviewSchedule.scheduledAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {upcomingReviewTask.title}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Agenda: {upcomingReviewSubmission.reviewSchedule.agenda}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end md:self-auto">
            <a
              href={upcomingReviewSubmission.reviewSchedule.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Join Google Meet Call</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Grid: Active Task & Domain Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Current Active Task Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Current Assigned Task</span>
            </h2>
            <button
              onClick={() => onSelectTask(currentTask)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>View Full Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 space-y-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-4">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  {currentTask.monthTitle}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {currentTask.title}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-200">
                  {currentTask.domain}
                </span>
                {currentSubmission ? (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      currentSubmission.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : currentSubmission.status === 'under_review'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {currentSubmission.status === 'approved'
                      ? 'Approved'
                      : currentSubmission.status === 'under_review'
                      ? 'Under Review'
                      : 'Revision Needed'}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    In Progress
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {currentTask.description}
            </p>

            {/* Task Objectives List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Key Objectives
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentTask.objectives.slice(0, 4).map((obj, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Review Status if already submitted */}
            {currentSubmission && currentSubmission.evaluation && (
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Evaluation: {currentSubmission.evaluation.score}/100</span>
                  </span>
                  <button
                    onClick={() => onOpenAIReview(currentSubmission, currentTask)}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline"
                  >
                    View 6-Dimension Scorecard
                  </button>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {currentSubmission.evaluation.overallEvaluation}
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-400 flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Est: {currentTask.estimatedHours} hrs</span>
                </span>
                <span>&bull;</span>
                <span>Deadline: {currentTask.deadlineDays} days</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenChatWithTask(currentTask)}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ask Dr. Nova</span>
                </button>

                <button
                  onClick={() => onOpenTaskUpload(currentTask)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{currentSubmission ? 'Upload New Version' : 'Upload Assignment'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Domain Mastery & Notifications */}
        <div className="space-y-6">
          
          {/* Domain Breakdown */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Domain Competency</span>
            </h3>

            <div className="space-y-3">
              {domainStats.map(ds => (
                <div key={ds.domain} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{ds.domain}</span>
                    <span className="text-slate-400">{ds.approved}/{ds.total} ({ds.percent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                      style={{ width: `${ds.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Automated Emails Box */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Automated Email Log</span>
              </h3>
              <button
                onClick={onOpenEmailInbox}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                View All ({notifications.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {notifications.slice(0, 3).map(notif => (
                <div
                  key={notif.id}
                  onClick={onOpenEmailInbox}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 hover:border-slate-600 transition cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {notif.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(notif.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {notif.subject}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {notif.previewText}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
