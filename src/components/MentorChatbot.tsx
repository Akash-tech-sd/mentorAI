import React, { useState, useEffect, useRef } from 'react';
import { InternshipTask, UserProfile, ChatMessage } from '../types';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Star, 
  Check, 
  Copy, 
  BookOpen, 
  Bot, 
  User, 
  Trash2,
  Code2
} from 'lucide-react';

interface MentorChatbotProps {
  currentUser: UserProfile;
  tasks: InternshipTask[];
  selectedTask?: InternshipTask;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const MentorChatbot: React.FC<MentorChatbotProps> = ({
  currentUser,
  tasks,
  selectedTask,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [activeTaskContext, setActiveTaskContext] = useState<InternshipTask | undefined>(selectedTask);
  const [feedbackModalMessage, setFeedbackModalMessage] = useState<ChatMessage | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackCategory, setFeedbackCategory] = useState<string>('explanation');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/chat/history?internId=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setMessages(data);
          } else {
            // Seed a friendly mentor welcome message
            setMessages([
              {
                id: 'welcome-1',
                sender: 'assistant',
                content: `Hello ${currentUser.name}! I am **Dr. Nova**, your Lead Data Analytics Mentor.\n\nI'm here to guide you through your one-year internship curriculum—from **Advanced Excel & SQL** to **Python Data Pipelines, Power BI DAX**, and your **Final Capstone Project**.\n\nYou can ask me for:\n- Step-by-step explanations of difficult concepts\n- Clean SQL queries or Python/Pandas code snippets\n- Debugging hints for your current assignment\n- Viva and technical review preparation\n\nHow can I help your data journey today?`,
                timestamp: new Date().toISOString(),
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };

    fetchHistory();
  }, [currentUser.id]);

  // Handle incoming initial prompt from other views
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setInputText(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt, onClearInitialPrompt]);

