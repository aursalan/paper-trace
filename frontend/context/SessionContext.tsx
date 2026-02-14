"use client";

import { createContext, useContext, useState } from "react";

interface SessionContextType {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  chatResetKey: number;
  resetChat: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(
  undefined
);

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatResetKey, setChatResetKey] = useState(0);

  const resetChat = () => {
    setChatResetKey((prev) => prev + 1);
  };

  return (
    <SessionContext.Provider
      value={{ sessionId, setSessionId, chatResetKey, resetChat }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return context;
}
