import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, Copy, Users, Check, Play, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import LanguageSelector from "./LanguageSelector";

interface RoomHeaderProps {
  roomId: string;
  language: string;
  onLanguageChange: (language: string) => void;
  onRunCode: () => void;
  isRunning: boolean;
  connectedUsers: number;
}

const RoomHeader = ({
  roomId,
  language,
  onLanguageChange,
  onRunCode,
  isRunning,
  connectedUsers,
}: RoomHeaderProps) => {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
            <Code2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold hidden sm:inline">CodeSync</span>
        </Link>

        <div className="h-6 w-px bg-border" />

        <LanguageSelector value={language} onChange={onLanguageChange} />
      </div>

      <div className="flex items-center gap-3">
        {/* Connected users indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
          <div className="relative">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-success animate-pulse" />
          </div>
          <span className="text-sm font-medium">{connectedUsers}</span>
        </div>

        {/* Copy link button */}
        <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Share Link</span>
            </>
          )}
        </Button>

        {/* Run code button */}
        <Button
          variant="success"
          size="sm"
          onClick={onRunCode}
          disabled={isRunning}
          className="gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Code
            </>
          )}
        </Button>
      </div>
    </header>
  );
};

export default RoomHeader;
