"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getUser, logout, isAdmin } from "../auth";
import { useLanguage } from "../../context/LanguageContext";
import { sendMessage, getHistory, uploadDocument, pollDocumentStatus } from "../../lib/api";
import { ConversationMessage, ChatResponse } from "../../types";

/**
 * FormattedChatContent
 * Renders professional human-like messages with bolding, lists, links, and Arabic RTL support.
 */
function FormattedChatContent({ content }: { content: string }) {
  // Detect Arabic: only RTL if >25% of letter characters are Arabic script
  // This prevents English responses containing Arabic portal names from flipping RTL
  const arabicLetters = (content.match(/[\u0600-\u06FF]/g) || []).length;
  const totalLetters = (content.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length;
  const isArabic = totalLetters > 0 && (arabicLetters / totalLetters) > 0.25;

  // Helper to parse bold **text** and links [title](url) or raw URLs
  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-bold text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={idx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs mx-0.5 transition-colors"
          >
            <span>{linkMatch[1]}</span>
            <span className="material-symbols-outlined text-[12px]">open_in_new</span>
          </a>
        );
      }
      if (part.startsWith("http://") || part.startsWith("https://")) {
        return (
          <a
            key={idx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs mx-0.5 break-all transition-colors"
          >
            <span>{part.replace(/^https?:\/\/(www\.)?/, "")}</span>
            <span className="material-symbols-outlined text-[12px]">open_in_new</span>
          </a>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const lines = content.split("\n");

  return (
    <div
      className={`space-y-2.5 text-[15px] leading-relaxed text-slate-800 ${isArabic ? "text-right" : "text-left"}`}
      dir={isArabic ? "rtl" : "ltr"}
      style={{ unicodeBidi: "embed" }}
    >
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={i} className="h-1.5" />;
        }

        // Heading ###
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={i} className="font-bold text-[16px] text-slate-900 mt-3.5 mb-1.5 pb-1 border-b border-slate-200 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span>
              <span>{renderInline(trimmed.replace(/^###\s+/, ""))}</span>
            </h4>
          );
        }

        // Bullet point (•, -, *)
        if (/^[•\-*]\s+/.test(trimmed)) {
          return (
            <div key={i} className={`flex items-start gap-2.5 my-1.5 ${isArabic ? "mr-1" : "ml-1"}`}>
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2"></span>
              <span className="flex-1 leading-relaxed text-slate-800 font-normal">{renderInline(trimmed.replace(/^[•\-*]\s+/, ""))}</span>
            </div>
          );
        }

        // Numbered list (1., 2., etc.)
        const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={i} className={`flex items-start gap-3 my-2 ${isArabic ? "mr-1" : "ml-1"}`}>
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                {numMatch[1]}
              </span>
              <span className="flex-1 leading-relaxed text-slate-800 font-normal">{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={i} className="leading-relaxed text-slate-800 font-normal">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function ChatPortal() {
  const { lang, setLang } = useLanguage();
  const [authorized, setAuthorized] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      window.location.href = "/login";
    } else {
      setAuthorized(true);
      const userKey = `govassist_request_id_${user.email}`;
      const storedReqId = localStorage.getItem(userKey);
      if (storedReqId) {
        setRequestId(storedReqId);
        loadHistory(storedReqId);
      } else {
        setMessages([
          {
            id: Date.now().toString(),
            role: "agent",
            agent_name: "GovAssist AI",
            content: lang === "ar" ? "مرحباً بك في نظام المساعدة الذكي. كيف يمكنني مساعدتك؟" : "Welcome to GovAssist AI. How can I help you today?",
            timestamp: new Date().toISOString(),
          }
        ]);
      }
    }
  }, [lang]);

  const loadHistory = async (reqId: string) => {
    try {
      const history = await getHistory(reqId);
      setMessages(history.messages);
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText("");

    const newMsg: ConversationMessage = {
      id: Date.now().toString(),
      role: "citizen",
      content: userText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);

    setIsLoading(true);
    try {
      const res: ChatResponse = await sendMessage({
        citizen_message: userText,
        language: lang,
        request_id: requestId || undefined,
        citizen_id: getUser()?.email,
      });

      if (!requestId) {
        setRequestId(res.request_id);
        const user = getUser();
        if (user) {
          localStorage.setItem(`govassist_request_id_${user.email}`, res.request_id);
        }
      }

      const agentMsg: ConversationMessage = {
        id: res.message_id,
        role: "agent",
        agent_name: res.agent_response.agent_name,
        content: res.agent_response.content,
        confidence: res.agent_response.confidence,
        citations: res.agent_response.citations,
        timestamp: res.timestamp,
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (error: any) {
      console.error("Error sending message", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "agent",
          agent_name: "System Error",
          content: lang === "ar" 
            ? "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى."
            : "⚠️ Unable to connect to the backend service. Please try again in a few moments.",
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // We must have a request ID to upload a document
    let currentReqId = requestId;
    if (!currentReqId) {
      alert("Please send a message first before uploading a document.");
      return;
    }

    setIsUploading(true);

    try {
      const res = await uploadDocument(file, currentReqId);
      
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await pollDocumentStatus(res.document_id);
          if (statusRes.status !== 'pending' || attempts >= 10) {
            clearInterval(pollInterval);
            setIsUploading(false);
            
            // Trigger Verification Agent to respond with the document summary in chat
            try {
              const agentRes = await sendMessage({
                citizen_message: "Document uploaded. Please verify its details.",
                language: lang,
                request_id: currentReqId!,
                citizen_id: getUser()?.email,
              });

              setMessages((prev) => [
                ...prev,
                {
                  id: agentRes.message_id,
                  role: "agent",
                  agent_name: agentRes.agent_response.agent_name,
                  content: agentRes.agent_response.content,
                  confidence: agentRes.agent_response.confidence,
                  timestamp: agentRes.timestamp,
                },
              ]);
            } catch {
              loadHistory(currentReqId!);
            }
          }
        } catch {
          if (attempts >= 5) {
            clearInterval(pollInterval);
            setIsUploading(false);
          }
        }
      }, 1500);

    } catch (error) {
      console.error("Upload failed", error);
      setIsUploading(false);
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-slate-900 flex flex-col h-screen overflow-hidden font-body-md selection:bg-blue-600 selection:text-white">
      {/* TopNavBar - White & Clean matching rest of the website */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 w-full top-0 z-50 shrink-0 shadow-2xs">
        <nav className="flex justify-between items-center px-4 sm:px-8 h-16 w-full">
          <div className="flex items-center gap-6 sm:gap-8">
            <Link href="/" className="font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-2 text-lg sm:text-xl">
              <span className="material-symbols-outlined text-blue-600 text-2xl">account_balance</span>
              <span>GovAssist AI</span>
            </Link>
            <div className="hidden md:flex gap-6">
              <Link
                className="font-medium text-slate-600 hover:text-blue-600 transition-colors text-sm"
                href="/admin"
              >
                Dashboard
              </Link>
              <Link
                className="font-medium text-slate-600 hover:text-blue-600 transition-colors text-sm"
                href="/services"
              >
                Services
              </Link>
              <Link
                className="font-semibold text-blue-600 border-b-2 border-blue-600 pb-1 text-sm"
                href="/chat"
              >
                AI Assistant
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="text-blue-700 border border-blue-200 bg-blue-50/80 hover:bg-blue-100 font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              {lang === "en" ? "EN/AR" : "AR/EN"}
            </button>
            <button className="text-slate-500 cursor-pointer hover:text-blue-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-700 font-medium">
                {getUser()?.name || getUser()?.email || "citizen@govassist.ai"}
              </span>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                {getUser()?.avatar ? (
                  <img
                    className="w-full h-full object-cover"
                    alt={getUser()?.name || "User"}
                    src={getUser()?.avatar}
                  />
                ) : (
                  <span className="material-symbols-outlined text-[18px] text-blue-600">person</span>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* SideNavBar - Clean White Sidebar */}
        <aside className="hidden lg:flex flex-col h-full w-64 bg-white border-r border-slate-200 p-4 shrink-0 shadow-2xs">
          <div className="mb-6">
            <h2 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
              {isAdmin() ? "Admin Portal" : "Citizen Portal"}
            </h2>
            <p className="text-xs text-slate-500">
              {isAdmin() ? "Government Administration" : "Saudi Government Services"}
            </p>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            {isAdmin() ? (
              // Admin Links
              <>
                <Link
                  className="flex items-center gap-3 p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all text-sm font-medium"
                  href="/admin"
                >
                  <span className="material-symbols-outlined text-lg">dashboard</span>
                  <span>Overview</span>
                </Link>
                <Link
                  className="flex items-center gap-3 p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all text-sm font-medium"
                  href="/agents"
                >
                  <span className="material-symbols-outlined text-lg">smart_toy</span>
                  <span>AI Agents</span>
                </Link>
                <Link
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm text-sm"
                  href="/chat"
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    chat
                  </span>
                  <span>AI Assistant</span>
                </Link>
                <Link
                  className="flex items-center gap-3 p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all text-sm font-medium"
                  href="/admin/logs"
                >
                  <span className="material-symbols-outlined text-lg">list_alt</span>
                  <span>Activity Logs</span>
                </Link>
                <Link
                  className="flex items-center gap-3 p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all text-sm font-medium"
                  href="/settings"
                >
                  <span className="material-symbols-outlined text-lg">settings</span>
                  <span>Settings</span>
                </Link>
              </>
            ) : (
              // Citizen Links
              <>
                <Link
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm text-sm"
                  href="/chat"
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    chat
                  </span>
                  <span>AI Assistant</span>
                </Link>
                <Link
                  className="flex items-center gap-3 p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all text-sm font-medium"
                  href="/services"
                >
                  <span className="material-symbols-outlined text-lg">grid_view</span>
                  <span>Services Catalog</span>
                </Link>
                <Link
                  className="flex items-center gap-3 p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all text-sm font-medium"
                  href="/settings"
                >
                  <span className="material-symbols-outlined text-lg">settings</span>
                  <span>Account Settings</span>
                </Link>
              </>
            )}
          </div>
          <div className="mt-auto pt-4 border-t border-slate-200 flex flex-col gap-1">
            <Link className="flex items-center gap-3 p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all text-sm font-medium" href="/support">
              <span className="material-symbols-outlined text-lg">help</span>
              <span>Support</span>
            </Link>
            <Link onClick={() => logout()} className="flex items-center gap-3 p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all text-sm font-medium" href="/login">
              <span className="material-symbols-outlined text-lg">logout</span>
              <span>Logout</span>
            </Link>
          </div>
        </aside>

        {/* Chat Container with Blurred Kingdom Tower Background & Blue Theme */}
        <section className="flex flex-col flex-1 relative overflow-hidden bg-slate-950">
          {/* Blurred Kingdom Tower Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center filter blur-[4px] scale-105 pointer-events-none opacity-85"
            style={{ backgroundImage: `url('/images/kingdom_tower.jpg')` }}
          />
          {/* Elegant Saudi Corporate Blue Gradient Overlay with Frosted Glass Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-blue-950/80 to-slate-950/85 backdrop-blur-[2px] pointer-events-none" />

          {/* Chat Header */}
          <div className="px-4 sm:px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex justify-between items-center shrink-0 z-10 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-950/20 shrink-0">
                <span className="material-symbols-outlined text-2xl">account_balance</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-slate-900 text-base sm:text-lg">
                    {lang === "ar" ? "المستشار الحكومي الذكي (رؤية 2030)" : "Saudi Public Services & Vision 2030 Advisor"}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {lang === "ar" 
                    ? "منظومة استشارية رسمية موحدة • منصة أبشر • قوى • مقيم • وزارة الاستثمار" 
                    : "Official Unified Advisory • Absher • Qiwa • Muqeem • MISA • ZATCA"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  const text = messages.map(m => `${m.role === 'citizen' ? 'Citizen' : m.agent_name || 'Agent'}: ${m.content}`).join('\n\n');
                  const blob = new Blob([text], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `govassist-transcript-${Date.now()}.txt`;
                  a.click();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:border-blue-400 rounded-xl text-slate-700 hover:text-blue-700 hover:bg-blue-50/50 text-xs font-semibold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Export</span>
              </button>
              <button 
                className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5" 
                onClick={() => {
                  const user = getUser();
                  if (user) {
                    localStorage.removeItem(`govassist_request_id_${user.email}`);
                  }
                  setRequestId(null);
                  setMessages([
                    {
                      id: Date.now().toString(),
                      role: "agent",
                      agent_name: "GovAssist AI",
                      content: lang === "ar" ? "أهلاً بك! تم بدء جلسة استشارية جديدة. كيف يمكنني خدمتك اليوم؟" : "Welcome! A new consultation session has started. How may I assist you today?",
                      timestamp: new Date().toISOString(),
                    }
                  ]);
                }}
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>{lang === "ar" ? "استفسار جديد" : "New Case"}</span>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={chatWindowRef}
            className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-5 chat-scrollbar relative z-10"
            id="chat-window"
          >
            {/* Timestamp */}
            <div className="flex justify-center">
              <span className="bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-700 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-2xs">
                Today
              </span>
            </div>

            {messages.map((msg) => {
              const isCitizen = msg.role === "citizen";
              const timeString = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              // Detect if agent message content is Arabic to flip bubble alignment (using ratio check)
              const arabicLetters = (msg.content.match(/[\u0600-\u06FF]/g) || []).length;
              const totalLetters = (msg.content.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length;
              const isAgentArabic = !isCitizen && totalLetters > 0 && (arabicLetters / totalLetters) > 0.25;

              let badgeText = msg.agent_name || "Agent";
              let badgeStyle = "bg-slate-100 text-slate-700 border border-slate-200";
              let badgeIcon = "smart_toy";
              
              if (msg.agent_name === "Policy Agent") {
                badgeStyle = "bg-blue-50 text-blue-800 border border-blue-200/90";
                badgeIcon = "account_balance";
              } else if (msg.agent_name === "Verification Agent") {
                badgeStyle = "bg-emerald-50 text-emerald-800 border border-emerald-200/90";
                badgeIcon = "verified";
              } else if (msg.agent_name === "Escalation Agent") {
                badgeStyle = "bg-amber-50 text-amber-900 border border-amber-200/90";
                badgeIcon = "priority_high";
              } else if (msg.agent_name === "General Agent") {
                badgeStyle = "bg-purple-50 text-purple-800 border border-purple-200/90";
                badgeIcon = "forum";
              }
              
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isCitizen
                      ? "items-end ml-auto"
                      : isAgentArabic
                      ? "items-end mr-auto"  /* Arabic agent: bubble on the right, text RTL */
                      : "items-start"         /* English agent: bubble on the left, text LTR */
                  } max-w-[88%] md:max-w-[80%]`}
                >
                  <div className={`flex items-center gap-2 mb-1.5 ${isAgentArabic ? "flex-row-reverse" : ""}`}>
                    {!isCitizen && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight shadow-xs ${badgeStyle}`}
                      >
                        <span className="material-symbols-outlined text-[13px]">{badgeIcon}</span>
                        <span>{badgeText}</span>
                      </span>
                    )}
                    <span className="text-white/80 drop-shadow-sm text-[11px] font-medium">
                      {isCitizen ? "You" : badgeText} • {timeString}
                    </span>
                  </div>
                  <div
                    className={`p-4 sm:p-5 transition-shadow ${
                      isCitizen
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl rounded-tr-xs shadow-md border border-blue-400/20"
                        : isAgentArabic
                        ? "bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-800 rounded-2xl rounded-tr-xs shadow-lg"
                        : "bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-800 rounded-2xl rounded-tl-xs shadow-lg"
                    }`}
                  >
                    {isCitizen ? (
                      <p className="text-sm sm:text-base whitespace-pre-line text-white leading-relaxed font-normal">
                        {msg.content}
                      </p>
                    ) : (
                      <>
                        <FormattedChatContent content={msg.content} />
                        {msg.citations && msg.citations.length > 0 && (
                          <div className={`mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5 text-xs ${isAgentArabic ? "justify-end" : "justify-start"}`}>
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-blue-600">verified</span>
                              <span>{isAgentArabic ? "البوابات الرسمية:" : "Official Portals:"}</span>
                            </span>
                            {msg.citations.map((cite, cIdx) => {
                              const domain = cite.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
                              return (
                                <a
                                  key={cIdx}
                                  href={cite}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-800 font-medium transition-colors"
                                >
                                  <span>{domain}</span>
                                  <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            
            {isUploading && (
              <div className="flex justify-center py-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-xl border border-blue-200 text-blue-800 text-xs shadow-sm">
                  <span className="material-symbols-outlined text-sm animate-spin text-blue-600">
                    sync
                  </span>
                  Processing document verification...
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-white/95 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-base animate-pulse">smart_toy</span>
                </div>
                <div className="p-3.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl rounded-tl-xs shadow-md flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  <span className="text-xs text-slate-600 font-medium ml-1">Analyzing official regulations...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3 sm:p-5 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shrink-0 z-10 shadow-xs">
            <div className="max-w-4xl mx-auto flex items-end gap-2 sm:gap-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileUpload} 
              />
              <button 
                className="p-3 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all shrink-0 cursor-pointer active:scale-95"
                onClick={() => fileInputRef.current?.click()}
                title="Attach ID or document for verification"
              >
                <span className="material-symbols-outlined text-2xl">attach_file</span>
              </button>
              <div className="relative flex-1">
                <textarea
                  className="w-full py-3 px-4 pr-12 rounded-2xl border border-slate-300 bg-slate-50/90 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none font-sans text-sm text-slate-900 placeholder:text-slate-400 leading-relaxed shadow-2xs"
                  id="chat-input"
                  placeholder={lang === "ar" ? "اسأل عن الإقامة، منصة قوى، أبشر، أو فرص الذكاء الاصطناعي لعام 2026..." : "Ask about Iqama, Qiwa, Absher, or 2026 AI business opportunities in Saudi Arabia..."}
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ maxHeight: "150px" }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className={`p-3 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                  inputText.trim() && !isLoading
                    ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md shadow-blue-900/20 active:scale-95"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span
                  className="material-symbols-outlined rtl-mirror"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  send
                </span>
              </button>
            </div>
            <div className="max-w-4xl mx-auto mt-2 flex justify-between items-center px-2">
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer active:opacity-85">
                  Request Callback
                </button>
              </div>
              <span className="text-slate-500 text-[11px]">
                System Status:{" "}
                <span className="text-blue-700 font-semibold">256-bit Encrypted</span>
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 w-full py-2 z-50 shrink-0">
        <div className="flex flex-row justify-between items-center px-margin-desktop h-8">
          <span className="text-xs font-medium text-slate-500">
            © 2026 GovAssist AI. All rights reserved.
          </span>
          <div className="flex gap-4">
            <Link className="text-xs text-slate-500 hover:text-blue-600 hover:underline" href="/legal">Privacy Policy</Link>
            <Link className="text-xs text-slate-500 hover:text-blue-600 hover:underline" href="/legal">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
