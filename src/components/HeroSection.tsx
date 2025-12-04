import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Users, Sparkles } from "lucide-react";
import { nanoid } from "nanoid";

const HeroSection = () => {
  const navigate = useNavigate();

  const createInterview = () => {
    const roomId = nanoid(10);
    navigate(`/room/${roomId}`);
  };

  return (
    <section className="relative min-h-screen gradient-hero overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 pt-32 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            Real-time collaborative coding interviews
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Code together,{" "}
            <span className="gradient-text">hire smarter</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            The modern platform for technical interviews. Share a link, code in real-time, and find the best talent faster.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl" onClick={createInterview} className="group">
              Create Interview
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="xl" className="gap-2">
              <Play className="h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">50ms</div>
              <div className="text-sm text-muted-foreground">Sync latency</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">20+</div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">100%</div>
              <div className="text-sm text-muted-foreground">Browser-based</div>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="mt-20 mx-auto max-w-5xl animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="relative rounded-2xl border border-border/50 bg-card shadow-card overflow-hidden">
            {/* Editor Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/80" />
                  <div className="h-3 w-3 rounded-full bg-warning/80" />
                  <div className="h-3 w-3 rounded-full bg-success/80" />
                </div>
                <span className="ml-3 text-sm font-medium text-muted-foreground">interview-session.js</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="h-7 w-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                    <Users className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="h-7 w-7 rounded-full gradient-bg border-2 border-background flex items-center justify-center text-xs font-bold text-primary-foreground">
                    2
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">2 connected</span>
              </div>
            </div>
            
            {/* Code Preview */}
            <div className="p-6 bg-editor-bg font-mono text-sm">
              <pre className="text-primary-foreground/90">
                <code>{`function findTwoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}`}</code>
              </pre>
              <div className="mt-4 flex items-center gap-2 text-primary/60">
                <span className="inline-block w-2 h-5 bg-primary animate-pulse" />
                <span className="text-xs">Candidate is typing...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
