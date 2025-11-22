export interface StudyPlan {
  id?: number;
  resume: string;
  jobDescription: string;
  sections: StudySection[];
  interviewQuestions?: InterviewQuestion[];
  createdAt: Date;
}

export type InterviewCategory = 'Technical' | 'System Design' | 'Behavioral';

export interface InterviewQuestion {
  question: string;
  answer: string;
  category: InterviewCategory;
}

export interface StudySection {
  id: string; // UUID or unique string to link materials
  title: string;
  goals: string;
  requiredSkills: string[];
  tasks: string[];
  estimatedHours: number;
  resources: string[];
  notes?: string;
}

export interface Subsection {
  title: string;
  content: string; // Detailed explanation/content for this subsection
}

export interface SectionMaterials {
  id?: number;
  sectionId: string;
  subsections?: Subsection[]; // List of subsections for this section
  slides?: Slide[]; // General slides (legacy)
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
  versionHistory?: SectionVersion[];
}

export interface Slide {
  title: string;
  bulletPoints: string[];
  content?: string; // Detailed content for the slide
  subsectionTitle?: string; // Link to a specific subsection
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface SectionVersion {
  timestamp: Date;
  content: StudySection;
}
