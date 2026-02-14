"use client";

import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { useSession } from "@/context/SessionContext";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  source?: string;
  excerpt?: string;
}

function Typewriter({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayed("");
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 60);
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return (
    <h1 className="text-3xl md:text-4xl font-mono text-neutral-900">
      {displayed}
      <span className="animate-pulse">.</span>
    </h1>
  );
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { sessionId, chatResetKey, setSessionId, resetChat } = useSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    setUploading(true);
    const uploadPromise = fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Upload failed");
      }
      return data;
    });

    try {
      await toast.promise(uploadPromise, {
        loading: 'Uploading...',
        success: 'Documents processed!',
        error: (err) => `${err.message}`,
      });

      const data = await uploadPromise;

      resetChat();
      setSessionId(data.session_id);
    } catch (err) {
      console.error("Upload failed:", err);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendQuestion = async () => {
    const input = question.trim();
    if (!input) return;

    if (input.toLowerCase() === "status") {
      setLoading(true);
      setMessages((prev) => [...prev, { role: "user", content: input }]);
      setQuestion("");

      try {
        const res = await fetch("http://localhost:8000/health");
        if (!res.ok) throw new Error("Health check failed");
        const data = await res.json();

        const statusMessage = `**System Health Report**

- **Backend:** ${data.backend} ${data.backend === "online" ? "✅" : "❌"}
- **Database:** ${data.database} ${data.database === "connected" ? "✅" : "❌"}
- **LLM Engine:** ${data.llm_integration} ${data.llm_integration === "active" ? "✅" : "❌"}
`;
        setMessages((prev) => [...prev, { role: "assistant", content: statusMessage }]);
      } catch (err) {
        setMessages((prev) => [...prev, { role: "assistant", content: "❌ **System Error:** Could not connect to the backend." }]);
      }
      setLoading(false);
      return;
    }

    if (!sessionId) {
      toast.error("Please upload documents first.");
      return;
    }

    setLoading(true);
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, question: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to get answer");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        source: data.source_document,
        excerpt: data.source_excerpt,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Ask failed:", err);
      toast.error(err.message || "Network error");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ **Error:** Unable to get an answer. Please try again."
        }
      ]);
    }
    setLoading(false);
  };

  let titleText = "Paper Trace";
  let subText: React.ReactNode = (
    <div className="space-y-4 mt-2">
      <div className="text-left space-y-2 text-neutral-500 mx-auto max-w-75">
        <div className="flex gap-3">
          <span className="text-neutral-900 font-bold">1.</span>
          <span>Upload text documents (max 5).</span>
        </div>
        <div className="flex gap-3">
          <span className="text-neutral-900 font-bold">2.</span>
          <span>Wait for processing to finish.</span>
        </div>
        <div className="flex gap-3">
          <span className="text-neutral-900 font-bold">3.</span>
          <span>Ask questions about your content.</span>
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-100 w-full max-w-50 mx-auto">
        <p className="text-[10px] text-neutral-400 uppercase tracking-widest">
          System Check
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          Type <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-900 font-bold">status</code> to check connections.
        </p>
      </div>
    </div>
  );

  if (uploading) {
    titleText = "Reading...";
    subText = (
      <div className="space-y-4 mt-2">
        <div className="text-center space-y-2 text-neutral-500 mx-auto max-w-75">
          <p>Processing your documents...</p>
          <p className="text-xs text-neutral-400">Please wait.</p>
        </div>
      </div>
    );
  } else if (sessionId) {
    titleText = "Ready";
    subText = (
      <div className="space-y-4 mt-2">
        <div className="text-center space-y-2 text-neutral-500 mx-auto max-w-75">
          <p>Now you can ask questions about your documents.</p>
        </div>
      </div>
    );
  }

  return (
    <div key={chatResetKey} className="flex flex-col h-full bg-[#fafafa]">

      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files) handleUpload(e.target.files);
        }}
        className="hidden"
      />

      <div className="flex-1 overflow-y-auto px-4 md:px-16 py-6 md:py-12 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md px-6">

              <Typewriter text={titleText} />

              <div className="text-xs md:text-sm text-neutral-400 font-mono leading-relaxed transition-all duration-500">
                {subText}
              </div>

            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8 md:space-y-10 pb-4">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-md bg-white border border-neutral-200 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.1s]" />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-neutral-200 bg-white px-3 py-3 md:px-16 md:py-6">
        <div className="max-w-3xl mx-auto flex gap-2 items-center">

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || uploading}
            className="
              h-10 w-10
              shrink-0
              flex items-center justify-center
              rounded-md
              bg-transparent
              text-neutral-300
              hover:text-neutral-900
              active:text-neutral-900
              transition-colors duration-200
              disabled:opacity-50
            "
          >
            {uploading ? (
              <span className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
            )}
          </button>

          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendQuestion();
            }}
            placeholder={uploading ? "Uploading..." : "Ask a question (or type 'status')..."}
            disabled={uploading}
            className="
              flex-1
              h-10
              rounded-md
              border border-neutral-200
              bg-white
              px-3
              text-base md:text-sm 
              text-neutral-900
              focus:outline-none
              focus:ring-1
              focus:ring-neutral-900
              font-mono
              disabled:bg-neutral-50
            "
          />

          <button
            onClick={sendQuestion}
            disabled={loading || !question.trim() || (uploading)}
            className="
              h-10
              md:px-5 md:w-auto
              w-10 
              bg-neutral-900
              text-white
              rounded-md
              text-sm
              font-mono
              flex items-center justify-center
              hover:opacity-90
              active:opacity-80
              transition
              disabled:opacity-50
              shrink-0
            "
          >
            <span className="md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 004.836 9h4.414a.25.25 0 01.25.25v1.5a.25.25 0 01-.25.25H4.836a1.5 1.5 0 00-1.143.836l-1.414 4.925a.75.75 0 00.982.916l14.286-5.714a.75.75 0 000-1.373L3.105 2.289z" />
              </svg>
            </span>

            <span className="hidden md:inline">Send</span>
          </button>

        </div>
      </div>
    </div>
  );
}