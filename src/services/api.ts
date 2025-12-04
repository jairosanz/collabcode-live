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

export const roomApi = {
  /**
   * Create a new interview room
   */
  create: async (): Promise<Room> => {
    await delay(100);
    
    const room: Room = {
      id: nanoid(10),
      code: getDefaultCode(),
      language: "javascript",
      createdAt: new Date(),
      connectedUsers: 1,
    };
    
    rooms.set(room.id, room);
    return room;
  },

  /**
   * Get room by ID
   */
  get: async (roomId: string): Promise<Room | null> => {
    await delay(50);
    
    // If room doesn't exist, create it (for demo purposes)
    if (!rooms.has(roomId)) {
      const room: Room = {
        id: roomId,
        code: getDefaultCode(),
        language: "javascript",
        createdAt: new Date(),
        connectedUsers: 1,
      };
      rooms.set(roomId, room);
    }
    
    return rooms.get(roomId) || null;
  },

  /**
   * Join a room
   */
  join: async (roomId: string): Promise<Room | null> => {
    await delay(50);
    
    const room = rooms.get(roomId);
    if (room) {
      room.connectedUsers += 1;
      return room;
    }
    
    // Create room if it doesn't exist
    return roomApi.get(roomId);
  },

  /**
   * Leave a room
   */
  leave: async (roomId: string): Promise<void> => {
    await delay(50);
    
    const room = rooms.get(roomId);
    if (room && room.connectedUsers > 0) {
      room.connectedUsers -= 1;
    }
  },

  /**
   * Update room code
   */
  updateCode: async (roomId: string, code: string): Promise<void> => {
    await delay(10);
    
    const room = rooms.get(roomId);
    if (room) {
      room.code = code;
    }
  },

  /**
   * Update room language
   */
  updateLanguage: async (roomId: string, language: string): Promise<void> => {
    await delay(10);
    
    const room = rooms.get(roomId);
    if (room) {
      room.language = language;
    }
  },

  /**
   * Get connected users count
   */
  getConnectedUsers: async (roomId: string): Promise<number> => {
    await delay(20);
    
    const room = rooms.get(roomId);
    return room?.connectedUsers || 1;
  },
};

// ============================================
// Code Execution
// ============================================

export const codeApi = {
  /**
   * Execute code (browser-based for JS/TS, mocked for others)
   */
  execute: async (code: string, language: string): Promise<CodeExecutionResult> => {
    await delay(300);

    // Only JavaScript/TypeScript can be executed in the browser
    if (language !== "javascript" && language !== "typescript") {
      return {
        output: "",
        error: `Browser execution is only available for JavaScript/TypeScript.\n\nFor ${language}, you would need a backend execution service.`,
      };
    }

    try {
      const logs: string[] = [];

      const customConsole = {
        log: (...args: unknown[]) => {
          logs.push(args.map((arg) => formatOutput(arg)).join(" "));
        },
        error: (...args: unknown[]) => {
          logs.push(`[Error] ${args.map((arg) => formatOutput(arg)).join(" ")}`);
        },
        warn: (...args: unknown[]) => {
          logs.push(`[Warn] ${args.map((arg) => formatOutput(arg)).join(" ")}`);
        },
        info: (...args: unknown[]) => {
          logs.push(args.map((arg) => formatOutput(arg)).join(" "));
        },
      };

      const wrappedCode = `
        (function(console) {
          "use strict";
          ${code}
        })
      `;

      const fn = new Function("return " + wrappedCode)();
      const result = fn(customConsole);

      if (result !== undefined) {
        logs.push(`\n→ ${formatOutput(result)}`);
      }

      return {
        output: logs.join("\n") || "Code executed successfully (no output)",
      };
    } catch (err) {
      const error = err as Error;
      return {
        output: "",
        error: `${error.name}: ${error.message}`,
      };
    }
  },
};

// ============================================
// Real-time Collaboration (Mocked)
// ============================================

type CodeChangeCallback = (code: string) => void;
type UserChangeCallback = (count: number) => void;

const codeSubscribers = new Map<string, Set<CodeChangeCallback>>();
const userSubscribers = new Map<string, Set<UserChangeCallback>>();

export const realtimeApi = {
  /**
   * Subscribe to code changes in a room
   */
  subscribeToCode: (roomId: string, callback: CodeChangeCallback): (() => void) => {
    if (!codeSubscribers.has(roomId)) {
      codeSubscribers.set(roomId, new Set());
    }
    codeSubscribers.get(roomId)!.add(callback);

    // Return unsubscribe function
    return () => {
      codeSubscribers.get(roomId)?.delete(callback);
    };
  },

  /**
   * Broadcast code change to other users
   */
  broadcastCode: (roomId: string, code: string): void => {
    // In a real implementation, this would send to the server
    // For now, we just update local state
    roomApi.updateCode(roomId, code);
    
    // Notify subscribers (simulating real-time updates)
    codeSubscribers.get(roomId)?.forEach((callback) => {
      callback(code);
    });
  },

  /**
   * Subscribe to user presence changes
   */
  subscribeToUsers: (roomId: string, callback: UserChangeCallback): (() => void) => {
    if (!userSubscribers.has(roomId)) {
      userSubscribers.set(roomId, new Set());
    }
    userSubscribers.get(roomId)!.add(callback);

    // Simulate initial user count
    setTimeout(() => callback(1), 100);

    return () => {
      userSubscribers.get(roomId)?.delete(callback);
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
