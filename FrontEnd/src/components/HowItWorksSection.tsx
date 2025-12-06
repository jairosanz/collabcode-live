import { Link2, Users, Code, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Link2,
    number: "01",
    title: "Create a link",
    description: "Generate a unique interview room with one click. No sign-up required.",
  },
  {
    icon: Users,
    number: "02",
    title: "Share with candidate",
    description: "Send the link to your candidate. They join instantly from any browser.",
  },
  {
    icon: Code,
    number: "03",
    title: "Code together",
    description: "Collaborate in real-time with syntax highlighting and code execution.",
  },
  {
    icon: CheckCircle,
    number: "04",
    title: "Make decisions",
    description: "Review code, discuss solutions, and make informed hiring decisions.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How it <span className="gradient-text">works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes. No complex setup or configuration needed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-primary/40 to-primary/10" />
              )}
              
              <div className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="h-16 w-16 rounded-2xl gradient-bg flex items-center justify-center shadow-glow">
                    <step.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border-2 border-primary text-xs font-bold flex items-center justify-center text-primary">
                    {step.number.replace('0', '')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
