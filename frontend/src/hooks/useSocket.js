import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket(interviewId, userName) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);

  useEffect(() => {
    if (!interviewId) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_interview', { interviewId, userName });
    });

    socket.on('receive_chat', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('candidate_speaking_update', ({ isSpeaking }) => {
      setIsCandidateSpeaking(isSpeaking);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [interviewId, userName]);

  const sendChatMessage = (message) => {
    if (socketRef.current && message.trim()) {
      socketRef.current.emit('send_chat', {
        interviewId,
        sender: userName || 'Candidate',
        message: message.trim(),
      });
    }
  };

  const emitSpeaking = (isSpeaking) => {
    if (socketRef.current) {
      socketRef.current.emit('candidate_speaking', {
        interviewId,
        isSpeaking,
      });
    }
  };

  return {
    connected,
    messages,
    sendChatMessage,
    emitSpeaking,
    isCandidateSpeaking,
    isInterviewerSpeaking,
  };
}

