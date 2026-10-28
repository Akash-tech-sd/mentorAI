# AI-Powered Internship Mentor Chatbot with Automated Task Review, Email Notifications, and Feedback System

An enterprise-grade, full-stack web application designed for final-year engineering and computer science students. Built specifically to guide interns through an intensive, one-year **Data Analytics & Business Intelligence** internship program.

---

## 🌟 Key Features

1. **AI Chatbot with Natural Voice Support**:
   - Integrated with Google's **Gemini 3.8 Flash** model for real-time pedagogical explanations, formula debugging, and code generation.
   - Voice input via **Web Speech API** and natural voice output powered by **Gemini 3.8 Flash Lite TTS** (generating high-fidelity 24kHz WAV audio).
   - Context-aware mentoring tailored to active assignment rubrics and student progress.

2. **1-Year Data Analytics Internship Roadmap**:
   - Structured 12-month curriculum covering:
     - Month 1: Advanced Excel & Financial Modeling
     - Month 2: SQL Fundamentals & Relational Databases
     - Month 3: Advanced SQL Window Functions & Performance Optimization
     - Month 4: Python for Data Science & NumPy Vectorization
     - Month 5: Pandas & Deep Data Wrangling
     - Month 6: Data Storytelling & Seaborn Visualizations
     - Month 7: Power BI & Dimensional Star Schema Modeling
     - Month 8: Advanced DAX Time Intelligence & Row-Level Security
     - Month 9: Applied Statistics & A/B Hypothesis Testing
     - Month 10: Predictive Machine Learning with Scikit-Learn
     - Month 11: Production Analytics Pipelines & Git Workflow
     - Month 12: Enterprise Analytics Capstone & Executive Defense

3. **Assignment & Document Upload**:
   - Multi-format file support: `.xlsx`, `.sql`, `.py`, `.csv`, `.pdf`, `.docx`, `.zip`.
   - File extension validation and strict size limits.
   - Comprehensive version control tracking (v1, v2, v3...) with timestamps and submission notes.

4. **AI-Based 6-Dimension Task Evaluation**:
   - Automated evaluation comparing student submissions against acceptance criteria across 6 mandatory dimensions:
     1. **What is good**
     2. **What is missing**
     3. **What needs correction**
     4. **What should be added**
     5. **Recommended improvements**
     6. **Overall evaluation and next steps**
   - Automated score out of 100 with AI verdict recommendation (`RECOMMENDED_FOR_APPROVAL` or `NEEDS_REVISION`).

5. **Automated Email Notifications**:
   - Dispatches HTML-formatted email notifications for:
     - Task instructions and assignment deadlines
     - Technical review session schedules with Google Meet links
     - 6-dimension evaluation scorecards
     - Official academic reviewer sign-offs and approvals
     - Graduation conferment
   - Includes live Resend API delivery and an in-app email inspector sandbox.

6. **Reviewer Approval Cycle & Academic Board**:
   - Human-in-the-loop review interface: tasks are not marked complete merely because an AI model evaluated them; official sign-off requires authorized reviewer review.
   - 1-on-1 technical review scheduler with meeting link generation.
   - Chatbot rating & feedback analytics dashboard.

7. **Internship Completion Verification**:
   - Verifies that all 12 modules and the Capstone project have been officially approved.
   - Unlocks the graduation banner with the exact conferment:
     > *"Congratulations! You have successfully completed your internship!"*
   - Printable and verifiable graduation certificate with credential ID.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express, TSX, Multer (multipart file upload)
- **AI Models**:
  - `gemini-3.8-flash`: Pedagogical mentoring and structured 6-dimension task evaluation
  - `gemini-3.8-flash-lite-tts`: Text-to-speech audio synthesis
- **Database**: PostgreSQL (Supabase ready) with persistent JSON state sync
- **Email Service**: Resend API integration with built-in email preview engine

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v20+ or v22 LTS)
- npm or yarn

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/ai-internship-mentor.git
cd ai-internship-mentor
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Configure environment variables
Create a `.env` file in the root directory:
\`\`\`env
# Gemini API Key (Obtain free at https://aistudio.google.com)
GEMINI_API_KEY="your_gemini_api_key_here"

# Optional: Resend API Key for live email dispatch (https://resend.com)
RESEND_API_KEY="re_your_api_key_here"

PORT=3000
NODE_ENV=development
\`\`\`

### 4. Run development server
\`\`\`bash
npm run dev
\`\`\`
Visit `http://localhost:3000` in your browser.

---

## 🗄️ PostgreSQL / Supabase Database Schema

To configure your remote database in Supabase:
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** tab.
3. Execute the schema script located in the in-app **Guide & Docs** tab or copy from `/server/db.ts`.

---

## 🌐 Public Cloud Deployment

### Deploying on Render (Recommended for Full-Stack)
1. Push your repository to GitHub.
2. Sign in to [Render.com](https://render.com) and click **New + > Web Service**.
3. Connect your GitHub repository.
4. Set:
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - `RESEND_API_KEY`: (Optional) Your Resend API key
6. Click **Create Web Service**. Your app is live!

---

## 📜 License
Apache-2.0
