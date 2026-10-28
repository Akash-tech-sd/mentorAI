import fs from 'fs';
import path from 'path';
import { InternshipTask, TaskSubmission, UserProfile, EmailNotification, ChatbotFeedbackEntry, ChatMessage } from '../src/types';

export interface DatabaseState {
  users: UserProfile[];
  tasks: InternshipTask[];
  submissions: TaskSubmission[];
  notifications: EmailNotification[];
  chatHistory: Record<string, ChatMessage[]>; // internId -> messages
  feedbackRatings: ChatbotFeedbackEntry[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

// Initial seed 1-Year Data Analytics Roadmap
const INITIAL_TASKS: InternshipTask[] = [
  {
    id: 'task-1',
    month: 1,
    monthTitle: 'Month 1: Advanced Excel & Financial Modeling',
    taskNumber: 1,
    title: 'Dynamic Sales Dashboard with XLOOKUP, INDEX/MATCH & Pivot Models',
    domain: 'Excel',
    description: 'Construct a complete executive sales dashboard from 50,000 transaction records using modern Excel functions, dynamic named ranges, data validation, and automated KPI cards.',
    objectives: [
      'Ingest and clean raw CSV sales transactions with missing values and mismatched date formats.',
      'Implement multi-criteria lookups using INDEX/MATCH and XLOOKUP.',
      'Build automated Pivot Tables with calculated fields, slicers, and dynamic timelines.',
      'Format output with professional executive presentation standards (no gridlines, cohesive color palette).'
    ],
    requirements: [
      { id: 'r1', title: 'Data Cleaning', description: 'Handle null customer IDs and standardize dates into YYYY-MM-DD.', required: true },
      { id: 'r2', title: 'Dynamic Metrics', description: 'Calculate MoM growth %, churn rate, and Regional Gross Margin %.', required: true },
      { id: 'r3', title: 'Executive Summary', description: 'Provide a 1-page summary sheet with 4 primary KPI tiles.', required: true }
    ],
    acceptanceCriteria: [
      'Zero broken formula references (#N/A or #REF!) in final workbook.',
      'Slicers dynamically update all charts and KPI summary tiles.',
      'Clean documentation sheet explaining assumptions and formula definitions.'
    ],
    deliverables: 'Excel workbook (.xlsx) or documented formula workbook with calculated fields and executive visual dashboard.',
    allowedFileTypes: ['.xlsx', '.xls', '.csv', '.pdf', '.txt'],
    maxFileSizeMb: 15,
    estimatedHours: 20,
    deadlineDays: 14,
    learningResources: [
      { title: 'Microsoft Excel Advanced Formulas Guide', url: 'https://support.microsoft.com/excel', type: 'doc' },
      { title: 'Data Modeling & Pivot Tables Best Practices', url: 'https://learn.microsoft.com', type: 'video' }
    ],
    isMandatory: true,
  },
  {
    id: 'task-2',
    month: 2,
    monthTitle: 'Month 2: SQL Fundamentals & Relational Databases',
    taskNumber: 2,
    title: 'Relational Schema Design & Multi-Table SQL Joins',
    domain: 'SQL',
    description: 'Design a normalized 3NF PostgreSQL database schema for an e-commerce platform and write high-efficiency multi-table JOINs and aggregations to analyze customer lifetime value (LTV).',
    objectives: [
      'Design relational DDL tables for Users, Orders, Order_Items, and Products with primary/foreign keys.',
      'Write analytical queries utilizing INNER, LEFT, and FULL OUTER JOINs.',
      'Aggregate customer order frequencies and compute revenue quartiles using NTILE and GROUP BY.',
      'Optimize query execution by creating B-tree indices on high-cardinality join keys.'
    ],
    requirements: [
      { id: 'r1', title: 'DDL Schema', description: 'Create proper table definitions with constraints and foreign key cascades.', required: true },
      { id: 'r2', title: 'LTV Analysis Query', description: 'Generate Customer Lifetime Value segmented by acquisition month.', required: true },
      { id: 'r3', title: 'Query Explain Plan', description: 'Run EXPLAIN ANALYZE on slow joins and demonstrate index speedup.', required: true }
    ],
    acceptanceCriteria: [
      'Syntactically valid SQL conforming to ANSI/PostgreSQL standards.',
      'Query produces accurate results with zero Cartesian product explosions.',
      'All table constraints and data types appropriately sized.'
    ],
    deliverables: 'SQL migration and analytical queries (.sql) accompanied by query execution results (.txt or .pdf).',
    allowedFileTypes: ['.sql', '.txt', '.pdf'],
    maxFileSizeMb: 10,
    estimatedHours: 25,
    deadlineDays: 14,
    learningResources: [
      { title: 'PostgreSQL Official Documentation', url: 'https://www.postgresql.org/docs/', type: 'doc' },
      { title: 'SQL Joins Visual Mastery Cheatsheet', url: 'https://sqlzoo.net', type: 'cheatsheet' }
    ],
    isMandatory: true,
  },
  {
    id: 'task-3',
    month: 3,
    monthTitle: 'Month 3: Advanced SQL & Query Performance',
    taskNumber: 3,
    title: 'Window Functions, CTEs & Complex Analytical Queries',
    domain: 'SQL',
    description: 'Master advanced SQL analytical techniques: Common Table Expressions (CTEs), recursive queries, rolling moving averages, and cumulative running totals with OVER (PARTITION BY ... ORDER BY ...).',
    objectives: [
      'Calculate 7-day and 30-day rolling average revenue per merchant.',
      'Use ROW_NUMBER(), RANK(), and DENSE_RANK() to identify top 3 selling products per category.',
      'Identify repeat churn patterns using LAG() and LEAD() date difference calculations.',
      'Benchmark CTE performance vs subqueries in PostgreSQL query planner.'
    ],
    requirements: [
      { id: 'r1', title: 'Window Functions', description: 'Utilize at least 3 distinct window framing clauses (ROWS BETWEEN).', required: true },
      { id: 'r2', title: 'Cohort Analysis', description: 'Generate monthly retention cohorts across 12 consecutive months.', required: true },
      { id: 'r3', title: 'Performance Benchmark', description: 'Document execution times before and after partitioning.', required: true }
    ],
    acceptanceCriteria: [
      'Output matches benchmark cohort retention matrix.',
      'Clean comments explaining framing windows and partitioning strategy.',
      'All queries tested without memory spill to disk.'
    ],
    deliverables: 'Comprehensive analytical script (.sql) with documentation of cohort findings.',
    allowedFileTypes: ['.sql', '.txt', '.pdf'],
    maxFileSizeMb: 10,
    estimatedHours: 28,
    deadlineDays: 14,
    learningResources: [
      { title: 'Modern SQL Window Functions Tutorial', url: 'https://mode.com/sql-tutorial/', type: 'doc' }
    ],
    isMandatory: true,
  },
  {
    id: 'task-4',
    month: 4,
    monthTitle: 'Month 4: Python for Data Science & NumPy',
    taskNumber: 4,
    title: 'Data Ingestion, Cleaning & Vectorized Computation',
    domain: 'Python',
    description: 'Set up an automated Python data pipeline using Python 3 and NumPy to clean noisy sensor and transaction logs, vectorizing computations without iterative loops.',
    objectives: [
      'Ingest raw unstructured logs and semi-structured JSON payloads.',
      'Handle missing values via statistical imputation (mean, median, forward fill).',
      'Leverage vectorized NumPy array operations for 100x calculation speedups over pure Python loops.',
      'Standardize features using z-score normalization and min-max scaling.'
    ],
    requirements: [
      { id: 'r1', title: 'Vectorized Operations', description: 'Replace nested for-loops with NumPy vector operations.', required: true },
      { id: 'r2', title: 'Imputation Pipeline', description: 'Document and implement strategy for missing data handling.', required: true },
      { id: 'r3', title: 'Unit Tests', description: 'Include assert tests verifying output shapes and value boundaries.', required: true }
    ],
    acceptanceCriteria: [
      'Script executes in < 3 seconds on 200,000 data rows.',
      'Zero uncaught exceptions or NaN values propagating to final output.'
    ],
    deliverables: 'Python script (.py) or Jupyter Notebook (.ipynb) with unit tests.',
    allowedFileTypes: ['.py', '.ipynb', '.txt', '.pdf'],
    maxFileSizeMb: 20,
    estimatedHours: 24,
    deadlineDays: 14,
    learningResources: [
      { title: 'NumPy Quickstart Guide', url: 'https://numpy.org/doc/stable/', type: 'doc' }
    ],
    isMandatory: true,
  },
  {
    id: 'task-5',
    month: 5,
    monthTitle: 'Month 5: Pandas & Deep Data Wrangling',
    taskNumber: 5,
    title: 'Customer Churn Wrangling & Feature Engineering Pipeline',
    domain: 'Python',
    description: 'Perform end-to-end data wrangling on a 100,000-user telecom churn dataset with Pandas. Engineer behavioural features like usage decay, tenure brackets, and payment delinquency flags.',
    objectives: [
      'Master pd.merge, pd.concat, and complex groupby-agg multi-index operations.',
      'Transform time-series timestamps into periodicity features (day of week, seasonality, elapsed tenure).',
      'Detect and treat multivariate statistical outliers using IQR and Tukey fences.',
      'Produce an audit-ready, cleaned dataset export for analytical modeling.'
    ],
    requirements: [
      { id: 'r1', title: 'Feature Creation', description: 'Engineer at least 5 new predictive churn features.', required: true },
      { id: 'r2', title: 'Data Dictionary', description: 'Include complete data schema definitions for all created columns.', required: true },
      { id: 'r3', title: 'Data Integrity Audit', description: 'Verify zero duplicate primary keys after table merges.', required: true }
    ],
    acceptanceCriteria: [
      'Clean Pandas codebase with chaining or modular functions.',
      'Exported dataset matches strict schema and format requirements.'
    ],
    deliverables: 'Python script (.py) and generated feature summary report.',
    allowedFileTypes: ['.py', '.csv', '.pdf', '.txt'],
    maxFileSizeMb: 25,
    estimatedHours: 30,
    deadlineDays: 14,
    learningResources: [
      { title: 'Pandas User Guide & Method Chaining', url: 'https://pandas.pydata.org/docs/', type: 'doc' }
    ],
    isMandatory: true,
  },
  {
    id: 'task-6',
    month: 6,
    monthTitle: 'Month 6: Data Storytelling & Visualizations',
    taskNumber: 6,
    title: 'Visual Storytelling Dashboard with Seaborn & Matplotlib',
    domain: 'Python',
    description: 'Transform complex multi-dimensional datasets into compelling visual stories using Matplotlib and Seaborn. Build publication-quality charts avoiding chartjunk and adhering to Gestalt visual hierarchy.',
    objectives: [
      'Create distribution plots (KDE, violin plots, box plots with outlier highlights).',
      'Build correlation heatmaps with masked upper triangles and annotated coefficients.',
      'Apply custom corporate color palettes and accessible typography styling.',
      'Compose a multi-panel visual story summarizing churn drivers.'
    ],
    requirements: [
      { id: 'r1', title: 'Publication Polish', description: 'Remove chart clutter; format axis ticks, currency formatting, and legends.', required: true },
      { id: 'r2', title: 'Correlation Heatmap', description: 'Visualize feature collinearity with clear threshold indicators.', required: true },
      { id: 'r3', title: 'Story Narrative', description: 'Accompany each chart with 2 business insights and 1 recommendation.', required: true }
    ],
    acceptanceCriteria: [
      'High DPI output graphics (300 DPI) suitable for boardroom presentation.',
      'Color-blind accessible palette verified.'
    ],
    deliverables: 'Python visualization script (.py) and exported PDF presentation report.',
    allowedFileTypes: ['.py', '.pdf', '.png', '.jpg', '.txt'],
    maxFileSizeMb: 25,
    estimatedHours: 26,
    deadlineDays: 14,
    learningResources: [
      { title: 'Seaborn Tutorial & Color Palettes', url: 'https://seaborn.pydata.org/', type: 'doc' }
    ],
    isMandatory: true,
  },
  {
    id: 'task-7',
    month: 7,
    monthTitle: 'Month 7: Power BI & Business Intelligence Fundamentals',
    taskNumber: 7,
    title: 'Enterprise Star Schema Modeling & Power Query ETL',
    domain: 'Power BI',
    description: 'Model enterprise retail data into a dimensional Star Schema (Fact_Sales, Dim_Product, Dim_Customer, Dim_Date, Dim_Store). Build robust M-Code transformations in Power Query.',
    objectives: [
      'Build a pure dimensional model avoiding bidirectional relationships and synthetic keys.',
      'Construct a dedicated Date Dimension table with fiscal years and weekly offsets.',
      'Develop baseline DAX measures using CALCULATE, FILTER, ALL, and SUMX.',
      'Design an interactive desktop BI dashboard with drill-down hierarchies.'
    ],
    requirements: [
      { id: 'r1', title: 'Star Schema Verification', description: 'Demonstrate 1-to-many single direction relationships.', required: true },
      { id: 'r2', title: 'Date Dimension', description: 'Generate continuous date table from 2022 to 2026.', required: true },
      { id: 'r3', title: 'Core Measures Table', description: 'Organize all measures inside a dedicated calculation table.', required: true }
    ],
    acceptanceCriteria: [
      'Zero relationship ambiguity in diagram view.',
      'Report performance analyzer measures render sub-200ms.'
    ],
    deliverables: 'Power BI template/workbook documentation (.pdf, .txt, or .pbix spec) with DAX definitions.',
    allowedFileTypes: ['.pbix', '.pdf', '.txt', '.docx'],
    maxFileSizeMb: 30,
    estimatedHours: 28,
    deadlineDays: 14,
    learningResources: [
      { title: 'The Definitive Guide to DAX by Marco Russo', url: 'https://www.sqlbi.com', type: 'doc' }
    ],
    isMandatory: true,
  },
  {
    id: 'task-8',
    month: 8,
    monthTitle: 'Month 8: Advanced Power BI & Executive Analytics',
    taskNumber: 8,
    title: 'Advanced DAX Time Intelligence & Row-Level Security',
    domain: 'Power BI',
    description: 'Implement complex time intelligence DAX calculations (YTD, MTD, SAMEPERIODLASTYEAR, Moving Annual Total) and configure Row-Level Security (RLS) for regional sales directors.',
    objectives: [
      'Formulate dynamic time intelligence measures that handle leap years and irregular fiscal calendars.',
      'Set up dynamic Row Level Security (RLS) using USERNAME() and USERPRINCIPALNAME().',
      'Implement What-If parameters for dynamic scenario simulation (price elasticity modeling).',
      'Optimize DAX with DAX Studio, eliminating expensive table iterations.'
    ],
    requirements: [
      { id: 'r1', title: 'Time Intelligence', description: 'Deliver YoY growth % with conditional KPI formatting.', required: true },
      { id: 'r2', title: 'Security Roles', description: 'Define North, South, and International RLS roles.', required: true },
      { id: 'r3', title: 'Scenario Analysis', description: 'Create dynamic discount slider parameter affecting margin %.', required: true }
    ],
    acceptanceCriteria: [
      'DAX code follows best practice formatting standards.',
      'RLS passes validation in "View as Role" simulation.'
    ],
    deliverables: 'DAX scripts and architectural review presentation (.pdf, .txt).',
    allowedFileTypes: ['.pdf', '.txt', '.docx'],
    maxFileSizeMb: 20,
    estimatedHours: 26,
    deadlineDays: 14,
    learningResources: [
      { title: 'Microsoft Power BI Row-Level Security', url: 'https://learn.microsoft.com', type: 'doc' }
    ],
    isMandatory: true,
  },
  {
    id: 'task-9',
    month: 9,
    monthTitle: 'Month 9: Applied Statistics & Hypothesis Testing',
    taskNumber: 9,
    title: 'A/B Testing Framework & Statistical Significance Analysis',
    domain: 'Statistics',
    description: 'Evaluate an authentic marketing conversion A/B experiment. Formulate null/alternative hypotheses, calculate statistical power, perform two-sample t-tests and Chi-Square tests, and control for Type I/II errors.',
    objectives: [
      'Formulate clear statistical hypotheses (H0 vs H1) for continuous and categorical metrics.',
      'Calculate minimum detectable effect (MDE) and sample size requirements.',
      'Execute two-sample Welch t-test and calculate confidence intervals.',
      'Detect sample ratio mismatch (SRM) using Chi-Square goodness-of-fit.',
      'Translate p-values and effect sizes into business decision recommendations.'
    ],
    requirements: [
      { id: 'r1', title: 'Power Calculation', description: 'Demonstrate pre-experiment power analysis (alpha=0.05, power=0.80).', required: true },
      { id: 'r2', title: 'Statistical Tests', description: 'Execute both parametric and non-parametric checks.', required: true },
      { id: 'r3', title: 'Business Recommendation', description: 'Write a non-technical summary for marketing stakeholders.', required: true }
    ],
    acceptanceCriteria: [
      'Correct interpretation of confidence intervals and p-values.',
      'Identification of any SRM risks before declaring a winner.'
    ],
    deliverables: 'Statistical analysis Python code (.py) and written experimental report (.pdf, .txt).',
    allowedFileTypes: ['.py', '.pdf', '.txt'],
    maxFileSizeMb: 15,
    estimatedHours: 25,
    deadlineDays: 14,
    learningResources: [
      { title: 'Practical Statistics for Data Scientists', url: 'https://scipy.org', type: 'doc' }
    ],
    isMandatory: true,
  },
  {
    id: 'task-10',
    month: 10,
    monthTitle: 'Month 10: Machine Learning for Business Analytics',
    taskNumber: 10,
    title: 'Predictive Customer Churn Model with Scikit-Learn',
    domain: 'Machine Learning',
    description: 'Build, evaluate, and interpret a predictive classification model using Scikit-Learn. Evaluate performance using ROC-AUC, Precision-Recall curves, confusion matrices, and explain feature importances.',
    objectives: [
      'Preprocess features using ColumnTransformer, OneHotEncoder, and StandardScaler in a Pipeline.',
      'Train Baseline Logistic Regression and Random Forest classifier.',
      'Evaluate model using Stratified K-Fold cross validation and optimize F1-score for minority class.',
      'Interpret model predictions with feature coefficients and SHAP values.',
      'Build a cost-benefit decision matrix based on retention campaign intervention cost.'
    ],
    requirements: [
      { id: 'r1', title: 'Scikit-Learn Pipeline', description: 'Zero data leakage between train and test splits.', required: true },
      { id: 'r2', title: 'Model Evaluation', description: 'Report ROC-AUC, precision, recall, and confusion matrix.', required: true },
      { id: 'r3', title: 'Business Impact Matrix', description: 'Calculate net ROI of contacting predicted churners.', required: true }
    ],
    acceptanceCriteria: [
      'Model achieves minimum 0.82 ROC-AUC on holdout test set.',
      'Complete modular code with reproducible random seeds.'
    ],
    deliverables: 'End-to-end Python script (.py) and executive modeling presentation.',
    allowedFileTypes: ['.py', '.pdf', '.txt'],
    maxFileSizeMb: 25,
    estimatedHours: 32,
    deadlineDays: 14,
    learningResources: [
      { title: 'Scikit-Learn User Guide', url: 'https://scikit-learn.org', type: 'doc' }
    ],
    isMandatory: true,
  },
  {
    id: 'task-11',
    month: 11,
    monthTitle: 'Month 11: Production Analytics Pipeline & Git Workflow',
    taskNumber: 11,
    title: 'Automated ETL Pipeline, Git Version Control & Documentation',
    domain: 'Python',
    description: 'Package your data analytics pipeline into a professional, production-grade repository with automated data validation, modular Python scripts, git commits, and clear README documentation.',
    objectives: [
      'Implement modular file structure (/src, /tests, /config, /docs).',
      'Integrate data validation checks with Pydantic or Great Expectations.',
      'Write comprehensive docstrings, type annotations, and unit tests using pytest.',
      'Maintain an exemplary Git commit history following conventional commits.'
    ],
    requirements: [
      { id: 'r1', title: 'Automated Testing', description: 'At least 5 passing unit tests for data transformation functions.', required: true },
      { id: 'r2', title: 'Modular Architecture', description: 'Separation of extraction, transformation, and loading concerns.', required: true },
      { id: 'r3', title: 'Engineering README', description: 'Detailed setup instructions, architecture diagram, and usage examples.', required: true }
    ],
    acceptanceCriteria: [
      'Pytest suite executes successfully with 100% pass rate.',
      'Code passes flake8/mypy style and type inspection.'
    ],
    deliverables: 'Zipped repository archive (.zip) or Python source package (.py, .txt).',
    allowedFileTypes: ['.zip', '.py', '.txt', '.pdf'],
    maxFileSizeMb: 30,
    estimatedHours: 30,
    deadlineDays: 14,
    learningResources: [
      { title: 'Production Data Engineering Best Practices', url: 'https://docs.pytest.org', type: 'doc' }
    ],
    isMandatory: true,
  },
  {
    id: 'task-12',
    month: 12,
    monthTitle: 'Month 12: Final Capstone Project & Executive Presentation',
    taskNumber: 12,
    title: 'End-to-End Enterprise Analytics Capstone & Executive Defense',
    domain: 'Capstone',
    description: 'Synthesize all 11 months of learning into an end-to-end Data Analytics Capstone Project. Ingest raw multi-source enterprise data, model in PostgreSQL, analyze in Python, visualize in an Executive BI Dashboard, and present findings in a defense review.',
    objectives: [
      'Formulate an original high-impact business problem statement (e.g. Omnichannel Retail, Healthcare Logistics, FinTech Fraud).',
      'Execute complete data lifecycle: Ingestion -> Cleaning -> SQL Modeling -> Python EDA -> Predictive Modeling -> Executive Dashboard.',
      'Prepare an executive presentation deck summarizing findings, revenue impact, and actionable recommendations.',
      'Defend analytical methodology during a 30-minute formal review session with Senior Reviewers.'
    ],
    requirements: [
      { id: 'r1', title: 'Full Stack Integration', description: 'Must incorporate SQL, Python data pipeline, and interactive dashboard visuals.', required: true },
      { id: 'r2', title: 'Executive Presentation Deck', description: 'Professional slide deck highlighting bottom-line financial impact.', required: true },
      { id: 'r3', title: 'Comprehensive Report', description: '10-page formal analytical whitepaper detailing methodology.', required: true }
    ],
    acceptanceCriteria: [
      'All requirements validated and signed off by Lead Mentor / Reviewer.',
      'Satisfies graduation threshold for official Internship Completion Certificate.'
    ],
    deliverables: 'Capstone project archive (.zip, .pdf, or .py) including code, executive deck, and formal analytical whitepaper.',
    allowedFileTypes: ['.zip', '.pdf', '.py', '.txt'],
    maxFileSizeMb: 50,
    estimatedHours: 45,
    deadlineDays: 21,
    learningResources: [
      { title: 'Executive Presentation for Data Leaders', url: 'https://hbr.org', type: 'doc' }
    ],
    isMandatory: true,
  }
];

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'intern_1',
    name: 'Aakash Selvam',
    email: 'selvamaakash6@gmail.com',
    role: 'intern',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    college: 'B.Tech Information Technology, Year 4',
    degree: 'B.Tech IT (Final Year)',
    enrollmentId: 'INT-2026-889',
    track: 'Data Analytics & Engineering',
    startDate: '2026-01-05',
    targetEndDate: '2026-12-20'
  },
  {
    id: 'reviewer_1',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@analyticsinstitute.org',
    role: 'reviewer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    college: 'Lead Mentor & Senior Data Scientist',
    degree: 'Ph.D. Computer Science & Analytics',
    enrollmentId: 'REV-LEAD-001',
    track: 'Reviewer & Evaluator Board',
    startDate: '2024-01-01',
    targetEndDate: '2028-12-31'
  }
];

