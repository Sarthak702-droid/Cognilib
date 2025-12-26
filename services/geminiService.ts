
import { GoogleGenAI, Type } from "@google/genai";
import { Book, TestResult, RoadmapPhase, ConsensusResult, ComparisonMatrix, PeerReviewResult, GrantProposal, MethodStep, JournalRecommendation, StatAdvice, ResearchTrend, PaperSEO, CareerProjection, LiteratureSummary, SearchResult, GroundingSource, ExecutiveBrief, MarketTrend, DecisionMatrix, SkillGapPlan, MentalModelSolution, ProfessionalSolution, DetailedComparison } from '../types';
import { MOCK_LIBRARY_INVENTORY } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
const modelId = 'gemini-3-flash-preview';

export const generateStudyPlan = async (subject: string, goal: string, time: string): Promise<RoadmapPhase[]> => {
  try {
    const prompt = `
      Act as an expert academic architect.
      Create a step-by-step visual roadmap for: "${subject}".
      Goal: "${goal}".
      Time per day: "${time}".
      
      Structure the plan into 4-6 distinct Phases (e.g., Foundations, Deep Dive, Practice, Mastery).
      
      Output strictly JSON:
      [
        {
          "id": 1,
          "phase": "Phase Name",
          "duration": "e.g. Week 1-2",
          "topics": [
             { "title": "Topic Name", "desc": "Short actionable instruction (max 10 words)" }
          ]
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              phase: { type: Type.STRING },
              duration: { type: Type.STRING },
              topics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    desc: { type: Type.STRING }
                  },
                  required: ["title", "desc"]
                }
              }
            },
            required: ["id", "phase", "duration", "topics"]
          }
        }
      }
    });
    
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Plan Error:", error);
    return [];
  }
};

export const generateBookNotes = async (
  book: Book, 
  topic: string, 
  type: 'SUMMARY' | 'REVISION' | 'FORMULA' | 'DIAGRAM',
  style: 'BEGINNER' | 'EXAM' | 'QUICK' = 'EXAM'
): Promise<string> => {
  try {
    const styleInstructions = {
      'BEGINNER': "Explain this like I am a beginner. Use simple analogies, avoid heavy jargon, and focus on building intuition.",
      'EXAM': "Focus on high-yield exam content. Highlight keywords, standard definitions, and points likely to be asked in competitive exams. Maintain high academic rigor.",
      'QUICK': "Be ultra-concise. Use bullet points, 'TL;DR' formats, and focus purely on speed and recall."
    };

    const instruction = styleInstructions[style];

    if (type === 'DIAGRAM') {
      const prompt = `
        Act as a professional academic technical illustrator.
        Context: The book "${book.title}" by ${book.author}.
        Topic: "${topic}".
        Style Preference: ${instruction}
        
        Task: Create a high-quality, visually appealing SVG diagram to illustrate this concept.
        
        Requirements:
        1. **Format**: Return ONLY valid SVG code. No markdown, no "xml" tag, no commentary. Start with <svg and end with </svg>.
        2. **Canvas**: Use viewBox="0 0 800 500" for a nice aspect ratio. Do not set fixed width/height on the svg tag.
        3. **Style Guidelines**:
           - **Background**: White (#ffffff).
           - **Primary Elements**: Use Indigo-600 (#4F46E5) for main strokes (2px width).
           - **Secondary Elements**: Use Slate-400 (#94a3b8) for connecting lines/arrows (1px width).
           - **Fills**: Use Indigo-50 (#e0e7ff) for boxes/circles to make them pop.
           - **Text**: Use a clear sans-serif font, Dark Slate (#1e293b), legible size (14px+).
        4. **Content**:
           - Include a Title at the top.
           - Use boxes, circles, arrows, and labels to show relationships or process flow.
           - Ensure high contrast and professional spacing.
      `;
      
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
      });
      const text = response.text || "";
      return text
        .replace(/```xml/g, '')
        .replace(/```svg/g, '')
        .replace(/```html/g, '')
        .replace(/```/g, '')
        .trim();
    }

    const prompt = `
      Act as a smart revision engine. 
      Book: "${book.title}" by ${book.author}.
      Context/Tags: ${book.tags.join(', ')}.
      
      User request: Generate "${type}" notes specifically about "${topic}".
      tone/Style: ${instruction}
      
      If type is SUMMARY: Provide a structured summary of key points.
      If type is REVISION: Provide bullet points, bold keywords, and memory mnemonics.
      If type is FORMULA: List key definitions, formulas, or core axioms found in such a topic.
      
      Format as clean Markdown. Use headings, bold text, and lists effectively.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "Could not generate notes.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating notes.";
  }
};

export const generatePdfNotes = async (
  base64Data: string, 
  type: 'SUMMARY' | 'REVISION' | 'FORMULA' | 'DIAGRAM',
  style: 'BEGINNER' | 'EXAM' | 'QUICK' = 'EXAM'
): Promise<string> => {
  try {
    const styleInstructions = {
      'BEGINNER': "Explain like I am a beginner. Simple analogies, avoid jargon.",
      'EXAM': "Exam-focused. Highlight keywords, definitions, and high-yield points.",
      'QUICK': "Ultra-concise. Bullet points, TL;DR format."
    };

    const instruction = styleInstructions[style];
    
    if (type === 'DIAGRAM') {
       // Diagram logic for PDF source
       const prompt = `
        Act as a professional academic technical illustrator.
        Source: Attached PDF Document.
        Task: Visualize the core concept or process described in this document.
        Style Preference: ${instruction}
        
        Requirements:
        1. Return ONLY valid SVG code. Start with <svg and end with </svg>.
        2. Canvas: viewBox="0 0 800 500".
        3. Style: White background, Indigo-600 strokes, Slate-400 lines, Indigo-50 fills.
        4. Content: Title, boxes, circles, arrows, labels.
      `;
      
      const response = await ai.models.generateContent({
        model: modelId,
        contents: {
          parts: [
            { inlineData: { mimeType: 'application/pdf', data: base64Data } },
            { text: prompt }
          ]
        }
      });
      const text = response.text || "";
      return text.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```html/g, '').replace(/```/g, '').trim();
    }

    const prompt = `
      Act as a smart revision engine.
      Source: Attached PDF Document.
      
      Task: Generate "${type}" notes from this document.
      Style: ${instruction}
      
      Format as clean Markdown.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: base64Data } },
          { text: prompt }
        ]
      }
    });
    return response.text || "Could not analyze PDF.";
  } catch (error) {
    console.error("Gemini PDF Error:", error);
    return "Error processing PDF. Please ensure the file is valid and text-readable.";
  }
};

export const generateQuestions = async (book: Book | null, topic: string, count: number, difficulty: string): Promise<string> => {
  try {
    const bookContext = book ? `Based on the book "${book.title}"` : "Based on general academic knowledge";
    const prompt = `
      ${bookContext}.
      Topic: "${topic}".
      Task: Generate ${count} ${difficulty} level multiple choice questions (MCQs).
      
      Format strictly as:
      1. Question Text
      A) Option
      B) Option
      C) Option
      D) Option
      Correct Answer: X
      Explanation: Short explanation.
      
      ... repeat for all questions.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "Could not generate questions.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating quiz.";
  }
};

