'use client'
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Bot,
  User,
  RefreshCw,
  Sparkles,
  Zap,
  ArrowRight,
  Cpu,
  Wand2,
  Star,
  Paperclip,
  X,
  FileQuestion,
  FileText,
  MessageCircleMoreIcon,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MarkdownRenderer from "@/components/Shared/MarkdownRenderer";
import AnimatedBackground from "@/components/Animations/AnimateBackground";
import Image from "next/image";
// Types
interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  attachments?: File[];
}

interface ChatSession {
  sessionId: string;
  userId: string;
  messages: Message[];
}

interface ApiResponse {
  answer: string;
  session_id: string;
  user_id: string;
}

// API functions

// API functions
const api = {
  async sendMessage(
    userId: string,
    sessionId: string,
    message: string
  ): Promise<string> {
    try {
      // Get API URL from environment variable with fallback
      const apiUrl =
        process.env.NEXT_PUBLIC_CEDAR_CHATBOT_API ||
        "https://chatbot.collectco.com/cedarbot/api/";

      // Prepare form data
      const formData = new URLSearchParams();
      formData.append("question", message);
      formData.append("session_id", sessionId);
      formData.append("user_id", userId);

      // Make API request
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Response Error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse JSON response
      const data: ApiResponse = await response.json();

      // Return the answer or throw error if no answer
      if (!data.answer) {
        throw new Error("No answer received from API");
      }

      return data.answer;
    } catch (error) {
      console.error("API Error:", error);

      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Network error. Please check your internet connection and try again."
        );
      }

      if (error instanceof Error) {
        throw new Error(`API Error: ${error.message}`);
      }

      throw new Error("Failed to get response from chatbot. Please try again.");
    }
  },

  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Optional: Method to check API health
  async checkHealth(): Promise<boolean> {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_CEDAR_CHATBOT_API ||
        "https://chatbot.collectco.com/cedarbot/api/";
      const response = await fetch(apiUrl, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  },
};

// Attachment Preview Component
const AttachmentPreview: React.FC<{ file: File; onRemove: () => void }> = ({
  file,
  onRemove,
}) => {
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/"))
      return <FileQuestion className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2"
    >
      {getFileIcon(file)}
      <span className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate max-w-32">
        {file.name}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-6 w-6 text-blue-600 hover:text-red-500 hover:bg-red-50"
      >
        <X className="w-3 h-3" />
      </Button>
    </motion.div>
  );
};

