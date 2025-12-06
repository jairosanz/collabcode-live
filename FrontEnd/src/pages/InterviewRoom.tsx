import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import CodeEditor from "@/components/CodeEditor";
import OutputPanel from "@/components/OutputPanel";
import RoomHeader from "@/components/RoomHeader";
import { roomApi, codeApi, realtimeApi } from "@/services/api";

const InterviewRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState(1);

  // Initialize room
  useEffect(() => {
    if (!roomId) return;

    const initRoom = async () => {
      setIsLoading(true);
      const room = await roomApi.join(roomId);
      if (room) {
        setCode(room.code);
        setLanguage(room.language);
        setConnectedUsers(room.connectedUsers);
      }
      setIsLoading(false);

      // Join via Socket
      realtimeApi.joinRoom(roomId);
    };

    initRoom();

    // Subscribe to real-time updates
    const unsubscribeUsers = realtimeApi.subscribeToUsers(roomId, setConnectedUsers);
    const unsubscribeCode = realtimeApi.subscribeToCode(roomId, setCode);
    const unsubscribeLanguage = realtimeApi.subscribeToLanguage(roomId, setLanguage);
    const unsubscribeOutput = realtimeApi.subscribeToOutput(roomId, (result) => {
      setOutput(result.output);
      setError(result.error);
      setIsRunning(false);
    });

    // Cleanup on unmount
    return () => {
      unsubscribeUsers();
      unsubscribeCode();
      unsubscribeLanguage();
      unsubscribeOutput();
      roomApi.leave(roomId);
      realtimeApi.leaveRoom(roomId);
    };
  }, [roomId]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      if (roomId) {
        realtimeApi.broadcastCode(roomId, newCode);
      }
    },
    [roomId]
  );

  const handleLanguageChange = useCallback(
    async (newLanguage: string) => {
      setLanguage(newLanguage);
      if (roomId) {
        await roomApi.updateLanguage(roomId, newLanguage);
        realtimeApi.broadcastLanguage(roomId, newLanguage);
      }
    },
    [roomId]
  );

  const handleRunCode = useCallback(async () => {
    if (!roomId) return;

    setIsRunning(true);
    setOutput("");
    setError(undefined);

    // Execution result will be received via socket, but we check here too if needed
    // or we can just rely on socket.
    // However, since api returns it, we can update locally OR wait for socket.
    // Waiting for socket ensures consistency. But let's do both or just rely on socket.
    // The current backend implementation returns the result AND broadcasts it.
    await codeApi.execute(code, language, roomId);
    // The state update will happen in the subscription callback

  }, [code, language, roomId]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading room...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <RoomHeader
        roomId={roomId || ""}
        language={language}
        onLanguageChange={handleLanguageChange}
        onRunCode={handleRunCode}
        isRunning={isRunning}
        connectedUsers={connectedUsers}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-4 pb-2">
            <CodeEditor value={code} onChange={handleCodeChange} language={language} />
          </div>

          <div className="h-48 p-4 pt-2">
            <OutputPanel output={output} isRunning={isRunning} error={error} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
