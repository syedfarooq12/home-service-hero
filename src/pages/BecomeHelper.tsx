import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  Award,
  BarChart3,
  ShieldCheck,
  Bell,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Megaphone,
  Star,
  BadgeCheck,
  GraduationCap,
  Gift,
  Heart,
} from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Instant Payouts",
    description:
      "Get paid as soon as you finish a job. Enable fast-mode payouts and never wait for your hard-earned money.",
  },
  {
    icon: Award,
    title: "Higher Visibility",
    description:
      "Stand out with verified skill badges and training certificates. Top-skilled helpers get featured first.",
  },
  {
    icon: BarChart3,
    title: "Transparent Earnings Dashboard",
    description:
      "Track every rupee you earn in real-time. Clear breakdowns of jobs, tips, and bonuses — no surprises.",
  },
  {
    icon: ShieldCheck,
    title: "No Hidden Charges",
    description:
      "We believe in fairness. Only a transparent, low commission — no deductions you didn't agree to.",
  },
  {
    icon: Bell,
    title: "Priority Job Alerts",
    description:
      "Top-rated helpers get first access to the best-paying jobs in their area before anyone else.",
  },
];

const steps = [
  { step: "1", label: "Sign up & verify your identity" },
  { step: "2", label: "Add your skills & service areas" },
  { step: "3", label: "Start receiving job requests" },
  { step: "4", label: "Complete jobs & get paid instantly" },
];

const BecomeHelper = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
          <div className="container relative z-10 text-center text-primary-foreground">
            <span className="inline-block mb-4 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              Join 2,000+ skilled helpers
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Your Skills Deserve <br className="hidden md:block" />
              Better Opportunities
            </h1>
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-primary-foreground/80 mb-8">
              Partner with HelpR, grow your client base, and earn on your own
              terms — with full transparency and zero hidden fees.
            </p>
            <Link to="/technician/login">
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 text-lg px-8 py-6"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Why Work With Us */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Work with HelpR?
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                We built HelpR to put helpers first. Here's what makes us
                different.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((b) => (
                <Card
                  key={b.title}
                  className="group border-border/50 hover:border-primary/30 transition-colors"
                >
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <b.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {b.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {b.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-muted/40">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
              How It Works
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
              {steps.map((s) => (
                <div key={s.step} className="flex flex-col items-center text-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                    {s.step}
                  </div>
                  <p className="text-foreground font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 md:py-24">
          <div className="container max-w-3xl">
            <div className="rounded-2xl border border-border/50 bg-card p-8 md:p-12 text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Helpers love HelpR
              </h3>
              <div className="grid gap-4 sm:grid-cols-3 mb-8">
                {[
                  { stat: "₹45K+", label: "Avg. monthly earnings" },
                  { stat: "95%", label: "Payout within 24 hrs" },
                  { stat: "4.8★", label: "Helper satisfaction" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-3xl font-bold text-primary">{item.stat}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-left max-w-md mx-auto">
                {[
                  "Background-verified badge boosts trust",
                  "Free skill training & certification",
                  "Dedicated helper support line",
                ].map((text) => (
                  <div key={text} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-foreground">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Business Partnerships */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <span className="inline-block mb-3 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                For Businesses
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Partner with HelpR
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Powerful integrations for organizations looking to offer reliable services at scale.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
              {[
                {
                  icon: Users,
                  title: "Employee Perks",
                  description:
                    "Offer HelpR benefits to your employees for daily home help — cleaning, repairs, wellness & more.",
                },
                {
                  icon: Building2,
                  title: "Org & Event Integration",
                  description:
                    "Integrate HelpR services into your organization's workflow or corporate events seamlessly.",
                },
                {
                  icon: Megaphone,
                  title: "Marketplace Promotions",
                  description:
                    "Promote your local business inside the HelpR marketplace and reach thousands of active users.",
                },
                {
                  icon: Star,
                  title: "Verified Ratings & Reviews",
                  description:
                    "Build trust with transparent, verified ratings from real customers — boosting credibility and conversions.",
                },
              ].map((item) => (
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

            <div className="text-center mt-10">
              <Link to="/contact">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Get in Touch
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Trust & Quality */}
        <section className="py-16 md:py-24 bg-muted/40">
          <div className="container">
            <div className="text-center mb-12">
              <span className="inline-block mb-3 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Trust & Quality
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Built on Trust, Driven by Quality
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Every feature is designed to reward great work and build lasting confidence.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {[
                {
                  icon: CheckCircle2,
                  title: "Verified Reviews",
                  description:
                    "Only real, verified reviews from completed tasks — no fake ratings, just honest feedback from actual customers.",
                },
                {
                  icon: BadgeCheck,
                  title: "Helper Badges",
                  description:
                    "Earn skill, speed, and reliability badges based on your performance. Stand out and get more bookings.",
                },
                {
                  icon: GraduationCap,
                  title: "Training & Certification",
                  description:
                    "Free training modules and certifications to level up your skills and deliver better-quality service.",
                },
                {
                  icon: Gift,
                  title: "Loyalty Rewards",
                  description:
                    "Regular users earn loyalty points on every booking — redeem them for discounts, perks, and exclusive offers.",
                },
                {
                  icon: Heart,
                  title: "Social Impact Mode",
                  description:
                    "Join community help drives and volunteer tasks. Make a difference while building your reputation.",
                },
              ].map((item) => (
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

        {/* CTA */}
        <section className="py-16 md:py-24 bg-gradient-hero text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg mx-auto">
              Sign up in under 5 minutes. Complete KYC, list your skills, and
              get your first job today.
            </p>
            <Link to="/technician/login">
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 text-lg px-8 py-6"
              >
                Become a Helper
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BecomeHelper;