export const generateExamPaper = async (examType: string, level: string, count: number = 30): Promise<any> => {
  try {
    const prompt = `
      Act as a Senior Exam Setter for ${examType}.
      Difficulty Level: ${level}.
      
      Create a realistic Mock Test with exactly ${count} Questions.
      
      Requirements based on Exam Type:
      - If JEE (Mains/Advanced): Include Physics, Chemistry, Maths questions.
      - If NEET: Include Biology (Zoology/Botany), Physics, Chemistry.
      - If UPSC/Govt: Include General Studies, History, Polity, Aptitude.
      - If CLAT: Legal Reasoning, Logic, English.
      - If GATE: Engineering Mathematics, Core Technical Subject.
      
      Output strictly in JSON format.
      The structure must include the subject/section for each question.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            examTitle: { type: Type.STRING },
            durationMinutes: { type: Type.NUMBER },
            sections: { type: Type.ARRAY, items: { type: Type.STRING } },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  section: { type: Type.STRING },
                  questionText: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctOptionIndex: { type: Type.INTEGER, description: "0 for A, 1 for B, etc." },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "section", "questionText", "options", "correctOptionIndex", "explanation"]
              }
            }
          },
          required: ["examTitle", "durationMinutes", "sections", "questions"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Exam Gen Error:", error);
    return null;
  }
};

export const generateFlashcards = async (topic: string, count: number = 8): Promise<{deepInsight: any, cards: any[]} | null> => {
  try {
    const prompt = `
      Act as an expert academic researcher and study coach.
      Topic: "${topic}".
      
      Task:
      1. Identify the SINGLE BEST authoritative book (the "Bible") for this specific topic.
      2. Extract a brief 1-sentence "Deep Insider" hook about this book.
      3. Create exactly ${count} active recall flashcards (Front/Back) covering the topic.
      
      Return JSON:
      {
        "deepInsight": {
          "bookTitle": "Name of the book",
          "author": "Author Name",
          "summary": "Brief hook (max 20 words)"
        },
        "cards": [
          { "front": "Question/Term", "back": "Answer/Definition" }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deepInsight: {
               type: Type.OBJECT,
               properties: {
                 bookTitle: { type: Type.STRING },
                 author: { type: Type.STRING },
                 summary: { type: Type.STRING }
               },
               required: ["bookTitle", "author", "summary"]
            },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING }
                },
                required: ["front", "back"]
              }
            }
          },
          required: ["deepInsight", "cards"]
        }
      }
    });

    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Gemini Flashcard Error:", error);
    return null;
  }
};

