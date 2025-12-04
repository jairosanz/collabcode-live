import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import CodeEditor from "@/components/CodeEditor";
import OutputPanel from "@/components/OutputPanel";
import RoomHeader from "@/components/RoomHeader";
import { executeCode } from "@/lib/codeExecutor";

const defaultCode = `// Welcome to CodeSync!
// Start coding your solution here.

function solve(input) {
  // Your code here
  console.log("Hello from CodeSync!");
  return input;
}

// Test your solution
console.log(solve("Hello, World!"));
`;

const InterviewRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isRunning, setIsRunning] = useState(false);

  // Simulated connected users (would be real with WebSocket/realtime)
  const [connectedUsers] = useState(1);

  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setOutput("");
    setError(undefined);

    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    const result = await executeCode(code, language);
    
    setOutput(result.output);
    setError(result.error);
    setIsRunning(false);
  }, [code, language]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <RoomHeader
        roomId={roomId || ""}
        language={language}
        onLanguageChange={setLanguage}
        onRunCode={handleRunCode}
        isRunning={isRunning}
        connectedUsers={connectedUsers}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-4 pb-2">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
            />
          </div>
          
          {/* Output Panel */}
          <div className="h-48 p-4 pt-2">
            <OutputPanel
              output={output}
              isRunning={isRunning}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
