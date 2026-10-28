import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Code2, 
  Database, 
  GitBranch, 
  Cloud, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileText, 
  Layers,
  Sparkles
} from 'lucide-react';

interface StudentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentGuideModal: React.FC<StudentGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const steps = [
    { num: 1, title: 'Architecture & Communication' },
    { num: 2, title: 'Software & Free Accounts' },
    { num: 3, title: 'Folder Structure' },
    { num: 4, title: 'Installation & Dependencies' },
    { num: 5, title: 'SQL Database Schema & RLS' },
    { num: 6, title: 'API Keys & Environment Setup' },
    { num: 7, title: 'Local Running & Testing' },
    { num: 8, title: 'GitHub Repository & Git Commands' },
    { num: 9, title: 'Public Cloud Deployment' },
    { num: 10, title: 'Troubleshooting & Checklist' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">
                  Beginner B.Tech IT Engineering Handbook
                </h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Step-by-Step
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete architecture, Supabase PostgreSQL schema, Git commands, and cloud deployment manual.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Split */}
        <div className="grid grid-cols-1 md:grid-cols-4 flex-1 overflow-hidden">
          
          {/* Step Navigation Sidebar */}
          <div className="border-r border-slate-800 p-3 space-y-1 bg-slate-950/40 overflow-y-auto">
            {steps.map((s) => (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition ${
                  activeStep === s.num
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeStep === s.num ? 'bg-white text-blue-700' : 'bg-slate-800 text-slate-300'
                }`}>
                  {s.num}
                </span>
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </div>

          {/* Step Detail Content */}
          <div className="md:col-span-3 p-5 sm:p-6 overflow-y-auto space-y-6 max-h-[72vh] text-slate-300 text-xs sm:text-sm leading-relaxed">
            
            {/* Step 1 */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  <span>Step 1: Project Architecture & Component Communication</span>
                </h3>
                <p>
                  This application follows a modern full-stack single-service architecture built with <strong>React 19, TypeScript, Express, and Vite</strong>.
                </p>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 font-mono text-xs text-slate-300 space-y-2">
                  <p className="text-emerald-400 font-bold">[Client / React App (Port 3000)]</p>
                  <p>&nbsp;&nbsp;&darr; (HTTP fetch & FormData multipart upload)</p>
                  <p className="text-blue-400 font-bold">[Express Full-Stack Server (/server.ts)]</p>
                  <p>&nbsp;&nbsp;&bull; /api/chat &rarr; Gemini 3.8 Flash (Data Analytics Mentor Persona)</p>
                  <p>&nbsp;&nbsp;&bull; /api/tts &rarr; Gemini 3.8 Flash Lite TTS (Audio WAV Generation)</p>
                  <p>&nbsp;&nbsp;&bull; /api/submissions/upload &rarr; Multer &rarr; Gemini 6-Dimension Task Evaluator</p>
                  <p>&nbsp;&nbsp;&bull; /api/reviewer/* &rarr; Human Reviewer Approval & Calendar Scheduler</p>
                  <p>&nbsp;&nbsp;&bull; /api/notifications &rarr; Resend API or Persistent Email Engine</p>
                  <p>&nbsp;&nbsp;&darr; (Atomic Read/Write)</p>
                  <p className="text-purple-400 font-bold">[Persistent Database & Storage (Supabase PostgreSQL / JSON Store)]</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white">How Information Flows:</h4>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-300">
                    <li><strong>Intern Submits Work:</strong> The student uploads an assignment (.xlsx, .sql, .py, etc.). Multer accepts the upload on the backend.</li>
                    <li><strong>Content Extraction & AI Evaluation:</strong> The backend extracts the script code or document structure and passes it along with the task requirements to Gemini 3.8 Flash.</li>
                    <li><strong>Automated 6-Dimension Feedback:</strong> The model outputs a validated JSON containing <em>What is good, What is missing, What needs correction, What should be added, Recommended improvements, and Overall score</em>.</li>
                    <li><strong>Automated Email Notification:</strong> An email containing the complete scorecard is generated and dispatched to the student's email.</li>
                    <li><strong>Reviewer Approval Cycle:</strong> The academic reviewer inspects the work, reviews the AI recommendation, and grants official approval or requests revision.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Step 2: Software & Free Accounts Needed</span>
                </h3>
                <p>
                  You do not need to spend any money. All services have generous free tiers suitable for college projects and portfolios.
                </p>

                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-800 rounded-xl border border-slate-700">
                    <h4 className="font-bold text-white">1. Node.js (v20+ or v22 LTS)</h4>
                    <p className="text-slate-300 text-xs mt-1">
                      Download free from <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="text-blue-400 underline">nodejs.org</a>. Includes `npm`.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-800 rounded-xl border border-slate-700">
                    <h4 className="font-bold text-white">2. Google AI Studio Account (Gemini API)</h4>
                    <p className="text-slate-300 text-xs mt-1">
                      Sign in with your Google account at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">aistudio.google.com</a> and click "Get API Key". The free tier provides fast inference.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-800 rounded-xl border border-slate-700">
                    <h4 className="font-bold text-white">3. Supabase Account (PostgreSQL Database & Auth)</h4>
                    <p className="text-slate-300 text-xs mt-1">
                      Free PostgreSQL database with 500MB storage at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">supabase.com</a>.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-800 rounded-xl border border-slate-700">
                    <h4 className="font-bold text-white">4. Resend Account (Automated Email Delivery)</h4>
                    <p className="text-slate-300 text-xs mt-1">
                      Free tier allows 3,000 emails/month at <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">resend.com</a>. Obtain your `re_...` API key.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-800 rounded-xl border border-slate-700">
                    <h4 className="font-bold text-white">5. GitHub & Vercel / Render Account</h4>
                    <p className="text-slate-300 text-xs mt-1">
                      Free Git hosting at <a href="https://github.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">github.com</a> and free full-stack web hosting on Render or Vercel.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  <span>Step 3: Complete Project Folder Structure</span>
                </h3>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
                  <pre>{`├── server.ts                 # Full-stack Express server with Vite middleware
├── server/
│   ├── db.ts                 # Persistent database service with seed tasks & users
│   ├── email.ts              # Automated email HTML templates & dispatch engine
│   └── gemini.ts             # Google GenAI client (Chatbot, TTS, 6-Dimension Evaluator)
├── src/
│   ├── main.tsx              # React DOM entry point
│   ├── App.tsx               # Primary React state controller & views router
│   ├── types.ts              # Complete TypeScript interfaces
│   ├── index.css             # Tailwind CSS global styles
│   └── components/
│       ├── Navbar.tsx                   # Top navigation with role switcher
│       ├── InternDashboard.tsx          # Progress ring, KPIs, active task
│       ├── RoadmapView.tsx              # 12-Month Data Analytics curriculum
│       ├── TaskDetailModal.tsx          # Task specifications & file upload
│       ├── AIEvaluationView.tsx         # 6-Dimension feedback report modal
│       ├── MentorChatbot.tsx            # AI Mentor chat with mic & TTS audio
│       ├── ReviewerPortal.tsx           # Approval queue, scoring & scheduling
│       ├── EmailInboxModal.tsx          # Sent emails viewer with rendered HTML
│       ├── GraduationCertificateModal.tsx# Completion celebration & certificate
│       └── StudentGuideModal.tsx        # This comprehensive handbook
├── data/
│   └── database.json         # Synced persistent storage file
├── package.json              # Project dependencies & scripts
├── tsconfig.json             # TypeScript compiler settings
└── vite.config.ts            # Vite bundler configuration`}</pre>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Terminal className="w-5 h-5 text-amber-400" />
                  <span>Step 4: Installation & Dependencies</span>
                </h3>
                <p>Run these commands in your project directory:</p>

                <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
                  <button
                    onClick={() => copyToClipboard('npm install @google/genai express multer dotenv motion lucide-react canvas-confetti\nnpm install -D typescript tsx @types/node @types/express @types/multer @types/canvas-confetti @types/react @types/react-dom vite @vitejs/plugin-react tailwindcss @tailwindcss/vite', 'npm-install')}
                    className="absolute right-3 top-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {copiedCode === 'npm-install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre>{`# Install Core Application Dependencies
npm install @google/genai express multer dotenv motion lucide-react canvas-confetti

# Install Developer Dependencies
npm install -D typescript tsx @types/node @types/express @types/multer @types/canvas-confetti @types/react @types/react-dom vite @vitejs/plugin-react tailwindcss @tailwindcss/vite`}</pre>
                </div>
              </div>
            )}

            {/* Step 5 */}
            {activeStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Database className="w-5 h-5 text-purple-400" />
                  <span>Step 5: PostgreSQL Database Schema & RLS Policies</span>
                </h3>
                <p>
                  Copy and run this SQL script in your Supabase SQL Editor. It creates all tables, primary keys, foreign key constraints, and Row Level Security (RLS) policies so interns cannot read another intern's private data.
                </p>

                <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 max-h-72 overflow-y-auto">
                  <button
                    onClick={() => copyToClipboard(`-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'intern' CHECK (role IN ('intern', 'reviewer', 'admin')),
  enrollment_id VARCHAR(50) UNIQUE NOT NULL,
  track VARCHAR(100) DEFAULT 'Data Analytics',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tasks Table
CREATE TABLE internship_tasks (
  id VARCHAR(50) PRIMARY KEY,
  month_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  domain VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  deliverables TEXT NOT NULL,
  allowed_file_types TEXT[] NOT NULL,
  max_file_size_mb INT DEFAULT 20,
  estimated_hours INT DEFAULT 20,
  deadline_days INT DEFAULT 14,
  is_mandatory BOOLEAN DEFAULT TRUE
);

-- 3. Submissions Table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR(50) REFERENCES internship_tasks(id),
  intern_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'under_review' CHECK (status IN ('in_progress', 'under_review', 'revision_requested', 'approved')),
  current_version INT DEFAULT 1,
  file_url TEXT,
  file_name VARCHAR(255),
  submission_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. AI Evaluations Table
CREATE TABLE ai_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 0 AND score <= 100),
  ai_verdict VARCHAR(50) NOT NULL,
  what_is_good TEXT[],
  what_is_missing TEXT[],
  what_needs_correction TEXT[],
  what_should_be_added TEXT[],
  recommended_improvements TEXT[],
  overall_evaluation TEXT NOT NULL,
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Review Schedules Table
CREATE TABLE review_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_link TEXT NOT NULL,
  agenda TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled'
);

-- 6. Row-Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Interns read own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Interns read own submissions" ON submissions
  FOR SELECT USING (intern_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Reviewers read all submissions" ON submissions
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('reviewer', 'admin')));`, 'sql-schema')}
                    className="absolute right-3 top-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {copiedCode === 'sql-schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre>{`-- Run this in your Supabase SQL Editor
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'intern' CHECK (role IN ('intern', 'reviewer', 'admin')),
  enrollment_id VARCHAR(50) UNIQUE NOT NULL
);

