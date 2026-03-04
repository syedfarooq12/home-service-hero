import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  BadgeCheck,
  GraduationCap,
  Gift,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: CheckCircle2,
    title: "Verified Reviews",
    description:
      "Verified reviews from real, completed tasks.",
  },
  {
    icon: BadgeCheck,
    title: "Helper Badges",
    description:
      "Helper badges for skill, speed, and reliability.",
  },
  {
    icon: GraduationCap,
    title: "Training & Certification",
    description:
      "Training & certification for better-quality helpers.",
  },
  {
    icon: Gift,
    title: "Loyalty Rewards",
    description:
      "Loyalty points and rewards for regular users.",
  },
  {
    icon: Heart,
    title: "Social Impact",
    description:
      "Social impact mode for community help & volunteer tasks.",
  },
];

const CommunityImpactSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block mb-3 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Community & Impact
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            A Trusted Community
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Create trust and loyalty — every feature is built to reward quality and build confidence.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map((item) => (
            <Card
              key={item.title}
              className="group border-border/50 hover:border-primary/30 transition-colors"
            >
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityImpactSection;
