/**
 * Centralized API service - All backend calls go through here.
 * Currently mocked, but easy to replace with real API calls later.
 */

import { nanoid } from "nanoid";
import { io, Socket } from "socket.io-client";

// Types
export interface Room {
  id: string;
  code: string;
  language: string;
  createdAt: Date;
  connectedUsers: number;
}

export interface CodeExecutionResult {
  output: string;
  error?: string;
}

export interface User {
  id: string;
  name: string;
  isHost: boolean;
}

// In-memory storage for mocked data
const rooms = new Map<string, Room>();

// Simulated network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// Room Management
// ============================================

const API_BASE_URL = "http://localhost:8000";

// Initialize Socket.IO
const socket: Socket = io(API_BASE_URL);

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, options);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

// ============================================
// Room Management
// ============================================

export const roomApi = {
  /**
   * Create a new interview room
   */
  create: async (): Promise<Room> => {
    return fetchJson<Room>("/rooms", {
      method: "POST",
    });
  },

  /**
   * Get room by ID
   */
  get: async (roomId: string): Promise<Room | null> => {
    try {
      return await fetchJson<Room>(`/rooms/${roomId}`);
    } catch (error) {
      console.error("Failed to get room", error);
      return null;
    }
  },

  /**
   * Join a room (HTTP)
   */
  join: async (roomId: string): Promise<Room | null> => {
    try {
      return await fetchJson<Room>(`/rooms/${roomId}/join`, {
        method: "POST"
      });
    } catch (error) {
      console.error("Failed to join room", error);
      return null;
    }
  },

  /**
   * Leave a room (HTTP)
   */
  leave: async (roomId: string): Promise<void> => {
    await fetchJson(`/rooms/${roomId}/leave`, {
      method: "POST"
    });
  },

  /**
   * Update room code (HTTP)
   */
  updateCode: async (roomId: string, code: string): Promise<void> => {
    await fetchJson(`/rooms/${roomId}/code`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
  },

  /**
   * Update room language (HTTP)
   */
  updateLanguage: async (roomId: string, language: string): Promise<void> => {
    await fetchJson(`/rooms/${roomId}/language`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language }),
    });
  },

  /**
   * Get connected users count
   */
  getConnectedUsers: async (roomId: string): Promise<number> => {
    const res = await fetchJson<{ count: number }>(`/rooms/${roomId}/users/count`);
    return res.count;
  },
};

// ============================================
// Code Execution
// ============================================

export const codeApi = {
  /**
   * Execute code (via Backend)
   */
  execute: async (code: string, language: string, roomId: string): Promise<CodeExecutionResult> => {
    return fetchJson<CodeExecutionResult>("/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, roomId }),
    });
  },
};

// ============================================
// Real-time Collaboration (Socket.IO)
// ============================================

type CodeChangeCallback = (code: string) => void;
type LanguageChangeCallback = (language: string) => void;
type UserChangeCallback = (count: number) => void;
type OutputChangeCallback = (result: CodeExecutionResult) => void;

export const realtimeApi = {
  /**
   * Join room via socket
   */
  joinRoom: (roomId: string) => {
    socket.emit("join_room", roomId);
  },

  /**
   * Leave room via socket
   */
  leaveRoom: (roomId: string) => {
    socket.emit("leave_room", roomId);
  },

  /**
   * Subscribe to code changes
   */
  subscribeToCode: (roomId: string, callback: CodeChangeCallback): (() => void) => {
    const handler = (newCode: string) => {
      callback(newCode);
    };
    socket.on("code_change", handler);
    return () => {
      socket.off("code_change", handler);
    };
  },

  /**
   * Broadcast code change
   */
  broadcastCode: (roomId: string, code: string): void => {
    socket.emit("code_change", { roomId, code });
  },

  /**
   * Subscribe to language changes
   */
  subscribeToLanguage: (roomId: string, callback: LanguageChangeCallback): (() => void) => {
    const handler = (newLanguage: string) => {
      callback(newLanguage);
    };
    socket.on("language_change", handler);
    return () => {
      socket.off("language_change", handler);
    };
  },

  /**
   * Broadcast language change
   */
  broadcastLanguage: (roomId: string, language: string): void => {
    socket.emit("language_change", { roomId, language });
  },

  /**
   * Subscribe to user presence changes
   */
  subscribeToUsers: (roomId: string, callback: UserChangeCallback): (() => void) => {
    const handler = (count: number) => {
      callback(count);
    };
    socket.on("user_count_update", handler);
    return () => {
      socket.off("user_count_update", handler);
    };
  },

  /**
   * Subscribe to code output changes
   */
  subscribeToOutput: (roomId: string, callback: OutputChangeCallback): (() => void) => {
    const handler = (result: CodeExecutionResult) => {
      callback(result);
    };
    socket.on("code_output", handler);
    return () => {
      socket.off("code_output", handler);
    };
  },
};

// ============================================
// Helpers
// ============================================

function getDefaultCode(): string {
  return `// Welcome to CodeSync!
// Start coding your solution here.

function solve(input) {
  // Your code here
  console.log("Hello from CodeSync!");
  return input;
}

// Test your solution
console.log(solve("Hello, World!"));
`;
}

function formatOutput(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  if (typeof value === "function") return `[Function: ${value.name || "anonymous"}]`;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
