import React, { useState } from 'react';
import { InternshipTask, TaskSubmission } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Upload, 
  FileText, 
  Calendar, 
  Search,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';

interface RoadmapViewProps {
  tasks: InternshipTask[];
  submissions: TaskSubmission[];
  onSelectTask: (task: InternshipTask) => void;
  onOpenTaskUpload: (task: InternshipTask) => void;
  onOpenAIReview: (submission: TaskSubmission, task: InternshipTask) => void;
  onOpenChatWithTask: (task: InternshipTask) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  tasks,
  submissions,
  onSelectTask,
  onOpenTaskUpload,
  onOpenAIReview,
  onOpenChatWithTask,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const domains = ['ALL', 'Excel', 'SQL', 'Python', 'Power BI', 'Statistics', 'Machine Learning', 'Capstone'];

  const filteredTasks = tasks.filter(task => {
    const sub = submissions.find(s => s.taskId === task.id);
    const status = sub ? sub.status : 'pending';

    // Domain filter
    if (selectedDomain !== 'ALL' && task.domain !== selectedDomain) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'approved' && status !== 'approved') return false;
      if (selectedStatus === 'under_review' && status !== 'under_review') return false;
      if (selectedStatus === 'revision_requested' && status !== 'revision_requested') return false;
      if (selectedStatus === 'pending' && sub) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchDomain = task.domain.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchDomain) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Layers className="w-6 h-6 text-blue-400" />
            <span>1-Year Data Analytics Roadmap</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Structured 12-month industry curriculum designed to build end-to-end expertise in modern data analytics, engineering, and BI.
          </p>
        </div>

        {/* Global Progress Pill */}
        <div className="flex items-center space-x-2 text-xs font-semibold bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
          <span className="text-slate-400">Total Milestones:</span>
          <span className="text-blue-400 font-bold">
            {submissions.filter(s => s.status === 'approved').length} / {tasks.length} Approved
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks, SQL, Python, DAX, formulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Select */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="approved">Approved & Completed</option>
              <option value="under_review">Under AI / Reviewer Review</option>
              <option value="revision_requested">Revision Requested</option>
              <option value="pending">Not Yet Started</option>
            </select>
          </div>
        </div>

        {/* Domain Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 pb-0.5">
          {domains.map(dom => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDomain === dom
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Timeline */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-800 p-8">
            <p className="text-slate-400 text-sm">No tasks match your selected filters.</p>
            <button
              onClick={() => { setSelectedDomain('ALL'); setSelectedStatus('ALL'); setSearchQuery(''); }}
              className="mt-3 text-xs text-blue-400 font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const sub = submissions.find(s => s.taskId === task.id);
            const isApproved = sub?.status === 'approved';
            const isUnderReview = sub?.status === 'under_review';
            const isRevision = sub?.status === 'revision_requested';
            const hasSubmission = Boolean(sub);

            return (
              <div
                key={task.id}
                className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isApproved
                    ? 'bg-slate-800/90 border-emerald-500/40 shadow-sm'
                    : isUnderReview
                    ? 'bg-slate-800/90 border-amber-500/40 shadow-sm'
                    : isRevision
                    ? 'bg-slate-800/90 border-rose-500/40'
                    : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600'
                }`}
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Top Bar: Month & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center font-mono font-bold text-xs text-blue-400 border border-slate-700">
                        M{task.month}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {task.monthTitle}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-700">
                        {task.domain}
                      </span>

                      {isApproved && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved &bull; {sub?.reviewerApproval?.officialScore || sub?.evaluation?.score}/100</span>
                        </span>
                      )}

                      {isUnderReview && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          <span>Under Review (v{sub?.currentVersion})</span>
                        </span>
                      )}

                      {isRevision && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <AlertCircle className="w-3 h-3" />
                          <span>Revision Requested</span>
                        </span>
                      )}

                      {!hasSubmission && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800">
                          Not Started
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Task Title & Description */}
                  <div>
                    <h3
                      onClick={() => onSelectTask(task)}
                      className="text-base sm:text-lg font-bold text-white group-hover:text-blue-300 cursor-pointer transition flex items-center space-x-2"
                    >
                      <span>Task {task.taskNumber}: {task.title}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-300 transition" />
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed line-clamp-2">
                      {task.description}
                    </p>
                  </div>

                  {/* Deliverables and File Types */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-700/60 text-xs text-slate-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Deadline: {task.deadlineDays} Days</span>
                      </span>
                      <span>&bull;</span>
                      <span>Effort: {task.estimatedHours}h</span>
                      <span>&bull;</span>
                      <span className="font-mono text-slate-400">
                        Allowed: {task.allowedFileTypes.join(', ')}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onOpenChatWithTask(task)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold flex items-center space-x-1 transition border border-indigo-500/30"
                        title="Ask Mentor for help on this task"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Mentor Help</span>
                      </button>

                      {sub && sub.evaluation && (
                        <button
                          onClick={() => onOpenAIReview(sub, task)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center space-x-1 transition border border-cyan-500/30"
                        >
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          <span>AI Report ({sub.evaluation.score}/100)</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenTaskUpload(task)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1 shadow transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{hasSubmission ? 'Update Version' : 'Submit Work'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