-- Submissions, AI Evaluations & Review Schedules...
-- (Click copy button to copy full script)`}</pre>
                </div>
              </div>
            )}

            {/* Step 6 */}
            {activeStep === 6 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Step 6: API Keys & Environment Variables (.env)</span>
                </h3>
                <p>
                  Create a `.env` file in the root folder of your project (never commit secrets to GitHub).
                </p>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
                  <pre>{`# Gemini API Key for Chatbot, Voice TTS, and 6-Dimension Task Evaluation
GEMINI_API_KEY="AIzaSy..."

# Optional: Resend API Key for live email delivery to real student inboxes
# (Leave empty to use the built-in email preview simulator)
RESEND_API_KEY="re_123456789"

# Application Port
PORT=3000
NODE_ENV=development`}</pre>
                </div>
              </div>
            )}

            {/* Step 7 */}
            {activeStep === 7 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <span>Step 7: Running Locally on Your Computer</span>
                </h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    Open terminal or VS Code command line in your project folder.
                  </li>
                  <li>
                    Run:
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 mt-1">
                      npm run dev
                    </div>
                  </li>
                  <li>
                    Open your web browser and navigate to:
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-blue-400 mt-1">
                      http://localhost:3000
                    </div>
                  </li>
                  <li>
                    Test uploading a SQL file or Excel spreadsheet, chatting with Dr. Nova, checking the AI evaluation report, and reviewing from the Reviewer Portal.
                  </li>
                </ol>
              </div>
            )}

            {/* Step 8 */}
            {activeStep === 8 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <GitBranch className="w-5 h-5 text-cyan-400" />
                  <span>Step 8: Upload to GitHub (Git Commands)</span>
                </h3>
                <p>Follow these exact terminal commands to push your project to a new GitHub repository:</p>

                <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
                  <button
                    onClick={() => copyToClipboard(`git init
