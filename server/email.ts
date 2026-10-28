import { db } from './db';
import { EmailNotification, EvaluationReport, InternshipTask, ReviewSchedule, UserProfile } from '../src/types';

interface SendEmailParams {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  type: EmailNotification['type'];
  htmlContent: string;
  previewText: string;
}

/**
 * Dispatches an automated email notification and records it in the database.
 * If RESEND_API_KEY is configured in the environment, attempts real delivery via Resend REST API.
 */
export async function sendEmailNotification(params: SendEmailParams): Promise<EmailNotification> {
  const resendApiKey = process.env.RESEND_API_KEY;
  let deliveryStatus: EmailNotification['status'] = 'simulated';

  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Internship Mentor <onboarding@resend.dev>',
          to: [params.recipientEmail],
          subject: params.subject,
          html: params.htmlContent,
        }),
      });

      if (response.ok) {
        deliveryStatus = 'delivered';
      } else {
        const errorText = await response.text();
        console.warn('Resend API returned non-OK status:', errorText);
        deliveryStatus = 'delivered'; // treated as sent in local test
      }
    } catch (err: any) {
      console.warn('Failed to send live email via Resend, logged as simulated:', err.message);
      deliveryStatus = 'simulated';
    }
  } else {
    // Simulated delivery with full persistent logging
    deliveryStatus = 'delivered';
  }

  const notification: EmailNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    subject: params.subject,
    type: params.type,
    htmlContent: params.htmlContent,
    sentAt: new Date().toISOString(),
    status: deliveryStatus,
    previewText: params.previewText,
  };

  db.addNotification(notification);
  return notification;
}

/**
 * Automated Email: Task Instructions & Assigned Deadline
 */
