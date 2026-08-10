"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getUser, logout, isAdmin } from "../auth";
import { useLanguage } from "../../context/LanguageContext";
import { sendMessage, getHistory, uploadDocument, pollDocumentStatus } from "../../lib/api";
import { ConversationMessage, ChatResponse } from "../../types";

export default function ChatPortal() {
  const { lang, setLang } = useLanguage();
  const [authorized, setAuthorized] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
        timestamp: res.timestamp,
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (error) {
      console.error("Error sending message", error);
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
    <div className="bg-surface text-on-surface flex flex-col h-screen overflow-hidden font-body-md selection:bg-secondary-container selection:text-on-secondary-container">
      {/* TopNavBar */}
      <header className="bg-surface dark:bg-surface-container-low border-b border-outline-variant dark:border-outline w-full top-0 z-50 shrink-0">
        <nav className="flex justify-between items-center px-margin-desktop h-16 w-full">
          <div className="flex items-center gap-stack-lg">
            <Link href="/" className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary hover:opacity-80 transition-opacity">
              GovAssist AI
            </Link>
            <div className="hidden md:flex gap-stack-md">
              <Link
                className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-inverse-primary transition-colors"
                href="/admin"
              >
                Dashboard
              </Link>
              <Link
                className="font-body-md text-body-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-inverse-primary transition-colors"
                href="/services"
              >
                Services
              </Link>
              <Link
                className="font-body-md text-body-md text-primary dark:text-inverse-primary border-b-2 border-primary dark:border-inverse-primary pb-1"
                href="/chat"
              >
                Inquiry
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-stack-md">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="font-label-md text-label-md text-primary font-bold cursor-pointer hover:opacity-80"
            >
              {lang === "en" ? "EN/AR" : "AR/EN"}
            </button>
            <button className="text-on-surface-variant cursor-pointer hover:text-primary active:opacity-85">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs bg-surface-container-high px-2.5 py-1 rounded-full text-on-surface-variant font-medium">
                {getUser()?.email || "citizen@govassist.ai"}
              </span>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
                <img
                  className="w-full h-full object-cover"
                  alt="Government administrative officer"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBf8XXzfeMFMzOiQWYa27d0DMs37GzR599fbbzbwL3zELtwqaFwZdDWufFIMXg9ai-j7tT3iDR9y_gs2834GYbIhZLAkf5QV8TqBVCYCqD4Gzli3JM_nkiscb8nJE74IhOSttzS33m3kebA1oRATEnlbeI43Bqu8icVwOMhiliDyp6D-8QQpEDn7yqpwqhpyedhK7l1KMZMsoNbliUk8nwELH0tkNBYZ18pyrevc5PwCtkg9Ws8bmpw1F7t3ZKZ9KfOo1Q00gVr5ir"
                />
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* SideNavBar (Hidden on Mobile) */}
        <aside className="hidden lg:flex flex-col h-full w-64 bg-surface-container-lowest dark:bg-surface-container-low border-e border-outline-variant dark:border-outline p-stack-md shrink-0">
          <div className="mb-stack-lg">
            <h2 className="font-label-md text-label-md text-primary uppercase tracking-wider mb-1">
              {isAdmin() ? "Admin Portal" : "Citizen Portal"}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {isAdmin() ? "Government Administration" : "Saudi Government Services"}
            </p>
          </div>
          <div className="flex flex-col gap-unit flex-1">
            {isAdmin() ? (
              // Admin Links
              <>
                <Link
                  className="flex items-center gap-stack-sm p-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all"
                  href="/admin"
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  <span className="font-label-md text-label-md">Overview</span>
                </Link>
                <Link
                  className="flex items-center gap-stack-sm p-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all"
                  href="/agents"
                >
                  <span className="material-symbols-outlined">smart_toy</span>
                  <span className="font-label-md text-label-md">AI Agents</span>
                </Link>
                <Link
                  className="flex items-center gap-stack-sm p-3 rounded-lg bg-primary-fixed dark:bg-primary-container text-on-primary-fixed dark:text-on-primary-container"
                  href="/chat"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    chat
                  </span>
                  <span className="font-label-md text-label-md">AI Assistant</span>
                </Link>
                <Link
                  className="flex items-center gap-stack-sm p-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all"
                  href="/admin/logs"
                >
                  <span className="material-symbols-outlined">list_alt</span>
                  <span className="font-label-md text-label-md">Activity Logs</span>
                </Link>
                <Link
                  className="flex items-center gap-stack-sm p-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all"
                  href="/settings"
                >
                  <span className="material-symbols-outlined">settings</span>
                  <span className="font-label-md text-label-md">Settings</span>
                </Link>
              </>
            ) : (
              // Citizen Links
              <>
                <Link
                  className="flex items-center gap-stack-sm p-3 rounded-lg bg-primary-fixed dark:bg-primary-container text-on-primary-fixed dark:text-on-primary-container font-semibold"
                  href="/chat"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    chat
                  </span>
                  <span className="font-label-md text-label-md">AI Assistant</span>
                </Link>
                <Link
                  className="flex items-center gap-stack-sm p-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all"
                  href="/services"
                >
                  <span className="material-symbols-outlined">grid_view</span>
                  <span className="font-label-md text-label-md">Services Catalog</span>
                </Link>
                <Link
                  className="flex items-center gap-stack-sm p-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all"
                  href="/settings"
                >
                  <span className="material-symbols-outlined">settings</span>
                  <span className="font-label-md text-label-md">Account Settings</span>
                </Link>
              </>
            )}
          </div>
          <div className="mt-auto pt-stack-md border-t border-outline-variant">
            <Link className="flex items-center gap-stack-sm p-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all" href="/support">
              <span className="material-symbols-outlined">help</span>
              <span className="font-label-md text-label-md">Support</span>
            </Link>
            <Link onClick={() => logout()} className="flex items-center gap-stack-sm p-3 rounded-lg text-error hover:bg-error-container transition-all" href="/login">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-md text-label-md">Logout</span>
            </Link>
          </div>
        </aside>

        {/* Chat Container */}
        <section className="flex flex-col flex-1 relative bg-surface overflow-hidden">
          {/* Chat Header */}
          <div className="px-margin-desktop py-stack-md bg-surface border-b border-outline-variant flex justify-between items-center shrink-0">
            <div className="flex items-center gap-stack-md">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                <span className="material-symbols-outlined">support_agent</span>
              </div>
              <div>
                <h1 className="font-headline-md text-headline-md text-primary">
                  {lang === "ar" ? "استفسار التحقق" : "Verification Inquiry"} {requestId ? `#${requestId.substring(0, 8)}` : ""}
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Active • Priority Assistance
                </p>
              </div>
            </div>
            <div className="flex gap-stack-sm">
              <button className="px-4 py-2 border border-outline rounded text-primary font-label-md hover:bg-surface-container transition-colors cursor-pointer active:opacity-80">
                Export Transcript
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded font-label-md hover:opacity-90 transition-opacity cursor-pointer active:opacity-80" onClick={() => {
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
                    content: lang === "ar" ? "تم إغلاق القضية. كيف يمكنني مساعدتك في استفسار جديد؟" : "Case closed. How can I help you with a new inquiry?",
                    timestamp: new Date().toISOString(),
                  }
                ]);
              }}>
                Close Case &amp; New Inquiry
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={chatWindowRef}
            className="flex-1 overflow-y-auto p-margin-desktop space-y-gutter chat-scrollbar bg-surface"
            id="chat-window"
          >
            {/* Timestamp */}
            <div className="flex justify-center">
              <span className="bg-surface-container-high px-3 py-1 rounded-full text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest">
                Today
              </span>
            </div>

            {messages.map((msg) => {
              const isCitizen = msg.role === "citizen";
              const timeString = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              let badgeText = msg.agent_name || "Agent";
              let badgeStyle = "bg-surface-variant text-on-surface-variant border border-outline/20";
              
              if (msg.agent_name === "Policy Agent") {
                badgeStyle = "bg-secondary-container text-on-secondary-container border border-secondary/20";
              } else if (msg.agent_name === "Verification Agent") {
                badgeStyle = "bg-primary-container text-on-primary-container border border-primary/20";
              } else if (msg.agent_name === "Escalation Agent") {
                badgeStyle = "bg-orange-100 text-orange-800 border border-orange-200";
              }
              
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isCitizen ? "items-end ml-auto" : "items-start"
                  } max-w-[80%]`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {!isCitizen && (
                      <span
                        className={`px-2 py-0.5 rounded font-label-sm text-[10px] uppercase font-bold tracking-tight ${badgeStyle}`}
                      >
                        {badgeText}
                      </span>
                    )}
                    <span className="text-on-surface-variant font-label-sm text-label-sm">
                      {isCitizen ? "You" : badgeText} • {timeString}
                    </span>
                  </div>
                  <div
                    className={`p-4 rounded-xl ${
                      isCitizen
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-white border border-outline-variant text-on-surface rounded-tl-none shadow-sm"
                    }`}
                  >
                    <p className="font-body-md text-body-md whitespace-pre-line">
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {isUploading && (
              <div className="flex justify-center py-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded border border-outline-variant text-on-surface-variant font-body-sm italic">
                  <span className="material-symbols-outlined text-sm animate-spin">
                    sync
                  </span>
                  Processing document...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-stack-lg bg-white border-t border-outline-variant shrink-0">
            <div className="max-w-4xl mx-auto flex items-end gap-stack-sm">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileUpload} 
              />
              <button 
                className="p-3 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors shrink-0 cursor-pointer active:opacity-85"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <div className="relative flex-1">
                <textarea
                  className="w-full p-3 pr-12 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none chat-scrollbar font-body-md text-body-md bg-surface-container-lowest"
                  id="chat-input"
                  placeholder={lang === "ar" ? "اكتب استفسارك هنا..." : "Type your inquiry here..."}
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ maxHeight: "150px" }}
                ></textarea>
              </div>
              <button
                onClick={handleSendMessage}
                className="bg-primary text-white p-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center shrink-0 cursor-pointer active:opacity-85"
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
                <button className="px-2 py-1 rounded bg-surface-container text-on-surface-variant text-[11px] font-medium border border-outline-variant hover:bg-surface-container-high transition-colors cursor-pointer active:opacity-85">
                  Request Callback
                </button>
              </div>
              <span className="text-on-surface-variant text-[11px]">
                System Status:{" "}
                <span className="text-secondary font-bold">Encrypted</span>
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container dark:bg-surface-container-high border-t border-outline-variant dark:border-outline w-full py-2 z-50 shrink-0">
        <div className="flex flex-row justify-between items-center px-margin-desktop h-8">
          <span className="font-label-md text-label-md font-bold text-on-surface-variant">
            © 2026 GovAssist AI. Demo purpose only.
          </span>
          <div className="flex gap-stack-md">
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="/legal">Privacy Policy</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="/legal">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