export const generateDeepBookDeepDive = async (topic: string, bookTitle: string): Promise<string> => {
  try {
    const prompt = `
      Act as a Professor specializing in "${topic}".
      Reference Book: "${bookTitle}" (The authoritative source).
      
      Task: Create a "Deep Insider" Executive Summary of the topic based strictly on this book's methodology.
      
      Required Output Format (Markdown):
      1. **Core Thesis**: What is the central argument or concept in the book regarding this topic?
      2. **Key Concepts**: 3-5 bullet points of the most critical mental models.
      3. **Essential Formulas/Laws**: List all mathematical formulas, chemical equations, or legal maxims relevant to the topic. Use clean text or simple LaTeX.
      4. **Visual Mental Models**: Describe 1-2 important graphs, diagrams, or charts found in this book that explain the topic. Describe axes, curves, and meaning.
      5. **Strategic Insight**: One "insider" tip for mastering this topic.
      
      Tone: High-density, academic, yet accessible.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "Could not generate deep dive.";
  } catch (error) {
     console.error("Gemini Deep Dive Error:", error);
     return "Failed to retrieve deep insights.";
  }
};

export const recommendLibraryBooks = async (course: string, reason: string): Promise<any[]> => {
  try {
    const inventoryString = JSON.stringify(MOCK_LIBRARY_INVENTORY);
    const prompt = `
      Act as an intelligent University Librarian.
      Context: A student is looking for physical books in our library.
      Student's Course/Stream: "${course}"
      Specific Reason for looking for a book: "${reason}"
      Available Library Inventory (JSON): ${inventoryString}
      Task: Select the top 3-5 books from the inventory that BEST match the student's need.
    `;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              matchReason: { type: Type.STRING },
              summary: { type: Type.STRING }
            },
            required: ["id", "matchReason", "summary"]
          }
        }
      }
    });
    const recommendations = JSON.parse(response.text || "[]");
    return recommendations.map((rec: any) => {
      const original = MOCK_LIBRARY_INVENTORY.find(b => b.id === rec.id);
      return { ...original, ...rec };
    });
  } catch (error) {
    return [];
  }
};

export const searchLibraryInventory = async (query: string): Promise<any[]> => {
  try {
    const inventoryString = JSON.stringify(MOCK_LIBRARY_INVENTORY);
    const prompt = `
      Act as an intelligent Library System Administrator.
      Context: A librarian or admin is searching the database using natural language.
      Query: "${query}"
      Available Inventory (JSON): ${inventoryString}
      Task: Identify books that match the semantic meaning of the query.
    `;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              matchReason: { type: Type.STRING }
            },
            required: ["id", "matchReason"]
          }
        }
      }
    });
    const results = JSON.parse(response.text || "[]");
    return results.map((res: any) => {
      const original = MOCK_LIBRARY_INVENTORY.find(b => b.id === res.id);
      return { ...original, ...res };
    });
  } catch (error) {
    return [];
  }
};

export const analyzeReadingHabits = async (userProfile: any, readHistory: string[], reservedBooks: string[]): Promise<any> => {
  try {
    const prompt = `
      Act as an AI Librarian Analyst.
      User Profile: ${JSON.stringify(userProfile)}
      Reading History (Books Read): ${JSON.stringify(readHistory)}
      Currently Reserved: ${JSON.stringify(reservedBooks)}
      Task: Analyze the user's "Reading DNA" and suggest next reads.
    `;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dna: {
              type: Type.OBJECT,
              properties: {
                 primaryInterest: { type: Type.STRING },
                 complexityLevel: { type: Type.STRING },
                 readingSpeed: { type: Type.STRING }
              }
            },
            insight: { type: Type.STRING },
            nextRecommendation: {
              type: Type.OBJECT,
              properties: {
                 title: { type: Type.STRING },
                 reason: { type: Type.STRING }
              }
            },
            habitScore: { type: Type.NUMBER }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return null;
  }
};

export const generateStudyVideo = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string | null> => {
  try {
    const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    let operation = await veoAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await veoAi.operations.getVideosOperation({operation: operation});
    }
    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (videoUri) {
        const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }
    return null;
  } catch (error: any) {
    const errString = error.toString();
    const errMsg = error.message || '';
    if (errString.includes('429') || errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        throw new Error("Quota exceeded for video generation.");
    }
    return null;
  }
};

export const generateBookMetadata = async (title: string): Promise<any> => {
  try {
    const prompt = `
      Act as an expert Librarian and Book Cataloger.
      Book Title: "${title}".
      
      Task: Generate metadata for this book to be added to a library inventory.
      
      Return JSON with:
      - author: Estimated author
      - category: Library category (e.g. Engineering, Fiction, History)
      - tags: 3-5 keywords
      - recommendedLevel: Beginner, Intermediate, or Advanced
      - description: Brief 1-sentence description.
      - pages: Estimated number of pages (number).
      - readTime: Estimated read time (string, e.g. "6h 30m").
    `;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            author: { type: Type.STRING },
            category: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedLevel: { type: Type.STRING },
            description: { type: Type.STRING },
            pages: { type: Type.NUMBER },
            readTime: { type: Type.STRING }
          },
          required: ["author", "category", "tags", "recommendedLevel", "description", "pages", "readTime"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return null;
  }
};

export const generateBattleChallenge = async (stream: string, difficulty: string): Promise<any> => {
  try {
    let prompt = '';
    const isCoding = stream === 'CS_CORE' || stream === 'AI_ML';
    const isCaseStudy = stream === 'DATA_SCIENCE';
    const isGeneral = stream === 'GOVT_EXAMS' || stream === 'JEE_NEET';

    if (isCoding) {
       prompt = `Act as a Technical Lead. Stream: "${stream}". Difficulty: "${difficulty}".
       Generate a specific coding problem (Python/Algorithm).
       
       Return JSON:
       {
         "title": "Problem Title",
         "description": "Full problem statement",
         "inputCase": "Example Input",
         "outputCase": "Example Output",
         "hints": ["Hint 1", "Hint 2"],
         "starterCode": "def solve():\n    # Write your code here\n    pass",
         "testCases": ["assert solve(1) == 2"]
       }`;
    } else if (isCaseStudy) {
       prompt = `Act as a Data Science Manager. Stream: "${stream}". Difficulty: "${difficulty}".
       Generate a Model Training / Case Study scenario.
       
       Return JSON:
       {
         "title": "Case Study Title",
         "description": "Scenario (e.g. Churn Prediction for Telecom). Describe the dataset and the goal.",
         "inputCase": "Dataset schema description",
         "outputCase": "Target metric (e.g. F1 Score > 0.8)",
         "hints": ["Suggested Algorithm", "Feature Engineering Tip"],
         "starterCode": "# Outline your approach (Model, Features, Validation)\n# 1. Load Data...\n# 2. Preprocess...",
         "testCases": ["Validation Strategy"]
       }`;
    } else {
       prompt = `Act as an Exam Setter for ${stream.replace('_', ' ')}. Difficulty: "${difficulty}". Generate a Logic/Conceptual Question. Return JSON.`;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            inputCase: { type: Type.STRING },
            outputCase: { type: Type.STRING },
            hints: { type: Type.ARRAY, items: { type: Type.STRING } },
            starterCode: { type: Type.STRING },
            testCases: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "description", "inputCase", "outputCase", "hints", "starterCode"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return null;
  }
};

export const evaluateBattleSubmission = async (challenge: string, userCode: string, stream: string): Promise<any> => {
  try {
    const prompt = `
      Act as a Code Reviewer / Examiner. 
      Problem: "${challenge}". 
      User Submission: "${userCode}". 
      Stream: ${stream}. 
      
      Task: Evaluate the submission. If it's code, simulate running it. If it's reasoning, check the logic.
      
      Return JSON:
      {
        "isCorrect": boolean,
        "score": number (0-100),
        "aiScore": number (benchmark, e.g. 95),
        "pointsEarned": number,
        "feedback": "Specific feedback on optimization, logic, or syntax.",
        "winner": "User" | "AI",
        "analysis": "Brief analysis",
        "metrics": {
           "timeEfficiency": "e.g. O(n)",
           "memoryUsage": "Low/Med/High",
           "codeQuality": "Clean/Messy"
        }
      }
    `;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            score: { type: Type.NUMBER },
            aiScore: { type: Type.NUMBER },
            pointsEarned: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            winner: { type: Type.STRING },
            analysis: { type: Type.STRING },
            metrics: {
                type: Type.OBJECT,
                properties: {
                    timeEfficiency: { type: Type.STRING },
                    memoryUsage: { type: Type.STRING },
                    codeQuality: { type: Type.STRING }
                }
            }
          },
          required: ["isCorrect", "score", "aiScore", "pointsEarned", "feedback", "winner", "analysis"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { isCorrect: false, score: 0, aiScore: 95, pointsEarned: 0, feedback: "Error.", winner: "AI" };
  }
};

export const generateDebate = async (entityA: string, entityB: string, topic: string): Promise<{speaker: string, text: string}[]> => {
  try {
    const prompt = `Act as a scriptwriter. Entity A: "${entityA}", Entity B: "${entityB}", Topic: "${topic}". Generate debate script (4-6 turns). Return JSON array.`;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { speaker: { type: Type.STRING }, text: { type: Type.STRING } },
            required: ["speaker", "text"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};

export const getAiCoaching = async (history: TestResult[], userQuery: string): Promise<string> => {
  try {
    const historyContext = JSON.stringify(history.slice(-5));
    const prompt = `Act as a Performance Coach. History: ${historyContext}. Query: "${userQuery}". Analyze and advise. Keep it short.`;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { text: { type: Type.STRING } } } },
    });
    const parsed = JSON.parse(response.text || "{}");
    return parsed.text || response.text || "Analysis failed.";
  } catch (error) {
    return "Analysis failed.";
  }
};

// ... (Researcher Functions) ...

export const searchResearchTrends = async (topic: string): Promise<SearchResult | null> => {
  try {
    const prompt = `
      Act as a Senior Research Scientist.
      Topic: "${topic}"
      
      Task: Perform a deep literature search using Google Search to find the latest academic papers (focus on last 1-3 years) and emerging research trends.
      
      Provide a comprehensive synthesis that:
      1. **State of the Art (SOTA)**: Summarize the current cutting-edge advancements.
      2. **Key Recent Papers**: List 3-5 specific recent papers or studies with their key findings.
      3. **Emerging Trends**: Identify where the field is heading next.
      4. **Open Questions**: What are the unresolved problems?
      
      Ensure the tone is academic and rigorous.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using pro for better search integration
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const synthesis = response.text || "No results found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = chunks
      .map((chunk: any) => {
        if (chunk.web) {
          return { title: chunk.web.title, uri: chunk.web.uri };
        }
        return null;
      })
      .filter((s: any) => s !== null) as GroundingSource[];

    return { synthesis, sources };
  } catch (error) {
    console.error("Search Error:", error);
    return null;
  }
};