// Initial seeded submissions to show realistic progress
const INITIAL_SUBMISSIONS: TaskSubmission[] = [
  {
    id: 'sub-1',
    taskId: 'task-1',
    internId: 'intern_1',
    status: 'approved',
    currentVersion: 2,
    versions: [
      {
        version: 1,
        fileName: 'sales_dashboard_v1.xlsx',
        fileSize: 4200000,
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileContentPreview: 'Sheets: DataCleaning, PivotSummary, ExecutiveDashboard. Implemented basic XLOOKUP and SUMIFS.',
        uploadedAt: '2026-01-18T14:22:00Z',
        submissionNotes: 'Initial draft with 50,000 transaction records.'
      },
      {
        version: 2,
        fileName: 'sales_dashboard_v2_final.xlsx',
        fileSize: 4450000,
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileContentPreview: 'Added dynamic slicers, formatted 4 KPI tiles, eliminated #N/A lookups with IFERROR/XLOOKUP fallback, custom corporate palette.',
        uploadedAt: '2026-01-22T09:15:00Z',
        submissionNotes: 'Revised according to Dr. Nova feedback. Added MoM growth metrics.'
      }
    ],
    evaluation: {
      id: 'eval-1',
      submissionId: 'sub-1',
      taskId: 'task-1',
      internId: 'intern_1',
      score: 94,
      aiVerdict: 'RECOMMENDED_FOR_APPROVAL',
      whatIsGood: [
        'Exemplary use of modern XLOOKUP with robust default error fallbacks.',
        'Slicers are connected to all pivot caches smoothly without lag.',
        'Executive visual hierarchy is clean, clutter-free, and adheres to boardroom styling.'
      ],
      whatIsMissing: [
        'Sensitivity scenario testing tab for variable discount assumptions.'
      ],
      whatNeedsCorrection: [
        'Minor rounding discrepancy in Month 7 gross margin % display tile.'
      ],
      whatShouldBeAdded: [
        'Automated macro or button to refresh all pivot caches on workbook opening.'
      ],
      recommendedImprovements: [
        'Consider using Power Pivot Data Model (DAX measures) for datasets exceeding 500k rows in future modules.'
      ],
      overallEvaluation: 'Outstanding submission. The intern demonstrated a mastery of dynamic formula construction, pivot cache linking, and visual storytelling.',
      evaluatedAt: '2026-01-22T09:20:00Z'
    },
    reviewerApproval: {
      approvedBy: 'reviewer_1',
      approvedByName: 'Dr. Priya Sharma',
      approvedAt: '2026-01-23T11:00:00Z',
      reviewerFeedback: 'Fantastic work Aakash! The dashboard is responsive, formula calculations are verified against the raw database extract, and your documentation is crystal clear. Approved with honors.',
      officialScore: 96,
      status: 'approved'
    },
    createdAt: '2026-01-18T14:22:00Z',
    updatedAt: '2026-01-23T11:00:00Z'
  },
  {
    id: 'sub-2',
    taskId: 'task-2',
    internId: 'intern_1',
    status: 'under_review',
    currentVersion: 1,
    versions: [
      {
        version: 1,
        fileName: 'ecommerce_schema_and_queries.sql',
        fileSize: 45000,
        fileType: 'application/sql',
        fileContentPreview: `CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE orders (
  order_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  order_total NUMERIC(10,2) NOT NULL,
  order_date DATE NOT NULL
);

-- Customer LTV Query
SELECT 
  u.user_id,
  u.email,
  COUNT(o.order_id) AS total_orders,
  COALESCE(SUM(o.order_total), 0) AS lifetime_value
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
GROUP BY u.user_id, u.email
ORDER BY lifetime_value DESC;`,
        uploadedAt: '2026-02-12T16:30:00Z',
        submissionNotes: 'Includes 3NF DDL schema with foreign key cascades and analytical queries for customer lifetime value.'
      }
    ],
    evaluation: {
      id: 'eval-2',
      submissionId: 'sub-2',
      taskId: 'task-2',
      internId: 'intern_1',
      score: 86,
      aiVerdict: 'RECOMMENDED_FOR_APPROVAL',
      whatIsGood: [
        'Proper 3NF relational normalization with foreign key cascades.',
        'Use of COALESCE prevents NULL values from skewing aggregations.',
        'Clean ANSI SQL syntax that runs directly on PostgreSQL 15+.'
      ],
      whatIsMissing: [
        'B-tree composite index on (user_id, order_date) to accelerate date-bounded joins.',
        'Query explain plan comparison (EXPLAIN ANALYZE) before and after indexing.'
      ],
      whatNeedsCorrection: [
        'Consider partitioning the orders table if order volume exceeds 10 million rows per year.'
      ],
      whatShouldBeAdded: [
        'Include a query identifying customer cohort retention over time.'
      ],
      recommendedImprovements: [
        'Utilize CTEs (WITH clauses) for complex multi-step aggregations to improve code maintainability.'
      ],
      overallEvaluation: 'Strong foundational SQL submission. The relational schema is well-designed with appropriate integrity constraints. Adding the query execution plan will complete the performance criteria.',
      evaluatedAt: '2026-02-12T16:35:00Z'
    },
    reviewSchedule: {
      id: 'rev-sched-2',
      taskId: 'task-2',
      internId: 'intern_1',
      reviewerId: 'reviewer_1',
      scheduledAt: '2026-02-16T15:00:00Z',
      meetingLink: 'https://meet.google.com/ais-data-review-2026',
      agenda: 'Review e-commerce relational schema, foreign key constraints, and EXPLAIN ANALYZE index optimization strategy.',
      status: 'scheduled'
    },
    createdAt: '2026-02-12T16:30:00Z',
    updatedAt: '2026-02-12T16:35:00Z'
  }
];

