"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/context/SessionContext";

export default function WorkspaceSidebar() {
  const [documents, setDocuments] = useState<string[]>([]);
  const { sessionId } = useSession();

  useEffect(() => {
    async function fetchDocuments() {
      if (!sessionId) {
        setDocuments([]);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents || []);
        }
      } catch (err) {
        console.error("Failed to fetch documents:", err);
      }
    }

    fetchDocuments();
  }, [sessionId]);

  return (
    <div className="flex flex-col h-full">

      <div className="mb-4">
        <h3 className="text-xs font-mono uppercase text-neutral-900">
          Your documents
        </h3>
      </div>

      {documents.length > 0 ? (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {documents.map((doc, i) => (
            <div
              key={i}
              className="
                px-3 py-2
                rounded-md
                border border-neutral-200
                bg-neutral-50
                hover:border-neutral-900
                transition-colors
              "
            >
              <p className="text-xs font-mono text-neutral-900 truncate" title={doc}>
                {doc}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-neutral-200 rounded-md bg-neutral-50/50">
          <p className="text-[10px] font-mono text-neutral-400 text-center px-4">
            No documents active.
            <br />
            Upload via chat to begin.
          </p>
        </div>
      )}

    </div>
  );
}