export const getResearchConsensus = async (query: string): Promise<ConsensusResult | null> => {
    try {
        const prompt = `
          Analyze scientific consensus for: "${query}".
          Simulate an analysis of multiple research papers.
          
          Return JSON:
          {
            "consensusScore": number (0-100),
            "consensusLabel": "YES" | "NO" | "MIXED" | "INCONCLUSIVE",
            "summary": "Summary of findings",
            "papers": [
              { "id": "1", "title": "Paper Title", "authors": "Author et al.", "year": "2023", "journal": "Journal Name", "finding": "Key finding", "citationCount": 120 }
            ]
          }
        `;
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        consensusScore: { type: Type.NUMBER },
                        consensusLabel: { type: Type.STRING, enum: ["YES", "NO", "MIXED", "INCONCLUSIVE"] },
                        summary: { type: Type.STRING },
                        papers: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    authors: { type: Type.STRING },
                                    year: { type: Type.STRING },
                                    journal: { type: Type.STRING },
                                    finding: { type: Type.STRING },
                                    citationCount: { type: Type.NUMBER }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "null");
    } catch (e) { return null; }
};

export const generateLiteratureMatrix = async (topic: string): Promise<ComparisonMatrix | null> => {
    try {
        const prompt = `Create a literature review matrix for topic: "${topic}". Compare 4-5 key papers. Return JSON.`;
        const response2 = await ai.models.generateContent({
             model: modelId,
             contents: prompt + " Columns should include: Methodology, Sample Size, Key Finding.",
             config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                     type: Type.OBJECT,
                     properties: {
                         columns: { type: Type.ARRAY, items: { type: Type.STRING } },
                         rows: {
                             type: Type.ARRAY,
                             items: {
                                 type: Type.OBJECT,
                                 properties: {
                                     paperTitle: { type: Type.STRING },
                                     year: { type: Type.STRING },
                                     Methodology: { type: Type.STRING },
                                     "Sample Size": { type: Type.STRING },
                                     "Key Finding": { type: Type.STRING }
                                 },
                                 required: ["paperTitle", "year", "Methodology", "Sample Size", "Key Finding"]
                             }
                         }
                     }
                 }
             }
        });
        
        return JSON.parse(response2.text || "null");

    } catch (e) { return null; }
};