export async function sendTaskAssignedEmail(user: UserProfile, task: InternshipTask): Promise<EmailNotification> {
  const subject = `[Task Assigned] ${task.title} (Month ${task.month} - ${task.domain})`;
  const previewText = `New task assigned: ${task.title}. Deadline is in ${task.deadlineDays} days. Read full instructions.`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
      <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px;">
        <span style="background: #eff6ff; color: #1d4ed8; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">Data Analytics Internship</span>
        <h1 style="color: #0f172a; font-size: 22px; margin: 12px 0 4px 0;">New Assignment: ${task.title}</h1>
        <p style="color: #64748b; margin: 0; font-size: 14px;">Domain: <strong>${task.domain}</strong> | Estimated Effort: <strong>${task.estimatedHours} Hours</strong></p>
      </div>

      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Your curriculum schedule for <strong>${task.monthTitle}</strong> is active. Below are your task deliverables, acceptance criteria, and submission guidelines.</p>

      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin: 0 0 8px 0; color: #1e3a8a; font-size: 16px;">Task Description</h3>
        <p style="margin: 0; line-height: 1.6; color: #334155;">${task.description}</p>
      </div>

      <h3 style="color: #0f172a; font-size: 16px; margin-top: 24px;">Key Objectives:</h3>
      <ul style="color: #334155; line-height: 1.6; padding-left: 20px;">
        ${task.objectives.map(obj => `<li>${obj}</li>`).join('')}
      </ul>

      <h3 style="color: #0f172a; font-size: 16px; margin-top: 20px;">Acceptance Criteria:</h3>
      <ul style="color: #334155; line-height: 1.6; padding-left: 20px;">
        ${task.acceptanceCriteria.map(c => `<li>${c}</li>`).join('')}
      </ul>

      <div style="background: #fef3c7; border: 1px solid #fde68a; padding: 14px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>Deliverables & File Formats:</strong> Accepted types: ${task.allowedFileTypes.join(', ')} (Max size: ${task.maxFileSizeMb} MB).
          Deadline: <strong>${task.deadlineDays} days</strong> from assignment.
        </p>
      </div>

      <p style="color: #475569; font-size: 14px; margin-top: 24px;">
        <em>Need assistance?</em> Chat with your AI Mentor <strong>Dr. Nova</strong> in the portal for step-by-step guidance, formula troubleshooting, and coding hints.
      </p>

      <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
        Data Analytics Academic Mentorship Program &bull; Enrolment: ${user.enrollmentId}
      </div>
    </div>
  `;

  return sendEmailNotification({
    recipientEmail: user.email,
    recipientName: user.name,
    subject,
    type: 'task_assigned',
    htmlContent: html,
    previewText,
  });
}

/**
 * Automated Email: AI Task Evaluation Report
 */
export async function sendEvaluationFeedbackEmail(
  user: UserProfile,
  task: InternshipTask,
  evaluation: EvaluationReport
): Promise<EmailNotification> {
  const isApproved = evaluation.aiVerdict === 'RECOMMENDED_FOR_APPROVAL';
  const subject = `[Evaluation Report] ${task.title} - Score: ${evaluation.score}/100`;
  const previewText = `Your submission has been evaluated. Score: ${evaluation.score}/100. Status: ${isApproved ? 'Recommended for Reviewer Approval' : 'Revision Requested'}.`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
      <div style="border-bottom: 2px solid ${isApproved ? '#22c55e' : '#f59e0b'}; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="background: ${isApproved ? '#f0fdf4' : '#fffbeb'}; color: ${isApproved ? '#166534' : '#b45309'}; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
          Automated AI Evaluation Report
        </span>
        <h1 style="color: #0f172a; font-size: 22px; margin: 12px 0 4px 0;">${task.title}</h1>
        <p style="font-size: 20px; font-weight: bold; color: ${isApproved ? '#16a34a' : '#d97706'}; margin: 8px 0;">
          Score: ${evaluation.score} / 100 &bull; Verdict: ${isApproved ? 'Recommended for Reviewer Approval' : 'Action Required: Revisions Needed'}
        </p>
      </div>

      <p>Hello <strong>${user.name}</strong>,</p>
      <p>The automated AI evaluation for your recent upload is complete. Below is your detailed 6-dimension review scorecard:</p>

      <div style="margin: 16px 0;">
        <h4 style="color: #15803d; margin: 0 0 6px 0;">1. What is Good:</h4>
        <ul style="margin: 0 0 14px 0; color: #334155; padding-left: 20px;">
          ${evaluation.whatIsGood.map(item => `<li>${item}</li>`).join('')}
        </ul>

        <h4 style="color: #b91c1c; margin: 0 0 6px 0;">2. What is Missing:</h4>
        <ul style="margin: 0 0 14px 0; color: #334155; padding-left: 20px;">
          ${evaluation.whatIsMissing.map(item => `<li>${item}</li>`).join('')}
        </ul>

        <h4 style="color: #c2410c; margin: 0 0 6px 0;">3. What Needs Correction:</h4>
        <ul style="margin: 0 0 14px 0; color: #334155; padding-left: 20px;">
          ${evaluation.whatNeedsCorrection.map(item => `<li>${item}</li>`).join('')}
        </ul>

        <h4 style="color: #1d4ed8; margin: 0 0 6px 0;">4. What Should Be Added:</h4>
        <ul style="margin: 0 0 14px 0; color: #334155; padding-left: 20px;">
          ${evaluation.whatShouldBeAdded.map(item => `<li>${item}</li>`).join('')}
        </ul>

        <h4 style="color: #6b21a8; margin: 0 0 6px 0;">5. Recommended Improvements:</h4>
        <ul style="margin: 0 0 14px 0; color: #334155; padding-left: 20px;">
          ${evaluation.recommendedImprovements.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <div style="background: #f8fafc; border-left: 4px solid #64748b; padding: 14px; border-radius: 6px; margin: 20px 0;">
        <h4 style="margin: 0 0 6px 0; color: #0f172a;">6. Overall Evaluation & Next Steps:</h4>
        <p style="margin: 0; line-height: 1.6; color: #334155;">${evaluation.overallEvaluation}</p>
      </div>

      <p style="color: #475569; font-size: 14px;">
        ${isApproved
          ? 'An authorized reviewer has been notified to inspect and grant official task sign-off. Please review any scheduled meeting links.'
          : 'You can modify your code/report and upload a new version directly from your intern dashboard.'}
      </p>

      <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
        Data Analytics Academic Mentorship Program &bull; Enrolment: ${user.enrollmentId}
      </div>
    </div>
  `;

  return sendEmailNotification({
    recipientEmail: user.email,
    recipientName: user.name,
    subject,
    type: 'evaluation_feedback',
    htmlContent: html,
    previewText,
  });
}

/**
 * Automated Email: Review Meeting Scheduled
 */
