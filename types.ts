
export enum UserRole {
  STUDENT = 'STUDENT',
  RESEARCHER = 'RESEARCHER',
  PROFESSIONAL = 'PROFESSIONAL',
  INSTITUTION = 'INSTITUTION' // UI Label: Library Admin
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  educationLevel?: 'Class 10' | 'Class 11' | 'Class 12' | 'Undergraduate' | 'Graduate';
  targetExam?: string; // e.g., 'JEE Advanced', 'UPSC', 'GATE'
  profession?: string; // e.g., 'Technology', 'Healthcare', 'Business'
  avatarUrl?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  pages: number;
  readTime: string; // e.g., "4h 30m"
  tags: string[];
  description: string; // Short conventional description
  aiInsights: {
    bestFor: string;
    whoShouldSkip: string;
    roiScore: number; // 0-100
    learningOutcomes: string[];
  };
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  type: 'PHYSICAL' | 'EBOOK' | 'AUDIO';
  available: number; // Currently available on shelf/cloud
  totalQuantity: number; // Total inventory count
  shelfLocation?: string; // e.g., "A1-34"
  fileSize?: string; // e.g., "15 MB"
  rating: number;
  reviews: number;
  tags?: string[];
  addedDate: number;
  // Extended Metadata
  description?: string;
  pages?: number;
  readTime?: string;
}

export interface RoadmapPhase {
  id: number;
  phase: string;
  duration: string;
  topics: {
    title: string;
    desc: string;
  }[];
}

export interface StudyPlan {
  id: string;
  subject: string;
  goal: string;
  dailyTime: number; // minutes
  schedule: string; // Markdown content from AI
}

export interface GeneratedNote {
  id: string;
  bookId: string;
  topic: string;
  content: string; // Markdown
  type: 'SUMMARY' | 'REVISION' | 'FORMULA';
  createdAt: number;
}

export interface TestResult {
  id: string;
  examTitle: string;
  date: number; // timestamp
  score: number;
  totalScore: number;
  accuracy: number; // percentage
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  weakestSection: string;
  strongestSection: string;
}

// --- RESEARCHER TYPES ---

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  year: string;
  journal: string;
  finding: string; // The specific finding related to the query
  citationCount: number;
}

export interface ConsensusResult {
  consensusScore: number; // 0 to 100 (No to Yes)
  consensusLabel: 'YES' | 'NO' | 'MIXED' | 'INCONCLUSIVE';
  summary: string;
  papers: ResearchPaper[];
}

export interface MatrixRow {
  paperTitle: string;
  year: string;
  [key: string]: string; // Dynamic columns like 'Sample Size', 'Methodology'
}

export interface ComparisonMatrix {
  columns: string[];
  rows: MatrixRow[];
}

export interface DetailedComparison {
  papers: {
    title: string;
    methodology: string;
    findings: string;
    limitations: string;
  }[];
  analysis: {
    methodologyDiff: string;
    findingsDiff: string;
    limitationsDiff: string;
    synthesis: string;
  };
}

export interface PeerReviewResult {
  overallScore: number; // 0-100
  decision: 'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT';
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  clarityScore: number;
  noveltyScore: number;
  methodologyScore: number;
}

export interface GrantProposal {
  title: string;
  executiveSummary: string;
  specificAims: string[];
  impactStatement: string;
  budgetJustification: string;
  timeline: string;
}

export interface ExtractedDataRow {
  [key: string]: string | number;
}

export interface MethodStep {
  phase: string;
  details: string[];
  equipment: string[];
}

export interface JournalRecommendation {
  name: string;
  impactFactor: string;
  matchScore: number; // 0-100
  reason: string;
  reviewTime: string;
}

export interface StatAdvice {
  recommendedTest: string;
  reason: string;
  assumptions: string[];
  codeSnippet: string; // Python/R
}

export interface ResearchTrend {
  topic: string;
  growthLabel: 'Exploding' | 'Steady' | 'Declining';
  growthPercent: number;
  yearlyData: { year: string; volume: number }[]; // 5 years
}

export interface PaperSEO {
  discoverabilityScore: number; // 0-100
  missingKeywords: string[];
  strongKeywords: string[];
  titleSuggestions: string[];
  abstractFeedback: string;
}

export interface CareerProjection {
  currentHIndex: number;
  projectedHIndex5Y: number;
  citationVelocity: string; // e.g. "Top 10%"
  strategy: string;
}

export interface LiteratureSummary {
  inputIdentifier: string;
  title: string;
  summary: string;
  keyFindings: string[];
  methodology: string;
  impactScore: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  synthesis: string;
  sources: GroundingSource[];
}

// --- PROFESSIONAL TYPES ---

export interface ExecutiveBrief {
  bluf: string; // Bottom Line Up Front
  keyPoints: string[];
  actionItems: string[];
  roiEstimate: string;
}

export interface MarketTrend {
  trendName: string;
  status: 'HYPE' | 'ADOPT' | 'MATURE' | 'OBSOLETE';
  description: string;
  sourceUrl?: string;
}

export interface DecisionMatrix {
  options: string[];
  criteria: string[];
  scores: {
    option: string;
    scores: number[]; // Corresponds to criteria order
    total: number;
  }[];
  recommendation: string;
}

export interface SkillGapPlan {
  missingSkills: string[];
  booksToRead: {
    title: string;
    focusChapter: string;
    reason: string;
  }[];
  timelineWeeks: number;
}

export interface MentalModelSolution {
  modelName: string;
  application: string;
  solution: string;
}

export interface ProfessionalSolution {
  analysis: string;
  strategySteps: string[];
  relevantBookIds: string[]; // IDs from the library
  citations: string[]; // e.g. "Refer to Chapter 4 of Clean Code"
}