git add .
git commit -m "feat: complete AI internship mentor with automated task review and email notifications"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-internship-mentor.git
git push -u origin main`, 'git-commands')}
                    className="absolute right-3 top-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {copiedCode === 'git-commands' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre>{`# 1. Initialize local repository
git init

# 2. Stage all files (make sure .env is in .gitignore!)
git add .

# 3. Create your first commit
git commit -m "feat: complete AI internship mentor application"

# 4. Set branch to main
git branch -M main

# 5. Link to your GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/ai-internship-mentor.git

# 6. Push code to GitHub
git push -u origin main`}</pre>
                </div>
              </div>
            )}

            {/* Step 9 */}
            {activeStep === 9 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Cloud className="w-5 h-5 text-blue-400" />
                  <span>Step 9: Public Cloud Deployment</span>
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                    <h4 className="font-bold text-white">Option A: Render.com (Recommended for Full-Stack)</h4>
                    <p className="text-slate-300 text-xs mt-1">
                      1. Connect your GitHub repository on Render.com &bull; Select "Web Service" &bull; Runtime: Node &bull; Build Command: <code>npm run build</code> &bull; Start Command: <code>npm start</code> &bull; Add <code>GEMINI_API_KEY</code> in Environment Variables.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                    <h4 className="font-bold text-white">Option B: Vercel + Serverless / Railway</h4>
                    <p className="text-slate-300 text-xs mt-1">
                      1. Import repo into Vercel &bull; Configure environment variables &bull; Deploy with one click.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 10 */}
            {activeStep === 10 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Step 10: Verification Checklist & Fixing Common Errors</span>
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                    <h4 className="font-bold text-white flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>1. File Upload Error: "File type not permitted"</span>
                    </h4>
                    <p className="text-xs text-slate-300">
                      Check the task deliverable requirements. Month 1 requires .xlsx/.csv; Month 2 requires .sql; Month 4 requires .py. Ensure your uploaded file matches the allowed extensions.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                    <h4 className="font-bold text-white flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>2. Voice Input Not Responding</span>
                    </h4>
                    <p className="text-xs text-slate-300">
                      Browser microphone permission must be granted. Use Google Chrome or MS Edge, as Web Speech API is natively supported there.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                    <h4 className="font-bold text-white flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>3. Human Reviewer vs AI Verdict</span>
                    </h4>
                    <p className="text-xs text-slate-300">
                      Remember: The AI evaluation gives recommendations (e.g. Recommended for Approval). Final task status only changes to "Approved" when the Lead Reviewer signs off in the Reviewer Portal.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
