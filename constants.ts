
import { Book } from './types';

export const MOCK_BOOKS: Book[] = [
  {
    id: 'b1',
    title: 'Physics for Scientists',
    author: 'Dr. A. Einstein (Mock)',
    coverUrl: 'https://picsum.photos/300/450?random=1',
    category: 'Physics',
    level: 'Advanced',
    pages: 450,
    readTime: '12h',
    tags: ['Thermodynamics', 'Mechanics', 'Quantum'],
    description: 'A comprehensive guide to modern physics principles.',
    aiInsights: {
      bestFor: 'JEE Advanced Aspirants & Undergrad Physics Majors',
      whoShouldSkip: 'High school beginners looking for a quick overview',
      roiScore: 92,
      learningOutcomes: ['Master Quantum Mechanics', 'Solve Complex Rotational Motion', 'Understand Entropy']
    }
  },
  {
    id: 'b2',
    title: 'Modern World History',
    author: 'H. Historian',
    coverUrl: 'https://picsum.photos/300/450?random=2',
    category: 'History',
    level: 'Intermediate',
    pages: 320,
    readTime: '8h 15m',
    tags: ['Wars', 'Geopolitics', 'Economy'],
    description: 'An overview of major historical events from 1900 to 2000.',
    aiInsights: {
      bestFor: 'UPSC Aspirants & History Buffs',
      whoShouldSkip: 'Students looking for ancient history',
      roiScore: 85,
      learningOutcomes: ['Timeline of WW1 & WW2', 'Cold War Politics', 'Rise of Globalization']
    }
  },
  {
    id: 'b3',
    title: 'Organic Chemistry Essentials',
    author: 'C. Chemist',
    coverUrl: 'https://picsum.photos/300/450?random=3',
    category: 'Chemistry',
    level: 'Intermediate',
    pages: 280,
    readTime: '6h',
    tags: ['Reactions', 'Polymers', 'Acids'],
    description: 'Core concepts of organic chemistry made simple.',
    aiInsights: {
      bestFor: 'Class 11-12 Board Exam Preparation',
      whoShouldSkip: 'PhD Researchers (too basic)',
      roiScore: 88,
      learningOutcomes: ['Reaction Mechanisms', 'IUPAC Naming', 'Biomolecules']
    }
  },
  {
    id: 'b4',
    title: 'The Art of Algorithm',
    author: 'D. Knuth (Mock)',
    coverUrl: 'https://picsum.photos/300/450?random=4',
    category: 'Computer Science',
    level: 'Advanced',
    pages: 600,
    readTime: '20h',
    tags: ['Sorting', 'Graphs', 'Dynamic Programming'],
    description: 'Deep dive into algorithmic thinking.',
    aiInsights: {
      bestFor: 'Competitive Programmers & CS Majors',
      whoShouldSkip: 'Web development bootcamper looking for CSS tips',
      roiScore: 95,
      learningOutcomes: ['Graph Theory Mastery', 'Complexity Analysis', 'Optimization Techniques']
    }
  },
  {
    id: 'b5',
    title: 'Economics 101',
    author: 'T. Sowell (Mock)',
    coverUrl: 'https://picsum.photos/300/450?random=5',
    category: 'Economics',
    level: 'Beginner',
    pages: 200,
    readTime: '5h',
    tags: ['Microeconomics', 'Supply & Demand'],
    description: 'Basic economic principles for everyone.',
    aiInsights: {
      bestFor: 'MBA Entrants & General Knowledge',
      whoShouldSkip: 'Econometrics specialists',
      roiScore: 78,
      learningOutcomes: ['Market Forces', 'Fiscal Policy', 'Inflation Basics']
    }
  }
];