export const compareSpecificPapers = async (papers: string[]): Promise<ComparisonMatrix | null> => {
     try {
         const prompt = `Compare these specific papers: ${JSON.stringify(papers)}. Create a matrix. Columns: Methodology, Key Finding, Limitations. Return JSON.`;
         const response = await ai.models.generateContent({
             model: modelId,
             contents: prompt,
             config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                     type: Type.OBJECT,
                     properties: {
                         columns: { type: Type.ARRAY, items: { type: Type.STRING } },
                         rows: {
                             type: Type.ARRAY,
                             items: {
                                 type: Type.OBJECT,
                                 properties: {
                                     paperTitle: { type: Type.STRING },
                                     year: { type: Type.STRING },
                                     Methodology: { type: Type.STRING },
                                     "Key Finding": { type: Type.STRING },
                                     Limitations: { type: Type.STRING }
                                 }
                             }
                         }
                     }
                 }
             }
         });
         return JSON.parse(response.text || "null");
     } catch (e) { return null; }
};

export const generateDetailedComparison = async (paperA: string, paperB: string): Promise<DetailedComparison | null> => {
  try {
    const prompt = `
      Act as a Lead Research Analyst.
      Compare these two academic papers/topics side-by-side:
      1. "${paperA}"
      2. "${paperB}"
      
      Task:
      1. Extract concise details for each: Methodology, Key Findings, Limitations.
      2. Analyze the CRITICAL DIFFERENCES between them.
      
      Return JSON:
      {
        "papers": [
          { "title": "Title of Paper 1", "methodology": "Summary...", "findings": "Summary...", "limitations": "Summary..." },
          { "title": "Title of Paper 2", "methodology": "Summary...", "findings": "Summary...", "limitations": "Summary..." }
        ],
        "analysis": {
          "methodologyDiff": "Contrast the methodologies...",
          "findingsDiff": "Contrast the findings...",
          "limitationsDiff": "Contrast the limitations...",
          "synthesis": "High-level synthesis of how these papers relate."
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            papers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  methodology: { type: Type.STRING },
                  findings: { type: Type.STRING },
                  limitations: { type: Type.STRING }
                },
                required: ["title", "methodology", "findings", "limitations"]
              }
            },
            analysis: {
              type: Type.OBJECT,
              properties: {
                methodologyDiff: { type: Type.STRING },
                findingsDiff: { type: Type.STRING },
                limitationsDiff: { type: Type.STRING },
                synthesis: { type: Type.STRING }
              },
              required: ["methodologyDiff", "findingsDiff", "limitationsDiff", "synthesis"]
            }
          },
          required: ["papers", "analysis"]
        }
      }
    });
    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Comparison Error:", error);
    return null;
  }
};

export const generateLiteratureSummary = async (papers: string[]): Promise<LiteratureSummary[]> => {
    try {
        const prompt = `Summarize these papers: ${JSON.stringify(papers)}. Return JSON array.`;
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            inputIdentifier: { type: Type.STRING },
                            title: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
                            methodology: { type: Type.STRING },
                            impactScore: { type: Type.NUMBER }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) { return []; }
};

export const generateHypothesis = async (fieldA: string, fieldB: string): Promise<any> => {
    try {
        const prompt = `Generate a novel research hypothesis combining ${fieldA} and ${fieldB}. Return JSON.`;
        const response = await ai.models.generateContent({
             model: modelId,
             contents: prompt,
             config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                     type: Type.OBJECT,
                     properties: {
                         title: { type: Type.STRING },
                         hypothesis: { type: Type.STRING },
                         novelty: { type: Type.STRING },
                         methodology: { type: Type.STRING }
                     }
                 }
             }
        });
        return JSON.parse(response.text || "null");
    } catch (e) { return null; }
};

export const analyzePaperDraft = async (text: string): Promise<PeerReviewResult | null> => {
    try {
        const prompt = `Act as Reviewer #2. Analyze this abstract/draft. Return JSON.`;
        const response = await ai.models.generateContent({
             model: modelId,
             contents: { parts: [{ text: prompt }, { text }] },
             config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                     type: Type.OBJECT,
                     properties: {
                         overallScore: { type: Type.NUMBER },
                         decision: { type: Type.STRING, enum: ["ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REJECT"] },
                         strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                         weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                         suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                         clarityScore: { type: Type.NUMBER },
                         noveltyScore: { type: Type.NUMBER },
                         methodologyScore: { type: Type.NUMBER }
                     }
                 }
             }
        });
        return JSON.parse(response.text || "null");
    } catch (e) { return null; }
};