// Main Chatbot Component
const Chatbot: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [customSessionId, setCustomSessionId] = useState("");
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  useEffect(() => {
    if (currentSession && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentSession]);

  const startSession = () => {
    if (!userId.trim()) return;

    const sessionId = customSessionId.trim() || api.generateSessionId();

    setCurrentSession({
      sessionId,
      userId: userId.trim(),
      messages: [],
    });
  };

  const sendMessage = async () => {
    if (
      (!message.trim() && attachments.length === 0) ||
      !currentSession ||
      isLoading
    )
      return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: message.trim() || "📎 Attachment sent",
      sender: "user",
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setCurrentSession((prev) =>
      prev
        ? {
          ...prev,
          messages: [...prev.messages, userMessage],
        }
        : null
    );

    setMessage("");
    setAttachments([]);
    setIsLoading(true);

    try {
      const response = await api.sendMessage(
        currentSession.userId,
        currentSession.sessionId,
        userMessage.content
      );

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        content: response,
        sender: "bot",
        timestamp: new Date(),
      };

      setCurrentSession((prev) =>
        prev
          ? {
            ...prev,
            messages: [...prev.messages, botMessage],
          }
          : null
      );
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content:
          error instanceof Error
            ? error.message
            : "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };

      setCurrentSession((prev) =>
        prev
          ? {
            ...prev,
            messages: [...prev.messages, errorMessage],
          }
          : null
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetSession = () => {
    setCurrentSession(null);
    setUserId("");
    setCustomSessionId("");
    setMessage("");
    setAttachments([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Ultra Premium Welcome Screen with shadcn/ui - Now Responsive
  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-900 flex items-center justify-center p-2 sm:p-4 lg:p-8 relative overflow-hidden">
        <AnimatedBackground />
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            <defs>
              <pattern
                id="grid"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="1"
                />
              </pattern>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <motion.div
          className="w-fit max-w-md lg:max-w-lg xl:max-w-xl relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-white/10 backdrop-blur-2xl border-white/20 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg"></div>

            <motion.div
              className="text-center mb-6 lg:mb-10 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <motion.div
                className="relative mb-6 lg:mb-8"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 rounded-2xl blur-lg opacity-75"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Image
                      width={100}
                      height={100}
                      src="/logo.png"
                      alt="Cedar ChatBot AI"
                      className="bg-white p-1 sm:p-2 rounded-xl w-full h-full object-contain"
                    />
                  </div>
                </div>
              </motion.div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-white via-blue-100 to-blue-100 bg-clip-text text-transparent mb-4 tracking-tight">
                CedarBot AI
              </h1>
            </motion.div>

            <motion.div
              className="space-y-4 lg:space-y-6 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="space-y-2">
                <Label className="text-white/90 font-bold flex items-center text-sm lg:text-base">
                  <Button
                    size="icon"
                    className="w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center mr-2 lg:mr-3"
                  >
                    <User className="w-2 h-2 lg:w-3 lg:h-3 text-white" />
                  </Button>
                  Enter Name / Number *
                </Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e: any) => setUserId(e.target.value)}
                  placeholder="Enter UserName/Number"
                  className="bg-white backdrop-blur-xl border-white/20 text-primary placeholder-white/50 font-medium focus:border-blue-400/50 focus:ring-blue-500/30 h-12 lg:h-auto"
                  onKeyPress={(e: any) => e.key === "Enter" && startSession()}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/90 font-bold flex items-center text-sm lg:text-base">
                  <Button
                    size="icon"
                    className="w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center mr-2 lg:mr-3"
                  >
                    <Zap className="w-2 h-2 lg:w-3 lg:h-3 text-white" />
                  </Button>
                  Session ID [optional]
                </Label>
                <Input
                  id="sessionId"
                  value={customSessionId}
                  onChange={(e: any) => setCustomSessionId(e.target.value)}
                  placeholder="Auto-generated session ID"
                  className="bg-white backdrop-blur-xl border-white/20 text-primary placeholder-white/50 font-medium focus:border-blue-400/50 focus:ring-blue-500/30 h-12 lg:h-auto"
                  onKeyPress={(e: any) => e.key === "Enter" && startSession()}
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={startSession}
                  disabled={!userId.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 hover:from-blue-600 hover:via-blue-600 hover:to-blue-600 disabled:from-gray-500 disabled:via-gray-500 disabled:to-gray-500 text-white font-bold py-4 lg:py-5 px-6 lg:px-8 text-base lg:text-lg shadow-2xl disabled:shadow-none hover:shadow-blue-500/50 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <MessageCircleMoreIcon className="w-5 h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3" />
                  <span>Start Conversation</span>
                  <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 ml-2 lg:ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </motion.div>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Ultra Premium Chat Interface with shadcn/ui - Now Responsive
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 dark:from-slate-900 dark:via-blue-900 dark:to-blue-900 relative overflow-auto">
      {/* Ultra Premium Header - Responsive */}
      <motion.div
        className="relative bg-white/80 backdrop-blur-2xl dark:bg-gray-900/80 border-b border-blue-200/50 dark:border-blue-800/30 px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 shadow-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-500/5"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 via-blue-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-gradient-to-r from-blue-400 to-emerald-500 rounded-full border-2 sm:border-3 border-white animate-pulse shadow-lg"></div>
            </motion.div>
            <div className="min-w-0 flex-1">
              <h2 className="font-black text-lg sm:text-xl lg:text-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 bg-clip-text text-transparent">
                CedarBot AI
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1 sm:space-y-0">
                <div className="flex items-center space-x-1 sm:space-x-2 bg-blue-50 dark:bg-blue-900/30 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  <User className="w-2 h-2 sm:w-3 sm:h-3" />
                  <span className="font-semibold truncate max-w-20 sm:max-w-none">
                    {currentSession.userId}
                  </span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 bg-blue-50 dark:bg-blue-900/30 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  <Zap className="w-2 h-2 sm:w-3 sm:h-3" />
                  <span className="font-mono text-xs">
                    {currentSession.sessionId.slice(-8)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              title="Reset Session"
              onClick={resetSession}
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Ultra Premium Messages Area - Responsive */}
      <div className="flex-1 p-3 sm:p-4 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 relative overflow-auto scrollbar-hide">
        {currentSession.messages.length === 0 && (
          <motion.div
            className="text-center py-10 sm:py-16 lg:py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="relative mb-6 lg:mb-8"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-500 rounded-3xl blur-2xl opacity-30 scale-110"></div>
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 via-blue-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                <Bot className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
              </div>
            </motion.div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 bg-clip-text text-transparent mb-3 lg:mb-4">
              Welcome, {currentSession.userId}! 🚀
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg lg:text-xl max-w-xl lg:max-w-2xl mx-auto leading-relaxed px-4">
              I'm your advanced AI companion, I can help you understand Cedar
              Financial's policies related to HR, compliance, and IT
            </p>
          </motion.div>
        )}

        {currentSession.messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
              } group`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div
              className={`flex items-start max-w-[95%] sm:max-w-4xl lg:max-w-5xl
    ${msg.sender === "user"
                  ? "flex-row-reverse gap-2 sm:gap-4 lg:gap-6"
                  : "gap-2 sm:gap-4 lg:gap-6"
                }`}
            >
              <motion.div
                className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl relative ${msg.sender === "user"
                    ? "bg-gradient-to-br from-blue-500 via-blue-500 to-blue-500 "
                    : "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900"
                  }`}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                {msg.sender === "user" ? (
                  <User className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white relative z-10" />
                ) : (
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white relative z-10" />
                )}
              </motion.div>

              <motion.div
                className={`rounded-2xl sm:rounded-3xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 shadow-2xl transition-all duration-300 group-hover:shadow-3xl relative overflow-hidden min-w-0 ${msg.sender === "user"
                    ? "bg-gradient-to-br from-blue-500 via-blue-500 to-blue-500 text-white"
                    : "bg-white/90 backdrop-blur-xl dark:bg-gray-800/90 text-gray-900 dark:text-white border border-blue-100/50 dark:border-blue-800/30"
                  }`}
              >
                {msg.sender === "user" ? (
                  <div className="relative z-10">
                    <p className="text-sm sm:text-base leading-relaxed font-medium mb-2 break-words">
                      {msg.content}
                    </p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {msg.attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1"
                          >
                            {file.type.startsWith("image/") ? (
                              <FileQuestion className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                            <span className="text-xs sm:text-sm truncate max-w-20 sm:max-w-none">
                              {file.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative z-10 prose prose-sm sm:prose-base max-w-none">
                    <MarkdownRenderer content={msg.content} />
                  </div>
                )}
                <div
                  className={`flex items-center mt-3 sm:mt-4 relative z-10 ${msg.sender === "user"
                      ? "text-blue-100/80"
                      : "text-gray-500 dark:text-gray-400"
                    }`}
                >
                  <div className="flex items-center space-x-2 text-xs font-medium">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-current rounded-full animate-pulse"></div>
                    <span>{msg.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            className="flex justify-start group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex space-x-2 sm:space-x-4 lg:space-x-6 max-w-[95%] sm:max-w-4xl lg:max-w-5xl">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white relative z-10" />
              </div>
              <div className="bg-white/90 backdrop-blur-xl dark:bg-gray-800/90 rounded-2xl sm:rounded-3xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 border border-blue-100/50 dark:border-blue-800/30 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl sm:rounded-3xl"></div>
                <div className="flex items-center space-x-2 sm:space-x-4 relative z-10">
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-blue-500 to-blue-500 rounded-full"
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Ultra Premium Input Area with shadcn/ui - Responsive */}
      <motion.div
        className="relative bg-white/80 backdrop-blur-2xl dark:bg-gray-900/80 border-t border-blue-200/50 dark:border-blue-800/30 p-3 sm:p-4 lg:p-8 shadow-2xl"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-500/5"></div>

        {/* Attachments Preview - Responsive */}
        {attachments.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2 mb-3 sm:mb-4 relative z-10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {attachments.map((file, index) => (
              <AttachmentPreview
                key={index}
                file={file}
                onRemove={() => removeAttachment(index)}
              />
            ))}
          </motion.div>
        )}

        <div className="flex space-x-2 sm:space-x-3 lg:space-x-4 max-w-7xl mx-auto relative z-10">
          <div className="flex-1 relative min-w-0">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-500/10 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"
              whileFocus={{ opacity: 1 }}
            />
            <Input
              ref={inputRef}
              value={message}
              onChange={(e: any) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask with AI ..."
              disabled={isLoading}
              className="w-full h-12 sm:h-14 lg:h-16 px-4 sm:px-5 lg:px-6 pr-12 sm:pr-14 lg:pr-16 text-sm sm:text-base lg:text-lg bg-white/90 backdrop-blur-xl border-2 border-blue-200/50 dark:border-blue-700/50 focus:border-blue-500/50 focus:ring-blue-500/20 dark:bg-gray-800/90 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium shadow-xl rounded-xl sm:rounded-2xl"
            />
            <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={true} // Disabled for now as requested
                  className="text-gray-400 hover:text-blue-500 disabled:opacity-30 w-6 h-6 sm:w-8 sm:h-8"
                  title="File upload (Coming Soon)"
                >
                  <Paperclip className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </Button>
              </motion.div>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 hover:from-blue-600 hover:via-blue-600 hover:to-blue-600 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white shadow-2xl disabled:shadow-none hover:shadow-blue-500/50 relative overflow-hidden group rounded-xl sm:rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl"></div>
              <motion.div
                animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={{
                  duration: 2,
                  repeat: isLoading ? Infinity : 0,
                  ease: "linear",
                }}
              >
                <Send className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 relative z-10" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-500/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Button>
          </motion.div>
        </div>
        {/* Hidden file input */}
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </motion.div>
    </div>
  );
};

export default Chatbot;
