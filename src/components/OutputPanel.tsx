import { Terminal, Loader2 } from "lucide-react";

interface OutputPanelProps {
  output: string;
  isRunning: boolean;
  error?: string;
}

const OutputPanel = ({ output, isRunning, error }: OutputPanelProps) => {
  return (
    <div className="h-full flex flex-col rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Output</span>
        {isRunning && (
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Running...
          </div>
        )}
      </div>
      <div className="flex-1 p-4 bg-editor-bg overflow-auto">
        {error ? (
          <pre className="font-mono text-sm text-destructive whitespace-pre-wrap">
            {error}
          </pre>
        ) : output ? (
          <pre className="font-mono text-sm text-primary-foreground/90 whitespace-pre-wrap">
            {output}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Click "Run Code" to see output
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
