import { Code2, Users, Zap, Play, Shield, Globe } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "See every keystroke as it happens. Both interviewer and candidate edit the same code simultaneously.",
  },
  {
    icon: Code2,
    title: "Syntax Highlighting",
    description: "Support for 20+ programming languages with intelligent code completion and formatting.",
  },
  {
    icon: Play,
    title: "Code Execution",
    description: "Run code directly in the browser with instant output. Test solutions in real-time.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "No downloads, no installations. Share a link and start coding in seconds.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "End-to-end encryption ensures your interview sessions remain confidential.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Browser-based platform works on any device, anywhere in the world.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need for{" "}
            <span className="gradient-text">great interviews</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete toolkit for technical interviews, designed for both interviewers and candidates.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border/50 p-6 gradient-card hover:border-primary/30 hover:shadow-card transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
