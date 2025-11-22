import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { environment } from '../../../environments/environment';
import {
  StudySection,
  Slide,
  Flashcard,
  QuizQuestion,
  InterviewQuestion,
  InterviewCategory,
} from '../models/study-plan.model';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    this.genAI = new GoogleGenerativeAI(environment.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    // this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  }

  private async generateJson<T>(prompt: string): Promise<T> {
    const result = await this.model.generateContent(
      prompt + ' \n\nReturn ONLY valid JSON without any markdown formatting or backticks.'
    );
    const response = await result.response;
    const text = response.text();
    // Clean up markdown code blocks if present
    const cleanText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleanText) as T;
  }

  generateStudyPlan(resume: string, jobDescription: string): Observable<StudySection[]> {
    const prompt = `
      You are an expert study planner.
      Based on the following Resume and Job Description, create a comprehensive study plan.
      
      Resume:
      ${resume}
      
      Job Description:
      ${jobDescription}
      
      Requirements:
      1. Identify the key gaps between the resume and the job description.
      2. Create a list of study sections to cover these gaps and essential topics.
      3. IMPORTANT: Each section must focus on ONE specific topic or concept. Do not bundle multiple unrelated topics into one section.
      4. Ensure the plan is comprehensive and covers all necessary areas for the interview.
      
      Output strictly valid JSON in the following format:
      [
        {
          "id": "unique-string-id",
          "title": "Section Title (Specific Topic)",
          "goals": "Goal description",
          "requiredSkills": ["Skill 1", "Skill 2"],
          "tasks": ["Task 1", "Task 2"],
          "estimatedHours": 5,
          "resources": ["URL 1"],
          "notes": "Notes"
        }
      ]
    `;
    return from(this.generateJson<StudySection[]>(prompt));
  }

  enhanceSection(section: StudySection): Observable<StudySection> {
    const prompt = `
      Enhance the following study section with more specific details, better resources, and clearer goals.
      Keep the same structure but improve the content.
      
      Current Section: ${JSON.stringify(section)}
      
      Return the enhanced section as a single JSON object.
    `;
    return from(this.generateJson<StudySection>(prompt));
  }
  generateSubsections(section: StudySection): Observable<any[]> {
    const prompt = `
      Break down this study section into detailed subsections.
      
      Section Details:
      Title: "${section.title}"
      Goals: "${section.goals}"
      Tasks: "${section.tasks.join(', ')}"
      
      Return a JSON array of objects with this structure:
      [
        {
          "title": "Subsection Title",
          "content": "Detailed explanation and learning content for this subsection. Should be comprehensive."
        }
      ]
      Generate at least 3-5 subsections that cover the entire scope of the section.
    `;
    return from(this.generateJson<any[]>(prompt));
  }

  generateSlides(section: StudySection, subsectionTitle?: string): Observable<Slide[]> {
    let context = `
      Section Details:
      Title: "${section.title}"
      Goals: "${section.goals}"
      Tasks: "${section.tasks.join(', ')}"
    `;

    if (subsectionTitle) {
      context += `\nFocus specifically on the subsection: "${subsectionTitle}"`;
    }

    const prompt = `
      Create detailed educational slides.
      ${context}
      
      Return  a JSON array of objects with this structure:
      [
        {
          "title": "Slide Title",
          "bulletPoints": ["Point 1", "Point 2"],
          "content": "Detailed speaker notes or full explanation for this slide.",
          "subsectionTitle": "${subsectionTitle || ''}"
        }
      ]
      Generate at least ${subsectionTitle ? '3' : '5'} slides.
    `;
    return from(this.generateJson<Slide[]>(prompt));
  }

  generateFlashcards(section: StudySection): Observable<Flashcard[]> {
    const prompt = `
      Generate Q/A flashcards for a study section.
      
      Section Details:
      Title: "${section.title}"
      Goals: "${section.goals}"
      Tasks: "${section.tasks.join(', ')}"
      
      Return a JSON array of objects with this structure:
      [
        {
          "question": "Question text",
          "answer": "Answer text"
        }
      ]
      Generate at least 10 flashcards that test understanding of the section's concepts.
    `;
    return from(this.generateJson<Flashcard[]>(prompt));
  }

  generateQuiz(section: StudySection): Observable<QuizQuestion[]> {
    const prompt = `
      Generate a multiple-choice quiz for a study section.
      
      Section Details:
      Title: "${section.title}"
      Goals: "${section.goals}"
      Tasks: "${section.tasks.join(', ')}"
      
      Return a JSON array of objects with this structure:
      [
        {
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswerIndex": number (0-3)
        }
      ]
      Generate at least 5 challenging questions based on the section content.
    `;
    return from(this.generateJson<QuizQuestion[]>(prompt));
  }

  generateInterviewQuestions(
    resume: string,
    jobDescription: string,
    category?: InterviewCategory
  ): Observable<InterviewQuestion[]> {
    let prompt = `
      You are an expert technical interviewer.
      Based on the following Resume and Job Description, generate a comprehensive list of interview questions with ideal answers.
      
      Resume:
      ${resume}
      
      Job Description:
      ${jobDescription}
    `;

    if (category) {
      prompt += `
        Requirements:
        1. Generate 5 questions SPECIFICALLY for the '${category}' category.
        ${
          category === 'Technical'
            ? 'Focus on specific skills, languages, and frameworks mentioned in the JD and Resume.'
            : ''
        }
        ${
          category === 'System Design'
            ? 'Focus on architectural concepts relevant to the role level.'
            : ''
        }
        ${
          category === 'Behavioral'
            ? "Focus on soft skills, conflict resolution, and past experiences. MUST be tailored to the user's resume."
            : ''
        }
        
        IMPORTANT - Answer Formatting:
        - Structure answers in well-organized paragraphs
        - Use double line breaks (\\n\\n) to separate major points or paragraphs
        - Use single line breaks (\\n) within paragraphs for readability
        - For technical answers, break down complex concepts into digestible chunks
        - Include specific examples or step-by-step explanations where relevant
        - Aim for 3-5 paragraphs per answer for comprehensive coverage
        
        Output strictly valid JSON in the following format:
        [
          { "question": "...", "answer": "..." }
        ]
      `;
    } else {
      prompt += `
        Requirements:
        1. Generate questions for THREE categories: 'Technical', 'System Design', and 'Behavioral'.
        2. Technical: Focus on specific skills, languages, and frameworks mentioned in the JD and Resume.
        3. System Design: Focus on architectural concepts relevant to the role level.
        4. Behavioral: Focus on soft skills, conflict resolution, and past experiences. MUST be tailored to the user's resume.
        
        IMPORTANT - Answer Formatting:
        - Structure answers in well-organized paragraphs
        - Use double line breaks (\\n\\n) to separate major points or paragraphs
        - Use single line breaks (\\n) within paragraphs for readability
       - For technical answers, break down complex concepts into digestible chunks
        - Include specific examples or step-by-step explanations where relevant
        - Aim for 3-5 paragraphs per answer for comprehensive coverage
        
        Output strictly valid JSON in the following format:
        {
          "technical": [
            { "question": "...", "answer": "..." }
          ],
          "systemDesign": [
            { "question": "...", "answer": "..." }
          ],
          "behavioral": [
            { "question": "...", "answer": "..." }
          ]
        }
        Generate at least 3 questions for EACH category.
      `;
    }

    if (category) {
      return from(this.generateJson<any[]>(prompt)).pipe(
        map((result) => {
          return result.map((q) => ({ ...q, category }));
        })
      );
    } else {
      return from(this.generateJson<any>(prompt)).pipe(
        map((result) => {
          const questions: InterviewQuestion[] = [];

          if (result.technical) {
            result.technical.forEach((q: any) => questions.push({ ...q, category: 'Technical' }));
          }
          if (result.systemDesign) {
            result.systemDesign.forEach((q: any) =>
              questions.push({ ...q, category: 'System Design' })
            );
          }
          if (result.behavioral) {
            result.behavioral.forEach((q: any) => questions.push({ ...q, category: 'Behavioral' }));
          }

          return questions;
        })
      );
    }
  }
}