const INITIAL_NOTIFICATIONS: EmailNotification[] = [
  {
    id: 'notif-1',
    recipientEmail: 'selvamaakash6@gmail.com',
    recipientName: 'Aakash Selvam',
    subject: 'Welcome to Data Analytics Internship & Task 1 Assigned',
    type: 'task_assigned',
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #1e3a8a;">Welcome to the Data Analytics Internship Program!</h2>
      <p>Dear Aakash,</p>
      <p>Your one-year Data Analytics internship is now active. Your first assignment has been assigned:</p>
      <div style="background: #f8fafc; padding: 16px; border-left: 4px solid #3b82f6; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin: 0 0 8px 0; color: #0f172a;">Task 1: Dynamic Sales Dashboard with XLOOKUP, INDEX/MATCH & Pivot Models</h3>
        <p style="margin: 0; color: #475569;"><strong>Deadline:</strong> 14 Days | <strong>Domain:</strong> Advanced Excel</p>
      </div>
      <p>Your AI Mentor Dr. Nova is available 24/7 to provide hints, formulas, and step-by-step guidance.</p>
      <p>Best regards,<br/><strong>Internship Academic Board</strong></p>
    </div>`,
    sentAt: '2026-01-05T09:00:00Z',
    status: 'delivered',
    previewText: 'Welcome to your Data Analytics Internship. Task 1 has been assigned with instructions.'
  },
  {
    id: 'notif-2',
    recipientEmail: 'selvamaakash6@gmail.com',
    recipientName: 'Aakash Selvam',
    subject: 'Official Approval: Task 1 (Excel Modeling) - Score: 96/100',
    type: 'official_approval',
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #15803d;">Task 1 Officially Approved!</h2>
      <p>Dear Aakash,</p>
      <p>Lead Mentor Dr. Priya Sharma has reviewed your submission for <strong>Task 1: Dynamic Sales Dashboard</strong>.</p>
      <div style="background: #f0fdf4; padding: 16px; border-left: 4px solid #22c55e; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; font-size: 18px; color: #166534;"><strong>Official Score: 96 / 100 (Pass with Honors)</strong></p>
        <p style="margin: 8px 0 0 0; color: #15803d;">"Fantastic work Aakash! The dashboard is responsive and your documentation is crystal clear."</p>
      </div>
      <p>Your progress has been updated in the portal. Month 2: SQL Fundamentals is now unlocked.</p>
    </div>`,
    sentAt: '2026-01-23T11:05:00Z',
    status: 'delivered',
    previewText: 'Task 1 has been officially approved with a score of 96/100 by Dr. Priya Sharma.'
  },
  {
    id: 'notif-3',
    recipientEmail: 'selvamaakash6@gmail.com',
    recipientName: 'Aakash Selvam',
    subject: 'Review Session Scheduled: Task 2 Relational SQL Schema',
    type: 'review_scheduled',
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #1e3a8a;">Review Session Scheduled</h2>
      <p>Dear Aakash,</p>
      <p>Your technical review meeting for <strong>Task 2: Relational Schema Design & Multi-Table SQL Joins</strong> has been scheduled.</p>
      <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Reviewer:</strong> Dr. Priya Sharma (Senior Data Scientist)</p>
        <p><strong>Date & Time:</strong> Feb 16, 2026 at 3:00 PM IST</p>
        <p><strong>Meeting Link:</strong> <a href="https://meet.google.com/ais-data-review-2026" style="color: #2563eb; font-weight: bold;">Join Google Meet Call</a></p>
        <p><strong>Agenda:</strong> Review DDL integrity, foreign key cascading, and EXPLAIN ANALYZE index optimization.</p>
      </div>
      <p>Please be ready to screen share your PostgreSQL query terminal.</p>
    </div>`,
    sentAt: '2026-02-12T16:40:00Z',
    status: 'delivered',
    previewText: 'Your Task 2 Technical Review has been scheduled for Feb 16, 2026 with Dr. Priya Sharma.'
  }
];

const INITIAL_FEEDBACK: ChatbotFeedbackEntry[] = [
  {
    id: 'fb-1',
    messageId: 'msg-seed-1',
    internId: 'intern_1',
    internName: 'Aakash Selvam',
    rating: 5,
    comment: 'The explanation of INDEX/MATCH vs XLOOKUP was super clear and saved me hours on Task 1.',
    category: 'explanation',
    userPromptPreview: 'How do I avoid #N/A in Excel when lookup value does not exist?',
    botResponsePreview: 'Use the 4th argument of XLOOKUP: =XLOOKUP(val, lookup_arr, return_arr, "Not Found")...',
    createdAt: '2026-01-15T18:10:00Z'
  },
  {
    id: 'fb-2',
    messageId: 'msg-seed-2',
    internId: 'intern_1',
    internName: 'Aakash Selvam',
    rating: 5,
    comment: 'The mentor provided clean PostgreSQL DDL code with UUID keys and correct syntax.',
    category: 'code_quality',
    userPromptPreview: 'How should I define a foreign key with cascade delete in Postgres?',
    botResponsePreview: 'Use REFERENCES parent_table(id) ON DELETE CASCADE in your column constraint...',
    createdAt: '2026-02-10T12:05:00Z'
  }
];

class DatabaseService {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || INITIAL_USERS,
          tasks: parsed.tasks || INITIAL_TASKS,
          submissions: parsed.submissions || INITIAL_SUBMISSIONS,
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
          chatHistory: parsed.chatHistory || {},
          feedbackRatings: parsed.feedbackRatings || INITIAL_FEEDBACK
        };
      }
    } catch (err) {
      console.error('Error reading database file, using seeds:', err);
    }

    const defaultState: DatabaseState = {
      users: INITIAL_USERS,
      tasks: INITIAL_TASKS,
      submissions: INITIAL_SUBMISSIONS,
      notifications: INITIAL_NOTIFICATIONS,
      chatHistory: {},
      feedbackRatings: INITIAL_FEEDBACK
    };

    this.save(defaultState);
    return defaultState;
  }

  private save(data?: DatabaseState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const toSave = data || this.state;
      fs.writeFileSync(DB_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database file:', err);
    }
  }

  public getUsers(): UserProfile[] {
    return this.state.users;
  }

  public getUser(id: string): UserProfile | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public getTasks(): InternshipTask[] {
    return this.state.tasks;
  }

  public getTask(id: string): InternshipTask | undefined {
    return this.state.tasks.find(t => t.id === id);
  }

  public getSubmissions(internId?: string): TaskSubmission[] {
    if (internId) {
      return this.state.submissions.filter(s => s.internId === internId);
    }
    return this.state.submissions;
  }

  public getSubmission(id: string): TaskSubmission | undefined {
    return this.state.submissions.find(s => s.id === id);
  }

  public getSubmissionByTask(taskId: string, internId: string): TaskSubmission | undefined {
    return this.state.submissions.find(s => s.taskId === taskId && s.internId === internId);
  }

  public saveSubmission(submission: TaskSubmission): TaskSubmission {
    const idx = this.state.submissions.findIndex(s => s.id === submission.id);
    if (idx >= 0) {
      this.state.submissions[idx] = submission;
    } else {
      this.state.submissions.push(submission);
    }
    this.save();
    return submission;
  }

  public getNotifications(recipientEmail?: string): EmailNotification[] {
    if (recipientEmail) {
      return this.state.notifications.filter(n => n.recipientEmail.toLowerCase() === recipientEmail.toLowerCase());
    }
    return this.state.notifications;
  }

  public addNotification(notification: EmailNotification): EmailNotification {
    this.state.notifications.unshift(notification);
    this.save();
    return notification;
  }

  public getChatHistory(internId: string): ChatMessage[] {
    return this.state.chatHistory[internId] || [];
  }

  public saveChatMessage(internId: string, message: ChatMessage): ChatMessage {
    if (!this.state.chatHistory[internId]) {
      this.state.chatHistory[internId] = [];
    }
    this.state.chatHistory[internId].push(message);
    this.save();
    return message;
  }

  public clearChatHistory(internId: string) {
    this.state.chatHistory[internId] = [];
    this.save();
  }

  public getFeedbackRatings(): ChatbotFeedbackEntry[] {
    return this.state.feedbackRatings;
  }

  public addFeedbackRating(entry: ChatbotFeedbackEntry): ChatbotFeedbackEntry {
    this.state.feedbackRatings.unshift(entry);
    this.save();
    return entry;
  }

  public resetToDefaults(): DatabaseState {
    this.state = {
      users: INITIAL_USERS,
      tasks: INITIAL_TASKS,
      submissions: INITIAL_SUBMISSIONS,
      notifications: INITIAL_NOTIFICATIONS,
      chatHistory: {},
      feedbackRatings: INITIAL_FEEDBACK
    };
    this.save();
    return this.state;
  }
}

export const db = new DatabaseService();
