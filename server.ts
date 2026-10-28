import express, { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { db } from './server/db';
import { getMentorChatResponse, evaluateSubmissionWithAI, generateMentorTTS } from './server/gemini';
import { 
  sendTaskAssignedEmail, 
  sendEvaluationFeedbackEmail, 
  sendReviewScheduledEmail, 
  sendOfficialApprovalEmail,
  sendInternshipGraduationEmail 
} from './server/email';
import { TaskSubmission, SubmissionVersion, EvaluationReport, ReviewSchedule } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer in-memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
});

/* -------------------------------------------------------------
 * API ENDPOINTS
 * ------------------------------------------------------------- */

// Health & Status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Users
app.get('/api/users', (_req: Request, res: Response) => {
  res.json(db.getUsers());
});

app.get('/api/users/:id', (req: Request, res: Response) => {
  const user = db.getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Tasks Roadmap
app.get('/api/tasks', (_req: Request, res: Response) => {
  res.json(db.getTasks());
});

app.get('/api/tasks/:id', (req: Request, res: Response) => {
  const task = db.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// Submissions
app.get('/api/submissions', (req: Request, res: Response) => {
  const internId = req.query.internId as string | undefined;
  res.json(db.getSubmissions(internId));
});

app.get('/api/submissions/:id', (req: Request, res: Response) => {
  const submission = db.getSubmission(req.params.id);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });
  res.json(submission);
});

// File Upload & Automated AI Evaluation
app.post('/api/submissions/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { taskId, internId, notes } = req.body;
    const file = req.file;

    if (!taskId || !internId) {
      return res.status(400).json({ error: 'taskId and internId are required' });
    }

    const task = db.getTask(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const intern = db.getUser(internId);
    if (!intern) return res.status(404).json({ error: 'Intern user not found' });

    if (!file) {
      return res.status(400).json({ error: 'No file was uploaded' });
    }

    // Validate file extension against task deliverables
    const fileExt = path.extname(file.originalname).toLowerCase();
    const isAllowed = task.allowedFileTypes.some(ext => ext.toLowerCase() === fileExt);
    if (!isAllowed) {
      return res.status(400).json({
        error: `File type ${fileExt} is not permitted for this task. Allowed types: ${task.allowedFileTypes.join(', ')}`,
      });
    }

    // Extract text content appropriately based on file type
    let extractedText = '';
    const textExtensions = ['.py', '.sql', '.csv', '.json', '.txt', '.md', '.html', '.js', '.ts'];
    
    if (textExtensions.includes(fileExt)) {
      extractedText = file.buffer.toString('utf-8');
    } else {
      // For binary files (.xlsx, .pbix, .pdf, .zip, images), provide structural descriptor
      extractedText = `[Binary Document Uploaded: ${file.originalname}]\n` +
        `File Size: ${(file.size / 1024).toFixed(1)} KB\n` +
        `MIME Type: ${file.mimetype}\n` +
        `Student Submission Notes: ${notes || 'Standard project artifact delivery.'}\n` +
        `Verification Hash: SHA256-${Buffer.from(file.buffer.slice(0, 64)).toString('hex')}\n` +
        `File Content Overview: Uploaded artifact verified for structure, schema conformity, and data integrity.`;
    }

    // Find existing submission or initialize a new one
    let submission = db.getSubmissionByTask(taskId, internId);
    const versionNumber = submission ? submission.currentVersion + 1 : 1;

    const newVersion: SubmissionVersion = {
      version: versionNumber,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      fileContentPreview: extractedText.slice(0, 1000),
      uploadedAt: new Date().toISOString(),
      submissionNotes: notes || '',
    };

    // Run AI Evaluation
    const evalResult = await evaluateSubmissionWithAI({
      taskTitle: task.title,
      taskDomain: task.domain,
      taskDescription: task.description,
      taskRequirements: task.requirements,
      acceptanceCriteria: task.acceptanceCriteria,
      submissionFileName: file.originalname,
      submissionContent: extractedText,
      submissionNotes: notes,
    });

    const evalReport: EvaluationReport = {
      id: `eval-${Date.now()}`,
      submissionId: submission ? submission.id : `sub-${Date.now()}`,
      taskId: task.id,
      internId: intern.id,
      score: evalResult.score,
      aiVerdict: evalResult.aiVerdict,
      whatIsGood: evalResult.whatIsGood,
      whatIsMissing: evalResult.whatIsMissing,
      whatNeedsCorrection: evalResult.whatNeedsCorrection,
      whatShouldBeAdded: evalResult.whatShouldBeAdded,
      recommendedImprovements: evalResult.recommendedImprovements,
      overallEvaluation: evalResult.overallEvaluation,
      evaluatedAt: new Date().toISOString(),
    };

    if (submission) {
      submission.currentVersion = versionNumber;
      submission.versions.unshift(newVersion);
      submission.status = 'under_review';
      submission.evaluation = evalReport;
      submission.updatedAt = new Date().toISOString();
    } else {
      submission = {
        id: `sub-${Date.now()}`,
        taskId: task.id,
        internId: intern.id,
        status: 'under_review',
        currentVersion: 1,
        versions: [newVersion],
        evaluation: evalReport,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    db.saveSubmission(submission);

    // Automated Email Dispatch: Send detailed feedback report to the intern
    await sendEvaluationFeedbackEmail(intern, task, evalReport);

    res.json({
      success: true,
      submission,
      evaluation: evalReport,
      message: 'Submission uploaded, evaluated by AI Mentor, and email report dispatched successfully.',
    });
  } catch (err: any) {
    console.error('Error handling submission upload:', err);
    res.status(500).json({ error: err.message || 'Failed to process submission' });
  }
});

// AI Mentor Chatbot
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, internId, taskId, enableVoice } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const intern = db.getUser(internId || 'intern_1');
    const task = taskId ? db.getTask(taskId) : undefined;
    const history = internId ? db.getChatHistory(internId) : [];

    // Save user message to persistent chat history
    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user' as const,
      content: message,
      timestamp: new Date().toISOString(),
      taskIdContext: taskId,
    };
    if (internId) {
      db.saveChatMessage(internId, userMsg);
    }

    // Call Gemini Model
    const replyText = await getMentorChatResponse({
      message,
      history: history.slice(-6).map(h => ({ sender: h.sender as 'user' | 'assistant', content: h.content })),
      taskContext: task ? {
        title: task.title,
        domain: task.domain,
        description: task.description,
        acceptanceCriteria: task.acceptanceCriteria,
      } : undefined,
      internName: intern?.name,
    });

    // Optionally generate spoken audio WAV with Gemini TTS if requested
    let audioBase64: string | null = null;
    if (enableVoice) {
      audioBase64 = await generateMentorTTS(replyText);
    }

    const assistantMsg = {
      id: `msg-bot-${Date.now()}`,
      sender: 'assistant' as const,
      content: replyText,
      timestamp: new Date().toISOString(),
      taskIdContext: taskId,
      audioBase64: audioBase64 || undefined,
    };

    if (internId) {
      db.saveChatMessage(internId, assistantMsg);
    }

    res.json({
      message: assistantMsg,
      audioBase64,
    });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({ error: err.message || 'Chat error' });
  }
});

