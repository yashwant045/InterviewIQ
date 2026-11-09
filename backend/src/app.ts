import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { ENV } from './config/env';
import { errorHandler } from './middleware/errorMiddleware';

// Route imports
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import resumeRoutes from './routes/resumeRoutes';
import interviewRoutes from './routes/interviewRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploads
app.use('/uploads', express.static(ENV.UPLOAD_DIR));

// Healthcheck
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'InterviewIQ Backend',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.IO Real-Time Interview Hub
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_interview', ({ interviewId, userName }) => {
    socket.join(interviewId);
    console.log(`[Socket.IO] ${userName || 'Candidate'} joined interview room: ${interviewId}`);
    socket.to(interviewId).emit('participant_joined', {
      socketId: socket.id,
      userName: userName || 'Candidate',
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on('candidate_speaking', ({ interviewId, isSpeaking, volume }) => {
    socket.to(interviewId).emit('candidate_speaking_update', { isSpeaking, volume });
  });

  socket.on('live_transcription', ({ interviewId, text, isFinal }) => {
    socket.to(interviewId).emit('transcription_stream', { text, isFinal, sender: 'candidate' });
  });

  socket.on('send_chat', ({ interviewId, sender, message }) => {
    io.in(interviewId).emit('receive_chat', {
      id: `chat-${Date.now()}`,
      sender,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Global Error Handler
app.use(errorHandler);

// Start server if run directly
if (process.env.NODE_ENV !== 'test') {
  server.listen(ENV.PORT, () => {
    console.log(`=========================================`);
    console.log(`InterviewIQ Backend running on port ${ENV.PORT}`);
    console.log(`Health check: http://localhost:${ENV.PORT}/health`);
    console.log(`API Base: http://localhost:${ENV.PORT}/api`);
    console.log(`=========================================`);
  });
}

export { app, server, io };

