import { dbManager, User, Profile, Skill, UserSkill } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = dbManager.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async findById(id: string): Promise<User | null> {
    const user = dbManager.db.users.find((u) => u.id === id);
    return user || null;
  }

  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const now = new Date().toISOString();
    const newUser: User = {
      id: `user-${uuidv4().substring(0, 8)}`,
      ...userData,
      created_at: now,
      updated_at: now,
    };
    dbManager.db.users.push(newUser);

    // Also auto-create default empty profile
    const newProfile: Profile = {
      id: `profile-${uuidv4().substring(0, 8)}`,
      user_id: newUser.id,
      education: '',
      experience: '',
      target_role: 'Full Stack Engineer',
      target_company: 'Tech Company',
      bio: '',
    };
    dbManager.db.profiles.push(newProfile);

    dbManager.save();
    return newUser;
  }

  async getProfile(userId: string): Promise<{ profile: Profile | null; skills: (Skill & { proficiency: string })[] }> {
    const profile = dbManager.db.profiles.find((p) => p.user_id === userId) || null;
    const userSkills = dbManager.db.user_skills.filter((us) => us.user_id === userId);
    
    const skills = userSkills.map((us) => {
      const skill = dbManager.db.skills.find((s) => s.id === us.skill_id);
      return {
        id: us.skill_id,
        skill_name: skill ? skill.skill_name : 'Custom Skill',
        category: skill ? skill.category : 'General',
        proficiency: us.proficiency,
      };
    });

    return { profile, skills };
  }

  async updateProfile(userId: string, data: Partial<Profile>, skillsList?: { skill_name: string; proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' }[]): Promise<Profile> {
    let profile = dbManager.db.profiles.find((p) => p.user_id === userId);
    if (!profile) {
      profile = {
        id: `profile-${uuidv4().substring(0, 8)}`,
        user_id: userId,
        education: data.education || '',
        experience: data.experience || '',
        target_role: data.target_role || 'Full Stack Engineer',
        target_company: data.target_company || '',
        bio: data.bio || '',
      };
      dbManager.db.profiles.push(profile);
    } else {
      Object.assign(profile, data);
    }

    if (skillsList && Array.isArray(skillsList)) {
      // Clear existing user skills
      dbManager.db.user_skills = dbManager.db.user_skills.filter((us) => us.user_id !== userId);

      for (const item of skillsList) {
        let skill = dbManager.db.skills.find((s) => s.skill_name.toLowerCase() === item.skill_name.toLowerCase());
        if (!skill) {
          skill = {
            id: `s-${uuidv4().substring(0, 8)}`,
            skill_name: item.skill_name,
            category: 'Technical',
          };
          dbManager.db.skills.push(skill);
        }

        dbManager.db.user_skills.push({
          id: `us-${uuidv4().substring(0, 8)}`,
          user_id: userId,
          skill_id: skill.id,
          proficiency: item.proficiency || 'Intermediate',
        });
      }
    }

    dbManager.save();
    return profile;
  }

  async getAllSkills(): Promise<Skill[]> {
    return dbManager.db.skills;
  }
}

export const userRepository = new UserRepository();