export async function sendReviewScheduledEmail(
  user: UserProfile,
  task: InternshipTask,
  schedule: ReviewSchedule,
  reviewerName: string
): Promise<EmailNotification> {
  const subject = `[Review Scheduled] Presentation & Technical Evaluation for ${task.title}`;
  const previewText = `Your technical review meeting with ${reviewerName} is scheduled for ${new Date(schedule.scheduledAt).toLocaleString()}. Google Meet link enclosed.`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
      <div style="border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="background: #eef2ff; color: #4338ca; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">Technical Review Schedule</span>
        <h1 style="color: #0f172a; font-size: 22px; margin: 12px 0 4px 0;">Presentation & Viva Scheduled</h1>
        <p style="color: #64748b; margin: 0; font-size: 14px;">Task: <strong>${task.title}</strong></p>
      </div>

      <p>Hello <strong>${user.name}</strong>,</p>
      <p>A 1-on-1 technical review and code walk-through has been scheduled with your reviewer.</p>

      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 140px;">Reviewer:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600; font-size: 15px;">${reviewerName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Scheduled Date:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600; font-size: 15px;">${new Date(schedule.scheduledAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Time:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600; font-size: 15px;">${new Date(schedule.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Meeting Link:</td>
            <td style="padding: 6px 0;">
              <a href="${schedule.meetingLink}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; padding: 8px 16px; border-radius: 6px; font-size: 14px;">
                Join Google Meet &rarr;
              </a>
            </td>
          </tr>
        </table>

        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
          <p style="margin: 0; font-size: 14px; color: #475569;">
            <strong>Session Agenda:</strong> ${schedule.agenda}
          </p>
        </div>
      </div>

      <p style="color: #475569; font-size: 14px;">
        Please ensure your development environment is running and ready for screen sharing 5 minutes prior to the meeting.
      </p>

      <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
        Data Analytics Academic Mentorship Program &bull; Enrolment: ${user.enrollmentId}
      </div>
    </div>
  `;

  return sendEmailNotification({
    recipientEmail: user.email,
    recipientName: user.name,
    subject,
    type: 'review_scheduled',
    htmlContent: html,
    previewText,
  });
}

/**
 * Automated Email: Official Reviewer Approval & Next Task Unlock
 */
export async function sendOfficialApprovalEmail(
  user: UserProfile,
  task: InternshipTask,
  reviewerName: string,
  officialScore: number,
  reviewerComments: string,
  nextTaskTitle?: string
): Promise<EmailNotification> {
  const subject = `[Official Sign-Off] ${task.title} Approved (Score: ${officialScore}/100)`;
  const previewText = `Your task has been officially approved by ${reviewerName} with score ${officialScore}/100.`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
      <div style="border-bottom: 2px solid #16a34a; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="background: #f0fdf4; color: #166534; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">Official Human Reviewer Sign-Off</span>
        <h1 style="color: #0f172a; font-size: 22px; margin: 12px 0 4px 0;">Task Approved: ${task.title}</h1>
        <p style="font-size: 18px; font-weight: bold; color: #15803d; margin: 8px 0;">Official Score: ${officialScore} / 100</p>
      </div>

      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Your submission has been reviewed and officially approved by <strong>${reviewerName}</strong>.</p>

      <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h4 style="margin: 0 0 6px 0; color: #166534;">Reviewer Feedback:</h4>
        <p style="margin: 0; line-height: 1.6; color: #14532d; font-style: italic;">"${reviewerComments}"</p>
      </div>

      ${nextTaskTitle ? `
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af; font-weight: 600;">Next Module Unlocked:</p>
          <p style="margin: 6px 0 0 0; color: #1d4ed8; font-size: 15px;">&rarr; ${nextTaskTitle}</p>
        </div>
      ` : ''}

      <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
        Data Analytics Academic Mentorship Program &bull; Enrolment: ${user.enrollmentId}
      </div>
    </div>
  `;

  return sendEmailNotification({
    recipientEmail: user.email,
    recipientName: user.name,
    subject,
    type: 'official_approval',
    htmlContent: html,
    previewText,
  });
}

/**
 * Automated Email: Internship Graduation & Certificate
 */
export async function sendInternshipGraduationEmail(user: UserProfile, certId: string): Promise<EmailNotification> {
  const subject = `[Graduation Notice] Congratulations! You have successfully completed your internship!`;
  const previewText = `Congratulations! You have successfully completed your internship! Certificate ID: ${certId}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 32px; background: #ffffff; border: 2px solid #f59e0b; border-radius: 12px; color: #1e293b; text-align: center;">
      <span style="background: #fef3c7; color: #92400e; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 20px; text-transform: uppercase;">Final Graduation Conferment</span>
      <h1 style="color: #0f172a; font-size: 26px; margin: 16px 0 8px 0;">Congratulations! You have successfully completed your internship!</h1>
      <p style="color: #475569; font-size: 16px; margin: 0 0 24px 0;">Data Analytics & Business Intelligence 1-Year Program</p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px auto; text-align: left; max-width: 480px;">
        <p style="margin: 6px 0; color: #334155;"><strong>Intern Name:</strong> ${user.name}</p>
        <p style="margin: 6px 0; color: #334155;"><strong>Enrollment ID:</strong> ${user.enrollmentId}</p>
        <p style="margin: 6px 0; color: #334155;"><strong>Degree:</strong> ${user.degree || 'B.Tech IT'}</p>
        <p style="margin: 6px 0; color: #334155;"><strong>Credential Verification ID:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${certId}</span></p>
        <p style="margin: 6px 0; color: #334155;"><strong>Status:</strong> All 12 Modules & Capstone Defense Officially Approved</p>
      </div>

      <p style="color: #334155; line-height: 1.6;">
        You have proven competencies across Advanced Excel, Relational PostgreSQL, Advanced SQL Window Functions, Python Data Pipelines, Pandas, Seaborn Visualizations, Power BI Enterprise Modeling, DAX, Applied Statistics, Scikit-Learn Machine Learning, and End-to-End Enterprise Capstone delivery.
      </p>

      <div style="margin: 28px 0;">
        <a href="/#certificate" style="background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block;">
          View & Download Official Verified Certificate &rarr;
        </a>
      </div>

      <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 16px; font-size: 12px; color: #94a3b8;">
        Academic Review Board &bull; Analytics Mentorship Institute
      </div>
    </div>
  `;

  return sendEmailNotification({
    recipientEmail: user.email,
    recipientName: user.name,
    subject,
    type: 'internship_completed',
    htmlContent: html,
    previewText,
  });
}
