"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  source?: string;
  excerpt?: string;
}

export default function MessageBubble({ message }: { message: Message }) {
  const [showSource, setShowSource] = useState(false);
  const isUser = message.role === "user";

  const markdownComponents: Components = {
    p: ({ children }) => (
      <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-5 mb-3 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-5 mb-3 space-y-1">
        {children}
      </ol>
    ),
    li: ({ children }) => <li>{children}</li>,
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    code({ className, children, ...props }) {
      const isInline = !className;

      if (isInline) {
        return (
          <code
            className="bg-neutral-100 px-1 py-0.5 rounded text-xs"
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <pre className="bg-neutral-100 p-3 rounded-md overflow-x-auto text-xs mb-3">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      );
    },
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>

      {isUser ? (
        <div
          className="
            max-w-120
            px-4 py-2.5
            rounded-md
            bg-neutral-900
            text-white
            text-sm
            font-mono
          "
        >
          {message.content}
        </div>
      ) : (
        <div
          className="
            max-w-160
            px-5 py-4
            rounded-md
            bg-white
            border border-neutral-300
            text-sm
            text-neutral-900
            font-mono
          "
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {message.content}
          </ReactMarkdown>

          {message.source && (
            <div className="mt-6 text-xs">

              <button
                onClick={() => setShowSource(!showSource)}
                className="
                  text-neutral-500
                  hover:text-neutral-900
                  transition-colors
                  font-mono
                "
              >
                {showSource ? "Hide source" : "View source"}
              </button>

              {showSource && (
                <div className="mt-3 bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-md space-y-1">

                  <p className="font-mono text-neutral-700 text-xs">
                    {message.source}
                  </p>

                  <p className="text-neutral-600 italic leading-snug font-mono text-[10px] ">
                    "{message.excerpt}"
                  </p>

                </div>
              )}

            </div>
          )}
        </div>
      )}

    </div>
  );
}