  // Update task context when selectedTask prop changes
  useEffect(() => {
    if (selectedTask) {
      setActiveTaskContext(selectedTask);
    }
  }, [selectedTask]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Setup Web Speech API speech-to-text
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  const playTTS = async (text: string, base64Audio?: string) => {
    // Stop any existing playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    if (!voiceEnabled) return;

    if (base64Audio) {
      try {
        const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
        currentAudioRef.current = audio;
        audio.play().catch(e => console.warn('Audio play error:', e));
        return;
      } catch (err) {
        console.warn('Failed to play base64 audio:', err);
      }
    }

    // Attempt backend Gemini TTS call if no base64Audio attached
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 300) }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          currentAudioRef.current = audio;
          audio.play();
          return;
        }
      }
    } catch (err) {
      // Fallback to browser SpeechSynthesis
    }

    // Browser SpeechSynthesis fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
      taskIdContext: activeTaskContext?.id,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          internId: currentUser.id,
          taskId: activeTaskContext?.id,
          enableVoice: voiceEnabled,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat query failed');

      const botMessage: ChatMessage = data.message;
      setMessages((prev) => [...prev, botMessage]);

      if (voiceEnabled) {
        playTTS(botMessage.content, data.audioBase64);
      }
    } catch (err: any) {
      console.error('Error sending chat message:', err);
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        content: `I ran into an issue processing your query. Please make sure your backend connection is active and retry. (Error: ${err.message})`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Clear chat history with Mentor?')) {
      await fetch('/api/chat/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internId: currentUser.id }),
      });
      setMessages([]);
    }
  };

  const handleCopyCode = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleOpenFeedback = (msg: ChatMessage) => {
    setFeedbackModalMessage(msg);
    setFeedbackRating(5);
    setFeedbackComment('');
    setFeedbackCategory('explanation');
  };

  const submitFeedback = async () => {
    if (!feedbackModalMessage) return;

    try {
      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: feedbackModalMessage.id,
          internId: currentUser.id,
          rating: feedbackRating,
          comment: feedbackComment,
          category: feedbackCategory,
          userPromptPreview: 'Chat interaction',
          botResponsePreview: feedbackModalMessage.content.slice(0, 150),
        }),
      });

      // Update message feedback locally
      setMessages((prev) =>
        prev.map((m) =>
          m.id === feedbackModalMessage.id
            ? {
                ...m,
                feedback: {
                  rating: feedbackRating,
                  comment: feedbackComment,
                  category: feedbackCategory as any,
                  submittedAt: new Date().toISOString(),
                },
              }
            : m
        )
      );

      setFeedbackModalMessage(null);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  // Quick prompt suggestions
  const suggestedPrompts = [
    { label: 'Explain SQL Window Functions', prompt: 'Explain SQL Window Functions: ROW_NUMBER(), RANK(), and DENSE_RANK() with an e-commerce order table example.' },
    { label: 'Star Schema in Power BI', prompt: 'How do I construct a clean Star Schema in Power BI? What are Fact vs Dimension tables and why avoid bidirectional relationships?' },
    { label: 'XLOOKUP vs INDEX/MATCH', prompt: 'In Excel, when should I prefer XLOOKUP over INDEX/MATCH? Can you provide formula syntax examples?' },
    { label: 'A/B Test Statistical Power', prompt: 'How do I calculate sample size and statistical power for a website conversion A/B test before running the experiment?' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Mentor Header */}
      <div className="p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Dr. Nova &bull; AI Internship Mentor
              </h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Gemini 3.8 Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Lead Data Scientist & Pedagogical Advisor &bull; Voice & Code Enabled
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          
          {/* Task Context Selector */}
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400">
            <span className="font-medium">Context:</span>
            <select
              value={activeTaskContext?.id || ''}
              onChange={(e) => {
                const target = tasks.find((t) => t.id === e.target.value);
                setActiveTaskContext(target);
              }}
              className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[200px] truncate"
            >
              <option value="">General Curriculum</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  M{t.month}: {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Output Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-lg border transition ${
              voiceEnabled
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title={voiceEnabled ? 'Spoken Voice: ON (Gemini TTS)' : 'Spoken Voice: OFF'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Clear Chat */}
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700/80 transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  isUser
                    ? 'bg-blue-600 shadow-sm'
                    : 'bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-sm'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none'
                  }`}
                >
                  {/* Message Content rendered with line breaks */}
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.content}
                  </div>
                </div>

                {/* Assistant message footer: Audio play, Copy, and 5-Star Feedback */}
                {!isUser && (
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 px-1">
                    <button
                      onClick={() => playTTS(msg.content, msg.audioBase64)}
                      className="hover:text-blue-300 flex items-center space-x-1"
                      title="Listen to spoken audio"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Speak</span>
                    </button>

                    <button
                      onClick={() => handleCopyCode(msg.content, index)}
                      className="hover:text-blue-300 flex items-center space-x-1"
                      title="Copy response"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {/* Rate response button (Feature 8) */}
                    <button
                      onClick={() => handleOpenFeedback(msg)}
                      className="hover:text-amber-300 flex items-center space-x-1 text-slate-400"
                    >
                      <Star className={`w-3.5 h-3.5 ${msg.feedback ? 'text-amber-400 fill-amber-400' : ''}`} />
                      <span>{msg.feedback ? `Rated ${msg.feedback.rating}★` : 'Rate Answer'}</span>
                    </button>

                    <span className="text-slate-600 ml-auto">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shrink-0 text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800 border border-slate-700/80 p-4 rounded-2xl rounded-tl-none text-xs text-slate-300 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="ml-2 text-slate-400">Dr. Nova is synthesizing explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/60 flex items-center space-x-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold text-slate-500 shrink-0">Quick Topics:</span>
        {suggestedPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(p.prompt)}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap text-[11px] transition"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          {/* Voice Input Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl transition ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'
            }`}
            title={isListening ? 'Listening... Click to stop' : 'Click to Speak (Speech-to-Text)'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : activeTaskContext
                ? `Ask Dr. Nova about Task ${activeTaskContext.taskNumber} (${activeTaskContext.domain})...`
                : 'Ask anything about SQL, Python, Excel, Power BI, or your tasks...'
            }
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Chatbot Feedback Modal (Feature 8) */}
      {feedbackModalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Rate Mentor Response</span>
            </h3>
            <p className="text-xs text-slate-300">
              Your feedback is stored in the database and reviewed by the academic board to continuously improve guidance.
            </p>

            {/* Star Rating */}
            <div className="flex items-center justify-center space-x-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= feedbackRating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Feedback Category</label>
              <select
                value={feedbackCategory}
                onChange={(e) => setFeedbackCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              >
                <option value="explanation">Explanation Clarity & Depth</option>
                <option value="code_quality">Code Syntax & Best Practices</option>
                <option value="accuracy">Technical Accuracy</option>
                <option value="tone">Mentoring Tone & Encouragement</option>
                <option value="other">Other Suggestions</option>
              </select>
            </div>

            {/* Comments */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Comments or Suggestions</label>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                rows={3}
                placeholder="What was helpful? What could be explained better?"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setFeedbackModalMessage(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitFeedback}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
