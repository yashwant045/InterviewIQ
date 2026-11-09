import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ENV } from '../config/env';

const resumeStorageDir = path.join(ENV.UPLOAD_DIR, 'resumes');
if (!fs.existsSync(resumeStorageDir)) {
  fs.mkdirSync(resumeStorageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, resumeStorageDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitized}`);
  },
});

export const resumeUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.docx' || ext === '.txt') {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf, .docx, and .txt files are supported'));
    }
  },
});