// Expanded Inventory simulating a larger library database
export const MOCK_LIBRARY_INVENTORY = [
  // ENGINEERING / CS
  { id: 'eng1', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', category: 'Engineering', available: 8, totalQuantity: 12, rating: 4.8, reviews: 120 },
  { id: 'eng2', title: 'Clean Code', author: 'Robert C. Martin', category: 'Engineering', available: 5, totalQuantity: 10, rating: 4.9, reviews: 340 },
  { id: 'eng3', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', category: 'Engineering', available: 3, totalQuantity: 8, rating: 4.7, reviews: 210 },
  { id: 'eng4', title: 'Design Patterns', author: 'Erich Gamma', category: 'Engineering', available: 2, totalQuantity: 6, rating: 4.6, reviews: 180 },
  { id: 'eng5', title: 'Introduction to Mechanics', author: 'Kleppner & Kolenkow', category: 'Engineering', available: 4, totalQuantity: 5, rating: 4.5, reviews: 90 },
  { id: 'eng6', title: 'Engineering Thermodynamics', author: 'P.K. Nag', category: 'Engineering', available: 10, totalQuantity: 15, rating: 4.3, reviews: 450 },
  { id: 'eng7', title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', category: 'Engineering', available: 15, totalQuantity: 20, rating: 4.6, reviews: 800 },
  { id: 'eng8', title: 'Digital Logic and Computer Design', author: 'M. Morris Mano', category: 'Engineering', available: 6, totalQuantity: 10, rating: 4.4, reviews: 150 },
  { id: 'eng9', title: 'Fluid Mechanics', author: 'Frank M. White', category: 'Engineering', available: 3, totalQuantity: 8, rating: 4.5, reviews: 75 },
  { id: 'eng10', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', category: 'Engineering', available: 2, totalQuantity: 5, rating: 4.9, reviews: 200 },

  // MEDICAL
  { id: 'med1', title: 'Gray\'s Anatomy', author: 'Henry Gray', category: 'Medical', available: 2, totalQuantity: 5, rating: 4.9, reviews: 500 },
  { id: 'med2', title: 'Guyton and Hall Textbook of Medical Physiology', author: 'John E. Hall', category: 'Medical', available: 4, totalQuantity: 7, rating: 4.8, reviews: 320 },
  { id: 'med3', title: 'Robbins Basic Pathology', author: 'Vinay Kumar', category: 'Medical', available: 5, totalQuantity: 8, rating: 4.7, reviews: 210 },
  { id: 'med4', title: 'Harrison\'s Principles of Internal Medicine', author: 'J. Larry Jameson', category: 'Medical', available: 1, totalQuantity: 4, rating: 4.9, reviews: 150 },
  { id: 'med5', title: 'Netter\'s Atlas of Human Anatomy', author: 'Frank H. Netter', category: 'Medical', available: 6, totalQuantity: 8, rating: 4.9, reviews: 400 },
  { id: 'med6', title: 'Essentials of Medical Pharmacology', author: 'K.D. Tripathi', category: 'Medical', available: 8, totalQuantity: 12, rating: 4.6, reviews: 600 },
  { id: 'med7', title: 'Bailey & Love\'s Short Practice of Surgery', author: 'Norman Williams', category: 'Medical', available: 3, totalQuantity: 6, rating: 4.5, reviews: 180 },
  { id: 'med8', title: 'Park\'s Textbook of Preventive and Social Medicine', author: 'K. Park', category: 'Medical', available: 7, totalQuantity: 10, rating: 4.4, reviews: 350 },

  // UPSC / GOVT EXAMS
  { id: 'upsc1', title: 'Indian Polity', author: 'M. Laxmikanth', category: 'Govt Exams', available: 20, totalQuantity: 30, rating: 4.9, reviews: 2500 },
  { id: 'upsc2', title: 'India\'s Struggle for Independence', author: 'Bipan Chandra', category: 'Govt Exams', available: 12, totalQuantity: 20, rating: 4.7, reviews: 1200 },
  { id: 'upsc3', title: 'Indian Art and Culture', author: 'Nitin Singhania', category: 'Govt Exams', available: 8, totalQuantity: 15, rating: 4.6, reviews: 800 },
  { id: 'upsc4', title: 'Certificate Physical and Human Geography', author: 'G.C. Leong', category: 'Govt Exams', available: 15, totalQuantity: 25, rating: 4.8, reviews: 1500 },
  { id: 'upsc5', title: 'Indian Economy', author: 'Ramesh Singh', category: 'Govt Exams', available: 10, totalQuantity: 18, rating: 4.5, reviews: 900 },
  { id: 'upsc6', title: 'A Brief History of Modern India', author: 'Rajiv Ahir', category: 'Govt Exams', available: 14, totalQuantity: 20, rating: 4.6, reviews: 1100 },
  { id: 'upsc7', title: 'General Studies Paper I Manual', author: 'McGraw Hill', category: 'Govt Exams', available: 25, totalQuantity: 40, rating: 4.2, reviews: 500 },
  { id: 'upsc8', title: 'Quantitative Aptitude for Competitive Examinations', author: 'R.S. Aggarwal', category: 'Govt Exams', available: 30, totalQuantity: 50, rating: 4.7, reviews: 3000 },
  { id: 'upsc9', title: 'A Modern Approach to Verbal & Non-Verbal Reasoning', author: 'R.S. Aggarwal', category: 'Govt Exams', available: 28, totalQuantity: 45, rating: 4.6, reviews: 2800 },

  // JEE / NEET / COMPETITIVE
  { id: 'jee1', title: 'Concepts of Physics (Vol 1 & 2)', author: 'H.C. Verma', category: 'Competitive', available: 40, totalQuantity: 60, rating: 5.0, reviews: 5000 },
  { id: 'jee2', title: 'Problems in General Physics', author: 'I.E. Irodov', category: 'Competitive', available: 15, totalQuantity: 25, rating: 4.8, reviews: 1200 },
  { id: 'jee3', title: 'Physical Chemistry', author: 'O.P. Tandon', category: 'Competitive', available: 20, totalQuantity: 30, rating: 4.5, reviews: 800 },
  { id: 'jee4', title: 'Objective Mathematics', author: 'R.D. Sharma', category: 'Competitive', available: 25, totalQuantity: 35, rating: 4.6, reviews: 1500 },
  { id: 'jee5', title: 'Biology: Vol 1', author: 'Trueman', category: 'Competitive', available: 12, totalQuantity: 20, rating: 4.7, reviews: 900 },
  { id: 'jee6', title: 'Organic Chemistry', author: 'Morrison and Boyd', category: 'Competitive', available: 5, totalQuantity: 12, rating: 4.8, reviews: 600 },

  // ARTS / HUMANITIES / OTHERS
  { id: 'art1', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', category: 'Arts', available: 10, totalQuantity: 15, rating: 4.8, reviews: 2000 },
  { id: 'art2', title: 'Ways of Seeing', author: 'John Berger', category: 'Arts', available: 4, totalQuantity: 8, rating: 4.5, reviews: 400 },
  { id: 'art3', title: 'The Story of Art', author: 'E.H. Gombrich', category: 'Arts', available: 3, totalQuantity: 5, rating: 4.9, reviews: 600 },
  { id: 'lit1', title: '1984', author: 'George Orwell', category: 'Arts', available: 15, totalQuantity: 25, rating: 4.8, reviews: 3000 },
  { id: 'comm1', title: 'The Intelligent Investor', author: 'Benjamin Graham', category: 'Commerce', available: 8, totalQuantity: 12, rating: 4.8, reviews: 2500 },
  { id: 'comm2', title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', category: 'Commerce', available: 20, totalQuantity: 35, rating: 4.6, reviews: 4000 },
  { id: 'comm3', title: 'Principles of Marketing', author: 'Philip Kotler', category: 'Commerce', available: 12, totalQuantity: 18, rating: 4.7, reviews: 1200 }
];
