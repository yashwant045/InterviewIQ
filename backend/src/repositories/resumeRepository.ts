import { dbManager, Resume } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export class ResumeRepository {
  async findByUserId(userId: string): Promise<Resume | null> {
    const resumes = dbManager.db.resumes.filter((r) => r.user_id === userId);
    return resumes.length > 0 ? resumes[resumes.length - 1] : null;
  }

  async create(data: {
    user_id: string;
    filename: string;
    file_url: string;
    extracted_text: string;
    skills_detected: string[];
  }): Promise<Resume> {
    const newResume: Resume = {
      id: `resume-${uuidv4().substring(0, 8)}`,
      user_id: data.user_id,
      filename: data.filename,
      file_url: data.file_url,
      extracted_text: data.extracted_text,
      skills_detected: data.skills_detected,
      created_at: new Date().toISOString(),
    };
    dbManager.db.resumes.push(newResume);
    dbManager.save();
    return newResume;
  }
}

export const resumeRepository = new ResumeRepository();

