import fs from 'fs';
import path from 'path';
// pdf-parse commonjs import
const pdfParse = require('pdf-parse');
import { resumeRepository } from '../repositories/resumeRepository';
import { userRepository } from '../repositories/userRepository';

const KNOWN_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'Ruby', 'PHP',
  'React', 'React.js', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Redux', 'Tailwind CSS',
  'Node.js', 'Express', 'NestJS', 'FastAPI', 'Django', 'Spring Boot', 'GraphQL', 'REST API',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB', 'SQLite',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD', 'GitHub Actions', 'Terraform',
  'System Design', 'Microservices', 'Distributed Systems', 'WebSockets', 'Kafka', 'RabbitMQ',
  'Algorithms', 'Data Structures', 'Testing', 'Jest', 'Git', 'Agile', 'Scrum'
];

export class ResumeService {
  async processResumeUpload(userId: string, file: Express.Multer.File) {
    let extractedText = '';
    const ext = path.extname(file.originalname).toLowerCase();

    try {
      if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(file.path);
        const parsed = await pdfParse(dataBuffer);
        extractedText = parsed.text || '';
      } else {
        extractedText = fs.readFileSync(file.path, 'utf-8');
      }
    } catch (err: any) {
      console.warn('Text extraction warning:', err.message);
      extractedText = `Extracted from ${file.originalname}`;
    }

    // Detect skills
    const detectedSkills: string[] = [];
    const lowerText = extractedText.toLowerCase();

    KNOWN_SKILLS.forEach((skill) => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowerText) || lowerText.includes(skill.toLowerCase())) {
        if (!detectedSkills.includes(skill)) {
          detectedSkills.push(skill);
        }
      }
    });

    // Save resume record
    const resume = await resumeRepository.create({
      user_id: userId,
      filename: file.originalname,
      file_url: `/uploads/resumes/${path.basename(file.path)}`,
      extracted_text: extractedText.substring(0, 10000),
      skills_detected: detectedSkills,
    });

    // Auto-sync discovered skills into user profile if user has few skills
    if (detectedSkills.length > 0) {
      const skillsToAdd = detectedSkills.slice(0, 8).map((s) => ({
        skill_name: s,
        proficiency: 'Advanced' as const,
      }));
      await userRepository.updateProfile(userId, {}, skillsToAdd);
    }

    return {
      resumeId: resume.id,
      filename: resume.filename,
      skillsDetected: detectedSkills,
      preview: extractedText.substring(0, 300) + '...',
    };
  }

  async getLatestResume(userId: string) {
    return resumeRepository.findByUserId(userId);
  }
}

export const resumeService = new ResumeService();
