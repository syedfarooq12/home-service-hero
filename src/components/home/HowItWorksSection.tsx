import { Search, Calendar, UserCheck, Star } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Choose a Service",
    description: "Browse through our categories or search for the specific service you need.",
    icon: Search,
  },
  {
    id: 2,
    title: "Pick Your Time",
    description: "Select a convenient date and time slot for the service visit.",
    icon: Calendar,
  },
  {
    id: 3,
    title: "Get Matched",
    description: "We assign the best-rated technician in your area within minutes.",
    icon: UserCheck,
  },
  {
    id: 4,
    title: "Rate & Review",
    description: "Share your experience to help us maintain quality standards.",
    icon: Star,
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Book a service in under 60 seconds. It's that simple.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line - Desktop - centered through icons */}
          <div className="hidden lg:block absolute top-8 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="relative text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Step Number */}
                <div className="relative mx-auto mb-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-hero flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
                    <step.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-card border-4 border-background flex items-center justify-center text-sm font-bold text-foreground shadow-md">
                    {step.id}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