export const extractResearchData = async (text: string, fields: string): Promise<any[]> => {
    try {
        const prompt = `Extract the following fields: "${fields}" from the text. Return JSON array of objects.`;
        const response = await ai.models.generateContent({
             model: modelId,
             contents: { parts: [{ text: prompt }, { text }] },
             config: {
                 responseMimeType: "application/json"
             }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) { return []; }
};

export const generateGrantProposal = async (topic: string, amount: string): Promise<GrantProposal | null> => {
    try {
        const prompt = `Write a grant proposal for "${topic}" asking for ${amount}. Return JSON.`;
        const response = await ai.models.generateContent({
             model: modelId,
             contents: prompt,
             config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                     type: Type.OBJECT,
                     properties: {
                         title: { type: Type.STRING },
                         executiveSummary: { type: Type.STRING },
                         specificAims: { type: Type.ARRAY, items: { type: Type.STRING } },
                         impactStatement: { type: Type.STRING },
                         budgetJustification: { type: Type.STRING },
                         timeline: { type: Type.STRING }
                     }
                 }
             }
        });
        return JSON.parse(response.text || "null");
    } catch (e) { return null; }
};

export const generateMethodology = async (goal: string): Promise<MethodStep[]> => {
    try {
        const prompt = `Design a research methodology for: "${goal}". Return JSON array of steps.`;
        const response = await ai.models.generateContent({
             model: modelId,
             contents: prompt,
             config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                     type: Type.ARRAY,
                     items: {
                         type: Type.OBJECT,
                         properties: {
                             phase: { type: Type.STRING },
                             details: { type: Type.ARRAY, items: { type: Type.STRING } },
                             equipment: { type: Type.ARRAY, items: { type: Type.STRING } }
                         }
                     }
                 }
             }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) { return []; }
};

