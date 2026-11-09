import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/userRepository';
import { generateToken } from '../utils/jwt';

export class AuthService {
  async register(data: { name: string; email: string; password: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password_hash,
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }
    const profileData = await userRepository.getProfile(userId);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      ...profileData,
    };
  }

  async updateProfile(userId: string, body: any) {
    const { skills, ...profileFields } = body;
    const updated = await userRepository.updateProfile(userId, profileFields, skills);
    return updated;
  }
}

export const authService = new AuthService();

