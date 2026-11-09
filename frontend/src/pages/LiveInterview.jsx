import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewService } from '../services/interviewService';
import { useSpeech } from '../hooks/useSpeech';
import { useSocket } from '../hooks/useSocket';
import RadarScore from '../components/RadarScore';
import WorkmapBars from '../components/WorkmapBars';
import AudioVisualizer from '../components/AudioVisualizer';
import CodeEditor from '../components/CodeEditor';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Send,
  MessageSquare,
  Users,
  ChevronLeft,
  Sparkles,
  Code,
  Volume2,
  VolumeX,
  Play,
  CheckCircle,
  HelpCircle,
  Share2,
  RefreshCw,
} from 'lucide-react';

export default function LiveInterview() {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [codeAnswer, setCodeAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('scores'); // Default to live scores for instant visibility
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  // Media Controls
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // Dynamic live scores
  const [radarScores, setRadarScores] = useState({
    professionalism: 80,
    attitude: 78,
    creativity: 82,
    communication: 85,
    leadership: 75,
    teamwork: 80,
  });

  const [workmapScores, setWorkmapScores] = useState({
    presentation: 90,
    opportunistic: 60,
    businessAcumen: 85,
    closingTechnique: 40,
  });

  const [videoScore, setVideoScore] = useState(80);
  const [workmapScoreVal, setWorkmapScoreVal] = useState(75);

  // Subtitle text
  const [subtitleText, setSubtitleText] = useState(
    'Welcome! Initializing AI Interview session...'
  );

  // Webcam stream ref
  const videoRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Speech Hooks (Pure Voice Studio)
  const {
    isListening,
    transcript,
    interimTranscript,
    fullTranscript,
    clearTranscript,
    isSpeaking: isTTSActive,
    micVolume,
    micPermission,
    errorMessage,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  } = useSpeech();

  // Socket.IO hook
  const { connected, messages, sendChatMessage, emitSpeaking } = useSocket(
    interviewId,
    user?.name || 'Candidate'
  );

  // Sync speaking status to socket
  useEffect(() => {
    emitSpeaking(isListening && micVolume > 5);
  }, [isListening, micVolume]);

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Initialize interview session and auto-prompt interviewer voice
  useEffect(() => {
    async function loadInterviewSession() {
      try {
        const startData = await interviewService.startInterview(interviewId);
        setInterview(startData.interview);
        setCurrentQuestion(startData.currentQuestion);
        setQuestionIndex(startData.interview.current_question_index || 0);
        setTotalQuestions(startData.totalQuestions || 3);

        if (startData.currentQuestion?.starter_code) {
          setCodeAnswer(startData.currentQuestion.starter_code);
          setShowCodeEditor(true);
        }

        const promptText = `Welcome ${user?.name || 'Candidate'}! I am your AI interviewer. Let's begin: ${
          startData.currentQuestion?.question_text || 'Please introduce yourself.'
        }`;
        setSubtitleText(promptText);

        if (isSoundOn) {
          speakText(promptText, () => {
            // When AI finishes reading question, auto-activate candidate mic
            startListening();
          });
        } else {
          startListening();
        }
      } catch (err) {
        console.error('Failed to start interview:', err);
      }
    }
    loadInterviewSession();
  }, [interviewId]);

  // Setup user local webcam preview and microphone hardware stream
  useEffect(() => {
    async function setupCamera() {
      if (isVideoOn && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch {
          // Fallback if camera without audio
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) videoRef.current.srcObject = stream;
          } catch {}
        }
      } else if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isVideoOn]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Spoken Answer Submission
  const handleSubmitAnswer = async () => {
    const spokenAnswer = fullTranscript.trim();
    if (!spokenAnswer && !codeAnswer.trim()) {
      alert('Please speak into the microphone to answer before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      stopListening();
      emitSpeaking(false);

      const result = await interviewService.submitAnswer(interviewId, {
        question_id: currentQuestion?.id,
        answer: spokenAnswer || 'Spoken answer submitted.',
        code_submitted: codeAnswer || undefined,
      });

      // Update feedback & scores in real time
      setLastFeedback(result.evaluation);
      if (result.evaluation?.radar_adjustments) {
        setRadarScores(result.evaluation.radar_adjustments);
      }
      if (result.evaluation?.workmap_scores) {
        setWorkmapScores(result.evaluation.workmap_scores);
        if (typeof result.evaluation.workmap_scores.presentation === 'number') {
          setWorkmapScoreVal(Math.round(result.evaluation.workmap_scores.presentation));
        }
      }
      if (result.evaluation?.score) {
        setVideoScore(Math.round(result.evaluation.score));
      }

      // If finished, navigate to report
      if (result.isCompleted) {
        setSubtitleText(
          'Interview completed! Synthesizing your performance evaluations and full report...'
        );
        speakText('Great job! That concludes our interview session. Preparing your report now.', () => {
          navigate(`/report/${interviewId}`);
        });
      } else {
        // Clear previous spoken transcript for next question
        clearTranscript();
        setCurrentQuestion(result.nextQuestion);
        setQuestionIndex(result.nextQuestionIndex);

        const nextText = result.evaluation?.follow_up_question
          ? `Follow up: ${result.evaluation.follow_up_question}`
          : `Next Question: ${result.nextQuestion?.question_text}`;

        setSubtitleText(nextText);

        if (isSoundOn) {
          speakText(nextText, () => {
            // Auto start listening for next answer
            startListening();
          });
        } else {
          startListening();
        }

        if (result.nextQuestion?.starter_code) {
          setCodeAnswer(result.nextQuestion.starter_code);
          setShowCodeEditor(true);
        } else {
          setShowCodeEditor(false);
        }
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      alert('Failed to submit answer: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndCall = () => {
    stopSpeaking();
    stopListening();
    if (confirm('Are you sure you want to conclude this interview session?')) {
      navigate(`/report/${interviewId}`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-[#08090e] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Top Header Bar */}
      <div className="h-16 px-6 bg-[#0d0f17] border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition"
            title="Return to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-bold text-white">
                Interview for {interview?.role || 'Senior Full Stack Engineer'}
              </h2>
              <span className="text-slate-500">|</span>
              <span className="text-xs text-purple-400 font-medium">
                {interview?.company || 'Google'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Live ({formatTime(callDuration)})
              </span>
              <span>• Question {questionIndex + 1} of {totalQuestions}</span>
            </div>
          </div>
        </div>

        {/* Top Right Candidate info & Gauges */}
        <div className="flex items-center gap-6">
          {/* Radial Gauge 1: AI Video Score */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="#252b3d" strokeWidth="3" fill="none" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#a855f7"
                  strokeWidth="3"
                  strokeDasharray="100"
                  strokeDashoffset={100 - videoScore}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-white">{videoScore}%</span>
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-medium">AI Video Score</div>
              <div className="text-[11px] text-purple-300 font-semibold">Active</div>
            </div>
          </div>

          {/* Radial Gauge 2: Workmap Score */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="#252b3d" strokeWidth="3" fill="none" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray="100"
                  strokeDashoffset={100 - workmapScoreVal}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-white">{workmapScoreVal}%</span>
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-medium">Workmap Score</div>
              <div className="text-[11px] text-amber-300 font-semibold">Tracked</div>
            </div>
          </div>

          {/* Candidate Profile Avatar */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'YA'}
            </div>
            <span className="hidden md:inline text-xs font-medium text-slate-300">
              {user?.name || 'Yashwant'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Video Stage (Left) & Real-Time Intelligence HUD (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Video Stage & Live Controls */}
        <div className="flex-1 flex flex-col bg-[#06070a] p-4 relative overflow-hidden">
          {/* Main Video Tile: AI Interviewer */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#131726] to-[#0a0d16] border border-slate-800/80 flex items-center justify-center shadow-inner">
            {/* Interviewer Visual / Realistic Avatar */}
            <div className="relative flex flex-col items-center">
              <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-full p-1 bg-gradient-to-tr from-purple-600 via-violet-500 to-pink-500 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80"
                  alt="AI Interviewer"
                  className="w-full h-full rounded-full object-cover"
                />
                {isTTSActive && (
                  <span className="absolute inset-0 rounded-full border-4 border-purple-400 animate-ping opacity-75" />
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isTTSActive ? 'bg-purple-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                <span className="text-xs font-semibold text-white">
                  Alex (AI Technical Interviewer)
                </span>
                <AudioVisualizer isSpeaking={isTTSActive} />
              </div>
            </div>

            {/* Candidate Webcam Floating Picture-in-Picture */}
            <div className="absolute top-4 right-4 w-36 h-28 md:w-44 md:h-32 rounded-xl overflow-hidden bg-slate-900/90 border-2 border-purple-500/40 shadow-2xl backdrop-blur flex items-center justify-center group">
              {isVideoOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-500 text-xs gap-1">
                  <VideoOff className="w-5 h-5" />
                  <span>Camera Off</span>
                </div>
              )}

              <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between text-[10px] text-white bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur">
                <span className="truncate">{user?.name || 'You'}</span>
                <span className="flex items-center gap-1">
                  {isListening ? (
                    <Mic className="w-3 h-3 text-rose-400 animate-pulse" />
                  ) : (
                    <MicOff className="w-3 h-3 text-slate-400" />
                  )}
                </span>
              </div>
            </div>

            {/* Subtitle Banner Overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-[#0d101d]/90 backdrop-blur border border-purple-500/30 rounded-xl p-3.5 shadow-xl text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Conversation now:</span>
              </div>
              <p className="text-white text-xs md:text-sm leading-relaxed font-medium">
                {subtitleText}
              </p>
            </div>
          </div>

          {/* Optional Code Editor Drawer */}
          {showCodeEditor && (
            <div className="mt-3 h-48">
              <CodeEditor
                initialCode={currentQuestion?.starter_code || codeAnswer}
                onCodeChange={setCodeAnswer}
              />
            </div>
          )}

          {/* PURE VOICE RESPONSE STUDIO (NO TYPING TEXTAREA) */}
          <div className="mt-3 bg-[#0d0f17] border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
            {/* Top row: Status, Microphone Volume Visualizer */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isListening ? 'bg-rose-500 animate-ping' : 'bg-slate-600'
                  }`}
                />
                <span className="font-semibold text-white">
                  {isListening ? 'Microphone Active • Listening to your answer...' : 'Microphone Ready'}
                </span>
                {isListening && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <AudioVisualizer isSpeaking={micVolume > 5} color="bg-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      {micVolume}% vol
                    </span>
                  </div>
                )}
              </div>

              {currentQuestion?.type === 'coding' && (
                <button
                  onClick={() => setShowCodeEditor(!showCodeEditor)}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded transition ${
                    showCodeEditor
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>{showCodeEditor ? 'Hide Code Editor' : 'Open Code Editor'}</span>
                </button>
              )}
            </div>

            {/* Real-Time Spoken Transcription Box */}
            <div className="min-h-[75px] bg-[#07080d] border border-slate-800/80 rounded-xl p-3 text-xs flex flex-col justify-between shadow-inner">
              <div className="text-slate-100 leading-relaxed font-sans">
                {fullTranscript ? (
                  <span>
                    <span className="text-white font-medium">{transcript}</span>{' '}
                    <span className="text-purple-400 italic">{interimTranscript}</span>
                  </span>
                ) : (
                  <span className="text-slate-500 italic flex items-center gap-2">
                    <Mic className="w-4 h-4 text-purple-400 animate-pulse" />
                    {isListening
                      ? 'Speak clearly into your microphone — your voice is transcribed live here in real-time...'
                      : 'Click "Start Speaking" or use the microphone button to begin speaking your answer.'}
                  </span>
                )}
              </div>

              {errorMessage && (
                <div className="mt-2 text-[11px] text-amber-400 font-medium">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Voice Controls: Start Speaking / Stop & Submit Spoken Answer */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                {!isListening ? (
                  <button
                    onClick={startListening}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition transform active:scale-95"
                  >
                    <Mic className="w-4 h-4 text-white animate-pulse" />
                    <span>Start Speaking</span>
                  </button>
                ) : (
                  <button
                    onClick={stopListening}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-semibold transition"
                  >
                    <MicOff className="w-4 h-4" />
                    <span>Pause Mic</span>
                  </button>
                )}

                {fullTranscript && (
                  <button
                    onClick={clearTranscript}
                    className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-slate-200 text-xs transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Speak Again</span>
                  </button>
                )}
              </div>

              {/* Complete & Submit Spoken Answer */}
              <button
                disabled={submitting || (!fullTranscript.trim() && !codeAnswer.trim())}
                onClick={handleSubmitAnswer}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span>Evaluating Spoken Answer...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Submit Spoken Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Call Controls Bar */}
          <div className="mt-3 flex items-center justify-between px-4 py-2 bg-[#0d0f17] rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-2.5 rounded-xl transition ${
                  isListening
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title={isListening ? 'Mute Microphone' : 'Enable Microphone'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-2.5 rounded-xl transition ${
                  isVideoOn
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    : 'bg-rose-600 text-white'
                }`}
                title={isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsSoundOn(!isSoundOn)}
                className={`p-2.5 rounded-xl transition ${
                  isSoundOn
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    : 'bg-amber-600 text-white'
                }`}
                title={isSoundOn ? 'Mute AI Voice' : 'Enable AI Voice'}
              >
                {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Leave Call CTA */}
            <button
              onClick={handleEndCall}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 transition"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave Call</span>
            </button>
          </div>
        </div>

        {/* Right Intelligence & Scores Drawer */}
        <div className="w-full lg:w-96 bg-[#0c0e17] border-t lg:border-t-0 lg:border-l border-slate-800/80 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-slate-800/80">
            <button
              onClick={() => setActiveTab('scores')}
              className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'scores'
                  ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-900/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Live Scores & Radar</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'chat'
                  ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-900/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Transcript & Chat</span>
            </button>
          </div>

          {/* Scores Panel */}
          {activeTab === 'scores' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Radar Chart Card */}
              <div className="bg-[#121522] rounded-2xl border border-slate-800/80 p-4 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-white tracking-wide">AI Video Score</h3>
                  <span className="text-[10px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                    6 Dimensions
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  See the 6-dimension video result in real-time
                </p>
                <RadarScore scores={radarScores} size={250} />
              </div>

              {/* Workmap Score Card */}
              <div className="bg-[#121522] rounded-2xl border border-slate-800/80 p-4 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-white tracking-wide">Workmap Score</h3>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    Behavioral
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  See the workmap projection in real-time
                </p>
                <WorkmapBars scores={workmapScores} />
              </div>

              {/* Last Question Feedback (if available) */}
              {lastFeedback && (
                <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3.5 text-xs space-y-1.5">
                  <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Last Question Feedback (Score: {lastFeedback.score}%)</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {lastFeedback.feedback}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Chat Panel */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="text-center text-[11px] text-slate-500 my-2">
                  Interview room initialized • Encrypted WebRTC Session
                </div>

                <div className="flex flex-col items-start">
                  <div className="bg-slate-800/90 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%] text-xs text-slate-200">
                    <span className="block text-[10px] text-purple-400 font-semibold mb-0.5">
                      Alex (AI Interviewer)
                    </span>
                    {currentQuestion?.question_text ||
                      'Hello! Welcome to your interview. Let me know when you are ready to begin.'}
                  </div>
                </div>

                {messages.map((msg) => {
                  const isMe = msg.sender === (user?.name || 'Candidate');
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] text-xs ${
                          isMe
                            ? 'bg-purple-600 rounded-tr-sm text-white'
                            : 'bg-slate-800/90 rounded-tl-sm text-slate-200'
                        }`}
                      >
                        <span className="block text-[10px] opacity-75 font-semibold mb-0.5">
                          {msg.sender} • {msg.timestamp}
                        </span>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-slate-800/80 bg-[#0d0f17]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.target.elements.chatMsg;
                    if (input.value.trim()) {
                      sendChatMessage(input.value);
                      input.value = '';
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    name="chatMsg"
                    type="text"
                    placeholder="Send a chat message..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