export const recommendJournals = async (abstract: string): Promise<JournalRecommendation[]> => {
    try {
        const prompt = `Recommend academic journals for this abstract. Return JSON.`;
        const response = await ai.models.generateContent({
             model: modelId,
             contents: { parts: [{ text: prompt }, { text: abstract }] },
             config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                     type: Type.ARRAY,
                     items: {
                         type: Type.OBJECT,
                         properties: {
                             name: { type: Type.STRING },
                             impactFactor: { type: Type.STRING },
                             matchScore: { type: Type.NUMBER },
                             reason: { type: Type.STRING },
                             reviewTime: { type: Type.STRING }
                         }
                     }
                 }
             }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) { return []; }
};

export const suggestStatistics = async (variables: string): Promise<StatAdvice | null> => {
    try {
        const prompt = `Suggest statistical test for: "${variables}". Return JSON.`;
        const response = await ai.models.generateContent({
             model: modelId,
             contents: prompt,
             config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                     type: Type.OBJECT,
                     properties: {
                         recommendedTest: { type: Type.STRING },
                         reason: { type: Type.STRING },
                         assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                         codeSnippet: { type: Type.STRING }
                     }
                 }
             }
        });
        return JSON.parse(response.text || "null");
    } catch (e) { return null; }
};

export const analyzeResearchTrends = async (topic: string): Promise<ResearchTrend[]> => {
    try {
        const prompt = `Analyze research trends for: "${topic}". Return JSON array.`;
        const response = await ai.models.generateContent({
             model: modelId,
             contents: prompt,
             config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                     type: Type.ARRAY,
                     items: {
                         type: Type.OBJECT,
                         properties: {
                             topic: { type: Type.STRING },
                             growthLabel: { type: Type.STRING, enum: ["Exploding", "Steady", "Declining"] },
                             growthPercent: { type: Type.NUMBER },
                             yearlyData: {
                                 type: Type.ARRAY,
                                 items: {
                                     type: Type.OBJECT,
                                     properties: {
                                         year: { type: Type.STRING },
                                         volume: { type: Type.NUMBER }
                                     }
                                 }
                             }
                         }
                     }
                 }
             }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) { return []; }
};

export const optimizeAbstractKeywords = async (abstract: string): Promise<PaperSEO | null> => {
    try {
        const prompt = `Optimize this abstract for SEO/Discovery. Return JSON.`;
        const response = await ai.models.generateContent({
             model: modelId,
             contents: { parts: [{ text: prompt }, { text: abstract }] },
             config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                     type: Type.OBJECT,
                     properties: {
                         discoverabilityScore: { type: Type.NUMBER },
                         missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                         strongKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                         titleSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                         abstractFeedback: { type: Type.STRING }
                     }
                 }
             }
        });
        return JSON.parse(response.text || "null");
    } catch (e) { return null; }
};

