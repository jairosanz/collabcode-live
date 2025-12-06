/**
 * Centralized API service - All backend calls go through here.
 * Currently mocked, but easy to replace with real API calls later.
 */

import { nanoid } from "nanoid";

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
   * Join a room
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
   * Leave a room
   */
  leave: async (roomId: string): Promise<void> => {
    await fetchJson(`/rooms/${roomId}/leave`, {
      method: "POST"
    });
  },

  /**
   * Update room code
   */
  updateCode: async (roomId: string, code: string): Promise<void> => {
    await fetchJson(`/rooms/${roomId}/code`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
  },

  /**
   * Update room language
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
  execute: async (code: string, language: string): Promise<CodeExecutionResult> => {
    return fetchJson<CodeExecutionResult>("/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });
  },
};

// ============================================
// Real-time Collaboration (Polling fallback for now)
// ============================================

type CodeChangeCallback = (code: string) => void;
type UserChangeCallback = (count: number) => void;

// Simple polling for "realtime" updates since we don't have WebSockets yet
export const realtimeApi = {
  /**
   * Subscribe to code changes in a room (Polling)
   */
  subscribeToCode: (roomId: string, callback: CodeChangeCallback): (() => void) => {
    const interval = setInterval(async () => {
      const room = await roomApi.get(roomId);
      if (room) {
        callback(room.code);
      }
    }, 2000); // Poll every 2s

    return () => clearInterval(interval);
  },

  /**
   * Broadcast code change to other users
   */
  broadcastCode: (roomId: string, code: string): void => {
    // Debounce or just send
    roomApi.updateCode(roomId, code).catch(console.error);
  },

  /**
   * Subscribe to user presence changes (Polling)
   */
  subscribeToUsers: (roomId: string, callback: UserChangeCallback): (() => void) => {
    const interval = setInterval(async () => {
      try {
        const count = await roomApi.getConnectedUsers(roomId);
        callback(count);
      } catch (e) {
        console.error(e);
      }
    }, 5000); // Poll every 5s

    return () => clearInterval(interval);
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
