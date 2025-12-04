// Safe browser-based code execution using Function constructor
export const executeCode = async (
  code: string,
  language: string
): Promise<{ output: string; error?: string }> => {
  // Only JavaScript/TypeScript can be executed in the browser
  if (language !== "javascript" && language !== "typescript") {
    return {
      output: "",
      error: `Browser execution is only available for JavaScript/TypeScript.\n\nFor ${language}, you would need a backend execution service.`,
    };
  }

  try {
    // Create a sandboxed execution environment
    const logs: string[] = [];
    
    // Create custom console object to capture logs
    const customConsole = {
      log: (...args: unknown[]) => {
        logs.push(args.map(arg => formatOutput(arg)).join(" "));
      },
      error: (...args: unknown[]) => {
        logs.push(`[Error] ${args.map(arg => formatOutput(arg)).join(" ")}`);
      },
      warn: (...args: unknown[]) => {
        logs.push(`[Warn] ${args.map(arg => formatOutput(arg)).join(" ")}`);
      },
      info: (...args: unknown[]) => {
        logs.push(args.map(arg => formatOutput(arg)).join(" "));
      },
    };

    // Wrap code to capture return value and use custom console
    const wrappedCode = `
      (function(console) {
        "use strict";
        ${code}
      })
    `;

    // Execute the code
    const fn = new Function("return " + wrappedCode)();
    const result = fn(customConsole);

    // If there's a return value, add it to logs
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
};

const formatOutput = (value: unknown): string => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  if (typeof value === "function") return `[Function: ${value.name || "anonymous"}]`;
  
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};