export const projectResearchImpact = async (stats: { papers: number, citations: number }): Promise<CareerProjection | null> => {
    try {
        const prompt = `Project research career impact based on: ${JSON.stringify(stats)}. Return JSON.`;
        const response = await ai.models.generateContent({
             model: modelId,
             contents: prompt,
             config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                     type: Type.OBJECT,
                     properties: {
                         currentHIndex: { type: Type.NUMBER },
                         projectedHIndex5Y: { type: Type.NUMBER },
                         citationVelocity: { type: Type.STRING },
                         strategy: { type: Type.STRING }
                     }
                 }
             }
        });
        return JSON.parse(response.text || "null");
    } catch (e) { return null; }
};

export const solveProfessionalProblem = async (problem: string): Promise<ProfessionalSolution | null> => {
  try {
    const prompt = `
      Act as a Senior Strategy Consultant.
      Problem: "${problem}".
      
      Task: Analyze the problem, provide a step-by-step strategic solution, and recommend resources (books).
      
      Return JSON.
    `;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            strategySteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            relevantBookIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            citations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["analysis", "strategySteps", "relevantBookIds", "citations"]
        }
      }
    });
    return JSON.parse(response.text || "null");
  } catch (error) {
    return null;
  }
};

// --- PROFESSIONAL FUNCTIONS ---

export const generateExecutiveBrief = async (topic: string, context: string): Promise<ExecutiveBrief | null> => {
  try {
    const prompt = `
      Act as a Chief of Staff for a Fortune 500 executive.
      Topic: "${topic}".
      Context: "${context}".
      
      Task: Create a high-impact BLUF (Bottom Line Up Front) brief.
      Focus on ROI, strategic value, and immediate actions.
      
      Return JSON.
    `;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bluf: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            roiEstimate: { type: Type.STRING }
          },
          required: ["bluf", "keyPoints", "actionItems", "roiEstimate"]
        }
      }
    });
    return JSON.parse(response.text || "null");
  } catch (error) {
    return null;
  }
};

export const generateDecisionMatrix = async (decisionContext: string, options: string[]): Promise<DecisionMatrix | null> => {
  try {
    const prompt = `
      Act as a Strategy Consultant.
      Decision Context: "${decisionContext}".
      Options to Compare: ${JSON.stringify(options)}.
      
      Task: Create a weighted decision matrix. Select 4-5 relevant criteria (e.g. Cost, Time, Risk, Scalability).
      Score each option from 1-10 on these criteria.
      
      Return JSON.
    `;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            criteria: { type: Type.ARRAY, items: { type: Type.STRING } },
            scores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  option: { type: Type.STRING },
                  scores: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                  total: { type: Type.NUMBER }
                }
              }
            },
            recommendation: { type: Type.STRING }
          },
          required: ["options", "criteria", "scores", "recommendation"]
        }
      }
    });
    return JSON.parse(response.text || "null");
  } catch (error) {
    return null;
  }
};

export const analyzeMarketTrends = async (industry: string): Promise<MarketTrend[]> => {
  try {
    const prompt = `
      Act as a Market Analyst.
      Industry: "${industry}".
      
      Task: Identify 4-5 key market trends. Classify their maturity (HYPE, ADOPT, MATURE, OBSOLETE).
      
      Return JSON Array.
    `;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              trendName: { type: Type.STRING },
              status: { type: Type.STRING, enum: ['HYPE', 'ADOPT', 'MATURE', 'OBSOLETE'] },
              description: { type: Type.STRING },
              sourceUrl: { type: Type.STRING }
            },
            required: ["trendName", "status", "description"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};

export const generateSkillGapPlan = async (userProfile: any): Promise<SkillGapPlan | null> => {
  try {
      const prompt = `
        Act as a Career Coach.
        Profile: ${JSON.stringify(userProfile)}.
        
        Task: Identify missing skills for their target role and suggest books from a standard library.
        
        Return JSON.
      `;
       const response = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                      booksToRead: { 
                          type: Type.ARRAY, 
                          items: {
                              type: Type.OBJECT,
                              properties: {
                                  title: { type: Type.STRING },
                                  focusChapter: { type: Type.STRING },
                                  reason: { type: Type.STRING }
                              }
                          } 
                      },
                      timelineWeeks: { type: Type.NUMBER }
                  }
              }
          }
      });
      return JSON.parse(response.text || "null");
  } catch (e) { return null; }
};
