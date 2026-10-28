export type UserRole = 'intern' | 'reviewer' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  college?: string;
  degree?: string;
  enrollmentId: string;
  track: string;
  startDate: string;
  targetEndDate: string;
}

export type TaskStatus = 'locked' | 'pending' | 'in_progress' | 'under_review' | 'revision_requested' | 'approved';

export interface TaskRequirement {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

export interface InternshipTask {
  id: string;
  month: number;
  monthTitle: string;
  taskNumber: number;
  title: string;
  domain: 'Excel' | 'SQL' | 'Python' | 'Power BI' | 'Statistics' | 'Machine Learning' | 'Capstone';
  description: string;
  objectives: string[];
  requirements: TaskRequirement[];
  acceptanceCriteria: string[];
  deliverables: string;
  allowedFileTypes: string[];
  maxFileSizeMb: number;
  estimatedHours: number;
  deadlineDays: number;
  learningResources: { title: string; url: string; type: 'doc' | 'video' | 'cheatsheet' }[];
  isMandatory: boolean;
}

export interface SubmissionVersion {
  version: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileContentPreview?: string;
  uploadedAt: string;
  submissionNotes?: string;
}

export interface EvaluationReport {
  id: string;
  submissionId: string;
  taskId: string;
  internId: string;
  score: number; // 0 - 100
  aiVerdict: 'RECOMMENDED_FOR_APPROVAL' | 'NEEDS_REVISION';
  whatIsGood: string[];
  whatIsMissing: string[];
  whatNeedsCorrection: string[];
  whatShouldBeAdded: string[];
  recommendedImprovements: string[];
  overallEvaluation: string;
  evaluatedAt: string;
  rawAIResponse?: string;
}

export interface ReviewSchedule {
  id: string;
  taskId: string;
  internId: string;
  reviewerId: string;
  scheduledAt: string;
  meetingLink: string;
  agenda: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  internId: string;
  status: TaskStatus;
  currentVersion: number;
  versions: SubmissionVersion[];
  evaluation?: EvaluationReport;
  reviewerApproval?: {
    approvedBy: string;
    approvedByName: string;
    approvedAt: string;
    reviewerFeedback: string;
    officialScore: number;
    status: 'approved' | 'revision_requested';
  };
  reviewSchedule?: ReviewSchedule;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  taskIdContext?: string;
  audioBase64?: string;
  feedback?: {
    rating: number; // 1-5
    comment?: string;
    category?: 'accuracy' | 'explanation' | 'tone' | 'code_quality' | 'other';
    submittedAt: string;
  };
}

export interface EmailNotification {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  type: 'task_assigned' | 'review_scheduled' | 'evaluation_feedback' | 'official_approval' | 'internship_completed';
  htmlContent: string;
  sentAt: string;
  status: 'delivered' | 'simulated' | 'failed';
  previewText: string;
}

export interface ChatbotFeedbackEntry {
  id: string;
  messageId: string;
  internId: string;
  internName: string;
  rating: number;
  comment?: string;
  category?: string;
  userPromptPreview: string;
  botResponsePreview: string;
  createdAt: string;
}
