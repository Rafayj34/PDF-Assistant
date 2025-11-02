"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, FileText, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "./MarkdownRenderer";

interface Doc {
  pageContent?: string;
  metadata: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
}

interface IMessage {
  role: "assistant" | "user";
  content?: string;
  documents?: Doc[];
}

interface ChatResponse {
  messages?: string;
  docs?: Doc[];
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendChatMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/chat?message=${encodeURIComponent(userMessage)}`);
      const data: ChatResponse = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data?.messages, documents: data?.docs },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md supports-backdrop-filter:bg-white/60 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-4xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl shadow-lg">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent truncate">
                Node.js PDF Assistant
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Ask questions about Node.js documentation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="container mx-auto max-w-4xl space-y-4 sm:space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12 px-4">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-lg">
              <Bot className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Welcome to Node.js PDF Assistant
            </h2>
            <p className="text-muted-foreground max-w-md text-sm sm:text-base">
              Ask me anything about Node.js, and I&apos;ll search through the documentation to help you.
            </p>
          </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="shrink-0">
                  <div className="p-2 sm:p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-md">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              )}

              <div className={cn(
                "flex flex-col gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] md:max-w-[75%]",
                msg.role === "user" ? "items-end" : "items-start"
              )}>
                <div
                  className={cn(
                    "rounded-xl sm:rounded-2xl px-3 py-2.5 sm:px-5 sm:py-4 shadow-lg",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-md"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-md"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="text-xs sm:text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownRenderer content={msg.content || ""} />
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                      {msg.content}
                    </p>
                  )}
                </div>

                {msg.documents && msg.documents.length > 0 && (
                  <div className="flex flex-col gap-1.5 sm:gap-2 w-full mt-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 px-1">
                      <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600 dark:text-green-400" />
                      <p className="text-[10px] sm:text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                        Sources
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5 sm:gap-2">
                      {msg.documents.map((doc, docIndex) => {
                        // Clean up filename: remove numeric prefix (e.g., "1762122380109-637731812-Beginning Nodejs.pdf" -> "Beginning Nodejs")
                        let fileName = doc.metadata?.source?.split(/[/\\]/).pop() || doc.metadata?.source || "";
                        // Remove numeric prefix pattern: numbers followed by dash, repeated pattern
                        fileName = fileName.replace(/^\d+-\d+-/, "");
                        // Remove .pdf extension for display (optional, but cleaner)
                        fileName = fileName.replace(/\.pdf$/i, "");
                        return (
                          <div
                            key={docIndex}
                            className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800 hover:shadow-md transition-shadow group"
                          >
                            <div className="p-1 sm:p-1.5 bg-green-500 dark:bg-green-600 rounded-md sm:rounded-lg group-hover:scale-110 transition-transform shrink-0">
                              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              {fileName && (
                                <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate mb-0.5 sm:mb-1">
                                  {fileName}
                                </p>
                              )}
                              {doc.metadata?.loc?.pageNumber && (
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700">
                                    <span className="w-1 h-1 bg-green-500 dark:bg-green-400 rounded-full mr-1 sm:mr-1.5"></span>
                                    Page {doc.metadata.loc.pageNumber}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="shrink-0">
                  <div className="p-2 sm:p-2.5 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full shadow-md">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 sm:gap-3 justify-start animate-in fade-in slide-in-from-bottom-4">
              <div className="shrink-0">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-md">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="rounded-xl sm:rounded-2xl rounded-bl-md px-3 py-2.5 sm:px-5 sm:py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-green-600 dark:text-green-400" />
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-md supports-backdrop-filter:bg-white/60 sticky bottom-0 z-10 shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-4xl">
          <div className="flex gap-2 sm:gap-3">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about Node.js..."
              disabled={isLoading}
              className="flex-1 border-2 border-slate-200 dark:border-slate-700 focus:border-green-500 dark:focus:border-green-500 shadow-sm text-sm sm:text-base"
            />
            <Button
              onClick={handleSendChatMessage}
              disabled={!message.trim() || isLoading}
              size="icon"
              className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
