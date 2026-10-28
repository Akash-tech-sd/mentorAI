import React, { useState, useEffect, useCallback } from 'react';
import { InternshipTask, TaskSubmission, UserProfile, EmailNotification } from './types';
import { Navbar } from './components/Navbar';
import { InternDashboard } from './components/InternDashboard';
import { RoadmapView } from './components/RoadmapView';
import { MentorChatbot } from './components/MentorChatbot';
import { ReviewerPortal } from './components/ReviewerPortal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { AIEvaluationView } from './components/AIEvaluationView';
import { EmailInboxModal } from './components/EmailInboxModal';
import { GraduationCertificateModal } from './components/GraduationCertificateModal';
import { StudentGuideModal } from './components/StudentGuideModal';
import { Award, Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<InternshipTask[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Modals
  const [taskDetailTarget, setTaskDetailTarget] = useState<InternshipTask | null>(null);
  const [aiReviewTarget, setAiReviewTarget] = useState<{ submission: TaskSubmission; task: InternshipTask } | null>(null);
  const [isEmailInboxOpen, setIsEmailInboxOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isGraduationOpen, setIsGraduationOpen] = useState<boolean>(false);

  // Chatbot contextual routing
  const [chatSelectedTask, setChatSelectedTask] = useState<InternshipTask | undefined>(undefined);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');

  // Fetch initial state
  const loadData = useCallback(async () => {
    try {
      const [usersRes, tasksRes, subsRes, notifsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/tasks'),
        fetch('/api/submissions'),
        fetch('/api/notifications'),
      ]);

      if (usersRes.ok && tasksRes.ok) {
        const usersData = await usersRes.json();
        const tasksData = await tasksRes.json();
        const subsData = subsRes.ok ? await subsRes.json() : [];
        const notifsData = notifsRes.ok ? await notifsRes.json() : [];

        setAllUsers(usersData);
        setTasks(tasksData);
        setSubmissions(subsData);
        setNotifications(notifsData);

        if (!currentUser && usersData.length > 0) {
          setCurrentUser(usersData[0]); // default to Aakash Selvam (intern)
        }
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check graduation eligibility
  const checkGraduationEligibility = () => {
    if (!currentUser || tasks.length === 0) return false;
    const internSubmissions = submissions.filter(s => s.internId === currentUser.id);
    const mandatoryTasks = tasks.filter(t => t.isMandatory);
    return mandatoryTasks.every(t => {
      const s = internSubmissions.find(sub => sub.taskId === t.id);
      return s && s.status === 'approved';
    });
  };

  const isEligibleForGraduation = checkGraduationEligibility();

  // Reset database handler
  const handleResetData = async () => {
    if (confirm('Reset demo data to clean seed state?')) {
      try {
        setIsResetting(true);
        const res = await fetch('/api/reset', { method: 'POST' });
        if (res.ok) {
          await loadData();
        }
      } catch (err) {
        console.error('Error resetting data:', err);
      } finally {
        setIsResetting(false);
      }
    }
  };

  // Quick simulation helper to fast-forward all tasks to approved state
  // to let reviewer or student verify the graduation completion flow instantly
  const handleSimulateAllApproved = async () => {
    if (!currentUser) return;
    try {
      setIsResetting(true);
      for (const t of tasks) {
        let sub = submissions.find(s => s.taskId === t.id && s.internId === currentUser.id);
        const subId = sub ? sub.id : `sub-auto-${t.id}`;
        
        await fetch('/api/reviewer/decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionId: subId,
            decision: 'approved',
            reviewerComments: `Full criteria verified for ${t.title}. Approved by Lead Mentor.`,
            officialScore: 95,
            reviewerId: 'reviewer_1',
          }),
        });
      }
      await loadData();
      setIsGraduationOpen(true);
    } catch (err) {
      console.error('Error simulating all approved:', err);
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading AI Internship Mentor System...</p>
        </div>
      </div>
    );
  }

  // Filter submissions for current user if intern
  const activeSubmissions = currentUser.role === 'intern'
    ? submissions.filter(s => s.internId === currentUser.id)
    : submissions;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          if (user.role === 'reviewer') {
            setActiveTab('reviewer');
          } else {
            setActiveTab('dashboard');
          }
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadEmailCount={notifications.length}
        onOpenEmailInbox={() => setIsEmailInboxOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenGraduation={() => setIsGraduationOpen(true)}
        isEligibleForGraduation={isEligibleForGraduation}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Role Notice & Fast-Forward Graduation Testing Tool */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">
              Active Session: <strong>{currentUser.name}</strong> ({currentUser.role === 'intern' ? 'Intern' : 'Lead Reviewer / Evaluator'})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {currentUser.role === 'intern' && !isEligibleForGraduation && (
              <button
                onClick={handleSimulateAllApproved}
                disabled={isResetting}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition flex items-center space-x-1"
                title="Fast-forward test: Marks all 12 modules as approved to preview graduation ceremony"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate 100% Curriculum Completion</span>
              </button>
            )}

            {isEligibleForGraduation && (
              <button
                onClick={() => setIsGraduationOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center space-x-1"
              >
                <Award className="w-3.5 h-3.5" />
                <span>View Official Certificate</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Intern Dashboard */}
        {activeTab === 'dashboard' && (
          <InternDashboard
            user={currentUser}
            tasks={tasks}
            submissions={activeSubmissions}
            notifications={notifications}
            onSelectTask={(task) => setTaskDetailTarget(task)}
            onOpenTaskUpload={(task) => setTaskDetailTarget(task)}
            onOpenAIReview={(submission, task) => setAiReviewTarget({ submission, task })}
            onOpenChatWithTask={(task) => {
              setChatSelectedTask(task);
              setActiveTab('mentor');
            }}
            onOpenEmailInbox={() => setIsEmailInboxOpen(true)}
            onOpenGraduation={() => setIsGraduationOpen(true)}
            isEligibleForGraduation={isEligibleForGraduation}
          />
        )}

        {/* Tab 2: 1-Year Roadmap */}
        {activeTab === 'roadmap' && (
          <RoadmapView
            tasks={tasks}
            submissions={activeSubmissions}
            onSelectTask={(task) => setTaskDetailTarget(task)}
            onOpenTaskUpload={(task) => setTaskDetailTarget(task)}
            onOpenAIReview={(submission, task) => setAiReviewTarget({ submission, task })}
            onOpenChatWithTask={(task) => {
              setChatSelectedTask(task);
              setActiveTab('mentor');
            }}
          />
        )}

        {/* Tab 3: AI Mentor Chatbot (Feature 1 & Feature 8) */}
        {activeTab === 'mentor' && (
          <MentorChatbot
            currentUser={currentUser}
            tasks={tasks}
            selectedTask={chatSelectedTask}
            initialPrompt={chatInitialPrompt}
            onClearInitialPrompt={() => setChatInitialPrompt('')}
          />
        )}

        {/* Tab 4: Reviewer Portal (Feature 6 & Feature 8) */}
        {activeTab === 'reviewer' && (
          <ReviewerPortal
            currentUser={currentUser}
            tasks={tasks}
            submissions={submissions}
            allUsers={allUsers}
            onRefreshData={loadData}
            onOpenAIReview={(submission, task) => setAiReviewTarget({ submission, task })}
          />
        )}

      </main>

      {/* Task Details & File Upload Modal */}
      {taskDetailTarget && (
        <TaskDetailModal
          task={taskDetailTarget}
          submission={submissions.find(s => s.taskId === taskDetailTarget.id && s.internId === currentUser.id)}
          currentUser={currentUser}
          isOpen={Boolean(taskDetailTarget)}
          onClose={() => setTaskDetailTarget(null)}
          onUploadSuccess={() => {
            loadData();
          }}
          onOpenAIReview={(sub, t) => setAiReviewTarget({ submission: sub, task: t })}
          onAskMentor={(t) => {
            setChatSelectedTask(t);
            setActiveTab('mentor');
          }}
        />
      )}

      {/* AI Evaluation Report Modal (The 6 Dimensions) */}
      {aiReviewTarget && (
        <AIEvaluationView
          submission={aiReviewTarget.submission}
          task={aiReviewTarget.task}
          currentUser={currentUser}
          isOpen={Boolean(aiReviewTarget)}
          onClose={() => setAiReviewTarget(null)}
          onOpenUpload={(t) => setTaskDetailTarget(t)}
          onAskMentorWithContext={(t, prompt) => {
            setChatSelectedTask(t);
            setChatInitialPrompt(prompt);
            setActiveTab('mentor');
          }}
        />
      )}

      {/* Automated Emails Inbox Modal */}
      <EmailInboxModal
        notifications={notifications}
        isOpen={isEmailInboxOpen}
        onClose={() => setIsEmailInboxOpen(false)}
      />

      {/* Graduation & Certificate Modal */}
      <GraduationCertificateModal
        user={currentUser}
        isOpen={isGraduationOpen}
        onClose={() => setIsGraduationOpen(false)}
        isEligible={isEligibleForGraduation}
      />

      {/* Beginner IT Engineering Handbook Modal */}
      <StudentGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

    </div>
  );
}
