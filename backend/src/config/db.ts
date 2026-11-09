import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  education: string;
  experience: string;
  target_role: string;
  target_company?: string;
  bio?: string;
}

export interface Resume {
  id: string;
  user_id: string;
  file_url: string;
  filename: string;
  extracted_text: string;
  skills_detected: string[];
  created_at: string;
}

export interface Skill {
  id: string;
  skill_name: string;
  category: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Interview {
  id: string;
  user_id: string;
  company: string;
  role: string;
  difficulty: 'Junior' | 'Mid-Level' | 'Senior' | 'Lead';
  type: 'Technical' | 'Behavioral' | 'System Design' | 'Custom';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  duration_minutes: number;
  current_question_index: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  interview_id: string;
  question_text: string;
  topic: string;
  difficulty: string;
  order_index: number;
  type: 'technical' | 'behavioral' | 'system_design' | 'coding';
  starter_code?: string;
  ideal_answer?: string;
}

export interface InterviewAnswer {
  id: string;
  interview_id: string;
  question_id: string;
  answer: string;
  score: number; // 0-100
  feedback: string;
  follow_up_question?: string;
  code_submitted?: string;
  created_at: string;
}

export interface Evaluation {
  id: string;
  interview_id: string;
  technical_score: number; // 0-100
  communication_score: number; // 0-100
  workmap_presentation: number; // 0-100
  workmap_opportunistic: number; // 0-100
  workmap_business_acumen: number; // 0-100
  workmap_closing_technique: number; // 0-100
  radar_professionalism: number; // 0-100
  radar_attitude: number; // 0-100
  radar_creativity: number; // 0-100
  radar_communication: number; // 0-100
  radar_leadership: number; // 0-100
  radar_teamwork: number; // 0-100
  feedback: string;
  created_at: string;
}

export interface InterviewReport {
  id: string;
  interview_id: string;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailed_summary: string;
  created_at: string;
}

export interface DatabaseSchema {
  users: User[];
  profiles: Profile[];
  resumes: Resume[];
  skills: Skill[];
  user_skills: UserSkill[];
  interviews: Interview[];
  questions: Question[];
  interview_answers: InterviewAnswer[];
  evaluations: Evaluation[];
  interview_reports: InterviewReport[];
}

const DB_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DB_DIR, 'database.json');

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private getInitialData(): DatabaseSchema {
    return {
      users: [],
      profiles: [],
      resumes: [],
      skills: [
        { id: 's-1', skill_name: 'React.js', category: 'Frontend' },
        { id: 's-2', skill_name: 'TypeScript', category: 'Languages' },
        { id: 's-3', skill_name: 'Node.js', category: 'Backend' },
        { id: 's-4', skill_name: 'System Design', category: 'Architecture' },
        { id: 's-5', skill_name: 'PostgreSQL', category: 'Databases' },
        { id: 's-6', skill_name: 'Algorithms & Data Structures', category: 'Core CS' },
        { id: 's-7', skill_name: 'RESTful APIs & GraphQL', category: 'Backend' },
        { id: 's-8', skill_name: 'Docker & Kubernetes', category: 'DevOps' },
        { id: 's-9', skill_name: 'Python', category: 'Languages' },
        { id: 's-10', skill_name: 'Redis', category: 'Databases' },
        { id: 's-11', skill_name: 'WebSockets', category: 'Networking' },
        { id: 's-12', skill_name: 'Behavioral & Leadership', category: 'Soft Skills' },
      ],
      user_skills: [],
      interviews: [],
      questions: [],
      interview_answers: [],
      evaluations: [],
      interview_reports: [],
    };
  }

  private loadData(): DatabaseSchema {
    this.ensureDirectory();
    if (!fs.existsSync(DB_FILE)) {
      const initial = this.getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content) as DatabaseSchema;
    } catch {
      const initial = this.getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
  }

  public save() {
    this.ensureDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public get db(): DatabaseSchema {
    return this.data;
  }
}

export const dbManager = new DatabaseManager();
export const db = dbManager.db;