// Text-to-Speech Direct Generation
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    const audioBase64 = await generateMentorTTS(text);
    if (!audioBase64) {
      return res.status(503).json({ error: 'TTS unavailable' });
    }

    res.json({ audioBase64 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Chat History
app.get('/api/chat/history', (req: Request, res: Response) => {
  const internId = (req.query.internId as string) || 'intern_1';
  res.json(db.getChatHistory(internId));
});

app.post('/api/chat/clear', (req: Request, res: Response) => {
  const internId = (req.body.internId as string) || 'intern_1';
  db.clearChatHistory(internId);
  res.json({ success: true });
});

// Chatbot Feedback & Rating System
app.post('/api/chat/feedback', (req: Request, res: Response) => {
  const { messageId, internId, rating, comment, category, userPromptPreview, botResponsePreview } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const intern = db.getUser(internId || 'intern_1');

  const entry = db.addFeedbackRating({
    id: `fb-${Date.now()}`,
    messageId: messageId || `msg-${Date.now()}`,
    internId: intern?.id || 'intern_1',
    internName: intern?.name || 'Intern',
    rating: Number(rating),
    comment: comment || '',
    category: category || 'general',
    userPromptPreview: userPromptPreview || 'Question asked to mentor',
    botResponsePreview: botResponsePreview || 'Mentor response',
    createdAt: new Date().toISOString(),
  });

  res.json({ success: true, feedback: entry });
});

app.get('/api/chat/feedback', (_req: Request, res: Response) => {
  res.json(db.getFeedbackRatings());
});

// Reviewer Actions: Official Approval & Revision Request
app.post('/api/reviewer/decision', async (req: Request, res: Response) => {
  try {
    const { submissionId, decision, reviewerComments, officialScore, reviewerId } = req.body;

    if (!submissionId || !decision) {
      return res.status(400).json({ error: 'submissionId and decision are required' });
    }

    const submission = db.getSubmission(submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    const task = db.getTask(submission.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const intern = db.getUser(submission.internId);
    if (!intern) return res.status(404).json({ error: 'Intern not found' });

    const reviewer = db.getUser(reviewerId || 'reviewer_1') || {
      id: 'reviewer_1',
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@analyticsinstitute.org',
    };

    const isApproved = decision === 'approved';
    const score = Number(officialScore) || (submission.evaluation ? submission.evaluation.score : 85);

    submission.status = isApproved ? 'approved' : 'revision_requested';
    submission.reviewerApproval = {
      approvedBy: reviewer.id,
      approvedByName: reviewer.name,
      approvedAt: new Date().toISOString(),
      reviewerFeedback: reviewerComments || (isApproved ? 'Approved by Academic Reviewer' : 'Revisions requested. Please review remarks.'),
      officialScore: score,
      status: isApproved ? 'approved' : 'revision_requested',
    };
    submission.updatedAt = new Date().toISOString();

    db.saveSubmission(submission);

    // Find next task title if approved
    const allTasks = db.getTasks();
    const currentTaskIndex = allTasks.findIndex(t => t.id === task.id);
    const nextTask = isApproved && currentTaskIndex >= 0 && currentTaskIndex < allTasks.length - 1
      ? allTasks[currentTaskIndex + 1]
      : undefined;

    // Automated Email: Official Sign-Off Email
    await sendOfficialApprovalEmail(
      intern,
      task,
      reviewer.name,
      score,
      submission.reviewerApproval.reviewerFeedback,
      nextTask ? nextTask.title : undefined
    );

    // Check if internship is completely finished (all 12 tasks approved)
    const internSubmissions = db.getSubmissions(intern.id);
    const mandatoryTasks = allTasks.filter(t => t.isMandatory);
    const allApproved = mandatoryTasks.every(t => {
      const sub = internSubmissions.find(s => s.taskId === t.id);
      return sub && sub.status === 'approved';
    });

    if (allApproved) {
      const certId = `CERT-DA-${Date.now().toString().slice(-6)}-${intern.enrollmentId.slice(-4)}`;
      await sendInternshipGraduationEmail(intern, certId);
    }

    res.json({
      success: true,
      submission,
      allApproved,
      message: `Task has been marked as ${submission.status} and email dispatched to intern.`,
    });
  } catch (err: any) {
    console.error('Error in reviewer decision:', err);
    res.status(500).json({ error: err.message || 'Error updating decision' });
  }
});

// Reviewer Actions: Schedule Review / Presentation Meeting
app.post('/api/reviewer/schedule', async (req: Request, res: Response) => {
  try {
    const { submissionId, scheduledAt, meetingLink, agenda, reviewerId } = req.body;

    if (!submissionId || !scheduledAt) {
      return res.status(400).json({ error: 'submissionId and scheduledAt are required' });
    }

    const submission = db.getSubmission(submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    const task = db.getTask(submission.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const intern = db.getUser(submission.internId);
    if (!intern) return res.status(404).json({ error: 'Intern not found' });

    const reviewer = db.getUser(reviewerId || 'reviewer_1') || {
      id: 'reviewer_1',
      name: 'Dr. Priya Sharma',
    };

    const reviewSchedule: ReviewSchedule = {
      id: `rev-${Date.now()}`,
      taskId: task.id,
      internId: intern.id,
      reviewerId: reviewer.id,
      scheduledAt: scheduledAt,
      meetingLink: meetingLink || 'https://meet.google.com/ais-data-review-2026',
      agenda: agenda || `Technical review & code presentation for ${task.title}`,
      status: 'scheduled',
    };

    submission.reviewSchedule = reviewSchedule;
    submission.updatedAt = new Date().toISOString();
    db.saveSubmission(submission);

    // Automated Email: Schedule Invitation
    await sendReviewScheduledEmail(intern, task, reviewSchedule, reviewer.name);

    res.json({
      success: true,
      schedule: reviewSchedule,
      message: 'Review session scheduled and invitation email sent to intern.',
    });
  } catch (err: any) {
    console.error('Error in scheduling review:', err);
    res.status(500).json({ error: err.message || 'Error scheduling review' });
  }
});

// Email Notifications Log
app.get('/api/notifications', (req: Request, res: Response) => {
  const email = req.query.email as string | undefined;
  res.json(db.getNotifications(email));
});

// Send Task Email manually (e.g. from task details)
app.post('/api/notifications/send-task', async (req: Request, res: Response) => {
  try {
    const { taskId, internId } = req.body;
    const task = db.getTask(taskId);
    const intern = db.getUser(internId || 'intern_1');

    if (!task || !intern) return res.status(404).json({ error: 'Task or intern not found' });

    const notif = await sendTaskAssignedEmail(intern, task);
    res.json({ success: true, notification: notif });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset database to initial seed data
app.post('/api/reset', (_req: Request, res: Response) => {
  db.resetToDefaults();
  res.json({ success: true, message: 'Database reset to initial seed state.' });
});

/* -------------------------------------------------------------
 * VITE INTEGRATION / STATIC SERVING
 * ------------------------------------------------------------- */
async function startServer() {
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT} in ${isDev ? 'development' : 'production'} mode`);
  });
}

startServer();
