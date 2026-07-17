import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Toast from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import QuestionStepper from './components/QuestionStepper';
import TimerRing from './components/TimerRing';
import ThemeToggle from './components/ThemeToggle';
import { 
  Upload, 
  Mic, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Terminal, 
  Play, 
  Cpu, 
  User, 
  HelpCircle,
  FileText,
  Volume2,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Bot,
  ArrowDown,
  RotateCcw,
  Briefcase,
  Layers,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  VolumeX,
  Square,
  Award,
  BarChart2,
  RefreshCw,
  Download,
  TrendingUp
} from 'lucide-react';

// Three.js Interactive 3D Particles Component (Connected Neural Sphere vs Wave Grid)
function ThreeDParticles({ theme }) {
  const pointsRef = useRef();
  const linesRef = useRef();
  const { mouse } = useThree();
  const particleCount = 1800;

  // Generate particle coordinate positions & custom vertex colors
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    
    if (theme === 'dark') {
      for (let i = 0; i < particleCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 2.4 + Math.random() * 0.4;
        
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);

        const rand = Math.random();
        if (rand < 0.4) {
          col[i * 3] = 0.388; col[i * 3 + 1] = 0.402; col[i * 3 + 2] = 0.945; // Indigo (#6366f1)
        } else if (rand < 0.8) {
          col[i * 3] = 0.024; col[i * 3 + 1] = 0.714; col[i * 3 + 2] = 0.839; // Cyan (#06b6d4)
        } else {
          col[i * 3] = 0.957; col[i * 3 + 1] = 0.247; col[i * 3 + 2] = 0.369; // Fuchsia/Pink (#f43f5e)
        }
      }
    } else {
      const size = Math.floor(Math.sqrt(particleCount));
      let idx = 0;
      for (let x = 0; x < size; x++) {
        for (let z = 0; z < size; z++) {
          const posX = (x / size - 0.5) * 8;
          const posZ = (z / size - 0.5) * 8;
          pos[idx * 3] = posX;
          pos[idx * 3 + 1] = Math.sin(posX) * Math.cos(posZ) * 0.3;
          pos[idx * 3 + 2] = posZ;

          const rand = Math.random();
          if (rand < 0.33) {
            col[idx * 3] = 0.055; col[idx * 3 + 1] = 0.647; col[idx * 3 + 2] = 0.902; // Aqua Sky blue (#0ea5e9)
          } else if (rand < 0.66) {
            col[idx * 3] = 0.961; col[idx * 3 + 1] = 0.482; col[idx * 3 + 2] = 0.039; // Deep Orange (#f57c0a)
          } else {
            col[idx * 3] = 0.502; col[idx * 3 + 1] = 0.000; col[idx * 3 + 2] = 0.125; // Maroon (#800020)
          }
          idx++;
        }
      }
    }
    return [pos, col];
  }, [theme]);

  const linesPositions = useMemo(() => {
    if (theme !== 'dark') return new Float32Array(0);
    const linePoints = [];
    const maxDistance = 0.75;
    const subsetCount = 180;
    
    const pts = [];
    for (let i = 0; i < subsetCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.45;
      pts.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ));
    }

    for (let i = 0; i < subsetCount; i++) {
      for (let j = i + 1; j < subsetCount; j++) {
        if (pts[i].distanceTo(pts[j]) < maxDistance) {
          linePoints.push(pts[i].x, pts[i].y, pts[i].z);
          linePoints.push(pts[j].x, pts[j].y, pts[j].z);
        }
      }
    }
    return new Float32Array(linePoints);
  }, [theme]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.035;
      pointsRef.current.rotation.x = Math.sin(time * 0.07) * 0.02;

      if (linesRef.current) {
        linesRef.current.rotation.y = pointsRef.current.rotation.y;
        linesRef.current.rotation.x = pointsRef.current.rotation.x;
      }

      if (theme !== 'dark') {
        const positionsArr = pointsRef.current.geometry.attributes.position.array;
        const size = Math.floor(Math.sqrt(particleCount));
        let idx = 0;
        for (let x = 0; x < size; x++) {
          for (let z = 0; z < size; z++) {
            const posX = positionsArr[idx * 3];
            const posZ = positionsArr[idx * 3 + 2];
            positionsArr[idx * 3 + 1] = Math.sin(posX + time * 1.3) * Math.cos(posZ + time * 1.3) * 0.25;
            idx++;
          }
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={theme === 'dark' ? 0.05 : 0.038}
          vertexColors
          transparent
          opacity={theme === 'dark' ? 0.65 : 0.55}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </points>

      {theme === 'dark' && linesPositions.length > 0 && (
        <lineSegments ref={linesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[linesPositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial 
            color="#8b5cf6" 
            transparent 
            opacity={0.16} 
            depthWrite={false} 
          />
        </lineSegments>
      )}
    </group>
  );
}

// Integrated Interactive Background Component
function InteractiveBackground({ theme }) {
  const mouseRef = useRef({ moveX: 0, moveY: 0 });
  const [parallaxOffset, setParallaxOffset] = useState({ rotateX: 0, rotateY: 0, scale: 1.08, tx: 0, ty: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.moveX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouseRef.current.moveY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let active = true;
    const startTime = Date.now();

    const updateParallax = () => {
      if (!active) return;
      
      const elapsed = (Date.now() - startTime) / 1000;
      const breathScale = 1.08 + Math.sin(elapsed * 0.2) * 0.03;
      const breathTx = Math.sin(elapsed * 0.15) * 8;
      const breathTy = Math.cos(elapsed * 0.15) * 8;

      const targetRotateX = -mouseRef.current.moveY * 5;
      const targetRotateY = mouseRef.current.moveX * 5;

      setParallaxOffset(prev => ({
        rotateX: prev.rotateX + (targetRotateX - prev.rotateX) * 0.05,
        rotateY: prev.rotateY + (targetRotateY - prev.rotateY) * 0.05,
        scale: breathScale,
        tx: breathTx,
        ty: breathTy
      }));

      requestAnimationFrame(updateParallax);
    };
    updateParallax();
    return () => { active = false; };
  }, []);

  const bgImageSrc = theme === 'dark' ? '/network_bg.jpg' : '/avatar_bg.png';
  
  const imageFilter = theme === 'dark'
    ? 'opacity-25 saturate-[1.2] brightness-[0.55] contrast-[1.25]'
    : 'invert-[0.95] sepia-[0.35] saturate-[2.4] hue-rotate-[320deg] brightness-[1.18] contrast-[0.95] opacity-[0.22]';

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <div 
        style={{ 
          transform: `perspective(1000px) rotateX(${parallaxOffset.rotateX}deg) rotateY(${parallaxOffset.rotateY}deg) scale(${parallaxOffset.scale}) translate3d(${parallaxOffset.tx}px, ${parallaxOffset.ty}px, 0)`,
          transition: 'transform 0.15s ease-out'
        }}
        className="absolute inset-[-5%] w-[110%] h-[110%] select-none pointer-events-none"
      >
        <img 
          src={bgImageSrc} 
          alt="3D Theme Background" 
          className={`w-full h-full object-cover ${imageFilter}`}
        />
        <div className={`absolute inset-0 ${
          theme === 'dark' 
            ? 'bg-gradient-to-t from-[#0a0718] via-transparent to-[#0a0718] opacity-90' 
            : 'bg-gradient-to-t from-[#faf6f0] via-transparent to-[#faf6f0] opacity-80'
        }`} />
      </div>

      <div className="absolute inset-0 w-full h-full">
        <Canvas camera={{ position: [0, 0, 4.5], fov: 60 }} dpr={[1, 2]} gl={{ alpha: true }}>
          <ambientLight intensity={theme === 'dark' ? 0.35 : 0.45} />
          <ThreeDParticles theme={theme} />
        </Canvas>
      </div>
    </div>
  );
}

function App() {
  // Preloader / Initial Landing Preload state
  const [loading, setLoading] = useState(true);

  // Theme Toggle States: 'light' | 'dark' | 'system'
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'system';
  });
  const [resolvedTheme, setResolvedTheme] = useState('dark');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Toasts state
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'info') => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  };

  // Reset confirmation state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Time pressure state
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // View States: 'setup' | 'processing' | 'interview'
  const [activeView, setActiveView] = useState('setup');
  const [processingMsg, setProcessingMsg] = useState('');

  // WebSocket Connection States
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [wsInput, setWsInput] = useState('');
  const [wsMessages, setWsMessages] = useState([]);
  const wsRef = useRef(null);

  // App settings/forms
  const [candidateName, setCandidateName] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [persona, setPersona] = useState('Standard Technical Interviewer');
  const [uploadedFile, setUploadedFile] = useState(null);

  // DB Session Response Data
  const [sessionData, setSessionData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isFetchingAnalytics, setIsFetchingAnalytics] = useState(false);

  // Phase 3: Voice Practice Engines & Interview Flow States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [answerScores, setAnswerScores] = useState({}); // { [questionId]: { clarity_score, technical_score, structure_score, feedback_markdown, overall_impression } }
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);

  // Switch questions inside the interactive interview console
  const handleQuestionChange = (newIndex) => {
    if (!sessionData?.questions?.[newIndex]) return;
    if (isRecording && recognitionRef.current) {
      isRecordingRef.current = false;
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      setTtsPlaying(false);
    }
    setCurrentQuestionIndex(newIndex);
    const qId = sessionData.questions[newIndex].id;
    if (answerScores[qId]) {
      setLiveTranscript(answerScores[qId].answer_text || '');
    } else {
      setLiveTranscript('');
    }
  };

  // Restore session on mount
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem('interview_sessionData');
      const storedScores = localStorage.getItem('interview_answerScores');
      const storedIndex = localStorage.getItem('interview_currentQuestionIndex');
      const storedView = localStorage.getItem('interview_activeView');
      const storedName = localStorage.getItem('interview_candidateName');
      
      if (storedSession) setSessionData(JSON.parse(storedSession));
      if (storedScores) setAnswerScores(JSON.parse(storedScores));
      if (storedIndex) setCurrentQuestionIndex(Number(storedIndex));
      if (storedView) setActiveView(storedView);
      if (storedName) setCandidateName(storedName);
    } catch (e) {
      console.error("Failed to restore session from LocalStorage:", e);
    }
  }, []);

  // Save session when state changes
  useEffect(() => {
    try {
      if (sessionData) {
        localStorage.setItem('interview_sessionData', JSON.stringify(sessionData));
      } else {
        localStorage.removeItem('interview_sessionData');
      }
    } catch (e) {}
  }, [sessionData]);

  useEffect(() => {
    try {
      if (Object.keys(answerScores).length > 0) {
        localStorage.setItem('interview_answerScores', JSON.stringify(answerScores));
      } else {
        localStorage.removeItem('interview_answerScores');
      }
    } catch (e) {}
  }, [answerScores]);

  useEffect(() => {
    localStorage.setItem('interview_currentQuestionIndex', currentQuestionIndex.toString());
  }, [currentQuestionIndex]);

  useEffect(() => {
    localStorage.setItem('interview_activeView', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('interview_candidateName', candidateName);
  }, [candidateName]);

  // Keyboard Shortcuts (Space to record, Enter to submit, Left/Right for questions, Esc to stop TTS)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in inputs/textareas
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        if (e.key === 'Enter' && e.ctrlKey && activeView === 'interview') {
          e.preventDefault();
          const qId = sessionData?.questions?.[currentQuestionIndex]?.id;
          if (qId) handleSubmitAnswer(qId);
        }
        return;
      }

      if (activeView !== 'interview') return;

      if (e.key === ' ') {
        e.preventDefault();
        handleToggleRecording();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const qId = sessionData?.questions?.[currentQuestionIndex]?.id;
        if (qId) handleSubmitAnswer(qId);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleQuestionChange(currentQuestionIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleQuestionChange(currentQuestionIndex + 1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (audioRef.current) {
          audioRef.current.pause();
          setTtsPlaying(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, currentQuestionIndex, sessionData, liveTranscript, isRecording]);

  // TTS playback handler (ElevenLabs)
  const handleListenToQuestion = async (text) => {
    if (!text || !ttsEnabled) return;
    if (ttsPlaying && audioRef.current) {
      audioRef.current.pause();
      setTtsPlaying(false);
      return;
    }
    setTtsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!response.ok) {
        throw new Error('TTS Service unavailable or quota exceeded');
      }
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onplay = () => { setTtsLoading(false); setTtsPlaying(true); };
      audio.onended = () => { setTtsPlaying(false); URL.revokeObjectURL(audioUrl); };
      audio.onerror = () => { setTtsLoading(false); setTtsPlaying(false); showToast('Error playing audio stream.', 'error'); };
      audio.play();
    } catch (err) {
      console.warn("ElevenLabs TTS quota exceeded or unavailable, cascading to browser speech:", err);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onstart = () => { setTtsLoading(false); setTtsPlaying(true); };
        utterance.onend = () => setTtsPlaying(false);
        utterance.onerror = () => setTtsPlaying(false);
        window.speechSynthesis.speak(utterance);
        showToast('⚡ Speaking via High-Clarity Browser HD Voice (Quota Fallback Engine)', 'info');
      } else {
        setTtsLoading(false);
        setTtsPlaying(false);
        showToast('Could not synthesize speech: ' + err.message, 'error');
      }
    }
  };

  // Web Speech API (Browser STT)
  const handleToggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.', 'error');
      return;
    }

    if (isRecording) {
      isRecordingRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      setIsTimerRunning(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let accumulated = liveTranscript ? liveTranscript + ' ' : '';

      recognition.onresult = (event) => {
        let interim = '';
        let finalStr = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (finalStr) {
          accumulated += finalStr;
        }
        setLiveTranscript((accumulated + interim).trim());
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error or low volume check:', event.error);
        if (event.error === 'no-speech') {
          // Do nothing, let onend auto-restart seamlessly so low volume words are not cut off
          return;
        }
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isRecordingRef.current = false;
          setIsRecording(false);
          setIsTimerRunning(false);
          showToast('Microphone access denied. Please allow microphone permissions in browser settings.', 'error');
        }
      };

      recognition.onend = () => {
        // If the user did not explicitly stop recording, automatically restart listening!
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.warn('Speech recognition auto-restart attempt skipped:', e);
          }
        } else {
          setIsRecording(false);
          setIsTimerRunning(false);
        }
      };

      recognitionRef.current = recognition;
      isRecordingRef.current = true;
      recognition.start();
      setIsRecording(true);
      setIsTimerRunning(true);
      showToast('Microphone active & highly sensitive. Speak naturally at any volume.', 'info');
    }
  };

  // Submit Answer for STAR Evaluation
  const handleSubmitAnswer = async (questionId) => {
    if (!liveTranscript.trim()) {
      showToast('Please speak or type your answer before submitting.', 'info');
      return;
    }
    if (isRecording && recognitionRef.current) {
      isRecordingRef.current = false;
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsTimerRunning(false);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      setTtsPlaying(false);
    }

    setIsEvaluating(true);
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'submit_answer',
          question_id: questionId,
          answer_text: liveTranscript
        }));
      }

      const response = await fetch(`${API_BASE_URL}/api/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          answer_text: liveTranscript,
          session_id: sessionData?.session_id || 1
        })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answer on server.');
      }

      const evalData = await response.json();
      setAnswerScores(prev => ({
        ...prev,
        [questionId]: evalData
      }));
      showToast('STAR evaluation completed successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error submitting answer: ' + err.message, 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  // preloader timeout simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize theme config
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      let activeTheme = 'dark';
      if (themeMode === 'system') {
        activeTheme = mediaQuery.matches ? 'dark' : 'light';
      } else {
        activeTheme = themeMode;
      }
      setResolvedTheme(activeTheme);
      
      // Update HTML class list for Tailwind v4/v3 dark mode support
      if (activeTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();
    localStorage.setItem('themeMode', themeMode);

    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [themeMode]);

  // Setup WebSocket connection
  const connectWebSocket = () => {
    setWsStatus('connecting');
    try {
      const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/ws';
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setWsStatus('connected');
        setWsMessages(prev => [...prev, { sender: 'system', text: 'Connected to WebSocket Server!' }]);
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setWsMessages(prev => [...prev, { 
          sender: 'server', 
          text: data.echo || data.server_msg, 
          raw: data 
        }]);
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWsStatus('error');
      };
      
      ws.onclose = () => {
        setWsStatus('disconnected');
        setWsMessages(prev => [...prev, { sender: 'system', text: 'WebSocket Connection Closed.' }]);
      };
      
      wsRef.current = ws;
    } catch (e) {
      setWsStatus('error');
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const sendWsMessage = () => {
    if (!wsInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    const payload = { text: wsInput };
    wsRef.current.send(JSON.stringify(payload));
    setWsMessages(prev => [...prev, { sender: 'client', text: wsInput }]);
    setWsInput('');
  };

  // Cleanup WS on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast("Resume file exceeds 5MB size limit.", "error");
        return;
      }
      if (file.type !== "application/pdf") {
        showToast("Only PDF documents are supported.", "error");
        return;
      }
      setUploadedFile(file);
      showToast("Resume uploaded successfully.", "success");
    }
  };

  // POST Form CV Parser Submission (Milestone 2.1)
  const handleStartInterview = async () => {
    if (!candidateName.trim()) {
      showToast("Please enter your name to begin.", "info");
      return;
    }

    setActiveView('processing');
    setProcessingMsg("Initializing Speech Engines & OCR Parser...");

    const formData = new FormData();
    formData.append('candidate_name', candidateName);
    formData.append('difficulty', difficulty);
    formData.append('persona', persona);
    if (uploadedFile) {
      formData.append('resume', uploadedFile);
    }

    // Set stage timers for premium UI experience feedback
    const statusIntervals = [
      { delay: 1000, msg: "Reading PDF binary data structures..." },
      { delay: 2000, msg: "Running OCR & Structured LLM Extraction..." },
      { delay: 3500, msg: "Analyzing skills matrix & project history..." },
      { delay: 4800, msg: "Activating LLM Interviewer Agent..." },
      { delay: 6000, msg: "Generating customized interview questions..." }
    ];

    const timers = statusIntervals.map(step => 
      setTimeout(() => setProcessingMsg(step.msg), step.delay)
    );

    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Server error occurred.");
      }

      const data = await response.json();
      
      // Clear timers and transition
      timers.forEach(t => clearTimeout(t));
      setSessionData(data);
      setCurrentQuestionIndex(0);
      setLiveTranscript('');
      setAnswerScores({});
      // Clear localStorage cache for any old session
      localStorage.removeItem('interview_answerScores');
      localStorage.removeItem('interview_currentQuestionIndex');
      
      if (isRecording && recognitionRef.current) {
        isRecordingRef.current = false;
        recognitionRef.current.stop();
        setIsRecording(false);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        setTtsPlaying(false);
      }
      setActiveView('interview');
      showToast("Welcome to your interview practice! Try the time-pressure timer.", "success");
    } catch (e) {
      timers.forEach(t => clearTimeout(t));
      console.error("Initialization error against URL:", `${API_BASE_URL}/api/sessions`, e);
      if (e.message && e.message.includes("Failed to fetch")) {
        showToast(`Connection Failed: Cannot reach backend at "${API_BASE_URL}". If on Vercel, check that VITE_API_URL is set and redeploy.`, "error");
      } else {
        showToast(`Initialization Failed: ${e.message}`, "error");
      }
      setActiveView('setup');
    }
  };

  // Actual Reset back to Onboarding screen
  const executeResetSession = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      setTtsPlaying(false);
    }
    setCurrentQuestionIndex(0);
    setLiveTranscript('');
    setAnswerScores({});
    setSessionData(null);
    setAnalyticsData(null);
    setUploadedFile(null);
    localStorage.clear(); // Complete local cache wipe
    setActiveView('setup');
    showToast("Session reset successfully.", "info");
  };

  const handleResetSession = () => {
    setIsResetConfirmOpen(true);
  };

  // Fetch final analytics and switch to Summary Dashboard view
  const handleViewSummaryReport = async () => {
    if (!sessionData?.session_id) return;
    setIsFetchingAnalytics(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionData.session_id}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
        setActiveView('summary');
        showToast("Final session report generated!", "success");
      } else {
        showToast("Failed to fetch session analytics.", "error");
      }
    } catch (e) {
      console.error("Failed to fetch analytics:", e);
      showToast("Error checking session analytics report.", "error");
    } finally {
      setIsFetchingAnalytics(false);
    }
  };

  // Download Executive Summary Report as Markdown file
  const handleDownloadReport = () => {
    if (!analyticsData?.executive_summary_markdown) return;
    const blob = new Blob([analyticsData.executive_summary_markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Interview_Report_${analyticsData.candidate_name.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export Executive Summary & 10/10 Model Answers to PDF (with styled tables and colors)
  const handleExportPDF = () => {
    if (!analyticsData) return;
    
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      showToast("Please allow popups to export the PDF report.", "error");
      return;
    }

    const rowsHTML = (analyticsData.question_breakdown || []).map((q, idx) => `
      <div class="q-card">
        <div class="q-header">
          <div>
            <span class="q-num">Q${idx + 1}</span>
            <span class="q-type">${q.question_type || 'Technical'}</span>
            <span class="q-diff">${q.difficulty || 'Medium'}</span>
          </div>
          <div class="q-scores">
            ${q.answered ? `
              <span class="score-badge clarity">Clarity: ${q.clarity_score}/10</span>
              <span class="score-badge tech">Technical: ${q.technical_score}/10</span>
              <span class="score-badge star">STAR: ${q.structure_score}/10</span>
            ` : '<span class="score-badge unanswered">Unanswered</span>'}
          </div>
        </div>
        <div class="q-text">"${q.question_text}"</div>
        ${q.answered ? `
          <div class="feedback-box">
            <strong>Coach Feedback & Analysis:</strong><br/>
            ${(q.feedback_summary || '').replace(/\n/g, '<br/>')}
          </div>
        ` : ''}
        ${q.model_answer ? `
          <div class="model-box">
            <div class="model-title">🌟 10/10 Perfect Model Answer Benchmark</div>
            <div class="model-content">${q.model_answer.replace(/\n/g, '<br/>')}</div>
          </div>
        ` : ''}
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AI Interview Coach Report - ${analyticsData.candidate_name}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #ffffff; margin: 0; padding: 0; line-height: 1.6; }
          .header { background: linear-gradient(135deg, #1e1b4b, #312e81, #4338ca); color: #ffffff; padding: 30px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 10px 25px rgba(30,27,75,0.15); }
          .header h1 { margin: 0 0 8px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 0; font-size: 14px; opacity: 0.9; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
          .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; text-align: center; }
          .stat-card .val { font-size: 24px; font-weight: 800; color: #4338ca; margin-bottom: 4px; }
          .stat-card .lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
          .section-title { font-size: 18px; font-weight: 800; color: #1e293b; border-bottom: 3px solid #4338ca; padding-bottom: 8px; margin: 30px 0 18px 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .summary-box { background: #f8fafc; border-left: 5px solid #4338ca; padding: 20px; border-radius: 8px; font-size: 13px; margin-bottom: 30px; white-space: pre-wrap; color: #334155; }
          .q-card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; background: #ffffff; }
          .q-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
          .q-num { background: #4338ca; color: #ffffff; font-weight: 800; font-size: 12px; padding: 4px 10px; border-radius: 6px; margin-right: 8px; }
          .q-type { font-weight: 700; font-size: 12px; color: #475569; text-transform: uppercase; margin-right: 8px; }
          .q-diff { font-weight: 600; font-size: 11px; background: #e2e8f0; color: #334155; padding: 3px 8px; border-radius: 4px; }
          .q-scores { margin-left: auto; display: flex; gap: 8px; }
          .score-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; }
          .score-badge.clarity { background: #e0f2fe; color: #0369a1; }
          .score-badge.tech { background: #e0e7ff; color: #4338ca; }
          .score-badge.star { background: #dcfce7; color: #15803d; }
          .score-badge.unanswered { background: #fee2e2; color: #b91c1c; }
          .q-text { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 14px; }
          .feedback-box { background: #f1f5f9; border-radius: 8px; padding: 14px; font-size: 12.5px; color: #334155; margin-bottom: 12px; }
          .model-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; padding: 16px; margin-top: 12px; }
          .model-title { font-size: 12px; font-weight: 800; color: #b45309; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }
          .model-content { font-size: 12.5px; color: #78350f; line-height: 1.6; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AI Interview Coach • Executive Evaluation Report</h1>
          <p>Candidate: <strong>${analyticsData.candidate_name}</strong> | Session ID: #${analyticsData.session_id} | Readiness Level: <strong>${analyticsData.readiness_level}</strong></p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="val">${analyticsData.overall_score}/10</div>
            <div class="lbl">Overall Score</div>
          </div>
          <div class="stat-card">
            <div class="val">${analyticsData.average_clarity}/10</div>
            <div class="lbl">Clarity Average</div>
          </div>
          <div class="stat-card">
            <div class="val">${analyticsData.average_technical}/10</div>
            <div class="lbl">Technical Average</div>
          </div>
          <div class="stat-card">
            <div class="val">${analyticsData.average_structure}/10</div>
            <div class="lbl">STAR Structure</div>
          </div>
        </div>

        <div class="section-title">Executive Coaching Brief & Action Plan</div>
        <div class="summary-box">${analyticsData.executive_summary_markdown || 'No summary available.'}</div>

        <div class="section-title">Detailed Question Evaluation & 10/10 Model Answers</div>
        ${rowsHTML}

        <div class="footer">
          Generated automatically by AI Interview Coach • Executive Evaluation Report • ${new Date().toLocaleDateString()}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // VIBE STYLE MAPS: Contrast values for Light (Orange/Maroon/Aqua/Fuchsia) vs Dark (Neon Cyberpunk)
  const styles = {
    bg: resolvedTheme === 'dark' 
      ? 'bg-gradient-to-tr from-[#0a0718] via-[#0f0a28] to-[#1d0e3a] text-slate-100' 
      : 'bg-[#faf6f0] text-slate-800',
    headerBorders: resolvedTheme === 'dark' 
      ? 'border-none' 
      : 'border-none',
    card: resolvedTheme === 'dark'
      ? 'bg-[#120e2e]/55 border-[#f43f5e]/15 shadow-glass-inset shadow-glass-glow'
      : 'bg-[#fffdfb]/85 border-orange-200/50 shadow-xl shadow-orange-100/30',
    label: resolvedTheme === 'dark'
      ? 'text-indigo-300'
      : 'text-[#800020] font-bold', 
    input: resolvedTheme === 'dark'
      ? 'bg-[#0a071d]/90 border-white/5 text-slate-200 focus:border-cyan-500'
      : 'bg-[#fffefd] border-orange-200 text-slate-850 focus:border-orange-500 focus:bg-white',
    uploadArea: resolvedTheme === 'dark'
      ? 'border-white/10 bg-[#0a071d]/30 hover:border-cyan-500/50 hover:bg-[#0a071d]/60'
      : 'border-orange-200/80 bg-[#fffdfb]/60 hover:border-orange-500 hover:bg-orange-50/40',
    consoleBg: resolvedTheme === 'dark'
      ? 'bg-[#070515]/90 border-white/5 shadow-inner'
      : 'bg-[#f6ebd7]/60 border-orange-200/60 shadow-inner',
    badge: resolvedTheme === 'dark'
      ? 'bg-[#110c2d]/90 border-[#8b5cf6]/10 shadow-sm text-indigo-200'
      : 'bg-[#f5eade]/90 border-orange-200 shadow-sm text-[#800020]',
    title: resolvedTheme === 'dark'
      ? 'from-white via-indigo-200 to-cyan-300'
      : 'from-[#800020] via-pink-700 to-orange-600', 
    cardTitle: resolvedTheme === 'dark'
      ? 'from-white to-indigo-200'
      : 'from-[#800020] to-[#b83d6a]',
    footerBorders: resolvedTheme === 'dark'
      ? 'border-t border-white/5 text-slate-500'
      : 'border-t border-orange-200/60 text-[#800020]/60',
    button: resolvedTheme === 'dark'
      ? 'from-fuchsia-600 via-indigo-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 text-white'
      : 'from-orange-500 via-pink-500 to-fuchsia-600 hover:from-orange-400 hover:to-fuchsia-500 text-white',
    highlightText: resolvedTheme === 'dark'
      ? 'text-cyan-400'
      : 'text-orange-600',
  };

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        // 1. GORGEOUS INTRO LAUNCH PRELOADER SCREEN
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${
            resolvedTheme === 'dark' ? 'bg-[#0a0718]' : 'bg-[#faf6f0]'
          }`}
        >
          <InteractiveBackground theme={resolvedTheme} />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360]
              }} 
              transition={{ 
                repeat: Infinity, 
                duration: 2.5,
                ease: "easeInOut"
              }}
              className="p-5 bg-gradient-to-tr from-sky-500 via-indigo-500 to-fuchsia-500 rounded-3xl shadow-2xl flex items-center justify-center border border-white/10"
            >
              <Cpu className="w-12 h-12 text-white" />
            </motion.div>
            
            <div className="flex flex-col items-center text-center px-4">
              <h2 className={`text-3xl font-black bg-gradient-to-r bg-clip-text text-transparent tracking-tight ${styles.title}`}>
                AI Interview Coach
              </h2>
              <p className={`text-xs font-mono font-bold tracking-widest mt-2 uppercase ${
                resolvedTheme === 'dark' ? 'text-cyan-400' : 'text-orange-600'
              }`}>
                BOOTING SPEECH & PARSING ENGINES...
              </p>
            </div>

            <div className={`w-56 h-1.5 rounded-full overflow-hidden border ${
              resolvedTheme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-slate-200 border-orange-200/50'
            }`}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.2, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500"
              />
            </div>
          </div>
        </motion.div>
      ) : (
        // 2. MAIN APPLICATION CONTENT
        <motion.div 
          key="app-main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`min-h-screen w-full flex flex-col justify-between relative overflow-y-auto scroll-smooth transition-colors duration-500 ${styles.bg}`}
        >
          <InteractiveBackground theme={resolvedTheme} />

          {/* Toast Notification Manager */}
          <Toast toasts={toasts} setToasts={setToasts} theme={resolvedTheme} />

          {/* Reset Confirmation Modal */}
          <ConfirmModal
            isOpen={isResetConfirmOpen}
            onClose={() => setIsResetConfirmOpen(false)}
            onConfirm={executeResetSession}
            title="Reset Practice Session?"
            message="Are you sure you want to start a new practice session? This will erase your current transcript, evaluations, and progress."
            confirmText="Reset Session"
            theme={resolvedTheme}
          />

          {/* Transparent Header */}
          <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between bg-transparent border-none z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-xl shadow-md flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-black bg-gradient-to-r bg-clip-text text-transparent ${styles.title}`}>
                  AI Interview Coach
                </h1>
                <p className="text-[10px] text-sky-500 font-mono tracking-wider font-bold">Real-Time STAR & Voice Practice</p>
              </div>
            </div>

            {/* Controls & Connection Row */}
            <div className="flex items-center gap-4">
              {/* Theme Switcher Toggle */}
              <ThemeToggle 
                theme={themeMode}
                setTheme={setThemeMode}
                resolvedTheme={resolvedTheme}
              />

              {/* WebSocket Badge */}
              <div className={`flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-md ${styles.badge}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${
                  wsStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                  wsStatus === 'connecting' ? 'bg-amber-500 animate-pulse' :
                  wsStatus === 'error' ? 'bg-rose-500' : 'bg-slate-400'
                }`} />
                <span className="text-xs font-bold capitalize tracking-wide">
                  WS: {wsStatus}
                </span>
                {wsStatus !== 'connected' && wsStatus !== 'connecting' ? (
                  <button 
                    onClick={connectWebSocket}
                    className="text-[10px] uppercase font-black text-sky-500 hover:text-sky-400 transition-colors ml-1"
                  >
                    Connect
                  </button>
                ) : (
                  <button 
                    onClick={disconnectWebSocket}
                    className="text-[10px] uppercase font-black text-rose-500 hover:text-rose-400 transition-colors ml-1"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* MAIN PAGE SWITCH PANEL */}
          <main className="w-full max-w-7xl mx-auto px-6 py-8 flex-grow z-10 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {activeView === 'setup' && (
                // VIEW 1: HOME & SETUP
                <motion.div
                  key="view-setup"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex flex-col gap-12"
                >
                  {/* Landing Page Hero Section */}
                  <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
                    <div className="lg:col-span-6 flex flex-col gap-6">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border max-w-fit font-mono text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 border-sky-500/35 text-sky-500 animate-pulse">
                        <Sparkles className="w-3 h-3 text-sky-500" /> Speech & OCR Enabled Agent
                      </div>
                      <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-2">
                        Practice Makes <br/>
                        <span className={`bg-gradient-to-r bg-clip-text text-transparent ${styles.title}`}>
                          Your Interviews Perfect.
                        </span>
                      </h2>
                      <p className={`text-base font-medium leading-relaxed ${resolvedTheme === 'dark' ? 'text-slate-100/90' : 'text-slate-700'}`}>
                        Our AI parses your resume, asks dynamic tech stack questions matching your background, transcribes your answers in real-time, and rates your performance using standard industry evaluation methodologies (STAR method).
                      </p>
                      <div className="flex gap-4 items-center">
                        <a 
                          href="#config-section"
                          className={`px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r shadow-md flex items-center gap-2 group transition-all duration-300 hover:scale-[1.02] ${styles.button}`}
                        >
                          Get Started 
                          <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                        </a>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          Setup takes under 1 minute
                        </span>
                      </div>
                    </div>

                    {/* Cartoon dialogue card (No cloud overlay) */}
                    <div className="lg:col-span-6 flex items-center justify-center">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`relative border p-6 rounded-3xl backdrop-blur-xl max-w-[540px] shadow-2xl flex flex-col items-center w-full ${styles.card}`}
                      >
                        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white/40 border border-orange-200/25">
                          <img 
                            src="/interview_hero.png" 
                            alt="Candidate and AI Robot Interview illustration"
                            className="w-full h-full object-cover select-none"
                          />
                        </div>
                      </motion.div>
                    </div>
                  </section>

                  <div id="config-section" className="scroll-mt-24 pt-4 border-t border-dashed border-sky-500/15" />

                  {/* Dashboard setup grid */}
                  <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Setup Card */}
                    <div className="lg:col-span-7 flex flex-col gap-8">
                      <div className={`border rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden transition-all duration-300 ${styles.card}`}>
                        <div className="mb-8">
                          <h3 className={`text-2xl font-black tracking-tight bg-gradient-to-r bg-clip-text text-transparent mb-2 ${styles.cardTitle}`}>
                            1. Configure Your Session
                          </h3>
                          <p className={`text-xs ${resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Customize the AI persona profile and upload your CV to generate custom matching interview questions.
                          </p>
                        </div>

                        <div className="flex flex-col gap-6">
                          <div className="flex flex-col gap-2">
                            <label className={`text-xs uppercase tracking-wider flex items-center gap-2 ${styles.label}`}>
                              <User className="w-3.5 h-3.5 text-sky-500" /> Candidate Name
                            </label>
                            <input 
                              type="text" 
                              value={candidateName}
                              onChange={(e) => setCandidateName(e.target.value)}
                              placeholder="e.g. Alex Mercer"
                              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-300 ${styles.input}`}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <label className={`text-xs uppercase tracking-wider flex items-center gap-2 ${styles.label}`}>
                                <Settings className="w-3.5 h-3.5 text-sky-500" /> Difficulty Level
                              </label>
                              <select 
                                value={difficulty} 
                                onChange={(e) => setDifficulty(e.target.value)}
                                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-300 ${styles.input}`}
                              >
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className={`text-xs uppercase tracking-wider flex items-center gap-2 ${styles.label}`}>
                                <Volume2 className="w-3.5 h-3.5 text-sky-500" /> Interviewer Persona
                              </label>
                              <select 
                                value={persona} 
                                onChange={(e) => setPersona(e.target.value)}
                                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-300 ${styles.input}`}
                              >
                                <option>Standard Technical Interviewer</option>
                                <option>FAANG System Design Lead</option>
                                <option>Friendly Startup CTO</option>
                                <option>Strict Live-Coding Proctor</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className={`text-xs uppercase tracking-wider flex items-center gap-2 ${styles.label}`}>
                              <FileText className="w-3.5 h-3.5 text-sky-500" /> Upload Resume (PDF)
                            </label>
                            <div className={`border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 group relative cursor-pointer ${styles.uploadArea}`}>
                              <input 
                                type="file" 
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <div className={`p-4 rounded-2xl border transition-all duration-300 group-hover:scale-105 ${
                                resolvedTheme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-slate-50 border-slate-200'
                              }`}>
                                <Upload className="w-6 h-6 text-sky-500" />
                              </div>
                              <p className="mt-4 text-sm font-semibold">
                                {uploadedFile ? uploadedFile.name : "Drag & drop your PDF resume here"}
                              </p>
                              <p className="mt-1.5 text-xs text-slate-500 font-mono">
                                {uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB` : "Supports PDF up to 10MB"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={handleStartInterview}
                          className={`w-full mt-8 bg-gradient-to-r font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 group transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${styles.button}`}
                        >
                          <Play className="w-4 h-4 fill-white text-white group-hover:translate-x-0.5 transition-transform" />
                          Start Mock Interview
                        </button>
                      </div>
                    </div>

                    {/* WebSocket debugger terminal */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                      <div className={`border rounded-3xl p-6 backdrop-blur-xl flex flex-col h-[580px] transition-all duration-300 ${styles.card}`}>
                        <div className={`flex items-center justify-between pb-4 border-b mb-4 ${resolvedTheme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
                          <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-bold tracking-wide uppercase">
                              WebSocket Test Console
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">Milestone 1.3 Debugger</div>
                        </div>

                        <div className={`flex-grow border rounded-2xl p-4 overflow-y-auto font-mono text-xs flex flex-col gap-3 transition-colors duration-300 ${styles.consoleBg}`}>
                          {wsMessages.length === 0 && (
                            <div className="text-slate-555 flex flex-col items-center justify-center h-full gap-2 opacity-60">
                              <HelpCircle className="w-8 h-8 text-sky-500" />
                              <span className="font-semibold text-center px-4">No logs yet. Connect to WS and send a message.</span>
                            </div>
                          )}
                          {wsMessages.map((msg, idx) => (
                            <div 
                              key={idx} 
                              className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${
                                msg.sender === 'client' 
                                  ? (resolvedTheme === 'dark' ? 'bg-sky-500/5 border-sky-500/10 text-sky-300' : 'bg-orange-50 border-orange-200 text-orange-950') + ' self-end max-w-[85%]' 
                                  : msg.sender === 'server' 
                                  ? (resolvedTheme === 'dark' ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-300' : 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-950') + ' self-start max-w-[85%]'
                                  : (resolvedTheme === 'dark' ? 'bg-slate-800/50 border-white/10 text-slate-300' : 'bg-slate-200/50 border-slate-300 text-slate-500') + ' self-center w-full text-center'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 justify-between">
                                <span className={`text-[9px] font-black uppercase tracking-wider ${
                                  msg.sender === 'client' ? (resolvedTheme === 'dark' ? 'text-orange-400' : 'text-orange-500') :
                                  msg.sender === 'server' ? (resolvedTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-500') : 
                                  (resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-500')
                                }`}>
                                  {msg.sender}
                                </span>
                                <span className="text-[9px] text-slate-400 opacity-80">
                                  {new Date().toLocaleTimeString()}
                                </span>
                              </div>
                              <span className="break-all whitespace-pre-wrap leading-relaxed font-bold">{msg.text}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <input 
                            type="text" 
                            value={wsInput}
                            onChange={(e) => setWsInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendWsMessage()}
                            placeholder={wsStatus === 'connected' ? "Type a message to echo..." : "WebSocket is not connected"}
                            disabled={wsStatus !== 'connected'}
                            className={`flex-grow border rounded-xl px-4 py-3 text-xs font-mono focus:outline-none transition-all duration-300 disabled:opacity-50 ${styles.input}`}
                          />
                          <button 
                            onClick={sendWsMessage}
                            disabled={wsStatus !== 'connected' || !wsInput.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-450 px-4 py-3 rounded-xl transition-all flex items-center justify-center shadow-md active:scale-95 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {activeView === 'processing' && (
                // VIEW 2: DYNAMIC LOADING / PARSING ANIMATION
                <motion.div
                  key="view-processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center min-h-[500px]"
                >
                  <div className={`border rounded-3xl p-12 backdrop-blur-xl text-center max-w-lg shadow-2xl flex flex-col items-center gap-6 ${styles.card}`}>
                    <Loader2 className="w-16 h-16 text-sky-500 animate-spin" />
                    <div className="flex flex-col gap-2">
                      <h3 className={`text-2xl font-black ${resolvedTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                        Processing Session
                      </h3>
                      <p className="text-sm font-mono tracking-wider font-semibold text-sky-500 uppercase animate-pulse">
                        {processingMsg}
                      </p>
                    </div>
                    <div className="w-64 h-1.5 bg-slate-800/30 rounded-full overflow-hidden border border-white/5 mt-2">
                      <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 animate-infinite-loading" />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeView === 'interview' && sessionData && (
                // VIEW 3: DOCK INTERVIEW LAYOUT (Phase 2 Output display)
                <motion.div
                  key="view-interview"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 items-stretch"
                >
                  {/* Left Column: Parsed Resume OCR Profile Details */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className={`border rounded-3xl p-6 backdrop-blur-xl flex-grow ${styles.card}`}>
                      <div className={`border-b pb-4 mb-5 flex justify-between items-center ${resolvedTheme === 'dark' ? 'border-white/5' : 'border-orange-200/20'}`}>
                        <div>
                          <span className="text-[10px] font-mono font-bold tracking-widest text-sky-500 uppercase">OCR PROFILE EXTRACTION</span>
                          <h3 className={`text-xl font-black ${resolvedTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                            Parsed CV Data
                          </h3>
                        </div>
                        <Briefcase className="w-5 h-5 text-indigo-500" />
                      </div>

                      {/* Name & Email */}
                      <div className="flex flex-col gap-4">
                        <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${resolvedTheme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-900/10 border-orange-200/25'}`}>
                          <User className="w-5 h-5 text-sky-500" />
                          <div>
                            <div className="text-[9px] font-mono text-slate-500">CANDIDATE NAME</div>
                            <div className="text-sm font-extrabold">{sessionData.candidate_name}</div>
                          </div>
                        </div>

                        {/* Extracted Skills */}
                        <div>
                          <h4 className={`text-xs uppercase font-bold tracking-wider mb-2.5 flex items-center gap-1.5 ${styles.label}`}>
                            <Layers className="w-3.5 h-3.5" /> Extracted Skills Matrix
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {sessionData.skills && sessionData.skills.length > 0 ? (
                              sessionData.skills.map((skill, index) => (
                                <span 
                                  key={index} 
                                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${resolvedTheme === 'dark' ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' : 'bg-sky-500/10 border-sky-500/20 text-sky-500'}`}
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500 font-mono">No specific skills parsed. Default technical interview selected.</span>
                            )}
                          </div>
                        </div>

                        {/* Extracted Experience / Projects */}
                        {((sessionData.experience && sessionData.experience.length > 0) || (sessionData.projects && sessionData.projects.length > 0)) && (
                          <div className={`border-t pt-4 mt-2 ${resolvedTheme === 'dark' ? 'border-white/5' : 'border-orange-200/20'}`}>
                            <h4 className={`text-xs uppercase font-bold tracking-wider mb-3 flex items-center gap-1.5 ${styles.label}`}>
                              <FileText className="w-3.5 h-3.5" /> Highlighted CV Details
                            </h4>
                            <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                              {sessionData.experience && sessionData.experience.map((exp, idx) => (
                                <div key={idx} className="text-xs border-l-2 border-indigo-500 pl-3 py-0.5">
                                  <div className="font-extrabold">{exp.role} @ {exp.company}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mb-1">{exp.duration}</div>
                                  <div className="text-[10px] text-slate-500 font-medium leading-relaxed">{exp.details}</div>
                                </div>
                              ))}
                              {sessionData.projects && sessionData.projects.map((proj, idx) => (
                                <div key={idx} className="text-xs border-l-2 border-orange-500 pl-3 py-0.5">
                                  <div className="font-extrabold">{proj.title}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mb-1">
                                    Stack: {Array.isArray(proj.tech_stack) ? proj.tech_stack.join(', ') : proj.tech_stack}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-medium leading-relaxed">{proj.description}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI Interactive Voice Interview Console */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className={`border rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between h-full ${styles.card}`}>
                      <div>
                        {/* Header & Voice Toggle */}
                        <div className={`border-b pb-4 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${resolvedTheme === 'dark' ? 'border-white/5' : 'border-orange-200/20'}`}>
                          <div>
                            <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${resolvedTheme === 'dark' ? 'text-fuchsia-400' : 'text-[#800020]'}`}>INTERACTIVE INTERVIEW PRACTICUM</span>
                            <h3 className={`text-xl font-black ${resolvedTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                              Live Voice Practice Engine
                            </h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setTtsEnabled(!ttsEnabled)}
                              title={ttsEnabled ? "ElevenLabs AI Voice Enabled" : "AI Voice Disabled"}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                ttsEnabled 
                                  ? (resolvedTheme === 'dark' ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-orange-100 border-orange-300 text-orange-800')
                                  : (resolvedTheme === 'dark' ? 'bg-slate-800/40 border-white/5 text-slate-500' : 'bg-slate-100 border-slate-300 text-slate-500')
                              }`}
                            >
                              {ttsEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
                              <span>AI Voice {ttsEnabled ? 'ON' : 'OFF'}</span>
                            </button>
                            <div className={`text-[10px] font-mono px-2.5 py-1 rounded-full uppercase tracking-wider ${styles.badge}`}>
                              {persona} ({difficulty})
                            </div>
                          </div>
                        </div>

                        {/* Question Selector Bar */}
                        <QuestionStepper
                          questions={sessionData.questions}
                          currentIndex={currentQuestionIndex}
                          answerScores={answerScores}
                          onSelectQuestion={handleQuestionChange}
                          theme={resolvedTheme}
                        />

                        {/* Timer and Time Pressure Mode Indicator */}
                        <div className="flex items-center justify-between mb-5 mt-2.5 p-3 rounded-xl border border-dashed dark:border-white/10 border-orange-200/60 bg-white/5 backdrop-blur-md">
                          <TimerRing
                            isRunning={isTimerRunning}
                            resetKey={sessionData?.questions?.[currentQuestionIndex]?.id || currentQuestionIndex}
                            onTimeUp={() => {
                              showToast("Time is up! Auto-finalizing response.", "info");
                              if (isRecording) handleToggleRecording();
                            }}
                            theme={resolvedTheme}
                            maxSeconds={120}
                          />
                        </div>

                        {/* Current Question Display Card */}
                        {sessionData.questions && sessionData.questions[currentQuestionIndex] && (
                          <div className="flex flex-col gap-5">
                            {(() => {
                              const currentQ = sessionData.questions[currentQuestionIndex];
                              const scoreData = answerScores[currentQ.id];
                              return (
                                <>
                                  <div className={`p-5 rounded-2xl border flex flex-col gap-3 shadow-inner ${
                                    resolvedTheme === 'dark' ? 'border-indigo-500/30 bg-indigo-950/30' : 'border-orange-200/60 bg-gradient-to-r from-orange-50/50 to-amber-50/40'
                                  }`}>
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="bg-gradient-to-tr from-sky-500 to-indigo-500 text-white font-mono font-black text-xs px-2.5 py-1 rounded-lg">
                                          Question {currentQuestionIndex + 1}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                          currentQ.question_type === 'technical' ? (resolvedTheme === 'dark' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-sky-500/10 text-sky-600 border-sky-500/20') :
                                          currentQ.question_type === 'behavioral' ? (resolvedTheme === 'dark' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20') :
                                          (resolvedTheme === 'dark' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20')
                                        }`}>
                                          {currentQ.question_type}
                                        </span>
                                      </div>

                                      <button
                                        onClick={() => handleListenToQuestion(currentQ.question_text)}
                                        disabled={!ttsEnabled || ttsLoading}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-40 ${
                                          ttsPlaying
                                            ? 'bg-rose-500 text-white animate-pulse'
                                            : (resolvedTheme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white')
                                        }`}
                                      >
                                        {ttsLoading ? (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : ttsPlaying ? (
                                          <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                                        ) : (
                                          <Play className="w-3.5 h-3.5 fill-current" />
                                        )}
                                        <span>{ttsLoading ? 'Synthesizing...' : ttsPlaying ? 'Playing Audio...' : 'Listen to Question'}</span>
                                      </button>
                                    </div>

                                    <p className={`text-base md:text-lg font-extrabold leading-relaxed ${resolvedTheme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                                      "{currentQ.question_text}"
                                    </p>
                                  </div>

                                  {/* Speech-to-Text Recording OR Evaluation Display Panel */}
                                  {isEvaluating ? (
                                    <div className={`p-8 rounded-2xl border flex flex-col items-center justify-center gap-4 text-center ${resolvedTheme === 'dark' ? 'border-white/10 bg-white/5' : 'border-orange-200/50 bg-white/60'}`}>
                                      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                                      <div>
                                        <h4 className="font-black text-sm uppercase tracking-wider mb-1">Evaluating Answer with STAR Framework...</h4>
                                        <p className="text-xs text-slate-500 font-mono">Analyzing Clarity, Technical Accuracy, and Situation/Task/Action/Result compliance</p>
                                      </div>
                                    </div>
                                  ) : scoreData ? (
                                    // Evaluated Score Dashboard & STAR Feedback
                                    <div className="flex flex-col gap-4 animate-fadeIn">
                                      <div className={`p-4 rounded-2xl border flex flex-col gap-4 ${resolvedTheme === 'dark' ? 'border-emerald-500/30 bg-emerald-950/15' : 'border-emerald-300 bg-emerald-50/50'}`}>
                                        <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3 border-emerald-500/20">
                                          <div className="flex items-center gap-2">
                                            <Award className="w-5 h-5 text-emerald-400" />
                                            <span className="font-black text-sm uppercase tracking-wide text-emerald-400">STAR Method Evaluation Complete</span>
                                          </div>
                                          <button
                                            onClick={() => {
                                              setAnswerScores(prev => {
                                                const copy = { ...prev };
                                                delete copy[currentQ.id];
                                                return copy;
                                              });
                                              setLiveTranscript('');
                                            }}
                                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all cursor-pointer"
                                          >
                                            <RefreshCw className="w-3 h-3" /> Re-record Answer
                                          </button>
                                        </div>

                                        {/* Score Gauges Grid */}
                                        <div className="grid grid-cols-3 gap-3 text-center">
                                          <div className={`p-3 rounded-xl border ${resolvedTheme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-white/80 border-emerald-200'}`}>
                                            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Clarity</div>
                                            <div className="text-xl font-black text-sky-400">{scoreData.clarity_score}/10</div>
                                          </div>
                                          <div className={`p-3 rounded-xl border ${resolvedTheme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-white/80 border-emerald-200'}`}>
                                            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Technical</div>
                                            <div className="text-xl font-black text-indigo-400">{scoreData.technical_score}/10</div>
                                          </div>
                                          <div className={`p-3 rounded-xl border ${resolvedTheme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-white/80 border-emerald-200'}`}>
                                            <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Structure (STAR)</div>
                                            <div className="text-xl font-black text-emerald-400">{scoreData.structure_score}/10</div>
                                          </div>
                                        </div>

                                        {scoreData.overall_impression && (
                                          <div className="text-xs font-semibold italic text-emerald-300/90 px-1">
                                            "{scoreData.overall_impression}"
                                          </div>
                                        )}
                                      </div>

                                      {/* Feedback Markdown Card */}
                                      <div className={`p-4 rounded-2xl border flex flex-col gap-2 max-h-[220px] overflow-y-auto ${resolvedTheme === 'dark' ? 'border-white/10 bg-white/5' : 'border-orange-200/50 bg-white'}`}>
                                        <h5 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                                          <Sparkles className="w-3.5 h-3.5" /> Detailed Coach Breakdown
                                        </h5>
                                        <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-300 dark:text-slate-300">
                                          {scoreData.feedback_markdown}
                                        </div>
                                      </div>

                                      {/* 10/10 Model Answer Card */}
                                      {scoreData.model_answer && (
                                        <div className={`p-4 rounded-2xl border flex flex-col gap-2 max-h-[200px] overflow-y-auto ${resolvedTheme === 'dark' ? 'border-amber-500/30 bg-amber-500/10' : 'border-amber-300 bg-amber-50'}`}>
                                          <h5 className="text-xs font-black uppercase tracking-wider text-amber-400 dark:text-amber-300 flex items-center gap-1.5">
                                            <Award className="w-3.5 h-3.5" /> 🌟 10/10 Perfect Model Answer Benchmark
                                          </h5>
                                          <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-200 dark:text-slate-200">
                                            {scoreData.model_answer}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    // Active STT Recording Box
                                    <div className="flex flex-col gap-4">
                                      <div className="flex items-center justify-between flex-wrap gap-3">
                                        <button
                                          onClick={handleToggleRecording}
                                          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-extrabold text-sm transition-all shadow-lg cursor-pointer ${
                                            isRecording
                                              ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                                              : (resolvedTheme === 'dark' ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-indigo-500/20' : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white shadow-orange-500/20')
                                          }`}
                                        >
                                          {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
                                          <span>{isRecording ? 'Stop Recording' : 'Start Recording Answer'}</span>
                                        </button>

                                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                                          {isRecording ? (
                                            <>
                                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                              Listening via Web Speech API...
                                            </>
                                          ) : (
                                            'Speak into mic or type answer below'
                                          )}
                                        </span>
                                      </div>

                                      {/* Live Transcript Area */}
                                      <div className="flex flex-col gap-1.5">
                                        <label className={`text-xs uppercase font-bold tracking-wider ${styles.label}`}>
                                          Spoken Transcript / Answer Text
                                        </label>
                                        <textarea
                                          value={liveTranscript}
                                          onPaste={(e) => {
                                            e.preventDefault();
                                            showToast("⚠️ Anti-Cheat Active: Pasting text from AI models or external tools is disabled to ensure an authentic practice experience. Please speak using your mic or type directly.", "warning");
                                          }}
                                          onChange={(e) => {
                                            const newVal = e.target.value;
                                            if (!isRecording && newVal.length - liveTranscript.length > 80) {
                                              showToast("⚠️ Anti-Cheat Warning: Large block insertion detected. Please type directly or speak using the microphone rather than transferring pre-generated answers.", "warning");
                                              return;
                                            }
                                            setLiveTranscript(newVal);
                                          }}
                                          placeholder={isRecording ? "Listening to your voice... speak naturally at normal or low volume..." : "Click 'Start Recording Answer' above, or type your answer directly (pasting is disabled)..."}
                                          rows={4}
                                          className={`w-full border rounded-2xl p-3.5 text-xs md:text-sm font-sans focus:outline-none transition-all leading-relaxed ${styles.input}`}
                                        />
                                      </div>

                                      <button
                                        onClick={() => handleSubmitAnswer(currentQ.id)}
                                        disabled={!liveTranscript.trim() || isEvaluating}
                                        className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r ${styles.button}`}
                                      >
                                        <Send className="w-4 h-4" />
                                        <span>Submit Answer for STAR Evaluation</span>
                                      </button>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      {/* Navigation Footer Inside Console */}
                      <div className={`mt-6 pt-5 flex flex-col sm:flex-row gap-3 justify-between items-center border-t ${resolvedTheme === 'dark' ? 'border-white/5' : 'border-orange-200/20'}`}>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleQuestionChange(currentQuestionIndex - 1)}
                            disabled={currentQuestionIndex === 0}
                            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 text-xs border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${resolvedTheme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-orange-200/60 hover:bg-orange-50'}`}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" /> Previous
                          </button>
                          <button
                            onClick={() => handleQuestionChange(currentQuestionIndex + 1)}
                            disabled={!sessionData?.questions || currentQuestionIndex >= sessionData.questions.length - 1}
                            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 text-xs border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${resolvedTheme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-orange-200/60 hover:bg-orange-50'}`}
                          >
                            Next <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2.5 items-center justify-end">
                          {Object.keys(answerScores).length > 0 && (
                            <button
                              onClick={handleViewSummaryReport}
                              disabled={isFetchingAnalytics}
                              className="px-4 py-2 rounded-xl font-extrabold flex items-center gap-2 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95 animate-pulse"
                            >
                              {isFetchingAnalytics ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BarChart2 className="w-3.5 h-3.5" />}
                              <span>{isFetchingAnalytics ? 'Generating Report...' : 'Finish & View Final Report'}</span>
                            </button>
                          )}
                          <button 
                            onClick={handleResetSession}
                            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-xs border cursor-pointer transition-all ${resolvedTheme === 'dark' ? 'border-white/10 hover:bg-white/5 text-slate-400 hover:text-white' : 'border-orange-200/60 hover:bg-orange-50 text-slate-600'}`}
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Configure New Session
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeView === 'summary' && analyticsData && (
                // VIEW 4: PERFORMANCE ANALYTICS & EXECUTIVE REPORT DASHBOARD (PHASE 4 & 5)
                <motion.div
                  key="view-summary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-6"
                >
                  <div className={`border rounded-3xl p-6 md:p-8 backdrop-blur-xl flex flex-col gap-6 ${styles.card}`}>
                    {/* Header Bar */}
                    <div className={`border-b pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${resolvedTheme === 'dark' ? 'border-white/5' : 'border-orange-200/20'}`}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded ${
                            analyticsData.readiness_color === 'emerald' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                            analyticsData.readiness_color === 'sky' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' :
                            'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}>
                            EXECUTIVE EVALUATION REPORT
                          </span>
                          <span className="text-xs text-slate-400 font-mono">Session #{analyticsData.session_id}</span>
                        </div>
                        <h3 className={`text-2xl md:text-3xl font-black ${resolvedTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                          Candidate Performance Summary: <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400">{analyticsData.candidate_name}</span>
                        </h3>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleExportPDF}
                          className="px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md transition-all cursor-pointer active:scale-95"
                        >
                          <FileText className="w-3.5 h-3.5" /> Export PDF Report (10/10 Benchmark)
                        </button>
                        <button
                          onClick={handleDownloadReport}
                          className="px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5" /> Export Report (Markdown)
                        </button>
                        <button
                          onClick={() => setActiveView('interview')}
                          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs border transition-all cursor-pointer ${resolvedTheme === 'dark' ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-orange-200/60 hover:bg-orange-50 text-slate-700'}`}
                        >
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to Console
                        </button>
                      </div>
                    </div>

                    {/* Overall Benchmark Banner */}
                    <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
                      resolvedTheme === 'dark' ? 'bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-black/40 border-indigo-500/30' : 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/60 border-orange-300'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                          <Award className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 dark:text-indigo-300">
                            Overall Evaluation Benchmark
                          </div>
                          <div className={`text-lg md:text-xl font-black ${resolvedTheme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                            {analyticsData.readiness_level}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-slate-500/20 w-full md:w-auto justify-around md:justify-end">
                        <div className="text-center">
                          <div className="text-2xl md:text-3xl font-black text-sky-400">{analyticsData.overall_score}/10</div>
                          <div className="text-[10px] font-mono uppercase text-slate-400">Overall Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl md:text-3xl font-black text-emerald-400">{analyticsData.answered_questions}/{analyticsData.total_questions}</div>
                          <div className="text-[10px] font-mono uppercase text-slate-400">Questions Completed</div>
                        </div>
                      </div>
                    </div>

                    {/* Dimension Gauges Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className={`p-5 rounded-2xl border flex flex-col gap-2 ${resolvedTheme === 'dark' ? 'bg-black/25 border-white/5' : 'bg-white/80 border-orange-200/60'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider font-mono text-sky-400">Clarity & Articulation</span>
                          <TrendingUp className="w-4 h-4 text-sky-400" />
                        </div>
                        <div className="text-3xl font-black text-sky-400 mt-1">{analyticsData.average_clarity} <span className="text-sm font-normal text-slate-500">/ 10</span></div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                          Measures vocal coherence, precision of language, and structured narrative delivery across responses.
                        </p>
                      </div>

                      <div className={`p-5 rounded-2xl border flex flex-col gap-2 ${resolvedTheme === 'dark' ? 'bg-black/25 border-white/5' : 'bg-white/80 border-orange-200/60'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider font-mono text-indigo-400">Technical Mastery</span>
                          <Cpu className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="text-3xl font-black text-indigo-400 mt-1">{analyticsData.average_technical} <span className="text-sm font-normal text-slate-500">/ 10</span></div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                          Evaluates depth of domain concepts, architectural tradeoffs, and engineering correctness in your stack.
                        </p>
                      </div>

                      <div className={`p-5 rounded-2xl border flex flex-col gap-2 ${resolvedTheme === 'dark' ? 'bg-black/25 border-white/5' : 'bg-white/80 border-orange-200/60'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider font-mono text-emerald-400">STAR Structure Compliance</span>
                          <Layers className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-3xl font-black text-emerald-400 mt-1">{analyticsData.average_structure} <span className="text-sm font-normal text-slate-500">/ 10</span></div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                          Scored on clear Situation/Task framing, quantifiable Action steps, and measurable concrete Results.
                        </p>
                      </div>
                    </div>

                    {/* Question Breakdown List & Executive Markdown Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
                      <div className="lg:col-span-6 flex flex-col gap-4">
                        <h4 className="text-sm font-black uppercase tracking-wider font-mono flex items-center gap-2 text-indigo-400">
                          <CheckCircle2 className="w-4 h-4" /> Individual Question Breakdown
                        </h4>
                        <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
                          {analyticsData.question_breakdown.map((item, idx) => (
                            <div 
                              key={idx}
                              className={`p-4 rounded-2xl border flex flex-col gap-2.5 ${resolvedTheme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-orange-200/60 shadow-sm'}`}
                            >
                              <div className="flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="bg-indigo-600 text-white font-mono font-black text-[10px] px-2 py-0.5 rounded">Q{idx + 1}</span>
                                  <span className="text-[10px] font-bold uppercase text-slate-400">{item.question_type}</span>
                                </div>
                                {item.answered ? (
                                  <div className="flex gap-2 text-[11px] font-mono font-bold">
                                    <span className="text-sky-400">C: {item.clarity_score}</span>
                                    <span className="text-indigo-400">T: {item.technical_score}</span>
                                    <span className="text-emerald-400">S: {item.structure_score}</span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-mono text-rose-400 font-semibold">Unanswered</span>
                                )}
                              </div>
                              <p className={`text-xs font-bold leading-relaxed ${resolvedTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                                "{item.question_text}"
                              </p>
                              {item.answered && (
                                <div className="text-[11px] text-slate-400 italic bg-black/10 dark:bg-black/30 p-2.5 rounded-xl font-sans">
                                  {item.feedback_summary}
                                </div>
                              )}
                              {item.model_answer && (
                                <div className="text-[11px] border border-amber-500/30 bg-amber-500/10 text-amber-200 dark:text-amber-200 p-2.5 rounded-xl font-sans mt-1 whitespace-pre-wrap">
                                  <div className="font-bold uppercase text-[10px] text-amber-400 mb-1 flex items-center gap-1">
                                    <Award className="w-3 h-3" /> 🌟 10/10 Perfect Model Answer Benchmark:
                                  </div>
                                  {item.model_answer}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Executive Summary Markdown Preview */}
                      <div className="lg:col-span-6 flex flex-col gap-4">
                        <h4 className="text-sm font-black uppercase tracking-wider font-mono flex items-center gap-2 text-fuchsia-400">
                          <FileText className="w-4 h-4" /> Executive Coaching Brief & Action Plan
                        </h4>
                        <div className={`p-5 rounded-2xl border flex flex-col gap-3 flex-grow overflow-y-auto max-h-[420px] ${resolvedTheme === 'dark' ? 'bg-black/30 border-white/10 text-slate-300' : 'bg-white border-orange-200/60 text-slate-700 font-medium shadow-sm'}`}>
                          <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                            {analyticsData.executive_summary_markdown}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions inside Summary */}
                    <div className={`pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4 ${resolvedTheme === 'dark' ? 'border-white/5' : 'border-orange-200/20'}`}>
                      <span className="text-xs text-slate-500 font-mono">
                        Ready to level up your scores? Start another targeted session with higher difficulty.
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={handleResetSession}
                          className="px-6 py-3 rounded-2xl font-black text-xs bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Start New Practice Session
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Footer */}
          <footer className={`w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-t text-[11px] z-10 font-mono ${styles.footerBorders}`}>
            <span>© 2026 AI Interview Coach</span>
            <span>Built with React + Tailwind + FastAPI</span>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
